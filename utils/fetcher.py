import sqlite3
import os
import requests
from collections import Counter

try:
    from .database import DB_PATH
    from .config import get_secret
except ImportError:
    # Permet aussi l'exécution directe : python utils/fetcher.py
    from database import DB_PATH
    from config import get_secret


# ---------------------------------------------------------------------------
# Mapping type openskin -> catégorie du projet (tri propre/logique)
# ---------------------------------------------------------------------------
TYPE_TO_CATEGORY = {
    "weapon": "Armes",
    "knife": "Couteaux",
    "gloves": "Gants",
    "case": "Caisses & Capsules",
    "key": "Caisses & Capsules",
    "sticker": "Stickers",
    "patch": "Stickers",
    "graffiti": "Stickers",
    "agent": "Agents",
    "music_kit": "Music Kits",
    "other": "Autres",
}


# Valeur float médiane par wear. L'API /v1/items ne donne pas le float exact
# par instance de skin (chaque exemplaire a son propre float), mais elle
# fournit l'exterior (wear réel). On stocke un float médian réaliste du range
# de wear correspondant — bien plus précis qu'un 0.05 constant pour tous.
WEAR_TO_FLOAT = {
    "Factory New": 0.03,
    "Minimal Wear": 0.10,
    "Field-Tested": 0.25,
    "Well-Worn": 0.40,
    "Battle-Scarred": 0.70,
}


def category_from_meta(item_type, item_name=""):
    """Retourne la catégorie propre à partir du type openskin + nom."""
    t = (item_type or "").lower()
    name = (item_name or "").lower()

    # Cas spécial : les "sticker capsules" sont des cases, pas des stickers.
    if t == "case" or ("capsule" in name and "sticker" in name):
        return "Caisses & Capsules"

    # Priorité au type retourné par l'API (source de vérité).
    if t in TYPE_TO_CATEGORY:
        return TYPE_TO_CATEGORY[t]

    # Fallback heuristique sur le nom (si type absent/None).
    if "sticker" in name or "patch" in name or "graffiti" in name:
        return "Stickers"
    if "case" in name or "capsule" in name or "key" in name:
        return "Caisses & Capsules"
    if "gloves" in name or "hand wraps" in name:
        return "Gants"
    if "★" in (item_name or "") or "knife" in name:
        return "Couteaux"
    if "music kit" in name:
        return "Music Kits"
    return "Autres"


def wear_and_float_from_meta(exterior, name=""):
    """Retourne (wear, float) à partir de l'exterior openskin + nom.

    L'API /v1/items fournit l'exterior (wear réel) pour les armes/couteaux/
    gants : c'est la source de vérité. Le float stocké est une valeur médiane
    réaliste du range de wear (l'API ne donne pas le float exact par instance).
    """
    ext = (exterior or "").strip()
    if ext in WEAR_TO_FLOAT:
        return ext, WEAR_TO_FLOAT[ext]

    # Fallback : déduire du nom
    n = (name or "").lower()
    if "factory new" in n:
        return "Factory New", WEAR_TO_FLOAT["Factory New"]
    if "minimal wear" in n:
        return "Minimal Wear", WEAR_TO_FLOAT["Minimal Wear"]
    if "field-tested" in n:
        return "Field-Tested", WEAR_TO_FLOAT["Field-Tested"]
    if "well-worn" in n:
        return "Well-Worn", WEAR_TO_FLOAT["Well-Worn"]
    if "battle-scarred" in n:
        return "Battle-Scarred", WEAR_TO_FLOAT["Battle-Scarred"]

    # Pas de wear (stickers, cases, agents...) → float neutre
    return "Standard", 0.05


def fetch_metadata_map():
    """Récupère les métadonnées de tous les items (type, exterior, rarity, weapon).

    Endpoint paginé : /v1/items?limit=100&page=N. Retourne un dict
    { item_name: meta } pour croiser avec /v1/prices/all.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip",
    }
    api_key = get_secret("OPENSKIN_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    meta = {}
    page = 1
    while page <= 500:
        url = f"https://api.openskin.dev/v1/items?limit=100&page={page}"
        try:
            r = requests.get(url, headers=headers, timeout=30)
        except requests.RequestException as e:
            print(f"   ⚠️  Erreur métadonnées page {page} : {e}")
            break
        if r.status_code != 200:
            print(f"   ⚠️  Métadonnées page {page} : HTTP {r.status_code}")
            break
        data = r.json().get("data", [])
        if not data:
            break
        for d in data:
            name = d.get("name")
            if name:
                meta[name] = d
        if len(data) < 100:
            break
        if page % 50 == 0:
            print(f"   ... métadonnées : {len(meta)} items récupérés")
        page += 1
    print(f"   ✅ Métadonnées : {len(meta)} items.")
    return meta


def fetch_and_store_market_data():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Nettoyage de l'ancienne table pour repartir sur des bases propres
    cursor.execute("DELETE FROM market_offers;")
    conn.commit()

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip",
    }
    api_key = get_secret("OPENSKIN_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    print("Étape 1/2 : Récupération des métadonnées (type, wear, rarity)...")
    meta_map = fetch_metadata_map()

    print("\nÉtape 2/2 : Récupération des prix depuis openskin.dev...")
    try:
        response = requests.get(
            "https://api.openskin.dev/v1/prices/all", headers=headers, timeout=90
        )
        if response.status_code != 200:
            print(f"Erreur API prix : Code {response.status_code}")
            conn.close()
            return

        payload = response.json()
        data_dict = payload.get("data", {})
        print(f"Données reçues : {len(data_dict)} objets. Traitement en cours...")

        bulk_data = []
        for item_name, details in data_dict.items():
            icon_url = details.get("icon_url", "")
            meta = meta_map.get(item_name, {})

            # --- Meilleur prix (lowest_ask, fallback sur les plateformes) ---
            lowest_ask_info = details.get("lowest_ask", {}) or {}
            best_price = lowest_ask_info.get("price", 0.0)
            best_platform = lowest_ask_info.get("marketplace", "openskin")
            if not best_price or best_price == 0.0:
                for source in ["csfloat", "skinport", "buff", "youpin", "steam"]:
                    src = details.get(source, {})
                    if isinstance(src, dict) and src.get("ask"):
                        best_price = src["ask"]
                        best_platform = source
                        break

            # --- Catégorie propre (basée sur le TYPE de l'API) ---
            category = category_from_meta(meta.get("type"), item_name)

            # --- Wear et float (basés sur l'EXTERIOR de l'API) ---
            wear, f_val = wear_and_float_from_meta(meta.get("exterior"), item_name)

            # --- Rareté (depuis les métadonnées, normalisée) ---
            rarity = (meta.get("rarity") or "consumer grade").lower()

            # --- Volume (liquidité steam si dispo) ---
            steam = details.get("steam", {}) or {}
            volume = steam.get("volume_24h")
            volume_str = str(volume) if volume is not None else "Actif"

            bulk_data.append((
                item_name,
                category,
                wear,
                round(f_val, 4),
                float(best_price or 0.0),
                str(best_platform).capitalize(),
                rarity,
                icon_url,
                f"{best_price} $",
                volume_str,
            ))

        # Insertion par lot
        cursor.executemany("""
            INSERT OR IGNORE INTO market_offers
            (item_name, category, wear, float_val, price, platform, rarity, icon_url, history_price, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, bulk_data)

        conn.commit()

        cats = Counter(row[1] for row in bulk_data)
        print("\n✅ Synchronisation terminée :", len(bulk_data), "skins.")
        print("   Répartition par catégorie :")
        for cat, cnt in cats.most_common():
            print(f"      {cat:<22} {cnt:>6}")

        wears = Counter(row[2] for row in bulk_data if row[2] != "Standard")
        print("   Répartition par wear (armes/couteaux/gants) :")
        for w, cnt in wears.most_common():
            print(f"      {w:<22} {cnt:>6}")

    except Exception as e:
        print(f"Erreur critique lors du fetch : {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    fetch_and_store_market_data()

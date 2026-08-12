# 📋 Snapshot conv_01 — Trading Project (interface CSFloat-style)

> ⚠️ Ce fichier est une **photocopie complète** du projet, générée automatiquement
> par `lance/generer_snapshot.py`. À utiliser avec le protocole « lance »
> (voir `lance/README.md`) pour recréer le projet à l'identique dans une
> nouvelle conversation.

**Généré le :** 12 August 2026 à 05:28 UTC  
**Dépôt :** `0user1guy-cpu/Trading_Project`  
**Branche source :** `main` (après PR #2 mergée)

---

## Sommaire

1. [Aperçu](#1-aperçu)
2. [Paramètres clés](#2-paramètres-clés-à-reproduire-à-lidentique)
3. [Commandes](#3-commandes)
4. [Limitations connues](#4-limitations-connues)
5. [Arborescence cible](#5-arborescence-cible)
6. [Contenu des fichiers](#6-contenu-des-fichiers)
7. [Base de données](#7-base-de-données)

---

## 1. Aperçu

Application **CS2 Trading** qui récupère les prix du marché depuis l'API
`openskin.dev`, les stocke en **SQLite**, et les affiche via une interface
**CSFloat-style** (FastAPI + React).

- **Backend** : FastAPI (`api/`) avec endpoints REST filtrés côté SQL.
- **Frontend** : React + Vite (`frontend/`), thème sombre, grille de cartes + modal.
- **Serveur unique** : `lancer.py` sert l'API **et** le frontend compilé sur le port 8000.

## 2. Paramètres clés (à reproduire à l'identique)

| Paramètre | Valeur |
|---|---|
| Port | 8000 |
| Backend | FastAPI (`api.main:app`) |
| Frontend | React + Vite (build dans `frontend/dist/`), servi par FastAPI |
| Base de données | SQLite `data.sauv.trading/market_items.db` (~37 368 items) |
| CORS | localhost:5173, :3000, :8501 (+ 127.0.0.1) |
| Tri par défaut | price_asc |
| exclude_zero_price | True par défaut |
| Page size | 60 items |
| Frontend base | './' (chemins relatifs pour prod) |
| API client | chemin relatif `/api` |
| Source de vérité du wear | le nom de l'item (pas le float_val de l'API OpenSkin) |

## 3. Commandes

| Action | Commande |
|---|---|
| Installer les dépendances Python | `pip install -r requirements.txt` |
| Installer les dépendances frontend | `cd frontend && npm install` |
| Build du frontend | `cd frontend && npm run build` |
| Lancer le serveur unique | `python lancer.py   # → http://localhost:8000` |
| Mode dev frontend (Vite, :5173) | `cd frontend && npm run dev` |
| Repeupler la DB depuis openskin.dev | `python utils/fetcher.py` |
| Initialiser la structure SQLite | `python utils/database.py` |

## 4. Limitations connues

1. Graphique de prix simulé (placeholder dans `_generate_price_history`). Pour de vraies courbes → table `price_history`.
2. Boutons Buy Now / Add to Cart décoratifs (pas de backend de transaction).
3. `float_val` de l'API OpenSkin constant (0.05) → wear déduit du nom de l'item.
4. Vue 3D exclue volontairement.

## 5. Arborescence cible

```
Trading_Project/
├── requirements.txt
├── .env.example
├── .gitignore
├── lancer.py
├── api/__init__.py
├── api/logic.py
├── api/main.py
├── utils/__init__.py
├── utils/config.py
├── utils/database.py
├── utils/fetcher.py
├── utils/rarity_helper.py
├── frontend/package.json
├── frontend/vite.config.js
├── frontend/index.html
├── frontend/public/favicon.svg
├── frontend/src/main.jsx
├── frontend/src/App.jsx
├── frontend/src/App.css
├── frontend/src/index.css
├── frontend/src/api.js
├── frontend/src/components/Navbar.jsx
├── frontend/src/components/Navbar.css
├── frontend/src/components/FilterSidebar.jsx
├── frontend/src/components/FilterSidebar.css
├── frontend/src/components/MarketGrid.jsx
├── frontend/src/components/MarketGrid.css
├── frontend/src/components/SkinCard.jsx
├── frontend/src/components/SkinCard.css
├── frontend/src/components/ItemModal.jsx
├── frontend/src/components/ItemModal.css
├── data.sauv.trading/
│   └── market_items.db        # (régénéré via fetcher.py ou copié)
└── .env                        # (créé depuis .env.example, JAMAIS commité)
```

## 6. Contenu des fichiers

> Chaque section ci-dessous contient le **contenu exact** d'un fichier.
> Pour recréer le projet : créer le fichier au chemin indiqué puis y coller
> le contenu du bloc de code. Les chemins sont **relatifs à la racine** du projet.

### `requirements.txt`

```
streamlit>=1.61
pandas>=2.0
openpyxl>=3.1
requests>=2.31
python-dotenv>=1.0
fastapi>=0.115
uvicorn[standard]>=0.32
```

### `.env.example`

```
# ============================================================
#  Trading_Project — Fichier de configuration des clés API
# ============================================================
#
# 1. Copiez ce fichier en ".env" (à la racine du projet, dans VS Code).
# 2. Renseignez vos clés réelles dans le ".env" (jamais commité — voir .gitignore).
# 3. Les clés sont lues automatiquement par utils/config.py.
#
#  ATTENTION : ne commitez JAMAIS le fichier .env réel.
#  Si une clé a déjà fuité, révoquez-la et régénérez-la sur le service concerné.
# ============================================================

# --- OpenSkin (catalogue de prix CS2, utilisé par utils/fetcher.py) ---
OPENSKIN_API_KEY=

# --- Steam Web API (prix d'inventaire / marché Steam) ---
STEAM_API_KEY=

# --- Google (si vous passez à une authentification officielle pour le Sheets) ---
GOOGLE_API_KEY=

# --- Autres services d'échange de skins (ex: Skinport, SkinBaron, Buff163) ---
SKINPORT_API_KEY=
SKINBARON_API_KEY=
BUFF163_API_KEY=

# --- Discord (webhooks de notifications / alertes de prix) ---
DISCORD_WEBHOOK_URL=

# --- Réseaux sociaux / partage ---
TWITTER_API_KEY=
TWITTER_API_SECRET=
```

### `.gitignore`

```
# --- Secrets & variables d'environnement ---
.env
.env.*
!.env.example

# --- Python ---
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
env/
ENV/
build/
dist/
*.egg-info/
.eggs/

# --- Streamlit ---
.streamlit/secrets.toml

# --- Bases de données volumineuses (à régénérer via utils/fetcher.py) ---
data.sauv.trading/market_items.db
*.db-journal
*.db-wal
*.db-shm

# --- OS / éditeurs ---
.DS_Store
Thumbs.db
.vscode/
.idea/

# --- Frontend React (node_modules + build) ---
frontend/node_modules/
frontend/dist/
frontend/.vite/

# --- Logs / caches ---
*.log
.pytest_cache/
.mypy_cache/
.ruff_cache/
```

### `lancer.py`

```python
#!/usr/bin/env python3
"""Lance l'application Trading Project en un seul serveur (port 8000).

Usage :
    python lancer.py

Ce script démarre FastAPI qui sert :
  - l'API (/api/items, /api/items/{id}, etc.)
  - le frontend React (interface CSFloat-style) sur la même URL

Une fois lancé, ouvre http://localhost:8000 dans ton navigateur.
"""
import os
import sys
import subprocess


def check_python_deps():
    """Vérifie que fastapi et uvicorn sont installés."""
    missing = []
    try:
        import fastapi  # noqa: F401
    except ImportError:
        missing.append("fastapi")
    try:
        import uvicorn  # noqa: F401
    except ImportError:
        missing.append("uvicorn[standard]")
    if missing:
        print("❌ Dépendances Python manquantes :", ", ".join(missing))
        print("   Lance d'abord :  pip install -r requirements.txt")
        sys.exit(1)


def check_node():
    """Vérifie que Node.js/npm est installé."""
    is_windows = sys.platform.startswith("win")
    npm = "npm.cmd" if is_windows else "npm"
    try:
        subprocess.run([npm, "--version"], capture_output=True, check=True, shell=is_windows)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ Node.js / npm introuvable.")
        print("   Installe Node.js (version LTS) : https://nodejs.org/")
        print("   Puis relance :  python lancer.py")
        return False


def build_frontend(project_dir):
    """Build le frontend React si pas déjà compilé."""
    frontend_dir = os.path.join(project_dir, "frontend")
    frontend_dist = os.path.join(frontend_dir, "dist")
    is_windows = sys.platform.startswith("win")
    npm = "npm.cmd" if is_windows else "npm"

    if os.path.isfile(os.path.join(frontend_dist, "index.html")):
        return True  # déjà compilé

    if not check_node():
        return False

    print("🔧 Compilation du frontend (premier lancement, ~10s)...")
    if not os.path.isdir(os.path.join(frontend_dir, "node_modules")):
        print("📦 Installation des dépendances npm...")
        result = subprocess.run([npm, "install"], cwd=frontend_dir, shell=is_windows)
        if result.returncode != 0:
            print("❌ Échec de 'npm install'. Vérifie que Node.js est bien installé.")
            return False

    result = subprocess.run([npm, "run", "build"], cwd=frontend_dir, shell=is_windows)
    if result.returncode != 0:
        print("❌ Échec du build du frontend.")
        return False

    print("✅ Frontend compilé.\n")
    return True


def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))

    print("Trading Project — démarrage...\n")

    # 1. Vérifie les dépendances Python
    check_python_deps()

    # 2. Build le frontend si nécessaire
    if not build_frontend(project_dir):
        print("\n⚠️  Le frontend n'a pas pu être compilé, mais l'API peut quand même démarrer.")
        print("   L'interface web ne s'affichera pas tant que Node.js n'est pas installé.")
        print("   Tu peux quand même tester l'API sur http://localhost:8000/docs\n")

    # 3. Lance le serveur FastAPI
    print("=" * 56)
    print("  ✅ Serveur démarré !")
    print("  👉 Ouvre http://localhost:8000 dans ton navigateur")
    print("  (Ctrl+C dans le terminal pour arrêter)")
    print("=" * 56 + "\n")

    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nServeur arrêté. À bientôt !")
        sys.exit(0)
```

### `api/__init__.py`

```python

```

### `api/logic.py`

```python
"""Logique métier partagée entre l'API FastAPI et les modules Streamlit.

Réutilise les fonctions existantes (clean_category, extract_wear_and_float)
et le système de rareté pour servir des données structurées à l'API.
"""
import os
import sys
from typing import Optional

# Permet d'importer utils/ depuis la racine du projet
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.rarity_helper import get_skin_rarity_and_style

DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.sauv.trading", "market_items.db")
)


def clean_category(item_name: str, raw_category: str = "") -> str:
    name = str(item_name).lower()

    if "sticker" in name or "patch" in name or "graffiti" in name:
        return "Stickers"

    if "case" in name or "capsule" in name or "package" in name:
        return "Caisses & Capsules"

    glove_keywords = ["gloves", "hand wraps", "driver gloves", "specialist gloves",
                      "sport gloves", "moto gloves", "hydra gloves", "bloodhound gloves",
                      "fang gloves"]
    if any(k in name for k in glove_keywords):
        return "Gants"

    knife_keywords = ["knife", "bayonet", "karambit", "talon", "stiletto", "ursus",
                      "navaja", "nomad", "paracord", "skeleton", "survival", "bowie",
                      "butterfly", "falchion", "huntsman", "shadow daggers"]
    if "★" in name or any(k in name for k in knife_keywords):
        return "Couteaux"

    return "Armes"


def extract_wear_and_float(name: str, raw_float: Optional[float] = None):
    name_lower = name.lower()

    # 1. Priorité au wear explicite dans le nom (la source OpenSkin fournit un float
    #    parfois constant/inexact, donc le nom reste la source de vérité pour le wear)
    name_wear = None
    if "factory new" in name_lower:
        name_wear = "Factory New"
    elif "minimal wear" in name_lower:
        name_wear = "Minimal Wear"
    elif "field-tested" in name_lower:
        name_wear = "Field-Tested"
    elif "well-worn" in name_lower:
        name_wear = "Well-Worn"
    elif "battle-scarred" in name_lower:
        name_wear = "Battle-Scarred"

    # 2. Détermine le float réel (utilise raw_float s'il est valide, sinon une
    #    valeur médiane correspondant au wear détecté dans le nom)
    f_val = 0.05
    try:
        if raw_float is not None and str(raw_float).strip() not in ["", "None", "N/A", "nan"]:
            parsed = float(str(raw_float).replace(",", "."))
            if 0.0 < parsed <= 1.0:
                f_val = parsed
    except (ValueError, TypeError):
        pass

    if name_wear:
        # Si le float semble inexact (constant à 0.05), on prend une valeur médiane
        # du range de wear pour l'affichage de la barre de float
        median_floats = {
            "Factory New": 0.03,
            "Minimal Wear": 0.10,
            "Field-Tested": 0.25,
            "Well-Worn": 0.40,
            "Battle-Scarred": 0.70,
        }
        if f_val == 0.05 and name_wear != "Factory New":
            f_val = median_floats[name_wear]
        return name_wear, f_val

    # 3. Fallback : déduire le wear du float
    if 0.0 <= f_val <= 1.0:
        if f_val < 0.07:
            wear = "Factory New"
        elif f_val < 0.15:
            wear = "Minimal Wear"
        elif f_val < 0.38:
            wear = "Field-Tested"
        elif f_val < 0.45:
            wear = "Well-Worn"
        else:
            wear = "Battle-Scarred"
        return wear, f_val

    return "Standard", 0.05


def get_rarity_style(item_name: str, category: str, rarity: str) -> dict:
    """Retourne les couleurs/styles associés à la rareté d'un skin."""
    return get_skin_rarity_and_style(item_name, category, rarity)
```

### `api/main.py`

```python
"""API FastAPI exposant les données du marché CS2 (SQLite).

Endpoints :
  GET /api/items        — liste paginée avec filtres (recherche, catégorie, float, prix, tri)
  GET /api/items/{id}   — détail d'un item (pour le modal)
  GET /api/categories   — liste des catégories disponibles
  GET /api/stats        — statistiques globales (compteurs par catégorie)
"""
import os
import sqlite3
from typing import Optional

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .logic import DB_PATH, clean_category, extract_wear_and_float, get_rarity_style

app = FastAPI(title="Trading Project API", version="1.0.0")

# CORS : autorise le frontend React (dev server :5173) et Streamlit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8501",
                   "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


VALID_SORTS = {
    "price_asc": "price ASC",
    "price_desc": "price DESC",
    "name_asc": "item_name ASC",
    "name_desc": "item_name DESC",
    "float_asc": "float_val ASC",
    "float_desc": "float_val DESC",
    "rarity": "rarity ASC",
}


@app.get("/api/items")
def get_items(
    q: Optional[str] = Query(None, description="Recherche textuelle"),
    category: Optional[str] = Query(None, description="Catégorie: Armes, Couteaux, Gants, Caisses & Capsules, Stickers"),
    float_min: float = Query(0.0, ge=0.0, le=1.0),
    float_max: float = Query(1.0, ge=0.0, le=1.0),
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    wear: Optional[str] = Query(None, description="FN, MW, FT, WW, BS"),
    sort: str = Query("price_asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(60, ge=1, le=120),
    exclude_zero_price: bool = Query(True, description="Exclut les items à prix 0"),
):
    """Liste paginée d'items avec filtres côté SQL."""
    conn = _get_db()
    cur = conn.cursor()

    where = []
    params = []

    if q and len(q.strip()) >= 2:
        where.append("LOWER(item_name) LIKE ?")
        params.append(f"%{q.strip().lower()}%")

    if category and category != "Tous":
        where.append("category = ?")
        params.append(category)

    where.append("float_val >= ?")
    params.append(float_min)
    where.append("float_val <= ?")
    params.append(float_max)

    if price_min is not None:
        where.append("price >= ?")
        params.append(price_min)
    if price_max is not None:
        where.append("price <= ?")
        params.append(price_max)
    if exclude_zero_price:
        where.append("price > 0")

    if wear:
        wear_map = {
            "FN": ("Factory New", 0.0, 0.07),
            "MW": ("Minimal Wear", 0.07, 0.15),
            "FT": ("Field-Tested", 0.15, 0.38),
            "WW": ("Well-Worn", 0.38, 0.45),
            "BS": ("Battle-Scarred", 0.45, 1.0),
        }
        if wear in wear_map:
            _, fmin, fmax = wear_map[wear]
            where.append("float_val >= ?")
            params.append(fmin)
            where.append("float_val < ?")
            params.append(fmax)

    where_clause = " AND ".join(where) if where else "1=1"
    order_clause = VALID_SORTS.get(sort, "price ASC")
    offset = (page - 1) * page_size

    # Comptage total
    count_sql = f"SELECT COUNT(*) FROM market_offers WHERE {where_clause}"
    total = cur.execute(count_sql, params).fetchone()[0]

    # Requête paginée
    data_sql = f"""
        SELECT id, item_name, category, wear, float_val, price, platform,
               rarity, icon_url, history_price, volume
        FROM market_offers
        WHERE {where_clause}
        ORDER BY {order_clause}
        LIMIT ? OFFSET ?
    """
    rows = cur.execute(data_sql, params + [page_size, offset]).fetchall()

    items = []
    for r in rows:
        wear_label, f_val = extract_wear_and_float(r["item_name"], r["float_val"])
        cat = r["category"] or clean_category(r["item_name"])
        rarity_info = get_rarity_style(r["item_name"], cat, r["rarity"])
        items.append({
            "id": r["id"],
            "name": r["item_name"],
            "category": cat,
            "wear": wear_label,
            "float": round(f_val, 4),
            "price": r["price"],
            "platform": r["platform"],
            "rarity": rarity_info.get("rarity_name", "Consumer"),
            "rarity_bg": rarity_info.get("bg", "rgba(156, 163, 175, 0.15)"),
            "rarity_border": rarity_info.get("border", "rgba(156, 163, 175, 0.4)"),
            "rarity_badge": rarity_info.get("badge", "bg-gray-500/30 text-gray-300 border border-gray-400/50"),
            "icon_url": r["icon_url"],
            "history_price": r["history_price"],
            "volume": r["volume"],
        })

    conn.close()

    return JSONResponse({
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 0,
    })


@app.get("/api/items/{item_id}")
def get_item_detail(item_id: int):
    """Détail d'un item pour le modal."""
    conn = _get_db()
    cur = conn.cursor()
    row = cur.execute(
        """SELECT id, item_name, category, wear, float_val, price, platform,
                  rarity, icon_url, history_price, volume, updated_at
           FROM market_offers WHERE id = ?""",
        (item_id,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Item non trouvé")

    wear_label, f_val = extract_wear_and_float(row["item_name"], row["float_val"])
    cat = row["category"] or clean_category(row["item_name"])
    rarity_info = get_rarity_style(row["item_name"], cat, row["rarity"])

    return {
        "id": row["id"],
        "name": row["item_name"],
        "category": cat,
        "wear": wear_label,
        "float": round(f_val, 4),
        "price": row["price"],
        "platform": row["platform"],
        "rarity": rarity_info.get("rarity_name", "Consumer"),
        "rarity_bg": rarity_info.get("bg", "rgba(156, 163, 175, 0.15)"),
        "rarity_border": rarity_info.get("border", "rgba(156, 163, 175, 0.4)"),
        "rarity_badge": rarity_info.get("badge", "bg-gray-500/30 text-gray-300 border border-gray-400/50"),
        "icon_url": row["icon_url"],
        "history_price": row["history_price"],
        "volume": row["volume"],
        "updated_at": row["updated_at"],
        "price_history": _generate_price_history(row["price"]),
    }


def _generate_price_history(current_price: float):
    """Génère un historique de prix simulé pour le graphique du modal.

    Placeholder : quand tu auras une table price_history réelle, remplace
    cette fonction par une requête SQL sur cette table.
    """
    import random
    points = []
    base = float(current_price) if current_price else 100.0
    for i in range(30, 0, -1):
        variation = random.uniform(-0.08, 0.06)
        price = max(0.01, base * (1 + variation * (i / 30)))
        points.append({"day": -i, "price": round(price, 2)})
    points.append({"day": 0, "price": round(base, 2)})
    return points


@app.get("/api/categories")
def get_categories():
    """Liste des catégories avec compteurs."""
    conn = _get_db()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT category, COUNT(*) as cnt FROM market_offers GROUP BY category ORDER BY cnt DESC"
    ).fetchall()
    conn.close()
    return [{"category": r["category"] or "Autres", "count": r["cnt"]} for r in rows]


@app.get("/api/stats")
def get_stats():
    """Statistiques globales."""
    conn = _get_db()
    cur = conn.cursor()
    total = cur.execute("SELECT COUNT(*) FROM market_offers").fetchone()[0]
    avg_price = cur.execute("SELECT AVG(price) FROM market_offers WHERE price > 0").fetchone()[0]
    min_price = cur.execute("SELECT MIN(price) FROM market_offers WHERE price > 0").fetchone()[0]
    max_price = cur.execute("SELECT MAX(price) FROM market_offers").fetchone()[0]
    conn.close()
    return {
        "total_items": total,
        "avg_price": round(avg_price or 0, 2),
        "min_price": round(min_price or 0, 2),
        "max_price": round(max_price or 0, 2),
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "db_path": DB_PATH}


# ---------------------------------------------------------------------------
# Serving du frontend React (build de production)
# ---------------------------------------------------------------------------
# Une fois le frontend compilé (npm run build → frontend/dist/), FastAPI sert
# les fichiers statiques directement. L'utilisateur n'a besoin que d'un seul
# serveur (port 8000) au lieu de deux.
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.isdir(FRONTEND_DIST):
    # Sert les assets (JS, CSS, images) depuis /assets
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str, request: Request):
        """Sert l'index.html React pour toutes les routes non-API (SPA fallback)."""
        # Ne capture pas les routes /api (déjà définies plus haut)
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Endpoint non trouvé")
        # Si c'est un fichier statique qui existe, on le sert directement
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Sinon fallback sur index.html (comportement SPA standard)
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend non compilé — lancez 'npm run build' dans frontend/")
```

### `utils/__init__.py`

```python

```

### `utils/config.py`

```python
"""Gestion centralisée des clés API et secrets du projet.

Charge automatiquement les variables définies dans le fichier .env (à la racine
du projet) au démarrage, puis expose des accesseurs typés. Le fichier .env ne
doit jamais être commité (il est ignoré via .gitignore).

Usage :
    from utils.config import get_secret, require_secret

    api_key = require_secret("OPENSKIN_API_KEY")      # lève si manquant
    webhook = get_secret("DISCORD_WEBHOOK_URL")       # retourne "" si absent
"""
import os
from typing import Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv optionnel : les variables d'environnement système suffisent
    pass


def get_secret(key: str, default: str = "") -> str:
    """Retourne la valeur d'une clé secrète, ou `default` si absente."""
    return os.environ.get(key, default)


def require_secret(key: str) -> str:
    """Retourne une clé secrète obligatoire. Lève une erreur claire si manquante."""
    value = os.environ.get(key, "").strip()
    if not value:
        raise RuntimeError(
            f"La variable d'environnement '{key}' est manquante. "
            f"Renseignez-la dans le fichier .env (voir .env.example)."
        )
    return value
```

### `utils/database.py`

```python
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.sauv.trading", "market_items.db")

def init_db():
    # S'assure que le dossier de sauvegarde existe
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Création de la table principale optimisée pour stocker les offres multi-plateformes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS market_offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL UNIQUE,
            category TEXT,
            wear TEXT,
            float_val REAL,
            price REAL NOT NULL,
            platform TEXT NOT NULL,
            rarity TEXT,
            icon_url TEXT,
            history_price TEXT,
            volume TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Création d'index pour accélérer les recherches textuelles et les filtres
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_name ON market_offers (item_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON market_offers (category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_price ON market_offers (price);")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Base de données SQLite initialisée avec succès.")
```

### `utils/fetcher.py`

```python
import sqlite3
import os
import requests

try:
    from .database import DB_PATH
    from .config import get_secret
except ImportError:
    # Permet aussi l'exécution directe : python utils/fetcher.py
    from database import DB_PATH
    from config import get_secret

def fetch_and_store_market_data():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Nettoyage de l'ancienne table pour repartir sur des bases propres
    cursor.execute("DELETE FROM market_offers;")
    conn.commit()
    
    print("Récupération du catalogue global depuis openskin.dev...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip"
    }
    # Clé API optionnelle : utilisée si OPENSKIN_API_KEY est définie dans .env
    api_key = get_secret("OPENSKIN_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    
    try:
        # Utilisation de /v1/prices/all pour récupérer tous les items groupés et packés en une seule requête optimisée
        response = requests.get("https://api.openskin.dev/v1/prices/all", headers=headers, timeout=60)
        
        if response.status_code == 200:
            payload = response.json()
            data_dict = payload.get("data", {})
            
            print(f"Données reçues : {len(data_dict)} objets. Traitement en cours...")
            
            bulk_data = []
            for item_name, details in data_dict.items():
                icon_url = details.get("icon_url", "")
                
                # Recherche du meilleur prix (lowest_ask) parmi les plateformes disponibles
                lowest_ask_info = details.get("lowest_ask", {})
                best_price = lowest_ask_info.get("price", 0.0)
                best_platform = lowest_ask_info.get("marketplace", "openskin")
                
                # Extraction d'une source de repli si lowest_ask est vide
                if not best_price or best_price == 0.0:
                    for source in ["csfloat", "skinport", "buff", "steam"]:
                        if source in details and "ask" in details[source]:
                            best_price = details[source]["ask"]
                            best_platform = source
                            break
                
                # Détermination simple de la catégorie selon le nom ou les données
                category = "Armes"
                if "★" in item_name:
                    category = "Couteaux"
                elif "Gloves" in item_name or "Gants" in item_name:
                    category = "Gants"
                elif "Case" in item_name or "Capsule" in item_name:
                    category = "Caisses & Capsules"
                
                bulk_data.append((
                    item_name,
                    category,
                    "Standard / Mixed",
                    0.05,
                    float(best_price or 0.0),
                    str(best_platform).capitalize(),
                    "milspec",
                    icon_url,
                    f"{best_price} $",
                    "Actif"
                ))
            
            # Insertion par lot (batch insertion) pour optimiser les performances de SQLite
            cursor.executemany("""
                INSERT OR IGNORE INTO market_offers 
                (item_name, category, wear, float_val, price, platform, rarity, icon_url, history_price, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, bulk_data)
            
            conn.commit()
            print(f"Succès ! {len(bulk_data)} skins synchronisés et enregistrés.")
        else:
            print(f"Erreur API : Code {response.status_code}")
            
    except Exception as e:
        print(f"Erreur critique lors du fetch : {e}")
        
    conn.close()

if __name__ == "__main__":
    fetch_and_store_market_data()
```

### `utils/rarity_helper.py`

```python
def get_skin_rarity_and_style(item_name, category="", raw_rarity=""):
    name = str(item_name).lower()
    cat = str(category).lower()
    rar = str(raw_rarity).lower()

    # 1. Industrial Grade (Bleu clair / Ciel) - Prioritaire sur les noms spécifiques
    if "industrial" in rar or "lightblue" in rar or "light blue" in rar or any(k in name for k in ["water sigil"]):
        return {
            "rarity_name": "Industrial",
            "bg": "rgba(14, 165, 233, 0.18)",
            "border": "rgba(14, 165, 233, 0.5)",
            "badge": "bg-sky-500/30 text-sky-300 border border-sky-500/50"
        }

    # 2. Consumer Grade (Gris / Blanc) - Prioritaire sur les noms spécifiques
    if "consumer" in rar or "white" in rar or any(k in name for k in ["sand dune", "alcove", "storm", "silver"]):
        return {
            "rarity_name": "Consumer",
            "bg": "rgba(156, 163, 175, 0.15)",
            "border": "rgba(156, 163, 175, 0.4)",
            "badge": "bg-gray-500/30 text-gray-300 border border-gray-400/50"
        }

    # 3. Couteaux et Gants -> Doré / Légendaire
    if cat in ["couteaux", "gants", "knives", "gloves"] or any(k in rar for k in ["extraordinary", "gold", "rare special", "knife"]) or "★" in name:
        return {
            "rarity_name": "Extraordinary",
            "bg": "rgba(255, 215, 0, 0.12)",
            "border": "rgba(255, 215, 0, 0.4)",
            "badge": "bg-yellow-500/25 text-yellow-300 border border-yellow-500/40"
        }

    # 4. Covert (Rouge vif)
    if "covert" in rar or "red" in rar or any(k in name for k in ["bloodsport", "asiimov", "empress", "neo-noir", "fade", "howl", "fire serpent", "printstream"]):
        return {
            "rarity_name": "Covert",
            "bg": "rgba(239, 68, 68, 0.15)",
            "border": "rgba(239, 68, 68, 0.45)",
            "badge": "bg-red-600/30 text-red-300 border border-red-500/50"
        }

    # 5. Classified (Rose / Magenta distinct)
    if "classified" in rar or "pink" in rar or any(k in name for k in ["redline", "desolate space", "hyper beast"]):
        return {
            "rarity_name": "Classified",
            "bg": "rgba(236, 72, 153, 0.15)",
            "border": "rgba(236, 72, 153, 0.45)",
            "badge": "bg-pink-600/30 text-pink-300 border border-pink-500/50"
        }

    # 6. Restricted (Violet)
    if "restricted" in rar or "purple" in rar or any(k in name for k in ["slate", "atheris", "water elemental"]):
        return {
            "rarity_name": "Restricted",
            "bg": "rgba(168, 85, 247, 0.15)",
            "border": "rgba(168, 85, 247, 0.45)",
            "badge": "bg-purple-600/30 text-purple-300 border border-purple-500/50"
        }

    # 7. Mil-Spec Grade (Bleu foncé)
    if "milspec" in rar or "mil-spec" in rar or "blue" in rar or any(k in name for k in ["safari mesh", "magnesium", "iron work"]):
        return {
            "rarity_name": "Mil-Spec",
            "bg": "rgba(59, 130, 246, 0.15)",
            "border": "rgba(59, 130, 246, 0.45)",
            "badge": "bg-blue-600/30 text-blue-300 border border-blue-500/50"
        }

    # Valeur par défaut de sécurité
    return {
        "rarity_name": "Consumer",
        "bg": "rgba(156, 163, 175, 0.15)",
        "border": "rgba(156, 163, 175, 0.4)",
        "badge": "bg-gray-500/30 text-gray-300 border border-gray-400/50"
    }
```

### `frontend/package.json`

```json
{
  "name": "trading-project-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}
```

### `frontend/vite.config.js`

```jsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Build avec chemins relatifs pour que FastAPI puisse servir les fichiers
  base: './',
  server: {
    port: 5173,
    host: true,
    // En mode dev, redirige /api vers le backend FastAPI
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### `frontend/index.html`

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Trading Project — CS2 Market</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `frontend/public/favicon.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0d1117"/><path d="M16 6 L24 12 V20 L16 26 L8 20 V12 Z" fill="none" stroke="#58a6ff" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#58a6ff"/></svg>
```

### `frontend/src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `frontend/src/App.jsx`

```jsx
import { useState } from 'react'
import Navbar from './components/Navbar'
import FilterSidebar from './components/FilterSidebar'
import MarketGrid from './components/MarketGrid'
import './App.css'

const DEFAULT_FILTERS = {
  q: '',
  category: null,
  float_min: 0.0,
  float_max: 1.0,
  price_min: null,
  price_max: null,
  wear: null,
  sort: 'price_asc',
  page: 1,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('market')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="app-body">
        {currentPage === 'market' ? (
          <>
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
            <MarketGrid filters={filters} setFilters={setFilters} />
          </>
        ) : (
          <div className="app-placeholder">
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <p>This page is part of the Streamlit app. Switch to Market to see the new interface.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### `frontend/src/App.css`

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.app-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
}

.app-placeholder h1 {
  font-size: 28px;
  color: var(--text-primary);
}

.app-placeholder p {
  font-size: 14px;
  max-width: 400px;
  text-align: center;
}
```

### `frontend/src/index.css`

```css
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #1c2128;
  --bg-hover: #21262d;
  --border: #30363d;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --accent: #58a6ff;
  --accent-hover: #79b8ff;
  --success: #3fb950;
  --danger: #f85149;
  --warning: #d29922;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
  color: inherit;
}

input, select {
  font-family: inherit;
}
```

### `frontend/src/api.js`

```jsx
const API_BASE = '/api'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchItems(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value)
    }
  }
  return fetchJSON(`${API_BASE}/items?${query.toString()}`)
}

export async function fetchItemDetail(id) {
  return fetchJSON(`${API_BASE}/items/${id}`)
}

export async function fetchCategories() {
  return fetchJSON(`${API_BASE}/categories`)
}

export async function fetchStats() {
  return fetchJSON(`${API_BASE}/stats`)
}

export function formatPrice(price) {
  if (price === null || price === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatFloat(f) {
  if (f === null || f === undefined) return '0.0000'
  return f.toFixed(4)
}

export function floatToPercent(f) {
  return `${(f * 100).toFixed(2)}%`
}

// Couleurs de la barre de float (comme CSFloat)
export const FLOAT_COLORS = [
  '#4b69ff', // 0.00-0.10 (FN)
  '#4b69ff',
  '#8847ff', // 0.10-0.20
  '#8847ff',
  '#d32ce6', // 0.20-0.30
  '#d32ce6',
  '#ffd700', // 0.30-0.40
  '#ffd700',
  '#ff4500', // 0.40-0.50
  '#ff4500',
]
```

### `frontend/src/components/Navbar.jsx`

```jsx
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Home', page: 'home' },
  { label: 'Analytics', page: 'analytics' },
  { label: 'Market', page: 'market' },
  { label: 'Data Market', page: 'data-market' },
]

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L26 10 V22 L16 28 L6 22 V10 Z" fill="none" stroke="#58a6ff" strokeWidth="2" />
            <circle cx="16" cy="16" r="3.5" fill="#58a6ff" />
          </svg>
          <span className="navbar-logo-text">Trading<span className="navbar-logo-accent">Project</span></span>
        </div>
        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={`navbar-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-selector">
          <span className="navbar-selector-value">USD</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <div className="navbar-selector">
          <span className="navbar-selector-value">FR</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <button className="navbar-login-btn">Sign In</button>
      </div>
    </nav>
  )
}
```

### `frontend/src/components/Navbar.css`

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 28px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.navbar-logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.navbar-logo-accent {
  color: var(--accent);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar-link {
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.navbar-link:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.navbar-link.active {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.navbar-selector:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.navbar-selector-value {
  min-width: 26px;
}

.navbar-login-btn {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.navbar-login-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--text-muted);
}
```

### `frontend/src/components/FilterSidebar.jsx`

```jsx
import { useEffect, useState } from 'react'
import { fetchCategories } from '../api'
import './FilterSidebar.css'

const WEAR_OPTIONS = [
  { code: 'FN', label: 'Factory New', range: '0.00 - 0.07' },
  { code: 'MW', label: 'Minimal Wear', range: '0.07 - 0.15' },
  { code: 'FT', label: 'Field-Tested', range: '0.15 - 0.38' },
  { code: 'WW', label: 'Well-Worn', range: '0.38 - 0.45' },
  { code: 'BS', label: 'Battle-Scarred', range: '0.45 - 1.00' },
]

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'float_asc', label: 'Float: Low to High' },
  { value: 'float_desc', label: 'Float: High to Low' },
]

const PRICE_RANGES = [
  { label: '< $10', min: 0, max: 10 },
  { label: '$10 - $50', min: 10, max: 50 },
  { label: '$50 - $250', min: 50, max: 250 },
  { label: '> $250', min: 250, max: null },
]

export default function FilterSidebar({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories([{ category: 'Tous', count: null }, ...cats]))
      .catch((e) => console.error('Failed to load categories:', e))
  }, [])

  const update = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 })
  }

  const toggleWear = (code) => {
    onFilterChange({ ...filters, wear: filters.wear === code ? null : code, page: 1 })
  }

  return (
    <aside className="filter-sidebar">
      {/* Recherche */}
      <div className="filter-section">
        <div className="filter-section-title">Search</div>
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search for items..."
          value={filters.q || ''}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      {/* Catégories */}
      <div className="filter-section">
        <div className="filter-section-title">Category</div>
        <div className="filter-category-list">
          <button
            className={`filter-category-item ${(!filters.category || filters.category === 'Tous') ? 'active' : ''}`}
            onClick={() => update('category', null)}
          >
            <span>Tous</span>
          </button>
          {categories.filter(c => c.category !== 'Tous').map((cat) => (
            <button
              key={cat.category}
              className={`filter-category-item ${filters.category === cat.category ? 'active' : ''}`}
              onClick={() => update('category', cat.category)}
            >
              <span>{cat.category}</span>
              {cat.count && <span className="filter-category-count">{cat.count.toLocaleString()}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div className="filter-section">
        <div className="filter-section-title">Price</div>
        <div className="filter-price-inputs">
          <input
            type="number"
            className="filter-price-input"
            placeholder="0"
            value={filters.price_min ?? ''}
            onChange={(e) => update('price_min', e.target.value || null)}
          />
          <span className="filter-price-separator">—</span>
          <input
            type="number"
            className="filter-price-input"
            placeholder="∞"
            value={filters.price_max ?? ''}
            onChange={(e) => update('price_max', e.target.value || null)}
          />
        </div>
        <div className="filter-price-presets">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              className="filter-price-preset"
              onClick={() => onFilterChange({
                ...filters,
                price_min: range.min,
                price_max: range.max,
                page: 1,
              })}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Float / Wear */}
      <div className="filter-section">
        <div className="filter-section-title">Wear / Float</div>
        <div className="filter-wear-list">
          {WEAR_OPTIONS.map((wear) => (
            <button
              key={wear.code}
              className={`filter-wear-item ${filters.wear === wear.code ? 'active' : ''}`}
              onClick={() => toggleWear(wear.code)}
            >
              <span className="filter-wear-code">{wear.code}</span>
              <span className="filter-wear-label">{wear.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tri */}
      <div className="filter-section">
        <div className="filter-section-title">Sort By</div>
        <select
          className="filter-sort-select"
          value={filters.sort || 'price_asc'}
          onChange={(e) => update('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </aside>
  )
}
```

### `frontend/src/components/FilterSidebar.css`

```css
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 56px);
  position: sticky;
  top: 56px;
}

.filter-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.filter-search-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.15s ease;
}

.filter-search-input:focus {
  border-color: var(--accent);
}

.filter-search-input::placeholder {
  color: var(--text-muted);
}

.filter-category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  text-align: left;
  width: 100%;
  transition: all 0.15s ease;
}

.filter-category-item:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.filter-category-item.active {
  background-color: rgba(88, 166, 255, 0.15);
  color: var(--accent);
}

.filter-category-count {
  font-size: 11px;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
}

.filter-category-item.active .filter-category-count {
  background-color: rgba(88, 166, 255, 0.2);
  color: var(--accent);
}

.filter-price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.filter-price-input {
  flex: 1;
  width: 100%;
  padding: 7px 10px;
  font-size: 13px;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 0.15s ease;
}

.filter-price-input:focus {
  border-color: var(--accent);
}

.filter-price-input::placeholder {
  color: var(--text-muted);
}

.filter-price-separator {
  color: var(--text-muted);
  font-size: 13px;
}

.filter-price-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-price-preset {
  padding: 5px 10px;
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: all 0.15s ease;
}

.filter-price-preset:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.filter-wear-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-wear-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  text-align: left;
  width: 100%;
  transition: all 0.15s ease;
}

.filter-wear-item:hover {
  background-color: var(--bg-hover);
}

.filter-wear-item.active {
  background-color: rgba(88, 166, 255, 0.15);
}

.filter-wear-code {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 28px;
  text-align: center;
}

.filter-wear-item.active .filter-wear-code {
  background-color: rgba(88, 166, 255, 0.2);
  color: var(--accent);
}

.filter-wear-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.filter-wear-item.active .filter-wear-label {
  color: var(--text-primary);
}

.filter-sort-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.filter-sort-select:focus {
  border-color: var(--accent);
}
```

### `frontend/src/components/MarketGrid.jsx`

```jsx
import { useEffect, useState, useCallback } from 'react'
import { fetchItems } from '../api'
import SkinCard from './SkinCard'
import ItemModal from './ItemModal'
import './MarketGrid.css'

export default function MarketGrid({ filters, setFilters }) {
  const [data, setData] = useState({ items: [], total: 0, total_pages: 0, page: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  // Debounce sur la recherche texte
  const [debouncedQ, setDebouncedQ] = useState(filters.q)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350)
    return () => clearTimeout(t)
  }, [filters.q])

  const loadItems = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = {
      ...filters,
      q: debouncedQ,
      page_size: 60,
    }
    fetchItems(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters, debouncedQ])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="market-grid-container">
      <div className="market-grid-header">
        <div className="market-results-count">
          {loading ? 'Loading...' : `${data.total.toLocaleString()} items`}
        </div>
      </div>

      {error && <div className="market-error">Failed to load: {error}</div>}

      {loading && data.items.length === 0 ? (
        <div className="market-grid">
          {Array.from({ length: 18 }).map((_, i) => (
            <div className="skin-card-skeleton" key={i} />
          ))}
        </div>
      ) : (
        <div className="market-grid">
          {data.items.map((item) => (
            <SkinCard key={item.id} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      )}

      {!loading && data.items.length === 0 && !error && (
        <div className="market-empty">
          <span className="market-empty-icon">🔍</span>
          <p>No items match your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="market-pagination">
          <button
            className="market-page-btn"
            disabled={data.page <= 1}
            onClick={() => handlePageChange(data.page - 1)}
          >
            ← Prev
          </button>
          <span className="market-page-info">
            Page {data.page} / {data.total_pages}
          </span>
          <button
            className="market-page-btn"
            disabled={data.page >= data.total_pages}
            onClick={() => handlePageChange(data.page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal de détail */}
      {selectedItem && (
        <ItemModal itemId={selectedItem.id} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
```

### `frontend/src/components/MarketGrid.css`

```css
.market-grid-container {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  max-height: calc(100vh - 56px);
}

.market-grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.market-results-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.market-error {
  padding: 40px;
  text-align: center;
  color: var(--danger);
  font-size: 14px;
  background-color: rgba(248, 81, 73, 0.1);
  border-radius: var(--radius);
}

.market-empty {
  padding: 60px;
  text-align: center;
  color: var(--text-muted);
}

.market-empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.market-empty p {
  font-size: 15px;
}

.skin-card-skeleton {
  height: 320px;
  border-radius: var(--radius);
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.market-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-bottom: 20px;
}

.market-page-btn {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.market-page-btn:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--text-muted);
}

.market-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.market-page-info {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}
```

### `frontend/src/components/SkinCard.jsx`

```jsx
import { formatPrice, formatFloat } from '../api'
import './SkinCard.css'

export default function SkinCard({ item, onClick }) {
  return (
    <div
      className="skin-card"
      style={{
        '--rarity-bg': item.rarity_bg,
        '--rarity-border': item.rarity_border,
      }}
      onClick={() => onClick(item)}
    >
      <div className="skin-card-image-wrap">
        <div className="skin-card-stickers">
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
        </div>
        <img
          src={item.icon_url}
          alt={item.name}
          className="skin-card-image"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="skin-card-hover-actions">
          <span className="skin-card-hover-icon" title="Inspect">📷</span>
        </div>
      </div>

      <div className="skin-card-info">
        <div className="skin-card-name" title={item.name}>
          {item.name}
        </div>
        <div className="skin-card-wear-row">
          <span className={`skin-card-wear-badge ${item.wear.toLowerCase().replace(/\s/g, '-')}`}>
            {item.wear}
          </span>
          <span className="skin-card-float">{formatFloat(item.float)}</span>
        </div>
        <div className="skin-card-float-bar">
          <div className="skin-card-float-bar-track">
            <div className="skin-card-float-bar-fill" style={{ width: `${item.float * 100}%` }} />
            <div className="skin-card-float-bar-marker" style={{ left: `${item.float * 100}%` }} />
          </div>
        </div>
        <div className="skin-card-footer">
          <span className="skin-card-price">{formatPrice(item.price)}</span>
          <span className={`skin-card-rarity-badge ${item.rarity_badge}`}>
            {item.rarity}
          </span>
        </div>
        <button className="skin-card-buy-btn">Buy Now</button>
      </div>
    </div>
  )
}
```

### `frontend/src/components/SkinCard.css`

```css
.skin-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  position: relative;
}

.skin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
}

.skin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: var(--rarity-border);
}

.skin-card:hover::before {
  background: var(--rarity-border);
}

.skin-card-image-wrap {
  position: relative;
  background-color: var(--bg-tertiary);
  background-image: radial-gradient(circle at center, var(--rarity-bg) 0%, transparent 70%);
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.skin-card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.skin-card-stickers {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: flex;
  gap: 3px;
}

.skin-card-sticker-slot {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
}

.skin-card-hover-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.skin-card:hover .skin-card-hover-actions {
  opacity: 1;
}

.skin-card-hover-icon {
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

.skin-card-info {
  padding: 10px 12px 12px;
}

.skin-card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.skin-card-wear-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.skin-card-wear-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.skin-card-wear-badge.factory-new {
  color: #4b69ff;
  background-color: rgba(75, 105, 255, 0.15);
}
.skin-card-wear-badge.minimal-wear {
  color: #5e98d9;
  background-color: rgba(94, 152, 217, 0.15);
}
.skin-card-wear-badge.field-tested {
  color: #8847ff;
  background-color: rgba(136, 71, 255, 0.15);
}
.skin-card-wear-badge.well-worn {
  color: #d32ce6;
  background-color: rgba(211, 44, 230, 0.15);
}
.skin-card-wear-badge.battle-scarred {
  color: #ff4500;
  background-color: rgba(255, 69, 0, 0.15);
}
.skin-card-wear-badge.standard {
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
}

.skin-card-float {
  font-size: 11px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: var(--text-secondary);
}

.skin-card-float-bar {
  margin-bottom: 10px;
}

.skin-card-float-bar-track {
  position: relative;
  height: 5px;
  background: linear-gradient(to right,
    #4b69ff 0%,
    #4b69ff 10%,
    #8847ff 15%,
    #8847ff 38%,
    #d32ce6 38%,
    #d32ce6 45%,
    #ffd700 45%,
    #ffd700 55%,
    #ff4500 55%,
    #ff4500 100%
  );
  border-radius: 3px;
}

.skin-card-float-bar-marker {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 9px;
  background-color: #fff;
  border-radius: 1px;
  transform: translateX(-50%);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.skin-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.skin-card-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--success);
}

.skin-card-rarity-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.skin-card-buy-btn {
  width: 100%;
  padding: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-color: var(--accent);
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.skin-card-buy-btn:hover {
  background-color: var(--accent-hover);
}
```

### `frontend/src/components/ItemModal.jsx`

```jsx
import { useEffect, useState } from 'react'
import { fetchItemDetail, formatPrice, formatFloat } from '../api'
import './ItemModal.css'

export default function ItemModal({ itemId, onClose }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!itemId) return
    setLoading(true)
    setError(null)
    fetchItemDetail(itemId)
      .then((data) => setItem(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [itemId])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={item ? {
          '--rarity-bg': item.rarity_bg,
          '--rarity-border': item.rarity_border,
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <div className="modal-loading">Loading...</div>}
        {error && <div className="modal-error">Error: {error}</div>}
        {item && (
          <>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="modal-grid">
              {/* Colonne gauche : image + infos */}
              <div className="modal-left">
                <div className="modal-image-wrap">
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    className="modal-image"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="modal-quick-stats">
                  <div className="modal-stat">
                    <span className="modal-stat-label">Float</span>
                    <span className="modal-stat-value">{formatFloat(item.float)}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Wear</span>
                    <span className="modal-stat-value">{item.wear}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Rarity</span>
                    <span className="modal-stat-value">{item.rarity}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Platform</span>
                    <span className="modal-stat-value">{item.platform}</span>
                  </div>
                </div>
                <div className="modal-float-bar">
                  <div className="modal-float-bar-track">
                    <div className="modal-float-bar-marker" style={{ left: `${item.float * 100}%` }} />
                  </div>
                  <div className="modal-float-bar-labels">
                    <span>0.00</span>
                    <span>1.00</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite : infos + graphique */}
              <div className="modal-right">
                <div className="modal-header">
                  <h2 className="modal-title">{item.name}</h2>
                  <div className="modal-badges">
                    <span className={`modal-wear-badge ${item.wear.toLowerCase().replace(/\s/g, '-')}`}>
                      {item.wear}
                    </span>
                    <span className={`modal-rarity-badge ${item.rarity_badge}`}>
                      {item.rarity}
                    </span>
                  </div>
                </div>

                <div className="modal-price-section">
                  <span className="modal-price-label">Price</span>
                  <span className="modal-price">{formatPrice(item.price)}</span>
                </div>

                {/* Graphique d'historique de prix */}
                <div className="modal-chart-section">
                  <div className="modal-chart-title">Price History (30 days)</div>
                  <PriceChart data={item.price_history} currentPrice={item.price} />
                </div>

                {/* Boutons d'action */}
                <div className="modal-actions">
                  <button className="modal-buy-btn">Buy Now · {formatPrice(item.price)}</button>
                  <button className="modal-secondary-btn">Add to Cart</button>
                </div>

                {/* Métadonnées */}
                <div className="modal-metadata">
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Category</span>
                    <span className="modal-meta-value">{item.category}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Volume</span>
                    <span className="modal-meta-value">{item.volume}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Last Updated</span>
                    <span className="modal-meta-value">{item.updated_at || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PriceChart({ data, currentPrice }) {
  if (!data || data.length === 0) return <div className="modal-chart-empty">No data</div>

  const prices = data.map((d) => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const width = 380
  const height = 140
  const padding = { top: 10, right: 10, bottom: 24, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((d.price - minP) / range) * chartH
    return { x, y, price: d.price }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`

  return (
    <svg className="modal-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(88, 166, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(88, 166, 255, 0)" />
        </linearGradient>
      </defs>
      {/* Lignes de grille */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={padding.left + chartW}
          y1={padding.top + chartH * t}
          y2={padding.top + chartH * t}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      ))}
      {/* Labels Y */}
      <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
        {formatPrice(maxP)}
      </text>
      <text x={padding.left - 6} y={padding.top + chartH + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
        {formatPrice(minP)}
      </text>
      {/* Aire */}
      <path d={areaD} fill="url(#chart-grad)" />
      {/* Ligne */}
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {/* Point final */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill="var(--accent)"
        stroke="var(--bg-primary)"
        strokeWidth="2"
      />
    </svg>
  )
}
```

### `frontend/src/components/ItemModal.css`

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  backdrop-filter: blur(4px);
  animation: modal-fade-in 0.15s ease;
}

@keyframes modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--rarity-border, var(--border));
  border-radius: var(--radius);
  width: 100%;
  max-width: 880px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: modal-slide-up 0.2s ease;
}

@keyframes modal-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
  border-radius: 50%;
  z-index: 10;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.modal-loading,
.modal-error {
  padding: 60px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
}

.modal-error {
  color: var(--danger);
}

.modal-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
}

.modal-left {
  padding: 24px;
  background-image: radial-gradient(circle at center top, var(--rarity-bg, transparent) 0%, transparent 60%);
  border-right: 1px solid var(--border);
}

.modal-image-wrap {
  background-color: var(--bg-tertiary);
  border-radius: var(--radius);
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin-bottom: 16px;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
}

.modal-quick-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.modal-stat {
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
}

.modal-stat-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.modal-stat-value {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-float-bar {
  margin-bottom: 8px;
}

.modal-float-bar-track {
  position: relative;
  height: 8px;
  background: linear-gradient(to right,
    #4b69ff 0%, #4b69ff 10%,
    #8847ff 15%, #8847ff 38%,
    #d32ce6 38%, #d32ce6 45%,
    #ffd700 45%, #ffd700 55%,
    #ff4500 55%, #ff4500 100%
  );
  border-radius: 4px;
}

.modal-float-bar-marker {
  position: absolute;
  top: -3px;
  width: 3px;
  height: 14px;
  background-color: #fff;
  border-radius: 2px;
  transform: translateX(-50%);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
}

.modal-float-bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-muted);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

.modal-right {
  padding: 24px;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  line-height: 1.3;
}

.modal-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-wear-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.modal-wear-badge.factory-new { color: #4b69ff; background-color: rgba(75, 105, 255, 0.15); }
.modal-wear-badge.minimal-wear { color: #5e98d9; background-color: rgba(94, 152, 217, 0.15); }
.modal-wear-badge.field-tested { color: #8847ff; background-color: rgba(136, 71, 255, 0.15); }
.modal-wear-badge.well-worn { color: #d32ce6; background-color: rgba(211, 44, 230, 0.15); }
.modal-wear-badge.battle-scarred { color: #ff4500; background-color: rgba(255, 69, 0, 0.15); }
.modal-wear-badge.standard { color: var(--text-muted); background-color: var(--bg-tertiary); }

.modal-rarity-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.modal-price-section {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.modal-price-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.modal-price {
  font-size: 26px;
  font-weight: 700;
  color: var(--success);
}

.modal-chart-section {
  margin-bottom: 20px;
}

.modal-chart-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.modal-chart {
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 8px;
}

.modal-chart-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.modal-buy-btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background-color: var(--accent);
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.modal-buy-btn:hover {
  background-color: var(--accent-hover);
}

.modal-secondary-btn {
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.modal-secondary-btn:hover {
  background-color: var(--bg-hover);
}

.modal-metadata {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.modal-meta-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.modal-meta-label {
  color: var(--text-muted);
}

.modal-meta-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 720px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
  .modal-left {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
```

## 7. Base de données

La table `market_offers` est définie dans `utils/database.py` :

```sql
CREATE TABLE IF NOT EXISTS market_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT,
    wear TEXT,
    float_val REAL,
    price REAL NOT NULL,
    platform TEXT NOT NULL,
    rarity TEXT,
    icon_url TEXT,
    history_price TEXT,
    volume TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Pour repeupler la base

1. Créer `.env` depuis `.env.example` et renseigner `OPENSKIN_API_KEY`.
2. Initialiser la structure : `python utils/database.py`
3. Récupérer les données : `python utils/fetcher.py`
   (l'endpoint `https://api.openskin.dev/v1/prices/all` remplit la table)

---

*Fin du snapshot — généré automatiquement, ne pas éditer à la main.*

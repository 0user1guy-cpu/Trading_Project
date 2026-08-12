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
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
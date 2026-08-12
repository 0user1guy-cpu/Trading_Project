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

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
    """Retourne la catégorie canonique.

    La catégorie est désormais stockée proprement en DB par fetcher.py (basée
    sur le `type` de l'API openskin /v1/items). On fait confiance à la valeur
    stockée ; le fallback heuristique ci-dessous ne sert que si la colonne est
    vide/None (vieille DB).
    """
    if raw_category and raw_category.strip() and raw_category != "Autres":
        return raw_category

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


# Valeur float médiane par wear (cohérent avec utils/fetcher.py).
WEAR_TO_FLOAT = {
    "Factory New": 0.03,
    "Minimal Wear": 0.10,
    "Field-Tested": 0.25,
    "Well-Worn": 0.40,
    "Battle-Scarred": 0.70,
}


def extract_wear_and_float(name: str, raw_float: Optional[float] = None,
                           stored_wear: Optional[str] = None):
    """Retourne (wear, float).

    Priorité :
      1. `stored_wear` (colonne `wear` de la DB, désormais remplie proprement
         par fetcher.py depuis l'exterior de l'API openskin).
      2. Wear déduit du nom (fallback).
      3. Wear déduit du float (dernier recours).

    Le float retourné est :
      - le `raw_float` de la DB s'il est valide (et pas le 0.05 constant
        historique), sinon
      - la valeur médiane du wear détecté.
    """
    # --- Wear : priorité à la valeur stockée ---
    name_lower = name.lower()
    if stored_wear and stored_wear.strip() and stored_wear != "Standard":
        wear = stored_wear.strip()
    elif "factory new" in name_lower:
        wear = "Factory New"
    elif "minimal wear" in name_lower:
        wear = "Minimal Wear"
    elif "field-tested" in name_lower:
        wear = "Field-Tested"
    elif "well-worn" in name_lower:
        wear = "Well-Worn"
    elif "battle-scarred" in name_lower:
        wear = "Battle-Scarred"
    else:
        wear = None

    # --- Float : valide la valeur stockée, sinon médiane du wear ---
    f_val = None
    try:
        if raw_float is not None and str(raw_float).strip() not in ["", "None", "N/A", "nan"]:
            parsed = float(str(raw_float).replace(",", "."))
            if 0.0 <= parsed <= 1.0:
                f_val = parsed
    except (ValueError, TypeError):
        pass

    if wear:
        # Si le float semble être le placeholder 0.05 mais que le wear n'est pas
        # Factory New, on prend la médiane du wear pour un affichage réaliste.
        if f_val is None or (f_val == 0.05 and wear != "Factory New"):
            f_val = WEAR_TO_FLOAT.get(wear, 0.05)
        return wear, round(f_val, 4)

    # Si l'API a explicitement marqué "Standard" (stickers, cases, agents...),
    # on ne déduit pas un wear depuis le float — on garde Standard.
    if stored_wear and stored_wear.strip() == "Standard":
        return "Standard", 0.05

    # Fallback : déduire le wear du float (vieille DB sans stored_wear)
    if f_val is not None and 0.0 <= f_val <= 1.0:
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
        return wear, round(f_val, 4)

    return "Standard", 0.05


def get_rarity_style(item_name: str, category: str, rarity: str) -> dict:
    """Retourne les couleurs/styles associés à la rareté d'un skin."""
    return get_skin_rarity_and_style(item_name, category, rarity)

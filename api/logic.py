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

"""Détermine la rareté d'un skin et ses couleurs (style CSFloat).

Couleurs officielles CS2 par rareté, avec un dégradé diffus pour le fond des
cartes (background de la fenêtre de l'arme). La rareté provient désormais de
l'API openskin /v1/items (champ `rarity`), normalisée en minuscules.
"""

# Mapping rareté -> (nom_affiché, couleur_solid, couleur_fond_rgba_diffus,
#                    couleur_bordure_rgba, badge_tailwind)
RARITY_MAP = {
    "consumer grade": (
        "Consumer",
        "#b0c3d9",
        "rgba(176, 195, 217, 0.18)",
        "rgba(176, 195, 217, 0.45)",
        "bg-slate-400/30 text-slate-200 border border-slate-400/50",
    ),
    "base grade": (
        "Base Grade",
        "#b0c3d9",
        "rgba(176, 195, 217, 0.15)",
        "rgba(176, 195, 217, 0.4)",
        "bg-slate-400/30 text-slate-200 border border-slate-400/50",
    ),
    "industrial grade": (
        "Industrial",
        "#5e98d9",
        "rgba(94, 152, 217, 0.18)",
        "rgba(94, 152, 217, 0.5)",
        "bg-sky-500/30 text-sky-300 border border-sky-500/50",
    ),
    "mil-spec grade": (
        "Mil-Spec",
        "#4b69ff",
        "rgba(75, 105, 255, 0.18)",
        "rgba(75, 105, 255, 0.5)",
        "bg-blue-600/30 text-blue-300 border border-blue-500/50",
    ),
    "high grade": (
        "High Grade",
        "#4b69ff",
        "rgba(75, 105, 255, 0.16)",
        "rgba(75, 105, 255, 0.45)",
        "bg-blue-600/30 text-blue-300 border border-blue-500/50",
    ),
    "remarkable": (
        "Remarkable",
        "#8847ff",
        "rgba(136, 71, 255, 0.18)",
        "rgba(136, 71, 255, 0.5)",
        "bg-violet-600/30 text-violet-300 border border-violet-500/50",
    ),
    "restricted": (
        "Restricted",
        "#8847ff",
        "rgba(136, 71, 255, 0.18)",
        "rgba(136, 71, 255, 0.5)",
        "bg-purple-600/30 text-purple-300 border border-purple-500/50",
    ),
    "exotic": (
        "Exotic",
        "#d32ce6",
        "rgba(211, 44, 230, 0.18)",
        "rgba(211, 44, 230, 0.5)",
        "bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/50",
    ),
    "classified": (
        "Classified",
        "#d32ce6",
        "rgba(211, 44, 230, 0.18)",
        "rgba(211, 44, 230, 0.5)",
        "bg-pink-600/30 text-pink-300 border border-pink-500/50",
    ),
    "covert": (
        "Covert",
        "#eb4b4b",
        "rgba(235, 75, 75, 0.18)",
        "rgba(235, 75, 75, 0.5)",
        "bg-red-600/30 text-red-300 border border-red-500/50",
    ),
    "contraband": (
        "Contraband",
        "#e4ae39",
        "rgba(228, 174, 57, 0.18)",
        "rgba(228, 174, 57, 0.5)",
        "bg-amber-500/30 text-amber-300 border border-amber-500/50",
    ),
    "extraordinary": (
        "Extraordinary",
        "#ffd700",
        "rgba(255, 215, 0, 0.15)",
        "rgba(255, 215, 0, 0.45)",
        "bg-yellow-500/25 text-yellow-300 border border-yellow-500/40",
    ),
    "superior": (
        "Superior",
        "#ffd700",
        "rgba(255, 215, 0, 0.14)",
        "rgba(255, 215, 0, 0.4)",
        "bg-yellow-500/25 text-yellow-300 border border-yellow-500/40",
    ),
    "distinguished": (
        "Distinguished",
        "#8847ff",
        "rgba(136, 71, 255, 0.16)",
        "rgba(136, 71, 255, 0.45)",
        "bg-purple-600/30 text-purple-300 border border-purple-500/50",
    ),
    "exceptional": (
        "Exceptional",
        "#4b69ff",
        "rgba(75, 105, 255, 0.16)",
        "rgba(75, 105, 255, 0.45)",
        "bg-blue-600/30 text-blue-300 border border-blue-500/50",
    ),
    "master": (
        "Master",
        "#eb4b4b",
        "rgba(235, 75, 75, 0.16)",
        "rgba(235, 75, 75, 0.45)",
        "bg-red-600/30 text-red-300 border border-red-500/50",
    ),
}

DEFAULT_RARITY = (
    "Consumer",
    "rgba(176, 195, 217, 0.12)",
    "rgba(176, 195, 217, 0.35)",
    "bg-slate-400/25 text-slate-300 border border-slate-400/40",
)


def get_skin_rarity_and_style(item_name, category="", raw_rarity=""):
    """Retourne {rarity_name, bg, border, badge, color} pour un item.

    - `bg` : couleur de fond RGBA diffus (pour le dégradé en background des cartes)
    - `border` : couleur de bordure RGBA
    - `badge` : classes tailwind pour le badge de rareté
    - `color` : couleur solide officielle CS2 (pour barre supérieure / accents)
    """
    name = str(item_name).lower()
    cat = str(category).lower()
    rar = str(raw_rarity or "").strip().lower()

    # Couteaux et Gants -> Extraordinary (doré) quoi qu'il arrive
    knife_cats = ("couteaux", "knives")
    glove_cats = ("gants", "gloves")
    if cat in knife_cats or cat in glove_cats or "★" in name:
        result = RARITY_MAP["extraordinary"]
    elif rar in RARITY_MAP:
        result = RARITY_MAP[rar]
    else:
        result = DEFAULT_RARITY

    return {
        "rarity_name": result[0],
        "color": result[1],
        "bg": result[2],
        "border": result[3],
        "badge": result[4],
    }

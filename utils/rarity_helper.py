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
#!/usr/bin/env python3
"""Génère (ou régénère) `snapshot_conv01.md` à partir des fichiers sources du projet.

Ce script parcourt l'arborescence du projet, lit chaque fichier source listé
ci-dessous, et écrit un blueprint Markdown complet dans `lance/snapshot_conv01.md`.

Ce blueprint est conçu pour être lu par une future conversation OpenHands afin
de recréer le projet à l'identique (protocole « lance » — voir `lance/README.md`).

Usage :
    python lance/generer_snapshot.py
"""
import os
import sys
from datetime import datetime, timezone

# Fichiers sources à capturer dans le snapshot (ordre = ordre d'affichage).
# On évite : .env, *.db, node_modules/, dist/, __pycache__/, binaires, images.
SNAPSHOT_FILES = [
    # --- Racine ---
    "requirements.txt",
    ".env.example",
    ".gitignore",
    "lancer.py",
    # --- Backend FastAPI ---
    "api/__init__.py",
    "api/logic.py",
    "api/main.py",
    # --- Utils Python ---
    "utils/__init__.py",
    "utils/config.py",
    "utils/database.py",
    "utils/fetcher.py",
    "utils/rarity_helper.py",
    # --- Frontend React (config) ---
    "frontend/package.json",
    "frontend/vite.config.js",
    "frontend/index.html",
    "frontend/public/favicon.svg",
    # --- Frontend React (source) ---
    "frontend/src/main.jsx",
    "frontend/src/App.jsx",
    "frontend/src/App.css",
    "frontend/src/index.css",
    "frontend/src/api.js",
    # --- Composants React ---
    "frontend/src/components/Navbar.jsx",
    "frontend/src/components/Navbar.css",
    "frontend/src/components/FilterSidebar.jsx",
    "frontend/src/components/FilterSidebar.css",
    "frontend/src/components/MarketGrid.jsx",
    "frontend/src/components/MarketGrid.css",
    "frontend/src/components/SkinCard.jsx",
    "frontend/src/components/SkinCard.css",
    "frontend/src/components/ItemModal.jsx",
    "frontend/src/components/ItemModal.css",
]

# Paramètres clés du projet (reproduire à l'identique lors d'un « lance »).
PARAMETRES = [
    ("Port", "8000"),
    ("Backend", "FastAPI (`api.main:app`)"),
    ("Frontend", "React + Vite (build dans `frontend/dist/`), servi par FastAPI"),
    ("Base de données", "SQLite `data.sauv.trading/market_items.db` (~37 368 items)"),
    ("CORS", "localhost:5173, :3000, :8501 (+ 127.0.0.1)"),
    ("Tri par défaut", "price_asc"),
    ("exclude_zero_price", "True par défaut"),
    ("Page size", "60 items"),
    ("Frontend base", "'./' (chemins relatifs pour prod)"),
    ("API client", "chemin relatif `/api`"),
    ("Source de vérité du wear", "le nom de l'item (pas le float_val de l'API OpenSkin)"),
]

LIMITATIONS = [
    "Graphique de prix simulé (placeholder dans `_generate_price_history`). Pour de vraies courbes → table `price_history`.",
    "Boutons Buy Now / Add to Cart décoratifs (pas de backend de transaction).",
    "`float_val` de l'API OpenSkin constant (0.05) → wear déduit du nom de l'item.",
    "Vue 3D exclue volontairement.",
]

COMMANDS = {
    "Installer les dépendances Python": "pip install -r requirements.txt",
    "Installer les dépendances frontend": "cd frontend && npm install",
    "Build du frontend": "cd frontend && npm run build",
    "Lancer le serveur unique": "python lancer.py   # → http://localhost:8000",
    "Mode dev frontend (Vite, :5173)": "cd frontend && npm run dev",
    "Repeupler la DB depuis openskin.dev": "python utils/fetcher.py",
    "Initialiser la structure SQLite": "python utils/database.py",
}


def project_root():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except (IOError, OSError) as e:
        return f"[ERREUR DE LECTURE : {e}]"


def build_snapshot():
    root = project_root()
    now = datetime.now(timezone.utc).strftime("%d %B %Y à %H:%M UTC")

    lines = []
    lines.append("# 📋 Snapshot conv_01 — Trading Project (interface CSFloat-style)\n")
    lines.append("> ⚠️ Ce fichier est une **photocopie complète** du projet, générée automatiquement")
    lines.append("> par `lance/generer_snapshot.py`. À utiliser avec le protocole « lance »")
    lines.append("> (voir `lance/README.md`) pour recréer le projet à l'identique dans une")
    lines.append("> nouvelle conversation.\n")
    lines.append(f"**Généré le :** {now}  ")
    lines.append(f"**Dépôt :** `0user1guy-cpu/Trading_Project`  ")
    lines.append(f"**Branche source :** `main` (après PR #2 mergée)\n")
    lines.append("---\n")

    # --- Sommaire ---
    lines.append("## Sommaire\n")
    lines.append("1. [Aperçu](#1-aperçu)")
    lines.append("2. [Paramètres clés](#2-paramètres-clés-à-reproduire-à-lidentique)")
    lines.append("3. [Commandes](#3-commandes)")
    lines.append("4. [Limitations connues](#4-limitations-connues)")
    lines.append("5. [Arborescence cible](#5-arborescence-cible)")
    lines.append("6. [Contenu des fichiers](#6-contenu-des-fichiers)")
    lines.append("7. [Base de données](#7-base-de-données)\n")
    lines.append("---\n")

    # --- 1. Aperçu ---
    lines.append("## 1. Aperçu\n")
    lines.append("Application **CS2 Trading** qui récupère les prix du marché depuis l'API")
    lines.append("`openskin.dev`, les stocke en **SQLite**, et les affiche via une interface")
    lines.append("**CSFloat-style** (FastAPI + React).\n")
    lines.append("- **Backend** : FastAPI (`api/`) avec endpoints REST filtrés côté SQL.")
    lines.append("- **Frontend** : React + Vite (`frontend/`), thème sombre, grille de cartes + modal.")
    lines.append("- **Serveur unique** : `lancer.py` sert l'API **et** le frontend compilé sur le port 8000.\n")

    # --- 2. Paramètres ---
    lines.append("## 2. Paramètres clés (à reproduire à l'identique)\n")
    lines.append("| Paramètre | Valeur |")
    lines.append("|---|---|")
    for nom, val in PARAMETRES:
        lines.append(f"| {nom} | {val} |")
    lines.append("")

    # --- 3. Commandes ---
    lines.append("## 3. Commandes\n")
    lines.append("| Action | Commande |")
    lines.append("|---|---|")
    for action, cmd in COMMANDS.items():
        lines.append(f"| {action} | `{cmd}` |")
    lines.append("")

    # --- 4. Limitations ---
    lines.append("## 4. Limitations connues\n")
    for i, lim in enumerate(LIMITATIONS, 1):
        lines.append(f"{i}. {lim}")
    lines.append("")

    # --- 5. Arborescence cible ---
    lines.append("## 5. Arborescence cible\n")
    lines.append("```\nTrading_Project/")
    for rel in SNAPSHOT_FILES:
        lines.append(f"├── {rel}")
    lines.append("├── data.sauv.trading/")
    lines.append("│   └── market_items.db        # (régénéré via fetcher.py ou copié)")
    lines.append("└── .env                        # (créé depuis .env.example, JAMAIS commité)")
    lines.append("```\n")

    # --- 6. Contenu des fichiers ---
    lines.append("## 6. Contenu des fichiers\n")
    lines.append("> Chaque section ci-dessous contient le **contenu exact** d'un fichier.")
    lines.append("> Pour recréer le projet : créer le fichier au chemin indiqué puis y coller")
    lines.append("> le contenu du bloc de code. Les chemins sont **relatifs à la racine** du projet.\n")
    for rel in SNAPSHOT_FILES:
        content = read_file(os.path.join(root, rel))
        # Détection d'une langue approximative pour le coloration
        if rel.endswith((".py",)):
            lang = "python"
        elif rel.endswith((".jsx", ".js")):
            lang = "jsx"
        elif rel.endswith(".css"):
            lang = "css"
        elif rel.endswith(".json"):
            lang = "json"
        elif rel.endswith(".html"):
            lang = "html"
        elif rel.endswith(".svg"):
            lang = "xml"
        elif rel.endswith((".txt", ".example", "")):
            lang = ""
        else:
            lang = ""
        lines.append(f"### `{rel}`\n")
        lines.append(f"```{lang}")
        lines.append(content.rstrip("\n"))
        lines.append("```\n")

    # --- 7. Base de données ---
    lines.append("## 7. Base de données\n")
    lines.append("La table `market_offers` est définie dans `utils/database.py` :\n")
    lines.append("```sql")
    lines.append("CREATE TABLE IF NOT EXISTS market_offers (")
    lines.append("    id INTEGER PRIMARY KEY AUTOINCREMENT,")
    lines.append("    item_name TEXT NOT NULL UNIQUE,")
    lines.append("    category TEXT,")
    lines.append("    wear TEXT,")
    lines.append("    float_val REAL,")
    lines.append("    price REAL NOT NULL,")
    lines.append("    platform TEXT NOT NULL,")
    lines.append("    rarity TEXT,")
    lines.append("    icon_url TEXT,")
    lines.append("    history_price TEXT,")
    lines.append("    volume TEXT,")
    lines.append("    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    lines.append(");")
    lines.append("```\n")
    lines.append("### Pour repeupler la base\n")
    lines.append("1. Créer `.env` depuis `.env.example` et renseigner `OPENSKIN_API_KEY`.")
    lines.append("2. Initialiser la structure : `python utils/database.py`")
    lines.append("3. Récupérer les données : `python utils/fetcher.py`")
    lines.append("   (l'endpoint `https://api.openskin.dev/v1/prices/all` remplit la table)\n")
    lines.append("---\n")
    lines.append("*Fin du snapshot — généré automatiquement, ne pas éditer à la main.*")

    return "\n".join(lines) + "\n"


def main():
    root = project_root()
    out_dir = os.path.join(root, "lance")
    out_path = os.path.join(out_dir, "snapshot_conv01.md")
    os.makedirs(out_dir, exist_ok=True)

    snapshot = build_snapshot()
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(snapshot)

    # Stats
    missing = [f for f in SNAPSHOT_FILES if not os.path.isfile(os.path.join(root, f))]
    print(f"✅ Snapshot généré : {out_path}")
    print(f"   {len(SNAPSHOT_FILES)} fichiers capturés.")
    if missing:
        print(f"   ⚠️  Fichiers manquants (ignorés dans le snapshot) :")
        for m in missing:
            print(f"      - {m}")
    else:
        print("   Tous les fichiers sources sont présents.")
    print(f"   Taille du snapshot : {os.path.getsize(out_path)} octets.")


if __name__ == "__main__":
    sys.exit(main())

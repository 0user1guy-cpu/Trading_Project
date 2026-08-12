# AGENTS.md — Trading Project

> ⚠️ Ce fichier est chargé automatiquement par OpenHands au début de chaque conversation. Il donne le contexte du projet et le protocole de mémoire persistante.

## Contexte du projet

Application CS2 Trading qui récupère les prix du marché depuis l'API openskin.dev, les stocke en SQLite, et les affiche via deux interfaces :
1. **Streamlit** (`app.py`, port 8501) — l'app originale (pages Home, Analytics, Market, Data Market)
2. **FastAPI + React** (`api/` + `frontend/`, port 8000) — interface CSFloat-style, lancée via `python lancer.py`

### Commandes utiles
```bash
# Lancer l'interface CSFloat-style (recommandé)
python lancer.py            # → http://localhost:8000

# Lancer l'app Streamlit originale
streamlit run app.py        # → http://localhost:8501

# Installer les dépendances Python
pip install -r requirements.txt

# Build manuel du frontend (normalement auto via lancer.py)
cd frontend && npm install && npm run build
```

### Structure du dépôt
- `app.py` — app Streamlit originale
- `lancer.py` — script de lancement unique (FastAPI + frontend React compilé)
- `api/` — backend FastAPI (endpoints `/api/items`, `/api/items/{id}`, etc.)
- `frontend/` — frontend React + Vite (CSFloat-style)
- `modules/` — logique métier Python (market.py)
- `utils/` — fetcher.py (API openskin), rarity_helper.py, database.py, config.py
- `data.sauv.trading/` — base SQLite (market_items.db, 37 368 items)
- `memory/` — **résumés des conversations** (voir protocole ci-dessous)

---

## 🧠 Protocole de mémoire persistante

L'utilisateur a demandé un système pour garder le contexte entre les conversations. Voici le protocole à suivre :

### Au début de chaque conversation

1. Lis `memory/INDEX.md` pour voir la liste des conversations précédentes.
2. Lis les fichiers `memory/conv_*.md` les plus récents (au moins le dernier) pour récupérer le contexte : ce qui a été fait, les décisions techniques, les limitations, ce que l'utilisateur attend.
3. Utilise ce contexte pour comprendre l'état du projet sans que l'utilisateur ait à tout réexpliquer.

### À la fin de chaque conversation (IMPORTANT — fais-le systématiquement)

Avant de terminer, crée un résumé de la conversation :

1. **Crée un fichier** `memory/conv_XX_sujet.md` où :
   - `XX` = numéro suivant dans l'index (regarde le dernier numéro dans `INDEX.md` et ajoute 1)
   - `sujet` = quelques mots décrivant le sujet (ex: `graphique-prix-reel`, `fix-lancement-windows`)
2. **Contenu du fichier** (voir `memory/INDEX.md` pour le template) :
   - Date
   - Sujet
   - Contexte du projet à ce moment
   - Ce qui a été fait
   - Décisions techniques importantes (avec le *pourquoi*)
   - PRs / commits créés
   - Limitations / TODOs restants
   - Ce que l'utilisateur attendait et s'il était satisfait
3. **Mets à jour `memory/INDEX.md`** : ajoute une ligne dans le tableau avec le nouveau numéro, le nom du fichier, la date et le sujet.
4. **Commite et pousse** les fichiers `memory/` sur `main`.

### Remarques
- Numérote les conversations de façon séquentielle (01, 02, 03…).
- Sois honnête dans les résumés : note les limitations et ce qui ne marche pas encore.
- Ces fichiers sont lus par les futures conversations — écris-les pour être utile à ton "soi futur".

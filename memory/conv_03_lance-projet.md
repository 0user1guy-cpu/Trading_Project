# Conversation #3 — « Lance le projet » (recréation depuis GitHub)

**Date :** 12 août 2026
**Sujet :** Récupération du contexte (INDEX + conv_01/02) puis lancement du projet Trading Project depuis le dépôt GitHub.

## Contexte du projet

- Dépôt GitHub : `0user1guy-cpu/Trading_Project`, branche `main`.
- Application CS2 Trading : FastAPI (backend) + React/Vite (frontend), DB SQLite 37 395 items issus d'openskin.dev.
- État hérité des convs #1 et #2 : interface CSFloat-style, serveur unique `lancer.py` (port 8000), barre latérale refondue (Float/Wear séparés + filtres CSFloat), PRs #1→#4 mergées sur `main`.
- Environnement de travail OpenHands : `/workspace/project` vide au départ (dépôt git local sans commit, aucun remote configuré). Le `memory/` existe dans le cache plugin OpenHands mais pas dans le workspace.

## Ce qui a été fait dans cette conversation

### 1. Récupération du contexte (mémoire persistante)
- `memory/INDEX.md` + `conv_01_interface-csfloat.md` + `conv_02_sidebar-csfloat-agregateurs.md` lus depuis le cache plugin (`~/.openhands/cache/plugins/Trading_Project-*/memory/`).
- Deux versions du cache présentes (`8e6f325...` et `0f31bb9...`) — contenu identique.
- `AGENTS.md` lu : confirme le protocole « lance » (git pull → snapshot → relancer.py → DB → `python lancer.py` → port 8000).

### 2. Clonage du dépôt (le workspace était vide)
- Le workspace `/workspace/project` ne contenait que `.git` vide (aucun commit, aucun remote). Donc `git pull` impossible → clonage du dépôt distant.
- `git clone https://${GITHUB_TOKEN}@github.com/0user1guy-cpu/Trading_Project.git` → HEAD `main` au commit `24edd3b` (« chore: refresh lance snapshot »).
- Branche `main` à jour, branches distantes `feat/csfloat-market-interface` et `feat/sidebar-csfloat-filters` présentes (PRs déjà mergées).
- Le clone a été déplacé dans `/workspace/project`.

### 3. Préparation de l'environnement
- **Dépendances Python** : `pip install -r requirements.txt` (fastapi 0.141.1, uvicorn 0.52.1, streamlit, pandas, etc.). Manquaient au départ (ModuleNotFoundError: fastapi).
- **Frontend** : `cd frontend && npm install` + `npm run build` → `dist/` généré (index.html 0.48 kB, CSS 28 kB, JS 169 kB). Non compilé au départ (pas de `dist/index.html`).
- **DB** : `data.sauv.trading/market_items.db` (~16.9 Mo) présente dans le dépôt, aucune action nécessaire.
- **Node.js** : v22.23.2 / npm 10.9.8 déjà installés.

### 4. Lancement du serveur
- `lancer.py` par défaut utilise le port 8000. Ici le work_host expose le port **12000** (et 12001).
- Lancement : `nohup python -m uvicorn api.main:app --host 0.0.0.0 --port 12000 > server.log 2>&1 &` (PID 3060).
- Serveur démarré en arrière-plan, accessible via l'URL publique `https://work-1-jcxywcqvozgzewjp.prod-runtime.all-hands.dev/`.
- Vérifications API : `/api/health` → OK, `/api/stats` → 37 395 items, prix moyen 94.46 $, `/api/items` → items renvoyés avec icônes Steam.
- Vérification UI (navigateur) : la grille de cartes s'affiche (stickers), navbar complète, barre latérale avec tous les filtres (recherche, prix, Float, Wear, Listing, Special, Collection, Stickers, Patterns, tri, catégories). Tout fonctionne.

## Décisions techniques importantes

1. **Clonage plutôt que `git pull`** : le workspace était vide (git initialisé mais sans commit/remote). La procédure « lance » standard suppose un dépôt local déjà lié. En l'absence de remote, j'ai cloné le dépôt distant à la place, ce qui revient au même résultat (avoir `main` à jour).
2. **Port 12000 au lieu de 8000** : `lancer.py` code le port 8000 en dur. Pour exposer le serveur via le work_host OpenHands (port 12000 mappé à l'URL publique), j'ai lancé uvicorn directement sur le port 12000 au lieu d'appeler `lancer.py`. Le code de `lancer.py` n'a pas été modifié (changement non persisté, juste pour ce runtime). Si on veut que `lancer.py` marche directement dans cet environnement, il faudrait paramétrer le port via une variable d'environnement.
3. **Build du frontend via npm (pas via lancer.py)** : `lancer.py` fait le build auto, mais comme j'ai lancé uvicorn directement, j'ai fait `npm install` + `npm run build` manuellement avant.
4. **Serveur en arrière-plan (nohup)** : pour que le serveur reste actif pendant que je vérifie l'UI. Logs dans `server.log`.

## PRs / commits créés
- Aucune PR / aucun commit de code dans cette conversation (pas de modif du code). Seul ce résumé mémoire sera commité/poussé.

## Limitations / TODOs restants

1. **Remplacement d'openskin.dev** (hérité de la conv #2) : toujours en attente de décision. Options : CS2Cap (agrégateur free 1 000 req/mois), réécriture du pattern Façade de 2mAPI en Python, ou APIs directes (CSFloat/Skinport — bloquées depuis IP datacenter).
2. **Filtres sans données d'instance** (hérité) : Stickers par emplacement, Fade%/Blue% précis, Collection par item précis restent approximatifs (par nom) tant que la source de données n'a pas d'instances.
3. **Port dans `lancer.py`** : codé en dur à 8000. Pour cet environnement (work_host port 12000), on a contourné en lançant uvicorn directement. Si l'utilisateur veut que `python lancer.py` marche ici, il faudrait ajouter un paramètre de port (ex: `PORT` env var).
4. **`reload=True`** : le serveur a été lancé sans `--reload` (uvicorn direct). `lancer.py` active `reload=True` — utile en dev, pas nécessaire ici.

## Ce que l'utilisateur attendait et s'il était satisfait

- **Lire le contexte** (INDEX + conv récentes) : ✅ fait (depuis le cache plugin, le workspace étant vide).
- **Lancer le projet** : ✅ serveur FastAPI + frontend React démarré sur le port 12000, UI CSFloat-style accessible à l'URL publique, 37 395 items chargés, tous les filtres de la barre latérale présents.

## Comment relancer après cette conversation
```bash
cd /workspace/project
# (deps déjà installées, frontend déjà buildé dans frontend/dist/)
nohup python -m uvicorn api.main:app --host 0.0.0.0 --port 12000 > server.log 2>&1 &
# → https://work-1-jcxywcqvozgzewjp.prod-runtime.all-hands.dev/
```
Si le workspace est à nouveau vide : `git clone https://github.com/0user1guy-cpu/Trading_Project.git project` puis `pip install -r requirements.txt && cd frontend && npm install && npm run build` puis la commande ci-dessus.

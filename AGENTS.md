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
- `lance/` — **snapshot + protocole « lance »** pour recréer le projet à l'identique (voir ci-dessous)

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

---

## 🚀 Protocole « lance » — recréer le projet à l'identique

> **Note :** pour démarrer à froid dans un nouveau chat (cloner depuis GitHub
> main + lire la mémoire + lancer), il existe une **skill permanente**
> `.agents/skills/lance-projet-github/SKILL.md`, déclenchée par la phrase
> « lance le projet » (ou variantes). Elle gère le clonage/pull GitHub, la
> lecture du contexte mémoire, et le lancement. Préférer cette skill pour
> un démarrage à froid. Le protocole snapshot ci-dessous reste utile pour
> recréer l'arborescence depuis le blueprint ou en mode offline.

L'utilisateur peut, dans **n'importe quelle nouvelle conversation**, dire :

> **« lance …… »** *(ex: « lance le projet », « lance conv01 », « lance l'interface csfloat »)*

### Que faire quand tu entends « lance »

1. **Tire le vrai projet GitHub à jour** : `git pull` sur la branche courante
   (pour récupérer les dernières modifs poussées — sinon tu recréerais une
   version obsolète). Le relanceur le fait automatiquement.
2. **Régénère le snapshot** depuis les fichiers actuels :
   `python lance/generer_snapshot.py` (le relanceur le fait aussi auto).
3. **Recrée l'arborescence** comme décrit dans `lance/snapshot_conv01.md`.
   - Soit à la main (un fichier = un bloc de code du snapshot),
   - Soit en lançant le relanceur : `python lance/relancer.py`
     (ajoute `--install` pour les deps, `--build` pour le frontend,
     `--start` pour démarrer, ou `--full` pour tout faire, sync comprise).
   - En mode offline (sans git) : `--from-snapshot` pour sauter le `git pull`.
4. **Base SQLite** : soit copier `data.sauv.trading/market_items.db`,
   soit `python utils/database.py` puis `python utils/fetcher.py` (clé `.env` requise).
5. **Démarre** : `python lancer.py` → http://localhost:8000

### Garder le snapshot synchronisé avec le vrai projet GitHub

Le snapshot `lance/snapshot_conv01.md` est une **photocopie** qui doit refléter
le **vrai projet à jour**. Pour ça, **à la fin de chaque conversation** où le
projet a été modifié, l'utilisateur (ou l'agent) lance :

```bash
# À ÉCRIRE À LA FIN DE CHAQUE CONVERSATION QUI MODIFIE LE PROJET :
python lance/generer_snapshot.py && git add lance/snapshot_conv01.md && git commit -m "chore: refresh lance snapshot" && git push
```

Cela régénère la photocopie depuis les fichiers actuels et la pousse sur GitHub,
pour que la prochaine conversation qui dit « lance le projet » récupère bien la
version la plus récente (via le `git pull` automatique du relanceur).

### Fichiers du dossier `lance/`
- `lance/README.md` — protocole + paramètres clés.
- `lance/snapshot_conv01.md` — blueprint complet (généré, ne pas éditer à la main).
- `lance/generer_snapshot.py` — régénère le snapshot depuis les fichiers sources.
- `lance/relancer.py` — recrée le projet depuis le snapshot (+ install/build/start).

---

## 🔄 Actualisation locale après une modif GitHub (Windows PowerShell)

**À utiliser à chaque fois que l'agent modifie le projet sur GitHub `main`.**
Le terminal doit déjà viser le dossier du projet (ex: `D:\Trading_Project>`),
pas besoin de `cd` ni de préciser le nom du projet.

### Étape 1 — Récupérer les changements depuis GitHub

```powershell
git stash
git pull origin main
git stash pop
```

- `git stash` met de côté tes éventuelles modifs locales (ex: `.vscode/settings.json`)
  pour éviter qu'elles ne bloquent le pull.
- `git pull origin main` tire les 5 derniers commits etc.
- `git stash pop` remet tes modifs locales. Si message « Already up to date » ou pas
  de conflit → tout va bien. Si « CONFLICT » → garder la version GitHub (voir plus bas).

⚠️ **Si le pull bloque avec « untracked working tree files would be overwritten »**
(un fichier local non tracké existe aussi sur GitHub, ex: `Icone_App_Streamlit.png`) :

```powershell
Remove-Item <nom_du_fichier>
git pull origin main
```

### Étape 2 — Fermer l'ancien serveur (port 8000)

`python lancer.py` démarre sur le port **8000**. Si un ancien serveur tourne
encore dessus, le nouveau ne démarre pas (« Address already in use ») et le
vieux continue d'afficher l'ancienne version. Il faut donc tuer l'ancien :

```powershell
netstat -ano | findstr :8000
```
→ repère le **numéro tout à droite** (le PID, ex: `12345`), puis :

```powershell
taskkill /PID 12345 /F
```
(remplace `12345` par ton vrai PID). Si `netstat` ne renvoie **rien** → le port
est libre, passe directement à l'étape 3.

### Étape 3 — Rebuild le frontend (si l'UI a changé)

```powershell
cd frontend
npm install
npm run build
cd ..
```
(Inutile si seule l'API a changé, mais à faire par sécurité pour l'UI React.)

### Étape 4 — Relancer le serveur

```powershell
python lancer.py
```
Vérifie le message « ✅ Serveur démarré ! » et l'absence d'erreur
« Address already in use ».

### Étape 5 — Hard refresh du navigateur

Le navigateur met en cache l'ancien JS/CSS. Ouvre `http://localhost:8000` et fais :

- **`Ctrl + Shift + R`** (ou `Ctrl + F5`)

Pour vider complètement le cache : DevTools (F12) → clic droit sur le bouton
reload → « Empty Cache and Hard Reload ».

---

### En cas de conflit `git stash pop`

Si tu vois `CONFLICT (content): Merge conflict in ...` au `git stash pop` :

```powershell
git checkout --theirs .
git stash drop
```
(Garde la version GitHub, abandonne tes modifs locales.)

### En cas de gros souci : tout réaligner sur GitHub

Si rien ne marche et que tu veux juste retrouver exactement la version GitHub :

```powershell
git fetch origin
git reset --hard origin/main
```
⚠️ **Ça efface TOUTE modif locale non commitée** — mais comme tout est sur GitHub,
c'est la façon la plus simple de repartir d'une base propre.


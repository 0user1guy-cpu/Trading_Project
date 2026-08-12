# 🚀 Dossier `lance/` — Snapshot & Protocole de lancement

Ce dossier permet de **relancer à l'identique** le projet dans n'importe quelle
nouvelle conversation, simplement en disant **"lance ……."**.

Il contient un **blueprint** (= résumé/photocopie complète du projet tel qu'il est
aujourd'hui) et un **générateur** qui recrée l'arborescence de fichiers à partir
de ce blueprint.

---

## 📂 Contenu du dossier

| Fichier | Rôle |
|---|---|
| `snapshot_conv01.md` | 📋 **Blueprint complet** : contenu de chaque fichier du projet (API + frontend + lancer.py + config), les paramètres, les commandes, les limitations. C'est la "photocopie" du projet à l'instant T. |
| `generer_snapshot.py` | 🛠️ **Générateur** : lit les fichiers sources du projet et (re)génère `snapshot_conv01.md`. À relancer après chaque évolution pour garder la photocopie à jour. |
| `relancer.py` | ▶️ **Installeur/relanceur** : recrée le projet depuis le blueprint, installe les dépendances, build le frontend et démarre le serveur. |
| `README.md` | Ce fichier. |

---

## 🎯 Le protocole « lance »

### Comment l'utilisateur déclenche la recréation

Dans **toute nouvelle conversation**, l'utilisateur peut dire :

> **« lance …… »** *(où `……` désigne le snapshot à utiliser, ex: `conv01`, `le projet`, `l'interface csfloat`, etc.)*

### Ce que l'agent doit faire quand il entend « lance »

1. **Lire `lance/snapshot_conv01.md`** (la photocopie complète du projet).
2. **Recréer l'arborescence** de fichiers exactement comme décrit dans le snapshot :
   - `api/__init__.py`, `api/logic.py`, `api/main.py`
   - `frontend/` (package.json, vite.config.js, index.html, src/**, public/**)
   - `lancer.py`
   - `utils/` (config.py, database.py, fetcher.py, rarity_helper.py, __init__.py)
   - `requirements.txt`, `.env.example`, `.gitignore`
3. **Recréer la base SQLite** :
   - Soit en copiant `data.sauv.trading/market_items.db` si présent,
   - Soit en lançant `python utils/fetcher.py` pour repeupler depuis openskin.dev
     (nécessite la clé API dans `.env`).
4. **Installer les dépendances** : `pip install -r requirements.txt` puis `cd frontend && npm install`.
5. **Lancer** : `python lancer.py` → **http://localhost:8000**

### Paramètres clés (à reproduire à l'identique)

| Paramètre | Valeur |
|---|---|
| Port | `8000` |
| Backend | FastAPI (`api/main:app`) |
| Frontend | React + Vite (build dans `frontend/dist/`), servi par FastAPI |
| DB | SQLite `data.sauv.trading/market_items.db` (37 368 items) |
| CORS | `localhost:5173`, `:3000`, `:8501` (+ 127.0.0.1) |
| Tri par défaut | `price_asc` |
| `exclude_zero_price` | `True` par défaut |
| Page size | `60` items |
| Frontend `base` | `'./'` (chemins relatifs pour prod) |
| API client | chemin relatif `/api` |
| Source de vérité du wear | le **nom** de l'item (pas le `float_val` de l'API) |

---

## 🔄 Garder le snapshot synchronisé avec le vrai projet GitHub

Le snapshot `lance/snapshot_conv01.md` est une **photocopie** qui doit refléter le
**vrai projet à jour**. Deux mécanismes s'en assurent :

### A. Au lancement (« lance le projet »)

Le relanceur (`lance/relancer.py`) fait automatiquement, **avant** de recréer les fichiers :
1. `git fetch --all` + `git pull --ff-only` sur la branche courante → récupère les
   dernières modifs poussées sur GitHub.
2. `python lance/generer_snapshot.py` → régénère la photocopie depuis les fichiers
   actuels (donc à jour).

Ainsi « lance le projet » suit **toujours la progression réelle du dépôt**, pas une
photocopie figée.

### B. À la fin de chaque conversation qui modifie le projet

Pour que la **prochaine** conversation récupère cette version, il faut pousser la
photocopie mise à jour sur GitHub. **À écrire à la fin de chaque conversation où le
projet a été modifié** :

```bash
python lance/generer_snapshot.py && git add lance/snapshot_conv01.md && git commit -m "chore: refresh lance snapshot" && git push
```

> 💡 L'agent peut faire ça tout seul à la fin d'une conversation où il a modifié le
> projet. Si tu préfères l'écrire toi-même, c'est cette commande exacte.

### Mode offline

Si tu n'as pas accès au remote GitHub (réseau coupé) :
```bash
python lance/relancer.py --from-snapshot --full   # saute le git pull, recrée depuis la photocopie
```

---

## 📜 Limitations connues (héritées de conv_01)

1. **Graphique de prix** : simulé (placeholder) dans `_generate_price_history`.
   Pour de vraies courbes → créer une table `price_history` et la requêter.
2. **Boutons Buy Now / Add to Cart** : décoratifs (pas de backend de transaction).
3. **`float_val` de l'API OpenSkin** : constant (0.05) → le wear est déduit du nom.
4. **Vue 3D** : exclue volontairement.

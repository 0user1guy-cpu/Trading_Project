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

## 🔄 Garder le snapshot à jour

Après chaque évolution du projet, relancer le générateur pour rafraîchir la photocopie :

```bash
python lance/generer_snapshot.py
```

Le générateur parcourt les fichiers sources et réécrit `snapshot_conv01.md`.
Commit puis push pour que les futures conversations aient la version à jour.

---

## 📜 Limitations connues (héritées de conv_01)

1. **Graphique de prix** : simulé (placeholder) dans `_generate_price_history`.
   Pour de vraies courbes → créer une table `price_history` et la requêter.
2. **Boutons Buy Now / Add to Cart** : décoratifs (pas de backend de transaction).
3. **`float_val` de l'API OpenSkin** : constant (0.05) → le wear est déduit du nom.
4. **Vue 3D** : exclue volontairement.

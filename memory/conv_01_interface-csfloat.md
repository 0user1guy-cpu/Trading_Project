# Conversation #1 — Interface CSFloat-style (FastAPI + React)

**Date :** 12 août 2026
**Sujet :** Reproduire l'interface du marché CSFloat avec FastAPI + React, en réutilisant la base SQLite existante (openskin.dev).

## Contexte du projet

- Dépôt GitHub : `0user1guy-cpu/Trading_Project`
- Application CS2 Trading : récupère les prix du marché depuis l'API openskin.dev, les stocke en SQLite, et les affiche.
- Avant cette conversation : l'app était en **Streamlit** (`app.py`), une seule page.
- Une première PR (#1) a corrigé des problèmes de sécurité/structure (chemin image, .env, clés API, filtrage SQL).

## Ce qui a été fait dans cette conversation

### 1. Backend FastAPI (`api/`)
- Création de `api/__init__.py`, `api/logic.py`, `api/main.py`
- `logic.py` réutilise les fonctions existantes : `clean_category`, `extract_wear_and_float` (corrigé pour prioriser le wear du nom), `rarity_helper`
- `main.py` : FastAPI avec endpoints REST :
  - `GET /api/items` — liste paginée, filtres SQL (recherche, catégorie, float, prix, wear, tri, exclusion prix=0)
  - `GET /api/items/{id}` — détail + historique de prix (simulé pour l'instant)
  - `GET /api/categories`, `/api/stats`, `/api/health`
  - CORS configuré pour React (5173), Streamlit (8501)
- La DB contient 37 368 items.

### 2. Frontend React (`frontend/`)
- React + Vite, thème sombre CSFloat-style
- `Navbar.jsx` : logo + Home, Analytics, Market, Data Market + USD/FR + Sign In
- `FilterSidebar.jsx` : recherche debouncée, catégories avec compteurs, presets de prix, filtres wear (FN/MW/FT/WW/BS), tri
- `MarketGrid.jsx` : grille responsive + pagination + skeletons de chargement
- `SkinCard.jsx` : image, nom, badge de wear, barre de float colorée, prix, badge de rareté, bouton Buy Now
- `ItemModal.jsx` : modal de détail (image, quick stats, float bar, graphique d'historique de prix en SVG, boutons d'action, métadonnées)
- `api.js` : client API, utilise `/api` (chemin relatif)

### 3. Serveur unique (`lancer.py`)
- L'utilisateur trouvait lourd de lancer 2 serveurs (backend + frontend).
- Solution : FastAPI sert aussi le frontend React compilé (`frontend/dist/`) via StaticFiles + SPA fallback.
- `lancer.py` : une seule commande `python lancer.py` → `http://localhost:8000`
- Build automatique du frontend si pas déjà compilé.
- Vérification des dépendances (fastapi, uvicorn, Node.js/npm).
- Compatibilité Windows (npm.cmd).

## PRs créées
- **PR #2** : `feat/csfloat-market-interface` → mergée sur main. Contient l'interface complète.
- **PR #1** : `fix/securite-structure-et-cles-api` → mergée avant. Corrections de sécurité.

## État actuel du code (sur `main`)
- `app.py` : l'app Streamlit originale (toujours là, pour les autres pages Home/Analytics/Data Market)
- `api/` : backend FastAPI
- `frontend/` : frontend React
- `lancer.py` : script de lancement unique
- `modules/market.py`, `utils/fetcher.py`, `utils/rarity_helper.py`, `utils/database.py` : code Python existant réutilisé

## Limitations connues
1. **Graphique de prix** : simulé (placeholder). Pour de vraies courbes, enrichir `fetcher.py` pour accumuler un historique (table `price_history`).
2. **Boutons Buy Now / Add to Cart** : décoratifs (pas de backend de transaction).
3. **Données OpenSkin** : l'API renvoie un `float_val` constant (0.05) — le wear est déduit du nom de l'item.
4. **Vue 3D** : exclue volontairement.

## Ce que l'utilisateur attendait
- Une interface comme csfloat.com : grille de cartes, modal au clic (instantané), filtres, navbar.
- Que ça ne complique pas le lancement : une seule commande, un seul port (comme Streamlit avant).
- Une livraison via PR.

## Décisions techniques importantes
- **Frontend en chemin relatif `/api`** : pour que ça marche en prod (FastAPI sert tout) et en dev (proxy Vite).
- **`extract_wear_and_float`** : le nom de l'item est la source de vérité pour le wear (l'API OpenSkin renvoie un float inexact).
- **`exclude_zero_price=True` par défaut** : les items à 0$ sont exclus de la liste par défaut.
- **`frontend/dist/` dans `.gitignore`** : le build est régénéré par `lancer.py`, pas stocké dans git.
- **`frontend/node_modules/` dans `.gitignore`** : standard.

## Comment lancer
```bash
# Dans Trading_Project/
pip install -r requirements.txt   # la première fois
python lancer.py                  # → http://localhost:8000
```
Prérequis : Python 3, Node.js (pour le build du frontend la première fois).

# Trading Project — Frontend React (interface CSFloat-style)

Interface web React consommant l'API FastAPI (`api/`) pour afficher le marché CS2
sous forme de grille de cartes avec modal de détail, inspirée de csfloat.com.

## Démarrage

### 1. Lancer le backend FastAPI (depuis la racine du projet)

```bash
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000
```

L'API est disponible sur `http://localhost:8000`. Documentation interactive : `http://localhost:8000/docs`.

### 2. Lancer le frontend React (depuis `frontend/`)

```bash
cd frontend
npm install
npm run dev
```

L'interface est disponible sur `http://localhost:5173`.

## Endpoints API

| Endpoint | Description |
|---|---|
| `GET /api/items` | Liste paginée avec filtres (q, category, float_min/max, price_min/max, wear, sort, page) |
| `GET /api/items/{id}` | Détail d'un item (pour le modal, inclut l'historique de prix) |
| `GET /api/categories` | Liste des catégories avec compteurs |
| `GET /api/stats` | Statistiques globales (total, prix min/max/moyen) |
| `GET /api/health` | Vérification de l'état de l'API |

## Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          # Point d'entrée
    ├── App.jsx           # Layout principal (navbar + sidebar + grid)
    ├── api.js            # Client API (fetch + helpers de formatage)
    ├── index.css         # Styles globaux (thème sombre)
    └── components/
        ├── Navbar.jsx          # Barre de navigation (Home, Analytics, Market, Data Market)
        ├── FilterSidebar.jsx   # Filtres (catégorie, prix, wear, tri)
        ├── MarketGrid.jsx      # Grille de cartes + pagination
        ├── SkinCard.jsx        # Carte de skin (image, wear, float bar, prix)
        └── ItemModal.jsx       # Modal de détail (image, stats, graphique de prix)
```

## Note sur les données

Les données proviennent de la base SQLite `data.sauv.trading/market_items.db`
(remplie par `utils/fetcher.py` via l'API OpenSkin). L'historique de prix dans le
modal est actuellement simulé — pour de vraies courbes, il faudra enrichir le
fetcher pour accumuler une série temporelle (table `price_history`).

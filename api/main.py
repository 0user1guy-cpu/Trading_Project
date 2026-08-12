"""API FastAPI exposant les données du marché CS2 (SQLite).

Endpoints :
  GET /api/items        — liste paginée avec filtres (recherche, catégorie, float, prix, tri)
  GET /api/items/{id}   — détail d'un item (pour le modal)
  GET /api/categories   — liste des catégories disponibles
  GET /api/stats        — statistiques globales (compteurs par catégorie)
"""
import os
import sqlite3
from typing import Optional

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .logic import DB_PATH, clean_category, extract_wear_and_float, get_rarity_style

app = FastAPI(title="Trading Project API", version="1.0.0")

# CORS : autorise le frontend React (dev server :5173) et Streamlit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8501",
                   "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


VALID_SORTS = {
    "price_asc": "price ASC",
    "price_desc": "price DESC",
    "name_asc": "item_name ASC",
    "name_desc": "item_name DESC",
    "float_asc": "float_val ASC",
    "float_desc": "float_val DESC",
    "rarity": "rarity ASC",
}


@app.get("/api/items")
def get_items(
    q: Optional[str] = Query(None, description="Recherche textuelle"),
    category: Optional[str] = Query(None, description="Catégorie: Armes, Couteaux, Gants, Caisses & Capsules, Stickers"),
    float_min: float = Query(0.0, ge=0.0, le=1.0),
    float_max: float = Query(1.0, ge=0.0, le=1.0),
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    wear: Optional[str] = Query(None, description="FN, MW, FT, WW, BS"),
    stattrak: Optional[bool] = Query(None, description="Filtrer StatTrak™"),
    souvenir: Optional[bool] = Query(None, description="Filtrer Souvenir"),
    collection: Optional[str] = Query(None, description="Nom de collection"),
    pattern: Optional[str] = Query(None, description="Motif: fade, doppler, marble..."),
    listing: Optional[str] = Query(None, description="all, buynow, auction (cosmétique)"),
    sort: str = Query("price_asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(60, ge=1, le=120),
    exclude_zero_price: bool = Query(True, description="Exclut les items à prix 0"),
):
    """Liste paginée d'items avec filtres côté SQL."""
    conn = _get_db()
    cur = conn.cursor()

    where = []
    params = []

    if q and len(q.strip()) >= 2:
        where.append("LOWER(item_name) LIKE ?")
        params.append(f"%{q.strip().lower()}%")

    if category and category != "Tous":
        where.append("category = ?")
        params.append(category)

    where.append("float_val >= ?")
    params.append(float_min)
    where.append("float_val <= ?")
    params.append(float_max)

    if price_min is not None:
        where.append("price >= ?")
        params.append(price_min)
    if price_max is not None:
        where.append("price <= ?")
        params.append(price_max)
    if exclude_zero_price:
        where.append("price > 0")

    if wear:
        wear_map = {
            "FN": ("Factory New", 0.0, 0.07),
            "MW": ("Minimal Wear", 0.07, 0.15),
            "FT": ("Field-Tested", 0.15, 0.38),
            "WW": ("Well-Worn", 0.38, 0.45),
            "BS": ("Battle-Scarred", 0.45, 1.0),
        }
        if wear in wear_map:
            _, fmin, fmax = wear_map[wear]
            where.append("float_val >= ?")
            params.append(fmin)
            where.append("float_val < ?")
            params.append(fmax)

    # Special : StatTrak / Souvenir (déduit du nom, source de vérité openskin)
    if stattrak is True:
        where.append("LOWER(item_name) LIKE '%stattrak%'")
    if souvenir is True:
        where.append("LOWER(item_name) LIKE '%souvenir%'")
    if stattrak is False and souvenir is False:
        # "Normal" = ni StatTrak ni Souvenir
        where.append("LOWER(item_name) NOT LIKE '%stattrak%'")
        where.append("LOWER(item_name) NOT LIKE '%souvenir%'")

    # Collection : recherche des mots-clés de la collection dans le nom de l'item
    if collection and collection.strip():
        from utils.collections import collection_keywords
        keywords = collection_keywords(collection.strip())
        if keywords:
            clauses = " OR ".join(["LOWER(item_name) LIKE ?" for _ in keywords])
            where.append(f"({clauses})")
            for kw in keywords:
                params.append(f"%{kw.lower()}%")
        else:
            where.append("LOWER(item_name) LIKE ?")
            params.append(f"%{collection.strip().lower()}%")

    # Motif (pattern) : filtre par type de skin dans le nom
    pattern_map = {
        "fade": "Fade",
        "doppler": "Doppler",
        "marble": "Marble Fade",
        "case_hardened": "Case Hardened",
        "tiger": "Tiger Tooth",
        "fade_blue": "Fade",
    }
    if pattern and pattern.strip():
        key = pattern.strip().lower()
        label = pattern_map.get(key, pattern.strip())
        where.append("LOWER(item_name) LIKE ?")
        params.append(f"%{label.lower()}%")

    where_clause = " AND ".join(where) if where else "1=1"
    order_clause = VALID_SORTS.get(sort, "price ASC")
    offset = (page - 1) * page_size

    # Comptage total
    count_sql = f"SELECT COUNT(*) FROM market_offers WHERE {where_clause}"
    total = cur.execute(count_sql, params).fetchone()[0]

    # Requête paginée
    data_sql = f"""
        SELECT id, item_name, category, wear, float_val, price, platform,
               rarity, icon_url, history_price, volume
        FROM market_offers
        WHERE {where_clause}
        ORDER BY {order_clause}
        LIMIT ? OFFSET ?
    """
    rows = cur.execute(data_sql, params + [page_size, offset]).fetchall()

    items = []
    for r in rows:
        wear_label, f_val = extract_wear_and_float(r["item_name"], r["float_val"], r["wear"])
        cat = r["category"] or clean_category(r["item_name"])
        rarity_info = get_rarity_style(r["item_name"], cat, r["rarity"])
        items.append({
            "id": r["id"],
            "name": r["item_name"],
            "category": cat,
            "wear": wear_label,
            "float": round(f_val, 4),
            "price": r["price"],
            "platform": r["platform"],
            "rarity": rarity_info.get("rarity_name", "Consumer"),
            "rarity_color": rarity_info.get("color", "#b0c3d9"),
            "rarity_bg": rarity_info.get("bg", "rgba(156, 163, 175, 0.15)"),
            "rarity_border": rarity_info.get("border", "rgba(156, 163, 175, 0.4)"),
            "rarity_badge": rarity_info.get("badge", "bg-gray-500/30 text-gray-300 border border-gray-400/50"),
            "icon_url": r["icon_url"],
            "history_price": r["history_price"],
            "volume": r["volume"],
        })

    conn.close()

    return JSONResponse({
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 0,
    })


@app.get("/api/items/{item_id}")
def get_item_detail(item_id: int):
    """Détail d'un item pour le modal."""
    conn = _get_db()
    cur = conn.cursor()
    row = cur.execute(
        """SELECT id, item_name, category, wear, float_val, price, platform,
                  rarity, icon_url, history_price, volume, updated_at
           FROM market_offers WHERE id = ?""",
        (item_id,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Item non trouvé")

    wear_label, f_val = extract_wear_and_float(row["item_name"], row["float_val"], row["wear"])
    cat = row["category"] or clean_category(row["item_name"])
    rarity_info = get_rarity_style(row["item_name"], cat, row["rarity"])

    return {
        "id": row["id"],
        "name": row["item_name"],
        "category": cat,
        "wear": wear_label,
        "float": round(f_val, 4),
        "price": row["price"],
        "platform": row["platform"],
        "rarity": rarity_info.get("rarity_name", "Consumer"),
        "rarity_color": rarity_info.get("color", "#b0c3d9"),
        "rarity_bg": rarity_info.get("bg", "rgba(156, 163, 175, 0.15)"),
        "rarity_border": rarity_info.get("border", "rgba(156, 163, 175, 0.4)"),
        "rarity_badge": rarity_info.get("badge", "bg-gray-500/30 text-gray-300 border border-gray-400/50"),
        "icon_url": row["icon_url"],
        "history_price": row["history_price"],
        "volume": row["volume"],
        "updated_at": row["updated_at"],
        "price_history": _generate_price_history(row["price"]),
    }


def _generate_price_history(current_price: float):
    """Génère un historique de prix simulé pour le graphique du modal.

    Placeholder : quand tu auras une table price_history réelle, remplace
    cette fonction par une requête SQL sur cette table.
    """
    import random
    points = []
    base = float(current_price) if current_price else 100.0
    for i in range(30, 0, -1):
        variation = random.uniform(-0.08, 0.06)
        price = max(0.01, base * (1 + variation * (i / 30)))
        points.append({"day": -i, "price": round(price, 2)})
    points.append({"day": 0, "price": round(base, 2)})
    return points


@app.get("/api/categories")
def get_categories():
    """Liste des catégories avec compteurs."""
    conn = _get_db()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT category, COUNT(*) as cnt FROM market_offers GROUP BY category ORDER BY cnt DESC"
    ).fetchall()
    conn.close()
    return [{"category": r["category"] or "Autres", "count": r["cnt"]} for r in rows]


@app.get("/api/stats")
def get_stats():
    """Statistiques globales."""
    conn = _get_db()
    cur = conn.cursor()
    total = cur.execute("SELECT COUNT(*) FROM market_offers").fetchone()[0]
    avg_price = cur.execute("SELECT AVG(price) FROM market_offers WHERE price > 0").fetchone()[0]
    min_price = cur.execute("SELECT MIN(price) FROM market_offers WHERE price > 0").fetchone()[0]
    max_price = cur.execute("SELECT MAX(price) FROM market_offers").fetchone()[0]
    conn.close()
    return {
        "total_items": total,
        "avg_price": round(avg_price or 0, 2),
        "min_price": round(min_price or 0, 2),
        "max_price": round(max_price or 0, 2),
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "db_path": DB_PATH}


@app.get("/api/collections")
def get_collections():
    """Liste des collections CS2 disponibles."""
    from utils.collections import get_collections_list
    return [{"name": c} for c in get_collections_list()]


# ---------------------------------------------------------------------------
# Serving du frontend React (build de production)
# ---------------------------------------------------------------------------
# Une fois le frontend compilé (npm run build → frontend/dist/), FastAPI sert
# les fichiers statiques directement. L'utilisateur n'a besoin que d'un seul
# serveur (port 8000) au lieu de deux.
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.isdir(FRONTEND_DIST):
    # Sert les assets (JS, CSS, images) depuis /assets
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str, request: Request):
        """Sert l'index.html React pour toutes les routes non-API (SPA fallback)."""
        # Ne capture pas les routes /api (déjà définies plus haut)
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Endpoint non trouvé")
        # Si c'est un fichier statique qui existe, on le sert directement
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Sinon fallback sur index.html (comportement SPA standard)
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend non compilé — lancez 'npm run build' dans frontend/")

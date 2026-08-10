import streamlit as st
import sqlite3
import os
import streamlit.components.v1 as components
from utils.rarity_helper import get_skin_rarity_and_style

# Chemin vers la base de données mise à jour
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.sauv.trading", "market_items.db"))

def clean_category(item_name, raw_category=""):
    name = str(item_name).lower()
    
    # 1. Exclusion stricte des stickers et patches
    if "sticker" in name or "patch" in name or "graffiti" in name:
        return "Stickers"
        
    # 2. Caisses et capsules
    if "case" in name or "capsule" in name or "package" in name:
        return "Caisses & Capsules"

    # 3. Gants
    glove_keywords = ["gloves", "hand wraps", "driver gloves", "specialist gloves", "sport gloves", "moto gloves", "hydra gloves", "bloodhound gloves", "fang gloves"]
    if any(k in name for k in glove_keywords):
        return "Gants"

    # 4. Couteaux
    knife_keywords = ["knife", "bayonet", "karambit", "talon", "stiletto", "ursus", "navaja", "nomad", "paracord", "skeleton", "survival", "bowie", "butterfly", "falchion", "huntsman", "shadow daggers"]
    if "★" in name or any(k in name for k in knife_keywords):
        return "Couteaux"

    # 5. Armes par défaut
    return "Armes"

def extract_wear_and_float(name, raw_float=None):
    name_lower = name.lower()
    
    try:
        if raw_float is not None and str(raw_float).strip() not in ["", "None", "N/A", "nan"]:
            f_val = float(str(raw_float).replace(',', '.'))
            if 0.0 <= f_val <= 1.0:
                if f_val < 0.07: wear = "Factory New"
                elif f_val < 0.15: wear = "Minimal Wear"
                elif f_val < 0.38: wear = "Field-Tested"
                elif f_val < 0.45: wear = "Well-Worn"
                else: wear = "Battle-Scarred"
                return wear, f_val
    except ValueError:
        pass

    if "factory new" in name_lower:
        return "Factory New", 0.03
    elif "minimal wear" in name_lower:
        return "Minimal Wear", 0.10
    elif "field-tested" in name_lower:
        return "Field-Tested", 0.25
    elif "well-worn" in name_lower:
        return "Well-Worn", 0.40
    elif "battle-scarred" in name_lower:
        return "Battle-Scarred", 0.65
        
    return "Standard", 0.05

@st.cache_data(ttl=300)
def fetch_market_data_from_db(search_query):
    if not os.path.exists(DB_PATH):
        return []
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_item_name ON market_offers(item_name);")
    
    query = "SELECT item_name, category, wear, float_val, price, platform, rarity, icon_url, history_price, volume FROM market_offers WHERE item_name LIKE ? LIMIT 150"
    cursor.execute(query, [f"%{search_query}%"])
    rows = cursor.fetchall()
    conn.close()
    
    items = []
    for row in rows:
        item_name = row[0] if row[0] and row[0] != "Unknown" else "Nom non spécifié"
        corrected_category = clean_category(item_name, row[1])
        
        wear_val, float_val = extract_wear_and_float(item_name, row[3])
        
        items.append({
            "name": item_name,
            "category": corrected_category,
            "wear": wear_val,
            "float_val": float_val,
            "price": row[4],
            "platform": row[5] if row[5] else "Inconnu",
            "rarity": row[6],
            "icon": row[7],
            "history_price": row[8] if row[8] else "-",
            "volume": row[9] if row[9] else "-"
        })
    return items

def show():
    st.markdown("""
        <h1 style="
            color: #FFFFFF;
            font-size: 2.6rem;
            font-weight: 700;
            margin-top: 45px;
            margin-bottom: 25px;
            padding: 0;
            line-height: 1.2;">
            Market
        </h1>
    """, unsafe_allow_html=True)

    categories = ["Tous", "Armes", "Couteaux", "Gants", "Caisses & Capsules", "Stickers"]
    selected_category = st.radio("Catégorie d'objet :", categories, horizontal=True)

    st.markdown("<br>", unsafe_allow_html=True)

    col_search, col_float, col_sort = st.columns([4, 3, 3])
    with col_search:
        search_query = st.text_input("Rechercher un skin...", "", placeholder="Tapez un nom (ex: AK-47)...", key="market_search_input")
    with col_float:
        float_range = st.slider("Plage d'usure (Float)", 0.0, 1.0, (0.0, 1.0), step=0.01, key="market_float_slider")
    with col_sort:
        sort_filter = st.selectbox("Trier par", ["Prix croissant", "Prix décroissant", "Meilleur rabais (%)"], key="market_sort_filter")

    if "last_search_query" not in st.session_state:
        st.session_state.last_search_query = ""
    if "cached_raw_items" not in st.session_state:
        st.session_state.cached_raw_items = []

    current_query = search_query.strip()
    if current_query != st.session_state.last_search_query:
        st.session_state.last_search_query = current_query
        if len(current_query) >= 2:
            st.session_state.cached_raw_items = fetch_market_data_from_db(current_query)
        else:
            st.session_state.cached_raw_items = []

    market_items = st.session_state.cached_raw_items

    if selected_category != "Tous":
        market_items = [item for item in market_items if item["category"] == selected_category]

    min_f, max_f = float_range
    market_items = [item for item in market_items if min_f <= float(item["float_val"]) <= max_f]

    if sort_filter == "Prix croissant":
        market_items = sorted(market_items, key=lambda x: float(str(x["price"]).replace('$', '').replace(',', '.').strip()) if x["price"] else 0.0)
    elif sort_filter == "Prix décroissant":
        market_items = sorted(market_items, key=lambda x: float(str(x["price"]).replace('$', '').replace(',', '.').strip()) if x["price"] else 0.0, reverse=True)

    html_rows = ""
    for idx, item in enumerate(market_items):
        row_id = f"market_row_{idx}"
        
        styles = get_skin_rarity_and_style(item["name"], item["category"], item["rarity"])
        icon_display = f'<img src="{item["icon"]}" class="w-full h-full object-contain drop-shadow-md" loading="lazy"/>' if item["icon"] else '<span class="text-xs text-gray-500">No img</span>'
        
        # Conversion sécurisée en float pour éviter l'erreur de format
        try:
            f_display = float(item["float_val"])
        except (ValueError, TypeError):
            f_display = 0.05
        
        html_rows += f"""
        <tr class="border-b transition-all hover:brightness-125" style="background-color: {styles['bg']}; border-color: {styles['border']};">
            <td class="py-4 px-4 font-medium flex items-center gap-3">
                <div class="w-12 h-12 flex items-center justify-center bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
                    {icon_display}
                </div>
                <span class="text-white font-semibold">{item['name']}</span>
            </td>
            <td class="py-4 px-3"><span class="text-xs px-2.5 py-1 rounded-full {styles['badge']}">{item['category']}</span></td>
            <td class="py-4 px-3 text-gray-300">{item['wear']} <span class="text-xs text-gray-400">({f_display:.2f})</span></td>
            <td class="py-4 px-3 text-emerald-400 font-bold">{item['price']} $</td>
            <td class="py-4 px-3 text-gray-300">{item['platform']}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="toggleRow('{row_id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 shadow">
                    Details
                </button>
            </td>
        </tr>
        <tr id="{row_id}" class="hidden bg-black/50 border-b border-white/10">
            <td colspan="6" class="p-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                    <div class="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div class="font-semibold text-white mb-2 flex items-center gap-2">📊 Historique & Tendance</div>
                        <p class="text-xs text-gray-400">Prix moyen récent : <span class="text-white font-medium">{item['history_price']}</span></p>
                        <p class="text-xs text-gray-400 mt-1">Volume global : <span class="text-white font-medium">{item['volume']}</span></p>
                    </div>
                    <div class="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div class="font-semibold text-white mb-2 flex items-center gap-2">⚡ Actions Marché</div>
                        <p class="text-xs text-gray-400 leading-relaxed">Offre synchronisée depuis {item['platform']}.</p>
                    </div>
                </div>
            </td>
        </tr>
        """

    if not search_query or len(search_query.strip()) < 2:
        html_rows = """
        <tr>
            <td colspan="6" class="text-center py-16 text-gray-400 font-medium">
                🔍 Veuillez taper au moins 2 caractères dans la barre de recherche ci-dessus pour afficher les skins correspondants.
            </td>
        </tr>
        """
    elif not market_items:
        html_rows = """
        <tr>
            <td colspan="6" class="text-center py-16 text-gray-500">
                Aucun objet ne correspond à votre recherche ou à la plage de float sélectionnée.
            </td>
        </tr>
        """

    full_table_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {{
                background: transparent;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }}
        </style>
    </head>
    <body class="p-2">
        <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
            <table class="w-full text-left text-sm text-gray-400 border-collapse">
                <thead class="bg-white/5 text-xs uppercase text-gray-300 border-b border-white/10">
                    <tr>
                        <th class="py-4 px-4">Item</th>
                        <th class="py-4 px-3">Catégorie</th>
                        <th class="py-4 px-3">Usure / Float</th>
                        <th class="py-4 px-3">Prix</th>
                        <th class="py-4 px-3">Plateforme</th>
                        <th class="py-4 px-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {html_rows}
                </tbody>
            </table>
        </div>

        <script>
            function toggleRow(id) {{
                const target = document.getElementById(id);
                if (target.classList.contains('hidden')) {{
                    target.classList.remove('hidden');
                }} else {{
                    target.classList.add('hidden');
                }}
            }}
        </script>
    </body>
    </html>
    """

    components.html(full_table_html, height=550, scrolling=True)
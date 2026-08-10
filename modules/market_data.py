import streamlit as st
import pandas as pd
import streamlit.components.v1 as components

# URL d'export CSV direct depuis votre Google Sheets
SHEET_ID = "1qrNxvPJOLIg4ZKV_fv3YzY7c95WXad_y8d99M7K4RLM"

@st.cache_data(ttl=600)
def load_sheet_data(sheet_name="Counter-Strike"):
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={sheet_name}"
    try:
        df = pd.read_csv(url)
        return df
    except Exception as e:
        st.error(f"Erreur de chargement de la feuille {sheet_name} : {e}")
        return pd.DataFrame()

def extract_domain(url_str):
    if not isinstance(url_str, str):
        return ""
    clean_url = url_str.replace("https://", "").replace("http://", "").split("/")[0]
    return clean_url

def show():
    st.markdown("<h1 style='color: white; margin-bottom: 20px;'>Market Data</h1>", unsafe_allow_html=True)
    
    # Barre de sélection des jeux (feuilles du Google Sheets)
    games = ["Counter-Strike", "Rust", "TF2", "Dota 2"]
    selected_game = st.radio("Jeu :", games, horizontal=True, label_visibility="collapsed")
    
    # Chargement des données
    df = load_sheet_data(selected_game)
    
    if df.empty:
        st.warning("Aucune donnée trouvée.")
        return

    # Nettoyage des colonnes
    df = df.fillna("")
    
    # Barre de recherche et filtre de méthode
    col_search, col_pay = st.columns([6, 4])
    with col_search:
        search_query = st.text_input("Rechercher un site...", "", placeholder="Ex: Tradeit, Skinport...").lower()
    with col_pay:
        pay_filter = st.selectbox("Paiement", ["Tous", "Crypto", "PayPal", "Card", "Bank / SEPA"])

    # Filtrage des données
    filtered_df = df.copy()
    if search_query:
        filtered_df = filtered_df[filtered_df['Site'].astype(str).str.lower().str.contains(search_query)]
    
    if pay_filter != "Tous":
        filter_pattern = pay_filter.lower()
        filtered_df = filtered_df[
            filtered_df['Deposit options & fees'].astype(str).str.lower().str.contains(filter_pattern) |
            filtered_df['Withdraw options & fees'].astype(str).str.lower().str.contains(filter_pattern)
        ]

    # Construction du tableau HTML interactif
    html_rows = ""
    for idx, row in filtered_df.iterrows():
        site_url = str(row.get('Site', ''))
        domain = extract_domain(site_url)
        site_name = domain.replace('.gg', '').replace('.com', '').replace('.store', '').replace('.de', '').replace('.place', '').replace('.market', '').capitalize() if domain else "Site"
        
        favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=64" if domain else ""
        
        site_type = str(row.get('Type', 'N/A'))
        seller_fees = str(row.get('Seller fees', '-'))
        deposit_fees = str(row.get('Deposit Fees', '-'))
        withdraw_fees = str(row.get('Withdraw Fees', '-'))
        
        rating = str(row.get('TrustPilot rating', ''))
        trust_str = f"⭐ {rating}" if rating and rating != "" else "-"
        
        dep_details = str(row.get('Deposit options & fees', 'Non spécifié'))
        with_details = str(row.get('Withdraw options & fees', 'Non spécifié'))
        ref_bonus = str(row.get('Referral bonus', 'Aucun'))
        ref_code = str(row.get('Referral code', ''))

        row_id = f"row_{idx}"

        html_rows += f"""
        <tr class="border-b border-white/10 hover:bg-white/[0.02] transition-all">
            <td class="py-4 px-4 font-medium flex items-center gap-3">
                {'<img src="' + favicon_url + '" class="w-6 h-6 rounded-full"/>' if favicon_url else ''}
                <a href="{site_url}" target="_blank" class="text-white font-semibold hover:underline">{site_name}</a>
            </td>
            <td class="py-4 px-3"><span class="bg-white/10 text-xs px-2.5 py-1 rounded-full text-gray-300">{site_type}</span></td>
            <td class="py-4 px-3 text-gray-200">{seller_fees}</td>
            <td class="py-4 px-3 text-gray-200">{deposit_fees}</td>
            <td class="py-4 px-3 text-gray-200">{withdraw_fees}</td>
            <td class="py-4 px-3 text-gray-300 font-medium">{trust_str}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="toggleRow('{row_id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer">
                    Details
                </button>
            </td>
        </tr>
        <tr id="{row_id}" class="hidden bg-white/[0.03] border-b border-white/10">
            <td colspan="7" class="p-5">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
                    <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div class="font-semibold text-white mb-2 flex items-center gap-2">📥 Deposit Methods & Fees</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{dep_details}</p>
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div class="font-semibold text-white mb-2 flex items-center gap-2">📤 Withdraw Options & Fees</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{with_details}</p>
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div class="font-semibold text-white mb-2 flex items-center gap-2">🎁 Bonus & Referral</div>
                        <p class="text-xs text-gray-400 leading-relaxed">{ref_bonus}</p>
                        {'<div class="mt-2 text-xs font-mono bg-white/10 p-1.5 rounded text-center text-white">Code: ' + ref_code + '</div>' if ref_code else ''}
                    </div>
                </div>
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
                        <th class="py-4 px-4">Platform</th>
                        <th class="py-4 px-3">Type</th>
                        <th class="py-4 px-3">Seller Fees</th>
                        <th class="py-4 px-3">Deposit Fees</th>
                        <th class="py-4 px-3">Withdraw Fees</th>
                        <th class="py-4 px-3">TrustPilot</th>
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

    components.html(full_table_html, height=1200, scrolling=True)
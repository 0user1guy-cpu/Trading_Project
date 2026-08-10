import sys
from pathlib import Path
import streamlit as st
import streamlit_antd_components as sac

root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.append(str(root_dir))

import modules.home as home
import modules.account as account
import modules.analytics as analytics
import modules.market as market
import modules.market_data as market_data

st.set_page_config(
    page_title="CS2 Trade", 
    page_icon="⚡", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Style global, nettoyage des conteneurs internes et masquage du sidebar natif
st.markdown("""<style>
[data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"] {
    display: none !important;
}

.stApp {
    background-color: #0b0c10 !important;
    background-image: 
        radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.3) 1.2px, transparent 0),
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px) !important;
    background-size: 40px 40px, 40px 40px, 40px 40px !important;
}

.block-container {
    padding-top: 1.2rem !important;
    padding-left: 1rem !important;
    padding-right: 1.5rem !important;
    padding-bottom: 1rem !important;
    max-width: 100% !important;
}

.header-logo-box {
    position: fixed;
    top: 14px;
    left: 20px;
    z-index: 999999;
    width: 32px;
    height: 32px;
    background-color: #FFFFFF;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Grande boîte principale de navigation */
div[data-testid="stColumn"]:first-child {
    background: linear-gradient(165deg, rgba(255, 255, 255, 0.12) 0%, rgba(20, 22, 28, 0.85) 35%, rgba(10, 11, 15, 0.95) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 12px 8px !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    margin-top: 45px !important;
    height: auto !important;
}

/* Suppression de la boîte interne grise de streamlit-antd-components */
.ant-menu {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.ant-menu-sub {
    background: transparent !important;
}

/* Ajustement de la taille du texte et des espaces pour éviter les coupures */
.ant-menu-title-content {
    font-size: 14px !important;
    white-space: nowrap !important;
}

.ant-menu-item, .ant-menu-submenu-title {
    padding-left: 12px !important;
    padding-right: 12px !important;
}
</style>
<div class="header-logo-box">⚡</div>
""", unsafe_allow_html=True)

col_nav, col_content = st.columns([2.5, 9.5], gap="small")

with col_nav:
    selected_page = sac.menu(
        items=[
            sac.MenuItem('Home', icon='house'),
            sac.MenuItem('Compte', icon='person', children=[
                sac.MenuItem('Revenu', icon='currency-dollar'),
                sac.MenuItem('Détail de vente', icon='file-earmark-text'),
                sac.MenuItem('Sale History', icon='clock-history'),
                sac.MenuItem('Notifications', icon='bell'),
            ]),
            sac.MenuItem('Analytics', icon='pie-chart'),
            sac.MenuItem('Market', icon='cart'),
            sac.MenuItem('Market Data', icon='bar-chart-line'),
        ],
        open_all=False,
        size='md',
        color='gray'
    )

with col_content:
    if selected_page == 'Home':
        home.show()
    elif selected_page in ['Compte', 'Revenu', 'Détail de vente', 'Sale History', 'Notifications']:
        account.show(selected_page)
    elif selected_page == 'Analytics':
        analytics.show()
    elif selected_page == 'Market':
        market.show()
    elif selected_page == 'Market Data':
        market_data.show()
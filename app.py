import base64
import os

import streamlit as st

from modules import analytics, home, market, market_data

st.set_page_config(
    page_title="CS2 Trading App", layout="wide", initial_sidebar_state="collapsed"
)

# Initialisation de l'état de la page active
if "active_page" not in st.session_state:
    st.session_state["active_page"] = "Home"

# Encodage de l'image locale en Base64 pour Streamlit
IMAGE_PATH = r"D:\Trading_Project\jpeg_ressources\lightning_arc.jpg"


def get_base64_image(image_path):
    if os.path.exists(image_path):
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode("utf-8")
    return ""


img_base64 = get_base64_image(IMAGE_PATH)
img_src = f"data:image/jpeg;base64,{img_base64}" if img_base64 else ""

# 1. Injection du CSS Global
st.markdown(
    """
    <style>
    /* Masquer l'en-tête et la barre latérale natives de Streamlit */
    header[data-testid="stHeader"] { display: none !important; }
    [data-testid="stSidebar"] { display: none !important; }

    /* Réinitialiser les marges de la page */
    .main .block-container {
        padding-top: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        padding-bottom: 0rem !important;
        max-width: 100% !important;
    }

    /* BARRE PRINCIPALE FIXE ET CENTRÉE ABSOLUE */
    div[data-testid="stHorizontalBlock"] {
        position: fixed !important;
        top: 0 !important;
        left: 12px !important;
        right: 12px !important;
        width: calc(100vw - 24px) !important;
        background-color: #161b22 !important;
        z-index: 99999 !important;
        padding: 0 1.8rem !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 0 0 16px 16px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        height: 85px !important;
    }

    /* Alignment des colonnes */
    div[data-testid="column"], 
    div[data-testid="stVerticalBlock"], 
    div[data-testid="stElementContainer"] {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    /* BOUTONS NAVIGATION */
    div[data-testid="stHorizontalBlock"] button {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
    }

    div[data-testid="stHorizontalBlock"] button p,
    div[data-testid="stHorizontalBlock"] button div {
        font-size: 24px !important;
        font-weight: 700 !important;
        color: #9099a8 !important;
        letter-spacing: 0.02em !important;
        line-height: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
    }

    /* Survol du texte */
    div[data-testid="stHorizontalBlock"] button:hover p {
        color: #ffffff !important;
    }

    /* Ligne au survol de la souris (qui suit la navigation) */
    div[data-testid="stHorizontalBlock"] button:hover::after {
        content: "";
        position: absolute;
        bottom: 0px !important;
        left: 10%;
        width: 80%;
        height: 4px;
        background-color: rgba(59, 130, 246, 0.6) !important;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6) !important;
        border-radius: 2px 2px 0 0 !important;
        transition: all 0.2s ease-in-out !important;
    }

    /* Onglet actif (Ligne bleue collée tout en bas) */
    div[data-testid="stHorizontalBlock"] button[kind="primary"] p {
        color: #ffffff !important;
        text-shadow: 0 0 14px rgba(59, 130, 246, 0.9) !important;
    }

    div[data-testid="stHorizontalBlock"] button[kind="primary"]::after {
        content: "";
        position: absolute;
        bottom: 0px !important; /* Ancrée au bas de la barre */
        left: 10%;
        width: 80%;
        height: 4px;
        background-color: #3b82f6 !important;
        box-shadow: 0 0 14px #3b82f6 !important;
        border-radius: 2px 2px 0 0 !important;
    }

    /* LOGO CONTENEUR POP-UP */
    .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background-color: #21262d;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        position: relative;
    }

    /* STYLE DE L'ÉCLAIR */
    .logo-lightning-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        mix-blend-mode: screen;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9)) 
                drop-shadow(0 0 14px rgba(59, 130, 246, 0.8));
        transform: scale(1.15);
    }

    /* SECTION DROITE */
    .right-section-box {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 2.2rem;
        width: 100%;
        height: 100%;
    }

    .lang-btn {
        color: #eef1f6;
        font-size: 24px !important;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        line-height: 1;
    }

    .lang-btn:hover {
        color: #3b82f6;
    }

    .icon-bell {
        color: #eef1f6;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .icon-bell svg {
        width: 36px !important;
        height: 36px !important;
    }

    .avatar-box {
        width: 3.6rem !important;
        height: 3.6rem !important;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 12px;
        box-shadow: 0 0 14px rgba(59, 130, 246, 0.5);
        cursor: pointer;
    }

    .content-area {
        padding: 140px 3rem 3rem 3rem !important;
    }
    </style>
""",
    unsafe_allow_html=True,
)

# 2. Colonnes Streamlit
cols = st.columns([0.7, 1.5, 1.6, 1.5, 1.7, 3.5, 2.7])

# Logo Éclair avec l'image Base64
with cols[0]:
    if img_src:
        st.markdown(
            f"""
            <div class="logo-container">
                <img src="{img_src}" class="logo-lightning-img" alt="Lightning Logo">
            </div>
        """,
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            """
            <div class="logo-container">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #ffffff;">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            </div>
        """,
            unsafe_allow_html=True,
        )

# Onglets de navigation
pages = ["Home", "Analytics", "Market", "Data Market"]
for i, page in enumerate(pages):
    with cols[i + 1]:
        is_active = st.session_state["active_page"] == page
        btn_type = "primary" if is_active else "secondary"
        if st.button(page, key=f"nav_{page}", type=btn_type, use_container_width=True):
            st.session_state["active_page"] = page
            st.rerun()

# Bloc Droite
with cols[6]:
    st.markdown(
        """
        <div class="right-section-box">
            <div class="lang-btn">FR ▾</div>
            <div class="icon-bell">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h14c0 0-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            </div>
            <div class="avatar-box"></div>
        </div>
    """,
        unsafe_allow_html=True,
    )

# 3. Zone de contenu
st.markdown('<div class="content-area">', unsafe_allow_html=True)

current = st.session_state["active_page"]
if current == "Home":
    home.show()
elif current == "Analytics":
    analytics.show()
elif current == "Market":
    market.show()
elif current == "Data Market":
    market_data.show()

st.markdown("</div>", unsafe_allow_html=True)
# Test de synchronisation GitDoc
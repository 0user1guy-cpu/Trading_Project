import streamlit as st

def show(sub_page="Compte"):
    # Affichage du titre épuré, aligné sous la ligne du header
    title_text = "Compte" if sub_page == "Compte" else sub_page
    
    st.markdown(f"""
        <h1 style="
            color: #FFFFFF; 
            font-size: 2.2rem; 
            font-weight: 700; 
            margin-top: 45px; 
            margin-bottom: 25px; 
            padding: 0;
            line-height: 1.2;">
            {title_text}
        </h1>
    """, unsafe_allow_html=True)
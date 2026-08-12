"""Collections CS2 connues et mapping vers les noms d'items.

L'API openskin ne fournit pas de champ « collection » par item, on utilise
donc une liste hardcodée des collections CS2 majeures et un mapping vers les
noms de skins caractéristiques. Le filtre Collection recherche ces mots-clés
dans le nom de l'item.
"""

# Liste des collections CS2 majeures (nom affiché, mots-clés de recherche).
# Les mots-clés sont cherchés (en minuscules) dans le nom de l'item.
COLLECTIONS = [
    ("The Dust 2 Collection", ["Dust II", "Dust 2"]),
    ("The Mirage Collection", ["Mirage", "Desert-Strike"]),
    ("The Inferno Collection", ["Inferno"]),
    ("The Nuke Collection", ["Nuke"]),
    ("The Vertigo Collection", ["Vertigo"]),
    ("The Ancient Collection", ["Ancient"]),
    ("The Overpass Collection", ["Overpass"]),
    ("The Anubis Collection", ["Anubis"]),
    ("The Cobblestone Collection", ["Cobblestone"]),
    ("The Office Collection", ["Office"]),
    ("The Italy Collection", ["Italy"]),
    ("The Aztec Collection", ["Aztec"]),
    ("The Bank Collection", ["Bank"]),
    ("The Chroma Collection", ["Chroma"]),
    ("The Chroma 2 Collection", ["Chroma 2"]),
    ("The Chroma 3 Collection", ["Chroma 3"]),
    ("The Spectrum Collection", ["Spectrum"]),
    ("The Spectrum 2 Collection", ["Spectrum 2"]),
    ("The Glove Collection", ["Glove"]),
    ("The Gamma Collection", ["Gamma"]),
    ("The Gamma 2 Collection", ["Gamma 2"]),
    ("The Glove Case Collection", ["Glove Case"]),
    ("The Clutch Collection", ["Clutch"]),
    ("The Horizon Collection", ["Horizon"]),
    ("The Danger Zone Collection", ["Danger Zone"]),
    ("The Prisma Collection", ["Prisma"]),
    ("The Prisma 2 Collection", ["Prisma 2"]),
    ("The CS20 Collection", ["CS20"]),
    ("The Shattered Web Collection", ["Shattered Web"]),
    ("The Fracture Collection", ["Fracture"]),
    ("The Operation Riptide Collection", ["Riptide"]),
    ("The Operation Broken Fang Collection", ["Broken Fang"]),
    ("The Operation Bravo Collection", ["Bravo"]),
    ("The Operation Phoenix Collection", ["Phoenix"]),
    ("The Operation Vanguard Collection", ["Vanguard"]),
    ("The Operation Breakout Collection", ["Breakout"]),
    ("The eSports 2013 Collection", ["eSports 2013"]),
    ("The eSports 2014 Collection", ["eSports 2014"]),
    ("The eSports 2014 Summer Collection", ["eSports 2014 Summer"]),
    ("The Arms Deal Collection", ["Arms Deal"]),
    ("The Arms Deal 2 Collection", ["Arms Deal 2"]),
    ("The Arms Deal 3 Collection", ["Arms Deal 3"]),
    ("The Havoc Collection", ["Havoc"]),
    ("The Control Collection", ["Control"]),
    ("The 2021 Dust 2 Collection", ["2021 Dust 2"]),
    ("The 2021 Mirage Collection", ["2021 Mirage"]),
    ("The 2021 Train Collection", ["2021 Train"]),
    ("The 2021 Vertigo Collection", ["2021 Vertigo"]),
    ("The Dreams & Nightmares Collection", ["Dreams & Nightmares", "Dreams and Nightmares"]),
    ("The Recoil Collection", ["Recoil"]),
    ("The Kilowatt Collection", ["Kilowatt"]),
    ("The Gallery Collection", ["Gallery"]),
]


def get_collections_list():
    """Retourne la liste des noms de collections."""
    return [name for name, _ in COLLECTIONS]


def collection_keywords(name):
    """Retourne les mots-clés de recherche pour une collection."""
    for cname, keywords in COLLECTIONS:
        if cname == name:
            return keywords
    return None

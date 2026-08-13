# 📚 Index des conversations — Trading Project

Ce dossier contient les résumés de chaque conversation importante entre l'utilisateur et OpenHands. Chaque fichier est nommé `conv_XX_sujet.md` (numérotés dans l'ordre chronologique).

## Comment ça marche

1. **Au début de chaque conversation** : lis ce fichier (`memory/INDEX.md`) puis les fichiers `conv_*.md` les plus récents pour récupérer le contexte.
2. **À la fin de chaque conversation** : crée un nouveau fichier `conv_XX_sujet.md` avec un résumé complet, puis ajoute-le à la liste ci-dessous.

## Liste des conversations

| # | Fichier | Date | Sujet |
|---|---------|------|-------|
| 1 | [conv_01_interface-csfloat.md](conv_01_interface-csfloat.md) | 12 août 2026 | Interface CSFloat-style (FastAPI + React) + serveur unique `lancer.py` |
| 2 | [conv_02_sidebar-csfloat-agregateurs.md](conv_02_sidebar-csfloat-agregateurs.md) | 12 août 2026 | Refonte barre latérale CSFloat (Float/Wear séparés + nouveaux filtres) + recherche agrégateurs API |
| 3 | [conv_03_lance-projet.md](conv_03_lance-projet.md) | 12 août 2026 | « Lance le projet » — récup contexte + clonage GitHub + lancement serveur port 12000 |
| 4 | [conv_04_selecteur-devises.md](conv_04_selecteur-devises.md) | 12 août 2026 | Sélecteur de devise (USD) dans la navbar + conversion des prix (indépendant de la source) |
| 5 | [conv_05_i18n-layout.md](conv_05_i18n-layout.md) | 12 août 2026 | Sélecteur de langue (10) + i18n UI + refonte layout cartes (nom/spécial/état) + couleurs Spécial + dégradés progressifs |
| 6 | [conv_06_toolbar-csfloat.md](conv_06_toolbar-csfloat.md) | 13 août 2026 | Toolbar CSFloat : barre catégories scrollable détachée + 💾 save filters + 🔄 refresh + toggle vue + dropdown tri 10 options (4 actives, 6 pause) |
| 7 | [conv_07_skill-lance-github.md](conv_07_skill-lance-github.md) | 13 août 2026 | Skill permanente « lance le projet » — déclenchable dans tout nouveau chat, clone/pull GitHub main + lit mémoire + lance le serveur |

---

### Convention de nommage

```
conv_XX_sujet-court.md
```
- `XX` : numéro à 2 chiffres, incrémenté à chaque conversation (01, 02, 03…)
- `sujet-court` : quelques mots décrivant le sujet, séparés par des tirets
- Exemple : `conv_02_graphique-prix-reel.md`

### Que mettre dans chaque résumé

- **Contexte du projet** à ce moment-là
- **Ce qui a été fait** dans la conversation
- **Décisions techniques** importantes (avec le *pourquoi*)
- **PRs / commits** créés
- **Limitations / TODOs** restants
- **Ce que l'utilisateur attendait** et s'il était satisfait

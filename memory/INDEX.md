# 📚 Index des conversations — Trading Project

Ce dossier contient les résumés de chaque conversation importante entre l'utilisateur et OpenHands. Chaque fichier est nommé `conv_XX_sujet.md` (numérotés dans l'ordre chronologique).

## Comment ça marche

1. **Au début de chaque conversation** : lis ce fichier (`memory/INDEX.md`) puis les fichiers `conv_*.md` les plus récents pour récupérer le contexte.
2. **À la fin de chaque conversation** : crée un nouveau fichier `conv_XX_sujet.md` avec un résumé complet, puis ajoute-le à la liste ci-dessous.

## Liste des conversations

| # | Fichier | Date | Sujet |
|---|---------|------|-------|
| 1 | [conv_01_interface-csfloat.md](conv_01_interface-csfloat.md) | 12 août 2026 | Interface CSFloat-style (FastAPI + React) + serveur unique `lancer.py` |

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

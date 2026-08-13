---
name: lance-projet-github
description: This skill should be used when the user says "lance le projet", "lance projet", "lance le projet depuis github", "récupère le contexte et lance le projet", or asks to read the project from the GitHub main branch and start it. It clones/pulls the Trading Project repository from GitHub main, reads the memory context, and launches the app. Works in any new chat regardless of conversation history.
---

# Lance le projet depuis GitHub

Récupère le projet Trading Project depuis la branche `main` du dépôt GitHub
`0user1guy-cpu/Trading_Project`, lit le contexte mémoire, puis lance
l'application. Cette skill fonctionne dans **n'importe quel nouveau chat**,
indépendamment de l'historique des conversations.

## Dépôt cible

- GitHub : `https://github.com/0user1guy-cpu/Trading_Project`
- Branche : `main`
- Clonage : utiliser le token `GITHUB_TOKEN` si le dépôt est privé, sinon
  HTTPS public. Toujours préférer `GITHUB_TOKEN` pour la robustesse.

## Procédure complète

### Étape 1 — Déterminer le répertoire de travail

Vérifier si le projet existe déjà dans `/workspace/project` :

```bash
ls /workspace/project/lancer.py 2>/dev/null && echo "EXISTS" || echo "ABSENT"
```

- Si `EXISTS` : le projet est déjà cloné localement. Passer à l'étape 2.
- Si `ABSENT` : cloner le dépôt depuis GitHub main (étape 1b).

### Étape 1b — Cloner le dépôt (si absent)

```bash
cd /workspace && rm -rf project && git clone https://${GITHUB_TOKEN}@github.com/0user1guy-cpu/Trading_Project.git project
```

Si `GITHUB_TOKEN` n'est pas disponible, tenter le clonage public :
```bash
cd /workspace && git clone https://github.com/0user1guy-cpu/Trading_Project.git project
```

Puis `cd /workspace/project`.

### Étape 2 — Tirer la branche main à jour

S'assurer d'être sur `main` et récupérer les dernières modifs poussées :

```bash
cd /workspace/project && git fetch origin && git checkout main && git pull origin main
```

Si la branche courante n'est pas `main`, `git checkout main` d'abord. Ne pas
forcer de reset destructif — un `git pull` (fast-forward) suffit.

### Étape 3 — Lire le contexte mémoire (IMPORTANT)

Pour comprendre l'état du projet sans que l'utilisateur réexplique tout :

1. Lire `memory/INDEX.md` : la liste numérotée des conversations précédentes
   avec leur sujet et leur date.
2. Lire les fichiers `memory/conv_*.md` les **plus récents** (au moins le
   dernier, idéalement les 2-3 derniers) pour récupérer :
   - Ce qui a été fait
   - Les décisions techniques (et le *pourquoi*)
   - Les limitations / TODOs restants
   - L'état actuel du projet (branche, features en cours)

Les conventions clés du projet (rappel) :
- **Noms de skins / wear / rareté ne sont JAMAIS traduits** (convention
  marketplaces CS2). Seule l'UI est traduite (10 langues via LanguageContext).
- Deux interfaces : Streamlit (`app.py`, port 8501) et FastAPI+React
  CSFloat-style (`lancer.py`, port 8000). **Lancer `python lancer.py`**
  (l'interface CSFloat-style est l'actuelle/recommandée).
- Mémoire persistante : `memory/conv_XX_sujet.md` + `memory/INDEX.md`.
- Protocole « lance » : `lance/relancer.py` recrée le projet depuis le
  snapshot, `lance/generer_snapshot.py` régénère le snapshot.

### Étape 4 — Vérifier les dépendances et la base SQLite

```bash
cd /workspace/project && pip install -r requirements.txt 2>&1 | tail -3
ls data.sauv.trading/market_items.db 2>/dev/null && echo "DB_OK" || echo "DB_ABSENT"
```

Si la base SQLite est absente, la régénérer :
```bash
python utils/database.py && python utils/fetcher.py
```
(Cela nécessite une clé API openskin dans `.env` — ne pas bloquer si elle
manque, juste signaler à l'utilisateur que les données sont absentes.)

### Étape 5 — Build le frontend

Le `lancer.py` build automatiquement le frontend si `frontend/dist` est
absent, mais pour être sûr :

```bash
cd /workspace/project/frontend && npm install 2>&1 | tail -2 && npm run build 2>&1 | tail -3 && cd ..
```

### Étape 6 — Lancer le serveur

Lancer l'application en arrière-plan pour ne pas bloquer :

```bash
cd /workspace/project && nohup python lancer.py > server.log 2>&1 &
sleep 4 && curl -s http://localhost:8000/api/health
```

Le serveur FastAPI sert :
- l'API (`/api/items`, `/api/items/{id}`, `/api/categories`, `/api/health`)
- le frontend React compilé sur la même URL (http://localhost:8000)

### Étape 7 — Vérifier et rapporter

Vérifier que le serveur répond :
```bash
curl -s http://localhost:8000/api/health
```

Devrait renvoyer `{"status":"ok","db_path":"..."}`.

Si l'environnement fournit des hosts web (voir le contexte `work_hosts`),
l'application est aussi accessible sur l'URL web correspondante (port 12000 →
work-1, port 12001 → work-2).

Rapporter à l'utilisateur :
- Le commit actuel de `main` (`git log -1 --oneline`)
- Un résumé du contexte récupéré (dernière conversation, features récentes)
- L'URL d'accès (http://localhost:8000 ou l'URL web du host)
- Le statut du serveur (OK / erreur)

## Gestion des erreurs

- **Clonage échoué (token/privé)** : signaler, tenter public, sinon demander
  à l'utilisateur de vérifier les accès.
- **`git pull` en conflit** : ne pas forcer. Signaler le conflit ; proposer
  `git stash` puis `git pull` si l'utilisateur veut écraser ses modifs locales.
- **Build frontend échoué** : vérifier `frontend/package.json`, tenter
  `rm -rf frontend/node_modules && npm install`.
- **Serveur déjà lancé sur le port** : tuer l'ancien processus d'abord
  (identifier le PID via `lsof -i:8000` ou `pgrep -f lancer.py`, pas un
  `pkill` générique).
- **Base SQLite absente sans clé API** : lancer quand même le serveur (les
  endpoints renverront des erreurs de DB mais le frontend chargera) ;
  signaler qu'il faut la clé pour peupler les données.

## Notes

- Ne **pas** pousser sur `main` sauf demande explicite de l'utilisateur.
- Ne **pas** créer de PR.
- Cette skill ne fait que lire et lancer — elle ne modifie pas le code.
- Si l'utilisateur veut AUSSI modifier le projet après le lancement, faire
  les modifications dans un nouvelle branche (pas directement sur `main`
  sans accord) et suivre le protocole mémoire en fin de conversation
  (créer `memory/conv_XX_sujet.md` + MAJ `INDEX.md` + commit/push).

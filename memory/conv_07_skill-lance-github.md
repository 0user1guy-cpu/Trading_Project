# Conversation #7 — Skill permanente « lance le projet depuis GitHub »

**Date :** 13 août 2026
**Sujet :** Création d'une skill OpenHands permanente, déclenchable par la phrase « lance le projet » dans **n'importe quel nouveau chat** (indépendamment de l'historique des conversations), qui lit le projet depuis la branche `main` du dépôt GitHub et le lance localement.

## Demande utilisateur

L'utilisateur veut qu'à chaque nouveau chat, quand il dit une certaine phrase (ex : « lance le projet »), le modèle :
1. Lise le projet depuis la branche `main` de son dépôt GitHub (pas depuis un état local potentiellement obsolète).
2. Le lance de son côté pour avoir toutes les informations nécessaires.
3. La commande doit être **permanente** — peu importe l'historique des conversations, la phrase déclenche toujours le processus dans le nouveau chat.
4. Crée aussi un nouveau `conv_XX_sujet.md` avec un résumé complet, et l'ajouter dans `memory/` à la suite des autres, avec `INDEX.md` à jour.

## Ce qui a été fait

### 1. Skill OpenHands permanente créée

Emplacement : `.agents/skills/lance-projet-github/SKILL.md`

Les skills dans `.agents/skills/` sont **chargées automatiquement par OpenHands au début de chaque conversation** et restent disponibles dans tous les nouveaux chats — c'est exactement le mécanisme de « permanence » demandé. La `description` du frontmatter YAML contient les phrases déclencheurs :

- « lance le projet »
- « lance projet »
- « lance le projet depuis github »
- « récupère le contexte et lance le projet »
- « lis le projet depuis la branche main et lance-le »

Quand l'utilisateur dit une de ces phrases (ou proche), OpenHands active la skill et exécute la procédure.

### 2. Procédure de la skill (7 étapes)

1. **Déterminer le répertoire de travail** : vérifier si `/workspace/project/lancer.py` existe (projet déjà cloné) ou absent (à cloner).
2. **Cloner si absent** : `git clone https://${GITHUB_TOKEN}@github.com/0user1guy-cpu/Trading_Project.git project` dans `/workspace`. Sinon `git checkout main && git pull origin main` pour tirer la dernière version de `main`.
3. **Lire le contexte mémoire** : `memory/INDEX.md` + les `memory/conv_*.md` récents (au moins le dernier) pour comprendre l'état du projet sans que l'utilisateur réexplique tout. Rappel des conventions (noms skins/wear non traduits, 10 langues, deux interfaces, lancer.py port 8000).
4. **Vérifier dépendances + base SQLite** : `pip install -r requirements.txt`, vérifier `data.sauv.trading/market_items.db`. Régénérer la DB si absente (via `utils/database.py` + `utils/fetcher.py` — clé `.env` requise).
5. **Build le frontend** : `cd frontend && npm install && npm run build`.
6. **Lancer le serveur** en arrière-plan : `nohup python lancer.py > server.log 2>&1 &` puis `curl http://localhost:8000/api/health` pour vérifier.
7. **Rapporter** : commit actuel de main, résumé du contexte récupéré, URL d'accès (localhost:8000 ou l'URL web du host), statut serveur.

### 3. Gestion des erreurs couverte

- Clonage échoué (token/privé) → tenter public, sinon signaler.
- `git pull` en conflit → ne pas forcer, proposer `git stash`.
- Build frontend échoué → `rm -rf node_modules && npm install`.
- Serveur déjà lancé sur le port → identifier le PID précis (pas de `pkill` générique).
- Base SQLite absente sans clé API → lancer quand même le serveur, signaler.

### 4. Garde-fous

- Ne pousse pas sur `main` sauf demande explicite.
- Ne crée pas de PR.
- La skill ne fait que **lire et lancer** — elle ne modifie pas le code.
- Pour modifier le projet après le lancement, suivre le protocole mémoire (nouvelle branche, puis `conv_XX` en fin de conversation).

## Pourquoi une skill plutôt qu'un simple script ?

- **Permanence** : les skills dans `.agents/skills/` sont auto-chargées à chaque conversation et détectées par leur `description` qui contient les phrases déclencheurs. C'est le mécanisme natif d'OpenHands pour rendre un comportement permanent et accessible dans n'importe quel nouveau chat, sans dépendre de l'historique.
- **Lecture GitHub fraîche** : la skill fait un `git pull origin main` (ou clone si absent) à chaque exécution, donc elle récupère toujours la dernière version poussée — pas un état local obsolète.
- **Contexte mémoire** : la skill lit `memory/INDEX.md` + les `conv_*.md` récents, donc le nouveau chat hérite du contexte accumulé sans que l'utilisateur réexplique.
- **Différence avec le protocole « lance » existant dans AGENTS.md** : l'ancien protocole (`lance/relancer.py` depuis le snapshot) suppose que le projet est déjà cloné localement et se base sur le snapshot. La nouvelle skill gère le cas « nouveau chat, rien en local » en clonant depuis GitHub, et lit la mémoire en plus — elle est plus complète pour le démarrage à froid.

## Tests en live

- Skill créée et validée structurellement (SKILL.md avec frontmatter YAML `name` + `description` + triggers).
- Serveur relancé via la procédure : `python lancer.py` → `curl /api/health` → `{"status":"ok",...}`. PID 9535.
- Commit actuel de main : `3e257d9` (docs memory conv_06).

## Commits

- Skill à commiter (ce commit) : `.agents/skills/lance-projet-github/SKILL.md`.
- Mémoire à commiter : `memory/conv_07_skill-lance-github.md` + `memory/INDEX.md` mis à jour.

## Limitations / Notes

1. **Phrase déclencheur** : la skill se déclenche quand OpenHands détecte une phrase proche de celles listées dans la `description`. L'utilisateur n'a pas besoin de dire exactement « lance le projet » — une variation proche (« lance le projet depuis github », « récupère le contexte et lance ») fonctionne aussi.
2. **Dépôt privé** : si le dépôt est privé et `GITHUB_TOKEN` absent, le clonage échoue. La skill tente le clonage public en fallback.
3. **Base SQLite** : la skill ne re-télécharge pas les 37 368 items depuis openskin si la DB existe déjà (elle est dans le dépôt, `data.sauv.trading/market_items.db`). Régénération seulement si absente.
4. **Hosts web** : si l'environnement fournit des hosts web (contexte `work_hosts`), le serveur est aussi accessible sur l'URL web correspondante (port 12000 → work-1, 12001 → work-2).
5. **La skill ne remplace pas le protocole mémoire de fin de conversation** : après avoir lancé et travaillé, l'agent doit toujours créer `conv_XX` et mettre à jour `INDEX.md` (comme cette conv le fait).

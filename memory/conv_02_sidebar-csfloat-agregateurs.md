# Conversation #2 — Barre latérale CSFloat + agrégateurs d'API

**Date :** 12 août 2026
**Sujet :** Refonte de la barre latérale façon CSFloat (Float/Wear séparés, nouveaux filtres) + recherche d'agrégateurs d'API tiers pour remplacer openskin.dev.

## Contexte du projet

- Dépôt GitHub : `0user1guy-cpu/Trading_Project`, branche `main`.
- Application CS2 Trading : FastAPI (backend) + React/Vite (frontend), DB SQLite 37 395 items issus d'openskin.dev.
- La conversation #1 a posé les bases (interface CSFloat-style, serveur unique port 8000, dossier `lance/`).
- La PR #3 a été mergée sur `main` (vraies données float/wear/catégories depuis openskin + UI style CSFloat initiale).

## Ce qui a été fait dans cette conversation

### 1. Problème `git pull` (DB locale vs distante)
- L'utilisateur a eu une erreur `git pull` : `data.sauv.trading/market_items.db` local écrasait la version distante.
- Solution : `git checkout -- data.sauv.trading/market_items.db && git pull` (la version distante est la bonne).

### 2. Refonte de la barre latérale (PR #4, mergée sur `main`, commit `298ce1f`)
L'utilisateur a demandé une refonte exhaustive de la `FilterSidebar` pour coller au design CSFloat :

**Séparation Float / Wear :**
- Float = section dédiée avec slider à dégradé de couleur (bleu=bon 0.00 → rouge=mauvais 0.70) + inputs min/max.
- Wear = section séparée en popup d'initiales (FN/MW/FT/WW/BS) avec tooltip au survol (nom complet), alignée sous Float.

**Sliders à flèches SVG (prix + float) :**
- Nouveau composant réutilisable `RangeSlider.jsx` : deux petites flèches triangulaires (SVG) posées sur la barre de graduation, glissables pour un tri précis. Voiles assombris hors sélection (style CSFloat).
- Le PDF `flêche_barre_design.pdf` fourni par l'utilisateur n'est pas arrivé dans le workspace (upload non détecté) ; flèches conçues d'après la description textuelle.

**Nouveaux filtres (style CSFloat) :**
- **Listing** : toggle All / Buy Now / Auction (`ListingFilter.jsx`).
- **Special** : coches StatTrak™ / Souvenir / Highlight / Normal (`SpecialFilter.jsx`). StatTrak et Souvenir filtrés réellement via le nom côté backend (5011 items StatTrak testés OK).
- **Collection** : popup listant 52 collections CS2 avec recherche (`CollectionPopup.jsx`, `utils/collections.py`, endpoint `/api/collections`).
- **Stickers** : popup 5 lignes d'emplacements (« N'importe quel emplacement » / « Emplacement 1..5 ») + champ nom de sticker (`StickerFilter.jsx`).
- **Patterns (Motif)** : chips Fade/Doppler/Marble Fade/Case Hardened/Tiger Tooth + sliders Fade % et Blue % (`PatternsFilter.jsx`).

**Backend (`api/main.py`) :**
- Nouveaux params : `stattrak`, `souvenir`, `collection`, `pattern`, `listing`.
- Filtre Special StatTrak/Souvenir via recherche nom dans `item_name`.
- Filtre Collection par mots-clés de collection (mapping hardcodé 52 collections).
- Filtre Pattern par nom de motif (257 items Fade testés).
- Endpoint `/api/collections` (52 collections).

**Fichiers (24 fichiers, +1224/−203) :**
- 11 nouveaux composants frontend (RangeSlider, WearPopup, CollectionPopup, StickerFilter, PatternsFilter, SpecialFilter, ListingFilter, FilterSection + leurs CSS).
- `utils/collections.py` (mapping 52 collections CS2).
- `FloatSlider.jsx/css` supprimés (remplacés par `RangeSlider.jsx/css`).
- `App.jsx` : `DEFAULT_FILTERS` étendu (stattrak, souvenir, collection, pattern, listing, special, stickers).
- `MarketGrid.jsx` : construction des params API transforme `special` (objet) → `stattrak`/`souvenir` et `pattern` (objet) → `pattern` (string).

**Note sur les données :** openskin `/v1/items` ne fournit pas de données par instance (stickers appliqués, fade%/blue% par exemplaire, collection par skin). Les filtres Special (StatTrak/Souvenir) et Pattern (par nom) fonctionnent réellement. Les filtres Stickers (par emplacement), Fade%/Blue% précis, et Collection par item précis sont limités par les données (UI fidèle à CSFloat mais filtrage approximatif par nom).

### 3. Recherche d'agrégateurs d'API tiers pour remplacer openskin.dev

L'utilisateur veut remplacer openskin.dev (data "pas ouf") par un agrégateur d'API tiers qui scrape les items en vente sur CSFloat, Skinport, Buff163, etc.

**Agrégateurs trouvés (avec tiers gratuits) :**

| Service | Marketplaces | Tier gratuit | Limite gratuite | Note |
|---------|-------------|---------------|------------------|------|
| **CS2Cap** (cs2cap.com) | 38 (CSFloat, Skinport, Buff163, Youpin, C5Game, Steam, DMarket...) | Free | 20 req/min, **1 000 req/mois** | Meilleur agrégateur tout-en-un. Endpoint `/v1/prices` multi-marketplaces, `/v1/market/items` catalogue. Snapshot complet : 1 req/5 min cooldown. |
| **CSPriceAPI** (cspriceapi.com) | 8+ (YouPin, BUFF163, Skinport, SkinBaron, C5Game, CSFloat, EcoSteam, Market.CSGO) | Free tier | API key gratuite | Endpoint `/v1/prices/:market`, OpenAPI 3.1, Live Deals feed (arbitrage). |
| **cs2.sh** (cs2.sh) | 6 (BUFF, Youpin, CSFloat, Skinport, C5Game, Steam) | Essai 2 jours | clé `developer` gratuite 2 jours | Bid/ask, OHLC, 3+ ans d'historique, 5 min de fraîcheur. Puis payant. |
| **Skinstrack** (GitHub SKINSTRACK/CS2-Price-API) | +30 | Free limité | `/v1/free/items` (Steam prices seulement) | Multi-marketplaces en payant. |

**APIs publiques directes testées depuis le serveur :**
- CSFloat API (`api.csfloat.com/listings`) : 50 listings/page, curseur paginé, mais **bloque depuis IP datacenter** (erreur connexion testée). Fonctionne depuis IP résidentielle.
- Skinport API (`skinport.com/api/items`) : **403 Forbidden** sans headers/origine valide.
- Buff163 : pas d'API publique, Cloudflare agressif, géo-restreint (Chine), impossible à scraper soi-même.

**Tests des APIs directes :**
- `curl https://api.csfloat.com/listings?limit=3` → HTTP 000 (connexion refusée/bloquée).
- `curl https://skinport.com/api/items` → HTTP 403.

### 4. Analyse de deux repos GitHub communautaires

L'utilisateur a fourni deux liens GitHub à analyser pour leur pertinence.

**1. `cyberbebebe/cs2-profit-checker` — ❌ Non adapté**
- Extension Chrome (manifest.json), pas un agrégateur d'API.
- Récupère **l'historique de transactions perso** (achats/ventes) sur chaque marketplace pour un rapport de profit fiscal (.xlsx), pas le catalogue public.
- Fetchers utilisent `csfloat.com/api/v1/me/trades` (endpoint authentifié, tes propres trades, nécessite cookie de session).
- 15 fetchers (CSFloat, Buff163, Skinport, DMarket, etc.) mais tous basés sur session cookie navigateur.
- Verdict : inadapté (outil de compta fiscale, pas une source de données marché).

**2. `baasilali/2mAPI` — ⚠️ Architecture bonne mais limites**
- Agrégateur Node.js (CLI, pas API REST) qui scrape les prix par item depuis 6 marketplaces.
- Architecture propre : pattern Facade (`PriceAggregator`) + Factory (`ApiFactory`) + workers parallèles (`Worker` threads), un par marketplace.
- Schéma de sortie unifié : `{item_name: {CSFloat: {price}, Buff163: {price}, ...}}` dans `prices_output.json`.
- Sources : CSFloat (API key), Buff163 (cookie session), Skinport (snapshot public), Steam (public), DMarket (clé signée), HaloSkins.
- Rate limiting : CSFloat attend 1h si `code===20` (429), sauvegarde index pour reprise. Steam 100ms entre req. Buff163 aucun délai.
- Verre de fichier (`proper-lockfile`) pour écriture concurrente.
- Limites : pas une API REST (script CLI Node), Buff163 nécessite cookie qui expire, CSFloat attente 1h sur 429 (très lent), Skinport re-fetch en boucle infinie (risque ban), pas de données d'instance (prix par nom, pas par float/sticker). Code non maintenu (20 commits).

**Recommandation faite à l'utilisateur :**
- 2mAPI n'est pas optimal mais son **architecture Façade est intéressante à réutiliser** en Python.
- Approche recommandée : réécrire le pattern Façade dans `utils/fetcher.py` (Python), sources CSFloat + Skinport + Steam (gratuits, sans cookie), rate limiting prudent (backoff exponentiel au lieu d'attente 1h), exposé via API FastAPI existante.
- Alternative : CS2Cap (agrégateur tout-en-un, tier free 1 000 req/mois) qui évite de gérer les bans/bypass soi-même.
- En attente de la décision de l'utilisateur sur quelle option adopter.

## Décisions techniques importantes

1. **Sliders à flèches SVG au lieu de curseurs circulaires** : l'utilisateur voulait explicitement des "petites flèches" (PDF fourni mais non reçu). Implémenté en SVG triangulaire pointant vers le bas, glissables, avec voiles assombris hors sélection.
2. **Float et Wear séparés** : l'utilisateur a demandé explicitement la séparation (avant ils étaient combinés dans une section "Wear/Float"). Float = section avec slider couleur, Wear = popup initiales avec tooltip.
3. **Filtres sans données réelles restent en UI** : Stickers par emplacement, Fade%/Blue% précis, Collection par item précis n'ont pas de données d'instance dans openskin. L'UI est fidèle à CSFloat mais le filtrage est approximatif (par nom). Choix assumé (limitation de la source de données, pas du code).
4. **Collections hardcodées** : openskin ne fournit pas de champ collection. 52 collections CS2 majeures listées dans `utils/collections.py` avec mapping mots-clés. Le filtre recherche les mots-clés dans le nom d'item (approximatif).
5. **StatTrak/Souvenir filtrés via le nom** : l'API openskin a `is_stattrak`/`is_souvenir` mais le fetcher stockait déjà le nom complet (qui contient "StatTrak™"/"Souvenir"). Le filtre backend utilise LIKE sur le nom (5011 items StatTrak, testé OK).
6. **Pas de merge automatique des PRs en draft** : la PR #4 a été créée en draft par défaut. Il a fallu utiliser l'API GraphQL `markPullRequestReadyForReview` pour la passer en ready avant de merger (le PATCH REST ne fonctionnait pas).

## PRs / commits créés

- **PR #4** : « feat(sidebar): barre latérale style CSFloat — Float/Wear séparés + nouveaux filtres »
  - Branche : `feat/sidebar-csfloat-filters`
  - Merge commit : `298ce1f` (mergé sur `main`)
  - 24 fichiers, +1224/−203
  - https://github.com/0user1guy-cpu/Trading_Project/pull/4

## Limitations / TODOs restants

1. **Remplacement d'openskin.dev par un agrégateur** : en attente de la décision de l'utilisateur. Options :
   - CS2Cap (agrégateur tout-en-un, free 1 000 req/mois) — nécessite compte + API key.
   - Réécriture du pattern Façade de 2mAPI en Python (CSFloat + Skinport + Steam, sans cookie).
   - APIs directes (CSFloat/Skinport) — bloquées depuis IP datacenter, nécessitent IP résidentielle.
2. **Filtres sans données d'instance** : Stickers par emplacement, Fade%/Blue% précis, Collection par item précis ne sont pas réellement filtrables avec openskin. Seront fonctionnels si on passe à un agrégateur avec données d'instance (CS2Cap/CSPriceAPI).
3. **PDF des flèches non reçu** : `flêche_barre_design.pdf` n'est pas arrivé dans le workspace. Les flèches SVG ont été conçues d'après la description textuelle. L'utilisateur pourra demander des ajustements s'il voit le rendu.
4. **`frontend/dist/` est gitignored** : l'utilisateur doit faire `npm run build` après chaque `git pull` pour voir les changements frontend (expliqué à l'utilisateur).

## Ce que l'utilisateur attendait et s'il était satisfait

- **Refonte de la barre latérale** : ✅ tous les filtres demandés implémentés (Float/Wear séparés, sliders flèches, Listing, Special, Collection, Stickers, Patterns, Wear popup tooltip). Testé en live (StatTrak filtre 5011 items). PR mergée.
- **Agrégateur d'API** : recherche faite, 3 agrégateurs avec tiers gratuits identifiés (CS2Cap recommandé). 2 repos GitHub analysés (cs2-profit-checker ❌, 2mAPI ⚠️). En attente de la décision de l'utilisateur pour l'intégration.
- L'utilisateur a confirmé vouloir que les PRs soient mergées directement quand elles correspondent à la demande (« pas besoin de me demander à chaque fois »).

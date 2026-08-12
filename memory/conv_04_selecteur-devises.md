# Conversation #4 — Sélecteur de devise (USD) + conversion des prix

**Date :** 12 août 2026
**Sujet :** Ajout d'un sélecteur de devise dans la barre du haut (navbar) qui convertit les prix affichés dans la devise choisie. Indépendance de la conversion vis-à-vis de la source de données (openskin, CSFloat API, etc.).

## Contexte du projet

- Dépôt GitHub : `0user1guy-cpu/Trading_Project`, branche `main`.
- Application CS2 Trading : FastAPI (backend) + React/Vite (frontend), DB SQLite 37 395 items.
- Héritage des convs #1→#3 : interface CSFloat-style, serveur unique, barre latérale refondue (Float/Wear + filtres), projet lancé sur le port 12000 du work_host OpenHands.
- La navbar avait un sélecteur "USD" statique (non fonctionnel, décoratif) et un "FR" (langue, décoratif).

## Ce qui a été fait dans cette conversation

### 1. Analyse du code existant
- `formatPrice(price)` dans `api.js` était le point central de formatage (toujours en USD via `Intl.NumberFormat('en-US', {currency:'USD'})`).
- Utilisé dans `SkinCard.jsx` (prix carte) et `ItemModal.jsx` (prix modal, bouton Buy Now, labels min/max du graphique `PriceChart`).
- Les inputs de prix de la `FilterSidebar` restent en USD (pour la requête API / filtres SQL) — non touchés (cohérent : la DB est en USD).

### 2. Architecture : CurrencyContext (React Context)
- **Nouveau `frontend/src/contexts/CurrencyContext.jsx`** : provider + hook `useCurrency`.
  - État `currency` (code ISO, défaut USD, persisté en localStorage clé `tp-currency`).
  - `rates` (objet {USD:1, EUR:0.92, ...}) récupérés une fois au mount depuis l'API publique **open.er-api.com /v6/latest/USD** (gratuite, sans clé, supporte CORS).
  - **Repli sur des taux figés** (`FALLBACK_RATES`) si l'API échoue (réseau, offline).
  - `convert(usdPrice)` = `usdPrice * rates[currency]`.
  - `formatPrice(usdPrice)` = conversion + formatage `Intl.NumberFormat` avec la locale et le code ISO de la devise. Cas spécial JPY (0 décimale).
- **Indépendance de la source de données (demande explicite de l'utilisateur)** : la conversion s'appuie uniquement sur `item.price` (devise de base USD). Changer la source des items (openskin, CSFloat API avec clé, Skinport...) n'affecte pas la conversion — elle s'adapte aux nouveaux contenus tant que les prix sont en USD. Aucune logique couplée à un fetcher ou schéma spécifique.

### 3. Liste des devises (une dizaine, les plus utilisées — pas toutes)
USD, EUR, GBP, JPY, CNY, CAD, AUD, CHF, INR, BRL (10 monnaies). Chaque entrée : `{code, name, symbol, locale}`.

### 4. Sélecteur de devise (dropdown dans la navbar)
- **Nouveau `CurrencySelector.jsx` + `.css`** : bouton (code devise + flèche SVG qui pivote à l'ouverture), dropdown qui s'ouvre au clic, se ferme au clic extérieur (`mousedown` listener + `useRef`).
- Chaque option : code (accent bleu), nom complet, symbole. L'option active est surlignée.
- Animation `currency-fade-in` (0.12s).
- Intégré dans `Navbar.jsx` à la place de l'ancien sélecteur "USD" statique. Le "FR" (langue) décoratif est conservé.

### 5. Connexion des composants de prix au contexte
- `App.jsx` : enveloppe toute l'app dans `<CurrencyProvider>`.
- `SkinCard.jsx` : `import { useCurrency }` → `const { formatPrice } = useCurrency()` → remplace l'import `formatPrice` de `api.js`. Le prix de la carte se convertit.
- `ItemModal.jsx` : idem pour le prix principal, le bouton Buy Now. Le sous-composant `PriceChart` reçoit `formatPrice` en prop (plutôt que d'appeler le hook directement dans une fonction non-composant au sens React) pour les labels min/max de l'axe Y.
- L'ancien `formatPrice` de `api.js` reste exporté (rétrocompatible) mais n'est plus utilisé par les composants.

### 6. Tests en live (navigateur, serveur port 12000)
- Build frontend OK (64 modules, JS 172 kB).
- Page chargée → bouton "USD" visible dans la navbar.
- Clic sur USD → dropdown ouverte, 10 monnaies affichées (USD/EUR/GBP/JPY/CNY/CAD/AUD/CHF/INR/BRL avec nom + symbole).
- Sélection EUR → tous les prix des cartes passent de `$0.01` à `0,01 €` (format allemand, taux EUR appliqué depuis l'API).
- Clic sur une carte → modal ouvert, bouton "Buy Now · 0,01 €" (prix converti), graphique OK.
- Persistance : localStorage `tp-currency` peuplé.

## Décisions techniques importantes

1. **Conversion côté frontend (pas backend)** : les taux sont fetchés côté navigateur (open.er-api.com supporte CORS). Plus réactif (pas de re-fetch des items, juste re-render), et décentralise la logique de devise de la logique métier/backend. Le backend FastAPI n'a pas été modifié.
2. **Devise de base = USD** : la DB stocke les prix en USD (cohérent avec openskin.dev). Le contexte convertit depuis USD vers la devise active. Si une future source renvoie les prix dans une autre devise de base, il faudra ajuster — mais c'est une hypothèse raisonnable (marchés CS2 majoritairement en USD).
3. **API de taux sans clé** : open.er-api.com est gratuite, sans inscription, avec CORS. Repli sur taux figés en cas d'indispo. Pas de secret à gérer.
4. **10 monnaies seulement** (demande explicite de l'utilisateur : "ne regroupe pas toutes les monnaies possible") : les plus utilisées au monde par volume/usage. Liste hardcodée dans `CURRENCIES`. Ajouter une monnaie = ajouter une ligne + son taux figé de repli.
5. **`PriceChart` reçoit `formatPrice` en prop** plutôt que d'appeler `useCurrency()` directement : `PriceChart` est une fonction définie dans le même fichier mais c'est plus propre de passer la dépendance explicitement, et évite un hook dans un sous-arbre qui pourrait ne pas être sous le provider dans d'autres contextes.
6. **Les filtres de prix de la sidebar restent en USD** : les inputs min/max et les presets (`< $10`, `$10-$50`...) sont en USD car ils construisent la requête API (la DB filtre en USD). La conversion ne concerne que l'affichage, pas le filtrage. Choix assumé (sinon il faudrait convertir les bornes à chaque changement de devise, ce qui est fragile).

## PRs / commits créés

- **PR #5** : « feat(currency): sélecteur de devise dans la navbar + conversion des prix »
  - Branche : `feat/currency-converter`
  - 7 fichiers (3 nouveaux : CurrencyContext, CurrencySelector.jsx/.css ; 4 modifiés : App.jsx, Navbar.jsx, SkinCard.jsx, ItemModal.jsx), +354/−23.
  - https://github.com/0user1guy-cpu/Trading_Project/pull/5
  - **Merge commit** : `c5ccd89` (mergé sur `main`).
  - Suite à la demande complémentaire de l'utilisateur (filtre de prix de la sidebar doit corrélér avec la devise), la branche a reçu un commit supplémentaire (`6de2315`) modifiant `FilterSidebar.jsx` (slider/inputs/presets convertis) AVANT le merge.

## Limitations / TODOs restants

1. **Devise de base USD hardcoded** : si une future source de données (ex: agrégateur CS2Cap, CSFloat API) renvoie des prix dans une autre devise de base, il faudra ajuster le contexte (définir la devise de base de la source, ou faire une conversion à deux étapes). Pour l'instant USD = hypothèse safe (DB openskin en USD).
2. **Arrondis sur les inputs de prix** : la conversion bidirectionnelle (affichage devise → saisie → USD → ré-affichage converti) peut produire de légers arrondis pendant la frappe. Les valeurs sont arrondies à l'entier (Math.round) à l'affichage. Acceptable pour un marché CS2 mais pas précis au centime près en saisie.
3. **Taux de change mis à jour au mount** : pas de refresh périodique (les taux open.er-api.com sont daily). Suffisant pour un marché CS2, mais pas en temps réel.
4. **Filtre de prix : presets en USD constants** : les presets sont définis en USD (0/10/50/250) et affichés convertis. Les bornes ne "fluctuent" pas dynamiquement (l'utilisateur a explicitement dit que le filtre de prix n'est pas un objet en vente, donc pas de fluctuation — juste une corrélation d'affichage avec la devise active).

## Ce que l'utilisateur attendait et s'il était satisfait

- **Sélecteur de devise dans la barre du haut avec flèche qui ouvre une boîte** : ✅ implémenté (CurrencySelector dropdown).
- **Convertit les prix affichés sur la page ouverte dans la devise sélectionnée** : ✅ (cartes + modal + graphique, testé EUR).
- **Une dizaine de monnaies les plus utilisées, pas toutes** : ✅ (10 monnaies : USD/EUR/GBP/JPY/CNY/CAD/AUD/CHF/INR/BRL).
- **Indépendance de la source de données** ("si je change de source pour les objets... cela n'affecte pas la fonctionnalité, elle s'adapte") : ✅ la conversion ne dépend que de `item.price` en USD, pas du fetcher ni du schéma de la source.
- Livraison via PR : ✅ PR #5 créée (non mergée, en attente).

# Rapport de non-régression — build 0.21.0 (R-6 · `equipe.html` v1.1)

Base : `main` = 0.20.0 (`e7f6a41`, R-6 en prod). Objet : **equipe v1.1** — entrée « à froid »
guidée + passe dé-jargon (spec `metronome-refonte-R6-equipe-v1.1-spec.md`). **Zéro moteur**
(BUILD seule ligne), livraison fichiers complets.

## 1. Ce qui change

| Fichier | Changement |
|---|---|
| `equipe.html` | **Entrée à froid** : `#eqEmpty` réécrit (intro en clair + 3 étapes + « Essayer avec un exemple » → `EQ_EXAMPLE` embarqué déterministe, 3 joueurs djembé, sans backend + séparateur « J'ai déjà une répartition »). **Transport masqué** tant qu'aucune équipe chargée ; `eqApplyConfig` le révèle. **Dé-jargon** : « (backing) » → « les autres » ; « Groove : » → « Rythme : » ; « (JSON) » → « (fichier .json) » ; « Aller à » → « La préparer dans » ; glose « Mon pupitre — ma ligne à jouer » et « le chef, c'est la personne qui lance le groupe ». i18n EN+PT (clés d'ancien intro purgées, nouvelles ajoutées, symétrie tenue). |
| `index.html` | Note de la porte « En équipe » dé-jargonnée (perd « pupitre ») + 2 clés i18n (EN+PT). |
| `moteur/fm-etat.js` | `BUILD` → `metronomefunk-0.21.0` (**seule** ligne moteur ; md5 == 0.10.0, dans la tolérance). |
| `recette-equipe.js` | +7 assertions : **K1–K4** (à froid : état vide, transport masqué, 3 étapes + bouton, dé-jargon dicos) ; **L1–L3** (exemple embarqué : charge + transport révélé, 3 joueurs/percGrids djembé, aller-retour de partage). BUILD 0.21.0. |
| `recette-accueil.js` | Clé de note de porte mise à jour (D1/P2.5 constants) ; BUILD 0.21.0. |
| `recette-apprendre.js`, `recette-pratiquer.js`, `recette-extraction.js` | BUILD 0.20.0 → 0.21.0 (seul changement). |

**Aucune retouche moteur** hors BUILD : `moteur/*.js` reste identique à 0.10.0 à l'octet près
modulo la ligne BUILD (recette-extraction : md5 == 0.10.0, tolérances = BUILD + `accompMuted`
×1 + `feelMs` ×2, inchangées).

## 2. Batterie canonique — 29 suites, 1084 assertions, 0 rouge

Node 22, jsdom, `--max-old-space-size=4096`. Comptes des suites touchées :

- **equipe** : 46 → **53** (+K1–K4 entrée à froid, +L1–L3 exemple embarqué). Les tests « à
  froid » (K) tournent **avant** tout chargement — `B2` (percGrids vide au boot) reste vert ;
  l'exemple (L) est joué en fin de suite.
- **accueil** 61 · **apprendre** 70 · **pratiquer** 66 · **extraction** 28 — comptes constants,
  BUILD + (accueil) clé de note mis à jour.
- **24 autres suites** : à compte strictement constant (BUILD lu par regex version-agnostique
  côté passe 5 ; contenu inchangé). Total 1084, **0 rouge** (exit 0 sur les 29).

Audit i18n strict (equipe) : symétrie EN↔PT, 0 clé orpheline, extraction des nœuds texte et
des attributs sans manque (I2–I5 verts) — les libellés neufs de l'entrée à froid sont couverts.

## 3. Navigateur réel (Chromium) — 32/32, 0 erreur applicative

Deux modes (`http://` serveur local + `file://`), 16 vérifications chacun :

- **À froid** : `#transport` masqué, onboarding visible, 3 étapes rendues, bouton « Essayer
  avec un exemple » présent, `#eqLoaded` masqué.
- **Exemple** : le clic charge la config → transport **révélé**, `#eqLoaded` visible, 3 chips
  joueur + « Écouter tout », pupitre gréé (`.pfg-steps`), résumé « **Rythme : Exemple funk ·
  3 joueurs** ».
- **Le chef** : décompte plein écran, puis **lecture réelle** — `isPlaying === true`,
  `audioCtx.state === 'running'` (démarrage audio effectif, pas seulement l'état).
- **Dé-jargon** : plus de « (backing) » ni « (JSON) » à l'écran.
- **Lien partagé** : boot depuis `#c=…` intact (état chargé + transport visibles).
- **0 défaillance de ressource APP** et **0 exception JS de page** (les échecs réseau polices
  Google / CDN Supabase et le favicon 404 sont exclus — régime proxy connu de l'environnement,
  pré-existant).

## 4. Hors périmètre (déclaré)

- **Mode online à 2 appareils** : reste **mock-vérifié** (câblage broadcast). La synchro live
  demande la prod (egress Supabase 403 en env) — vérif de Jean, inchangée depuis R-6.
- Après merge : Pages doit servir **0.21.0** ; entrée à froid guidée + exemple à l'œil sur
  `equipe.html`, note de porte allégée sur l'accueil.

# Rapport de non-régression — build 0.22.0 (R-6 · `equipe.html` v1.2)

Base : `main` = 0.21.0 (`578639c`, #37 mergée, R-6 v1.1 en prod). Objet : **equipe v1.2** —
guider le mode « En ligne » (présence « qui est là / qui est chef », « le chef lance ») +
préparer une répartition **sans quitter la page** + **franciser « Team Spirit »** (spec
`metronome-refonte-R6-equipe-v1.2-spec.md`). **Zéro moteur** (BUILD seule ligne), fichiers complets.

## 1. Ce qui change

| Fichier | Changement |
|---|---|
| `equipe.html` | **Salle en ligne guidée** : copy « à froid » (ce qu'est un code + 2 pas), champ « Mon nom », bouton « Rejoindre la salle ». **Présence** (Realtime Presence) : à la connexion `track({nom,chef,joueur})`, écoute `presence: sync/join/leave` → **roster vivant** « N dans la salle », ★ chef, ligne de chacun ; garde-fous doux (aucun chef / plusieurs chefs). **« Le chef lance »** : hors salle inchangé ; en salle, bouton réservé au chef (« ▶ Lancer la salle »), sinon **désactivé** + « En attente du chef… (Nom) ». **Éditeur de répartition en page** (`#eqEditCard`) : ± nombre de joueurs (1..6) + un `<select>` par voix (Joueur 1..N / accompagnement) → édite `cfg.joueurs`/`cfg.voix[i].j`, re-render live, **partage + broadcast reflètent l'édition**. Franc. bouton « → La préparer en pratique libre ». i18n EN+PT (clés neuves + francisation, symétrie tenue). |
| `pratiquer.html` | Franc. « Team Spirit » → **« Répartition »** : titre de section, chip du sommaire, renvoi texte du répertoire, dicos EN (`Distribution`) / PT (`Distribuição`). **`id="secTeam"` et l'ancre `#secTeam` inchangés** (liens profonds R-5 + `eqGoTeam` intacts). |
| `index.html` | Note de la porte « Pratiquer » francisée (« … et la répartition d'équipe vivent ici. ») + 2 clés i18n (EN+PT). |
| `moteur/fm-etat.js` | `BUILD` → `metronomefunk-0.22.0` (**seule** ligne moteur ; md5 == 0.10.0, dans la tolérance). |
| `recette-equipe.js` | Mock Realtime étendu (**Presence** : `track`/`untrack`/`presenceState` + events `presence`, aide `_inject`). +14 assertions : **M1–M7** (guidage salle, présence chef ★, arrivée d'un 2ᵉ membre, départ réservé au chef, clic non-chef neutre, avertissement sans chef) ; **N1–N7** (éditeur : selects par voix, ±joueurs, options, réaffectation en place, partage reflété, clamp hors-bornes, 0 « Team Spirit » visible). BUILD 0.22.0. |
| `recette-accueil.js` | `P2.5` note de porte francisée (`… et la répartition d'équipe`) ; BUILD 0.22.0. |
| `recette-onboarding-0.6.7.js` | `3.16` renvoi répertoire → « Répartition ». |
| `recette-apprendre.js`, `recette-pratiquer.js`, `recette-extraction.js` | BUILD 0.21.0 → 0.22.0 (seul changement). |

**Aucune retouche moteur** hors BUILD : `moteur/*.js` reste identique à 0.10.0 à l'octet près
modulo la ligne BUILD — `recette-extraction` : md5 des blocs == référence 0.10.0, tolérances
(BUILD + `accompMuted` ×1 + `feelMs` ×2) inchangées.

## 2. Batterie canonique — 29 suites, 1098 assertions, 0 rouge

Node 24 (jsdom), `NODE_PATH` = node_modules de travail. **Working tree normalisé LF** avant les
recettes (le clone Windows sort en CRLF via `core.autocrlf=true` ; les md5 de référence
d'extraction sont calculés sur du LF — piège CRLF connu). Comptes des suites touchées :

- **equipe** : 53 → **67** (+M1–M7 présence, +N1–N7 répartition/franc.). Les sections M/N tournent
  **avant** l'audit i18n (I) — `fmTr` encore FR, avant le bascule BR de `I6`.
- **accueil** 61 · **apprendre** 70 · **pratiquer** 66 · **extraction** 28 · **onboarding** 35 —
  comptes constants, BUILD + libellés francisés (accueil P2.5, onboarding 3.16) mis à jour.
- **24 autres suites** : compte strictement constant (contenu inchangé). Total **1098**, **0 rouge**
  (exit 0 sur les 29).

Audit i18n strict (equipe) : symétrie EN↔PT, 0 clé orpheline, extraction nœuds texte + attributs
sans manque (zones dynamiques `#eqAssign`/`#eqSalleRoster` exclues, comme `#eqPlayers`). Les
libellés neufs (salle, présence, éditeur) sont couverts EN+PT.

## 3. Navigateur réel (Chromium, serveur local) — 0 erreur applicative

- **Chargement** : `equipe.html` 0 erreur console, tampon **build metronomefunk-0.22.0**.
- **Exemple** : clic « Essayer avec un exemple » → état chargé, transport révélé, **3 joueurs /
  3 voix**, éditeur gréé (3 selects, 4 chips « Je suis… »), bouton chef « ▶ Départ (le chef) ».
- **Éditeur en page** : « + joueur » incrémente (chips + options des selects suivent) ;
  réaffecter une voix met à jour `cfg.voix[i].j` et **le lien de partage reproduit l'édition**
  (`joueurs` + `voix[0].j`).
- **Salle en ligne** : bascule « En ligne (salle) » → carte révélée, **2 pas de guidage**, roster
  **caché tant qu'on n'a pas rejoint**, sous-titre « En direct : le chef fait partir et arrêter ».
- **Francisation** : **0 « Team Spirit » visible** sur `equipe.html`, `pratiquer.html`,
  `index.html` ; `pratiquer` chip + titre = « Répartition » ; porte accueil « … répartition
  d'équipe » ; **`pratiquer.html#secTeam` ouvre toujours la section** (`open`, titre « Répartition »).

## 4. Hors périmètre (déclaré)

- **Mode online à 2 appareils** : présence + départ **mock-vérifiés** (roster, chef, garde-fous,
  broadcast). La synchro **live** demande la prod (egress Supabase 403 en env) — **vérif de Jean**.
- **Nom de section « Répartition »** : défaut proposé pour franciser « Team Spirit » ; Jean peut
  trancher un autre mot au merge (le renommage est purement libellé, `id`/ancres intacts).
- Après merge : Pages doit servir **0.22.0** ; salle en ligne guidée + éditeur de répartition à
  l'œil sur `equipe.html`, francisation « Répartition » sur pratiquer/accueil.

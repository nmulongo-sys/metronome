# Rapport de non-régression — build 0.16.0 (R-4d)

> Chantier **R-4d** (spec `metronome-refonte-R4d-grille-exercice-spec.md`, demande de
> Jean du 17/07, **GO en bloc** le jour même) sur base **R-4c** (branche
> `claude/r4c-demos-avance-artiste`, PR #28 — cette PR est EMPILÉE dessus, précédent
> R-4b/#25 : au merge de #28 elle se réduit d'elle-même aux commits R-4d).
> Environnement : Node v24 (local, Windows), jsdom, clean-room ; navigateur réel
> Chrome headless via playwright-core, **http:// ET file://**.

## 1. Périmètre livré

**La grille d'exercice vivante** sur `apprendre.html` — et rien d'autre :

- **Widget `pf-grille`** posé dans la carte de l'exercice actif, sous la rangée
  Écouter/Charger : une ligne par voix de la variante résolue (`demoFor`), autant de
  cases que de pas (4/8/12/16, séparateur visuel par temps), case sourde = frappe (1),
  case vive = accent (2), légende d'une ligne. **Lecture seule** ; UNE grille à la
  fois ; elle rend le champ `demo` (pas `percGrids`).
- **Pendant l'écoute ET en pratique** (arbitrage Jean 17/07) : « ▶ Écouter » la pose,
  « Charger » la repose aussitôt après avoir retiré la démo — l'élève voit où ses
  frappes doivent tomber pendant qu'il joue sur l'accompagnement. `demoClear` la
  retire (un exercice sans démo déloge donc la grille précédente et ne pose rien).
- **Curseur de pas** : `draw()` d'apprendre (stub vide depuis R-4a) devient une vraie
  boucle rAF, active seulement en lecture avec grille posée. **Phase née correcte**
  (spec §3.3) : `phaseVisuelle(p) = p < 0 ? p + 1 : p` — un reste négatif (fin de
  mesure, le scheduler a déjà basculé `cycleStart`, fenêtre AHEAD = 0,20 s) s'affiche
  comme FIN de mesure, jamais comme un saut anticipé au 1. L'arrêt du transport FIGE
  le curseur. **index.html et pratiquer.html : INTOUCHÉS** (arbitrage Jean 17/07 —
  le calage existant lui convient ; le patron de phase est prêt si R-5 veut l'aligner).
- **Approximations déclarées** (spec §3.4) : le feel (±18 ms) et le swing s'entendent
  mais ne se dessinent pas — grille quantifiée ; un cycle affiché (les structures
  multi-mesures restent sans démo ni grille, liste fermée R-4c).
- **i18n** : la spec §3.5 prévoyait EN/PT systématiques — sans objet constaté :
  `apprendre.html` est FR-seul (aucune infrastructure de dictionnaire sur la page,
  chantier transverse connu du brief R-4b). La légende et les noms de voix suivent le
  français de la page ; ils rejoindront la traduction d'apprendre quand le transverse
  s'ouvrira.
- `moteur/fm-etat.js` : BUILD **0.16.0** (la ligne vivante, seule retouche moteur).

## 2. Moteur : rien — par construction

`recette-extraction.js` (26 assertions) : moteur identique octet pour octet au 0.10.0,
**tolérances INCHANGÉES** (ligne BUILD + les deux retouches R-3b, comptage strict).
Le curseur LIT `audioCtx.currentTime`/`cycleStart`/`cycleDur` — il n'écrit rien.

## 3. Batterie canonique : 28 suites, 983 assertions, TOUT VERT

| Suite | 0.15.0 | 0.16.0 | Note |
|---|---|---|---|
| 27 suites inchangées | 934 | **934** | comptes par suite STRICTEMENT inchangés |
| apprendre | 43 | **49** | +6 (section D2) : grille posée à l'Écouter (lignes/cases/accents), MAINTENUE après Charger, retirée au clear, délogée par un sans-démo, `phaseVisuelle` repliée en pur (−0,05 → 0,95) |
| **Total** | 977 | **983** | zéro adaptation du harnais |

Hors ajout, à compte constant : les 4 suites qui suivent la ligne vivante passent à
0.16.0 (accueil A1.2/A1.3, apprendre, pratiquer, extraction). Piège documenté dans la
suite : le vote de la section C **re-rend le parcours** (`pfVote → pfRender`) — la
section D2 requête la carte FRAÎCHE (les nœuds capturés avant sont périmés).

## 4. Navigateur réel (Chrome headless) — les DEUX modes

**http:// et file:// : 5 vérifications chacun, tout vert (10/10)**, sur apprendre :
build 0.16.0 affiché ; « ▶ Écouter » (T1-01) → grille posée (1 voix, 16 cases,
l'accent du 1) et **curseur qui AVANCE réellement** (deux lectures espacées : pas
0 → 3) ; « Charger » → grille MAINTENUE, démo retirée, **curseur toujours en
mouvement** (4 → 7) ; 0 erreur console applicative. Une capture d'écran de la grille
en lecture (CALL-02, 3 voix : basse/tone/slap, accents, curseur) a été prise pendant
la vérification et montrée à Jean en séance.

## 5. Reste à faire (hors R-4d)

- **Jean** : merge dans l'ORDRE — #28 (R-4c, après ré-écoute P1/P2) puis cette PR
  (elle se retarge d'elle-même) ; vérification Pages/prod ; à l'œil sur la grille
  en prod.
- Toujours ouverts : ménage de branches + PR #13 ; 3 P1 du panel UX ; EN/PT
  d'apprendre (la légende de la grille s'y ajoutera) ; re-run Pages du merge #27
  (dashboard panel encore 404 au moment de ce rapport).
- Ensuite : **R-5** (salve UX + rejeu panel 30 officiel — le patron `phaseVisuelle`
  est disponible si l'alignement des curseurs d'index/pratiquer y est souhaité),
  **R-6** (equipe.html).

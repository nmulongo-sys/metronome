# Rapport de non-régression — build 0.11.0 (R-3a : moteur en fichiers)

**Date : 2026-07-16** · Base : main = 0.10.0 (`7d861f4`) · Chantier : **R-3a** (spec
`metronome-refonte-R3-moteur-pratiquer-spec.md`, GO Jean du 16/07 — découpe en deux sessions
validée) · Environnement : Node v22, jsdom, clean-room (clone frais) ; suites avec
`--max-old-space-size=4096` ; navigateur réel Chromium (serveur statique local **et** `file://`).

## Objet du build

Le moteur quitte la page : **1 034 lignes transplantées VERBATIM** d'`index.html` (10 789 →
9 759 lignes) vers trois fichiers chargés par `<script src>` après les corpus —

| Fichier | Lignes | Contenu (sections 0.10.0) |
|---|---|---|
| `moteur/fm-etat.js` | 158 | CORPUS/FM_ASM (assemblage) + ÉTAT (`S`, `BUILD`, `store`, `$`, `fmToast`) |
| `moteur/fm-audio.js` | 518 | AUDIO (bus, timbres, `playClick`) + CALCUL DU CYCLE + ORDONNANCEUR |
| `moteur/fm-accomp.js` | 358 | GAP (machine unifiée) + BASSE FUNK (registre, `bassRealize`, drop-outs) |

**Iso-fonctionnel strict** : aucun changement visuel ni sonore ; `index.html` ne change que par
le retrait des blocs, les 6 lignes insérées (commentaire + 3 balises) et le numéro de build
(porté par `fm-etat.js` désormais).

## Recadrage documenté (découvert à l'exécution, dans l'esprit de la spec §3.2)

Le script principal du 0.10.0 était **enveloppé dans une IIFE** (`(() => { 'use strict'; … })()`).
Des fichiers séparés ne partagent pas une fermeture : l'enveloppe est **déposée** (2 lignes,
hors des blocs extraits) et les déclarations passent dans la **portée globale partagée** —
c'est précisément ce que le contrat de coquille (spec §3.2) suppose. Vérifications faites :
aucun `return` top-level ; aucune collision de nom (les autres `<script>` de la page sont des
IIFE ou de purs `window.*` ; aucun nom réservé de `window` — `stop` écrase licitement
`window.stop`) ; le mode strict est conservé (directive en tête du script principal et de
chaque fichier moteur). La spec est annotée (v1.2). Par ailleurs le compte de lignes du
0.10.0 cité par la spec (« 11 424 ») était erroné : **10 789** — corrigé.

## Batterie : 24 suites, 868/868 vertes ✅

| Suite | Assertions |
|---|---|
| 19 suites historiques | **746/746** — comptes par suite strictement identiques (20/21/23/15/28/38/21/40/42/44/56/54/85/32/52/22/56/49/48) |
| recette-P7 · recette-P8 | **34/34** · **32/32** |
| recette-corpus (validateur) | **30/30** |
| recette-registre | **9/9** |
| **recette-extraction (nouvelle)** | **17/17** — preuve du verbatim (§ ci-dessous) |
| **Total** | **868/868** |

**Zéro adaptation des suites existantes** : `recette-harnais.chargeHtml()` inlinait déjà tout
`<script src>` local — les fichiers moteur passent par le même chemin que les corpus. Les
assertions `buildStamp` des suites 5-3-bis/5-3-ter/5-4 affichent `metronomefunk-0.11.0` : le
build se charge de bout en bout (corpus + moteur) dans jsdom.

## La preuve du verbatim : `recette-extraction.js` (17/17)

Référence figée : `reference-extraction-0.10.0.json` (empreintes md5 calculées sur le 0.10.0,
`7d861f4`). La recette vérifie : (A) chaque fichier moteur, sous son en-tête, **identique octet
pour octet** à ses blocs d'origine (ancres + nombre de lignes + md5) ; (B) la coquille
identique au 0.10.0 privé des blocs, aux tolérances déclarées près (6 lignes insérées, 2 lignes
d'IIFE, ligne `BUILD` normalisée) ; (C) comptes clos : 1 034 + 9 753 + 2 = 10 789.

## Vérification navigateur réel (Chromium — http:// ET file://)

Console **sans erreur** au chargement et après lecture (seules ressources en échec :
`cdn.jsdelivr.net` et `fonts.googleapis.com`, bloquées par le proxy de l'environnement de
test — externes, identiques sur 0.10.0) ; `BUILD = metronomefunk-0.11.0` ; FM_ASM assemblé
(152 exercices, 44 modules, registre patterns alimenté) ; **4 onglets** du parcours ;
**démarrer/arrêter** pilotés par l'ordonnanceur extrait (bouton, `statusLine`, AudioContext) ;
basse activable (coquille → état `fm-etat`). La validation **à l'oreille** reste celle de Jean
au premier chargement de Pages.

## Livrables

`index.html` (allégé), `moteur/fm-etat.js`, `moteur/fm-audio.js`, `moteur/fm-accomp.js`,
`recette-extraction.js`, `reference-extraction-0.10.0.json`,
`metronome-refonte-R3a-contrat-coquille.md` (annexe : IDs et hooks requis par page),
ce rapport. Le gain mémoire jsdom reste modeste à ce stade, comme prévu au brief (la page
lourde ne se dissout qu'en R-4).

**Total général : 868 assertions vertes, 0 rouge, 24 suites + navigateur réel deux modes.**

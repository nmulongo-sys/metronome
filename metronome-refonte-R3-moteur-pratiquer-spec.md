# Métronome FM — R-3 : moteur en fichiers + `pratiquer.html`

> **Statut : PROPOSITION — spec avant code, Jean tranche (§9).** Rédigée le 2026-07-16.
> Base examinée : **main = 0.10.0** (`7d861f4`, merge de la PR #22 par Jean le 16/07 à 07:34 ;
> déploiement Pages du commit de merge vérifié vert — run `pages-build-deployment` success).
> Chantier **R-3** de la refonte B+ (spec R-1 VALIDÉE, GO global) — après R-2 (0.9.0) et
> P-7/P-8 (0.10.0). Distinct des chantiers P-\* (contenu funk) et des passes moteur (closes).

---

## 0. Préalable — point ouvert n°1 du brief (constaté ce jour)

- **PR #22 MERGÉE** par Jean (2026-07-16 07:34), main = **0.10.0** (`7d861f4`).
- **Pages à jour** : le run `pages-build-deployment` du commit de merge est vert (07:34:51).
  L'accès direct à `github.io` est bloqué par la politique réseau de l'environnement d'exécution ;
  la vérification « version servie » à l'œil reste à faire par Jean au premier chargement.
- **Ménage de branche** : la suppression de `claude/p7-p8-avance-artiste` est refusée à Claude
  par le garde-fou de permissions (même famille que le refus de merge, précédents #20/#21) —
  **à supprimer par Jean** (bouton « Delete branch » sur la page de la PR #22).

## 1. Objet et périmètre — deux sous-chantiers

R-3 couvre quatre choses (brief) : moteur en fichiers, `pratiquer.html` autour de la hiérarchie
J1, mute maître J2, chiffrage du feel moteur. C'est trop pour une session ; découpe proposée :

| | Contenu | Build | Porte de sortie |
|---|---|---|---|
| **R-3a** | Moteur en fichiers (`moteur/fm-etat.js`, `fm-audio.js`, `fm-accomp.js`), transplantation **verbatim** ; `index.html` les charge par `<script src>`. **Iso-fonctionnel strict, aucun changement visuel ni sonore.** | 0.11.0 | 851/851 rejouées + recette d'extraction (§3.4) ; **point d'arrêt honorable** |
| **R-3b** | `pratiquer.html` (scénario 3) : hiérarchie **« Ce que je joue » / « Ce qui m'accompagne »** (J1), **mute maître de l'accompagnement** (J2), **feel basse** (backlog chiffré §5, une ligne moteur additive). `index.html` inchangé fonctionnellement. | 0.12.0 | Non-régression complète + nouvelle suite `recette-pratiquer.js` ; validation à l'oreille et à l'œil par Jean |

Une session, une PR par sous-chantier — le workflow acté s'applique deux fois.

Hors périmètre R-3 (assumé) : `apprendre.html`, accueil « métronome immédiat », peuplement
`demo`, migration `secCours` (→ R-4) ; salve UX C1/C3 et rejeu du panel 30 (→ R-5) ;
mode équipe (→ R-6) ; toute migration i18n ; toute réécriture moteur (interdite).

## 2. État des lieux — le moteur dans le 0.10.0 (cartographie vérifiée)

`index.html` (11 424 lignes) est déjà organisé en sections commentées nettes. Celles qui
constituent le moteur au sens R-1 §3 :

| Section (commentaire en tête) | Lignes 0.10.0 | Contenu | Destination |
|---|---|---|---|
| `CORPUS (R-2)` / `FM_ASM` | 2608–2641 | assemblage des corpus, collisions bloquantes | `fm-etat.js` |
| `ÉTAT` | 2642–2765 | `S`, `BUILD`, variables d'exécution (cycle, gap, basse), `store` (localStorage), `$`, `fmToast` | `fm-etat.js` |
| `AUDIO` | 2841–3221 | `ensureCtx` (bus, limiteur), timbres (`playTone`, `percDrum`…), `playPerc`, `percLayerMuted`, `playClick` | `fm-audio.js` |
| `CALCUL DU CYCLE` | 3222–3281 | `subPositions` (swing), `computeCycle` | `fm-audio.js` |
| `ORDONNANCEUR` | 3736–3812 | `startNewCycle`, `scheduler` (lookahead), `start`/`stop`/`toggle` | `fm-audio.js` |
| `GAP` | 3282–3350 | machine à états gap unifiée, `gapTargets`, `resetGap` | `fm-accomp.js` |
| `BASSE FUNK` | 3351–3639 | lecture registre (`BASS_PATTERNS = FM_ASM.patterns`, l. 3359), `bassRealize`, drop-outs, synchro UI basse | `fm-accomp.js` |

Volume extrait ≈ **1 040 lignes**. Tout le reste (thème, contexte, familles, visualisation,
clave/perc UI, bibliothèque de grooves, team spirit, écran de jeu, archet, wizard, parcours,
i18n UI) est **coquille** et ne bouge pas en R-3a.

Ordre de chargement (dépendances top-level vérifiées) :
`corpus/*.js` → `moteur/fm-etat.js` (consomme `FM_CORPUS`) → `moteur/fm-audio.js` →
`moteur/fm-accomp.js` (consomme `FM_ASM`) → script principal. Scripts classiques, portée
lexicale globale partagée entre balises — **fonctionne en `file://` comme sur Pages, sans
build** (même mécanique que R-2).

## 3. R-3a — moteur en fichiers, verbatim

### 3.1 Méthode

Transplantation **par sections entières, à la ligne près** : chaque fichier `moteur/*.js` est la
copie exacte des blocs listés §2, dans leur ordre d'origine ; `index.html` les remplace par des
balises `<script src>`. Aucune ligne modifiée, ajoutée ou supprimée à l'intérieur des blocs —
c'est le critère R-1 §4.3 étendu du registre à la mise en fichiers : un déplacement, pas une
réécriture.

Seule exception, déjà actée dans son principe : la constante `BUILD` (dans `fm-etat.js`) passe à
`0.11.0` — elle devient **la** source du numéro de build pour toutes les pages à venir.

### 3.2 Le point dur, assumé : le moteur touche au DOM — « contrat de coquille »

Le verbatim a une conséquence qu'il faut regarder en face : `start`/`stop` manipulent
`$('startBtn')`, `$('statusLine')`, `$('percFsPlay')` et appellent des hooks de la coquille
(`wakeLockUpdate`, `atelierRender`, `draw`, `bowReset`, `scriptOnNewMeasure`,
`percOnNewMeasure`, `percResetBreakState`…) ; `computeCycle` lit les grilles de la coquille
(`percGrids`, `claveData`, `percOffsets`, breaks) ; `percLayerMuted` lit `percMuted`,
`percWork`, `tsMuted`. « Purifier » ces appels serait une réécriture — **interdite**.

Proposition : **le moteur garde ses références telles quelles ; toute page qui le charge doit
fournir les IDs et hooks qu'il référence.** C'est le « contrat de coquille », symétrique du
contrat de corpus : l'**annexe de la PR R-3a** en donnera l'inventaire mécanique exhaustif
(relevé par script sur les fichiers extraits : identifiants `$('…')`, fonctions et globals
externes référencés). `pratiquer.html` (R-3b) et `apprendre.html` (R-4) le rempliront
naturellement — leurs coquilles ont ces éléments ou en définissent des stubs inertes.

### 3.3 Harnais de recette : zéro changement

Vérifié : `recette-harnais.chargeHtml()` inline **tout** `<script src>` local (regex générique,
pas limitée à `corpus/`) — les 23 suites fonctionnent sur le build R-3a **sans aucune
adaptation**. Le gain mémoire jsdom espéré reste modeste en R-3 (la page perd ~1 000 lignes) ;
le vrai allègement viendra des pages par scénario (R-4) — conforme au brief (« à constater »).

### 3.4 Preuve du verbatim : la recette d'extraction

Nouvelle suite `recette-extraction.js` : elle **aplatit** le build R-3a par `chargeHtml()`
(les `<script src>` redeviennent du code inline, à leur place exacte) et compare **ligne à
ligne** au `index.html` 0.10.0 de référence. Égalité stricte exigée, modulo exactement deux
tolérances déclarées : (a) la ligne `BUILD`/`BUILD_DATE`, (b) les lignes de jonction des
balises remplacées. Toute autre différence est un échec. C'est le pendant de
`recette-registre.js` en R-2 : la preuve mécanique qu'on a déplacé, pas réécrit.

### 3.5 Non-régression R-3a

23 suites, **851/851, comptes par suite inchangés** + `recette-extraction.js` verte +
vérification en navigateur réel (serveur statique local : 4 onglets, basse, grooves, console
propre, `file://` inclus).

## 4. R-3b — `pratiquer.html`, la pratique libre remise à l'endroit

### 4.1 Hiérarchie J1 : « Ce que je joue » / « Ce qui m'accompagne »

Cas directeur (capture Jean du 16/07 au soir) : « Percussion & indépendance » (*Instrument = ce
que JE joue*) empilé sur « Répertoire de grooves » (*Jouer tout à = ce que l'ACCOMPAGNEMENT
joue*) — deux sélecteurs d'instrument sans hiérarchie. `pratiquer.html` réorganise les sections
**existantes** (aucune fonctionnalité nouvelle, aucun moteur touché) en trois blocs explicites :

1. **« Ce que je joue »** — l'actuel `secPerc` : **l'unique endroit où l'on choisit son
   instrument** (`percInstr`), le séquenceur deux rangées, les modes d'exercice, les mains,
   mes séquences, le plein écran.
2. **« Ce qui m'accompagne »** — sous un en-tête commun portant le **mute maître (J2, §4.2)** :
   la basse funk (`secBass`), les claves (`secClave`), le répertoire de grooves
   (`secRepertoire` — « Jouer tout à » y est re-libellé pour dire ce qu'il fait :
   *l'instrument de rendu de l'accompagnement*, pas le mien).
3. **« Le clic »** — le métronome proprement dit : tempo, swing/placement (`secGroove`),
   coupures (`secGap`), son du clic (`secSon`), routine programmée (`secScript`).

Restent sur `index.html` en attendant leur scénario : Archet (option du mode simple, R-4),
Cours funk/parcours/écran de jeu (R-4), Team Spirit (voir §9.4), bibliothèque partagée Supabase
(§9.4). `index.html` reste **inchangé fonctionnellement** en R-3b : la bascule des usages vers
les pages par scénario est l'affaire de R-4 (accueil) ; d'ici là, `pratiquer.html` est
accessible par lien discret depuis l'en-tête.

Duplication transitoire assumée : la coquille de `pratiquer.html` reprend des blocs de celle
d'`index.html` (CSS, UI perc/basse/répertoire). Cette redondance est **temporaire** (R-4
dissout la page monolithe) et bornée par §9.5 (bibliothèque de grooves en données).

### 4.2 Mute maître de l'accompagnement (J2)

- **Sémantique** : coupe d'un geste **tout ce qui n'est pas le clic** — couches `perc` (toutes
  voix : instrument, claves, répertoire/team) **et** `bass`. Le clic (`beat`/`sub`/`shift`/
  `poly`) continue. Précision Jean intégrée : pas que la basse.
- **Un geste au premier niveau** : bouton permanent dans l'en-tête du bloc « Ce qui
  m'accompagne » **et** rappelé dans la barre de transport (à côté de la sourdine générale),
  `aria-pressed`, état visible en permanence.
- **Superposé, jamais destructeur** : drapeau de session (comme `volMuted`, précédent C15) —
  il n'écrase aucun réglage (`S.bass.on`, mutes de voix, solo/muet team restent intacts) ;
  le lever rend l'accompagnement exactement tel qu'il était. Le **détail par couche en second
  niveau** = les commandes existantes de chaque section, inchangées.
- **Implémentation** : une ligne additive dans `playClick`, symétrique de la ligne
  `S.sound.pulseMuted` existante (l. 3199) : `if (accompMuted && (layer === 'perc' ||
  layer === 'bass')) return;` + le drapeau dans l'état + le câblage UI. Diff moteur : **une
  ligne, additive** — de la même famille que l'indirection des tables (capacité additive
  R-1 §9, jamais une réécriture). Drapeau à zéro ⇒ chemin strictement identique.

### 4.3 Recette R-3b

Nouvelle suite `recette-pratiquer.js` (jsdom sur `pratiquer.html` via `chargeHtml`, qui prend
déjà un fichier en argument) : hiérarchie des trois blocs présente ; sélecteur d'instrument
unique dans la page ; mute maître coupe `perc`+`bass` et épargne le clic ; le lever restitue
l'état antérieur ; feel (§5) appliqué et neutre à zéro. Ordre de grandeur : ~30 assertions.
Et non-régression complète : les suites existantes rejouées sur `index.html` R-3b —
comptes inchangés (la page n'a pas bougé fonctionnellement).

## 5. Feel moteur — le chiffrage demandé (backlog P-7/P-8)

Le vœu : la basse quelques millisecondes devant/derrière la grille (« pour la versatilité »).
Chiffrage réel sur le 0.10.0 :

- **L'infrastructure existe déjà.** Les événements du cycle portent un champ `offMs` que
  l'ordonnanceur applique tel quel (l. 3761 : `t = cycleStart + ev.frac * cycleDur +
  (ev.offMs ? ev.offMs / 1000 : 0)`) — c'est le mécanisme du clic décalé (`S.shift`, l. 3245)
  et il est **déjà exercé par les recettes**. L'ordonnanceur borne par ailleurs tout événement
  à `now + 5 ms` : un offset négatif en bord de cycle est inoffensif.
- **Le point d'accroche est unique** : la recopie des notes réalisées dans `computeCycle`
  (l. 3276). La réalisation (`bassRealize` : swing, drop-outs, densité — tout raisonne en
  `frac`) n'est **pas touchée**.
- **Diff moteur : une ligne, additive** — `events.push({ frac: b.frac, layer: 'bass',
  note: b.note, offMs: S.bass.feelMs || 0 })` + le champ `feelMs: 0` dans `S.bass`.
- **UI** (`pratiquer.html`, section basse) : curseur « Placement — posé ↔ poussé »,
  **−25 … +25 ms**, défaut 0, persisté avec les réglages basse.
- **Non-régression par construction** : à 0, `offMs` vaut 0 ⇒ événements et instants
  strictement identiques (même patron que `swingFollow` à 50 %). Recette : assertions sur
  `offMs` à ±feel et identité à 0.

**Coût total estimé : ~15 lignes dont 1 seule dans le moteur.** Recommandation : l'inclure en
R-3b plutôt que d'ouvrir un chantier dédié — mais c'est une retouche moteur, donc à confirmer
explicitement (§9.6). La validation du rendu reste à l'oreille de Jean (les ms « qui groovent »
ne se prouvent pas en headless).

## 6. Livraison

- **PR R-3a** « R-3a : moteur en fichiers — build 0.11.0 » : `index.html` allégé,
  `moteur/fm-etat.js`, `moteur/fm-audio.js`, `moteur/fm-accomp.js`, `recette-extraction.js`,
  `rapport-nonregression-0.11.0.md`, annexe contrat de coquille. Fichiers complets.
- **PR R-3b** « R-3b : pratiquer.html (J1/J2) + feel basse — build 0.12.0 » :
  `pratiquer.html`, `index.html` (n° de build + lien + la ligne mute maître/feel dans le
  moteur → en fait dans `moteur/*.js`), `recette-pratiquer.js`,
  `rapport-nonregression-0.12.0.md`. Fichiers complets.
- Jean merge lui-même ; ménage de branche et vérification Pages après chaque merge.

## 7. Risques identifiés

| Risque | Parade |
|---|---|
| Découpe qui casse une dépendance top-level entre balises | Ordre §2 vérifié sur 0.10.0 ; recette d'extraction + 851 assertions + navigateur réel (`file://` et serveur) |
| Contrat de coquille implicite → oubli dans une page future | Annexe mécanique (inventaire relevé par script) jointe à la PR R-3a, opposable en R-4 |
| Duplication `index.html`/`pratiquer.html` pendant la fenêtre R-3b→R-4 | Assumée, temporaire, bornée (§9.5) ; toute correction de fond attend R-4 ou se fait des deux côtés explicitement |
| Feel : offset négatif au premier événement du tout premier cycle | Borne `now + 5 ms` existante de l'ordonnanceur (vérifiée) |
| CSP/Pages : rien à changer (fichiers statiques, pas de fetch) | Mécanique identique à R-2, déjà en production |

## 8. Ce que R-3 ne décide pas

Le peuplement `demo` (écoute), l'accueil, la retraite de l'Archet au second niveau, le sort du
panel (rejeu à l'identique en R-5), la traduction P-2→P-8, le mode équipe. Rien dans R-3 ne
préempte ces chantiers.

## 9. Points à trancher par Jean (porte de qualité)

1. **Découpe R-3a / R-3b en deux sessions** (deux PR, builds 0.11.0 / 0.12.0) — OK ?
2. **Contrat de coquille (§3.2)** : le moteur verbatim garde ses références DOM/hooks, chaque
   page fournit ce qu'il référence (annexe mécanique à la PR) — c'est la lecture « déplacement,
   pas réécriture » de la contrainte. OK ?
3. **Nommage** : dossier `moteur/`, fichiers `fm-etat.js` / `fm-audio.js` / `fm-accomp.js`
   (noms de la spec R-1 §3) ; `BUILD` déménage dans `fm-etat.js` — OK ?
4. **Périmètre `pratiquer.html` (§4.1)** : trois blocs proposés ; **Team Spirit** — le laisser
   sur `index.html` (il préfigure le scénario 4, son vrai lieu est `equipe.html` en R-6), ou
   l'embarquer dans « Ce qui m'accompagne » ? **Reco : le laisser sur `index.html`**, une
   migration par page-cible, pas deux. Même question pour la bibliothèque partagée Supabase
   (reco : reste sur `index.html` jusqu'à R-4).
5. **Bibliothèque de grooves** (l. 4323–6875, ~2 500 lignes de **données** dans la coquille) :
   `pratiquer.html` en a besoin (répertoire). **Reco : l'extraire en fichier de données**
   (`corpus/repertoire-grooves.js` ou registre dédié) en tête de R-3b, prouvée par recette
   d'égalité valeur pour valeur (même patron que R-2) — sinon on duplique 2 500 lignes.
   Alternative : duplication brute temporaire. Trancher.
6. **Retouches moteur additives** : la ligne mute maître dans `playClick` (§4.2) et la ligne
   feel dans `computeCycle` (§5) — deux lignes, deux drapeaux neutres par défaut, non-régression
   par construction à zéro. Compatibles avec la contrainte verbatim au sens R-1 §9 (« capacités
   additives = petits chantiers ponctuels ») ? OK pour les inclure en R-3b ?
7. **Plage du feel** : −25 … +25 ms, défaut 0, persisté — OK ? (à recalibrer à l'oreille.)
8. **CSS de `pratiquer.html`** : copie élaguée embarquée dans la page (pages autonomes, reco —
   c'est l'esprit « fichiers complets ») ou premier fichier `.css` partagé ? Trancher.

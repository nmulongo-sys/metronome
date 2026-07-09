# Métronome FM — README dev

Métronome pédagogique du Portail Formation Musicale. **Application HTML fichier unique**, offline,
sans dépendance JS, français, mobile-first. Livraison toujours en **fichier complet, jamais un patch**.

## Lancer / prévisualiser

```bash
# ouvrir directement
xdg-open metronome.html            # ou double-clic ; ?theme=clair|sombre

# preview servie (recette machine)
python3 -m http.server 8731        # → http://127.0.0.1:8731/metronome.html
```

**Headless (recette machine)** : l'app est une **IIFE** → on la pilote **par le DOM** (dispatch d'événements
sur les sélecteurs/boutons, pas d'accès aux fonctions internes). Un `.click()` synthétique **ne démarre pas**
l'audio (geste non « trusted ») ; `statusLine` est mis à jour par le scheduler en lecture, échantillonnable ;
canvas/`requestAnimationFrame` figés à l'arrêt. Le thème passe par l'attribut `data-fm-theme` + variables
`--fm-*` (transition CSS 0,5 s : une lecture immédiate du fond après bascule est trompeuse).

## Anatomie du fichier

Tout est dans `metronome.html` :

| Zone | Repère |
|---|---|
| `<style>` | jusqu'à la fin du bloc en tête ; variables `--fm-*`, classes `.step`, `.perc-voice`, `.ts-*` |
| bootstrap thème | petit `<script>` avant l'IIFE (lit `?theme=`, applique avant peinture) |
| markup UI | carte **écran de jeu** `#playScreen` (visible en mode Jouer), sections `<details class="section">` (clave, percussion, **team spirit**, archet…), overlays `#wizOverlay` (assistant) et `#playSetup` (écran d'accueil) |
| app | grand `<script>` en IIFE `(() => { 'use strict'; … })()`, divisé par des commentaires `// ==== NOM ====` |

Sections JS principales : `ÉTAT` (l'objet `S`), `AUDIO`, `CALCUL DU CYCLE`, `GAP`, `BASSE FUNK (passe 5)`, `ORDONNANCEUR`,
`VISUALISATION`, `CLAVE MULTI-VOIX`, `PERCUSSION & INDÉPENDANCE`, `TEAM SPIRIT & RÉPERTOIRE`,
`ÉCRAN DE JEU (passe 4, étape 4.1)`, `DSL PÉDAGOGIQUE`, `WIZARD`, `INIT`.

## Modèle percussion (passe 3)

L'identité de timbre est **portée par la voix**, pas par un global :

```js
percGrids[voix]   = [0|1|2, …]          // 0 silence · 1 frappe · 2 accent
percOffsets[voix] = [-0.45..0.45, …]    // micro-timing par pas
percMuted[voix]   = bool
percMeta[voix]    = { instr, voiceKind, freq? }   // clé de routage audio = instr + '.' + voiceKind
```

- `playPerc(t, voix, accent)` route sur `percMeta[voix].instr + '.' + voiceKind` → plusieurs instruments
  simultanés. Repli sur le focal `S.perc.instr` si une voix n'a pas de méta (= comportement passe 2).
- `rebuildPercMeta()` reconstruit `percMeta` à chaque changement du jeu de voix ; toute reconstruction de
  `percGrids` passe par `buildPercGrids()`. Une voix **hors instrument focal** (participants) est préservée.
- `computeCycle()` itère `percGrids` et empile les `events` (triés par `frac`) pour le scheduler.
- `percLayerMuted(layer, voix, brk)` = **seul** point de décision de mute (voix, appel-réponse, team spirit).

Timbres = `PERC_INSTR` (`djembe, cajon, dunduns, agogo, surdo, recoreco`), styles `PERC_STYLES`,
breaks `PERC_BREAKS`, bibliothèque de grooves `GROOVES` (28 grooves, 6 familles ; voix avec
`instr/voiceKind/role/grid`, drapeaux `approx`/`uncertain`/`isBreak`).

## Modules « Répertoire de grooves » + « Team Spirit » (étape 4, scindés rév. 2026-07-07)

Deux sections UI distinctes (`secRepertoire`, `secTeam`), un seul objet d'état `TS` ; voix
namespacées **`ts.<voix>`**. Le répertoire est utilisable **sans** team spirit.

- **Répertoire** (`secRepertoire`) : `tsLoadGroove()` — charge un `GROOVES[*]`, résout chaque voix vers
  une clé de routage **valide** par tessiture (`tsResolve` + `TS_SUB`), aligne la famille (`setFamily`),
  injecte via `tsSyncGrids()`. `tsApplyOverride()` rejoue tout le groove sur l'instrument choisi
  (rôle → voiceKind). Contient `#tsVoices` (voix + mini-grilles, menus d'assignation si TS.on) et `#tsStatus`.
- **Team spirit** (`secTeam`) : `TS.participants`, assignation `voix.participant`,
  `tsAutoDistribute()` — glouton équilibrant la **charge de frappes** (voix triées par frappes
  décroissantes → participant le moins chargé ; départage : diversité de tessiture, puis nombre de voix),
  solo/mute branchés dans `percLayerMuted` via `tsMuted()`. La carte de chaque participant affiche sa
  **ligne rythmique** (libellé + mini-grille par voix assignée, `.ts-pline`) ; export JSON
  `tsExportParticipant()` / `tsExportAll()`.
- **Qui joue quoi ?** (étape 5, dans `secTeam`) : classement des lignes par glisser-déposer
  (`TS.order`, `#tsRank`), `tsWizDistribute()` attribue les lignes **entières** dans l'ordre de
  priorité sous contrainte deux mains (`tsPlayableSet`, même règle que `tsFingerConflicts`),
  multi-instruments en dernier recours ; les lignes écartées (`v.dropped`) passent en
  **backing track** (`TS.backing`) ou en sourdine, sans grille séquenceur.
- **Doigtés impossibles** : `tsFingerConflicts()` — 2 mains identiques (ou > 2 frappes) au même pas pour un
  participant, via `percHandsFor`.

Points d'ancrage moteur (minimaux) : `tsSyncGrids()` en fin de `buildPercGrids`, `tsMuted()` dans
`percLayerMuted`, `tsProgressBump()` dans `percOnNewMeasure`. Hors chargement de groove, tout est no-op
(non-régression passe 2).

## Écran de jeu (passe 4, étape 4.1)

Le **mode simple recomposé** : le seg d'en-tête devient **▶ Jouer / Configurer** (Configurer =
l'actuel mode expert, inchangé). En mode Jouer, la carte `#playScreen` montre **ma ligne en grand**.

- **État** : `S.play = { who: 'solo'|<participantId>|'tous', learn, learnPaused, n, showBacking }`,
  persisté (`fm-metro-play`), restauré par `playRestore()` à l'init. `learn`/`learnPaused` sont
  posés dès 4.1 (mémorisés à l'accueil) et seront exploités par l'apprentissage en 4.2.
- **Écran d'accueil** (`#playSetup`, `openPlaySetup`) : 2 choix — seul / à plusieurs (N 2–12) et
  apprentissage oui/non. Ouvert au premier lancement (aucun `fm-metro-play`), rouvrable via
  **⟲ Setup**. Il remplace l'ouverture automatique de l'assistant (✦ Assistant reste manuel).
  À la validation, groove chargé → `tsWizDistribute()` immédiat (déterministe : même groove +
  même N + même classement = même répartition sur chaque appareil) ; sans groove → les
  participants sont créés (ids `p1…pN`, déterministes) pour le sélecteur.
- **Rendu** (`playLineRender`, chaîné en fin de `percLineRender` — même chemin de mise à jour) :
  `playMine()` détermine MES voix selon `S.play.who` — participant : ses voix ; solo : tout
  l'assigné (proposition « Répartir selon priorités (1 joueur) » affichée tant que la répartition
  manque, spec §3.3) ; tous : toutes les voix non écartées, mains par joueur (`tsMergedMap`) ;
  répertoire libre : tout ; sans groove : les voix audibles du **focal**. Mes briques :
  `.pl-brick.mine`, pleine couleur, hauteur double (20 px), **main D/G inscrite dans la brique**
  (doigté = `tsHandsMerged`, phrase fusionnée). Le reste, **lignes écartées comprises** :
  `.pl-brick.back`, opacité 0,25, masquable par « Voir l'accompagnement » (`#playScreen.no-back`,
  CSS pur — **l'audio ne dépend jamais de cet affichage**, il reste piloté par `tsMuted`).
  Légende réduite à mes voix ; curseur temps réel = motif existant, piloté par `draw()`.
- **Réutilisation stricte** : `tsWizDistribute`, `tsHandsMerged`, `tsMergedMap`, `plVoiceList`
  (constructeur voix + couleurs extrait de `percLineRender`, partagé). Aucune nouvelle logique
  musicale.

## Persistance (localStorage)

| clé | contenu |
|---|---|
| `fm-theme` | `clair` \| `sombre` |
| `fm-metro-mode` | `simple` \| `expert` |
| `fm-metro-context` | strate affichée |
| `fm-metro-family` | `bin` (16) \| `tern` (12) |
| `fm-metro-perc-presets` | `{ nom: {instr, count, grids, offsets, muted} }` |
| `fm-metro-progress` | `{ instr: { break: 1..4, guide: n } }` — progression par niveau (étape 4) |
| `fm-metro-play` | `{ who, learn, learnPaused, n, showBacking }` — écran de jeu (4.1) ; absent = premier lancement → écran d'accueil |
| `fm-metro-wizard-done` | posé quand l'assistant est utilisé (depuis 4.1 il ne s'ouvre plus automatiquement — l'écran d'accueil le remplace) |

Les participants / assignations team spirit vivent en mémoire ; l'export JSON « ma ligne » est le vecteur
de partage.

## Étendre

- **Nouveau timbre** : ajouter une ligne au `switch` de `playPerc` (`instr.voiceKind`) + entrée `PERC_INSTR`
  (+ option `#percInstr`). Réutiliser `percDrum`/`percSnap`/`percBell`/`percScrape` avant d'écrire un
  générateur.
- **Nouveau groove** : ajouter un objet au tableau `GROOVES` (schéma §5.1 de `metronome-passe3-spec.md`),
  `grid.length === count`.
- **Substitution instrument** : compléter `TS_SUB[instr]` (rôle → voiceKind valide).

## Journal de développement

### 2026-07-09 — Passe 5 étape 5.1 : synthèse basse funk (theOne, déterministe)
- **Synthèse maison** (section `AUDIO`, zéro échantillon) : `bassFinger` (triangle + sub sinus,
  enveloppe de filtre passe-bas), `bassSlap` (corps + transitoire de bruit passe-haut = claquement
  du pouce), `bassPop` (saw, enveloppe de filtre rapide = le « tiré »), ghost = doigté court/bas/mat.
  Routeur `playBass(t, note)` par articulation. Audibilité de E1 (~41 Hz) sur HP Android portée par
  les harmoniques du triangle/saw — **critère d'oreille**, à valider.
- **Nouvelle couche `layer:'bass'`** dans le pipeline existant : `computeCycle` empile
  `{frac, layer:'bass', note:{freq,art,gain,dur}}` (famille binaire seulement, v1) ; l'ordonnanceur
  passe `ev.note` à `playClick` (argument **additif**, non-cassant) qui route vers `playBass`.
- **Section `BASSE FUNK (passe 5)`** : gabarits d'intentions 16 pas `{i,deg,art,w,lvl}` (5.1 :
  `theOne` seul), progression `vamp1` seule, résolveur chromatique `key`+degré→fréquence
  (fondamentale repliée dans la tessiture E1–D2, table 12 tonalités). `bassRealize()` réalise la
  mesure courante **déterministe** (piliers `w=1` + pas `w≥0.5`, aucun RNG → le probabiliste vient
  en 5.2). Ancrage : `bassOnNewMeasure()` dans `startNewCycle` (indépendant de `S.perc.on`, ≠ hook
  `percOnNewMeasure` qui court-circuite si la percussion est éteinte), amorçage `bassResetCycle()`
  dans `start()`.
- **État `S.bass`** (forme complète de la spec §2 posée dès 5.1 ; 5.1 exploite `on/pattern/prog/key`),
  persistance `fm-metro-bass`, restauration `bassRestore()` à l'INIT.
- **UI** : section `<details id="secBass">` autonome (Configurer) — activer la basse, gabarit,
  tonalité (12). Écran de jeu : rien encore (→ 5.4).
- **Recette** `recette-5-1.js` (jsdom + stubs Web Audio/canvas, pilotage DOM, hook de diagnostic
  `window.fmMetroBass()` calqué sur `window.fmMetroAudio`) : **20/20** — no-op si off, fracs
  `[0, .375, .5, .875]` (pas 10 `w=0.4` exclu), articulations finger/ghost/finger/ghost,
  déterminisme bit-à-bit, résolveur E1=41,203 Hz + transposition E→F, garde famille binaire,
  persistance.
- **Reste à régler à l'oreille** (Android) : timbres de basse et audibilité du grave.

### 2026-07-09 — Passe 5 validée : spec « Basse funk » (accompagnement génératif)
- **Spec `metronome-passe5-basse-spec.md` validée (rév. 2)** : voix de basse électrique funk
  générée à la volée, accompagnement des parcours cajón/djembé (principe FUNK-I2). Tone.js et
  échantillons **écartés** (zéro dépendance, fichier unique) : synthèse Web Audio maison
  (`bassFinger`/`bassSlap`/`bassPop`, ghost dérivé), nouvelle couche `layer:'bass'` dans le
  pipeline `computeCycle → events → playClick`.
- **Modèle** : gabarits d'intentions 16 pas `{deg, art, w, lvl}` réalisés une fois par mesure
  (`bassRealize`, déterministe si `vary:false`) ; 3 profils de vélocités (plat/mixte/contraste)
  + **adaptation continue au tempo** (gain ghost, durée, densité d'ornementation — les piliers
  `w=1` ne bougent jamais) ; **6 progressions harmoniques** (vamp JB, I7→IV7, dorien, mixo,
  blues 12, jazz-funk) × **12 tonalités** (défaut E, entraînement de l'oreille) ; drop-outs via
  la machine gap ciblée (`layer==='bass'`), hors `tsMuted`.
- **Découpe en 4 étapes** (une par session) : 5.1 synthèse + `theOne` déterministe + `secBass`
  minimale ; 5.2 générateur probabiliste + densité + vélocités/tempo ; 5.3 progressions +
  tonalités + accord courant affiché ; 5.4 drop-outs + commandes écran de jeu + swing des 16es.
- **Workflow ajouté** : à chaque fin d'étape, livrer un md combiné **brief de reprise + README
  à jour**, terminé par la reconduction de la consigne pour l'étape suivante.

### 2026-07-08 — Étape 4.1 : écran de jeu (setup, briques en grand, « Je suis »)
- **Écran d'accueil** (`#playSetup`) au premier lancement : seul / à plusieurs (N) +
  apprentissage oui/non, mémorisé (`fm-metro-play`), rouvrable via **⟲ Setup**. Remplace
  l'ouverture automatique de l'assistant (✦ Assistant reste accessible manuellement).
- **Écran de jeu** (`#playScreen`, mode simple recomposé ; seg d'en-tête relabellé
  **▶ Jouer / Configurer**, contenu expert inchangé) : mes briques pleine couleur, hauteur
  double, **main D/G inscrite dans la brique** (`tsHandsMerged`, phrase fusionnée) ; le reste —
  **lignes écartées comprises** — en accompagnement atténué (opacité 0,25), masquable
  (« Voir l'accompagnement », affichage pur : l'audio reste piloté par `tsMuted`). Sélecteur
  **« Je suis : Solo | Participant 1…N | Tous »** (« Tous » = toutes les lignes pleine couleur
  avec mains, validé sur maquette) ; sans groove chargé, ma ligne = les voix du focal.
  Curseur temps réel = motif existant. Solo + groove sans répartition → proposition
  « Répartir selon priorités (1 joueur) » (spec §3.3).
- **État** : `S.play = { who, learn, learnPaused, n, showBacking }` persisté/restauré ;
  `learn`/`learnPaused` posés dès 4.1, exploités en 4.2. Participants restaurés déterministes
  (`p1…pN`) ; la répartition se refait en rechargeant le même groove (`tsWizDistribute`
  déterministe). Un `who` orphelin retombe sur Solo, de façon persistée.
- **Réutilisation stricte** : `tsWizDistribute`, `tsHandsMerged`, `tsMergedMap` ; extraction de
  `plVoiceList()` (voix + couleurs) partagée entre `percLineRender` et `playLineRender`, ce
  dernier chaîné en fin de `percLineRender` (même chemin de mise à jour). Aucune nouvelle
  logique musicale.
- **Recette headless** (jsdom + stubs, `recette-4-1.js`) : 43/43 — restauration `fm-metro-play`,
  briques/légende filtrées selon `who` (samba N=2 de référence : P1 = primeira + caixa
  → 14 briques, P2 = segunda + tamborim → 7, « Tous » → 21), loi du doigté fusionné vérifiée
  sur les briques rendues (paire = D+G, singles alternés), bascule accompagnement (classe
  `no-back`, briques conservées au DOM), écartées visibles backing ON/OFF, focal 7 briques
  sans groove, accueil au premier lancement, expert intact. Restent à l'œil/l'oreille sur
  Android : lisibilité des mains à 16 pas sur petit écran, hauteur de la ligne de jeu,
  position de ⟲ Setup si la barre déborde.
- **Choix documentés** : main toujours inscrite **dans** la brique (à ≥ 1/16 de largeur une
  lettre tient ; le repli « au-dessus » et la césure 8+8 sont reportés en 4.3) ; à la
  validation de l'accueil avec groove chargé, la répartition est exécutée immédiatement
  (pas seulement proposée) — la proposition ne subsiste que pour un groove chargé après coup.

### 2026-07-08 — Doigté fusionné par joueur ; jouabilité imposée partout
- **Cause des lignes injouables** (constatées en capture : kick-D et charley-D au même pas) :
  (1) « Répartir auto » n'appliquait aucune contrainte de jouabilité ; (2) le doigté était
  calculé **par voix** (alternance indépendante) puis superposé — collisions D-D artificielles
  et verdicts « impossible » à tort.
- **Nouveau modèle** : `tsHandsMerged(voices)` doigte la **phrase fusionnée** d'un joueur
  (frappes de toutes ses voix en ordre chronologique, règle de mains courante, paire
  simultanée = D+G). Seule impossibilité physique restante : > 2 frappes au même pas
  (`tsPlayableSet` simplifié en conséquence).
- **Appliqué partout** : cartes participants, liste des voix du répertoire (`tsMergedMap`),
  vérificateur de doigtés (message « N frappes demandées … impossible à deux mains »),
  exports JSON « Ma ligne » et « Exporter tout ». « Répartir auto » impose désormais la
  jouabilité comme le questionnaire : ce qui ne tient nulle part est écarté (backing/sourdine),
  jamais empilé.
- Recette : boom bap 4 voix tenu par 1 joueur sans collision (conforme au jeu réel au cajón) ;
  samba 1 joueur passe de 2 à 3 lignes couvertes, 2 joueurs de 3 à 4 ; cas à 3 frappes
  simultanées toujours détecté.

### 2026-07-07 — La ligne de briques montre ce qui sonne ; classement fiabilisé
- **Briques** (`percLineRender`) : la ligne affichait toujours les voix du focal — donc, groove
  du répertoire chargé, elle montrait le focal muet et cachait le groove audible. Corrigé :
  voix `ts.*` quand un groove est chargé, voix focales sinon, clave dans les deux cas, chaque
  voix filtrée par l'audibilité réelle (`percMuted` + `tsMuted` : sourdine focale, mute/solo
  participants, backing). Légende alignée. Recette : focal 7 briques → samba 41 → backing OFF 9
  → déchargé 7.
- **Glisser-déposer du classement** : réécrit avec écouteurs `pointermove`/`pointerup` au niveau
  `document` (motif robuste, l'ancien passait par `setPointerCapture` sur la poignée — défaillant
  en usage réel, cause non reproduite en headless). Ajout de flèches ↑/↓ de secours sur chaque
  ligne, garanties quel que soit le navigateur.

### 2026-07-07 — Étape 5 : « Qui joue quoi ? » (priorités, deux mains, backing track)
- **Classement des lignes** : glisser-déposer (pointer events, tactile) dans `#tsRank`,
  ordre conservé dans `TS.order` (gids), initialisé à l'ordre du groove au chargement.
- **Distribution par priorités** (`tsWizDistribute`) : dans l'ordre du classement, chaque ligne
  est attribuée **entière ou pas du tout** au meilleur joueur pouvant encore la tenir.
  Oracle `tsPlayableSet` = règle de `tsFingerConflicts` : à chaque pas, ≤ 2 frappes, jamais
  deux fois la même main (dépend donc de la règle de mains courante, alternance ou directrice).
  Cumul multi-instruments **pénalisé** : un joueur déjà sur le même instrument est toujours
  préféré ; instrument différent = dernier recours. Nombre de joueurs libre (`#tsWizN`),
  1 joueur = jeu individuel.
- **Backing track** : les lignes écartées faute de bras sont jouées par l'app si `#tsBacking`
  est coché (drapeau `v.dropped` + `TS.backing` dans `tsMuted`), en sourdine sinon ; elles
  s'effacent pendant un solo. Affichées **sans grille séquenceur** (badge « backing track » /
  « écartée · sourdine ») ; une réassignation manuelle lève le drapeau.

### 2026-07-07 — Correctifs post-délégation Sonnet (module étape 4)
- **Scission de section** : « Team Spirit & répertoire » devient deux sections — `secRepertoire`
  (famille, groove, charger/décharger, « Jouer tout à », voix, statut) et `secTeam` (participants,
  répartition, doigtés, exports). IDs et écouteurs inchangés ; le choix de groove et d'instrument
  est désormais accessible hors team spirit, conformément au modèle « répertoire libre ».
- **Bug — lignes individuelles invisibles** : `tsRefresh` ne rendait que les libellés des voix dans
  les cartes participants. Ajout du rendu `.ts-pline` (libellé + chip rôle + chip instrument de jeu
  + `tsMiniGrid`) pour chaque voix assignée. CSS : `.ts-part` passe en `flex: 1 1 320px`.
- **Bug — répartition disproportionnée** : l'ancien `tsAutoDistribute` (round-robin global par
  tessiture) équilibrait le nombre de voix mais pas la charge — ratios max/min de frappes mesurés
  jusqu'à 21:1 (trap), 8:1 (reggae). Remplacé par un glouton (voix triées par frappes décroissantes
  → participant le moins chargé, départage tessiture puis nombre de voix). Ratios après correctif
  ≤ 1,8 sauf cas structurels à voix indivisibles (ex. [8,4,1,1] pour 3 participants → 4,0, optimum).
- Recette headless : chargement jsdom sans erreur, mini-grilles présentes dans chaque carte,
  charge mesurée sur les 28 grooves.

## Discipline & docs

- Spec d'abord, **une étape = une session**, fichier HTML complet. Aucune IA à l'exécution (moteur de règles
  embarqué). Grilles ouest-africaines encodées `uncertain` — à valider à l'oreille.
- Specs/recettes : `metronome-passe5-basse-spec.md`, `metronome-passe4-spec.md`, `metronome-passe3-spec.md`, `metronome-passe3-etape{1..4}-recette.md`,
  `metronome-passe2-spec.md`, corpus `grooves-*.md` + `convert-grooves.py`.

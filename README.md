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
percMeta[voix]    = { instr, voiceKind, freq?, rank? }   // clé de routage audio = instr + '.' + voiceKind
```

### Rang de registre `rank` (chantier A, 2026-07-11)

Chaque voix porte un **rang de registre** `rank` : sa position sur l'échelle grave→aigu,
`0` = plus grave, croissant vers l'aigu (un rang élevé = son aigu = palier haut sur
l'instrument cible). C'est une **donnée de rangement**, pas de la logique musicale ; elle
sera consommée par le futur encart (chantier B) pour projeter les frappes sur les paliers
d'un instrument (djembé 3 paliers, cajón 3, cajón + cymbalette 4). **Ne pas confondre avec
`TS.order` / `tsRank*`**, qui est la *priorité de répartition* entre joueurs, sans rapport
avec le registre.

- `voiceRank(src, idx)` résout le rang par **repli à trois niveaux**, sans jamais d'état cassé :
  1. `rank` explicite présent (voix maison `PERC_INSTR`, voix clave) → utilisé ;
  2. voix reconnue → table `REGISTER_RANK` par `voiceKind`/`origKind` (précis), puis par `role`
     (grossier) — c'est ainsi que les ~150 voix de `GROOVES` sont rangées sans taguer chacune ;
  3. voix totalement inconnue → **ordre de déclaration** (sa position `idx` dans la liste).
- `plVoiceList()` attache `rank` à chaque voix renvoyée (maison, Team Spirit, clave) ; c'est la
  surface principale de consommation. `tsSyncGrids()` recopie aussi `rank` dans `percMeta` des
  voix `ts.*` (surface moteur).
- Rangs maison verrouillés : djembé basse 0 / tone 1 / slap 2 · dunduns dundunba 0 / sangban 1 /
  kenkeni 2 / cloche 3 · surdo grave 0 / marcante 1 · cajón & agogô grave 0 / aigu 2 · reco-reco 2.
  Clave grave 2 / aiguë 3 (provisoire). Table : `basse/grave/dundunba`→0, `marcante/sangban/tone`→1,
  `kenkeni/slap/aigu`→2, `cloche`→3 ; `role` `basse/medium/aigu`→0/1/2.
- **Consommé par le chantier B** (livré, build 0.6.0) : `voicePalier(rank, T)` = **clamp absolu**
  du rang sur `[0, T−1]` (OPTION A). La normalisation des rangs « à trous » est donc tranchée
  en faveur du **registre honnête** : un couloir reste vide si le groove ne l'utilise pas
  (cajón médium), et les rangs au-dessus de `T−1` se collent au palier haut (agogô aigu 2→1,
  reco-reco 2→0). Limite assumée : une voix en repli niveau 3 (rang = ordre de déclaration)
  se colle au palier haut — quasi nul en pratique (les voix `GROOVES` résolvent en 0..3).

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
| `fm-metro-bass` | `S.bass` complet (passe 5) : `{ on, pattern, prog, key, density, vel, vary, legato, space, swingFollow, drop:{on, everyN, lenBeats} }` |
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


### 2026-07-11 — Chantier B (finition) : curseur temps réel sur `fingerViz`

Finition du chantier B, branchée depuis `main`. Referme le point laissé ouvert par B.1
(« statique v1 ») : l'encart `fingerViz` porte désormais un **curseur temps réel**, piloté par
la **même `phase`** que le curseur de la ligne de jeu (`#playLine`). **Aucune logique musicale
ni audio nouvelle**, projection Option A inchangée — pur rebranchement.

- **Repère partagé** : les pastilles `.fv-hit` sont posées à `left = frac*100 %` (`frac = i/n`
  sur la mesure) ; le curseur reprend `phase ∈ [0,1]` sur la même mesure → alignement natif avec
  les pastilles et avec `#playLine`, sans nouveau calcul de temps.
- **Un curseur par piste** : `fingerVizRender()` injecte un `<i class="fv-cursor">` en fin de
  chaque `.fv-track` (recréé à chaque render, jamais orphelin). Les libellés faisant tous ≤ 70 px,
  toutes les pistes démarrent au même x → les segments empilés se lisent comme une **ligne continue**
  (curseur présent **même dans un couloir vide**, cajón médium).
- **Pilotage** : `fingerVizCursor(phase)` appelée dans `draw()` (bloc `mode-simple`, juste après le
  curseur `#playLine`, à côté de `bassPulseCheck`). Affiche + positionne si l'encart n'est pas
  `.hide` ; sinon **masque** les curseurs. `drawStatic()` les masque à l'arrêt (cohérent avec
  `#playLine`).
- **CSS** `.fv-cursor` : barre 2 px pleine hauteur de piste, `--fm-ink` à 50 %, `display:none` par
  défaut.
- **Couche d'action de recette** `window.fmMetroFvCursor` (distincte du hook lecture seule
  `fmMetroReg`) : expose `fingerVizCursor` pour piloter le curseur headless comme le fait `draw()`.
- **Recette** `recette-chantier-B2.js` **22/22** : un `.fv-cursor` par `.fv-track` (djembé 3 /
  agogô 2 / reco 1) ; positionnement `left = phase*100 %` (0 / 0.25 / 0.5 / 1) ; continuité du
  cajón (médium vide porte le curseur) ; gating (encart `.hide` ⇒ curseurs cachés, réaffichage ⇒
  de nouveau pilotables) ; survie au re-render (aucune accumulation d'orphelins).
  **Non-régression 258/258** — chantier-B 52 + 8 recettes passe 5 (5-1 20 · 5-1-bis 21 · 5-2 23 ·
  5-3 38 · 5-3-bis 15 · 5-3-ter 28 · 5-3c 21 · 5-4 40). Contrôle de syntaxe du JS inline OK.
- **Estampille** `metronomefunk-0.6.1 · 2026-07-11`.
- **Validé à l'œil (Android)** : encart `fingerViz` rendu, pastilles visibles, build `0.6.1` confirmé
  à l'écran (après purge du cache Pages — le déploiement traînait sur `0.5.4`). **Reste ouvert** :
  variante cajón + cymbalette (dépend de l'accessoire cimbalette, non tranché) ; extension éventuelle
  de la table `REGISTER_RANK` niveau 2.

### 2026-07-11 — Chantier B.1 : encart `fingerViz` (projection sur paliers)

Premier chantier post-passe-5, branché depuis `main`. **Encart `fingerViz`** : projette chaque
frappe de **MA ligne** (écran de jeu) sur les **paliers de l'instrument cible** (le focal
`S.perc.instr`), du grave (bas) vers l'aigu (haut). Consomme le champ `rank` posé par le
chantier A ; **aucune logique musicale ni audio nouvelle** (le moteur, `tsHandsMerged` et la
synthèse ne sont pas touchés).

- **Paliers par instrument** (`INSTR_TIERS`) : djembé 3 (basse/tone/slap), cajón 3
  (grave/médium/aigu), dunduns 4 (dundunba/sangban/kenkeni/cloche), agogô 2, surdo 2,
  reco-reco 1. Instrument inconnu → repli 3. La variante **cajón + cymbalette (4 paliers)**
  attend l'accessoire cimbalette réel (non tranché) — **hors table** tant que non décidé.
- **Projection `voicePalier(rank, T)` — OPTION A (validée)** : `clamp(rank, 0, T−1)`. Honnête
  sur le registre — laisse un couloir **vide** si le groove ne l'utilise pas (cajón médium),
  clampe au palier haut les rangs qui dépassent (agogô aigu rang 2 → palier 1 ; reco-reco
  rang 2 → palier 0). **Limite latente assumée** : une voix tombée en repli niveau 3 (voix
  totalement inconnue, rang = ordre de déclaration) se colle au palier haut — quasi nul en
  pratique (les ~150 voix `GROOVES` résolvent en 0..3 par table).
- **Encart** `#fingerViz` dans `#playScreen`, sous `#playLine` : un couloir par palier,
  **aigu en haut → grave en bas**, libellés propres à l'instrument (repli grave/médium/aigu),
  repères colorés **par voix** (accent = liseré `--fm-ink`). Rafraîchi via `fingerVizRender()`
  chaîné en fin de `playLineRender()` (**même chemin de mise à jour** que la ligne de jeu).
  **Statique v1** (curseur temps réel reporté). **Masqué** (classe `hide`) si ma ligne est vide.
- **Doctrine respectée** : la **basse funk** (`layer:'bass'`, hors `plVoiceList`/`percGrids`)
  n'est **jamais** projetée — vérifié en recette (activer la basse ne change pas l'ensemble
  projeté, aucun couloir « basse funk » ajouté).
- **Hook `fmMetroReg`** (lecture seule, esprit `fmMetroBass`) : `tiers` / `palier` / `labels` /
  `rankOf` / `mapping` / `build`.
- **Recette** `recette-chantier-B.js` **52/52** : table `INSTR_TIERS`, clamp Option A (rangs
  0..5, T=2/3/4, plancher/plafond), libellés, projection djembé (basse→0/tone→1/slap→2),
  changements d'instrument (agogô/reco clampés, couloir médium vide honnête du cajón),
  robustesse `palier ∈ [0, T−1]` tous instruments, exclusion basse, masquage si vide.
  **Non-régression 206/206** — 8 recettes passe 5 vertes (5-1 20 · 5-1-bis 21 · 5-2 23 · 5-3 38 ·
  5-3-bis 15 · 5-3-ter 28 · 5-3c 21 · 5-4 40). **Retouche documentée** : estampille génériquée
  au motif `metronomefunk-\d+\.\d+` dans 5-3-bis/-ter/-3c/-4 (le bump `0.6.0` sort du motif
  `0.5.x` — même nature que les génrifications d'estampille des étapes 5.3c/5.4).
- **Estampille** `metronomefunk-0.6.0 · 2026-07-11` (nouvelle ligne post-passe-5). Contrôle de
  syntaxe du JS inline OK.
- **À valider à l'œil (Android)** : lisibilité des couloirs sur petit écran, hauteur de l'encart,
  ordre aigu-en-haut. **Reste ouvert** : curseur temps réel sur `fingerViz` ; variante cajón +
  cymbalette (dépend de l'accessoire cimbalette) ; extension éventuelle de la table niveau 2.

### 2026-07-11 — Fusion : passe 5 (basse funk) refermée sur `main`

Fusion de la branche `metronomefunk-0.5.4` (fin de passe 5) dans `main`, qui portait déjà
i18n FR/EN/PT/BR, export libre et le rang de registre (chantier A). `index.html` fusionné
**sans conflit** — basse et rang de registre occupent des zones disjointes du fichier ; seul le
journal du README a été réconcilié (les deux historiques conservés).

- **Non-régression** : 8 recettes de la passe 5 rejouées sur l'arbre fusionné — **206/206**,
  zéro échec (5-1 20 · 5-1-bis 21 · 5-2 23 · 5-3 38 · 5-3-bis 15 · 5-3-ter 28 · 5-3c 21 · 5-4 40).
- **Basse = instrument de référence (métronome musical)** : c'est bien un instrument, doté du **registre le plus grave** — mais **on ne l'imite jamais avec les instruments cibles**. Elle sert d'accompagnement sur lequel l'élève se **verrouille** (FUNK-I2), pas d'une ligne à reproduire sur le cajón/djembé. Concrètement, elle est exclue de la **projection des frappes sur les paliers d'un instrument cible** (chantier B, machinerie `REGISTER_RANK`/`voiceRank`) et de la **répartition entre joueurs** (`tsRank`) ; elle n'entre ni dans `percMeta` ni dans `percGrids`. Elle garde son témoin propre + l'accord courant affiché.
- **`main` devient la version de référence** portant à la fois la percussion (passes 1–4 + rang
  de registre) et la basse funk générative (passe 5 complète).

### 2026-07-11 — Chantier A : champ `rank` de registre sur les voix

Ajout d'un **rang de registre `rank`** (grave→aigu, `0` = plus grave) sur **toutes** les voix —
maison (`PERC_INSTR`) et répertoire (`GROOVES`/Team Spirit) — pour préparer l'encart du chantier B
(projection des frappes sur les paliers d'un instrument cible). **Aucune logique musicale nouvelle** :
le moteur audio et `tsHandsMerged` ne sont pas touchés ; `rank` s'ajoute au seul modèle de voix.

- **Données** : `rank` explicite posé sur chaque voix de `PERC_INSTR` (djembé 0/1/2, dunduns 0/1/2/3,
  surdo 0/1, cajón & agogô 0/2, reco-reco 2) et sur `CLAVE_VOICES` (2/3, provisoire).
- **Résolveur** : nouveau `voiceRank(src, idx)` à **repli 3 niveaux** (explicite → table
  `REGISTER_RANK` par `voiceKind`/`role` → ordre de déclaration). Les ~150 voix de `GROOVES` sont
  rangées par table (elles portent déjà `voiceKind`+`role`), sans tag manuel voix par voix.
- **Diffusion** : `plVoiceList()` attache `rank` à chaque voix (maison/TS/clave) ; `tsSyncGrids()`
  recopie `rank` dans `percMeta` des voix `ts.*`.
- **Nommage** : `rank` de registre distinct de `TS.order`/`tsRank*` (priorité de répartition) —
  documenté pour éviter toute confusion en reprise.
- **Recette headless** : 36 assertions vertes (chaque voix maison/clave/groove obtient un rang fini,
  valeurs verrouillées du brief, niveau 2 sur samba batucada, repli niveau 3, priorité de l'explicite).
  Contrôle de syntaxe du JS inline OK.
- **Reste ouvert (chantier B)** : normalisation des rangs à trous (extrêmes vs collés) ; extension
  éventuelle de la table niveau 2 ; l'encart visuel `fingerViz` lui-même.

### 2026-07-10 — Passe 5 étape 5.4 : drop-outs, écran de jeu, swing des 16es (fin de passe)
- **Drop-outs de maintien du time** (§6 de la spec de passe) : la basse se tait sur les
  `lenBeats` **derniers temps** de chaque période de `everyN` mesures et **re-rentre sur
  The One** (FUNK-T1) — percussion, clave et pulsation continuent. **Écart assumé avec la
  lettre du §4.4** (spec `metronome-passe5-5-4-spec.md` §2.1, validé) : la machine gap est
  granulaire à la mesure et mono-cible → le drop est une **fonction pure de `measureCount`**
  dans `bassRealize` (zéro état nouveau, machine gap intouchée d'un octet, gap utilisateur
  cumulable avec le drop). Les queues legato qui déborderaient dans le trou sont
  **raccourcies au bord** (plancher 20 ms) : le silence reste net malgré le legato 5.3c.
  À l'arrêt (`measureCount = 0`), jamais de trou.
- **Swing des 16es** (`S.bass.swingFollow`, FUNK-T3) : pas impairs décalés à
  `(i−1+2·sw)/16` — même formule par paires que `subPositions` — **avant** le test de
  drop (le trou s'évalue sur la position réellement sonnée). `sw = 50 %` ⇒ identité
  stricte : non-régression des recettes antérieures par construction.
- **Écran de jeu** : ligne « Basse : activer · densité · drop-outs · ♪ accord »
  (`#playBassGroup`), synchro **bidirectionnelle** avec `secBass` (mêmes champs d'état,
  `bassPlayRefresh`). La pastille d'accord fait office de **témoin d'activité** (§5 de la
  spec de passe, dernier morceau non livré) : elle pulse sur chaque frappe via la boucle
  rAF du curseur (`bassPulseCheck` — au moment sonné, pas au scheduling en avance de
  lookahead). Groupe grisé/désactivé en famille ternaire (basse binaire v1).
- **`secBass`** : ligne drop-outs (période 1–32 mesures, trou 1–8 temps) + case « La basse
  suit le swing » ; hint réécrit (la mention « étape suivante » disparaît). i18n : la
  section basse entière reste hors dictionnaires EN/PT — précédent établi depuis 5.1,
  assumé, à traiter en lot dans une passe dédiée.
- **Persistance** : les champs dormants `drop`/`swingFollow` (présents dans `fm-metro-bass`
  depuis 5.0) deviennent actifs — **aucune migration**, garde-fous de bornes/types dans
  `bassRestore` (everyN 1–32, lenBeats 1–8, booléens coercés).
- **Diagnostics** `fmMetroBass` : `setMeasure(n)` (pose le compteur de mesures, même esprit
  que `setRng`) et `cycleEvents()` (comptes d'événements par couche) pour la recette.
- **Recette** `recette-5-4.js` **40/40** : défauts & no-op strict 5.3c, trou/périodicité/
  re-entrée/arrêt, clamp au bord (0,25 temps exact), drop × swing sur position swinguée,
  couches beat/sub/perc intactes pendant le trou, machine gap non réquisitionnée,
  persistance + bornes, synchro écran de jeu dans les deux sens, grisage ternaire,
  estampille. **Non-régression 7 recettes vertes** ; retouche documentée : estampilles
  génériquées passe 5 (`0\.5\.`) dans 5-3-bis/-ter/-c — le build avance à chaque étape,
  le motif exact `0\.5\.3x` ne matchait plus.
- **Vérification navigateur** (preview mobile 375×812) : aucun débordement horizontal,
  wrap propre du groupe basse, synchro réelle, grisage ternaire (opacité 0,45), animation
  `bassPulse` définie. Estampille `metronomefunk-0.5.4 · 2026-07-10`. Branche
  `metronomefunk-0.5.4` (depuis `metronomefunk-0.5.3c`). **Fin de la passe 5** — reste
  ouvert : validation à l'oreille du legato 5.3c (défaut L=1,25 et haut de course) et des
  drop-outs/swing 5.4.

### 2026-07-10 — Passe 5 étape 5.3c : recalibrage du curseur legato (verdict d'écoute)
- **Nomenclature** : à partir de cette étape, les suffixes latins (bis/ter/quater) cèdent la
  place aux lettres — 5.3c succède à 5.3-ter. Les artefacts déjà livrés gardent leurs noms.
- **Verdict d'écoute** (HP de bureau, 92 BPM) sur 5.3-ter : le bout droit du curseur (L=1 :
  finger 1,30 · release 180 ms/×0,50) était le **minimum** acceptable de legato — « c'était
  bien mais il ne fallait pas moins ». Toute la course couvrait une zone inutilisable.
- **Recalibrage** (spec `metronome-passe5-5-3c-spec.md`, dosages tranchés en session) :
  la fenêtre glisse d'un cran vers le lié — **`L = 1 + fraction` ∈ [1, 2]**, mêmes droites
  -ter prolongées. **Plancher (curseur 0) = ancien max -ter** (finger 1,30 · rel ×0,50),
  **défaut curseur 25** (L=1,25 : finger 1,40 · rel 210 ms/×0,55), **plafond L=2**
  (finger 1,70 · slap 1,74 · pop 1,80 · rel 300 ms/×0,70). Libellé UI : « Détaché ↔ lié »
  → **« Lié ↔ très lié »** (le pôle détaché n'existe plus, par décision d'oreille).
  Ghost hors curseur (0,35), tirage/fracs/bus/limiteur/corps : intacts.
- **Stockage inchangé** (`S.bass.legato` = fraction 0–1, clé `fm-metro-bass`) : aucune
  migration — toute valeur héritée de -ter est relue comme position et atterrit
  mécaniquement dans la zone validée (ex. 0,5 → L=1,5).
- **Retouches documentées** (les dosages -ter figés en recette sont recalibrés par
  construction) : `recette-5-3-ter.js` — blocs [1]/[2] alignés sur la nouvelle fenêtre
  (le bloc [2] passe de « continuité 5.3-bis » à « plancher = ancien max -ter strict »),
  estampille génériquée (`0\.5\.3`) ; `recette-5-3-bis.js` (3e retouche) — attendus de [1]
  alignés sur le plancher 1,30/> stepDur (l'état -bis strict n'est plus atteignable),
  invariant anti-staccato d'origine (> 100 ms) conservé, estampille génériquée sans tiret
  (`0\.5\.3-` ne matchait pas `c`). Assertions mécaniques, ghost, bus, persistance : intactes.
- **Recette** `recette-5-3c.js` **21/21** : défaut 25/L=1,25 sur état vierge, plancher
  bit à bit = ancien max -ter (durées + release sur l'automation), plafond L=2, monotonie
  stricte sur toute la course, ghost constant, persistance en fraction + héritage sans
  migration, estampille, limiteur/bus toujours câblés. Non-régression : 5-1 (20), 5-1-bis
  (21), 5-2 (23), 5-3 (38) **inchangées** ; 5-3-bis (15) et 5-3-ter (28) vertes avec les
  seules retouches ci-dessus. Recettes exécutées en local (Node 22 portable + jsdom).
- **À valider à l'oreille** : le défaut L=1,25 (léger cran au-dessus du son validé) et le
  haut de la course. Estampille `metronomefunk-0.5.3c`. Branche `metronomefunk-0.5.3c`
  (depuis `metronomefunk-0.5.3-ter`, `7a54a0a`).

### 2026-07-10 — Passe 5 étape 5.3-ter : basse legato & respiration
- **Curseur « détaché ↔ lié »** (`#bassLegato`, 0–100, défaut 50 ; `S.bass.legato` persisté) —
  un seul geste pilote **deux** paramètres : les **durFill** des notes structurantes
  (finger 0,90→1,10→1,30 · slap 0,82→1,05→1,28 · pop 0,80→1,05→1,30 ; à L ≳ 0,25 la queue
  déborde sur l'attaque suivante = le liant) et le **release** (60 ms/×0,30 → 180 ms/×0,50 :
  la note s'éteint au lieu de se couper). **L=0 = 5.3-bis strict** (continuité prouvée en
  recette). **Ghost hors curseur** (0,35, toujours piqué) ; fracs et déterminisme intacts —
  le curseur ne touche jamais le tirage.
- **Corps soutenu** : le sweep de l'exciteur ne se referme plus pendant la tenue — descente
  vers un **palier** (`floor + 0,35 × (ceil − floor)` à `dur×0,5`), maintien, fermeture vers
  le plancher pendant le release seulement ; `bodyGain` 0,30 → 0,38 (ghost 0,22 → 0,28).
  Cible : écart attaque→corps mesuré ~6 dB → ~3-4 dB.
- **Bus basse** (créé au premier `bassVoice` — no-op strict si la basse reste coupée) :
  voix → `bassBus` → **high-pass 35 Hz** (E1 = 41,2 Hz jamais touché, la boue sub-sonique
  part) → chemin sec + **réverb courte** (`ConvolverNode`, impulsion générée : bruit ×
  décroissance expo ~0,35 s, 2 canaux décorrélés, **wet 0,12**) → master. Case
  **« Espace »** (`#bassSpace`, cochée par défaut, persistée) : décochée → wet 0.
  Percussions jamais routées dans ce bus (netteté du métronome).
- **Limiteur de bus master** (obligatoire — chevauchement + release + réverb s'additionnent,
  +3 dBFS mesuré à 82 BPM) : `DynamicsCompressor` quasi-brickwall `masterGain → limiteur →
  destination` — seuil −1,5 dB, knee 0, ratio 20:1, attaque 3 ms, release 120 ms. Pas de
  sidechain (il casserait la référence rythmique). Défensif : si `createDynamicsCompressor`
  ou `createConvolver` manquent (stubs headless), chemins directs — aucune recette antérieure
  modifiée dans sa mécanique.
- **Hook `fmMetroBass`** enrichi : `bus()` (limiteur, bassBus, HP, wet — diagnostic seul).
  Estampille `metronomefunk-0.5.3-ter`.
- **Recette** `recette-5-3-ter.js` **28/28** (stubs enrichis : AudioParam enregistreurs,
  compressor/convolver présents, connexions tracées) : chevauchement au défaut, continuité
  L=0, ghost constant aux trois positions, limiteur paramétré et câblé sans contournement,
  HP 35 Hz, wet 0,12/0, routage exclusif de la voix dans le bus, non-régression fracs/
  déterminisme/tempo/plancher, persistance, estampille. Non-régression : 5-1 (20), 5-1-bis
  (21), 5-2 (23), 5-3 (38) **inchangées** ; `recette-5-3-bis` (15) : **2 retouches
  documentées** — curseur legato ramené à 0 en tête (défensif, no-op sur un build -bis) car
  ses dosages testés sont ceux de L=0, et estampille génériquée (`0.5.3-`), assertions
  musicales intactes.
- **À valider à l'oreille (HP de bureau)** : dose du liant au défaut, douceur du release,
  présence du corps, discrétion de la traîne, absence de pompage du limiteur. Branche
  `metronomefunk-0.5.3-ter` (depuis `metronomefunk-0.5.3-bis`).


### 2026-07-09 — Passe 5 étape 5.3-bis : corps / tenue de la basse (anti-staccato) + estampille de build
- **Diagnostic mesuré** (enregistrement WAV de la basse isolée, 92 BPM) : la basse ne sature pas
  (crête −5,2 dBFS, zéro écrêtage — le +3 dBFS du mix venait des percussions), mais chaque note
  ne dure que ~15 ms audibles, soit **9 % d'une double-croche** (163 ms à 92 BPM) → « extrême
  staccato ». Cause : enveloppe en **pluck-vers-zéro** (`exponentialRampToValueAtTime(0.0001, t+dur)`,
  attaque puis mort), aggravée par une durée plafonnée en dur.
- **Enveloppe refondue** (`bassVoice`) : attaque → petite décroissance vers un **niveau de tenue**
  (`sus = 0.78 × pic`) → **maintien** de ce niveau (le corps de la note) → **release** bref borné
  (≤ 60 ms). La note existe pendant toute sa durée au lieu de s'éteindre aussitôt. Le piqué, quand
  on le veut, vient maintenant de la **durée** (ghost court), pas de la forme.
- **Durée calée sur la subdivision** : plafond absolu `dm[1]` retiré ; `dur = stepDur × fill × durTempo`
  avec `fill` par articulation (`finger 0.90`, `slap 0.82`, `pop 0.80`, `ghost 0.35`) et plancher
  audible 20 ms. finger/slap/pop tiennent l'essentiel du pas (léger détaché, pas d'empiètement sur
  le pas suivant) ; ghost reste piqué. L'adaptation tempo (§2.3) est conservée.
- **Estampille de build** : constante `BUILD` (+ `BUILD_DATE`) affichée dans l'en-tête (`#buildStamp`)
  — sert à savoir de quel build vient un enregistrement de validation. À bumper à chaque passe.
- **Recette** `recette-5-3-bis.js` **15/15** (+ non-régression `5-1` **20/20**, `5-1-bis` **21/21**,
  `5-2` **23/23**, `5-3` **38/38**) : durée finger ≈ 0,90 × stepDur × facteur tempo et < stepDur ;
  ghost < finger ; monotonie tempo + plancher 20 ms ; fracs et déterminisme intacts ; les 4
  articulations se synthétisent sans exception ; estampille renseignée. **La forme de tenue
  (le sustain) reste un critère d'oreille** — le headless prouve la durée, pas le corps ressenti.
- **Ensuite** (non fait ici) : présence de la basse sur mobile (niveau + bas-médium/exciteur) et
  limiteur de bus master contre l'écrêtage percussion — à réécouter après ce correctif d'enveloppe.
  Branche `metronomefunk-0.5.3-bis` (depuis `metronomefunk-0.5.3`).

### 2026-07-09 — Passe 5 étape 5.3 : progressions harmoniques + tonalités
- **`BASS_PROGS` peuplé des 6 progressions** (§2.4) : `vamp1` (I⁷, James Brown), `vamp2` (I⁷→IV⁷,
  Sex Machine), `dorien` (i⁷→IV⁷, Chameleon), `mixo` (I⁷→♭VII, rock-funk mixolydien), `blues`
  (12 mesures), `jazzfunk` (ii⁷→V⁷). Une barre = `{deg, quality}` ; le degré fixe la fondamentale
  (`CHORD_ROOT_SEMI`, déjà complet depuis 5.1), la **qualité n'est qu'un libellé d'affichage**.
- **Blues 12 mesures** développé de la notation comprimée `I7-IV7-I7-V7-IV7-I7` en blocs
  I(4)·IV(2)·I(2)·V(1)·IV(1)·I(2) → `I I I I IV IV I I V IV I I`. La fondamentale change aux
  **mesures 5, 9, 11** (+ 7 et 10). `bassBarIdx` (posé dès 5.1) avance la barre par mesure et boucle.
- **Nom d'accord** : `PC_NAME` (pc→nom) + `bassChordName(key, chord)` composent racine + suffixe
  de qualité (`E7`, `Em7`, `F#m7`, `D`…). `bassUpdateChordLabel()` met à jour `#bassChord` — en
  lecture, l'accord de la mesure courante ; à l'arrêt/basse coupée, la **tête** de la progression
  dans la tonalité choisie (l'élève voit d'avance ce qu'il aura).
- **UI `secBass`** : sélecteur **Progression** (`#bassProg`, 6 options) + **affichage de l'accord**
  courant (`#bassChord`). Listener `bassProg` (reprend la progression au début), rafraîchissement de
  l'accord sur changement de progression/tonalité/activation ; `bassRestore`/`bassPersist` gèrent
  `prog` avec garde-fou (`vamp1` par défaut). Report sur l'écran de jeu → 5.4.
- **Hook `fmMetroBass`** enrichi (diagnostic, prod inchangée) : `currentBar()` (lecture sans
  mutation), `newMeasure()` (avance d'une mesure = même mutation que le scheduler), `chordName()`.
- **Limite latente notée** : `DEG_SEMI['3']` est une tierce **majeure** fixe ; sans effet en 5.3
  (aucun gabarit n'utilise le degré `3`), à traiter si un gabarit mineur arrive (dorien/jazzfunk).
- **Recette** `recette-5-3.js` **38/38** (+ non-régression `recette-5-1.js` **20/20**,
  `recette-5-1-bis.js` **21/21**, `recette-5-2.js` **23/23**) : vamp1 déterministe intact ; 6
  progressions valides + wrap de boucle ; blues → séquence des 12 fondamentales et changements
  5/9/11 ; transposition E→G ⇒ mêmes fracs, fréquences ×2^(3/12) ; libellés d'accord (E7, Em7,
  F#m7, D, A7, G7).
- **À valider à l'oreille (Android)** : rendu des progressions et de la transposition (le headless
  prouve la mécanique harmonique, pas le goût). Branche `metronomefunk-0.5.3` (depuis
  `metronomefunk-0.5.2`).

### 2026-07-09 — Passe 5 étape 5.2 : générateur probabiliste + densité + vélocités + tempo
- **`bassRealize()` devient génératif** sans casser le déterminisme 5.1. Deux chemins :
  `vary=false` reproduit **exactement** 5.1 (piliers `w=1` + pas `w≥0.5`, aucun RNG) ; `vary=true`
  **tire** chaque pas non-pilier selon sa proba `w` via `bassRng()`. Les **piliers ne sont jamais
  tirés** (toujours joués) — l'ancre et The One restent.
- **Densité 1/2/3** par filtre `lvl` : un pas n'existe qu'à `S.bass.density ≥ h.lvl`. Emboîtement
  strict `1 ⊂ 2 ⊂ 3`, piliers (`lvl 1`) constants (vérifié sur `ghostPendule` : 2 ⊂ 4 ⊂ 8 pas).
- **Profils de vélocité** (`bassVelShape`, §2.2) : écart des gains autour de l'ancre « normal »
  (finger ≈ 0.7). `plat` comprime (×0.35, lisible débutant) · `mixte` = identité · `contraste`
  élargit (×1.4, poche accents/ghosts). Gain borné `[0.02, 1]`.
- **Adaptation continue au tempo** (§2.3), après le profil `vel`, `k = clamp((BPM−70)/80, 0, 1)` :
  durée `×1.15 → ×0.70` (legato lent → sec rapide) ; gain des ghosts `≈0.30 → 0.16` (facteur
  `1.20 → 0.64` sur la base mixte 0.25) ; proba des pas non-piliers `×1.20 → 0.65` (la ligne se
  dépouille en montant). **Piliers immuables** (ni tirés, ni allégés en présence). Valeurs de la
  spec figées comme définitives — pas de réglage d'oreille possible ici, la recette est le garde-fou.
- **3 gabarits restants** ajoutés à `BASS_PATTERNS` : `syncopeGrave` (FUNK-B3, grave décalé autour
  du 1), `octaves` (pompe fondamentale/octave disco-funk), `ghostPendule` (FUNK-D1, nappe de 16es +
  piliers, densité strictement emboîtée). Sélecteur de gabarit UI étendu.
- **UI `secBass`** : ajout densité (3 crans), profil de dynamique, case **Variations (jeu vivant)** ;
  listeners + persistance (`bassRestore` reflète et garde `density/vel/vary`). Écran de jeu → 5.4.
- **RNG injectable** : `bassRng` (module) = `Math.random` en prod ; le hook `fmMetroBass().setRng(fn)`
  permet à la recette d'injecter un générateur déterministe (mulberry32) et `setRng(null)` restaure
  le défaut. Aucune mutation nouvelle en prod.
- **Recette** `recette-5-2.js` **23/23** (+ non-régression `recette-5-1.js` **20/20**,
  `recette-5-1-bis.js` **21/21**) : déterminisme `vary=false` intact ; densité emboîtée + piliers
  constants ; à 150 vs 70 BPM gain ghost, durée et nombre de pas non-piliers décroissants (RNG
  constant 0.5) ; reproductibilité à graine fixe ; `vary=false` n'appelle jamais le RNG (RNG qui
  jette ⇒ aucune exception) ; les 3 gabarits réalisent des notes valides.
- **À valider à l'oreille (Android)** : rendu des profils de dynamique et de la respiration au tempo
  (le headless prouve la mécanique, pas le goût). Branche `metronomefunk-0.5.2` (depuis
  `metronomefunk-0.5.1-bis`).

### 2026-07-09 — Passe 5 étape 5.1-bis : audibilité de la basse sur HP Android (exciteur harmonique)
- **Problème** (retour utilisateur) : en E, `theOne` joue des fondamentales à ~41–62 Hz, sous le
  plancher de restitution d'un haut-parleur de téléphone → basse quasi inaudible. Cause : `bassFinger`
  reposait sur un **triangle** (harmoniques impaires seules, 1/n²) + un **sous-octave sinus à ~20 Hz**
  (inaudible), et le passe-bas redescendait à 120 Hz, étranglant les 3f–8f porteuses.
- **Refonte synthèse** (aucune note changée — fracs/degrés/articulations/déterminisme intacts) : les
  trois fonctions `bassFinger`/`bassSlap`/`bassPop` fusionnent en **une voix paramétrée
  `bassVoice(t, freq, vol, dur, opt)`**. Deux branches sommées : *corps* sawtooth (toutes harmoniques,
  1/n) filtré doux pour la vraie fondamentale (bons HP/casque) ; *exciteur harmonique* =
  `WaveShaperNode` (courbe tanh légèrement asymétrique, 2048 pts, `oversample:'4x'`) → passe-bas à
  **plancher relevé** (~600–900 Hz) qui préserve les harmoniques que le petit HP restitue. On exploite
  la **fondamentale virtuelle** : l'oreille reconstruit le grave à partir de ces harmoniques, et le même
  « growl » porte le caractère funk. **Sous-octave 20 Hz retiré.**
- **`opt` par articulation** (`BASS_ART_OPT` : drive, plafond/plancher de brillance, attaque, gains
  corps/exciteur, transitoire slap) — **valeurs fixes ici**, points de départ à régler à l'oreille.
  5.2 modulera ces `opt` par `vel`/tempo (la brillance = le même levier), d'où le choix de poser la
  voix paramétrée dès maintenant.
- **Sonde** : `window.fmMetroBass().probeVoice(art, t)` ajoutée au hook diagnostic (self-contained :
  `ensureCtx()` idempotent + `playBass` ; aucune mutation d'état ; en prod, joue une note de contrôle).
- **Recettes** : `recette-5-1.js` **20/20 inchangée** (non-régression logique : la recette ne touche pas
  la synthèse). Nouveau `recette-5-1-bis.js` **21/21** (smoke-test : 4 articulations construites sans
  exception, WaveShaper câblé + courbe 2048 + `4x`, corps sawtooth présent, plus aucun triangle ni
  oscillateur < 30 Hz, fracs `[0, .375, .5, .875]` intactes).
- **À valider à l'oreille (Android)** : timbres, dosage du growl, audibilité effective du grave ; ajuster
  `BASS_ART_OPT` au besoin. Branche `metronomefunk-0.5.1-bis` (depuis `metronomefunk-0.5.1`).

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
- Specs/recettes : `metronome-passe5-5-3-ter-spec.md`, `metronome-passe5-basse-spec.md`, `metronome-passe4-spec.md`, `metronome-passe3-spec.md`, `metronome-passe3-etape{1..4}-recette.md`,
  `metronome-passe2-spec.md`, corpus `grooves-*.md` + `convert-grooves.py`.

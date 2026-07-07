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
| markup UI | sections `<details class="section">` (clave, percussion, répertoire, team spirit, archet…) |
| app | grand `<script>` en IIFE `(() => { 'use strict'; … })()`, divisé par des commentaires `// ==== NOM ====` |

Sections JS principales : `ÉTAT` (l'objet `S`), `AUDIO`, `CALCUL DU CYCLE`, `GAP`, `ORDONNANCEUR`,
`VISUALISATION`, `CLAVE MULTI-VOIX`, `PERCUSSION & INDÉPENDANCE`, `TEAM SPIRIT & RÉPERTOIRE`,
`DSL PÉDAGOGIQUE`, `WIZARD`, `INIT`.

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
- **Jeu de voix ACTIF** (fusion rév. 2026-07-07) : `percActiveVoices()` = les voix du groove chargé
  (`ts.*`) si `TS.loaded`, sinon les voix de l'instrument focal. Tout ce qui édite/affiche/exerce
  consomme cette liste : `buildPercRowsInto`, `percWorkVoices`, `percVoiceLabel`, `percBaseFor`,
  `percGuideBuild`, `gapTargetRefresh`, `percLineRender`.
- `rebuildPercMeta()` reconstruit `percMeta` à chaque changement du jeu de voix ; toute reconstruction de
  `percGrids` passe par `buildPercGrids()` (qui appelle `tsSyncGrids()` **avant** le rendu des rangées).
- `computeCycle()` itère `percGrids` et empile les `events` (triés par `frac`) pour le scheduler.
- `percLayerMuted(layer, voix, brk)` = **seul** point de décision de mute (voix, appel-réponse, team spirit).

Timbres = `PERC_INSTR` (`djembe, cajon, dunduns, agogo, surdo, recoreco`), styles `PERC_STYLES`,
breaks `PERC_BREAKS`, bibliothèque de grooves `GROOVES` (28 grooves, 6 familles ; voix avec
`instr/voiceKind/role/grid`, drapeaux `approx`/`uncertain`/`isBreak`).

## Modules « Répertoire de grooves » + « Team Spirit » (étape 4-5, **fusion** rév. 2026-07-07)

Deux sections UI (`secRepertoire`, `secTeam`), un seul objet d'état `TS` ; voix namespacées
**`ts.<voix>`**. Le répertoire est utilisable **sans** team spirit.

- **Fusion (proposition A)** : `tsLoadGroove()` **déverse** le groove dans le jeu focal. Ses voix
  deviennent les rangées du séquenceur de la section Percussion ; `percGrids[id]` référence **le même
  tableau** que `TS.voices[].grid` (et `percOffsets[id]` ↔ `v.offsets`) — éditeur de pas, micro-timing,
  curseur, gap ciblé, plein écran et exercices s'appliquent au répertoire. Plus de `#tsVoices` :
  l'assignation aux participants vit dans le classement (`#tsRank`), les grilles dans le séquenceur.
- **Exercices sur le groove** : ajout progressif / soustraction / appel-réponse fonctionnent tels quels
  (la « base » = grille d'origine du groove, `v.orig`, restaurée par « Groove de base » = `tsResetGrids`).
  **Progression guidée** généralisée : ordre pédagogique = `enterOrder` du corpus (l'ordre d'entrée des
  voix dans l'ensemble), puis le temps. **Break conditionné** : les phrases `PERC_BREAKS` appartiennent
  à l'instrument focal → option désactivée tant qu'un groove est chargé.
- **Cycle de vie** : changer d'instrument/style focal, charger un preset « Mes séquences » ou passer
  par le wizard **décharge proprement** (`tsUnloadSilent()` dans `percSetInstr`/`applyPercStyle`) ; les
  grilles focales de l'utilisateur survivent au chargement/déchargement d'un groove. La famille
  (16 bin / 12 tern) suit le groove au chargement.
- **Répertoire** (`secRepertoire`) : sélecteurs famille/groove, `tsApplyOverride()` (« Jouer tout à »)
  rejoue tout le groove sur l'instrument choisi (rôle → voiceKind via `tsResolve` + `TS_SUB`), fiche
  du groove chargé (`#tsInfo` : origine, contexte, tempo min–max, bouton **tempo jam**), `#tsStatus`.
- **Team spirit** (`secTeam`) : `TS.participants`, assignation par ligne dans le classement,
  `tsAutoDistribute()` (glouton équilibrant la charge de frappes), solo/mute branchés dans
  `percLayerMuted` via `tsMuted()`. Cartes participants avec ligne rythmique (`.ts-pline`,
  mini-grilles **live** grâce aux tableaux partagés) ; export JSON `tsExportParticipant()`/`tsExportAll()`.
- **Qui joue quoi ?** (étape 5) : classement par glisser-déposer (`TS.order`, `#tsRank`),
  `tsWizDistribute()` attribue les lignes **entières** dans l'ordre de priorité sous contrainte deux
  mains (`tsPlayableSet`), multi-instruments en dernier recours ; lignes écartées (`v.dropped`) →
  **backing track** (`TS.backing`) ou sourdine, badge dans le classement.
- **Doigtés impossibles** : `tsFingerConflicts()` — 2 mains identiques (ou > 2 frappes) au même pas
  pour un participant, via `percHandsFor`.

Points d'ancrage moteur (minimaux) : `tsSyncGrids()` en tête de `buildPercGrids`, `tsMuted()` dans
`percLayerMuted`, `tsProgressBump()` dans `percOnNewMeasure`, `tsUnloadSilent()` dans
`percSetInstr`/`applyPercStyle`. Hors chargement de groove, tout est no-op (non-régression passe 2).

## Persistance (localStorage)

| clé | contenu |
|---|---|
| `fm-theme` | `clair` \| `sombre` |
| `fm-metro-mode` | `simple` \| `expert` |
| `fm-metro-context` | strate affichée |
| `fm-metro-family` | `bin` (16) \| `tern` (12) |
| `fm-metro-perc-presets` | `{ nom: {instr, count, grids, offsets, muted} }` — percussion focale uniquement |
| `fm-metro-progress` | `{ instr: { break: 1..4, guide: n } }` — progression par niveau (étape 4) |
| `fm-metro-wizard-done` | l'assistant ne s'ouvre plus automatiquement |

Les participants / assignations team spirit vivent en mémoire ; l'export JSON « ma ligne » est le vecteur
de partage.

## Étendre

- **Nouveau timbre** : ajouter une ligne au `switch` de `playPerc` (`instr.voiceKind`) + entrée `PERC_INSTR`
  (+ option `#percInstr`). Réutiliser `percDrum`/`percSnap`/`percBell`/`percScrape` avant d'écrire un
  générateur.
- **Nouveau groove** : ajouter un objet au tableau `GROOVES` (schéma §5.1 de `metronome-passe3-spec.md`),
  `grid.length === count`. `enterOrder` alimente l'ordre de la progression guidée.
- **Substitution instrument** : compléter `TS_SUB[instr]` (rôle → voiceKind valide).

## Journal de développement

### 2026-07-07 — Mains d'ENSEMBLE + répartition auto jouable + mini-grilles une ligne
- **Mains par ensemble** (`tsHandsForSet`) : les D/G d'un participant sont calculés sur
  l'ensemble des voix qu'il tient — deux voix qui frappent au même instant se **partagent**
  les deux mains (la plus chargée garde sa main naturelle, l'autre prend l'opposée).
  Corrige le faux « D+D sur le temps 1 » produit par le calcul voix-par-voix avec la règle
  « main directrice sur les temps ». Cartes participants et exports JSON utilisent ces mains.
- **Jouabilité assouplie** (`tsPlayableSet`, `tsFingerConflicts`) : seul « > 2 frappes
  simultanées » est impossible ; deux frappes simultanées sont toujours tenables (mains
  réparties). S'applique à « Qui joue quoi ? » et à la répartition auto.
- **Répartir auto sans incompatibilité muette** (`tsAutoDistribute`) : la jouabilité prime
  sur l'équilibre — une voix ne va que chez un participant qui peut encore la tenir ; à
  défaut, repli sur le moins chargé et conflit **signalé** (badge « ⚠ injouable seul·e »
  sur la carte + statut). Samba à 2 joueurs → 1 conflit signalé ; à 4 joueurs → zéro.
- **Mini-grilles des cartes** : la mesure tient sur **une seule ligne** (cases fluides,
  même principe que le plein écran) — plus de repli 12 + 4 qui cassait la lecture du cycle.

### 2026-07-07 — Fusion : le groove du répertoire DEVIENT le jeu focal (+ habillage)
- **Fusion (proposition A)** : « Charger » déverse le groove dans `percGrids`/`percVoices` via
  `percActiveVoices()` ; grilles **partagées par référence** entre séquenceur, exercices, cartes
  participants et exports. `#tsVoices` supprimé (la redite aussi) ; assignation manuelle déplacée
  dans le classement `#tsRank`. Exercices ajout/soustraction/appel-réponse opérationnels sur le
  répertoire (base = `v.orig`) ; progression guidée généralisée (ordre = `enterOrder` du corpus) ;
  **break conditionné** (phrases du focal, option désactivée groove chargé). Chemins de sortie
  propres : `tsUnloadSilent()` dans `percSetInstr`/`applyPercStyle`, garde sur « Mes séquences ».
- **Habillage (guide UI 2026, palette `--fm-*` inchangée)** : `interactive-widget=resizes-content`,
  16 px sur champs tactiles (anti-zoom iOS), `:focus-visible`, `color-scheme`, `prefers-reduced-motion`,
  `text-wrap: balance/pretty`, états au survol via `color-mix`, ombres `--fm-shadow(-soft)` dérivées de
  l'encre du thème, chips de tessiture teintées par la palette de voix, fiche du groove chargé
  (origine/contexte/tempo + bouton tempo jam), classement raffiné.
- **Recette headless (Playwright/Chromium, `file://`)** : 27 points verts — chargement Samba Batucada
  (6 rangées, chips, 16 pas, fiche), voix travaillée/gap sur `ts.*`, break désactivé, édition d'un pas
  visible dans la carte participant (référence partagée), « Groove de base » restaure accents d'origine,
  guidée « Étape 1/25 → 2/25 », déchargement (focal intact), changement d'instrument = déchargement,
  groove ternaire bascule famille+séquenceur en 12. 0 erreur JS ; captures clair/sombre contrôlées.

### 2026-07-07 — La ligne de briques montre ce qui sonne ; classement fiabilisé
- **Briques** (`percLineRender`) : voix `ts.*` quand un groove est chargé, voix focales sinon, clave
  dans les deux cas, chaque voix filtrée par l'audibilité réelle (`percMuted` + `tsMuted`). Légende alignée.
- **Glisser-déposer du classement** : réécrit avec écouteurs `pointermove`/`pointerup` au niveau
  `document` + flèches ↑/↓ de secours sur chaque ligne.

### 2026-07-07 — Étape 5 : « Qui joue quoi ? » (priorités, deux mains, backing track)
- **Classement des lignes** : glisser-déposer (pointer events, tactile) dans `#tsRank`,
  ordre conservé dans `TS.order` (gids), initialisé à l'ordre du groove au chargement.
- **Distribution par priorités** (`tsWizDistribute`) : chaque ligne attribuée **entière ou pas du
  tout** au meilleur joueur pouvant encore la tenir (`tsPlayableSet`, règle deux mains), cumul
  multi-instruments pénalisé, nombre de joueurs libre (1 joueur = jeu individuel).
- **Backing track** : lignes écartées jouées par l'app si `#tsBacking` coché, sourdine sinon ;
  effacées pendant un solo ; réassignation manuelle lève le drapeau.

### 2026-07-07 — Correctifs post-délégation Sonnet (module étape 4)
- **Scission de section** : « Team Spirit & répertoire » → `secRepertoire` + `secTeam`.
- **Bug — lignes individuelles invisibles** : rendu `.ts-pline` ajouté dans les cartes participants.
- **Bug — répartition disproportionnée** : `tsAutoDistribute` réécrit en glouton par charge de frappes.

## Discipline & docs

- Spec d'abord, **une étape = une session**, fichier HTML complet. Aucune IA à l'exécution (moteur de règles
  embarqué). Grilles ouest-africaines encodées `uncertain` — à valider à l'oreille.
- Specs/recettes : `metronome-passe3-spec.md`, `metronome-passe3-etape{1..3}-recette.md`,
  `metronome-passe2-spec.md`, corpus `grooves-*.md` + `convert-grooves.py`.

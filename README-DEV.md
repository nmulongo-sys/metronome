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
| markup UI | sections `<details class="section">` (clave, percussion, **team spirit**, archet…) |
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
- `rebuildPercMeta()` reconstruit `percMeta` à chaque changement du jeu de voix ; toute reconstruction de
  `percGrids` passe par `buildPercGrids()`. Une voix **hors instrument focal** (participants) est préservée.
- `computeCycle()` itère `percGrids` et empile les `events` (triés par `frac`) pour le scheduler.
- `percLayerMuted(layer, voix, brk)` = **seul** point de décision de mute (voix, appel-réponse, team spirit).

Timbres = `PERC_INSTR` (`djembe, cajon, dunduns, agogo, surdo, recoreco`), styles `PERC_STYLES`,
breaks `PERC_BREAKS`, bibliothèque de grooves `GROOVES` (28 grooves, 6 familles ; voix avec
`instr/voiceKind/role/grid`, drapeaux `approx`/`uncertain`/`isBreak`).

## Module « Team Spirit & répertoire » (étape 4)

Surface d'édition distincte des modes générateur. Objet d'état `TS` ; voix namespacées **`ts.<voix>`**.

- `tsLoadGroove()` — charge un `GROOVES[*]`, résout chaque voix vers une clé de routage **valide** par
  tessiture (`tsResolve` + `TS_SUB`), aligne la famille (`setFamily`), injecte via `tsSyncGrids()`.
- **Répertoire libre** : `tsApplyOverride()` rejoue tout le groove sur l'instrument choisi (rôle → voiceKind).
- **Team spirit** : `TS.participants`, assignation `voix.participant`, `tsAutoDistribute()` (par tessiture),
  solo/mute branchés dans `percLayerMuted` via `tsMuted()`. Ligne de chacun affichée ; export JSON
  `tsExportParticipant()` / `tsExportAll()`.
- **Doigtés impossibles** : `tsFingerConflicts()` — 2 mains identiques (ou > 2 frappes) au même pas pour un
  participant, via `percHandsFor`.

Points d'ancrage moteur (minimaux) : `tsSyncGrids()` en fin de `buildPercGrids`, `tsMuted()` dans
`percLayerMuted`, `tsProgressBump()` dans `percOnNewMeasure`. Hors chargement de groove, tout est no-op
(non-régression passe 2).

## Persistance (localStorage)

| clé | contenu |
|---|---|
| `fm-theme` | `clair` \| `sombre` |
| `fm-metro-mode` | `simple` \| `expert` |
| `fm-metro-context` | strate affichée |
| `fm-metro-family` | `bin` (16) \| `tern` (12) |
| `fm-metro-perc-presets` | `{ nom: {instr, count, grids, offsets, muted} }` |
| `fm-metro-progress` | `{ instr: { break: 1..4, guide: n } }` — progression par niveau (étape 4) |
| `fm-metro-wizard-done` | l'assistant ne s'ouvre plus automatiquement |

Les participants / assignations team spirit vivent en mémoire ; l'export JSON « ma ligne » est le vecteur
de partage.

## Étendre

- **Nouveau timbre** : ajouter une ligne au `switch` de `playPerc` (`instr.voiceKind`) + entrée `PERC_INSTR`
  (+ option `#percInstr`). Réutiliser `percDrum`/`percSnap`/`percBell`/`percScrape` avant d'écrire un
  générateur.
- **Nouveau groove** : ajouter un objet au tableau `GROOVES` (schéma §5.1 de `metronome-passe3-spec.md`),
  `grid.length === count`.
- **Substitution instrument** : compléter `TS_SUB[instr]` (rôle → voiceKind valide).

## Discipline & docs

- Spec d'abord, **une étape = une session**, fichier HTML complet. Aucune IA à l'exécution (moteur de règles
  embarqué). Grilles ouest-africaines encodées `uncertain` — à valider à l'oreille.
- Specs/recettes : `metronome-passe3-spec.md`, `metronome-passe3-etape{1..4}-recette.md`,
  `metronome-passe2-spec.md`, corpus `grooves-*.md` + `convert-grooves.py`.

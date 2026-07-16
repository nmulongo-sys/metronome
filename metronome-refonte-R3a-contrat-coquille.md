# R-3a — Annexe : le contrat de coquille (relevé mécanique, build 0.11.0)

> Spec R-3 §3.2 : le moteur transplanté verbatim garde ses références au DOM et aux hooks de
> la coquille ; **toute page qui charge `moteur/*.js` doit fournir ce que le moteur référence.**
> Ce relevé est **lexical** (script sur les fichiers extraits : identifiants top-level de la
> coquille 0.10.0 cités dans les fichiers moteur, `$('…')`, `window.* =`). Il **surestime
> volontairement** (une mention en commentaire compte) — pour un contrat, l'excès est le côté
> sûr ; les identifiants à une lettre (paramètres) sont filtrés comme bruit. Opposable en R-3b
> (`pratiquer.html`) et R-4 (`apprendre.html`).

## Ordre de chargement (contractuel)

`corpus/*.js` → `moteur/fm-etat.js` → `moteur/fm-audio.js` → `moteur/fm-accomp.js` → script(s)
de page. Scripts **classiques** (pas de modules ES) : les déclarations top-level vivent dans la
portée globale partagée — c'est ce qui remplace l'IIFE historique du script principal, déposée
en R-3a (recadrage documenté, voir rapport 0.11.0). Fonctionne en `file://` comme sur Pages.

## Ce que chaque fichier moteur attend de la page

### `moteur/fm-etat.js` (assemblage FM_ASM, état S, store, $, fmToast)

- **Rien à l'exécution du chargement** (hors `window.FM_CORPUS`, fourni par les corpus).
  Les mentions de `percGrids`/`claveData`/`CLAVE_VOICES` dans ses commentaires ne lient pas.
- `fmToast` **crée** son propre élément (`#fmToast`) : aucun ID requis.

### `moteur/fm-audio.js` (synthèse, cycle, ordonnanceur)

- **IDs DOM requis** (3) : `startBtn`, `statusLine`, `percFsPlay` — manipulés par
  `start()`/`stop()`.
- **Hooks fonctions requis à l'exécution** (start/stop/scheduler) :
  `bowReset`, `draw`, `drawStatic`, `percBreakEvents`, `percOnNewMeasure`,
  `percResetBreakState`, `scriptOnNewMeasure`, `tsMuted` (testé par `typeof`, optionnel),
  `wakeLockUpdate`, `atelierRender`.
- **État de coquille lu** : `atelierOpen`, `claveData`, `percBreakActive`, `percBreakEchoNow`,
  `percCallSilent`, `percGrids`, `percMeasures`, `percMeta`, `percMuted`, `percOffsets`,
  `percWork`, `statusLineLast`, `CLAVE_VOICES`.
- **Export** : `window.fmMetroAudio` (hook de l'export audio).

### `moteur/fm-accomp.js` (gap, basse funk)

- **IDs DOM requis** (21) : les commandes basse des deux panneaux synchronisés —
  `bassOn`, `bassPattern`, `bassKey`, `bassProg`, `bassChord`, `bassDensity`, `bassVel`,
  `bassVary`, `bassLegato`, `bassSpace`, `bassDropOn`, `bassDropEvery`, `bassDropLen`,
  `bassSwingFollow`, `playBassOn`, `playBassChord`, `playBassDensity`, `playBassDrop`,
  `playBassGroup` — et l'affichage du gap : `gapTarget`, `gapCrossed`.
- **État/tables de coquille lus** : `PERC_INSTR` (identités de timbre), `claveData`,
  `CLAVE_VOICES`.
- **Export** : `window.fmMetroBass` (hook des recettes : RNG déterministe).

## Ce que la coquille consomme du moteur (sens inverse, informatif — 44 noms)

`AHEAD`, `BASS_WET`, `BUILD`, `BUILD_DATE`, `FM_ASM`, `PERF_HUD`, `S`, `audioCtx`,
`bassPersist`, `bassPlayRefresh`, `bassPulseCheck`, `bassResetCycle`, `bassRestore`,
`bassUpdateChordLabel`, `bassWet`, `cycleDur`, `cycleStart`, `ensureCtx`, `events`,
`gapCrossed`, `gapMuteDone`, `gapMuteTotal`, `gapTargetLabel`, `gapTargetRefresh`,
`isPlaying`, `masterGain`, `measureCount`, `mutedThisCycle`, `percLayerMuted`, `perfStats`,
`playPerc`, `resetGap`, `script`, `start`, `stop`, `store`, `subPositions`, `tapTimes`,
`toggle`, `totalBeats`, `volMuted` (+ `$`, `fmToast`, `LOOKAHEAD_MS` de fm-etat).

## Règle d'usage pour les pages futures

Une page qui veut le moteur **sans** une fonctionnalité de coquille fournit un **stub inerte**
du hook correspondant (ex. : `function wakeLockUpdate() {}`, `let atelierOpen = false`,
`percGrids = {}`) — jamais une retouche du moteur. Les stubs sont de la coquille : ils se
déclarent dans le script de page, après les balises moteur.

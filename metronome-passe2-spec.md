# Métronome FM — Spécification de la passe 2
## DSL pédagogique percussion · résorption des dettes · validation

Date : 2026-07-06 · Assemblage des lots LOT-01 à LOT-07 (manifeste `LOT-00_manifeste.md`, 2 vagues)
Source de vérité : **`metronome.html`** (version passe 1 : strates, family-bar, contextes, wizard refondu).
Toutes les lignes citées ci-dessous sont celles de `metronome.html`, vérifiées par le lot 07 de ré-ancrage.

---

## 0. Historique de la source (résolu)

La vague 1 des lots avait été exécutée sur `index (6).html`, qui s'est révélé être la version **antérieure** à la passe 1 (découverte du lot 06, confirmée par recherche directe). L'utilisateur a ensuite déposé la vraie source passe 1 (`metronome.html`) et la spec passe 1 validée (`metronome-strates-spec.md`) ; la vague 2 (lot 07) a ré-ancré tous les identifiants dessus. **Le moteur est structurellement identique entre les deux versions** (un seul `events[]` trié par `frac` — l.1074 ; événement perc `{frac, layer:'perc', voice, accent}` — l.1068 ; clave mono-voix layer `clave` — l.1051 ; `mutedThisCycle` testé dans `playClick` avant `percLayerMuted` — l.990-992) : les analyses de fond des lots 01/04/05 restent valides telles quelles, seules les ancres changent. `index (6).html` ne sert plus de référence.

---

## 1. État des lieux — le modèle latent (vérifié, lots 01 + 07)

Le code contient déjà un modèle implicite complet « voix nommées × grille de pas » :

| Structure | Ligne (metronome.html) | Forme |
|---|---|---|
| `PERC_INSTR` | 1408 | `{instrId: {label, work, voices:[{id,label}], base:{count:{voice:pas[]}}}}` — 3 instruments (djembé 3 voix, cajón 2, dunduns 4) |
| `PERC_STYLES` | 1449 | `{instrId: [{id,label,count,base,acc?,anchors?,startNote?,note?}]}` — patterns par voix, count 16 ou 12 |
| `PERC_BREAKS` | 1504 | `{instrId: [{id,label,count,hits,note?}]}` — frappes toutes accentuées (`percBreakEvents` l.1552) |
| `percGrids` | 1531 | état vivant `{voiceId: (0|1|2)[]}` (0 silence, 1 frappe, 2 accent) |
| `percOffsets` | 1532 | micro-timing `{voiceId: number[]}`, fraction de pas ∈ [-0.45, 0.45], consommé dans `frac` (l.1067-1068) |
| `percMuted` | 1533 | `{voiceId: boolean}` |
| Preset localStorage | handler `percSaveBtn` l.2064, clé `fm-metro-perc-presets` l.2032-2034, `percLoadPreset` l.2042 | `{instr, count, grids, offsets, muted}` par séquence nommée |
| `computeCycle` | 1034 (layer `clave` l.1051, boucle perc l.1062-1072, tri l.1074) | un seul `events[]` trié par `frac` |

Faisabilité du générateur dynamique **prouvée dans le code** : `percGuideBuild` (l.1608, progression multi-étapes descendante depuis un groove cible) et `percAddHit` (l.1726, ajout incrémental de frappes hors-temps sur la voix travaillée `percWork`, l.1534). Limite avérée : aucune des deux ne génère un groove complet ex nihilo — les deux partent d'un groove ou d'ancres existants. Le moteur de règles du §3 respecte cette limite (il sélectionne et paramètre, il n'invente pas de pattern).

Synthèse du schéma implicite (lot 01) : *un pattern est toujours une table `voix → indices de pas actifs` paramétrée par un `count` (16 ou 12)* — mais styles, breaks et presets ont chacun leur forme légèrement différente, et l'énumération d'instruments est fermée. C'est exactement ce que le profil de kit du §2 factorise — et ce que la spec passe 1 (§6 de `metronome-strates-spec.md`) annonçait : « généraliser ce preset = une bonne part du travail DSL ».

**Acquis passe 1 utile au DSL** (lot 07) : la famille bin/tern est déjà un réglage global — `setFamily(fam)` (l.867) fixe `S.clave.count` (l.877) **et** `S.perc.count` (l.882) en un seul appel, piloté par `famBinBtn`/`famTernBtn` de la family-bar (l.441-442). Le champ `family` du profil de kit (§2) a donc déjà son point d'application dans le code. Nuance résiduelle : les sélecteurs locaux `claveCount` (l.463) et `percCount` (l.505) restent modifiables séparément hors family-bar — voir point ouvert §7.

## 2. Le profil de kit — schéma JSON normatif (lot 02, arbitré)

Définition **normative** de la voix et du profil (les §3 et §4 s'y réfèrent, ils ne redéfinissent rien) :

```jsonc
{
  "kitId": "",              // slug unique
  "label": "",               // nom affiché
  "family": "bin",            // "bin" (count=16) | "tern" (count=12) — une seule famille par profil
  "count": 16,
  "voices": [                 // liste LIBRE — la clave est une voix comme une autre
    {
      "id": "",               // clé unique dans le kit (= vid des grids/offsets/muted)
      "label": "",
      "timbre": "",           // "basse"|"tone"|"slap"|"grave"|"aigu"|"cloche"|... libre
      "freq": null,            // optionnel (Hz) — indication de rendu pour les timbres "cloche"
                               // (arbitrage assemblage : porte le grave/aigu de la clave, §4)
      "role": "medium",       // "basse"|"medium"|"aigu"|"timekeeper" — guide la génération
      "grid": [],              // (0|1|2)[count]
      "offsets": [],           // fraction de pas [-0.45..0.45][count]
      "muted": false
    }
  ],
  "handRule": "alt",          // "alt" | "lead"   (= S.perc.handRule)
  "lefty": false,
  "meta": { "objectif": "", "niveau": "" },   // rempli par le questionnaire (§3)
  "gen": {                    // paramètres de GÉNÉRATION (jamais des critères vérifiés)
    "mode": "off",            // "off"|"add"|"sub"|"call"|"guide"|"break" (= S.perc.mode)
    "period": 4,               // mesures entre variations (= S.perc.period)
    "density": 0.4,            // 0-1, proportion de pas actifs visée (pilote percAddHit, l.1726)
    "targetHandOrVoice": "",  // voix travaillée (= percWork, l.1534)
    "dynamics": "uniforme",   // "uniforme"|"accentuee"|"progressive" (arbitrage §7)
    "regularity": 0.0,         // 0 (métronomique) - 1 (micro-timing large, plage réelle des offsets)
    "anchors": {},             // {voiceId:[index]} — pas protégés (= anchors de PERC_STYLES)
    "startNote": ""            // texte pédagogique (= startNote de PERC_STYLES)
  }
}
```

**Migration mécanique du preset existant** `{instr, count, grids, offsets, muted}` :
`instr` → une entrée `voices[]` par voix de `PERC_INSTR[instr].voices` (id/label copiés, `timbre=id`, `role="medium"` par défaut) ; `count` → `count` + `family` (16→bin, 12→tern, sans perte) ; `grids/offsets/muted[vid]` → champs de la voix correspondante, copie telle quelle ; `handRule/lefty/meta/gen` → valeurs par défaut. Trois exemples complets validés (kit binaire à clave-cloche, kit ternaire à micro-timing, conversion d'un preset cajón réel) : voir `LOT-02_schema-json.md` §3.

Limites volontaires : pas de mélange bin/tern (affaire de la couche `poly` — conforme au §2 de la spec passe 1), pas de breaks ni d'appel-réponse dans le profil statique, **aucun champ d'assertion** (les `gen.*` sont des entrées du générateur), pas de borne au nombre de voix.

## 3. Questionnaire et moteur de règles (lot 03, réaligné, branchement ré-ancré lot 07)

**Questionnaire** : 7 questions fermées (objectif · niveau · famille binaire/ternaire · instrument/jeu de voix · période de stabilité · contrastes de dynamique · latéralité), formulées pour un musicien — libellés exacts dans `LOT-03_questionnaire-regles.md` §1.

**Moteur de règles** (zéro IA, zéro DOM, zéro réseau) : trois tables déclaratives embarquables — `RULES_TABLE` (objectif × niveau → mode/period/voiceCount/dynamique/mains), `SUBDIV_TABLE` (binaire→16, ternaire→12), `VOICES_TABLE` (instrument → voix, reprise de `PERC_INSTR`) — et une fonction pure `buildKitProfile(answers)` déterministe avec défauts sur toute réponse manquante. Code complet et deux exemples entrée→sortie tracés : `LOT-03_questionnaire-regles.md` §2-3.

**Réalignement sur le schéma normatif** (arbitrage d'assemblage) :

| Sortie provisoire du lot 03 | Champ normatif (§2) |
|---|---|
| `meta.objectif`, `meta.niveau` | `meta.objectif`, `meta.niveau` (inchangés) |
| `count` | `count` + `family` dérivée |
| `voices[] {id,label}` | `voices[]` complétées : `timbre=id`, `role` déduit (basse→`basse`, cloche/dundunba→`timekeeper`, sinon `medium`), `grid/offsets/muted` initialisés depuis le groove de base `PERC_INSTR[instr].base[count]` |
| `params.mode` | `gen.mode` |
| `params.period` | `gen.period` |
| `params.dynamicsProfile: 'marque'/'progressif'` | `gen.dynamics: 'accentuee'/'progressive'` (renommage, voir §7) |
| `params.handRule`, `params.lefty` | `handRule`, `lefty` (remontés au premier niveau) |
| `voiceCount` (de RULES_TABLE) | tronque `voices[]` aux N premières voix de l'instrument |

**Branchement sur le wizard passe 1** (ré-ancré, lot 07 — le branchement initialement décrit visait l'ancien wizard à `GOALS`, qui n'existe plus) : le wizard réel fonctionne par **contextes** — `CONTEXTS` (l.2679 : `simple` / `pile` / `archet`), état `wiz` (l.2670), trois écrans (`wizSteps()` l.2702 ; écran 0 contexte l.2716-2725, écran 1 tempo/mesure + famille/surcouches si `pile` l.2726-2764, écran 2 récapitulatif l.2765-2784), rendu `renderWizard()` (l.2704), application `applyWizard()` (l.2787), bouton `#wizardBtn` (l.355, écouteur l.2821, `openWizard()` l.2687). Insertion du questionnaire :
- un nouveau champ dans `wiz` (l.2670), à côté de `context`/`family`/`over`, portant les réponses ;
- un écran supplémentaire (incrémenter `wizSteps()`, l.2702) inséré après l'écran 0 lorsque l'utilisateur choisit le contexte `pile` avec l'option « programme personnalisé » — nouvelle branche dans `renderWizard()` au niveau des blocs `wiz.step === 0/1` (l.2716/2726) ;
- dans `applyWizard()` (l.2787), aux côtés des branches de contexte (l.2792-2812) : `buildKitProfile(wiz.…)` produit le profil, appliqué par le même chemin que `percLoadPreset` (l.2042), qui consomme déjà `{instr, count, grids, offsets, muted}` ; la famille du profil passe par `setFamily` (l.867), déjà commune à clave et perc.

Ce branchement **respecte la décision passe 1** « le wizard pose uniquement le contexte et la famille, pas d'écrans de réglage fin » : le questionnaire ne règle rien finement — il choisit un objectif pédagogique et laisse le moteur de règles produire le kit, posé ensuite « au jugé, en direct » dans les sections.

## 4. Clave multi-voix — fusion clave↔percussion (lot 05, ancres lot 07)

**Vérifié** : la clave est mono-voix de bout en bout — `S.clave = {count, steps, freq}` (l.787, freq par défaut 1800), slider `#claveFreq` (l.475, écouteur l.2197), rendu figé dans `playClick` case `'clave'` (l.1005-1010), layer `clave` empilé sans champ `voice` dans `computeCycle` (l.1051), mute traité comme couche à part dans `percLayerMuted` (l.975-988), séquenceur `#claveSteps` (l.470), presets `#clavePreset` (l.453, écouteur l.2186).

**Plan** :
- *Données* : suppression de la racine `S.clave` ; la clave devient deux voix de la liste unique — `{id:'grave', timbre:'cloche', freq:1400}` et `{id:'aigue', timbre:'cloche', freq:2200}` (champ `freq` normatif du §2) — avec grilles dans `percGrids` comme toute voix.
- *Génération* : le layer `clave` de `computeCycle` (l.1051) est **supprimé**, les voix clave passant par la boucle générique du layer `perc` (l.1062-1072). Justification (une phrase, exigée) : un seul chemin de génération pour un seul concept « voix rythmique à grille et accent ».
- *UI* : le slider `#claveFreq` disparaît (timbres portés par les voix) ; le séquenceur `#claveSteps` devient deux rangées sur le modèle de `#percVoices` ; les presets `#clavePreset` (son 3-2, rumba, bossa…) sont migrés en assignant leurs frappes à la voix `grave` par défaut.
- *Rétro-compatibilité* : à la migration d'un réglage existant, toutes les frappes de `S.clave.steps` vont sur la voix la plus proche de l'ancien `S.clave.freq` ; rien sur l'autre voix → son perçu inchangé à l'ouverture.

Hors périmètre (dette assumée) : contrôle UI de timbre par voix, refonte de `percLayerMuted`/gap au-delà de l'adaptation mécanique (repris par §5), généralisation de l'ajout/suppression de voix arbitraires.

## 5. Dette gap / micro-timing (lot 04, ancres lot 07)

**Correction du récit** (constat du lot 04, à retenir) : il y a bien **duplication stricte du gap** — `S.gap` (l.789) / `updateGapForNewMeasure` (l.1081) / `mutedThisCycle` (l.804, consommé `playClick` l.991) contre `S.perc.gap` (l.794) / bloc gap de `percOnNewMeasure` (l.1773-1782) / `percGapMutedNow` (consommé `percLayerMuted` l.975-988, remis à zéro par `resetPercGap` l.1702) : même politique « jouer N / couper M » en deux machines à états, deux UI, deux points de lecture. En revanche le volet « micro-timing » **n'est pas un doublon** : `S.shift` (l.786) ajoute un clic surnuméraire décalé en ms, `percOffsets` (l.1532) déplace la frappe elle-même en fraction de pas (intégré dans `frac`, l.1067-1068) — l'unification est un objectif, pas la résorption d'un doublon. Nuance confirmée par le lot 07 : le gap par couche actuel peut déjà couper `beat`/`sub`/`clave` (cible `pulse`/`clave`), pas seulement des voix perc — le ciblage du futur `S.gap.target` doit couvrir ce périmètre.

**Plan de résorption** (détail fonction par fonction dans `LOT-04_dette-gap.md` §2) :
- `S.gap` gagne un champ `target: 'all'|'pulse'|<voiceId>` (défaut `'all'` = comportement actuel byte-for-byte) ; `S.perc.gap`, son bloc dans `percOnNewMeasure` et `resetPercGap` sont retirés **dans le même changement** (parade à la double application) ; `updateGapForNewMeasure` reste l'unique machine à états, inchangée dans sa logique.
- `playClick` (l.990) teste le ciblage (décision booléenne, sans toucher au calcul de `t` du `scheduler`, l.1192 — parade au jitter) ; `percLayerMuted` ne garde que le métier hors-gap (`percCallSilent` l.1537, `percMuted` l.1533).
- `percOffsets` devient l'attribut `voices[].offsets` du §2 — changement de **provenance de la donnée**, ni de sémantique ni d'unité ; la formule de `computeCycle` (l.1068) et la mécanique de drag restent identiques.
- La routine programmée (`gap N/M`) reste cantonnée à `target:'all'` — aucun script existant ne change de comportement.
- Ordre d'appel intangible dans `startNewCycle` (l.1182) : `scriptOnNewMeasure()` (l.1185) → `updateGapForNewMeasure()` (l.1186) → `percOnNewMeasure()` (l.1187) → `computeCycle()` (l.1188) — parade aux événements orphelins.
- Nota (interaction §4) : une fois la clave fusionnée, la cible `'clave'` disparaît du gap — les cibles sont `all`, `pulse` et des ids de voix, ce qui simplifie encore `percLayerMuted`.

**Test de non-régression** (sans outillage) : (a) réglages neutres → aucune coupure sur 8 mesures, jamais « MUTE » ; (b) gap Fixe 2/2 ciblé sur une voix (ex. slap du djembé) → seule cette voix disparaît 2 mesures sur 4, pulsation et autres voix intactes ; retour cible « toutes » → coupure globale à l'identique. Protocole détaillé : `LOT-04_dette-gap.md` §4.

## 6. Validation visuelle de la passe 1 (lots 06 + 07)

La checklist `LOT-06_validation-passe1.md` avait été rédigée sur l'ancienne version ; le lot 07 (§5) a re-qualifié **chaque item `[ÉCART]`** sur `metronome.html` : tous sont redevenus vérifiables, la plupart tels quels. Points confirmés dans le code, à valider à l'œil sur appareil :
- **Wizard** : 3 contextes (`CONTEXTS` l.2679), famille et surcouches (`wFamily` l.2743, `wOverGap`/`wOverRoutine` l.2749-2750) présentes **uniquement en contexte pile**, aucun écran de réglage fin (intention confirmée en commentaire l.2667-2669).
- **Masquage croisé** : `ctx-pile` masque Archet (l.175), `ctx-archet` masque les couches (l.177), socle et enveloppe jamais masqués par le contexte (aucune règle ne les cible) — exactement la spec passe 1 §4.
- **Family-bar** : présente entre Groove et Claves (l.438), visible sections repliées, masquée en mode Simple (l.192) et en contexte Archet (l.193) — l'item d'appréciation « trop présente ? » du brief reste à juger visuellement.
- **Bascule unique** : `setFamily` (l.867) aligne clave et perc d'un seul geste (l.877 + l.882-883) — l'item [5-PAS-DE-BASCULE-GLOBALE] du lot 06 reçoit désormais la réponse « oui, par construction ».

Blocs 1, 6 et 7 de la checklist (chargement/thème, non-régression sonore, archet) : à exécuter tels quels, en adaptant les libellés au wizard à contextes.

## 7. Contradictions tranchées et arbitrages (rapport intégré)

1. **Identité de la source** : brief ≠ fichier initial (`index (6).html` = version pré-passe 1). Détecté par le lot 06, **résolu en vague 2** : l'utilisateur a déposé `metronome.html` (vraie passe 1) ; le lot 07 a ré-ancré toutes les lignes et confirmé le moteur structurellement identique. `index (6).html` est hors jeu.
2. **Nommage de la dynamique** : lot 02 (`uniforme|accentuee`) vs lot 03 (`marque|progressif`). Tranché : `gen.dynamics ∈ {uniforme, accentuee, progressive}` — `marque`→`accentuee`, `progressif`→`progressive` ; la table de règles du lot 03 est à renommer à l'implémentation.
3. **Timbre de la clave multi-voix** : le lot 05 introduisait un champ `freq` par voix absent du schéma du lot 02. Tranché : `voices[].freq` optionnel ajouté au schéma normatif (§2) comme indication de rendu des timbres cloche — pas de structure clave séparée.
4. **Structure de sortie du questionnaire** : le lot 03 avait isolé sa forme provisoire (`KIT_PROFILE_SHAPE`) comme demandé. Tranché : table de réalignement du §3 ; `params.*` éclatés entre `gen.*` et le premier niveau.
5. **Citation erronée** : le lot 02 justifiait `gen.density` par `percAddOne`, inexistant. Corrigé à la marge en `percAddHit` (l.1726 dans metronome.html), vérifié.
6. **Branchement du questionnaire** : le lot 03 le décrivait sur l'ancien wizard (`GOALS`), disparu en passe 1. Réécrit au §3 sur le wizard à contextes (`CONTEXTS`/`wiz`), à partir du ré-ancrage du lot 07 — le fond (buildKitProfile → chemin percLoadPreset) est inchangé.
7. **Point ouvert résiduel** (lot 07, à trancher à l'implémentation, pas bloquant) : les sélecteurs locaux `claveCount` (l.463) et `percCount` (l.505) restent modifiables indépendamment hors family-bar et peuvent diverger. Options : les asservir à la famille (divergence impossible), ou les considérer comme un réglage avancé assumé. Cohérent avec la spec passe 1 qui n'imposait la famille qu'« en tête de strate B ».

## 8. Plan d'implémentation ordonné

Chaque étape = une session, livrant le **fichier HTML complet** (jamais un patch), suivie de sa tranche de checklist.

| # | Étape | Touche au moteur ? | S'appuie sur |
|---|---|---|---|
| 0 | ~~Résoudre l'identité de la source~~ **Fait** : `metronome.html` (passe 1) déposé et ré-ancré (lot 07) | — | §0 |
| 1 | Valider visuellement la passe 1 sur appareil (checklist §6, y c. l'appréciation family-bar) | non | LOT-06 + LOT-07 §5 |
| 2 | Profil de kit + migration des presets + `buildKitProfile` + écran questionnaire dans le wizard à contextes (purement additif) | non | §2, §3 |
| 3 | Clave multi-voix : fusion dans la liste de voix, migration des presets clave | oui — suppression du layer `clave` de `computeCycle` (l.1051), case `'clave'` de `playClick` (l.1005-1010) | §4 |
| 4 | Résorption gap : `S.gap.target`, retrait du gap perc, `percOffsets` → attribut de voix | oui — `playClick` (l.990), `percLayerMuted` (l.975), `percOnNewMeasure` (l.1771) | §5 |
| 5 | Recette complète : checklist §6 + tests de non-régression §5 sur appareil | — | LOT-06, LOT-04 |

Ordre justifié : l'étape 1 solde la validation due de la passe 1 avant d'empiler ; l'étape 2 n'expose aucun risque moteur et rend le DSL utilisable tôt ; l'étape 3 précède la 4 pour que le ciblage du gap n'ait plus jamais à connaître un layer `clave` spécial ; la 4 se fait « à froid », séparément, comme le brief et la spec passe 1 (§5.1) le demandaient.

---
*Pièces de traçabilité : `LOT-00_manifeste.md` (manifeste, 2 vagues), `LOT-01`…`LOT-06` (vague 1, ancrée sur l'ancienne source — analyses de fond valides, lignes périmées), `LOT-07_reancrage.md` (vague 2, table de correspondance vers `metronome.html`), `prompt_LOT-01`…`prompt_LOT-07` (prompts autonomes, réutilisables en mode manuel).*

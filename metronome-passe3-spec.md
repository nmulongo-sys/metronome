# Métronome FM — Spécification de la passe 3
## Moteur multi-instruments · mode « team spirit » · bibliothèque de grooves

Date : 2026-07-07
Source de vérité : **`metronome.html`** (passe 2 close et recettée : étapes 2-5 + §7.7 asservi).
Toutes les lignes citées sont celles de `metronome.html` au 2026-07-07, vérifiées par lecture directe.
Intrant données : les 6 fichiers `grooves-*.md` (corpus de recherche livré, 31 fiches, 171 grilles conformes).

> Discipline conservée (inchangée depuis la passe 1) : **spec d'abord, une étape = une session**, livraison
> en **fichier HTML complet, jamais un patch**. App autonome offline, français, mobile-first Android.

---

## 0. Périmètre et intrants (acté)

La passe 3 réalise le mode **team spirit** et sa **bibliothèque de grooves**. Elle repose sur **un seul
chantier structurel** : le **moteur multi-instruments** — faire sonner simultanément des voix de timbres
différents. C'est nommément la dette « généralisation de l'ajout/suppression de voix arbitraires » laissée
hors périmètre par l'étape 3 de la passe 2 (`metronome-passe2-spec.md` §4, dernière ligne « Hors périmètre »).

**Team spirit — deux sens du même objet.** L'objet est une *liste de voix hétérogènes assignées à des
participants*. Deux lectures pédagogiques :
- **accumulation** : empiler des lignes solistes une à une → l'ensemble se construit (l'« ordre d'entrée en
  jam » des fiches grooves) ;
- **distribution** : partir d'un groove total et le *partitionner* entre N participants — la reconstitution
  de toutes les parts = le groove.

Les deux consomment la même donnée (des voix) et le même moteur (multi-instruments) ; ils diffèrent par le
flux d'édition, pas par le modèle.

**Ce que la passe 3 n'invente pas.** Le corpus grooves est **déjà produit** — la passe 3 le *convertit* en
tables de données, elle ne le recherche pas. Elle **n'ajoute aucune IA à l'exécution** (décision constante :
moteur de règles embarqué uniquement). Elle ne pousse rien sur GitHub (push toujours différé, tutoriels sur
l'ancienne version).

---

## 1. État des lieux — le couplage mono-instrument (vérifié)

La passe 2 a déjà généralisé le modèle à *une liste plate de voix nommées × grille de pas* : `percGrids`
(`{voiceId: (0|1|2)[]}`, l.1687), `percOffsets` (micro-timing, l.1688), `percMuted` (l.1689), un seul
`events[]` trié par `frac` dans `computeCycle` (l.1079-1118), une clave fondue dans la même liste
(`CLAVE_VOICES` l.1463, `claveData` l.1469, ré-ancrée par référence via `claveAttach` l.1474). **Ce socle
est le bon.** Il n'est pas retouché sur le fond.

La **seule** chose qui interdit plusieurs instruments simultanés : l'**identité d'instrument est un scalaire
global**, `S.perc.instr` (l.837), lu partout comme s'il n'existait qu'un instrument à la fois.

| Point de lecture de `S.perc.instr` | Ligne | Rôle |
|---|---|---|
| `playPerc` — routage du timbre | 1012 | `switch (S.perc.instr + '.' + voice)` : **le timbre d'une voix dépend du global, pas de la voix** |
| `PERC_INSTR[S.perc.instr]` — voix, base | 1134, 1141, 1765, 1805, 1863, 1868, 1875, 2003, 2104, 2188 | définition de voix et grooves de base du seul instrument courant |
| `PERC_BREAKS[S.perc.instr]` | 1703 | breaks du seul instrument courant |
| `PERC_STYLES[S.perc.instr]` | 2183 | styles du seul instrument courant |
| `percSetInstr` / `applyKitProfile` | 2151, 2422 | **posent un unique** `S.perc.instr` |

Corollaires vérifiés :
- **Timbre non porté par la voix.** `playPerc(t, voice, accent)` (l.1001) reçoit un `voice` = *identifiant
  local* (`'basse'`, `'slap'`, `'grave'`…) ; le timbre est reconstruit par concaténation avec le global
  (l.1012). Les voix clave font exception (elles portent leur `timbre:'cloche'` + `freq`, rendues l.1004-1010) —
  **c'est déjà le patron cible**, à généraliser à toutes les voix.
- **Identifiants de voix non namespacés.** `djembe` a `basse/tone/slap`, `cajon` a `grave/aigu`. Deux
  instruments distincts pourraient partager un id (`cloche` existe pour `dunduns` et existerait pour un agogô),
  et **deux exemplaires du même instrument sont impossibles** (collision d'id dans `percGrids`). Team spirit
  exige les deux (deux surdos, deux djembés).
- **Kit mono-instrument.** `applyKitProfile(profile, instr)` (l.2420) fixe `S.perc.instr = instr` (l.2422) :
  le profil de kit passe 2 décrit les voix **d'un seul** instrument. Les presets sérialisent
  `{instr, count, grids, offsets, muted}` (l.2286) — un instrument.
- **Ce qui est déjà global et le reste** : le `count` (16 bin / 12 tern) est commun à toutes les voix via
  `setFamily` (l.912) — clave et perc partagent la même grille temporelle. Team spirit **conserve** un count
  global (toutes les parts d'un même groove partagent le cycle).

**Diagnostic.** Multi-instrument = déplacer l'attribut `instr` **du singleton d'état vers chaque voix**,
namespacer les ids, et re-router l'audio + les lectures de définition sur l'`instr` **de la voix**. Le
scheduler, les grilles, le gap et le micro-timing (déjà par-voix depuis la passe 2) **ne changent pas**.

---

## 2. Schéma de voix multi-instruments — normatif (le cœur ; tout en découle)

Extension du schéma de voix normatif de la passe 2 (`metronome-passe2-spec.md` §2). Les champs marqués
**[N3]** sont nouveaux ; les autres sont repris tels quels. **Les §3, §4 et §5 s'y réfèrent, ils ne
redéfinissent rien.**

```jsonc
{
  "id": "",            // [N3] unique GLOBAL et namespacé — plus seulement unique dans un kit.
                       //      Convention : "<participant|src>.<instr>.<voiceKind>" ex. "p1.surdo.grave",
                       //      "lib.djembe.slap". Clé des tableaux percGrids/percOffsets/percMuted.
  "label": "",         // nom affiché ("Surdo 1 fundo", "Agogô grave")
  "instr": "",         // [N3] FAMILLE DE TIMBRE — remplace le global S.perc.instr pour CETTE voix.
                       //      "djembe"|"cajon"|"dunduns"|"clave"|"agogo"|"surdo"|"recoreco"|... (ouvert)
  "voiceKind": "",     // sous-voix du timbre (ex-identifiant local) : "basse"|"tone"|"slap"|"grave"|"aigu"|
                       //      "cloche"|... → la clé de routage audio est EXACTEMENT `instr + "." + voiceKind`
  "freq": null,        // optionnel (Hz) — indication de rendu pour les timbres cloche (clave, agogô)
  "role": "medium",    // TESSITURE : "basse"|"medium"|"aigu"|"timekeeper" — = la colonne (grave/médium/aigu)
                       //      des fiches grooves ; guide la génération et l'affichage
  "grid": [],          // (0|1|2)[count]   0 silence · 1 frappe · 2 accent   (X→2, x→1, .→0 des fiches)
  "offsets": [],       // fraction de pas [-0.45..0.45][count]  (micro-timing, inchangé passe 2)
  "muted": false,      // muet individuel (checkbox)
  "participant": null, // [N3] TEAM SPIRIT — id du participant assigné, ou null (voix commune / non assignée)
  "uncertain": false,  // [N3] la grille est une reconstruction INCERTAIN (cf. corpus, surtout ouest-africain)
  "enterOrder": null,  // [N3] rang d'entrée en jam (accumulation) — entier, ou null
  "difficulty": ""     // [N3] "facile"|"moyen"|"difficile" (des fiches grooves), pour l'ordre pédagogique
}
```

**Invariants normatifs :**
1. `id` unique dans l'état vivant ; c'est la clé de `percGrids`/`percOffsets`/`percMuted`. La collision
   d'anciens ids courts (`basse`, `grave`) est levée par le namespacing.
2. La **clé de routage audio** est `instr + "." + voiceKind` (§3), lue **sur la voix**, jamais sur un global.
3. `grid.length === count` global (bin=16 / tern=12). Une voix ne porte pas son propre count — le cycle est
   commun (invariant hérité, §1).
4. Une voix `clave` est une voix comme une autre : `instr:"clave"`, `voiceKind:"grave"|"aigu"`, `freq` porté.
   La distinction clave/instrument disparaît du moteur (elle survit comme filtre d'affichage éventuel).

**Migration mécanique de l'état passe 2 → passe 3** (sans perte, byte-for-byte sur le rendu) :
- Chaque voix courante de `PERC_INSTR[S.perc.instr]` → `instr = S.perc.instr`, `voiceKind = ancien id local`,
  `id = "lib." + instr + "." + voiceKind`, `role` déduit de la tessiture (basse→`basse`,
  cloche/dundunba/timekeeper→`timekeeper`, sinon `medium`), `grid/offsets/muted` copiés depuis
  `percGrids[ancien id]`.
- Voix clave : `instr:"clave"`, `voiceKind` = `grave`/`aigu` (depuis `claveGrave`/`claveAigue`), `freq`
  conservé (1400/2200).
- `participant:null`, `uncertain:false`, `enterOrder:null`, `difficulty:""` par défaut → **comportement
  actuel inchangé à l'ouverture** (un seul instrument, aucun participant).
- Presets sérialisés `{instr, count, grids, offsets, muted}` (l.2286) : chargés en injectant `instr` sur
  chaque voix reconstruite — rétro-compatibles, le champ `instr` du preset devient l'`instr` de toutes ses voix.

**Limites volontaires** (dette assumée, hors passe 3) : pas de mélange bin/tern dans un même groove (affaire
de la couche `poly`, décision passe 1) ; pas de count par voix ; le nombre de voix reste non borné.

---

## 3. Moteur audio multi-timbres (routage par voix + nouveaux timbres)

### 3.1 Re-routage (structurel, sans nouveau son)

`playPerc(t, voice, accent)` (l.1001) reçoit désormais l'**objet voix** (ou son `{instr, voiceKind, freq}`),
plus un simple identifiant. La clé du `switch` (l.1012) devient `voice.instr + "." + voice.voiceKind`, lue
sur la voix. Le cas clave (l.1004-1010) devient une branche `case 'clave.grave' / 'clave.aigu'` (ou un test
`voice.instr === 'clave'`) rendue par `playNoise + playTone` sur `voice.freq` — **exactement le rendu actuel**.

Toutes les lectures `PERC_INSTR[S.perc.instr]`, `PERC_BREAKS[S.perc.instr]`, `PERC_STYLES[S.perc.instr]` du
tableau §1 sont re-qualifiées : celles qui décrivent **une voix précise** lisent `voice.instr` ; celles qui
décrivent **le contexte d'édition** (quel instrument le générateur travaille, quels styles proposer) lisent
un **instrument focal** explicite (§6), pas un global implicite.

Les primitives de timbre existantes sont **conservées inchangées** et deviennent la bibliothèque de rendu :
`percDrum` (fût, l.968), `percSnap` (claqué, l.979), `percBell` (cloche, l.989), `playNoise` (l.956),
`playTone` (l.947). Le `switch` de `playPerc` reste la **table de routage** ; elle grandit d'une ligne par
couple `instr.voiceKind`.

### 3.2 Nouveaux timbres (une recette WebAudio par instrument)

Priorité et difficulté (du brief, à confirmer à l'oreille) :

| Instrument | Voix (voiceKind) | Recette (primitive existante ou nouvelle) | Difficulté |
|---|---|---|---|
| **agogô** | `grave`, `aigu` | `percBell` re-paramétré à 2 hauteurs (tierce) — la cloche existe déjà | facile |
| **surdo** | `grave`, `aigu`/`marcante` | `percDrum` fût grave à chute lente (dundunba existe déjà, l.1018) | facile |
| **reco-reco** | `raclement` | **nouvelle** — bruit filtré modulé (train d'impulsions bandpass, ~8-12 grains) ; le raclement est le plus dur, à prototyper | difficile |

`agogô` et `surdo` sont des re-paramétrages de `percBell`/`percDrum` : ajout de lignes au `switch`, aucun
nouveau générateur. `reco-reco` demande une fonction dédiée (raclement = enveloppe granulaire) — **à
prototyper isolément** avant intégration. Toutes s'ajoutent à la table de routage §3.1 sans toucher au
scheduler.

**Substitution instrumentale** (AUTO-CRITIQUE des corpus, à honorer) : le rôle (tessiture) prime sur
l'instrument exact — un surdo peut être rendu par un tom grave, un agbê par un shaker. Le champ `role` (§2)
porte cette information ; un timbre manquant retombe sur un rendu de sa tessiture (fût pour `basse`, cloche
pour `timekeeper` aigu, snap pour `aigu`) plutôt que sur le silence.

---

## 4. Mode « team spirit » (participants, accumulation, distribution)

### 4.1 Modèle

Team spirit **n'ajoute qu'une dimension** au modèle §2 : le champ `participant` sur la voix, plus une liste
de participants dans l'état.

```jsonc
"teamSpirit": {
  "on": false,
  "mode": "accumulation",   // "accumulation" | "distribution" — le SENS de lecture, pas deux modèles
  "participants": [
    { "id": "p1", "label": "Participant 1", "solo": false, "muted": false }
  ]
}
```

- **solo/mute par participant** : au rendu, une voix est audible si `!voice.muted` **et** son participant
  n'est pas `muted` **et** (aucun participant en `solo`, ou son participant est en `solo`). Cette décision se
  branche là où le mute de voix est déjà testé — `percLayerMuted` (l.1030) — en une conjonction
  supplémentaire, **sans toucher au calcul de `t`** (parade au jitter, comme le gap ciblé passe 2).
- Une voix `participant:null` est **commune** (toujours audible, ex. un timekeeper de référence).

### 4.2 Les deux flux d'édition (même modèle, entrées différentes)

- **Accumulation** : les voix entrent une à une selon `enterOrder` (§2), chacune assignée à un participant au
  fur et à mesure. UI : une liste ordonnée « qui entre, quand » ; bouton « ajouter la voix suivante ». C'est
  l'« ordre d'entrée en jam » des fiches grooves (ex. brésil : Surdo segunda → primeira → ganzá → caixa…),
  lu directement depuis la table (§5).
- **Distribution** : on charge **un groove total** depuis la bibliothèque (§5), puis on **partitionne** ses
  voix entre N participants (glisser une voix vers un participant, ou répartition automatique équilibrée par
  tessiture). Invariant : *union des parts = le groove*. Solo d'un participant = entendre sa part sur fond
  muet ; tutti = reconstitution.

### 4.3 Coexistence avec les modes pédagogiques passe 2

Les modes générateur mono-instrument de la passe 2 (`add`/`sub`/`call`/`guide`/`break`, pilotés par
`S.perc.mode` et la voix travaillée `percWork` l.1690) **restent tels quels** mais opèrent sur un
**instrument focal** (§6), pas sur team spirit. **Team spirit et les modes générateur sont deux surfaces
d'édition distinctes partageant le même moteur de voix** — on ne les mélange pas dans une même session de jeu.
Arbitrage à confirmer (§7-A).

---

## 5. Schéma des tables de grooves (conversion des 6 fichiers)

**Données, pas moteur.** Les 6 fichiers `grooves-*.md` sont convertis en tables JS embarquées. Le format des
fiches (vérifié sur `grooves-bresil.md`) mappe directement sur le schéma §2.

### 5.1 Schéma normatif d'un groove

```jsonc
{
  "id": "bresil-samba-batucada",     // slug famille-nom
  "family": "bresil",                // bresil|ouest-africain|funk|reggae|hiphop|rock
  "label": "Samba Batucada",
  "origin": "Rio de Janeiro, Brésil",
  "context": "",                     // prose courte (1re ligne « Contexte » de la fiche)
  "count": 16,                       // 16 bin | 12 tern (champ « Cycle » de la fiche)
  "family_meter": "bin",             // "bin"|"tern" (dérivé du count)
  "tempo": { "min": 120, "max": 145, "jam": 108 },   // « Tempo : … ; jam conseillé … »
  "swing": { "value": null, "uncertain": true },     // % si sourcé, sinon null + uncertain
  "voices": [                        // chaque ligne du bloc « Grille de base » → une voix §2
    {
      "label": "Surdo de primeira",
      "instr": "surdo", "voiceKind": "grave",   // mappé depuis l'instrument nommé (table §5.2)
      "role": "basse",                          // la colonne (grave/médium/aigu) de la fiche
      "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], // "....X.......X..." → 0/1/2
      "enterOrder": 2,                          // « Ordre d'entrée en jam »
      "difficulty": "facile",                   // idem, mention (facile/moyen/difficile)
      "uncertain": false,                       // true si la fiche marque cette grille INCERTAIN
      "description": "fondation, temps 2"       // texte après le tiret dans la fiche
    }
  ],
  "variations": [                    // bloc « Variations » — voix alternatives, hors boucle si break
    { "label": "Tamborim carreteiro", "role": "aigu", "grid": [...], "isBreak": false,
      "note": "débutant, flux simple" }
  ],
  "reliability": "solide",           // « le mieux sourcé »→"élevée" … "reconstruction"→"faible" (§5.3)
  "sources": "Ed Uribe … ; Duduka Da Fonseca … ; Kalango",
  "autocritique": ""                 // repris du bloc AUTO-CRITIQUE de la famille (substitution, micro-timing…)
}
```

Règles de conversion, vérifiées sur le format réel :
- Notation `X`/`x`/`.` → `2`/`1`/`0`, longueur = `count`. (Contrôle : `grid.length === count`, comme
  `check_grooves.py` l'a déjà vérifié sur les 171 grilles.)
- Colonne tessiture `(grave)`/`(médium)`/`(aigu)` → `role`. L'instrument nommé (« Surdo de primeira »,
  « Agogô ») → `instr`/`voiceKind` via la **table de correspondance §5.2**.
- « Ordre d'entrée en jam » (numéroté + facile/moyen/difficile) → `enterOrder`/`difficulty` par voix.
- Toute mention **INCERTAIN** attachée à une grille → `uncertain:true` sur la voix (ou le groove).
- Les **variations marquées « break »/« virada »/« chamada »/« parada »** (cadences déclenchées, pas des
  ostinatos — AUTO-CRITIQUE) → `isBreak:true`, à ne pas boucler.

### 5.2 Table de correspondance instrument nommé → (instr, voiceKind, timbre)

À dresser à la conversion. Les instruments des fiches débordent les 3 timbres actuels (djembe/cajon/dunduns) :
surdo, agogô, caixa, tamborim, ganzá/chocalho, zabumba, triangle, gonguê, alfaia, repique, reco-reco… Chacun
est rattaché à un `instr` (nouveau timbre §3.2 si prioritaire, sinon **substitution par tessiture** §3.3 :
`role` + timbre le plus proche). Cette table est le **verrou** : elle doit exister avant toute conversion,
sinon chaque lot inventerait son mapping (raison du refus de découper avant la spec).

### 5.3 Fiabilité graduée (à porter dans la donnée, pas à masquer)

Verdicts du corpus, repris tels quels dans `reliability` :
- **hip-hop** : le mieux sourcé (swing MPC sourcé Roger Linn) → `élevée`.
- **brésil** : solide (Ijexá réparé, agogô 2 tons vérifié) → `élevée`.
- **funk / reggae / rock** : bons → `moyenne`.
- **ouest-africain** : **le plus faible** — origines/mètres/rôles corroborés, mais **les 57 positions de
  frappe sont des reconstructions INCERTAIN** (transcriptions de référence payantes) → `faible`, toutes voix
  `uncertain:true`.

**Prérequis d'encodage** : les grilles ouest-africaines exigent **validation à l'oreille** (ou livre en main :
Billmeier & Keïta ; Konaté *Rhythmen der Malinke*) **avant** d'être encodées sans le drapeau `uncertain`. La
donnée peut être encodée dès maintenant **avec** `uncertain:true` — le drapeau est visible en UI, il ne bloque
pas la conversion. Idem xote brésilien (grille complétée 15→16) et double rim-tap de « Right Time » (reggae).

### 5.4 Où `decoupe-lots` s'insère (et pas avant)

La conversion des 6 fichiers en tables est **le** chantier découpable de la passe 3 : **un lot par famille**
(6 lots indépendants, aucune dépendance croisée → une seule vague), map = convertir un fichier `grooves-*.md`
en tableau JS selon **ce** schéma (§5.1) et **cette** table de correspondance (§5.2) ; reduce = concaténer les
6 tableaux dans la bibliothèque et re-vérifier les longueurs de grille. Les critères d'acceptation par lot :
`grid.length === count` partout, tout INCERTAIN reporté en `uncertain`, tout break marqué `isBreak`, mapping
instrument conforme à §5.2. **Ce cycle ne se lance qu'à l'étape 3 du plan (§8), le schéma étant alors figé.**

---

## 6. Impact sur les mécaniques existantes (sous multi-instruments)

- **`count` / famille** : inchangé, global (§1). Toutes les voix d'un groove partagent le cycle. `setFamily`
  (l.912) reste le point d'application unique ; §7.7 asservi (clave↔perc) est préservé.
- **Gap unifié (passe 2 §5)** : `S.gap.target` (l.835) cible déjà `all`/`pulse`/`<voiceId>`. Avec des ids
  namespacés (§2), le ciblage par voix continue de fonctionner ; `gapTargetRefresh` (l.1140) itère désormais
  **toutes** les voix vivantes, plus seulement celles de `PERC_INSTR[S.perc.instr]`. Changement mécanique, pas
  sémantique.
- **Micro-timing / offsets** : déjà par-voix (`percOffsets`, l.1688) — aucun changement.
- **Instrument focal (générateur, breaks, styles)** : les modes `add/sub/call/guide/break` et les tables
  `PERC_STYLES`/`PERC_BREAKS` restent **mono-instrument** ; ils opèrent sur un **instrument focal** désigné
  (le sous-ensemble de voix partageant un `instr`), remplaçant les lectures implicites de `S.perc.instr`. Un
  « break » reste « tout le kit **de l'instrument focal** », pas l'ensemble team spirit — sinon la sémantique
  pédagogique passe 2 (apprendre un break de djembé) se disloque. Arbitrage §7-A.
- **Appel-réponse (`percCallSilent`, l.1693)** : mono-instrument, suit l'instrument focal — inchangé.
- **Presets & profil de kit** : `applyKitProfile` (l.2420) produit un kit mono-instrument = **un** instrument
  focal. Team spirit **compose** plusieurs de ces kits (ou charge un groove de la bibliothèque). Rétro-compat
  totale : sans team spirit, un seul instrument focal = comportement passe 2.

---

## 7. Arbitrages

**Tranchés (2026-07-07) :**
- **A — Team spirit vs modes générateur → DISTINCTS.** Les modes pédagogiques passe 2
  (`add/sub/call/guide/break`) restent liés à un **instrument focal** ; team spirit est de l'assemblage
  libre. Deux surfaces d'édition qu'on ne mélange pas (§4.3, §6). Préserve la sémantique passe 2 (un break =
  tout le kit d'**un** instrument focal).
- **D — Instruments du corpus sans timbre dédié → SUBSTITUTION PAR TESSITURE.** Repli sur le timbre le plus
  proche du `role` (fût=basse, cloche=timekeeper aigu, snap=aigu) pour caixa, tamborim, ganzá, alfaia,
  triangle, gonguê, repique… (§3.3, §5.2). On ne code pas des dizaines de recettes ; cohérent avec
  l'AUTO-CRITIQUE des corpus (le rôle prime sur l'instrument exact).
- **E — Ouest-africain → ENCODER AVEC `uncertain:true` DÈS L'ÉTAPE 3.** Drapeau visible en UI, non bloquant ;
  validation à l'oreille **en parallèle**, promotion du drapeau ensuite (§5.3).

**Encore ouverts (non bloquants, à trancher à l'implémentation) :**
- **B — Namespacing des ids.** Convention proposée `<participant|src>.<instr>.<voiceKind>` (§2). À valider ;
  impacte la migration des presets (l.2286) et le gap ciblé (l.1140).
- **C — Reco-reco.** Timbre le plus dur ; à prototyper isolément (étape 2). Repli si non satisfaisant :
  substitution par tessiture (bruit filtré aigu continu) marquée « approximation » — cohérent avec D.
- **F — Portée de la bibliothèque en distribution.** Un groove chargé impose-t-il son `count`/famille à la
  session (écrase la famille courante) ? Design assumé proposé : oui, charger un groove pose sa famille via
  `setFamily`. À confirmer.

---

## 8. Plan d'implémentation ordonné (une étape = une session, fichier HTML complet)

| # | Étape | Touche au moteur ? | S'appuie sur | `decoupe-lots` ? |
|---|---|---|---|---|
| 1 | **✅ FAIT (2026-07-07)** — **Moteur multi-instruments** : `instr` porté par la voix via le registre `percMeta` (`{voix: {instr, voiceKind, freq}}`), reconstruit au point de passage unique `buildPercGrids`→`rebuildPercMeta` ; `playPerc` re-routé sur `meta.instr + '.' + meta.voiceKind` (repli focal = passe 2 byte-for-byte). Analyse confirmée : `playPerc` (l.1012) est le **seul** lecteur per-voix de `S.perc.instr` ; les ~17 autres lectures sont focales légitimes, inchangées. **Namespacing des ids reporté à l'étape 4** (voir note). **Aucune UI nouvelle.** Recette machine conforme (`metronome-passe3-etape1-recette.md`). | oui — audio (l.1001-1024) | §1, §2, §3.1, §6 | non |
| 2 | **Nouveaux timbres** : agogô + surdo (re-paramétrage `percBell`/`percDrum`), **prototype reco-reco** isolé. Additif à la table de routage. | oui — table audio (l.1012) | §3.2 | non |
| 3 | **Bibliothèque de grooves (données)** : figer la table de correspondance §5.2, puis convertir les 6 `grooves-*.md` en tables JS. **Cycle `decoupe-lots` : 1 lot/famille, 1 vague, reduce = concaténation + re-vérif longueurs.** | non (données) | §5 | **oui — ici** |
| 4 | **Mode team spirit** : dimension `participant`, liste de participants, solo/mute par participant (conjonction dans `percLayerMuted` l.1030), flux accumulation (ordre d'entrée) + distribution (partition d'un groove), chargement depuis la bibliothèque. | oui — mute (l.1030), UI | §4, §5 | non |
| 5 | **Recette complète** : machine (preview headless, port 8731) + appareil. Non-régression passe 2 (un seul instrument = comportement inchangé), multi-instruments audibles, solo/mute participants, distribution reconstituant le groove. | — | tout | non |

**Ordre justifié :** l'étape 1 est le socle dont tout dérive (le schéma de voix figé conditionne les tables
§5 et le team spirit §4) ; l'étape 2 rend audibles les grooves du corpus avant de les encoder ; l'étape 3
n'expose aucun risque moteur et n'est lançable **qu'après** le gel du schéma (d'où le refus de découper plus
tôt) ; l'étape 4 consomme voix + tables + participants ; l'étape 5 solde la recette comme en passe 2.

**Note — namespacing des ids (arbitrage B), reporté de l'étape 1 vers l'étape 4 (décidé à l'implémentation).**
Le namespacing (`<participant>.<instr>.<voiceKind>`) n'est nécessaire que pour lever une **collision d'ids** :
deux exemplaires du même instrument, ou deux instruments partageant un `voiceKind`. Aucun de ces cas
n'existe avant l'introduction des **participants** (étape 4). Tant que l'UI n'édite qu'un instrument focal
(+ clave), les ids locaux (`basse`, `grave`…) sont uniques et suffisent — et les garder tels quels a évité de
toucher les dizaines de chemins qui indexent `percGrids`/`PERC_INSTR.base`/styles/breaks/step-grid par id
local, réduisant d'autant le risque de l'étape 1. Le registre `percMeta` **préserve déjà** toute voix hors
instrument focal (branche `prev[vid]` de `rebuildPercMeta`) : l'étape 4 y injectera des ids namespacés sans
retoucher le moteur audio. Le champ `id` du §2 reste normatif ; sa **valeur** devient namespacée à l'étape 4.

**Parallélisable hors session de code** : la validation à l'oreille du corpus (ouest-africain en priorité,
§5.3) peut se mener pendant les étapes 1-2, pour promouvoir les grilles `uncertain` avant l'étape 3.

---

## 9. Faits à ne pas re-litiger (déjà tranchés, rappel)

- Français ; **fichier HTML complet, jamais un patch** ; app autonome offline mobile-first.
- Source = `metronome.html` (dossier « test skill decoupe ») ; `index (6).html` périmé, ignoré.
- **Aucune IA à l'exécution** — moteur de règles embarqué uniquement.
- **Découpe** : non pour le fichier unique ; **oui pour les tables de grooves** (étape 3, données).
- **Push** différé sine die (tutoriels sur l'ancienne version) — ne pas relancer. README périmé à régénérer
  (`readme-dev`) et jeton GitHub en clair à révoquer **avant** tout push — côté utilisateur.
- Corpus grooves : format conforme (171 grilles vérifiées) ; contenu gradué — ouest-africain à valider à
  l'oreille avant encodage définitif.

---
*Pièces : `metronome.html` (source), `grooves-{bresil,ouest-africain,funk,reggae,hiphop,rock}.md` (intrant
données), `grooves-bresil-correctif-opus.md` (traçabilité), `metronome-passe2-spec.md` (référence close),
`metronome-passe3-brief-reprise.md` (brief de reprise).*

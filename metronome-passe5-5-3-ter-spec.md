# Spec 5.3-ter — « Basse legato & respiration »

**Statut : VALIDÉE le 2026-07-10 et IMPLÉMENTÉE — commit `7a54a0a`, branche `metronomefunk-0.5.3-ter`, recette 28/28.** (Reste : validation à l'oreille sur HP de bureau.)
Base : branche `metronomefunk-0.5.3-bis` (commit `063433d`, recettes 5-1 → 5-3-bis toutes vertes).
Branche cible : `metronomefunk-0.5.3-ter`. Estampille de build : `metronomefunk-0.5.3-ter`.

## 1. Objet

Ôter le caractère trop détaché / trop sec de la basse générative sans nuire au calage rythmique.
Diagnostic (mesuré sur exports directs de 5.3-bis) : grave présent (91 % < 120 Hz, pic 41 Hz),
staccato d'origine corrigé ; restent trois manques — notes trop détachées entre elles, release
trop court (coupure abrupte), aucune traîne d'espace (« chambre sourde »).

## 2. Les cinq leviers (synthèse Web Audio maison, zéro dépendance)

### 2.1 Curseur « détaché ↔ lié » (chevauchement + release) — VALIDÉ réglable

Nouveau réglage UI dans `secBass` : curseur `#bassLegato` (0–100, **défaut 50** = dosage
léger→moyen tranché au §3 du brief). Il pilote **deux** paramètres, d'un seul geste :

- **durFill effectifs** (interpolation linéaire, L = curseur/100) :

  | art    | L=0 (détaché = état 5.3-bis) | L=0,5 (défaut) | L=1 (très lié) |
  |--------|------------------------------|----------------|----------------|
  | finger | 0,90                         | **1,10**       | 1,30           |
  | slap   | 0,82                         | **1,05**       | 1,28           |
  | pop    | 0,80                         | **1,05**       | 1,30           |
  | ghost  | 0,35 — **jamais affecté**    | 0,35           | 0,35           |

  À L ≥ ~0,25 la durée finger dépasse un pas : la queue déborde sur l'attaque de la note
  suivante = le liant. Plancher audible conservé (`durFloor` inchangé).

- **Release** (levier 2.2 du brief, embarqué dans le même curseur) :
  `rel = min(0,06 + L × 0,12 ; dur × (0,30 + L × 0,20))` — de 60 ms/×0,30 (état -bis)
  à 180 ms/×0,50 (très lié). La note s'éteint au lieu de se couper ; à L=0 comportement
  -bis strictement identique. Ghost : ses 60–75 ms de durée bornent mécaniquement son
  release — il reste piqué sans cas particulier.

- **État & persistance** : `S.bass.legato` (0–1, défaut 0,5), clé `fm-metro-bass`,
  restauré par `bassRestore()` avec garde-fou. `vary=false` et fracs **inchangés** —
  le curseur ne touche que durées et enveloppe, jamais le tirage.

### 2.2 Corps soutenu remonté (écart attaque→corps ~6 dB → ~3-4 dB)

- **Sweep exciteur** : aujourd'hui `cutoffCeil → cutoffFloor` sur `dur×0,8` (refermé tôt).
  Nouveau : descente vers un **palier de tenue** `cutoffFloor + 0,35 × (cutoffCeil −
  cutoffFloor)` atteint à `dur×0,5`, **maintenu pendant la tenue**, puis descente vers
  `cutoffFloor` seulement pendant le release.
- **bodyGain** : 0,30 → **0,38** (les quatre articulations, ghost compris — son niveau
  reste gouverné par son gain global).
- Niveau de tenue `sus = 0,78 × vol` inchangé (l'ouverture du filtre fait le travail).

### 2.3 Réverb courte et discrète — basse seule

Bus de basse persistant (créé paresseusement au premier `bassVoice`) :
`sortie enveloppe → bassBus → high-pass 35 Hz → [dry 1,0 + wet 0,12 via ConvolverNode] → masterGain`.

- **Impulsion générée à la volée** : bruit blanc × décroissance exponentielle, ~0,35 s,
  stéréo (2 canaux décorrélés). Queue très brève, mix bas (wet 0,12) : ôte le côté sec
  sans flouter l'attaque ni le time.
- **Réglable off/discret** : case `#bassSpace` « Espace (réverb courte) » dans `secBass`,
  cochée par défaut, persistée (`S.bass.space`). Décochée = wet 0.
- **Pas sur les percussions** (netteté du métronome préservée) ; défensif si
  `createConvolver` absent (stubs headless) → chemin dry seul, aucun crash.

### 2.4 Limiteur de bus master — OBLIGATOIRE

Chevauchement + release long + réverb s'additionnent → écrêtage garanti (+3 dBFS déjà
mesuré à 82 BPM). `DynamicsCompressor` quasi-brickwall inséré dans `ensureCtx()` :
`masterGain → limiter → destination` — seuil **−1,5 dB**, knee 0, ratio **20:1**,
attaque **3 ms**, release **120 ms**. C'est la réponse au conflit basse/percussion
(pas de sidechain — il casserait la référence rythmique). Défensif si
`createDynamicsCompressor` absent (stubs des recettes 5-1 → 5-3-bis, qui doivent passer
**non modifiées**) → `masterGain → destination` comme avant.

### 2.5 High-pass ~35 Hz — couche basse seule

Biquad `highpass` 35 Hz (Q 0,7) en tête du bus de basse (cf. 2.3). E1 = 41 Hz est la note
la plus basse possible (le résolveur replie tout entre 41 et ~78 Hz) : la fondamentale
n'est jamais touchée, seule la « boue » sub-sonique part.

## 3. Non-régression / garde-fous

Ghost toujours piqué (durFill fixe 0,35, hors curseur) ; déterminisme `vary=false` et fracs
inchangés ; progressions/tonalités 5.3 intactes ; no-op strict si `S.bass.on` faux (le bus
basse n'est créé qu'à la première note) ; recettes 5-1, 5-1-bis, 5-2, 5-3, 5-3-bis passent
**sans modification**. La forme d'enveloppe, le liant et la réverb restent des critères
d'oreille — le headless prouve la mécanique, pas le goût.

## 4. Recette headless (`recette-5-3-ter.js`)

1. Au défaut (L=0,5) : durée finger > `stepDur` (chevauchement — la queue déborde) ;
   slap/pop > `stepDur` aussi.
2. À L=0 : durées et release identiques à 5.3-bis (continuité).
3. Ghost : toujours < finger et < son pas, à L=0, 0,5 et 1.
4. Release : borne `min(0,06+0,12L ; dur×(0,30+0,20L))` vérifiée sur l'automation du gain
   (param-enregistreurs) à L=0 et L=1.
5. Limiteur : nœud présent entre `masterGain` et `destination` quand
   `createDynamicsCompressor` existe ; chemin direct sinon (pas d'exception).
6. High-pass 35 Hz présent sur le bus basse ; percussions non routées dedans.
7. Monotonie tempo et plancher conservés ; déterminisme bit-à-bit ; persistance
   `legato`/`space`.
8. Non-régression : 5-1 (20), 5-1-bis (21), 5-2 (23), 5-3 (38), 5-3-bis (15) inchangées.

## 5. Hors périmètre (reconduit)

Réverb sur les percussions ; réverb longue ; sidechain ; famille ternaire ; drop-outs et
écran de jeu (5.4) ; micro-timing laid-back/pushed ; saturation additionnelle (l'exciteur
WaveShaper en tient lieu).

## 6. Livraison

`index.html` complet (jamais de patch) + `recette-5-3-ter.js` + README (journal daté) ;
push branche `metronomefunk-0.5.3-ter` via github-push (clef demandée au moment du push,
jeton à effacer ensuite).

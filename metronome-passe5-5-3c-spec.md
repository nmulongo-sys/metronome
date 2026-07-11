# Spec 5.3c — « Recalibrage du curseur legato »

**Statut : VALIDÉE et IMPLÉMENTÉE (2026-07-10) — recette 21/21, non-régression complète verte.**
Base : branche `metronomefunk-0.5.3-ter` (commit `7a54a0a`, recettes 5-1 → 5-3-ter toutes vertes).
Branche cible : `metronomefunk-0.5.3c`. Estampille de build : `metronomefunk-0.5.3c`.
*Nomenclature : depuis cette étape, les suffixes latins (bis/ter/quater) cèdent la place aux
lettres — 5.3c succède à 5.3-ter. Les artefacts déjà livrés gardent leurs noms historiques.*

## 1. Objet

Verdict d'écoute (HP de bureau, 92 BPM) sur 5.3-ter : **le bout droit du curseur (L=1 :
finger 1,30 · release 180 ms/×0,50) est le *minimum* acceptable de legato** — « c'était bien
mais il ne fallait pas moins ». Toute la course actuelle du curseur couvre donc une zone
inutilisable. Recalibrage : la fenêtre du curseur glisse d'un cran vers le lié —
**l'ancien maximum devient le nouveau plancher**, la course s'étend au-delà.

Dosages tranchés en session : **défaut L≈1,25** (léger cran au-dessus du plancher validé),
**plafond L=2,0** (extension large).

## 2. Le recalibrage (aucune nouvelle formule — extrapolation des droites -ter)

### 2.1 Mapping curseur → L

- Le curseur `#bassLegato` (0–100) et le stockage `S.bass.legato` (fraction 0–1)
  **gardent leur sémantique de position** ; seul le moteur change de fenêtre :
  `L = 1 + fraction` (donc L ∈ [1, 2]). Les deux points de calcul :
  release (`bassVoice`, actuel `index.html:1452`) et durFill (`realize`, actuel
  `index.html:1828`).
- **Défaut : curseur 25** (L=1,25) — `value="25"` sur le range, `legato: 0.25` dans l'état
  initial, garde-fou `bassRestore()` inchangé (clamp fraction [0,1], défaut 0,25).
- **Libellé UI** : « Détaché ↔ lié » devient **« Lié ↔ très lié »** (le pôle « détaché »
  n'existe plus, par décision d'oreille).

### 2.2 durFill effectifs (mêmes droites que -ter, prolongées)

| art    | curseur 0 (L=1) **= ancien max -ter, plancher validé à l'oreille** | curseur 25 (défaut, L=1,25) | curseur 100 (L=2) |
|--------|-------------------------------------------------------------------|------------------------------|--------------------|
| finger | 1,30                                                               | **1,40**                     | 1,70               |
| slap   | 1,28                                                               | **1,395**                    | 1,74               |
| pop    | 1,30                                                               | **1,425**                    | 1,80               |
| ghost  | 0,35 — **jamais affecté**                                          | 0,35                         | 0,35               |

Formules inchangées : `finger = 0,90 + 0,40·L`, `slap = 0,82 + 0,46·L`, `pop = 0,80 + 0,50·L`.
Plancher audible (`durFloor` 20 ms) et adaptation tempo (`durTempo`) inchangés.

### 2.3 Release (même formule, prolongée)

`rel = min(0,06 + 0,12·L ; dur × (0,30 + 0,20·L))` avec L ∈ [1, 2] :
de **180 ms/×0,50** (plancher = ancien max -ter) à **300 ms/×0,70** (très lié),
**210 ms/×0,55** au défaut. Ghost toujours borné mécaniquement par sa durée.

### 2.4 Persistance & migration

- Clé `fm-metro-bass`, champ `legato` : **inchangé** (fraction 0–1). Aucune migration de
  format. Une valeur héritée de -ter (ex. 0,5, ancien défaut) est relue telle quelle comme
  position → L=1,5 : **toute valeur héritée atterrit dans la zone validée** (≥ plancher),
  c'est le comportement voulu.
- `S.bass.space` et le reste de l'état : intacts.

### 2.5 Ce qui ne bouge PAS

Tirage (`vary`, fracs, piliers), ghost (0,35, hors curseur), corps soutenu (palier du sweep,
bodyGain 0,38/0,28, sus 0,78), bus basse (HP 35 Hz, réverb wet 0,12, case « Espace »),
limiteur master (−1,5 dB, 20:1, 3 ms/120 ms — il absorbe l'empilement accru : à L=2,
jusqu'à ~2 notes + queues superposées), créations défensives, hook `fmMetroBass().bus()`.

## 3. Retouches documentées à `recette-5-3-ter.js`

Ses blocs [1] et [2] figent les dosages -ter aux positions 0/50/100 du curseur — caducs par
construction après recalibrage (même cas que les 2 retouches de `recette-5-3-bis`,
assumées au README). Retouches minimales, mécanique intacte :

- [1] curseur 50 : attendu 1,10 → **1,50** (L=1,5).
- [2] curseur 0 : attendus 0,90/rel 5.3-bis → **1,30 / rel min(0,18 ; dur×0,50)** — soit
  exactement les anciennes assertions « L=1 » de ce même bloc, qui deviennent le plancher ;
  curseur 100 : attendus 1,30/rel ×0,50 → **1,70 / rel min(0,30 ; dur×0,70)**.
- Le sens du bloc [2] change de « continuité 5.3-bis » à « **plancher = ancien max -ter
  strict** » (la continuité -bis a été prouvée en son temps ; elle disparaît de l'UI par
  décision d'oreille). Commentaire d'en-tête mis à jour, retouche journalisée au README.
- [3]–[7] (ghost, limiteur, bus, non-régression, persistance — dont `legato 0,30` persisté
  au curseur 30) : **inchangés** — le stockage en fraction les préserve tels quels.
- L'assertion d'estampille du bloc [7] teste `metronomefunk-0\.5\.3-ter` : elle est
  **génériquée** en `metronomefunk-0\.5\.3` (même retouche que celle déjà faite à
  `recette-5-3-bis.js`, journalisée).

**Amendement (constaté à l'exécution)** — `recette-5-3-bis.js` est également touchée, sa
retouche -ter (« curseur forcé à 0 = état -bis strict ») étant cassée par construction :
curseur 0 donne désormais le plancher 1,30, le dosage 0,90/< stepDur n'est plus atteignable.
3e retouche documentée : attendus de [1] alignés sur le plancher (1,30, > stepDur),
invariant anti-staccato d'origine (> 100 ms) conservé tel quel, estampille génériquée sans
tiret (`0\.5\.3-` matchait `-bis/-ter` mais pas `c`).

## 4. Recette headless (`recette-5-3c.js`)

1. Plancher (curseur 0) : finger 1,30 · slap 1,28 · pop 1,30 ; release min(0,18 ; dur×0,50)
   vérifié sur l'automation — **identique bit à bit à l'ancien max -ter** (continuité avec
   le son validé à l'oreille).
2. Défaut (curseur 25, état neuf) : finger ≈ 1,40 × stepDur × durTempo ; release
   min(0,21 ; dur×0,55).
3. Plafond (curseur 100) : finger 1,70 · slap 1,74 · pop 1,80 ; release min(0,30 ; dur×0,70).
4. Monotonie : durée finger strictement croissante sur curseur 0 → 25 → 50 → 100.
5. Ghost : 0,35 constant aux curseurs 0/25/100, toujours < finger et < son pas.
6. Persistance : `legato` stocké en fraction (défaut 0,25 sur état vierge ; garde-fou) ;
   valeur héritée 0,5 relue sans migration.
7. Estampille `metronomefunk-0.5.3c` ; limiteur et bus basse toujours câblés (sondage
   via `bus()`).
8. Non-régression : 5-1 (20), 5-1-bis (21), 5-2 (23), 5-3 (38) **sans modification** ;
   5-3-bis (15) et 5-3-ter (28) avec les seules retouches du §3.

## 5. Hors périmètre (reconduit)

Legato dépendant du tempo (validé à 92 BPM ; à réévaluer à l'oreille si besoin, pas dans
cette étape) ; sidechain, saturation additionnelle, réverb percussions (écartés
définitivement) ; famille ternaire ; étape suivante — drop-outs, écran de jeu, swing.

## 6. Livraison

`index.html` complet (jamais de patch) + `recette-5-3c.js` + `recette-5-3-ter.js`
retouchée + README (journal daté, mention du changement de nomenclature) + statut des
specs -ter (résidu « PROPOSITION » sur GitHub) et 5.3c corrigés ; push branche
`metronomefunk-0.5.3c` via github-push (clef demandée au moment du push, jeton à
effacer ensuite).

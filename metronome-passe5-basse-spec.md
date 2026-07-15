# Métronome — Spécification passe 5 : « Basse funk » (accompagnement génératif)

**Statut : VALIDÉE le 2026-07-09 (rév. 2 ; questions du §9 tranchées : liste des 6
progressions retenue telle quelle, tonalité par défaut E, section `secBass` autonome).**
**Rattachement : cours funk, principe FUNK-I2 (verrouillage sur la basse slap) ; brique
d'accompagnement des deux parcours cajón/djembé.**

**Amendements rév. 2 (tranchés par Jean) :**
- « Plusieurs vélocités » = profils de dynamique des notes (ghost/normal/slap), **confirmé** ;
  s'y ajoute une **adaptation continue de la vélocité au tempo** (§2.3).
- Harmonie : non plus un vamp un accord, mais un **choix parmi 6 progressions classiques
  du funk**, transposables dans les **12 tonalités** (entraînement de l'oreille, §2.4).

---

## 1. Objet

Une voix de **basse électrique funk générée à la volée**, qui accompagne le percussionniste.
Elle doit : sonner de façon crédible (articulations funk : doigté, slap, pop, ghost),
se moduler en temps réel (densité, dynamique, tempo), suivre une progression harmonique
choisie dans n'importe quelle tonalité, et servir d'outil pédagogique (verrouillage
rythmique, oreille harmonique, drop-outs de maintien du time).

Boucles audio préenregistrées écartées (rigides, dégradées au changement de tempo).
**Tone.js écarté** (règle : zéro dépendance ; l'ordonnanceur lookahead existant suffit).
**Échantillons écartés en v1** (fichier unique offline) : synthèse Web Audio, style maison.

## 2. Modèle de données

```js
S.bass = {
  on: false,
  pattern: 'theOne',        // gabarit rythmique d'intentions (BASS_PATTERNS)
  prog: 'vamp1',            // progression harmonique (BASS_PROGS)
  key: 'E',                 // tonalité, chromatique (12 choix)
  density: 2,               // 1 allégé · 2 normal · 3 chargé
  vel: 'mixte',             // profil de vélocités : 'plat' | 'mixte' | 'contraste'
  vary: true,               // variations probabilistes (sinon motif figé)
  swingFollow: true,        // les 16es de la basse suivent S.swing
  drop: { on: false, everyN: 4, lenBeats: 2 }   // drop-outs (réutilise la machine gap)
}
```

Persisté dans `localStorage` (`fm-metro-bass`), même mécanique que `S.play`.

### 2.1 Gabarits rythmiques d'intentions (BASS_PATTERNS)

Grille de **16 pas** (famille binaire ; basse inactive en famille ternaire, v1).
Chaque pas encode une **intention musicale**, pas une note fixe :

```js
// intention : { deg, art, w, lvl }
//   deg : degré relatif À L'ACCORD COURANT ('R', 'oct', '5', '3', 'b7', 'appr')
//   art : articulation ('finger' | 'slap' | 'pop' | 'ghost' | 'rest')
//   w   : probabilité de jouer ce pas [0..1] (1 = pilier, toujours joué)
//   lvl : densité minimale requise (1/2/3) — le pas n'existe qu'à densité ≥ lvl
```

Bibliothèque initiale : **4 gabarits** — `theOne` (ancre sur le 1, FUNK-T1),
`syncopeGrave` (grave anticipé/retardé, FUNK-B3), `octaves` (fondamentale/octave
pompée, disco-funk), `ghostPendule` (nappe de ghosts + piliers, FUNK-D1).
Gabarit rythmique et progression harmonique sont **orthogonaux** (tout gabarit
se joue sur toute progression).

### 2.2 Vélocités — profils

Trois niveaux de frappe, mappés sur gain + brillance du filtre :
**ghost** (~0.25), **normal** (~0.7), **accent/slap** (1.0). Le profil `vel` règle
l'écart : `plat` (tout ~normal, lisible pour débutant), `mixte` (défaut),
`contraste` (écart maximal ghost↔slap, tier avancé — FUNK-P3 : la poche naît du
contraste accents/ghosts sur nappe régulière).

### 2.3 Vélocités — adaptation au tempo (nouveau, rév. 2)

Un bassiste allège et raccourcit à tempo rapide, laisse sonner et remplit à tempo
lent. Adaptation **continue** (interpolation linéaire bornée sur le BPM, pas de
paliers), appliquée après le profil `vel` :

```js
// k = clamp((tempo - 70) / (150 - 70), 0, 1)   // 0 = lent, 1 = rapide
gainGhost : 0.30 → 0.16        // les ghosts s'effleurent à tempo rapide
durNote   : ×1.15 → ×0.70      // fraction de la durée du pas (legato → sec)
wGhosts   : ×1.20 → ×0.65      // proba des pas non-piliers (la ligne se dépouille)
```

Les **piliers** (`w=1`) ne bougent jamais : l'ancre harmonique et The One restent,
seule l'ornementation respire avec le tempo. Valeurs = point de départ à ajuster
à l'oreille (critère de recette, comme percScrape en passe 3).

### 2.4 Progressions harmoniques (BASS_PROGS, nouveau rév. 2)

Le funk vit sur des vamps courts : 6 progressions classiques, chacune une boucle
de 1 à 12 mesures. Un accord = `{ deg, quality }` (degré relatif à `key`) ; les
intentions (§2.1) se résolvent contre l'accord de la mesure courante.

| id | Boucle | Modèle stylistique |
|---|---|---|
| `vamp1` | I7 (1 mes.) | vamp statique James Brown |
| `vamp2` | I7 → IV7 (2 mes.) | Sex Machine, deux accords |
| `dorien` | i7 → IV7 (2 mes.) | Chameleon (Herbie Hancock) |
| `mixo` | I7 → bVII (2 mes.) | rock-funk mixolydien (Thank You / War) |
| `blues` | 12-bar funk blues I7-IV7-I7-V7-IV7-I7 | blues funké |
| `jazzfunk` | ii7 → V7 (2 mes.) | jazz-funk / boogaloo |

`key` : sélecteur chromatique 12 tonalités (E par défaut, tessiture de basse
E1–D2 pour la fondamentale ; les degrés se replient dans la tessiture).
Objectif oreille : même gabarit + même progression rejoués dans une autre
tonalité ⇒ l'élève entend la transposition, pas un nouveau morceau.

Position dans la progression : compteur de mesures propre
(`bassBarIdx`, avancé dans `startNewCycle`, remis à zéro au `start()`).

## 3. Moteur audio (synthèse, section AUDIO)

Trois fonctions nouvelles, mêmes conventions que percDrum/percSnap :

- `bassFinger(t, freq, vol, dur)` — osc triangle + sub sinus, enveloppe de filtre
  passe-bas (rond, doigté).
- `bassSlap(t, freq, vol, dur)` — idem + transitoire : grain de `noiseBuf`
  passe-haut bref (claquement du pouce) + filtre plus ouvert.
- `bassPop(t, freq, vol, dur)` — saw filtrée, enveloppe de filtre rapide et haute,
  transitoire fin — le « tiré ».
- ghost = `bassFinger` court, volume bas, filtre fermé.

Hauteurs : table chromatique depuis `key` (E1≈41,2 Hz) ; audibilité des graves
sur haut-parleur Android assurée par les harmoniques du triangle/saw — à valider
à l'oreille, critère de recette 5.1.

## 4. Intégration moteur (points d'ancrage minimaux)

1. **`computeCycle()`** : si `S.bass.on` et famille binaire, itérer le motif
   **réalisé** de la mesure et empiler
   `events.push({ frac, layer: 'bass', note: {freq, art, gain, dur} })`.
   Swing des 16es appliqué aux pas impairs si `swingFollow` (même formule que
   `subPositions`, FUNK-T3).
2. **`bassRealize()`** appelée dans `percOnNewMeasure()` (une réalisation par
   mesure) : résout l'accord courant (`prog`, `bassBarIdx`, `key`), tire les pas
   selon `w` × modulation tempo (§2.3), filtre par `density`, applique `vel`.
   `vary:false` ⇒ piliers + pas `w ≥ 0.5`, **déterministe** (recette headless,
   multi-appareils).
3. **`playClick()`** : branche `layer === 'bass'` → routage par `art`.
4. **Drop-outs** : machine gap existante, ciblage `layer==='bass'` (aucune
   seconde machine à états). Pendant le drop-out, percussion et pulsation
   continuent : l'élève tient le time et doit retomber avec la basse.
5. **Team spirit** : la basse est accompagnement, hors `percGrids` — ignore
   `tsMuted` (pas une voix de participant).

Hors `S.bass.on`, tout est no-op : non-régression stricte des passes 1–4.

## 5. UI

- **Mode Configurer** : section `<details>` `secBass` — « Basse funk » : on/off,
  gabarit, **progression**, **tonalité (12)**, densité (3 crans), profil de
  vélocités, variations oui/non, drop-outs (période + durée).
- **Écran de jeu (mode Jouer)** : trois commandes — basse on/off, densité,
  drop-outs on/off. Le reste vit dans Configurer.
- **Visualisation** : témoin d'activité (point pulsant sur les frappes) + affichage
  de l'**accord courant** (ex. « E7 ») — utile pour l'oreille sans partition.
  Pas de grille éditable en v1 ; la basse n'entre pas dans les briques joueurs.

## 6. Pédagogie (ce que permet l'architecture)

- **Verrouillage (FUNK-I2)** : caler slap/tone sur syncopes et silences de la basse.
- **Densité** : alléger/charger selon le niveau — paramètre par niveau des
  parcours à 4 niveaux.
- **Oreille harmonique** : même groove transposé dans les 12 tonalités ;
  progression affichée, entendue, intériorisée.
- **Drop-outs** : test d'autonomie du time, périodicité/durée réglables.

## 7. Découpe en étapes (une étape = une session)

| Étape | Contenu | Recette |
|---|---|---|
| **5.1** | Synthèse (finger/slap/pop/ghost), état `S.bass`, gabarit `theOne` sur `vamp1` en mode déterministe, branche `layer:'bass'`, `secBass` minimale (on/off, tonalité, gabarit) | headless : events `bass` aux fracs attendues ; déterminisme ; no-op si off ; écoute Android (graves audibles) |
| **5.2** | Générateur probabiliste (`bassRealize`, `w`, densité, profils `vel`), **adaptation tempo §2.3**, 3 gabarits restants, persistance | headless : densité 1 ⊂ 2 ⊂ 3 (piliers constants) ; à 70 vs 150 BPM, gains ghost et nombre de pas non-piliers décroissants ; `vary:false` inchangé |
| **5.3** | **Progressions §2.4** : BASS_PROGS, `bassBarIdx`, résolution degré→fréquence, sélecteurs progression+tonalité, affichage accord courant | headless : sur `blues`, la fondamentale change aux mesures 5/9/11 conformément à la grille ; transposition : mêmes fracs, fréquences ×2^(n/12) |
| **5.4** | Drop-outs via gap ciblé, commandes écran de jeu, swing des 16es, polissage mobile | headless : silence basse pendant N temps, percussion intacte ; swing appliqué aux pas impairs |

Livraison : fichier complet à chaque étape, entrée datée au journal (README),
proposition de push github-push après code+README. Jamais de patch.

## 8. Hors périmètre (v1)

Famille ternaire ; progressions personnalisées/éditables ; micro-timing propre de
la basse (laid-back/pushed — passe ultérieure, tier artiste) ; échantillons audio ;
export de la ligne de basse ; walking bass et changements d'accord intra-mesure.

## 9. Questions tranchées (validation du 2026-07-09)

1. **Liste des 6 progressions** (§2.4) : retenue telle quelle.
2. **Tonalité par défaut** : E.
3. **Placement UI** : section `secBass` autonome, rattachable plus tard à une
   section « Cours funk ».

**Workflow de fin d'étape (ajouté à la validation)** : à chaque fin d'étape,
livrer un md combiné **brief de reprise + README à jour**, terminé par la
reconduction de cette même consigne pour l'étape suivante.

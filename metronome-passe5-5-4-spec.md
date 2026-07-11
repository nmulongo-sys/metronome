# Spec 5.4 — « Drop-outs, écran de jeu, swing des 16es » (dernière étape de la passe 5)

**Statut : VALIDÉE le 2026-07-10 (« go validé », design du §2.1 retenu : fonction pure de
`measureCount`, machine gap intouchée) — IMPLÉMENTÉE (build `metronomefunk-0.5.4`,
recette 40/40, non-régression 7 recettes vertes).**
**Base : branche `metronomefunk-0.5.3c` (build `metronomefunk-0.5.3c · 2026-07-10`), dossier local `metronomefunk/`.**
**Rattachement : spec de passe §7 (étape 5.4) — drop-outs via gap ciblé, commandes écran de jeu, swing des 16es, polissage mobile. FUNK-T1 (The One), FUNK-T3 (swing des 16es), §6 (drop-outs = test d'autonomie du time).**

---

## 1. Objet

Clore la passe 5 : la basse devient un **partenaire d'exercice complet** — elle sait se taire
périodiquement pour tester le time de l'élève (drop-outs), elle suit le swing du métronome
(16es swinguées, FUNK-T3), et elle se pilote depuis l'**écran de jeu** sans passer par
Configurer (on/off, densité, drop-outs), avec l'accord courant affiché là où l'élève regarde.

Aucune nouvelle synthèse, aucun nouveau son : 5.4 ne touche ni aux voix (`bassFinger`/`bassSlap`/
`bassPop`), ni au legato 5.3c, ni au bus basse. Hors `S.bass.on`, tout reste no-op strict.

## 2. Drop-outs

### 2.1 Point à trancher — écart assumé avec la lettre du §4.4 de la spec de passe

Le §4.4 dit « machine gap existante, ciblage `layer==='bass'` ». À l'implémentation, cette
lettre est **incompatible avec l'état dormant déjà validé** `S.bass.drop = { on, everyN,
lenBeats }` :

- la machine gap est **granulaire à la mesure** (`updateGapForNewMeasure` → booléen
  `mutedThisCycle` par cycle) ; `lenBeats` demande une granularité **au temps** ;
- la machine gap n'a qu'**une cible** (`S.gap.target`) : brancher les drop-outs dessus
  confisquerait le réglage gap de l'utilisateur (impossible de travailler gap sur la
  pulsation ET drop-outs basse en même temps — combinaison pédagogiquement utile).

**Proposition** : honorer l'**esprit** de la contrainte (« aucune seconde machine à états »)
plutôt que sa lettre — le drop-out est une **fonction pure du compteur de mesures existant**
(`measureCount`, celui du cadran « mes. N »). Zéro état nouveau : pas de compteurs
play/mute, pas de `mutedThisCycle` bis, uniquement de l'arithmétique. La machine gap n'est
pas modifiée d'un octet.

*Alternative écartée (mais réalisable si tu préfères la lettre)* : ajouter une cible `bass`
au sélecteur du gap unifié. Coût : `lenBeats` abandonné (granularité mesure), conflit de
cible, et les commandes drop de `secBass`/écran de jeu deviendraient une façade sur `S.gap`.

### 2.2 Définition du trou (re-entrée sur The One)

Périodes de `everyN` mesures. Le trou couvre les **`lenBeats` derniers temps de chaque
période** : la basse lâche en fin de période et **re-rentre sur le 1** de la mesure suivante
(FUNK-T1 — le retour sur The One confirme ou sanctionne le time tenu pendant le silence).

Formellement, avec `E = everyN × S.beats` (période en temps) et `g` la position globale
d'une note en temps (`g = (measureCount − 1) × S.beats + frac × S.beats`) :

```
note supprimée  ⇔  drop.on  et  (g mod E) ≥ E − lenBeats
```

Défauts (état dormant inchangé) : `everyN = 4`, `lenBeats = 2` → en 4/4, mesures 1–3
pleines, mesure 4 jouée temps 1–2 puis silence temps 3–4, re-entrée mesure 5 temps 1.

- **Où** : dans `bassRealize()` (la note n'est **pas émise**) — `computeCycle` et
  `playClick` intacts. `measureCount` vaut déjà la mesure courante quand `bassRealize`
  tourne (incrémenté en tête de `startNewCycle`, avant `bassOnNewMeasure`) ; à l'arrêt
  (`measureCount = 0`) la formule ne supprime jamais rien.
- **Bord du trou** : toute note dont la queue legato déborderait dans le trou est
  **raccourcie pour s'éteindre au bord** (`dur = min(dur, débutFenêtre − débutNote)`,
  plancher 20 ms) — le silence est net, l'exercice lisible. Les ghosts (0,35 de pas) ne
  sont pratiquement jamais concernés.
- **Pendant le trou** : percussion, clave, pulsation, polyrythmie **continuent** — seule
  la couche `bass` se tait. Le gap utilisateur (`S.gap`) reste indépendant et cumulable.
- `lenBeats` est borné à l'UI (1–8) et garde-fou à la restauration ; s'il dépasse une
  mesure, le trou remonte naturellement sur la mesure précédente (l'arithmétique le permet).

### 2.3 Swing des 16es (`swingFollow`)

Grille basse = 16 pas (16es, famille binaire). Si `S.bass.swingFollow`, les **pas impairs**
sont décalés par la même formule par paires que `subPositions` (FUNK-T3), appliquée au pas :

```
sw = S.swing / 100            // ∈ [0.50, 0.85]
pas pair  i : frac = i / 16                  (inchangé — piliers The One immuables)
pas impair i : frac = (i − 1 + 2·sw) / 16
```

- **Où** : dans `bassRealize()` au calcul de `frac` — un seul point, avant le test de drop
  (le trou s'évalue sur la position **réellement sonnée**).
- `sw = 50 %` → `2·sw = 1` → fracs strictement identiques à 5.3c : **non-régression par
  construction** (les 7 recettes existantes ne touchent pas `S.swing`).
- Les durées ne changent pas (les queues legato absorbent l'asymétrie) ; les ghosts swinguent
  comme le reste (c'est un décalage temporel, pas un dosage — rien à voir avec le legato).
- `swingFollow: false` → grille droite quelle que soit la valeur du swing.

## 3. UI

### 3.1 `secBass` (Configurer)

Une ligne drop-outs + le suivi de swing :

```
[✓] Drop-outs — la basse se tait   toutes les [ 4 ] mesures,   trou de [ 2 ] temps
[✓] La basse suit le swing
```

- `bassDropOn` (checkbox), `bassDropEvery` (number 1–32), `bassDropLen` (number 1–8),
  `bassSwingFollow` (checkbox, coché par défaut). Handlers → `S.bass.drop.*` /
  `S.bass.swingFollow` + `bassPersist()` (clé `fm-metro-bass` inchangée — les champs
  existent déjà dans l'état, **aucune migration**). Garde-fous dans `bassRestore` :
  entiers bornés, booléens coercés.
- Le hint de la section est mis à jour (la phrase « Drop-outs … étape suivante » disparaît,
  remplacée par deux phrases : le trou périodique avec re-entrée sur le 1, et le suivi du
  swing). Nouvelles chaînes ajoutées aux dictionnaires EN et PT.

### 3.2 Écran de jeu (mode Jouer)

Une ligne « basse » compacte s'ajoute au `playScreen` (sous la `play-bar`), les **trois
commandes du §5 de la spec de passe** + l'accord courant (le §5 demande l'accord visible
pendant le jeu ; or `#bassChord` vit dans `secBass`, masqué en mode Jouer) :

```
Basse : [⏻ on/off]  ·  densité [1|2|3]  ·  [✓] drop-outs  ·  ♪ E7
```

- `playBassOn`, `playBassDensity`, `playBassDrop`, `playBassChord`. **Mêmes champs d'état**
  que les contrôles de `secBass`, synchronisation bidirectionnelle (changer l'un rafraîchit
  l'autre) ; `bassUpdateChordLabel` alimente les deux étiquettes d'accord.
- **Témoin d'activité** (§5, dernier morceau non livré de la passe) : la pastille d'accord
  `♪ E7` **pulse sur chaque frappe de basse** (classe CSS ajoutée/retirée depuis la boucle
  d'animation existante du curseur de jeu, en comparant la position du curseur aux fracs
  basse — pas de rAF nouveau, pas de témoin au scheduling qui serait en avance de lookahead).
- En famille **ternaire**, le groupe est désactivé (grisé, `title` explicatif) — la basse
  est binaire en v1.

### 3.3 Polissage mobile

- La ligne basse de l'écran de jeu passe à 380 px sans débordement (wrap propre, cibles
  tactiles ≥ 40 px).
- `secBass` : le curseur legato garde une largeur utilisable en colonne étroite
  (`min-width` déjà posé — vérifié), les nouvelles lignes drop wrap proprement.
- Vérification au preview mobile (375×812) des deux écrans, clair et sombre.

## 4. Recette headless (`recette-5-4.js`)

Même harnais jsdom + stubs que 5.3c. Une vingtaine d'assertions :

1. **Défauts & no-op** : `drop = {on:false, everyN:4, lenBeats:2}`, `swingFollow:true` ;
   drop off + swing 50 → réalisation **identique** à 5.3c (mêmes fracs, mêmes durs).
2. **Drop** (diag `setMeasure(n)` ajouté à `fmMetroBass`, même esprit que `setRng`) :
   `everyN=2, lenBeats=2`, 4/4 : mesure 2 ne contient aucune note de frac ≥ 0,5 ; mesures
   1 et 3 pleines ; re-entrée : The One présent mesure 3.
3. **Bord du trou** : legato au plafond (L=2), note du temps 2 de la mesure trouée →
   `dur` raccourcie pour s'éteindre au bord de la fenêtre (et jamais < 20 ms).
4. **Percussion intacte** : `computeCycle` pendant une mesure trouée → événements `perc`
   et `beat` inchangés, zéro événement `bass` dans la fenêtre.
5. **Swing** : `S.swing=66` → pas impairs à `(i−1+1,32)/16`, pas pairs immobiles ;
   `swingFollow=false` → grille droite ; `S.swing=50` → identique à 5.3c.
6. **Drop × swing** : la note swinguée au bord de la fenêtre est évaluée sur sa position
   swinguée.
7. **Persistance** : round-trip `bassPersist`/`bassRestore` de `drop` et `swingFollow` +
   garde-fous (bornes, types) ; une valeur 5.3c héritée (sans usage des champs) relue sans
   migration.
8. **UI** : les 4 contrôles `secBass` et les 4 éléments écran de jeu existent ; toggle
   `playBassOn` ↔ `bassOn` synchronisés dans les deux sens.
9. **Estampille** : `metronomefunk-0.5.4`.

Non-régression complète : les 7 recettes existantes (5-1, 5-1-bis, 5-2, 5-3, 5-3-bis,
5-3-ter, 5-3c) doivent rester vertes **sans retouche** (garanti par construction : drop off
par défaut, swing 50 = identité).

## 5. Hors périmètre (v1, reconduit)

Famille ternaire ; drop-outs aléatoires (mode `rand`) ou progressifs ; trou sur The One
lui-même (variante avancée, passe ultérieure) ; micro-timing laid-back/pushed ; ghosts
suiveurs du legato, sidechain, saturation (écartés définitivement) ; toute retouche des
dosages legato 5.3c (validation à l'oreille encore ouverte — un éventuel `5.3d` resterait
distinct de 5.4).

## 6. Livraison

Fichier `index.html` complet (jamais de patch), estampille `metronomefunk-0.5.4` ;
`recette-5-4.js` ; non-régression 7 recettes ; README (entrée datée, historique préservé) ;
md combiné **brief de reprise + README** (consigne §9 reconduite) ; push branche
`metronomefunk-0.5.4` via github-push (jeton demandé au moment du push, à révoquer ensuite).

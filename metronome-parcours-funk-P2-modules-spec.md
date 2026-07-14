# Métronome — Parcours funk · P-2 : les 5 autres modules de l'Intermédiaire

**Statut : PROPOSITION — spec de contenu, zéro code câblé pour l'instant.**
**Porte de qualité (spec mère §8) : relecture cohérence gestes / principes par Jean.**
**Rattachement : `metronome-parcours-funk-spec.md` (rév. 1), §6.3 « ossature à peupler à l'identique ».**
**Sources contenu : `corpus-gestes.md` (v0.1), `corpus-musicalite-funk.md`.**
**Base technique : build 0.6.4 (md5 `f6633b691f997559234d34e961798abd`) — mêmes objets `Exercise` / `Module` que le module 6 déjà câblé.**

Ce document peuple les **cinq modules restants** de l'Intermédiaire (le module 6, « Verrouiller
sur la basse », est déjà dans le build). Il reprend **exactement** le gabarit rédactionnel du §6 de
la spec mère : par module, **4 atomes + 1 synthèse**, préfixe `EX-SOCLE-…` quand la consigne est
**agnostique du geste** (double couleur, marqueur « déjà rencontré »), préfixe `EX-CJ-…` / `EX-DJ-…`
quand elle dépend d'un **geste de slap spécifique** (§3.2). Les `critère` sont **auto-déclaratifs**,
jamais chiffrés (§2.1).

---

## 0. Récapitulatif de structure (les six modules de l'Intermédiaire)

| # | Objet | Principe(s) | Partage | ID module cajón / djembé | Statut |
|---|---|---|---|---|---|
| 1 | The One | FUNK-T1 | **socle agnostique** (5/5 partagés) | `MOD-CJ-I-T1` / `MOD-DJ-I-T1` | **P-2 (ce doc)** |
| 2 | Grille de 16ᵉˢ | FUNK-T2, T3 | **socle agnostique** (5/5 partagés) | `MOD-CJ-I-T2` / `MOD-DJ-I-T2` | **P-2 (ce doc)** |
| 3 | Backbeat 2 & 4 | FUNK-B1 | **propre** (slap distinct) | `MOD-CJ-I-B1` / `MOD-DJ-I-B1` | **P-2 (ce doc)** |
| 4 | Backbeat déplacé | FUNK-B2, B4 | **propre** (slap distinct) | `MOD-CJ-I-B2` / `MOD-DJ-I-B2` | **P-2 (ce doc)** |
| 5 | Ghost pendule | FUNK-D1, P3 | **socle agnostique** (5/5 partagés) | `MOD-CJ-I-D1` / `MOD-DJ-I-D1` | **P-2 (ce doc)** |
| 6 | Verrouiller sur la basse | FUNK-I2, B4, D1 | **mixte** | `MOD-CJ-I-I2` / `MOD-DJ-I-I2` | *déjà câblé (P-4)* |

**Ordre pédagogique** : 1 → 2 → 3 → 4 → 5 → 6. Le socle temporel (1, 2) précède les accents (3, 4),
la densité expressive (5) précède le verrouillage de synthèse (6).

**Convention d'ID** : infixe = code du principe directeur du module (`T1`, `T2`, `B1`, `B2`, `D1`),
comme le module 6 est infixé `I2`. Rangs `01`–`04` = atomes, `05` = synthèse.

**Presets** — champs réellement supportés par le build (identiques au module 6) :
`pattern ∈ {theOne, syncopeGrave, ghostPendule, claveGrave}`, `prog ∈ {vamp1, vamp2}`,
`drop:{on, everyN, lenBeats}`. Le **tempo** et les réglages fins (swing, densité, tonalité) restent
dans le tiroir `perso` (`<details>`, §5.3 spec mère) — non figés dans le preset.

---

## 1. Module 1 — The One (`FUNK-T1`) · *socle agnostique*

**Objet : ancrer le 1 comme référence d'organisation** (pas forcément l'accent le plus fort,
FUNK-T1). Geste = son grave (CJ-S1 / DJ-S1), agnostique ⇒ les 5 exercices sont **partagés** entre
les deux parcours (double couleur, marqueur « déjà rencontré »). Le djembé garde son rebond « open »
(DJ-G5) comme couleur propre, sans changer l'objectif ni l'ID.

- **Atome 1 · `EX-SOCLE-T1-01`** *(partagé)* — Le grave **sur** le 1.
  Gestes : CJ-S1 / DJ-S1. Principes : FUNK-T1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : à chaque mesure, pose ton grave exactement sur le 1 — rien d'autre pour l'instant.
  Critère : *quand tu retrouves le 1 sans le chercher, mesure après mesure.*

- **Atome 2 · `EX-SOCLE-T1-02`** *(partagé)* — Le 1 comme **repère**, pas comme coup de force.
  Gestes : CJ-S1 / DJ-S1. Principes : FUNK-T1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : rejoue ton grave sur le 1, mais **doux** — c'est une référence d'organisation, pas
  l'accent le plus fort.
  Critère : *quand le 1 continue de t'organiser même joué en retrait.*

- **Atome 3 · `EX-SOCLE-T1-03`** *(partagé)* — Tenir le 1 quand la basse **s'efface**.
  Gestes : CJ-S1 / DJ-S1 + tenue interne (TR-3). Principes : FUNK-T1.
  Preset : `theOne` / `vamp1`, **drop on** (`everyN:4`, `lenBeats:4` — la basse coupe une mesure entière).
  Consigne : quand la basse disparaît une mesure, garde ta pulsation intérieure et retombe pile sur
  le 1 suivant.
  Critère : *quand ton 1 retombe juste sans avoir eu besoin de réentendre la basse.*

- **Atome 4 · `EX-SOCLE-T1-04`** *(partagé)* — Le 1 ne bouge pas quand l'**accord change**.
  Gestes : CJ-S1 / DJ-S1. Principes : FUNK-T1.
  Preset : `theOne` / `vamp2` (I7→IV7), drop off.
  Consigne : sur la progression à deux accords, garde ton 1 identique même quand l'harmonie change
  à la 2ᵉ mesure.
  Critère : *quand le changement d'accord ne déplace jamais ton repère du 1.*

- **Synthèse · `EX-SOCLE-T1-05`** *(partagé)* — Groove d'ancrage, 2 cellules.
  Gestes : CJ-S1 + CJ-M1 / DJ-S1 + DJ-M1. Principes : FUNK-T1, T2.
  Preset : `theOne` / `vamp2`, drop off.
  Consigne : enchaîne grave sur chaque 1 + une nappe légère de touches entre les temps, sur les
  deux mesures.
  Critère : *quand le 1 reste ton point fixe pendant que la nappe tourne autour.*

---

## 2. Module 2 — Grille de 16ᵉˢ (`FUNK-T2`, `T3`) · *socle agnostique*

**Objet : tisser la grille de doubles-croches** comme un moteur régulier « sans repos » (FUNK-T2),
avec son swing propre (FUNK-T3, ~55–60 %). Geste = touch/ghost (CJ-M1 / DJ-M1), agnostique ⇒ **5/5
partagés**. Angle distinct du module 5 : ici la grille est le **tapis régulier** ; là-bas le ghost
devient **expressif** (placements et contrastes).

- **Atome 1 · `EX-SOCLE-T2-01`** *(partagé)* — Sentir les **4 doubles-croches** par temps.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-T2.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : joue une touche très légère sur chacune des 4 doubles-croches d'un temps, régulières
  comme un moteur.
  Critère : *quand les 4 touches sont égales, sans trou ni bosse.*

- **Atome 2 · `EX-SOCLE-T2-02`** *(partagé)* — Étendre la grille sur **toute la mesure**.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-T2, D2 (jeu linéaire, pas de superposition).
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : étale la nappe de 16ᵉˢ sur toute la mesure, sans repos, sous la basse.
  Critère : *quand la grille tourne en continu sans que tu y penses.*

- **Atome 3 · `EX-SOCLE-T2-03`** *(partagé)* — Le **swing** des 16ᵉˢ.
  Gestes : CJ-M1 / DJ-M1 + TR-4 (swing des doubles-croches). Principes : FUNK-T2, T3.
  Preset : `ghostPendule` / `vamp1`, drop off. *(Swing réglé dans le tiroir `perso`, ~55–60 %.)*
  Consigne : laisse tes contretemps faibles glisser légèrement en retard — un swing doux, ni tout à
  fait binaire ni ternaire.
  Critère : *quand la nappe respire avec un balancement régulier au lieu d'être raide.*

- **Atome 4 · `EX-SOCLE-T2-04`** *(partagé)* — **Accentuer un point** de la grille.
  Gestes : CJ-M1 / DJ-M1 + contrôle dynamique (CJ-M4). Principes : FUNK-T2, D1.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : garde la nappe égale mais fais ressortir un seul point par temps (le « e », puis le « a »).
  Critère : *quand l'accent choisi ressort sans casser la régularité du reste.*

- **Synthèse · `EX-SOCLE-T2-05`** *(partagé)* — Grille complète, swinguée, 2 cellules.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-T2, T3, D1.
  Preset : `ghostPendule` / `vamp2`, drop off.
  Consigne : tourne la grille complète sur les deux mesures — nappe régulière + swing + un accent
  placé, sous la basse.
  Critère : *quand la grille tient toute seule et donne envie de bouger.*

---

## 3. Module 3 — Backbeat 2 & 4 (`FUNK-B1`) · *propre (geste de slap distinct)*

**Objet : poser le backbeat tranchant sur 2 & 4** (FUNK-B1). Le geste diffère franchement — slap
**catapulte** au cajón (CJ-G3), slap **fouetté** / tone au djembé (DJ-G3 / DJ-S2) — donc **IDs
propres** de chaque côté (pas de partage, §3.2).

### 3.1 Cajón — `MOD-CJ-I-B1`

- **Atome 1 · `EX-CJ-B1-01`** — Le slap **seul** sur 2 et 4.
  Gestes : slap catapulte (CJ-G3 → CJ-S3). Principes : FUNK-B1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : place un slap catapulte franc sur le 2 et sur le 4, rien d'autre.
  Critère : *quand tes deux slaps claquent nets, toujours à la même place.*

- **Atome 2 · `EX-CJ-B1-02`** — Slap **tranchant** contre grave **rond**.
  Gestes : CJ-S1 + CJ-G3. Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : alterne grave rond sur le 1 et slap tranchant sur 2 & 4 — deux couleurs bien distinctes.
  Critère : *quand on entend clairement deux sons opposés, grave et claquant.*

- **Atome 3 · `EX-CJ-B1-03`** — Backbeat **régulier sous la basse**.
  Gestes : CJ-G3. Principes : FUNK-B1, I2.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : garde tes slaps 2 & 4 exactement calés pendant que la basse bouge.
  Critère : *quand le backbeat ne bronche pas, quoi que fasse la basse.*

- **Atome 4 · `EX-CJ-B1-04`** — Backbeat quand la basse **coupe**.
  Gestes : CJ-G3 + tenue interne (TR-3). Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp1`, **drop on** (`everyN:4`, `lenBeats:2`).
  Consigne : même quand la basse coupe deux temps, tes slaps 2 & 4 restent à l'heure.
  Critère : *quand tes 2 & 4 retombent justes au retour de la basse.*

- **Synthèse · `EX-CJ-B1-05`** — Groove backbeat, 2 cellules.
  Gestes : CJ-S1, CJ-G3. Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp2`, drop off.
  Consigne : enchaîne grave sur 1 + slaps sur 2 & 4, sur les deux mesures de la progression.
  Critère : *quand le backbeat porte le groove sans effort.*

### 3.2 Djembé — `MOD-DJ-I-B1`

- **Atome 1 · `EX-DJ-B1-01`** — Le tone/slap **seul** sur 2 et 4.
  Gestes : slap fouetté (DJ-G3 → DJ-S3) ou tone (DJ-S2). Principes : FUNK-B1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : place un slap fouetté (ou un tone claquant) sur le 2 et le 4, rien d'autre.
  Critère : *quand tes deux accents claquent nets, toujours à la même place.*

- **Atome 2 · `EX-DJ-B1-02`** — Slap **tranchant** contre bass **ronde**.
  Gestes : DJ-S1 + DJ-G3. Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : alterne bass ronde sur le 1 et slap fouetté sur 2 & 4 — deux couleurs opposées.
  Critère : *quand on distingue clairement la bass et le slap.*

- **Atome 3 · `EX-DJ-B1-03`** — Backbeat **régulier sous la basse**.
  Gestes : DJ-G3. Principes : FUNK-B1, I2.
  Preset : `theOne` / `vamp1`, drop off.
  Consigne : garde tes slaps 2 & 4 exactement calés pendant que la basse bouge.
  Critère : *quand le backbeat ne bronche pas, quoi que fasse la basse.*

- **Atome 4 · `EX-DJ-B1-04`** — Backbeat quand la basse **coupe**.
  Gestes : DJ-G3 + tenue interne (TR-3). Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp1`, **drop on** (`everyN:4`, `lenBeats:2`).
  Consigne : même quand la basse coupe deux temps, tes slaps 2 & 4 restent à l'heure.
  Critère : *quand tes 2 & 4 retombent justes au retour de la basse.*

- **Synthèse · `EX-DJ-B1-05`** — Groove backbeat, 2 cellules.
  Gestes : DJ-S1, DJ-G3. Principes : FUNK-B1, T1.
  Preset : `theOne` / `vamp2`, drop off.
  Consigne : enchaîne bass sur 1 + slaps fouettés sur 2 & 4, sur les deux mesures.
  Critère : *quand le backbeat porte le groove sans effort.*

---

## 4. Module 4 — Backbeat déplacé (`FUNK-B2`, `B4`) · *propre (geste de slap distinct)*

**Objet : déplacer un backbeat** — garder un seul appui fort sur 2 **ou** 4, faire migrer l'autre
hors du temps fort (FUNK-B2), en se logeant dans l'espace négatif (FUNK-B4). Geste de slap distinct
⇒ **IDs propres**. Preset `syncopeGrave` pour que la basse offre déjà des trous à investir.

### 4.1 Cajón — `MOD-CJ-I-B2`

- **Atome 1 · `EX-CJ-B2-01`** — Garder le 2, **retirer le 4**.
  Gestes : CJ-G3. Principes : FUNK-B2.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : garde le slap sur le 2, mais supprime celui du 4 — laisse le trou.
  Critère : *quand l'absence du 4 crée une tension au lieu d'un manque.*

- **Atome 2 · `EX-CJ-B2-02`** — **Migrer** le 4 sur le « et ».
  Gestes : CJ-G3. Principes : FUNK-B2, B4.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : redonne le deuxième slap, mais décalé juste après le 4 (sur le « et »).
  Critère : *quand le slap déplacé tire le groove en avant sans le déséquilibrer.*

- **Atome 3 · `EX-CJ-B2-03`** — Le déplacement **contre la basse**.
  Gestes : CJ-G3. Principes : FUNK-B2, B4, I2.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : cale ton slap déplacé dans un silence de la basse, jamais sur sa note.
  Critère : *quand le slap déplacé tombe dans le vide de la basse.*

- **Atome 4 · `EX-CJ-B2-04`** — **Alterner** backbeat droit / déplacé.
  Gestes : CJ-G3. Principes : FUNK-B2, B1.
  Preset : `syncopeGrave` / `vamp2`, drop off.
  Consigne : une mesure backbeat droit (2 & 4), une mesure backbeat déplacé — alterne sans trou.
  Critère : *quand le passage droit↔déplacé est fluide, sans accroc de time.*

- **Synthèse · `EX-CJ-B2-05`** — Groove à backbeat déplacé, 2 cellules.
  Gestes : CJ-S1, CJ-G3. Principes : FUNK-B2, B4, T1.
  Preset : `syncopeGrave` / `vamp2`, drop off.
  Consigne : installe le groove avec le backbeat déplacé stabilisé sur les deux cellules.
  Critère : *quand le déplacement devient le caractère du groove, pas une erreur.*

### 4.2 Djembé — `MOD-DJ-I-B2`

- **Atome 1 · `EX-DJ-B2-01`** — Garder le 2, **retirer le 4**.
  Gestes : DJ-G3. Principes : FUNK-B2.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : garde le slap fouetté sur le 2, mais supprime celui du 4 — laisse le trou.
  Critère : *quand l'absence du 4 crée une tension au lieu d'un manque.*

- **Atome 2 · `EX-DJ-B2-02`** — **Migrer** le 4 sur le « et ».
  Gestes : DJ-G3. Principes : FUNK-B2, B4.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : redonne le deuxième slap, décalé juste après le 4 (sur le « et »), poignet fouetté.
  Critère : *quand le slap déplacé tire le groove en avant sans le déséquilibrer.*

- **Atome 3 · `EX-DJ-B2-03`** — Le déplacement **contre la basse**.
  Gestes : DJ-G3. Principes : FUNK-B2, B4, I2.
  Preset : `syncopeGrave` / `vamp1`, drop off.
  Consigne : cale ton slap déplacé dans un silence de la basse, jamais sur sa note.
  Critère : *quand le slap déplacé tombe dans le vide de la basse.*

- **Atome 4 · `EX-DJ-B2-04`** — **Alterner** backbeat droit / déplacé.
  Gestes : DJ-G3. Principes : FUNK-B2, B1.
  Preset : `syncopeGrave` / `vamp2`, drop off.
  Consigne : une mesure backbeat droit (2 & 4), une mesure déplacé — alterne sans trou.
  Critère : *quand le passage droit↔déplacé est fluide, sans accroc de time.*

- **Synthèse · `EX-DJ-B2-05`** — Groove à backbeat déplacé, 2 cellules.
  Gestes : DJ-S1, DJ-G3. Principes : FUNK-B2, B4, T1.
  Preset : `syncopeGrave` / `vamp2`, drop off.
  Consigne : installe le groove avec le backbeat déplacé stabilisé sur les deux cellules.
  Critère : *quand le déplacement devient le caractère du groove, pas une erreur.*

---

## 5. Module 5 — Ghost pendule (`FUNK-D1`, `P3`) · *socle agnostique*

**Objet : faire du ghost note un pendule expressif** — 16ᵉˢ très faibles, placements types « e » de
chaque temps et « a » avant le 2 (FUNK-D1), le contraste ghost/accent créant la poche (FUNK-P3).
Geste = ghost/touch (CJ-M1 / DJ-M1) + contrôle dynamique, agnostique ⇒ **5/5 partagés**.

- **Atome 1 · `EX-SOCLE-D1-01`** *(partagé)* — Le ghost sur le **« e »**.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-D1.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : glisse un ghost très faible sur le « e » de chaque temps (juste après le temps).
  Critère : *quand les ghosts du « e » sont réguliers et presque inaudibles.*

- **Atome 2 · `EX-SOCLE-D1-02`** *(partagé)* — Le ghost du **« a » avant le 2**.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-D1, B4.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : ajoute un ghost sur le « a » juste avant le 2, comme un élan vers le backbeat.
  Critère : *quand le « a » pousse naturellement vers le 2 sans le couvrir.*

- **Atome 3 · `EX-SOCLE-D1-03`** *(partagé)* — Le **pendule** : va-et-vient régulier.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-D1, T2.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : fais osciller tes ghosts en un balancement régulier, comme un pendule sous la basse.
  Critère : *quand le tapis de ghosts respire à intervalle égal.*

- **Atome 4 · `EX-SOCLE-D1-04`** *(partagé)* — Ghost **+ accent** : contraste dynamique.
  Gestes : CJ-M1 + CJ-M4 (contrôle dynamique) / DJ-M1. Principes : FUNK-D1, P3.
  Preset : `ghostPendule` / `vamp1`, drop off.
  Consigne : garde les ghosts très faibles et fais ressortir un seul accent — le contraste fait la poche.
  Critère : *quand l'écart entre ghost et accent est net et constant.*

- **Synthèse · `EX-SOCLE-D1-05`** *(partagé)* — Nappe de ghosts complète, 2 cellules.
  Gestes : CJ-M1 / DJ-M1. Principes : FUNK-D1, P3, T2.
  Preset : `ghostPendule` / `vamp2`, drop off.
  Consigne : tisse le pendule complet (« e » + « a ») sur les deux mesures, sous la basse.
  Critère : *quand la nappe de ghosts tient toute seule et donne le groove.*

---

## 6. Blocs JS prêts à câbler (mêmes objets que le module 6 du build)

Structure calquée sur le module 6 déjà en place (`kind` / `objet` / `consigne` / `critere` /
`preset`). Les exercices `EX-SOCLE-*` ne sont déclarés **qu'une fois** et référencés par les deux
modules du couple (partage §3.2). À insérer après validation de Jean ; **non câblé ici**.

```js
/* ===== EXERCICES ===== */

// --- Module 1 : The One (partagé) ---
'EX-SOCLE-T1-01': { kind:'atome', objet:'Le grave sur le 1',
  consigne:"À chaque mesure, pose ton grave exactement sur le 1 — rien d'autre pour l'instant.",
  critere:"quand tu retrouves le 1 sans le chercher, mesure après mesure.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T1-02': { kind:'atome', objet:'Le 1 comme repère, pas comme coup de force',
  consigne:"Rejoue ton grave sur le 1, mais doux : c'est une référence d'organisation, pas l'accent le plus fort.",
  critere:"quand le 1 continue de t'organiser même joué en retrait.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T1-03': { kind:'atome', objet:'Tenir le 1 quand la basse s\'efface',
  consigne:"Quand la basse disparaît une mesure, garde ta pulsation intérieure et retombe pile sur le 1 suivant.",
  critere:"quand ton 1 retombe juste sans avoir eu besoin de réentendre la basse.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:4} } },
'EX-SOCLE-T1-04': { kind:'atome', objet:'Le 1 ne bouge pas quand l\'accord change',
  consigne:"Sur la progression à deux accords, garde ton 1 identique même quand l'harmonie change à la 2e mesure.",
  critere:"quand le changement d'accord ne déplace jamais ton repère du 1.",
  preset:{ pattern:'theOne', prog:'vamp2', drop:{on:false} } },
'EX-SOCLE-T1-05': { kind:'synthese', objet:'Groove d\'ancrage sur The One',
  consigne:"Enchaîne grave sur chaque 1 + une nappe légère de touches entre les temps, sur les deux mesures.",
  critere:"quand le 1 reste ton point fixe pendant que la nappe tourne autour.",
  preset:{ pattern:'theOne', prog:'vamp2', drop:{on:false} } },

// --- Module 2 : Grille de 16es (partagé) ---
'EX-SOCLE-T2-01': { kind:'atome', objet:'Sentir les 4 doubles-croches',
  consigne:"Joue une touche très légère sur chacune des 4 doubles-croches d'un temps, régulières comme un moteur.",
  critere:"quand les 4 touches sont égales, sans trou ni bosse.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T2-02': { kind:'atome', objet:'Étendre la grille sur la mesure',
  consigne:"Étale la nappe de 16es sur toute la mesure, sans repos, sous la basse.",
  critere:"quand la grille tourne en continu sans que tu y penses.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T2-03': { kind:'atome', objet:'Le swing des 16es',
  consigne:"Laisse tes contretemps faibles glisser légèrement en retard : un swing doux, ni tout à fait binaire ni ternaire.",
  critere:"quand la nappe respire avec un balancement régulier au lieu d'être raide.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T2-04': { kind:'atome', objet:'Accentuer un point de la grille',
  consigne:"Garde la nappe égale mais fais ressortir un seul point par temps (le « e », puis le « a »).",
  critere:"quand l'accent choisi ressort sans casser la régularité du reste.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-T2-05': { kind:'synthese', objet:'Grille complète swinguée',
  consigne:"Tourne la grille complète sur les deux mesures : nappe régulière + swing + un accent placé, sous la basse.",
  critere:"quand la grille tient toute seule et donne envie de bouger.",
  preset:{ pattern:'ghostPendule', prog:'vamp2', drop:{on:false} } },

// --- Module 3 : Backbeat 2 & 4 — CAJÓN (propre) ---
'EX-CJ-B1-01': { kind:'atome', objet:'Le slap seul sur 2 et 4 (catapulte)',
  consigne:"Place un slap catapulte franc sur le 2 et sur le 4, rien d'autre.",
  critere:"quand tes deux slaps claquent nets, toujours à la même place.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B1-02': { kind:'atome', objet:'Slap tranchant contre grave rond',
  consigne:"Alterne grave rond sur le 1 et slap tranchant sur 2 & 4 : deux couleurs bien distinctes.",
  critere:"quand on entend clairement deux sons opposés, grave et claquant.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B1-03': { kind:'atome', objet:'Backbeat régulier sous la basse',
  consigne:"Garde tes slaps 2 & 4 exactement calés pendant que la basse bouge.",
  critere:"quand le backbeat ne bronche pas, quoi que fasse la basse.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B1-04': { kind:'atome', objet:'Backbeat quand la basse coupe',
  consigne:"Même quand la basse coupe deux temps, tes slaps 2 & 4 restent à l'heure.",
  critere:"quand tes 2 & 4 retombent justes au retour de la basse.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:2} } },
'EX-CJ-B1-05': { kind:'synthese', objet:'Groove backbeat',
  consigne:"Enchaîne grave sur 1 + slaps sur 2 & 4, sur les deux mesures de la progression.",
  critere:"quand le backbeat porte le groove sans effort.",
  preset:{ pattern:'theOne', prog:'vamp2', drop:{on:false} } },

// --- Module 3 : Backbeat 2 & 4 — DJEMBÉ (propre) ---
'EX-DJ-B1-01': { kind:'atome', objet:'Le tone/slap seul sur 2 et 4 (fouetté)',
  consigne:"Place un slap fouetté (ou un tone claquant) sur le 2 et le 4, rien d'autre.",
  critere:"quand tes deux accents claquent nets, toujours à la même place.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B1-02': { kind:'atome', objet:'Slap tranchant contre bass ronde',
  consigne:"Alterne bass ronde sur le 1 et slap fouetté sur 2 & 4 : deux couleurs opposées.",
  critere:"quand on distingue clairement la bass et le slap.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B1-03': { kind:'atome', objet:'Backbeat régulier sous la basse',
  consigne:"Garde tes slaps 2 & 4 exactement calés pendant que la basse bouge.",
  critere:"quand le backbeat ne bronche pas, quoi que fasse la basse.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B1-04': { kind:'atome', objet:'Backbeat quand la basse coupe',
  consigne:"Même quand la basse coupe deux temps, tes slaps 2 & 4 restent à l'heure.",
  critere:"quand tes 2 & 4 retombent justes au retour de la basse.",
  preset:{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:2} } },
'EX-DJ-B1-05': { kind:'synthese', objet:'Groove backbeat',
  consigne:"Enchaîne bass sur 1 + slaps fouettés sur 2 & 4, sur les deux mesures.",
  critere:"quand le backbeat porte le groove sans effort.",
  preset:{ pattern:'theOne', prog:'vamp2', drop:{on:false} } },

// --- Module 4 : Backbeat déplacé — CAJÓN (propre) ---
'EX-CJ-B2-01': { kind:'atome', objet:'Garder le 2, retirer le 4',
  consigne:"Garde le slap sur le 2, mais supprime celui du 4 — laisse le trou.",
  critere:"quand l'absence du 4 crée une tension au lieu d'un manque.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B2-02': { kind:'atome', objet:'Migrer le 4 sur le « et »',
  consigne:"Redonne le deuxième slap, mais décalé juste après le 4 (sur le « et »).",
  critere:"quand le slap déplacé tire le groove en avant sans le déséquilibrer.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B2-03': { kind:'atome', objet:'Le déplacement contre la basse',
  consigne:"Cale ton slap déplacé dans un silence de la basse, jamais sur sa note.",
  critere:"quand le slap déplacé tombe dans le vide de la basse.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-CJ-B2-04': { kind:'atome', objet:'Alterner backbeat droit / déplacé',
  consigne:"Une mesure backbeat droit (2 & 4), une mesure backbeat déplacé : alterne sans trou.",
  critere:"quand le passage droit↔déplacé est fluide, sans accroc de time.",
  preset:{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} } },
'EX-CJ-B2-05': { kind:'synthese', objet:'Groove à backbeat déplacé',
  consigne:"Installe le groove avec le backbeat déplacé stabilisé sur les deux cellules.",
  critere:"quand le déplacement devient le caractère du groove, pas une erreur.",
  preset:{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} } },

// --- Module 4 : Backbeat déplacé — DJEMBÉ (propre) ---
'EX-DJ-B2-01': { kind:'atome', objet:'Garder le 2, retirer le 4',
  consigne:"Garde le slap fouetté sur le 2, mais supprime celui du 4 — laisse le trou.",
  critere:"quand l'absence du 4 crée une tension au lieu d'un manque.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B2-02': { kind:'atome', objet:'Migrer le 4 sur le « et »',
  consigne:"Redonne le deuxième slap, décalé juste après le 4 (sur le « et »), poignet fouetté.",
  critere:"quand le slap déplacé tire le groove en avant sans le déséquilibrer.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B2-03': { kind:'atome', objet:'Le déplacement contre la basse',
  consigne:"Cale ton slap déplacé dans un silence de la basse, jamais sur sa note.",
  critere:"quand le slap déplacé tombe dans le vide de la basse.",
  preset:{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} } },
'EX-DJ-B2-04': { kind:'atome', objet:'Alterner backbeat droit / déplacé',
  consigne:"Une mesure backbeat droit (2 & 4), une mesure déplacé : alterne sans trou.",
  critere:"quand le passage droit↔déplacé est fluide, sans accroc de time.",
  preset:{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} } },
'EX-DJ-B2-05': { kind:'synthese', objet:'Groove à backbeat déplacé',
  consigne:"Installe le groove avec le backbeat déplacé stabilisé sur les deux cellules.",
  critere:"quand le déplacement devient le caractère du groove, pas une erreur.",
  preset:{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} } },

// --- Module 5 : Ghost pendule (partagé) ---
'EX-SOCLE-D1-01': { kind:'atome', objet:'Le ghost sur le « e »',
  consigne:"Glisse un ghost très faible sur le « e » de chaque temps (juste après le temps).",
  critere:"quand les ghosts du « e » sont réguliers et presque inaudibles.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-D1-02': { kind:'atome', objet:'Le ghost du « a » avant le 2',
  consigne:"Ajoute un ghost sur le « a » juste avant le 2, comme un élan vers le backbeat.",
  critere:"quand le « a » pousse naturellement vers le 2 sans le couvrir.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-D1-03': { kind:'atome', objet:'Le pendule : va-et-vient régulier',
  consigne:"Fais osciller tes ghosts en un balancement régulier, comme un pendule sous la basse.",
  critere:"quand le tapis de ghosts respire à intervalle égal.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-D1-04': { kind:'atome', objet:'Ghost + accent : contraste dynamique',
  consigne:"Garde les ghosts très faibles et fais ressortir un seul accent : le contraste fait la poche.",
  critere:"quand l'écart entre ghost et accent est net et constant.",
  preset:{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} } },
'EX-SOCLE-D1-05': { kind:'synthese', objet:'Nappe de ghosts complète',
  consigne:"Tisse le pendule complet (« e » + « a ») sur les deux mesures, sous la basse.",
  critere:"quand la nappe de ghosts tient toute seule et donne le groove.",
  preset:{ pattern:'ghostPendule', prog:'vamp2', drop:{on:false} } },


/* ===== MODULES ===== */

'MOD-CJ-I-T1': { parcours:'cajon', niveau:'intermediaire', objet:'The One',
  exercices:['EX-SOCLE-T1-01','EX-SOCLE-T1-02','EX-SOCLE-T1-03','EX-SOCLE-T1-04','EX-SOCLE-T1-05'] },
'MOD-DJ-I-T1': { parcours:'djembe', niveau:'intermediaire', objet:'The One',
  exercices:['EX-SOCLE-T1-01','EX-SOCLE-T1-02','EX-SOCLE-T1-03','EX-SOCLE-T1-04','EX-SOCLE-T1-05'] },

'MOD-CJ-I-T2': { parcours:'cajon', niveau:'intermediaire', objet:'Grille de 16es',
  exercices:['EX-SOCLE-T2-01','EX-SOCLE-T2-02','EX-SOCLE-T2-03','EX-SOCLE-T2-04','EX-SOCLE-T2-05'] },
'MOD-DJ-I-T2': { parcours:'djembe', niveau:'intermediaire', objet:'Grille de 16es',
  exercices:['EX-SOCLE-T2-01','EX-SOCLE-T2-02','EX-SOCLE-T2-03','EX-SOCLE-T2-04','EX-SOCLE-T2-05'] },

'MOD-CJ-I-B1': { parcours:'cajon', niveau:'intermediaire', objet:'Backbeat 2 & 4',
  exercices:['EX-CJ-B1-01','EX-CJ-B1-02','EX-CJ-B1-03','EX-CJ-B1-04','EX-CJ-B1-05'] },
'MOD-DJ-I-B1': { parcours:'djembe', niveau:'intermediaire', objet:'Backbeat 2 & 4',
  exercices:['EX-DJ-B1-01','EX-DJ-B1-02','EX-DJ-B1-03','EX-DJ-B1-04','EX-DJ-B1-05'] },

'MOD-CJ-I-B2': { parcours:'cajon', niveau:'intermediaire', objet:'Backbeat déplacé',
  exercices:['EX-CJ-B2-01','EX-CJ-B2-02','EX-CJ-B2-03','EX-CJ-B2-04','EX-CJ-B2-05'] },
'MOD-DJ-I-B2': { parcours:'djembe', niveau:'intermediaire', objet:'Backbeat déplacé',
  exercices:['EX-DJ-B2-01','EX-DJ-B2-02','EX-DJ-B2-03','EX-DJ-B2-04','EX-DJ-B2-05'] },

'MOD-CJ-I-D1': { parcours:'cajon', niveau:'intermediaire', objet:'Ghost pendule',
  exercices:['EX-SOCLE-D1-01','EX-SOCLE-D1-02','EX-SOCLE-D1-03','EX-SOCLE-D1-04','EX-SOCLE-D1-05'] },
'MOD-DJ-I-D1': { parcours:'djembe', niveau:'intermediaire', objet:'Ghost pendule',
  exercices:['EX-SOCLE-D1-01','EX-SOCLE-D1-02','EX-SOCLE-D1-03','EX-SOCLE-D1-04','EX-SOCLE-D1-05'] },
```

---

## 7. Bilan de mutualisation & points à valider par Jean (porte de qualité)

**Mutualisation** — sur les 6 modules de l'Intermédiaire :

- **Partagés (`EX-SOCLE-*`)** : modules 1, 2, 5 entièrement (15 exercices socle) + 3 atomes du
  module 6 déjà en place. Ces exercices s'affichent **double couleur** avec le marqueur « déjà
  rencontré dans l'autre parcours ».
- **Propres (`EX-CJ-*` / `EX-DJ-*`)** : modules 3, 4 entièrement (le geste de slap diffère) +
  atome 2 & synthèse du module 6. Total 22 exercices propres (11 par parcours).
- **Total P-2** : 35 exercices déclarés (15 `EX-SOCLE` + 20 propres), 10 modules (5 objets × 2 parcours).

**Points à trancher (relecture cohérence gestes / principes)** :

1. **Modules 1, 2, 5 entièrement partagés** — j'ai fait le choix « agnostique donc partagé » de
   bout en bout (§3.2), y compris les synthèses (grave + nappe, sans slap spécifique). À confirmer :
   OK, ou veux-tu une **synthèse propre** par parcours dans ces modules pour marquer davantage « le
   djembé n'est pas un décalque » ?
2. **Preset `syncopeGrave` pour le module 4** — choisi pour que la basse offre déjà des trous à
   investir. Alternative : `theOne` (trous à créer soi-même). Ton avis ?
3. **Recouvrement module 2 (grille) / module 5 (ghost) / module 6-atome 3 (nappe)** — j'ai
   distingué les angles (grille = tapis régulier ; ghost pendule = placements « e »/« a » + contraste ;
   module 6 = nappe verrouillée sur la basse). À valider comme progression, pas comme redite.
4. **Swing (module 2, atome 3)** — laissé en réglage `perso` (tiroir), pas en champ de preset, car
   le build 0.6.4 n'expose pas de champ swing dans `preset`. À confirmer, ou faut-il ajouter le
   champ ? (impacterait le schéma preset et donc P-4/recettes).
5. **Vocalisation syllabique** (`vocalisation`, point ouvert §7.3 spec mère) — non renseignée ici.
   Si tu veux l'amorcer, le module 1 (The One) et le module 3 (backbeat) sont les meilleurs candidats
   pour un premier mot 4 syllabes.

Rien n'est câblé dans `index.html`. Étape suivante après ton feu vert : intégrer ces blocs dans le
build (livraison **fichier complet**, jamais un patch), puis **recette headless** dédiée + relance
de la non-régression avant toute PR.

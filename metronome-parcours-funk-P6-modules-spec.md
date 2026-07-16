# Métronome — Parcours funk · P-6 : peuplement du niveau Débutant

**Statut : PROPOSITION — spec de contenu + câblage, à valider par Jean (porte de qualité) avant merge.**
**Porte de qualité (spec mère §8) : relecture cohérence gestes / principes par Jean.**
**Rattachement : `metronome-parcours-funk-P5-cartographie.md` (VALIDÉE 2026-07-16), §3 « Débutant ».**
**Sources contenu : `corpus-gestes.md` (v0.1, CJ-/DJ-/TR-). Aucun principe FUNK (le Débutant est pré-funk).**
**Base technique : build main 0.7.0 (`metronomefunk-0.7.0`) — mêmes objets `Exercise` / `Module` que l'Intermédiaire (P-2/P-4).**

Ce document peuple le **niveau Débutant** — un *primer technique neutre (pré-funk)* : posture, palette de
sons, time, subdivisions, dynamique. Aucun contenu funk. Il reprend **exactement** le gabarit rédactionnel
de P-2 : par module, **4 atomes + 1 synthèse**, préfixe `EX-SOCLE-…` quand la consigne est **agnostique du
geste** (double couleur, marqueur « déjà rencontré »), préfixes `EX-CJ-…` / `EX-DJ-…` quand elle dépend d'un
**geste propre**. Les `critère` sont **auto-déclaratifs**, jamais chiffrés (§2.1 spec mère).

> **P-6 ≠ passe 5/6** (moteur de basse funk, clos le 2026-07-10). Ne pas rouvrir la basse. « P-6 » = 6ᵉ
> chantier du parcours funk = peuplement du Débutant.

---

## 0. Récapitulatif de structure (les cinq objets Débutant × deux parcours = 10 modules)

| # | Objet | Code | Gestes / technique | Partage | ID module cajón / djembé |
|---|---|---|---|---|---|
| 1 | Posture, ancrage, rebond | `POS` | TR-1, TR-2, TR-5 ; djembé DJ-G5 (rebond « open ») | **propre** | `MOD-CJ-D-POS` / `MOD-DJ-D-POS` |
| 2 | La palette de sons | `SON` | CJ-G1/G2/G3→S1/S2/S3 ; DJ-G1/G2/G3→S1/S2/S3 | **propre** | `MOD-CJ-D-SON` / `MOD-DJ-D-SON` |
| 3 | La pulse & le comptage | `PLS` | time pur, 4/4 (agnostique) | **socle** (`EX-SOCLE-D-PLS-*`) | `MOD-CJ-D-PLS` / `MOD-DJ-D-PLS` |
| 4 | Les subdivisions | `SUB` | 2 puis 4 frappes/temps, touch léger (CJ-M1 / DJ-M1) | **socle** (`EX-SOCLE-D-SUB-*`) | `MOD-CJ-D-SUB` / `MOD-DJ-D-SUB` |
| 5 | Fort & doux (dynamique) | `DYN` | CJ-M2/M3/M4 ; DJ-M1/M2 | **propre** | `MOD-CJ-D-DYN` / `MOD-DJ-D-DYN` |

**Ordre pédagogique** : 1 → 2 → 3 → 4 → 5 (s'installer/relâcher ⇒ produire les sons ⇒ tenir le time ⇒
subdiviser ⇒ nuancer). Modules 3–4 = **premier socle partagé du parcours** (le time est agnostique de
l'instrument) ; 1, 2, 5 propres (le geste diffère).

**Convention d'ID** (figée en P-5 §1) : infixe de niveau **`D`** ; module `MOD-<CJ|DJ>-D-<code>`. Atomes socle
`EX-SOCLE-D-<code>-NN` (le `-` après `D` namespace le Débutant, sans collision avec l'Intermédiaire
`EX-SOCLE-D1-*`). Atomes propres `EX-<CJ|DJ>-<code>-NN` (code thématique unique, façon P-2 `EX-CJ-B1-01`).
Rangs `01`–`04` = atomes, `05` = synthèse.

**Décompte** : 10 modules ; **40 exercices** distincts (10 POS + 10 SON + **5** PLS socle + **5** SUB socle +
10 DYN). Socle partagé = 10 (`EX-SOCLE-D-PLS-*` + `EX-SOCLE-D-SUB-*`).

### 0.1 Presets Débutant — extension « pré-funk » du moteur

Le Débutant **ne charge jamais de ligne de basse funk** (ce serait un contresens sous un primer de posture).
Il se joue **au métronome seul**, avec les seules briques que le funk présuppose — clic, subdivisions,
coupures (gap). Le preset gagne donc des champs **optionnels et additifs** (les presets Intermédiaire, sans
ces champs, gardent leur comportement à l'octet près) :

| Champ | Effet | Usage Débutant |
|---|---|---|
| `metro:true` | **clic seul** : `S.bass.on = false` (aucune basse) | POS, SON, PLS, SUB, DYN (tous) |
| `tempo:<N>` | tempo de départ (défaut 90) | POS 72, SON 76, PLS/SUB 80, DYN 84 (lent → modéré) |
| `subdiv:<1\|2\|4>` | subdivision du clic (défaut 1) — noires / croches / doubles | SUB (2 puis 4 : sentir la grille) |
| `gap:{playN,muteM}` | **machine gap** : clic joué `playN` mesures, coupé `muteM` — cible `pulse` | PLS-04/05 (éprouver la tenue) |

Le clic seul (± subdivisions, ± gap) réalise fidèlement les intentions de la carte P-5 §3 (« clic seul »,
« machine gap », « 2 puis 4 frappes/temps »). Pour SUB, la carte évoquait aussi « ghostPendule densité basse »
en option : la **subdivision du métronome** est retenue à la place, car plus neutre (amorce *non-funk* de la
grille de 16ᵉˢ, sans introduire une nappe funk).

### 0.2 Vocalisation syllabique (point ouvert P-5 §7.2 — activé ici)

Décision de la carte : la vocalisation n'est **pas un module** ; elle se **fond au peuplement** dans des atomes
existants. Appliqué ici dans **deux atomes** :
- **`-SON-04`** (cajón & djembé) : poser un mot de 4 syllabes (« TA-KA-DI-MI »), une par temps, un son par
  syllabe — lier le geste au dire.
- **`-PLS-01`** (socle) : compter les 4 temps **à voix haute** en jouant.

---

## 1. Module 1 — Posture, ancrage, rebond (`POS`) · *propre*

**Objet : s'asseoir/se caler, relâcher, laisser la frappe rebondir** (TR-1 : instrument calé par les jambes,
mains libres ; TR-2 : relâchement = rebond, tension = son mort + risque TMS ; TR-5 : échauffement). Le djembé
pose d'emblée **DJ-G5** (rebond « open » fondateur). Geste propre à chaque instrument ⇒ **IDs propres**.
*Preset : clic seul, tempo lent.*

### 1.1 Cajón — `MOD-CJ-D-POS`

- **Atome 1 · `EX-CJ-POS-01`** — S'installer, caler le cajón.
  Gestes : TR-1. Preset : `metro`, tempo 72.
  Consigne : Assieds-toi en équilibre, cale le cajón entre tes jambes, épaules relâchées et mains libres.
  Critère : *quand tu tiens l'instrument sans le serrer et que tes deux mains tombent naturellement sur la tapa.*

- **Atome 2 · `EX-CJ-POS-02`** — Le relâchement fait le rebond.
  Gestes : TR-2. Preset : `metro`, tempo 72.
  Consigne : Laisse ta main retomber sur la tapa et rebondir toute seule, bras lourd et poignet souple — ne la retiens pas.
  Critère : *quand la main rebondit d'elle-même au lieu de rester collée à la tapa.*

- **Atome 3 · `EX-CJ-POS-03`** — Tension = son mort.
  Gestes : TR-2. Preset : `metro`, tempo 72.
  Consigne : Compare une frappe crispée (son court et mat) et une frappe relâchée (son qui sonne) — garde la relâchée.
  Critère : *quand tu sens que serrer étouffe le son et que relâcher le libère.*

- **Atome 4 · `EX-CJ-POS-04`** — Frapper au même endroit, sans forcer.
  Gestes : TR-5. Preset : `metro`, tempo 72.
  Consigne : Pose dix frappes détendues au même point de la tapa, une par temps, sans chercher à taper fort.
  Critère : *quand les dix frappes tombent au même endroit, sans effort ni fatigue.*

- **Synthèse · `EX-CJ-POS-05`** — Assise + rebond, une main puis l'autre.
  Gestes : TR-1, TR-2. Preset : `metro`, tempo 72.
  Consigne : Alterne main gauche et main droite en frappes relâchées et rebondissantes sur le clic, épaules basses, une minute.
  Critère : *quand tu tiens une minute détendu, chaque frappe rebondit et rien ne se crispe.*

### 1.2 Djembé — `MOD-DJ-D-POS`

- **Atome 1 · `EX-DJ-POS-01`** — S'installer, incliner le djembé.
  Gestes : TR-1. Preset : `metro`, tempo 72.
  Consigne : Cale le djembé incliné entre tes jambes pour que l'air passe dessous, dos droit, épaules relâchées, mains libres.
  Critère : *quand le fût est stable et incliné, et que tes mains tombent naturellement sur la peau.*

- **Atome 2 · `EX-DJ-POS-02`** — Le rebond « open » (DJ-G5).
  Gestes : DJ-G5, TR-2. Preset : `metro`, tempo 72.
  Consigne : Frappe le bord de la peau et laisse la main rebondir aussitôt (open) — la peau sonne parce que la main repart.
  Critère : *quand la main repart toute seule après la frappe et laisse la peau résonner.*

- **Atome 3 · `EX-DJ-POS-03`** — Tension = son mort.
  Gestes : TR-2. Preset : `metro`, tempo 72.
  Consigne : Compare une frappe crispée (mate et courte) et une frappe relâchée qui rebondit (ouverte) — garde la relâchée.
  Critère : *quand tu sens que la main qui reste sur la peau tue le son.*

- **Atome 4 · `EX-DJ-POS-04`** — Frapper au même endroit, sans forcer.
  Gestes : TR-5. Preset : `metro`, tempo 72.
  Consigne : Pose dix frappes détendues au bord de la peau, une par temps, sans forcer.
  Critère : *quand les dix frappes sonnent pareil, au même endroit, sans fatigue.*

- **Synthèse · `EX-DJ-POS-05`** — Assise + rebond open, une main puis l'autre.
  Gestes : TR-1, DJ-G5. Preset : `metro`, tempo 72.
  Consigne : Alterne les mains en frappes open rebondissantes sur le clic, une minute, épaules basses.
  Critère : *quand tu tiens une minute détendu, chaque main rebondit et la peau sonne à chaque coup.*

---

## 2. Module 2 — La palette de sons (`SON`) · *propre*

**Objet : produire trois sons nets et distincts, toujours à la même place.** Cajón : grave (CJ-G1→S1), tone
(CJ-G2→S2), slap catapulte (CJ-G3→S3). Djembé : bass (DJ-G1→S1), tone (DJ-G2→S2), slap fouetté (DJ-G3→S3).
Geste propre ⇒ **IDs propres**. *Preset : clic seul.* **Vocalisation** fondue en `-SON-04`.

### 2.1 Cajón — `MOD-CJ-D-SON`

- **Atome 1 · `EX-CJ-SON-01`** — Le grave (centre bas).
  Gestes : CJ-G1 → CJ-S1. Preset : `metro`, tempo 76.
  Consigne : Frappe le centre bas de la tapa, main pleine et relâchée : c'est le grave, rond et profond.
  Critère : *quand ton grave sort rond et profond, toujours au même endroit.*

- **Atome 2 · `EX-CJ-SON-02`** — Le tone (haut de tapa).
  Gestes : CJ-G2 → CJ-S2. Preset : `metro`, tempo 76.
  Consigne : Frappe plus haut sur la tapa, doigts joints : c'est le tone, plus clair et plus court que le grave.
  Critère : *quand ton tone sonne clair et bien distinct du grave.*

- **Atome 3 · `EX-CJ-SON-03`** — Le slap (catapulte).
  Gestes : CJ-G3 → CJ-S3. Preset : `metro`, tempo 76.
  Consigne : Fais claquer les doigts en catapulte sur le haut de la tapa : c'est le slap, sec et tranchant.
  Critère : *quand ton slap claque net, franchement différent du tone.*

- **Atome 4 · `EX-CJ-SON-04`** — Nommer les trois sons (vocalisation).
  Gestes : CJ-S1/S2/S3. Preset : `metro`, tempo 76.
  Consigne : Dis un mot de quatre syllabes, une par temps (« TA-KA-DI-MI »), et pose un son sur chaque syllabe.
  Critère : *quand chaque syllabe et chaque son tombent ensemble sur le temps.*

- **Synthèse · `EX-CJ-SON-05`** — Les trois sons à la suite, propres.
  Gestes : CJ-S1/S2/S3. Preset : `metro`, tempo 76.
  Consigne : Enchaîne grave, tone, slap sur les trois premiers temps puis silence sur le 4, en boucle sur le clic.
  Critère : *quand les trois sons restent nets et distincts, toujours à leur place, tour après tour.*

### 2.2 Djembé — `MOD-DJ-D-SON`

- **Atome 1 · `EX-DJ-SON-01`** — La bass (centre).
  Gestes : DJ-G1 → DJ-S1. Preset : `metro`, tempo 76.
  Consigne : Frappe le centre de la peau, main pleine et relâchée : c'est la bass, grave et ronde.
  Critère : *quand ta bass sort grave et pleine, au centre de la peau.*

- **Atome 2 · `EX-DJ-SON-02`** — Le tone (bord).
  Gestes : DJ-G2 → DJ-S2. Preset : `metro`, tempo 76.
  Consigne : Frappe le bord, doigts joints et à plat : c'est le tone, clair et chantant.
  Critère : *quand ton tone sonne clair, bien distinct de la bass.*

- **Atome 3 · `EX-DJ-SON-03`** — Le slap (fouetté).
  Gestes : DJ-G3 → DJ-S3. Preset : `metro`, tempo 76.
  Consigne : Fouette le bord, doigts relâchés qui claquent : c'est le slap, sec et perçant.
  Critère : *quand ton slap claque net, franchement différent du tone.*

- **Atome 4 · `EX-DJ-SON-04`** — Nommer les trois sons (vocalisation).
  Gestes : DJ-S1/S2/S3. Preset : `metro`, tempo 76.
  Consigne : Dis un mot de quatre syllabes, une par temps (« TA-KA-DI-MI »), et pose un son sur chaque syllabe.
  Critère : *quand chaque syllabe et chaque son tombent ensemble sur le temps.*

- **Synthèse · `EX-DJ-SON-05`** — Les trois sons à la suite.
  Gestes : DJ-S1/S2/S3. Preset : `metro`, tempo 76.
  Consigne : Enchaîne bass, tone, slap sur les trois premiers temps puis silence sur le 4, en boucle sur le clic.
  Critère : *quand les trois sons restent nets et distincts, tour après tour.*

---

## 3. Module 3 — La pulse & le comptage (`PLS`) · *socle agnostique* (`EX-SOCLE-D-PLS-*`)

**Objet : tenir une pulsation régulière, compter les 4 temps, retomber juste sur le 1.** Le time est agnostique
de l'instrument ⇒ **5 exercices partagés** (double couleur, marqueur « déjà rencontré »). *Preset : clic seul ;
coupure (machine gap) pour éprouver la tenue.* **Vocalisation** (compter à voix haute) fondue en `-PLS-01`.

- **Atome 1 · `EX-SOCLE-D-PLS-01`** *(partagé)* — Compter les 4 temps (vocalisation).
  Preset : `metro`, tempo 80.
  Consigne : Frappe un coup par temps en comptant à voix haute « 1-2-3-4 », en boucle, calé sur le clic.
  Critère : *quand tu comptes et frappes ensemble, sans te presser ni traîner.*

- **Atome 2 · `EX-SOCLE-D-PLS-02`** *(partagé)* — Retomber sur le 1.
  Preset : `metro`, tempo 80.
  Consigne : Accentue le 1 de chaque mesure, un peu plus fort, les trois autres temps égaux.
  Critère : *quand le 1 revient tout seul, mesure après mesure.*

- **Atome 3 · `EX-SOCLE-D-PLS-03`** *(partagé)* — Tenir sans se presser.
  Preset : `metro`, tempo 80.
  Consigne : Ne joue que le 1 et le 3, en gardant l'intervalle exactement égal — le silence compte autant que la frappe.
  Critère : *quand les frappes espacées restent parfaitement régulières.*

- **Atome 4 · `EX-SOCLE-D-PLS-04`** *(partagé)* — La coupure (machine gap).
  Preset : `metro`, tempo 80, `gap:{playN:4, muteM:1}`.
  Consigne : Le clic se tait une mesure entière : garde ta pulsation intérieure et retombe pile sur le 1 quand il revient.
  Critère : *quand le clic revient et que tu es toujours exactement en place.*

- **Synthèse · `EX-SOCLE-D-PLS-05`** *(partagé)* — Compter, tenir, retomber.
  Preset : `metro`, tempo 80, `gap:{playN:3, muteM:1}`.
  Consigne : Sur des cycles où le clic coupe une mesure sur quatre, compte les temps, tiens le time et retombe juste à chaque 1.
  Critère : *quand tu traverses la coupure sans perdre le compte ni le 1.*

---

## 4. Module 4 — Les subdivisions (`SUB`) · *socle agnostique* (`EX-SOCLE-D-SUB-*`)

**Objet : sentir 2 puis 4 frappes par temps, régulières, en touch léger** (CJ-M1 / DJ-M1). *Amorce non-funk*
de la grille de 16ᵉˢ (qui deviendra FUNK-T2 à l'Intermédiaire). Rôle agnostique (toucher léger) ⇒ **5 partagés**.
*Preset : clic + subdivision du métronome (2 puis 4).*

- **Atome 1 · `EX-SOCLE-D-SUB-01`** *(partagé)* — Deux frappes par temps (croches).
  Preset : `metro`, tempo 80, `subdiv:2`.
  Consigne : Pose deux frappes égales par temps (« 1-et, 2-et… »), légères et régulières, sur les croches du clic.
  Critère : *quand les deux frappes par temps sont parfaitement égales.*

- **Atome 2 · `EX-SOCLE-D-SUB-02`** *(partagé)* — Quatre frappes par temps (doubles).
  Preset : `metro`, tempo 80, `subdiv:4`.
  Consigne : Passe à quatre frappes égales par temps (« 1-e-et-a »), toujours très légères.
  Critère : *quand les quatre frappes tiennent sans accélérer ni ralentir.*

- **Atome 3 · `EX-SOCLE-D-SUB-03`** *(partagé)* — Alterner 2 et 4.
  Preset : `metro`, tempo 80, `subdiv:4`.
  Consigne : Une mesure en croches (2 par temps), une mesure en doubles (4 par temps), sans trou au changement.
  Critère : *quand tu passes de 2 à 4 frappes sans accroc de time.*

- **Atome 4 · `EX-SOCLE-D-SUB-04`** *(partagé)* — Toucher léger, régulier.
  Preset : `metro`, tempo 80, `subdiv:4`.
  Consigne : Garde le tapis de doubles très léger et parfaitement égal, comme un moteur, sans aucun accent.
  Critère : *quand le tapis de doubles tourne, égal et sans bosse.*

- **Synthèse · `EX-SOCLE-D-SUB-05`** *(partagé)* — La grille de 16ᵉˢ, amorce.
  Preset : `metro`, tempo 80, `subdiv:4`.
  Consigne : Tiens quatre frappes légères par temps sur deux mesures, régulières et détendues — c'est la future grille du funk.
  Critère : *quand la grille de doubles tient toute seule, légère et régulière.*

---

## 5. Module 5 — Fort & doux (dynamique) (`DYN`) · *propre*

**Objet : jouer le même son fort puis doux, l'étouffer.** Cajón : contrôle dynamique (CJ-M4), mute (CJ-M3),
press tone (CJ-M2). Djembé : ghost/touch (DJ-M1), muffled slap (DJ-M2). *Pré-requis* de la nappe de ghosts et
du contraste funk (Intermédiaire). Geste propre ⇒ **IDs propres**. *Preset : clic seul.*

### 5.1 Cajón — `MOD-CJ-D-DYN`

- **Atome 1 · `EX-CJ-DYN-01`** — Fort puis doux (contrôle dynamique).
  Gestes : CJ-M4. Preset : `metro`, tempo 84.
  Consigne : Joue le même tone quatre fois fort, quatre fois doux, sans changer de geste — seule l'intensité change.
  Critère : *quand l'écart fort/doux est net et que le son reste le même.*

- **Atome 2 · `EX-CJ-DYN-02`** — Le ghost (presque rien).
  Gestes : CJ-M1. Preset : `metro`, tempo 84.
  Consigne : Baisse encore : des touches à peine audibles (ghost) entre les temps, sous une frappe forte marquée.
  Critère : *quand tes ghosts sont réguliers et presque inaudibles.*

- **Atome 3 · `EX-CJ-DYN-03`** — Étouffer le son (mute).
  Gestes : CJ-M3. Preset : `metro`, tempo 84.
  Consigne : Frappe puis pose la main pour couper la résonance (mute) — un son court et sec, sur demande.
  Critère : *quand tu coupes le son exactement quand tu le décides.*

- **Atome 4 · `EX-CJ-DYN-04`** — Le press tone.
  Gestes : CJ-M2. Preset : `metro`, tempo 84.
  Consigne : Frappe en laissant la main appuyée : un tone étouffé, plus mat (press tone) — alterne avec le tone ouvert.
  Critère : *quand tu obtiens deux couleurs, ouvert et étouffé, à volonté.*

- **Synthèse · `EX-CJ-DYN-05`** — Nappe fort/doux.
  Gestes : CJ-M1, CJ-M4, CJ-M3. Preset : `metro`, tempo 84.
  Consigne : Sur deux mesures, place des accents forts sur un fond de ghosts, avec un son coupé de temps en temps.
  Critère : *quand le contraste fort/doux/coupé donne du relief sans casser le time.*

### 5.2 Djembé — `MOD-DJ-D-DYN`

- **Atome 1 · `EX-DJ-DYN-01`** — Fort puis doux (contrôle dynamique).
  Gestes : DJ-M1. Preset : `metro`, tempo 84.
  Consigne : Joue le même tone quatre fois fort, quatre fois doux, sans changer de geste — seule l'intensité change.
  Critère : *quand l'écart fort/doux est net et que le son reste le même.*

- **Atome 2 · `EX-DJ-DYN-02`** — Le ghost/touch.
  Gestes : DJ-M1. Preset : `metro`, tempo 84.
  Consigne : Baisse encore : des touches à peine audibles (ghost) entre les temps, sous une frappe forte marquée.
  Critère : *quand tes ghosts sont réguliers et presque inaudibles.*

- **Atome 3 · `EX-DJ-DYN-03`** — Le muffled slap.
  Gestes : DJ-M2. Preset : `metro`, tempo 84.
  Consigne : Fais un slap étouffé, mat et court, en gardant les doigts un instant sur la peau — alterne avec le slap ouvert.
  Critère : *quand tu obtiens deux slaps, ouvert et étouffé, à volonté.*

- **Atome 4 · `EX-DJ-DYN-04`** — Doser bass, tone, slap.
  Gestes : DJ-S1/S2/S3, DJ-M1. Preset : `metro`, tempo 84.
  Consigne : Enchaîne bass douce, tone moyen, slap fort — trois sons, trois intensités croissantes.
  Critère : *quand chaque son garde sa couleur et son niveau d'intensité.*

- **Synthèse · `EX-DJ-DYN-05`** — Nappe fort/doux.
  Gestes : DJ-M1, DJ-M2. Preset : `metro`, tempo 84.
  Consigne : Sur deux mesures, place des accents forts sur un fond de ghosts, avec un slap étouffé de temps en temps.
  Critère : *quand le contraste fort/doux/étouffé donne du relief sans casser le time.*

---

## 6. Blocs JS prêts à câbler (mêmes objets que l'Intermédiaire)

Structure calquée sur `PF_EX` / `PF_MOD` du build. Les `EX-SOCLE-D-*` ne sont déclarés **qu'une fois** et
référencés par les deux modules du couple (partage §3.2 spec mère). Accents conservés (fichier UTF-8 ;
l'app affiche déjà des accents partout). À insérer **après** le dernier exercice Intermédiaire
(`EX-SOCLE-D1-05`) et après le dernier module (`MOD-DJ-I-D1`).

```js
    // ===== P-6 : niveau Débutant (primer technique, pré-funk) =====
    // -- Module 1 : Posture, ancrage, rebond - CAJON (propre) --
    'EX-CJ-POS-01': { kind:'atome', objet:'S\'installer, caler le cajón',
      consigne:"Assieds-toi en équilibre, cale le cajón entre tes jambes, épaules relâchées et mains libres.",
      critere:"quand tu tiens l'instrument sans le serrer et que tes deux mains tombent naturellement sur la tapa.",
      preset:{ metro:true, tempo:72 } },
    'EX-CJ-POS-02': { kind:'atome', objet:'Le relâchement fait le rebond',
      consigne:"Laisse ta main retomber sur la tapa et rebondir toute seule, bras lourd et poignet souple — ne la retiens pas.",
      critere:"quand la main rebondit d'elle-même au lieu de rester collée à la tapa.",
      preset:{ metro:true, tempo:72 } },
    'EX-CJ-POS-03': { kind:'atome', objet:'Tension = son mort',
      consigne:"Compare une frappe crispée (son court et mat) et une frappe relâchée (son qui sonne) — garde la relâchée.",
      critere:"quand tu sens que serrer étouffe le son et que relâcher le libère.",
      preset:{ metro:true, tempo:72 } },
    'EX-CJ-POS-04': { kind:'atome', objet:'Frapper au même endroit, sans forcer',
      consigne:"Pose dix frappes détendues au même point de la tapa, une par temps, sans chercher à taper fort.",
      critere:"quand les dix frappes tombent au même endroit, sans effort ni fatigue.",
      preset:{ metro:true, tempo:72 } },
    'EX-CJ-POS-05': { kind:'synthese', objet:'Assise + rebond, une main puis l\'autre',
      consigne:"Alterne main gauche et main droite en frappes relâchées et rebondissantes sur le clic, épaules basses, une minute.",
      critere:"quand tu tiens une minute détendu, chaque frappe rebondit et rien ne se crispe.",
      preset:{ metro:true, tempo:72 } },
    // -- Module 1 : Posture, ancrage, rebond - DJEMBE (propre) --
    'EX-DJ-POS-01': { kind:'atome', objet:'S\'installer, incliner le djembé',
      consigne:"Cale le djembé incliné entre tes jambes pour que l'air passe dessous, dos droit, épaules relâchées, mains libres.",
      critere:"quand le fût est stable et incliné, et que tes mains tombent naturellement sur la peau.",
      preset:{ metro:true, tempo:72 } },
    'EX-DJ-POS-02': { kind:'atome', objet:'Le rebond « open »',
      consigne:"Frappe le bord de la peau et laisse la main rebondir aussitôt (open) — la peau sonne parce que la main repart.",
      critere:"quand la main repart toute seule après la frappe et laisse la peau résonner.",
      preset:{ metro:true, tempo:72 } },
    'EX-DJ-POS-03': { kind:'atome', objet:'Tension = son mort',
      consigne:"Compare une frappe crispée (mate et courte) et une frappe relâchée qui rebondit (ouverte) — garde la relâchée.",
      critere:"quand tu sens que la main qui reste sur la peau tue le son.",
      preset:{ metro:true, tempo:72 } },
    'EX-DJ-POS-04': { kind:'atome', objet:'Frapper au même endroit, sans forcer',
      consigne:"Pose dix frappes détendues au bord de la peau, une par temps, sans forcer.",
      critere:"quand les dix frappes sonnent pareil, au même endroit, sans fatigue.",
      preset:{ metro:true, tempo:72 } },
    'EX-DJ-POS-05': { kind:'synthese', objet:'Assise + rebond open, une main puis l\'autre',
      consigne:"Alterne les mains en frappes open rebondissantes sur le clic, une minute, épaules basses.",
      critere:"quand tu tiens une minute détendu, chaque main rebondit et la peau sonne à chaque coup.",
      preset:{ metro:true, tempo:72 } },
    // -- Module 2 : La palette de sons - CAJON (propre) --
    'EX-CJ-SON-01': { kind:'atome', objet:'Le grave (centre bas)',
      consigne:"Frappe le centre bas de la tapa, main pleine et relâchée : c'est le grave, rond et profond.",
      critere:"quand ton grave sort rond et profond, toujours au même endroit.",
      preset:{ metro:true, tempo:76 } },
    'EX-CJ-SON-02': { kind:'atome', objet:'Le tone (haut de tapa)',
      consigne:"Frappe plus haut sur la tapa, doigts joints : c'est le tone, plus clair et plus court que le grave.",
      critere:"quand ton tone sonne clair et bien distinct du grave.",
      preset:{ metro:true, tempo:76 } },
    'EX-CJ-SON-03': { kind:'atome', objet:'Le slap (catapulte)',
      consigne:"Fais claquer les doigts en catapulte sur le haut de la tapa : c'est le slap, sec et tranchant.",
      critere:"quand ton slap claque net, franchement différent du tone.",
      preset:{ metro:true, tempo:76 } },
    'EX-CJ-SON-04': { kind:'atome', objet:'Nommer les trois sons (vocalisation)',
      consigne:"Dis un mot de quatre syllabes, une par temps (« TA-KA-DI-MI »), et pose un son sur chaque syllabe.",
      critere:"quand chaque syllabe et chaque son tombent ensemble sur le temps.",
      preset:{ metro:true, tempo:76 } },
    'EX-CJ-SON-05': { kind:'synthese', objet:'Les trois sons à la suite, propres',
      consigne:"Enchaîne grave, tone, slap sur les trois premiers temps puis silence sur le 4, en boucle sur le clic.",
      critere:"quand les trois sons restent nets et distincts, toujours à leur place, tour après tour.",
      preset:{ metro:true, tempo:76 } },
    // -- Module 2 : La palette de sons - DJEMBE (propre) --
    'EX-DJ-SON-01': { kind:'atome', objet:'La bass (centre)',
      consigne:"Frappe le centre de la peau, main pleine et relâchée : c'est la bass, grave et ronde.",
      critere:"quand ta bass sort grave et pleine, au centre de la peau.",
      preset:{ metro:true, tempo:76 } },
    'EX-DJ-SON-02': { kind:'atome', objet:'Le tone (bord)',
      consigne:"Frappe le bord, doigts joints et à plat : c'est le tone, clair et chantant.",
      critere:"quand ton tone sonne clair, bien distinct de la bass.",
      preset:{ metro:true, tempo:76 } },
    'EX-DJ-SON-03': { kind:'atome', objet:'Le slap (fouetté)',
      consigne:"Fouette le bord, doigts relâchés qui claquent : c'est le slap, sec et perçant.",
      critere:"quand ton slap claque net, franchement différent du tone.",
      preset:{ metro:true, tempo:76 } },
    'EX-DJ-SON-04': { kind:'atome', objet:'Nommer les trois sons (vocalisation)',
      consigne:"Dis un mot de quatre syllabes, une par temps (« TA-KA-DI-MI »), et pose un son sur chaque syllabe.",
      critere:"quand chaque syllabe et chaque son tombent ensemble sur le temps.",
      preset:{ metro:true, tempo:76 } },
    'EX-DJ-SON-05': { kind:'synthese', objet:'Les trois sons à la suite',
      consigne:"Enchaîne bass, tone, slap sur les trois premiers temps puis silence sur le 4, en boucle sur le clic.",
      critere:"quand les trois sons restent nets et distincts, tour après tour.",
      preset:{ metro:true, tempo:76 } },
    // -- Module 3 : La pulse & le comptage (socle) --
    'EX-SOCLE-D-PLS-01': { kind:'atome', objet:'Compter les 4 temps (vocalisation)',
      consigne:"Frappe un coup par temps en comptant à voix haute « 1-2-3-4 », en boucle, calé sur le clic.",
      critere:"quand tu comptes et frappes ensemble, sans te presser ni traîner.",
      preset:{ metro:true, tempo:80 } },
    'EX-SOCLE-D-PLS-02': { kind:'atome', objet:'Retomber sur le 1',
      consigne:"Accentue le 1 de chaque mesure, un peu plus fort, les trois autres temps égaux.",
      critere:"quand le 1 revient tout seul, mesure après mesure.",
      preset:{ metro:true, tempo:80 } },
    'EX-SOCLE-D-PLS-03': { kind:'atome', objet:'Tenir sans se presser',
      consigne:"Ne joue que le 1 et le 3, en gardant l'intervalle exactement égal — le silence compte autant que la frappe.",
      critere:"quand les frappes espacées restent parfaitement régulières.",
      preset:{ metro:true, tempo:80 } },
    'EX-SOCLE-D-PLS-04': { kind:'atome', objet:'La coupure (machine gap)',
      consigne:"Le clic se tait une mesure entière : garde ta pulsation intérieure et retombe pile sur le 1 quand il revient.",
      critere:"quand le clic revient et que tu es toujours exactement en place.",
      preset:{ metro:true, tempo:80, gap:{ playN:4, muteM:1 } } },
    'EX-SOCLE-D-PLS-05': { kind:'synthese', objet:'Compter, tenir, retomber',
      consigne:"Sur des cycles où le clic coupe une mesure sur quatre, compte les temps, tiens le time et retombe juste à chaque 1.",
      critere:"quand tu traverses la coupure sans perdre le compte ni le 1.",
      preset:{ metro:true, tempo:80, gap:{ playN:3, muteM:1 } } },
    // -- Module 4 : Les subdivisions (socle) --
    'EX-SOCLE-D-SUB-01': { kind:'atome', objet:'Deux frappes par temps (croches)',
      consigne:"Pose deux frappes égales par temps (« 1-et, 2-et… »), légères et régulières, sur les croches du clic.",
      critere:"quand les deux frappes par temps sont parfaitement égales.",
      preset:{ metro:true, tempo:80, subdiv:2 } },
    'EX-SOCLE-D-SUB-02': { kind:'atome', objet:'Quatre frappes par temps (doubles)',
      consigne:"Passe à quatre frappes égales par temps (« 1-e-et-a »), toujours très légères.",
      critere:"quand les quatre frappes tiennent sans accélérer ni ralentir.",
      preset:{ metro:true, tempo:80, subdiv:4 } },
    'EX-SOCLE-D-SUB-03': { kind:'atome', objet:'Alterner 2 et 4',
      consigne:"Une mesure en croches (2 par temps), une mesure en doubles (4 par temps), sans trou au changement.",
      critere:"quand tu passes de 2 à 4 frappes sans accroc de time.",
      preset:{ metro:true, tempo:80, subdiv:4 } },
    'EX-SOCLE-D-SUB-04': { kind:'atome', objet:'Toucher léger, régulier',
      consigne:"Garde le tapis de doubles très léger et parfaitement égal, comme un moteur, sans aucun accent.",
      critere:"quand le tapis de doubles tourne, égal et sans bosse.",
      preset:{ metro:true, tempo:80, subdiv:4 } },
    'EX-SOCLE-D-SUB-05': { kind:'synthese', objet:'La grille de 16es, amorce',
      consigne:"Tiens quatre frappes légères par temps sur deux mesures, régulières et détendues — c'est la future grille du funk.",
      critere:"quand la grille de doubles tient toute seule, légère et régulière.",
      preset:{ metro:true, tempo:80, subdiv:4 } },
    // -- Module 5 : Fort & doux (dynamique) - CAJON (propre) --
    'EX-CJ-DYN-01': { kind:'atome', objet:'Fort puis doux (contrôle dynamique)',
      consigne:"Joue le même tone quatre fois fort, quatre fois doux, sans changer de geste — seule l'intensité change.",
      critere:"quand l'écart fort/doux est net et que le son reste le même.",
      preset:{ metro:true, tempo:84 } },
    'EX-CJ-DYN-02': { kind:'atome', objet:'Le ghost (presque rien)',
      consigne:"Baisse encore : des touches à peine audibles (ghost) entre les temps, sous une frappe forte marquée.",
      critere:"quand tes ghosts sont réguliers et presque inaudibles.",
      preset:{ metro:true, tempo:84 } },
    'EX-CJ-DYN-03': { kind:'atome', objet:'Étouffer le son (mute)',
      consigne:"Frappe puis pose la main pour couper la résonance (mute) — un son court et sec, sur demande.",
      critere:"quand tu coupes le son exactement quand tu le décides.",
      preset:{ metro:true, tempo:84 } },
    'EX-CJ-DYN-04': { kind:'atome', objet:'Le press tone',
      consigne:"Frappe en laissant la main appuyée : un tone étouffé, plus mat (press tone) — alterne avec le tone ouvert.",
      critere:"quand tu obtiens deux couleurs, ouvert et étouffé, à volonté.",
      preset:{ metro:true, tempo:84 } },
    'EX-CJ-DYN-05': { kind:'synthese', objet:'Nappe fort/doux',
      consigne:"Sur deux mesures, place des accents forts sur un fond de ghosts, avec un son coupé de temps en temps.",
      critere:"quand le contraste fort/doux/coupé donne du relief sans casser le time.",
      preset:{ metro:true, tempo:84 } },
    // -- Module 5 : Fort & doux (dynamique) - DJEMBE (propre) --
    'EX-DJ-DYN-01': { kind:'atome', objet:'Fort puis doux (contrôle dynamique)',
      consigne:"Joue le même tone quatre fois fort, quatre fois doux, sans changer de geste — seule l'intensité change.",
      critere:"quand l'écart fort/doux est net et que le son reste le même.",
      preset:{ metro:true, tempo:84 } },
    'EX-DJ-DYN-02': { kind:'atome', objet:'Le ghost/touch',
      consigne:"Baisse encore : des touches à peine audibles (ghost) entre les temps, sous une frappe forte marquée.",
      critere:"quand tes ghosts sont réguliers et presque inaudibles.",
      preset:{ metro:true, tempo:84 } },
    'EX-DJ-DYN-03': { kind:'atome', objet:'Le muffled slap',
      consigne:"Fais un slap étouffé, mat et court, en gardant les doigts un instant sur la peau — alterne avec le slap ouvert.",
      critere:"quand tu obtiens deux slaps, ouvert et étouffé, à volonté.",
      preset:{ metro:true, tempo:84 } },
    'EX-DJ-DYN-04': { kind:'atome', objet:'Doser bass, tone, slap',
      consigne:"Enchaîne bass douce, tone moyen, slap fort — trois sons, trois intensités croissantes.",
      critere:"quand chaque son garde sa couleur et son niveau d'intensité.",
      preset:{ metro:true, tempo:84 } },
    'EX-DJ-DYN-05': { kind:'synthese', objet:'Nappe fort/doux',
      consigne:"Sur deux mesures, place des accents forts sur un fond de ghosts, avec un slap étouffé de temps en temps.",
      critere:"quand le contraste fort/doux/étouffé donne du relief sans casser le time.",
      preset:{ metro:true, tempo:84 } },
```

```js
    // ===== P-6 : modules Débutant =====
    'MOD-CJ-D-POS': { parcours:'cajon', niveau:'debutant', objet:'Posture, ancrage, rebond',
      exercices:['EX-CJ-POS-01','EX-CJ-POS-02','EX-CJ-POS-03','EX-CJ-POS-04','EX-CJ-POS-05'] },
    'MOD-DJ-D-POS': { parcours:'djembe', niveau:'debutant', objet:'Posture, ancrage, rebond',
      exercices:['EX-DJ-POS-01','EX-DJ-POS-02','EX-DJ-POS-03','EX-DJ-POS-04','EX-DJ-POS-05'] },
    'MOD-CJ-D-SON': { parcours:'cajon', niveau:'debutant', objet:'La palette de sons',
      exercices:['EX-CJ-SON-01','EX-CJ-SON-02','EX-CJ-SON-03','EX-CJ-SON-04','EX-CJ-SON-05'] },
    'MOD-DJ-D-SON': { parcours:'djembe', niveau:'debutant', objet:'La palette de sons',
      exercices:['EX-DJ-SON-01','EX-DJ-SON-02','EX-DJ-SON-03','EX-DJ-SON-04','EX-DJ-SON-05'] },
    'MOD-CJ-D-PLS': { parcours:'cajon', niveau:'debutant', objet:'La pulse & le comptage',
      exercices:['EX-SOCLE-D-PLS-01','EX-SOCLE-D-PLS-02','EX-SOCLE-D-PLS-03','EX-SOCLE-D-PLS-04','EX-SOCLE-D-PLS-05'] },
    'MOD-DJ-D-PLS': { parcours:'djembe', niveau:'debutant', objet:'La pulse & le comptage',
      exercices:['EX-SOCLE-D-PLS-01','EX-SOCLE-D-PLS-02','EX-SOCLE-D-PLS-03','EX-SOCLE-D-PLS-04','EX-SOCLE-D-PLS-05'] },
    'MOD-CJ-D-SUB': { parcours:'cajon', niveau:'debutant', objet:'Les subdivisions',
      exercices:['EX-SOCLE-D-SUB-01','EX-SOCLE-D-SUB-02','EX-SOCLE-D-SUB-03','EX-SOCLE-D-SUB-04','EX-SOCLE-D-SUB-05'] },
    'MOD-DJ-D-SUB': { parcours:'djembe', niveau:'debutant', objet:'Les subdivisions',
      exercices:['EX-SOCLE-D-SUB-01','EX-SOCLE-D-SUB-02','EX-SOCLE-D-SUB-03','EX-SOCLE-D-SUB-04','EX-SOCLE-D-SUB-05'] },
    'MOD-CJ-D-DYN': { parcours:'cajon', niveau:'debutant', objet:'Fort & doux',
      exercices:['EX-CJ-DYN-01','EX-CJ-DYN-02','EX-CJ-DYN-03','EX-CJ-DYN-04','EX-CJ-DYN-05'] },
    'MOD-DJ-D-DYN': { parcours:'djembe', niveau:'debutant', objet:'Fort & doux',
      exercices:['EX-DJ-DYN-01','EX-DJ-DYN-02','EX-DJ-DYN-03','EX-DJ-DYN-04','EX-DJ-DYN-05'] },
```

---

## 7. Câblage build (fichier complet, jamais un patch) — 0.7.0 → 0.8.0

Le peuplement change le parcours d'un niveau unique (Intermédiaire) à un parcours **multi-niveaux**. Cinq zones,
toutes **additives et confinées** au bloc parcours funk (+ un sélecteur de niveau) :

1. **Données** — insérer les 40 exercices dans `PF_EX` et les 10 modules dans `PF_MOD` (blocs §6).
2. **Render niveau-aware** — `pfRender` généralisé :
   - `PF_NIV_ORDER = { debutant:['POS','SON','PLS','SUB','DYN'], intermediaire:['T1','T2','B1','B2','D1','I2'] }`
   - `PF_NIV_INFIX = { debutant:'D', intermediaire:'I', avance:'Av', artiste:'Ar' }`
   - `PF_NIV_LABEL = { debutant:'Débutant', intermediaire:'Intermédiaire', avance:'Avancé', artiste:'Artiste' }`
   - niveaux **peuplés** = ceux qui ont ≥1 module dans `PF_MOD` (calculé) — aujourd'hui `[debutant, intermediaire]`.
   - un **sélecteur de niveau** (onglets segmentés) au-dessus de la grille ; **un seul niveau rendu à la fois**.
   - niveau courant persistant (`fm-metro-parcours-niveau`), **défaut = `debutant`** (l'entrée pédagogique) ;
     retombe sur le 1ᵉʳ niveau peuplé si la valeur stockée n'est plus peuplée.
   - `pref = 'MOD-' + (pk==='cajon'?'CJ':'DJ') + '-' + PF_NIV_INFIX[niv] + '-'` (au lieu du `-I-` figé).
3. **Preset étendu** — `pfLoadPreset` gère `metro` / `tempo` / `subdiv` / `gap` (cf. §0.1). Les presets
   Intermédiaire (sans ces champs) prennent la branche basse **inchangée**. Sync UI : `subdivSel`, `gapMode`/
   `gapTarget`/`gapPlay`/`gapMute` + `gapTargetRefresh()` / `resetGap()`.
4. **Niveau effectif** — `pfNiveauEffectif` : la base n'est plus figée à `intermediaire` ; elle est **dérivée
   du niveau du module** propriétaire de l'exercice (index `ex → niveau` construit depuis `PF_MOD`). La
   promotion (+1 niveau) reste inchangée : un atome Débutant promu passe `debutant → intermediaire`, un atome
   Intermédiaire `intermediaire → avance` (comportement testé par recette-P4 §7.6/8.3, préservé).
5. **Divers** — CSS `.pf-niv-tabs`/`.pf-niv-tab` ; hook API `niveau` + `showNiveau(n)` exposés par
   `window.fmMetroParcours()` ; stamp `BUILD = 'metronomefunk-0.8.0'`, `BUILD_DATE = '2026-07-16'` ; sous-titre
   de section « Cours funk » : *parcours · plusieurs niveaux* (+ i18n EN/PT).

**Invariant `N_min` (point ouvert P-5 §7.3)** : non touché ici. Le mécanisme de promotion ≥ 40 % / `N_min = 8`
vit côté Supabase (RPC `pf_promotion`), inchangé. Le câblage P-6 ne modifie que l'affichage du niveau
effectif. `N_min` reste à sa valeur par défaut (8).

---

## 8. Recette & non-régression

- **`recette-P6.js`** (nouvelle) : intégrité données Débutant (10 modules `debutant`, 40 exercices, socle =
  `EX-SOCLE-D-PLS-*` + `EX-SOCLE-D-SUB-*`, 4 atomes + 1 synthèse, ordre POS→SON→PLS→SUB→DYN), presets
  (`metro` clic seul, `subdiv`, `gap`), rendu sous le niveau Débutant + sélecteur, promotion base
  `debutant → intermediaire`, vocalisation présente (`-SON-04`, `-PLS-01`), no-op hors écran.
- **`recette-P2.js`** (mise à jour) : compteurs **scindés par niveau** (12 modules / 42 exercices *Intermédiaire*),
  sélecteur (`showNiveau('intermediaire')` avant les assertions DOM), ensemble partagé Intermédiaire = 18
  `EX-SOCLE` (hors `EX-SOCLE-D-*`). Intention préservée : l'Intermédiaire est intact.
- **`recette-P4.js`** (mise à jour) : `showNiveau('intermediaire')` avant les assertions DOM du module 6 ;
  comportement (preset, partage, acquis, votes, promotion) inchangé.
- **Batterie complète** (19 suites, main 0.7.0) relancée sur le build 0.8.0 renommé `index.html` dans un
  dossier propre (piège des copies périmées). Objectif : **zéro rouge**. Rapport `rapport-nonregression-0.8.0.md`.

---

## 9. Points à trancher par Jean (porte de qualité)

1. **Preset « clic seul » (pré-funk)** — le Débutant se joue au métronome seul (jamais de basse funk). Faithful
   à la carte (« clic seul »). OK, ou veux-tu une basse minimale sous certains modules ?
2. **Défaut du sélecteur = Débutant** — l'écran « Cours funk » ouvre désormais sur le Débutant (entrée
   pédagogique), l'Intermédiaire à un clic. Bascule triviale (une constante) si tu préfères garder
   l'Intermédiaire par défaut.
3. **Vocalisation** — fondue dans `-SON-04` (mot de 4 syllabes) et `-PLS-01` (compter à voix haute), comme
   décidé en P-5 §7.2. Confirmes-tu ces deux points d'ancrage ?
4. **SUB via subdivisions du métronome** (plutôt que « ghostPendule densité basse ») — plus neutre / pré-funk.
   D'accord ?
5. **Nombre d'atomes/module** : 4 + synthèse (gabarit P-2) conservé partout. OK ?
6. **Accents conservés** dans les chaînes de données (l'Intermédiaire P-2 les avait retirés ; ici on les garde,
   fichier UTF-8, meilleur rendu français). OK, ou uniformiser ?

Rien n'est poussé sur GitHub sans ta demande. Après ton feu vert : la batterie de non-régression est déjà
verte (cf. rapport), le build `index.html` 0.8.0 et les trois recettes sont prêts pour la PR.

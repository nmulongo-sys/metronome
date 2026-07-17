# Spec R-4d — la grille d'exercice vivante (apprendre.html)

> **PROPOSÉE le 2026-07-17** — demande de Jean du 17/07 (« il manque une visualisation :
> le séquenceur qui tourne, avec des indications du moment où les frappes doivent
> intervenir »). Arbitrages déjà actés en séance : périmètre **écoute + pratique** ;
> **index/pratiquer intouchés** (le calage existant convient à Jean — « un poil en
> arrière, mais c'est le temps de transférer œil-geste ») ; chantier **R-4d dédié,
> branche empilée sur la PR #28** (les deux touchent apprendre.html, précédent R-4b/#25).
> Build cible : **0.16.0**.

## 1. Objet

Sur `apprendre.html`, la fiche d'un exercice à démo affiche **la grille de l'exercice** :
une ligne par voix, cases marquées (vide / frappe / accent), **curseur de pas qui
tourne** en lecture — pendant « ▶ Écouter » (l'élève VOIT ce que le modèle joue) **et
en mode pratique après « Charger »** (l'élève voit où ses frappes doivent tomber
pendant qu'il joue sur l'accompagnement). Les exercices sans démo sont inchangés
(« démo à venir », pas de grille : il n'y a pas de partie à montrer).

## 2. Ce que R-4d NE fait PAS

- **Zéro retouche moteur** (md5 == 0.10.0, tolérances inchangées) — tout vit dans le
  script de page d'apprendre (`draw()` y est aujourd'hui un stub vide, l. 357).
- **index.html et pratiquer.html : INTOUCHÉS.** Le comportement de leurs curseurs
  (clamp de phase négative à 0 en fin de mesure, latence de sortie non soustraite)
  est CONNU et DOCUMENTÉ ici, et Jean l'a jugé satisfaisant à l'oreille-œil le
  17/07. Si R-5 veut les aligner, le patron de phase de R-4d (§3.3) est prêt.
- Pas de nouvelle capacité de corpus : la grille REND le champ `demo` existant
  (R-4a/R-4c), elle n'introduit aucun format.

## 3. Mécanique

### 3.1 Le widget « grille »

- **Emplacement** : dans la carte de l'exercice (`pf-card`), sous la rangée
  Écouter/Charger — UNE grille à la fois, celle de l'exercice actif (Écouter ou
  Charger la pose ; changer d'exercice la déplace ; l'arrêt du transport fige le
  curseur, la fermeture de la fiche la retire).
- **Contenu** : pour chaque voix de la variante résolue (`demoFor(E, parcours)`),
  une ligne de `steps` cases (4/8/12/16) : case vide (0), frappe (1), accent (2,
  rendu renforcé). Libellés de voix aux couleurs maison (grave/aigu — basse/tone/
  slap). Grille en **lecture seule** : aucune édition, ce n'est pas le séquenceur
  de pratiquer.
- **Mode pratique** : après « Charger », les voix de démo quittent percGrids
  (l'élève joue) mais la grille AFFICHE toujours la partie (elle lit le champ
  `demo`, pas percGrids) et le curseur continue de tourner sur l'accompagnement.

### 3.2 Le curseur

`draw()` d'apprendre devient une vraie boucle rAF (le stub actuel disparaît),
active uniquement quand `isPlaying` ET une grille est posée : pas de coût quand
rien ne joue (patron de sobriété des pages).

### 3.3 La phase — née correcte

`phase = ((audioCtx.currentTime − cycleStart) / cycleDur) % 1` ; si `phase < 0`
(fin de mesure : le scheduler a déjà basculé `cycleStart` sur la mesure suivante,
fenêtre AHEAD = 0,20 s), afficher **`phase + 1`** (fin de mesure), PAS 0 — le
curseur du nouveau widget ne saute jamais au 1 en avance. Pas de soustraction de
latence de sortie (cohérence avec les autres pages ; Jean : « ça va »).
Case courante = `floor(phase · steps)`, par ligne (les grilles d'une démo
partagent `steps` — asserté par recette-demo).

### 3.4 Approximations DÉCLARÉES

- **Le feel n'est pas visualisé** : la grille est quantifiée ; le ±18 ms des
  démos P1/P2 s'entend mais ne se voit pas (une case décalée d'un dixième de pas
  serait illisible). Idem **swing** : les cases impaires restent centrées.
- La grille montre UN cycle : les structures multi-mesures restent sans démo ni
  grille (liste fermée R-4c inchangée).

### 3.5 i18n

Chaînes nouvelles (libellé du widget, légende accent/frappe, noms de voix s'ils
ne sont pas déjà aux dictionnaires) : **EN et PT systématiques** (patron 0.6.9).

## 4. Preuves

- **recette-apprendre étendue** (~+6) : grille posée à l'Écouter (lignes = voix,
  cases = steps, accents distingués) ; grille MAINTENUE après Charger ; retirée au
  clear/fermeture ; la fonction de phase replie le négatif en fin de mesure
  (testable en pur : `phaseVisuelle(-0.05) === 0.95`) ; zéro grille sur un
  exercice sans démo ; chaînes EN/PT présentes.
- **Navigateur réel, deux modes** : curseur qui AVANCE pendant l'écoute (deux
  lectures de la case courante espacées d'un demi-pas diffèrent), grille encore là
  et curseur toujours en mouvement après Charger.
- Batterie complète : les 28 suites, comptes des 27 autres inchangés.

## 5. Points restants à trancher par Jean (GO attendu)

1. **Emplacement** : la grille dans la carte de l'exercice, sous Écouter/Charger
   (§3.1) — OK, ou tu la préfères ancrée près du transport (toujours visible même
   fiche repliée) ?
2. **Feel/swing non visualisés** (§3.4, déclaré au rapport) — OK ?
3. **Une grille à la fois** (l'exercice actif) — OK ?
4. GO en bloc → exécution immédiate, branche `claude/r4d-grille-exercice` empilée
   sur #28, build 0.16.0, rapport de non-régression joint à la PR.

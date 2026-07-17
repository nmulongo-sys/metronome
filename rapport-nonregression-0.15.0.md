# Rapport de non-régression — build 0.15.0 (R-4c)

> Chantier **R-4c** de la refonte B+ (spec R-4 §3.4, GO en bloc du 16/07) sur base
> **main = 0.14.0** (`0daa487`, merge PR #27). Porte d'entrée franchie le **17/07** :
> **échantillon pilote des 10 démos validé à l'oreille par Jean** (« GO pour R-4c »).
> Un actage NOUVEAU a été demandé et obtenu en séance (17/07) : **extension `demo.feel`**
> pour les modules Artiste P1/P2 (voir §1.2 et §5). Environnement : Node v24 (local,
> Windows), jsdom, clean-room (clone frais, LF) ; navigateur réel Chrome headless via
> playwright-core, **http:// (serveur statique) ET file://** sur les trois pages.

## 1. Périmètre livré

### 1.1 Peuplement `demo` Avancé + Artiste (corpus/funk.js seul)

**40 démos nouvelles** (Avancé 17/35, Artiste 23/35), format acté §9.2 inchangé :
`{ instr, steps ∈ {4,8,12,16}, voix: { <voix>: [0/1/2 × steps] }, swing?, feel? }`,
variante par instrument pour les EX-SOCLE partagés (60 exercices partagés au total).
Les cellules pédagogiques clés sont assertées une à une (recette-demo §4bis) :

- **B3 (syncope du grave)** : ancrage sur le 1, grave anticipé (pas 14, le 1 vide),
  grave retardé (pas 1) ;
- **I1 (hocketing)** : les 5 démos ne posent **aucune frappe sur une note de la
  basse** — l'espace négatif est asserté programmatiquement contre les patterns du
  corpus (theOne/syncopeGrave), pour I1, I4-03 et SOLO-04 ;
- **R2 (ombre de la clave)** : tresillo 3+3+2 (pas 0/6/12), clave + pulsation à deux
  voix, et **3-contre-2 sur grille TERNAIRE (12 pas)** — steps 12 était déjà dans le
  format acté (recette-demo R-4a l'acceptait), c'est sa première utilisation ; le
  moteur divise le cycle par la longueur de grille, vérifié en navigateur réel
  (6 frappes aux 1/6 de mesure, convergences accentuées) ;
- **CALL (appel manding)** : phrase d'appel (choix d'auteur, §5) + accompagnement
  stable (bass 1 & 3, doubles « et-a », backbeat slap) ;
- **P1/P2 (laid-back/pushed)** : les 10 exercices portent **`feel` ±18 ms** — grilles
  identiques deux à deux, seul le placement change (asserté) ;
- **P3 (la poche)** : nappe continue, accents 2 & 4, respiration sur la synthèse ;
- **R1** : 3-contre-2 à deux étages (grille 12), syncope perpétuelle (accents sur
  les contretemps de croche) ;
- **COL / SOLO / I4** : heel-toe (grave/aigu alternés), frappe combinée (grave+aigu
  strictement simultanés — « sans flam » asserté), ancre de solo (DUN·ta-ta·PA),
  phrases tambour-voix.

**30 exercices restent sans démo, liste FERMÉE assertée** (motivations §5).

### 1.2 Extension `demo.feel` (actage Jean du 17/07)

`feel` : décalage **constant** de toutes les frappes de la démo, en **ms** (±25,
bornes du feel basse R-3b), laid-back > 0 / pushed < 0, **réservé aux modules
Artiste P1/P2** (discipline assertée : exactement 10 exercices, signe par module).

- **Mécanique — zéro retouche moteur PAR CONSTRUCTION** : `computeCycle` lit déjà
  `percOffsets` par pas (fm-audio.js, chemin du swing de démo R-4a). La page seule
  convertit : `flOff = feel · tempo · steps / 240000` (fraction de pas au tempo
  courant), posé sur TOUS les pas et composé avec le swing éventuel — déviation
  marquée `R-4c (apprendre)` dans `demoApply`, ~7 lignes. `demoClear` inchangé
  (les offsets partent avec la démo). Identité stricte à l'absence du champ.
- **Dépendance au tempo déclarée** : la fraction est calculée au tempo du moment de
  l'« Écouter » ; si l'élève change ensuite le tempo, le feel suit en proportion
  (le ratio au pas reste constant, la valeur ms glisse). Assumé : c'est le
  comportement musicalement attendu d'un placement relatif.
- **Écart de périmètre déclaré** : le brief R-4b annonçait R-4c « corpus +
  validateur » ; `apprendre.html` est touché en plus (les ~7 lignes ci-dessus),
  sur actage explicite de Jean en séance. Aucune autre surface modifiée.
- **À l'oreille** : le rendu feel n'a PAS été couvert par l'échantillon pilote du
  16/07 (qui validait la palette quantifiée) — **ré-écoute ciblée P1/P2 demandée à
  Jean sur cette PR** (porte de sortie §6).

### 1.3 Le reste

- `moteur/fm-etat.js` : BUILD **0.15.0** (la ligne vivante, seule retouche moteur).
- AUCUNE chaîne d'interface nouvelle : pas de dette i18n (le feel est inaudible aux
  dictionnaires — aucun libellé).
- `index.html`, `pratiquer.html`, grooves, coquille : **intouchés**.

## 2. Moteur : rien — par construction

`recette-extraction.js` (26 assertions, inchangée dans sa substance) : les trois
`moteur/*.js` restent identiques octet pour octet au 0.10.0 (l'oreille du 10/07),
**tolérances INCHANGÉES** (ligne BUILD + les deux retouches R-3b actées, comptage
strict `accompMuted` ×1 / `feelMs` ×2 — aucune nouvelle). Le feel de démo emprunte
un chemin moteur qui existait déjà (`percOffsets`), comme le swing de démo R-4a.

## 3. Batterie canonique : 28 suites, 977 assertions, TOUT VERT

| Suite | 0.14.0 | 0.15.0 | Note |
|---|---|---|---|
| 26 suites inchangées | 907 | **907** | comptes par suite STRICTEMENT inchangés (les 20 historiques + P7/P8 re-pointées R-4b, corpus, registre, extraction, grooves, pratiquer, accueil) |
| demo | 14 | **27** | +13 : périmètre 4 niveaux (17/35, 23/35), liste fermée des 30 sans-démo, 9 fidélités ponctuelles Av/Ar, espace négatif programmatique, discipline du feel |
| apprendre | 41 | **43** | +2 : câblage feel côté page (offset constant +18 ms P1-01 / −18 ms P2-01, retiré au clear) |
| **Total** | 962 | **977** | zéro adaptation du harnais (`chargeHtml` inchangé) |

Trois retouches de suites hors ajout, à compte constant : `recette-accueil` A1.2/A1.3
et `recette-pratiquer`/`recette-apprendre`/`recette-extraction` suivent la ligne
vivante BUILD (0.14.0 → 0.15.0, patron habituel) ; `recette-corpus` étend sa lambda
de forme `estDemo1` aux bornes du feel (aucune assertion ajoutée, le détail reste
porté par recette-demo).

## 4. Navigateur réel (Chrome headless) — les DEUX modes, les TROIS pages

**http:// et file:// : 15 vérifications chacun, tout vert (30/30).** Par page :
0 erreur console applicative, 0 ressource locale en échec, build 0.15.0 affiché.
Sur `apprendre.html`, **joué pour de vrai** dans les deux modes :

- **P1-01 (Artiste, laid-back)** : « ▶ Écouter » → AudioContext `running`, lecture
  active, `percOffsets["demo.aigu"]` = **0,1008 pas constant sur les 16 cases**
  (18 ms × 84 bpm × 16 / 240000 — la valeur exacte), statut « Écoute — le modèle
  joue » ;
- **R2-04 (Avancé, 3-contre-2)** : grille ternaire de 12, 6 événements aux 1/6 de
  mesure, accents sur les convergences (temps 1 et 3) ;
- **« Charger »** : démo retirée, zéro résidu (percGrids/percOffsets vides,
  S.perc.on false), « Lecture — à toi de jouer ».

Le sans-serveur reste garanti (file:// propre, CDN gardés).

## 5. Les démos : choix d'auteur, approximations déclarées

- **Palette inchangée** (rapport 0.13.0 §5 toujours valable) : cajón grave/aigu
  (tone et slap portés par `aigu`, le slap accentué), djembé basse/tone/slap,
  ghosts par contraste 1/2.
- **Les 30 sans-démo (liste fermée, recette-demo) — cinq familles de motivation :**
  1. **Timbre hors palette** (6) : les 5 CYM (la cimbalette n'existe pas dans
     `playPerc` — en faire entendre une fausse serait pire que « démo à venir »),
     COL-02 (pitch bend au pied) ;
  2. **Ornements infra-grille** (6) : flams (2), finger roll, rumbles/rolls
     continus (3) — plus fins que la double-croche, la grille ne porte pas le geste ;
  3. **Structures multi-mesures** (15) : alternances mesure-à-mesure (B3-04/05,
     précédent B2-04), cycles appel→accompagnement→réponse (CALL-03/04/05),
     question/réponse sur deux mesures (I4-02), arcs dynamiques et formes conduites
     (I4-04/05, R1-04/05, SOLO-02/03/05, COL-04/05, D3-05 ×2 — « un fill toutes les
     quatre mesures ») — la démo boucle sur UN cycle ;
  4. **Exploration bilatérale du placement** (1) : P3-03 (« glisse derrière, puis
     devant, puis reviens ») — un feel fixe modéliserait un seul côté ;
  5. Rappel : fiche sans démo = bouton absent + « démo à venir » (dégradé R-4a).
- **±18 ms pour P1/P2** : choix d'auteur dans les bornes actées (±25) — assez grand
  pour s'entendre à 84 bpm (un dixième de pas), assez petit pour rester du feel et
  non un décalage de grille. À trancher à l'oreille (§6).
- **Phrase d'appel CALL-01** : une forme d'appel courante (slap 1 · ta-ta-ta · slap 3),
  pas LA forme canonique unique — c'est un modèle d'intention, déclaré tel.
- **R2-05 / I4-01 / I4-03 / SOLO-01/04** : les « phrases libres » sont UN exemple
  d'auteur (la fiche invite l'élève à inventer les siennes) — la démo montre le
  caractère, pas la solution unique.

## 6. Reste à faire (hors R-4c)

- **Oreille de Jean sur cette PR (porte de sortie R-4c)** : ré-écoute ciblée des
  **10 démos P1/P2** (le rendu feel est nouveau — non couvert par le pilote du
  16/07) + échantillon libre du lot (suggestion : R2-02 clave/pulsation, R2-04
  ternaire, CALL-01 appel, SOLO-01 ancre, I1-05 conversation).
- Toujours ouverts (brief R-4b) : décision sur les 3 P1 du panel UX (volume/sourdine
  accueil, sous-titre porte « En équipe », EN/PT apprendre) ; ménage de branches +
  PR #13 à fermer sans merger ; traduction EN/PT d'apprendre (transverse).
- Ensuite : **R-5** (salve UX + rejeu panel 30 OFFICIEL sur l'app refondue en prod),
  **R-6** (equipe.html).

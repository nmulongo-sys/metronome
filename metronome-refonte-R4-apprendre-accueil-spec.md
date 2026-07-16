# Métronome FM — R-4 : `apprendre.html` + accueil « métronome immédiat » + `demo`

> **Statut : PROPOSITION — spec avant code, Jean tranche (§9). Rédigée le 2026-07-16.**
> Contrairement à R-3 (pré-validée par le GO global du 16/07), **rien ici n'est validé** :
> le GO de Jean est requis AVANT toute exécution.
> Base examinée : **main = 0.12.0** (`6f1d461`, merge de la PR #24 par Jean le 16/07 à 12:55 ;
> Pages vert, prod vérifiée en navigateur réel — rapport 0.12.0). Chantier **R-4** de la
> refonte B+ (spec R-1 VALIDÉE ; R-2, R-3a, R-3b closes). Distinct des chantiers P-\*
> (contenu funk) et des passes moteur (closes).

---

## 0. Préalable — points ouverts n°1/2 du brief (constatés ce jour)

- **Ménage de branches (Jean)** : rien n'a encore été supprimé. Mergées, à supprimer :
  `claude/r3b-pratiquer-grooves-feel` (PR #24), `claude/cool-allen-to49bu` (PR #23),
  `claude/p7-p8-avance-artiste` (PR #22). S'y ajoutent des branches plus anciennes :
  `deploy-passe3`, `passe3`, `claude/free-ai-api-integration-4nh0o0`, et surtout la
  **PR #13 encore OUVERTE** (« Cours funk : C1/C2 », empilée sur
  `claude/funk-percussion-course-tceiu8`) — chantier supplanté depuis par l'approche corpus
  P-2→P-8 ; **reco : fermer la PR #13 sans merger** et supprimer ses deux branches. À Jean.
- **Validation à l'oreille (mute maître, feel ±25 ms)** : rien à constater côté machine —
  toujours à faire par Jean sur le rendu réel. N'empêche pas de spécifier R-4 : un recalibrage
  éventuel de la plage du feel est une retouche de page (attribut min/max + bornes
  `setBassFeel`), pas de moteur.

## 1. Objet et périmètre — découpe en deux sessions (+ un lot de contenu)

R-4 couvre (brief + spec R-1 §6) : `apprendre.html` (scénario 2), accueil « métronome
immédiat » (scénario 1), peuplement `demo`, migration `secCours` — et la **dissolution de la
page monolithe** (fin de la duplication index/pratiquer). Trop pour une session ; découpe :

| | Contenu | Build | Porte de sortie |
|---|---|---|---|
| **R-4a** | `apprendre.html` (scénario 2) : migration du parcours (`secCours` + surcouche P-4), **mode écoute** (`demo`) / **mode pratique**, peuplement `demo` Débutant + Intermédiaire, compte Supabase extrait en coquille partagée (§3.5). `index.html` **inchangé fonctionnellement** (lien + retrait `secCours`, §9.7). | 0.13.0 | Non-régression complète + `recette-apprendre.js` + validateur `demo` ; **point d'arrêt honorable** |
| **R-4b** | `index.html` refondu : **métronome immédiat** + option Archet + portes vers 2/3/4 ; migrations sortantes (Team Spirit → pratiquer, bibliothèque + compte → pratiquer, sort du wizard/écran de jeu §9.4) ; **re-pointage de la batterie historique** (§4.3). | 0.14.0 | Batterie re-pointée verte, comptes motivés suite par suite ; validation à l'œil par Jean |
| **R-4c** (lot de contenu, hors session, optionnel) | Peuplement `demo` Avancé + Artiste (§3.4). | mineur | Validateur `demo` vert ; oreille de Jean sur échantillon |

Une session, une PR par sous-chantier — le workflow acté s'applique à chaque fois.

Hors périmètre R-4 (assumé) : **toute retouche moteur** (quota R-3b consommé, §5) ;
`equipe.html` (R-6) ; salve UX C1/C3 et rejeu du panel 30 (R-5) ; traduction EN/PT des pages
nouvelles (chantier transverse) ; instruments authentiques (R-1 §9.9) ; migration du contenu
« principes » en données de corpus (transverse non planifié).

## 2. État des lieux — ce qui reste sur `index.html` (cartographie 0.12.0, 7 289 lignes)

| Bloc | Lignes 0.12.0 | Contenu | Destination proposée |
|---|---|---|---|
| CSS embarqué | 13–~650 | thème, cartes, archet plein écran, wizard, salves UX | chaque page garde sa copie élaguée (patron R-3b) |
| Dictionnaires i18n EN/PT | ~660–1810 (~1 118 entrées) | POC i18n par correspondance de texte | restent sur `index.html` ; chantier transverse |
| En-tête, transport, seg mode simple/expert | ~1811–1882 | | index refondu (R-4b) |
| Écran de jeu `playScreen` | 1884–1944 + JS 5168–5440 | passe 4.1, répartition « à plusieurs » | **retrait, réserve R-6** (§9.4) |
| `secGroove`/`secClave`/`secPerc`/`secRepertoire`/`secBass`/`secGap`/`secSon`/`secScript` + plein écran perc + atelier | 1945–2564 (hors items ci-dessous) | les couches de la pratique libre | **déjà portées par `pratiquer.html`** ; retirées d'index en R-4b |
| `secTeam` | 2173–2217 + JS ts dans 4390–5167 | team spirit | → `pratiquer.html` (R-4b), en attendant `equipe.html` R-6 (§9.3) |
| `secArchet` + plein écran + JS | 2218–2283, 2506–2521, 5732–6252 (~590 l.) | archet cordes frottées | **reste sur index**, option du mode simple (R-4b, §4.1) |
| `secCours` (`pfRoot`) + surcouche P-4 | 2384–2393 + 6592–6879 (~290 l.) | le parcours : niveaux/modules/fiches, acquis, votes | → `apprendre.html` (**R-4a**) |
| `secBiblio` + compte Supabase | 2489–2505 + 6880–7153 (~290 l.) | routines partagées, lien magique, `fmSupabase` | biblio → `pratiquer.html` (R-4b) ; compte → coquille partagée dès R-4a (§3.5) |
| Wizard + DSL pédagogique + accueil « je joue » | 2565–2629, 4144–4389, 6253–6504 (~520 l.) | « Guide-moi », générateur de règles, `playSetup` | **retrait** (§9.4) |
| Socle coquille JS (thème, mode, contexte, famille, script, visualisation, clave, séquenceur, perc, registre grooves, rang, paliers, tempo, événements UI, init, salves UX) | 2630–6591 (hors blocs ci-dessus) | | chaque page en garde la part utile — la coquille évolue librement depuis R-3b, sous les garde-fous structurels de `recette-extraction` |

Rappel des invariants : moteur = `moteur/*.js` **verbatim** (oreille du 10/07, deux retouches
actées closes) ; données = `FM_CORPUS` (152 exercices à `preset` : 112 funk + 40
socle-technique — **0 champ `demo`** aujourd'hui) + `FM_GROOVES` (31 grooves, 6 familles).
Vérifié ce jour : **le moteur ne référence pas `FM_GROOVES`** (consommation purement
coquille) — une page sans répertoire peut ne pas charger les grooves.

## 3. R-4a — `apprendre.html`, l'apprenant au milieu de ses leçons

### 3.1 Principe (R-1 §3, scénario 2)

L'apprenant « vit au milieu de ses leçons (presets) et n'a besoin que de ça » : aucun tiroir de
réglages, aucun jargon d'outil — la généralisation de la règle C6 (« le preset détermine TOUT
ce qui est visible »), et le traitement à la racine du constat C2 (le Débutant enterré dans un
tiroir replié). Structure proposée :

- **En-tête** : « ← Accueil », thème, transport minimal (démarrer/arrêter, tempo affiché ±).
- **Corps = le parcours**, seul au premier niveau : instrument (cajón/djembé) × niveau →
  modules → fiches. C'est la hiérarchie **existante** de la surcouche P-4 (`pfRoot`),
  transplantée — pas une réécriture.
- **Fiche exercice** : objet, consigne, critère, acquis — plus deux gestes :
  **« Écouter »** (mode écoute, §3.3) et **« Pratiquer »** (mode pratique, §3.2).
- La **progression survit à la migration** : clés localStorage inchangées
  (`fm-metro-parcours`, file `pf_vote_queue`) — assertions dédiées.

### 3.2 Mode pratique = la mécanique actuelle, transplantée

« Charger » un exercice applique déjà le `preset` (`pattern`/`prog`/`drop` → basse) : le
chargeur P-4 existe et fonctionne. Migration **verbatim de la surcouche P-4** (vérifié en tête
de bloc : elle ne lit/écrit que ses propres clés, no-op hors de son écran), déviations marquées
`R-4a (apprendre)` uniquement — le patron de coquille éprouvé en R-3b.

### 3.3 Mode écoute = le champ `demo`, zéro moteur

`demo` (R-1 §9.7, TRANCHÉ) : l'app **fait entendre la partie de l'élève** (voix percussives)
par-dessus l'accompagnement ; l'élève écoute le modèle puis bascule en mode pratique.

- **Mécanique** : la page injecte la démo dans les **grilles de coquille**
  (`percGrids`/`percMeta` — celles que `computeCycle` lit déjà, contrat R-3a) le temps de
  l'écoute, et les restaure en mode pratique. **Zéro retouche moteur par construction.**
- **Format proposé** (§9.2) : par exercice,
  `demo: { instr: 'cajon'|'djembe', steps: 8|12|16, voix: { grave:[…], tone:[…], slap:[…], ghost:[…]? } }`
  — une grille par voix au format `percGrids` actuel, `ghost` optionnelle (gain 0.35, précédent
  C1). Pour les exercices partagés EX-SOCLE, une demo **par instrument**
  (`demo: { cajon:{…}, djembe:{…} }`) quand le geste diffère.
- **Validateur dédié** (patron `recette-grooves`) : IDs, `voix[*].length === steps`, voix
  connues de `PERC_INSTR`, `instr` cohérent avec le parcours du module, drapeaux optionnels.
- **Dégradé propre** : fiche sans `demo` = bouton « Écouter » absent, mention « démo à
  venir » — le peuplement peut être progressif (§3.4).

### 3.4 Peuplement `demo` — un travail d'auteur, découpé

152 exercices, 0 demo : peupler est un chantier de **contenu** (fidélité pédagogique — la démo
EST le modèle à imiter), pas une génération mécanique. Proposition : R-4a peuple **Débutant
(socle-technique, 40) + Intermédiaire funk** ; Avancé + Artiste en lot R-4c. Un **échantillon
pilote (~10 demos) soumis à l'oreille de Jean tôt dans la session**, avant peuplement massif
(§9.6) — les ms et les ghosts « qui sonnent juste » ne se prouvent pas en headless.

### 3.5 Compte Supabase : première coquille partagée

La surcouche P-4 consomme `window.fmSupabase()` (votes `pf_vote`/`pf_promotion`, dégradation
propre en file locale hors ligne). Plutôt que dupliquer les ~290 lignes du bloc compte (que
R-4b devra AUSSI porter sur pratiquer pour la bibliothèque), proposition : **extraction en
fichier de coquille partagée `coquille/fm-compte.js`** dès R-4a (styles + carte + logique lien
magique), chargé par `apprendre.html` (R-4a) puis `pratiquer.html` et l'accueil refondu s'il en
garde l'usage (R-4b). Déplacement prouvé au patron figé : référence JSON (md5/valeurs) +
recette d'égalité (précédents extraction/registre/grooves). C'est un **précédent nouveau**
(dossier `coquille/`) — à trancher (§9.5).

### 3.6 Contrat de coquille et ordre de chargement

`apprendre.html` charge : `corpus/*.js` (2) → `moteur/fm-etat.js` → `fm-audio.js` →
`fm-accomp.js` → `coquille/fm-compte.js` → script de page. **Pas de balises grooves** (aucun
répertoire sur cette page ; vérifié §2 : le moteur ne les référence pas). L'ordre contractuel
s'énonce désormais **par page** : « corpus → [grooves si répertoire] → moteur → coquille
partagée → page » — `recette-extraction` v R-4a l'asserte sur les trois pages. La page porte
les **stubs du strict contrat moteur** (annexe R-3a : 21 IDs `fm-accomp`, panneau `play*`,
hooks, `accompMuted`), patron `#fmStubs` de R-3b — réduit au contrat moteur, pas aux surfaces
d'index.

### 3.7 Recettes R-4a

- **`recette-apprendre.js`** (nouvelle, ~40 assertions) : hiérarchie parcours présente,
  chargeur preset opérant, mode écoute injecte puis **restaure** les grilles, acquis/file de
  votes conservés (clés inchangées), stubs contrat moteur présents, aucun tiroir de réglages
  au premier niveau.
- **`recette-demo.js`** (nouvelle, ~15–20) : le validateur §3.3 sur tout le corpus peuplé.
- **`recette-compte.js`** ou volet dans extraction (~5) : égalité du bloc compte extrait
  (patron figé §3.5).
- **`recette-extraction.js` v R-4a** : tolérances moteur **inchangées** (ligne BUILD +
  `accompMuted` ×1 + `feelMs` ×2 — aucune nouvelle), garde-fous structurels étendus à la
  3e page.
- **Non-régression complète** : les 26 suites (941) rejouées, comptes inchangés —
  `index.html` et `pratiquer.html` ne bougent pas fonctionnellement en R-4a (§9.7 pour la
  seule exception débattable).

## 4. R-4b — l'accueil « métronome immédiat »

### 4.1 Le novice atterrit sur un métronome qui marche (R-1 §3, scénario 1)

« Arriver sur l'app = un métronome qui marche, immédiatement, zéro friction. » Premier niveau
proposé (§9.1) : **tempo** (gros, ±, tap), **battue/famille** (binaire/ternaire, subdivision),
**démarrer/arrêter**, **son du clic**, thème. C'est tout. **L'Archet quitte le premier
niveau** et devient une **option du mode simple** (bouton discret qui déplie `secArchet` +
plein écran — index reste la seule page à le porter). **Portes discrètes** vers
`apprendre.html` / `pratiquer.html` / « en équipe » (inactive, annonce R-6).

### 4.2 Migrations sortantes

- **Sections couche** (clave, perc, répertoire, basse, gap, script, atelier, plein écran
  perc) : retirées d'index — `pratiquer.html` les porte depuis R-3b. La duplication
  index/pratiquer est **dissoute** ; les stubs se réduisent partout au strict contrat moteur.
- **Team Spirit** → `pratiquer.html` (bloc propre, en attendant `equipe.html` R-6) — §9.3.
- **Bibliothèque partagée** → `pratiquer.html` (ses routines sont des réglages complets : sa
  place est la pratique libre) ; le compte est déjà partagé depuis R-4a (§3.5).
- **Wizard + DSL pédagogique + écran de jeu + `playSetup` « je joue »** : **retrait** proposé —
  l'architecture par scénarios les remplace (l'accueil EST la réponse au novice ; le « à
  plusieurs » préfigure `equipe.html` et y renaîtra en R-6 si besoin ; le code retiré reste
  dans l'historique git). Alternative : garder le wizard sur l'accueil comme aide novice.
  Trancher (§9.4).
- **i18n** : les chaînes FR nouvelles ou re-libellées d'index entrent dans les dictionnaires
  EN **et** PT (piège connu, 0.6.9) ; les chaînes des surfaces retirées sortent des
  dictionnaires.

### 4.3 Le patrimoine de recettes migre avec les surfaces

Les 19 suites historiques (746 assertions) visent `index.html` par défaut (`chargeHtml()` sans
argument). R-4b **re-pointe chaque suite vers la page qui porte désormais sa surface**
(argument fichier — mécanique existante, zéro adaptation du harnais) ; **comptes attendus
inchangés à surface constante**. Suites des surfaces retirées (wizard, écran de jeu,
onboarding « je joue »… si retrait acté §9.4) : retirées avec motivation, suite par suite, au
rapport. **Table de re-pointage exhaustive** (suite → page → compte avant/après → motivation)
jointe à la PR R-4b, opposable — le pendant « batterie » de l'annexe contrat de coquille.

### 4.4 Recettes R-4b

**`recette-accueil.js`** (nouvelle, ~25) : premier niveau minimal (liste fermée d'éléments
visibles), Archet replié en option, portes présentes, aucune section couche résiduelle, stubs
réduits au contrat moteur. **`recette-pratiquer.js` étendue** : Team Spirit × mute maître ×
répertoire (le mute maître doit couper les voix ts, patron `percLayerMuted` existant),
bibliothèque présente. `recette-extraction` v R-4b : les trois pages dans leur état final.

## 5. Ce que R-4 exige du moteur : rien

Aucune retouche, par construction : le mode écoute passe par les grilles de coquille ; mute
maître et feel sont en place ; les tolérances d'extraction n'évoluent pas. Si l'exécution
découvre un besoin moteur, c'est un **arrêt et retour vers Jean** (nouvel actage explicite
requis), pas une décision de session.

## 6. Livraison

- **PR R-4a** « R-4a : apprendre.html + mode écoute (demo) — build 0.13.0 » :
  `apprendre.html`, `corpus/funk.js` + `corpus/socle-technique.js` (champs `demo`),
  `coquille/fm-compte.js` (+ référence JSON), `index.html` (lien, retrait §9.7, build),
  `recette-apprendre.js`, `recette-demo.js`, `recette-extraction.js`,
  `rapport-nonregression-0.13.0.md`. Fichiers complets.
- **PR R-4b** « R-4b : accueil métronome immédiat — build 0.14.0 » : `index.html` refondu,
  `pratiquer.html` (Team Spirit, bibliothèque), suites re-pointées + table de re-pointage,
  `recette-accueil.js`, `rapport-nonregression-0.14.0.md`. Fichiers complets.
- Jean merge lui-même ; ménage de branche et vérification Pages (navigateur réel) après
  chaque merge.

## 7. Risques identifiés

| Risque | Parade |
|---|---|
| Demos infidèles pédagogiquement (le modèle sonore fait foi) | Découpe §3.4 + échantillon pilote ~10 demos à l'oreille de Jean AVANT peuplement massif |
| Re-pointage : une suite verte sur la mauvaise page (faux vert) | Table de re-pointage motivée, comptes comparés un à un au 0.12.0 |
| Migration Team Spirit casse répertoire/mute maître sur pratiquer | Assertions d'interaction (§4.4) + navigateur réel deux modes (http:// et file://, précédent R-3b) |
| Coquille partagée (compte) : précédent qui s'étend sans contrôle | Périmètre limité au bloc compte, décision explicite §9.5, patron de preuve figé |
| Progression/acquis perdus à la migration du parcours | Clés localStorage inchangées + assertions dédiées (§3.7) |
| Accueil refondu casse `recette-a11y-i18n` (0.6.9) | Chaînes nouvelles EN+PT systématiques, chaînes retirées purgées, suite rejouée (§4.2) |
| Perte de la version servie pendant la fenêtre R-4a→R-4b (deux pages naissent, index bouge peu) | Chaque PR = build + rapport + vérification prod ; pas d'état intermédiaire non versionné |

## 8. Ce que R-4 ne décide pas

`equipe.html` et le sort définitif de Team Spirit/écran de jeu (R-6) ; le rejeu du panel 30
(R-5, sur l'app refondue) ; la traduction EN/PT des pages nouvelles ; les instruments
authentiques ; la migration du contenu « principes » (HTML dur → données de corpus). Rien dans
R-4 ne préempte ces chantiers.

## 9. Points à trancher par Jean (porte de qualité)

1. **Découpe R-4a / R-4b / R-4c** (builds 0.13.0 / 0.14.0 / mineur) et l'ordre — apprendre
   d'abord, accueil ensuite (l'accueil pointe vers des pages qui existent) — OK ?
2. **Format `demo`** (§3.3) : grille par voix au format `percGrids`, variante par instrument
   pour les EX-SOCLE, validateur dédié — OK ?
3. **Team Spirit → `pratiquer.html`** en R-4b (reco : il a besoin du séquenceur/répertoire que
   pratiquer porte déjà ; le laisser sur index maintiendrait le monolithe qu'on dissout), en
   attendant `equipe.html` (R-6) — ou rester sur index jusqu'à R-6 ?
4. **Wizard, DSL pédagogique, écran de jeu, accueil « je joue »** : retrait en R-4b (reco,
   §4.2 — l'architecture par scénarios les remplace, le code reste dans l'historique git) ou
   maintien du wizard seul sur l'accueil ? Trancher — c'est LA décision de périmètre de R-4b.
5. **Coquille partagée** : dossier `coquille/` + `fm-compte.js` dès R-4a (§3.5), preuve au
   patron figé — OK ? (Alternative : duplication du bloc compte par page, patron R-3b — mais
   c'est la duplication que R-4 est censé dissoudre.)
6. **Périmètre du peuplement `demo`** (§3.4) : Débutant + Intermédiaire en R-4a, Avancé +
   Artiste en lot R-4c, échantillon pilote à l'oreille avant peuplement massif — OK ?
7. **`secCours` pendant la fenêtre R-4a→R-4b** : le retirer d'index dès R-4a (reco : la porte
   « Cours funk » d'index pointe vers `apprendre.html`, une seule source de vérité — c'est la
   seule entorse au « index inchangé » de R-4a, chirurgicale et motivée) ou le laisser en
   doublon jusqu'à R-4b ? Trancher.
8. **Contenu exact du premier niveau de l'accueil** (§4.1) : tempo/battue/subdivision/
   démarrer/son/thème + option Archet + portes — liste fermée à valider (ou amender).

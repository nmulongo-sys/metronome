# Métronome FM — R-4b livrée (0.14.0, PR empilée sur #25), cap sur R-4c / R-5 — brief de reprise

> À coller en tête du nouveau fil pour resynchroniser le contexte.
> Instantané au **2026-07-16**, fin du fil « R-4b : accueil métronome immédiat »
> (exécution directe sur spec R-4 §4 validée — GO en bloc du 16/07 ; AUCUNE
> nouvelle décision demandée à Jean, écarts motivés au rapport §5).

## Le projet
`metronomefunk` (dépôt `nmulongo-sys/metronome`, GitHub Pages, **français**, livraison **fichiers
complets jamais un patch**, **sans étape de build**) : app métronome + parcours d'apprentissage
funk (cajón/djembé). **Refonte modulaire multi-styles B+** (« des scénarios, un moteur, des
corpus », spec R-1 VALIDÉE ; R-2, R-3a, R-3b, R-4a, **R-4b** closes). Ce fil a : (1) constaté
l'état (PR #25 toujours OUVERTE, main = 0.12.0 `6f1d461`, PR #13 toujours ouverte, branches
mergées non nettoyées) ; (2) **exécuté R-4b** (build 0.14.0) sur une branche
`claude/new-session-oumssg` **EMPILÉE sur la tête de la PR #25** (`6e5a743`) — au merge de
#25, la PR R-4b se réduit d'elle-même aux commits R-4b. **Prod inchangée** tant que rien
n'est mergé.

## Ce que R-4b a livré (tout est sur la PR R-4b, TOUT VERT)
- **`index.html` refondu** (1 740 l. contre 6 803) : accueil « métronome immédiat » —
  liste fermée §9.8 (tempo ±/tap, battue, subdivision, démarrer/arrêter, son du clic,
  thème) + roue (retour visuel, motivé rapport §5) + **option Archet** (section repliée,
  bloc JS verbatim, exports E3 + lint L2 + plein écran + diagnostic `fmMetroArchet()`) +
  **portes** Apprendre / Pratiquer / En équipe (inactive, annonce R-6). Coquille patron
  apprendre : stubs = percFsPlay + gapTarget ; balises corpus → moteur (ni grooves ni
  compte). Dictionnaires EN/PT **purgés** (562 → 121) + 11 clés nouvelles EN et PT.
- **`pratiquer.html`** : **Team Spirit** (bloc 2) et **bibliothèque partagée + compte**
  (bloc 3, `coquille/fm-compte.js` + CDN + carte) sont des surfaces VISIBLES ;
  `#fmStubs` **vidé** ; copie P-4 inerte, wizard, DSL, écran de jeu, playSetup, archet,
  bandeau 0.6.7, mode simple/expert **retirés du JS** (coutures `R-4b (pratiquer)`) ;
  `fmMetroReg().mapping` retiré avec l'écran de jeu (tables paliers/rang conservées).
  **Dette i18n résorbée** : 29 clés EN+PT (blocs, mute maître, feel, rendu).
- **Retraits actés §9.4** : wizard, DSL pédagogique, écran de jeu (fingerViz compris),
  accueil « je joue », bandeau onboarding, mode simple/expert — partout ; le code reste
  dans git.
- **Batterie : 28 suites, 962 assertions, 0 rouge** (0.13.0 : 1 003 — compte rond :
  −85 retirées avec leurs surfaces, 16 déplacées ré-ancrées, +50 recette-accueil
  NOUVELLE, +10 extension pratiquer). **Table de re-pointage exhaustive** (suite → page
  avant/après → comptes → motivation) au rapport §3. Re-pointages : 5-1→5-4, chantier-B,
  cajon-cymbalette, ux-0.6.6, onboarding-0.6.7 (recentrée focus/aides/reset),
  mobile-0.6.8 (56/56 **zéro adaptation**), a11y-i18n-0.6.9, atelier-exports-0.7.0,
  grooves → **pratiquer** ; recette-chantier-B2 **retirée** (surface 100 % écran de jeu).
- **recette-pratiquer étendue** (§4.4) : 52 — TS × mute maître × répertoire (la voix
  ts.* coupée/rendue, patron percLayerMuted) + bibliothèque câblée.
- **Moteur intact** : md5 == 0.10.0, tolérances INCHANGÉES (ligne BUILD + accompMuted ×1
  + feelMs ×2). BUILD **0.14.0** (fm-etat.js seul).
- **Navigateur réel deux modes** (http:// ET file://, Chromium) : 32/32 — accueil joué
  pour de vrai (AudioContext running, jauge archet dessinée, roue peinte), pratiquer
  (groove ts.* chargé, TS visible, mute maître, stubs vides), apprendre intact.
- **Rapport** : `rapport-nonregression-0.14.0.md` (table §3, choix motivés §5).

## Questions à ne pas reposer (déjà tranchées)
- **Langue / livraison ?** → Français ; fichiers complets ; Pages sans build.
- **Workflow ?** → Spec avant code ; R-4 est SPÉCIFIÉE ET EXÉCUTÉE (R-4a + R-4b) ;
  **R-4c reste gaté par l'oreille de Jean** (échantillon pilote, rapport 0.13.0 §5) ;
  **Jean merge les PR lui-même** (refuse merge et suppression de branche à Claude).
- **Le moteur ?** → Verbatim (oreille du 10/07) ; deux retouches R-3b closes ; toute
  nouvelle retouche = actage explicite.
- **Où est la vérité des surfaces ?** → index = liste fermée §9.8 + archet ; pratiquer =
  pratique libre + Team Spirit + bibliothèque/compte + atelier/exports ; apprendre =
  parcours + demo. Wizard/DSL/écran de jeu/« je joue » n'existent plus (renaissance
  éventuelle « à plusieurs » → equipe.html, R-6).
- **i18n ?** → dicts d'index purgés + nouvelles clés EN et PT ; pratiquer désormais
  couvert (0.6.9 l'audite) ; apprendre FR-seul assumé (transverse).
- **Panel UX ?** → Ne pas rejouer avant R-5 (référence 7,0/10 sur 0.8.0).

## Points ouverts
1. **Merge par Jean, DANS L'ORDRE : PR #25 (R-4a) puis PR R-4b** (empilée — après le
   merge de #25 elle se retarge/réduit d'elle-même) + vérification Pages/prod (3 pages
   en 200, BUILD 0.14.0 servi) + ménage des branches (`claude/metronome-r3-close-r4-brief-lxczq6`,
   `claude/new-session-oumssg`, mergées antérieures, et **PR #13 à fermer sans merger**).
2. **Oreille de Jean** : échantillon pilote des 10 démos (porte de R-4c) ; mute maître +
   feel R-3b (±25 ms) ; **accueil à l'œil** (porte de sortie R-4b, spec §1).
3. **R-4c** (lot de contenu, après l'oreille) : démos Avancé + Artiste
   (`corpus/socle-technique.js`, `corpus/funk.js`, validateur recette-demo).
4. Ensuite : **R-5** (salve UX + rejeu panel 30 sur l'app refondue), **R-6** (equipe.html —
   Team Spirit et l'esprit « à plusieurs » y renaissent). Transverses non planifiés :
   traduction EN/PT d'apprendre, contenu « principes » en données de corpus.

## Reprise
- **Titre suggéré** : « Métronome FM — R-4c : démos Avancé/Artiste (après oreille de
  Jean) » — ou, si les merges/oreilles ne sont pas faits : « constat merges + oreilles ».
- **Action** : nouveau fil, coller ce brief. Démarrer par le point ouvert n°1 (état à
  constater) ; R-4c n'est exécutable QU'APRÈS validation de l'échantillon pilote à
  l'oreille ; R-5 exige l'app refondue EN PROD (merges faits).

# Métronome FM — R-4a livrée (0.13.0, PR #25 OUVERTE), cap sur R-4b — brief de reprise

> À coller en tête du nouveau fil pour resynchroniser le contexte.
> Instantané au **2026-07-16**, fin du fil « R-3 close / spec R-4 / exécution R-4a »
> (spec R-4 proposée puis GO de Jean reçu — recos §9 acceptées en bloc — puis R-4a
> exécutée d'un bloc dans le même fil).

## Le projet
`metronomefunk` (dépôt `nmulongo-sys/metronome`, GitHub Pages, **français**, livraison **fichiers
complets jamais un patch**, **sans étape de build**) : app métronome + parcours d'apprentissage
funk (cajón/djembé). **Refonte modulaire multi-styles B+ EN COURS** (« des scénarios, un moteur,
des corpus », spec R-1 VALIDÉE ; R-2, R-3a, R-3b closes). Ce fil a : (1) constaté les points
ouverts post-R-3 ; (2) rédigé la **spec R-4** (`metronome-refonte-R4-apprendre-accueil-spec.md`) ;
(3) reçu le **GO de Jean** (16/07, « recos §9 acceptées, exécute R-4a ») ; (4) **exécuté R-4a**
(build 0.13.0). **PR #25 OUVERTE, PAS ENCORE MERGÉE** (branche
`claude/metronome-r3-close-r4-brief-lxczq6`, 3 commits : spec → R-4a → brief) — **main reste
0.12.0** (`6f1d461`), prod inchangée. Prochain chantier : **R-4b** (accueil « métronome
immédiat », build 0.14.0) — **sa spec est DÉJÀ VALIDÉE** (spec R-4 §4, GO en bloc) : la session
R-4b exécute directement, comme R-3b en son temps.

## Décisions actées
- **Spec R-4 VALIDÉE en bloc (GO 16/07)** — les arbitrages §9, tous acceptés :
  découpe **R-4a / R-4b / R-4c** (0.13.0 / 0.14.0 / lot de contenu) ; format `demo` = **grille
  par voix** (percGrids) avec variante par instrument pour les EX-SOCLE ; **Team Spirit →
  pratiquer.html en R-4b** (en attendant `equipe.html`, R-6) ; **retrait en R-4b** du wizard,
  du DSL pédagogique, de l'écran de jeu et de l'accueil « je joue » (l'architecture par
  scénarios les remplace, le code reste dans git) ; **coquille partagée** (dossier `coquille/`,
  `fm-compte.js` dès R-4a, preuve au patron figé) ; demo Débutant+Intermédiaire en R-4a,
  Avancé/Artiste en R-4c **après échantillon pilote à l'oreille** ; **retrait de `secCours`
  d'index dès R-4a** (une seule source de vérité) ; premier niveau de l'accueil R-4b = tempo /
  battue / subdivision / démarrer / son du clic / thème + **option Archet** + portes vers 2/3/4.
- **R-4a réalisée conformément à la spec** — tout ce qui suit est LIVRÉ sur la PR #25 :
  - **`apprendre.html`** (scénario 2, 791 lignes) : transport minimal (démarrer/arrêter,
    tempo ±), le parcours seul au premier niveau, **aucun tiroir de réglages**. Surcouche P-4
    **transplantée VERBATIM** d'index 0.12.0, trois déviations marquées `R-4a (apprendre)` :
    bouton « ▶ Écouter » (ou mention « démo à venir »), câblage Écouter/Charger = mode
    écoute/pratique, API diagnostic `fmMetroParcours().ecoute`. **Clés localStorage inchangées**
    (`fm-metro-parcours`, `-promo`, `-niveau`, `pf_vote_queue`) : la progression survit.
  - **Coquille de page NOUVELLE et minimale** (≠ patron R-3b) : contrat moteur R-3a rempli par
    état neutre + hooks no-op déclarés dans le script de page ; **stubs réduits au STRICT
    contrat moteur** (`#fmStubs` = `percFsPlay` + `gapTarget`, 2 éléments). Ordre contractuel
    **PAR PAGE** : « corpus → [grooves si répertoire] → moteur → [compte] » — apprendre ne
    charge **pas** les grooves (vérifié : le moteur ne référence pas `FM_GROOVES`).
  - **Mode écoute, ZÉRO retouche moteur** : injection de la démo dans `percGrids`/`percMeta`/
    `percOffsets` (le chemin que `computeCycle` lit déjà), `S.perc.on` posé/retiré, restauration
    propre au « Charger ». Champ optionnel `demo.swing` (formule par paires de la basse,
    identité à 50) — `S.swing` du preset jamais modifié.
  - **73 démos peuplées** (33 Débutant + 40 Intermédiaire), **9 sans démo motivés** (liste
    fermée assertée) : POS-01/POS-03 ×2 (posture pure), CJ-DYN-03/04 + DJ-DYN-03 (timbres
    étouffés hors palette), B2-04 ×2 (alternance par mesures — une grille = un cycle).
  - **`coquille/fm-compte.js`** : bloc compte d'index 0.12.0 (l. 6906–7067) déplacé verbatim,
    référence `reference-compte-0.12.0.json` (md5 `239e030f…`) ; index le consomme par
    `<script src>` ; le petit markup (carte, ~25 l.) reste par page consommatrice.
  - **`index.html`** (6 803 lignes, −486) : `secCours` + surcouche P-4 + CSS `pf-*` + chip
    sommaire retirés ; porte `#carteApprendre` (réutilise les libellés déjà aux dictionnaires) ;
    2 chaînes nouvelles EN **et** PT ; BUILD **0.13.0** (fm-etat.js).

## Faits & contraintes
- **Établi / vérifié :**
  - **Batterie = 28 suites, 1 003 assertions, TOUT VERT** (0.12.0 : 941) : 19 historiques
    (**746, comptes par suite inchangés** : 20/21/23/38/15/28/21/40/42/44/56/34/32/54/85/32/
    52/22/48), corpus (30, vérif `demo` alignée sur le format acté), registre (9, préservation
    0.8.0 **champ demo mis à part** — ajout acté au schéma R-1 §4.1), extraction (**26**,
    v R-4a : 3 pages + partie C compte), grooves (29), pratiquer (42, BUILD bumpé),
    **demo (14, nouvelle)**, **apprendre (41, nouvelle)**. Zéro adaptation du harnais.
  - **Re-pointage** : P2/P4/P6/P7/P8 visent `apprendre.html` par défaut (argument fichier
    conservé). Adaptations motivées, comptes inchangés : « hook `fmMetroReg` conservé » →
    `fmMetroBass` (P2/P4/P6 0.3 — le rang de registre vit sur index/pratiquer) ; lectures d'UI
    d'index (`subdivSel`, `gapMode`) → lectures d'état `S.subdiv`/`S.gap.mode` (P6
    6.3/6.5/6.7/6.8, P8 6.1).
  - **Navigateur réel** (Chromium headless/playwright-core, canal des deux modes) : les
    **3 pages** en **http:// ET file://** — 0 erreur console applicative, 0 ressource locale
    en échec, build affiché ; sur apprendre, « ▶ Écouter » **joué pour de vrai** (AudioContext
    `running`, `demo.grave` + basse dessous), « Charger » restaure. Sans-serveur garanti.
  - **Moteur intact** : md5 == 0.10.0, tolérances INCHANGÉES (ligne BUILD + `accompMuted` ×1 +
    `feelMs` ×2) — le quota de retouches reste consommé.
  - **Palette moteur cajón = `grave`/`aigu` SEULEMENT** (`playPerc`) : les démos rendent le
    *tone* et le *slap* cajón par la voix `aigu` (slap = accentué, valeur 2) ; pas de gain par
    voix (les ghosts = contraste 1/2). Étendre la palette = retouche moteur → actage requis.
  - `pratiquer.html` garde sa **copie inerte** de la surcouche P-4 (pfInit no-op sans
    `pfRoot`) — R-4b la dissout avec le reste de la duplication.
  - Approximation déclarée : SUB-03 (« une mesure en croches, une en doubles ») rendue en
    demi-mesure/demi-mesure.
- **Estimé / à confirmer :**
  - **PR #25 pas mergée** : merge, run Pages, prod en navigateur — à faire par Jean.
  - **Oreille de Jean, DEUX fois** : (1) l'**échantillon pilote de 10 démos** (§5 du rapport
    0.13.0) — c'est la **porte du lot R-4c** ; (2) toujours en attente depuis R-3b : mute
    maître et feel (recalibrage éventuel ±25 ms — retouche de page, pas de moteur).
  - Libellés d'`apprendre.html` non traduits EN/PT (comme pratiquer — chantier transverse).

## Questions à ne pas reposer (déjà tranchées)
- **Langue / livraison ?** → Français ; fichiers complets, jamais un patch ; Pages sans build.
- **Workflow ?** → Spec avant code ; **R-4b est déjà spécifiée ET validée** (spec R-4 §4, GO en
  bloc du 16/07) : la session R-4b **exécute directement**, pas de nouvelle spec — comme R-3b.
  **R-4c reste gaté** par l'oreille de Jean sur l'échantillon pilote. Non-régression complète
  avant merge ; **Jean merge les PR lui-même** (garde-fou : refuse merge ET suppression de
  branche à Claude) ; ménage de branche et vérification Pages après merge.
- **Qui valide ?** → **Jean**, porte de qualité de chaque étape.
- **Où sont code, spec et recettes ?** → **branche PR #25** (main après merge, via clone frais,
  penser LF) ; spec R-4 = `metronome-refonte-R4-apprendre-accueil-spec.md` ; rapport =
  `rapport-nonregression-0.13.0.md`.
- **Environnement de test ?** → Node 24 (Windows) ou Node 22 (cloud), `npm i --no-save jsdom
  playwright-core` (ENSEMBLE — --no-save retire les précédents), suites avec
  `--max-old-space-size=4096`, code de sortie de **node** pas du pipe ; navigateur : http://
  (serveur statique maison) et file:// (playwright-core, Chromium préinstallé).
- **Le moteur peut-il être réécrit ?** → **Non.** Verbatim (oreille du 10/07) ; les deux
  retouches R-3b restent les seules tolérées ; toute nouvelle retouche exige un actage
  explicite de Jean (y compris étendre la palette cajón).
- **Le format demo ?** → Tranché (§9.2), implémenté, validé : grille par voix
  `{instr, steps, voix, swing?}`, variante par instrument pour les EX-SOCLE ;
  `recette-demo.js` + vérif alignée dans `recette-corpus.js`.
- **Comment prouver un déplacement de code ?** → patron figé : référence JSON (md5/valeurs) +
  recette d'égalité (extraction, registre, grooves, **compte** — s'en inspirer pour les
  migrations R-4b : Team Spirit, bibliothèque).
- **i18n ?** → Corpus par ID, `fmTr` pour l'UI ; toute chaîne nouvelle d'index entre dans EN
  **et** PT (sinon 0.6.9 rougit) ; apprendre/pratiquer FR-seuls, assumé.
- **Panel UX ?** → Ne pas rejouer avant R-5 (référence 7,0/10 sur 0.8.0).
- **Ne pas confondre ?** → R-\* (refonte) ≠ P-\* (contenu funk) ≠ passes moteur (closes).

## Points ouverts
1. **Merge PR #25 par Jean** (spec R-4 + R-4a + ce brief) + vérification Pages/prod (3 pages
   en 200, BUILD 0.13.0 servi) + ménage de la branche
   `claude/metronome-r3-close-r4-brief-lxczq6`.
2. **Oreille de Jean** : échantillon pilote des 10 démos (§5 du rapport 0.13.0 — porte de
   R-4c) ; et toujours mute maître + feel R-3b (plage ±25 ms à recalibrer au besoin).
3. **Ménage antérieur** (constaté au fil, rien n'a bougé) : branches mergées
   `claude/r3b-pratiquer-grooves-feel` (#24), `claude/cool-allen-to49bu` (#23),
   `claude/p7-p8-avance-artiste` (#22) + anciennes (`deploy-passe3`, `passe3`,
   `claude/free-ai-api-integration-4nh0o0`) ; **PR #13 encore ouverte** (cours funk C1/C2,
   supplantée par l'approche corpus) — reco : fermer sans merger + supprimer ses 2 branches.
4. **R-4b à exécuter** (build 0.14.0, spec R-4 §4 validée) : index refondu **métronome
   immédiat** (liste fermée §9.8) + option Archet + portes ; migrations sortantes (**Team
   Spirit → pratiquer**, **bibliothèque → pratiquer** — le compte est déjà partagé) ; retraits
   wizard/DSL/écran de jeu/« je joue » ; **re-pointage du reste de la batterie** (table
   exhaustive suite → page → comptes, opposable) ; dissolution de la duplication (stubs de
   pratiquer réduits au contrat moteur, copie P-4 inerte retirée) ; i18n EN/PT des chaînes
   d'index nouvelles. Points d'attention : `recette-a11y-i18n`/onboarding/mobile/ux/atelier
   visent index — leurs surfaces migrent ou disparaissent, chaque compte se motive.
5. Ensuite : **R-4c** (démos Avancé/Artiste, après l'oreille), R-5 (salve UX + rejeu panel 30),
   R-6 (équipe). Transverses non planifiés : traduction EN/PT (P-2→P-8 + libellés
   pratiquer/apprendre), contenu « principes » en données de corpus.

## Fichiers / livrables produits (ce fil — sur la branche PR #25, PAS ENCORE sur main)
- **`metronome-refonte-R4-apprendre-accueil-spec.md`** — la spec R-4 (validée, couvre R-4b/R-4c).
- **`apprendre.html`** — la page scénario 2 (791 lignes, autonome, CSS embarqué).
- **`coquille/fm-compte.js`** + **`reference-compte-0.12.0.json`** — première coquille partagée.
- **`corpus/socle-technique.js`** / **`corpus/funk.js`** — 73 champs `demo` peuplés.
- **`recette-demo.js`** (14) · **`recette-apprendre.js`** (41) — nouvelles suites canoniques.
- **`recette-extraction.js`** (26, v R-4a) ; re-pointages **P2/P4/P6/P7/P8** ; adaptations
  motivées **corpus/registre/pratiquer**.
- **`index.html`** allégé (−486 l.) + **`moteur/fm-etat.js`** (BUILD 0.13.0 seul).
- **`rapport-nonregression-0.13.0.md`** — bilan complet (1 003/1 003, navigateur deux modes,
  échantillon pilote §5).
- **Ce brief** : `brief-reprise-r4a-0.13.0-cap-r4b-20260716.md`.

## Reprise
- **Titre suggéré du nouveau fil** : « Métronome FM — R-4b : accueil "métronome immédiat"
  (exécution sur spec validée, après merge PR #25) »
- **Action** : ouvrir un nouveau fil, coller ce brief en premier message. Démarrer par les
  **points ouverts n°1/2/3** (état à constater : merge #25, Pages/prod 0.13.0, oreilles,
  branches, PR #13), puis **exécuter R-4b** selon la spec R-4 §4 — le GO est déjà donné ;
  seul un écart à la spec exigerait un retour vers Jean.

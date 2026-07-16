# Rapport de non-régression — build 0.14.0 (R-4b)

> Chantier **R-4b** de la refonte B+ (spec R-4 VALIDÉE — GO Jean du 16/07, recos §9
> acceptées en bloc ; exécution directe, comme R-3b). Base : **branche PR #25**
> (`6e5a743`, R-4a / 0.13.0 — PR pas encore mergée, main reste 0.12.0) ; la PR R-4b
> est donc EMPILÉE sur la PR #25. Environnement : Node v22 (cloud), jsdom, LF ;
> suites avec `--max-old-space-size=4096` ; navigateur réel Chromium headless via
> playwright-core, **http:// (serveur statique) ET file://** sur les trois pages.

## 1. Périmètre livré

1. **`index.html` refondu — l'accueil « métronome immédiat »** (scénario 1, spec §4.1,
   1 740 lignes contre 6 803) : le novice atterrit sur un métronome qui marche. Premier
   niveau = la **liste fermée §9.8** : tempo (gros, ±, tap), battue (temps/cycle),
   subdivision (binaire/ternaire par noires/croches/triolets/doubles), démarrer/arrêter,
   son du clic (fréquence + caractère), thème — plus la roue (retour visuel du cycle,
   pas un réglage) et la ligne de statut. Coquille de page **NOUVELLE et minimale**
   (patron apprendre R-4a) : état neutre + hooks no-op, **stubs = percFsPlay +
   gapTarget** (2 éléments), balises **corpus → moteur** (plus de grooves — aucun
   répertoire ; plus de compte — aucun consommateur Supabase depuis la migration de la
   bibliothèque).
2. **L'Archet, option du premier niveau** (§4.1) : la section `secArchet` repliée EST le
   bouton discret — bloc JS transplanté **VERBATIM** d'index 0.13.0 (~520 l. : parseur,
   jauge, plein écran, exports pupitre E3, lint L2, chips), une seule déviation marquée
   `R-4b (accueil)` (le retour de fullscreenchange ne connaît plus percFs). Les aides
   partagées des exports (tsEsc, fmPrintCss/fmPrintDoc/fmDownloadDataURL) suivent en
   copies locales. Diagnostic de page `window.fmMetroArchet()` (lecture seule, patron
   `fmMetroBass().v070`) pour les recettes.
3. **Portes** (§4.1) : trois chemins discrets sous le métronome — **Apprendre** →
   `apprendre.html`, **Pratiquer** → `pratiquer.html`, **En équipe** (inactive,
   annonce R-6 : « bientôt — jouer à plusieurs, chacun sa ligne »).
4. **Migrations sortantes** (§4.2) : **Team Spirit → pratiquer.html** (bloc 2, avec le
   répertoire qu'il répartit — son markup sort des stubs, son JS y vivait déjà
   verbatim) ; **bibliothèque partagée → pratiquer.html** (bloc 3, avec l'éditeur de
   routine qu'elle alimente) + **compte partagé** (`coquille/fm-compte.js` consommé
   par pratiquer, carte + CDN Supabase ajoutés — apprendre et pratiquer sont les deux
   pages consommatrices, l'accueil n'en a plus l'usage).
5. **Retraits actés §9.4** — le code sort des pages, l'historique git le garde :
   **wizard** (« ✦ Guide-moi », 3 questions), **DSL pédagogique** (buildKitProfile/
   applyKitProfile), **écran de jeu** (playScreen, « ma ligne », fingerViz, panneau
   basse play\*), **accueil « je joue »** (playSetup), **bandeau d'onboarding 0.6.7**,
   **mode simple/expert** (plus d'écran de jeu à recomposer). L'architecture par
   scénarios les remplace : l'accueil EST la réponse au novice.
6. **Dissolution de la duplication R-3b** (§4.2) : `#fmStubs` de pratiquer passe de
   ~230 lignes (7 surfaces d'index en stubs) à **vide** — le contrat moteur y est
   rempli par de vrais éléments (percFsPlay au plein écran percussion, gapTarget à
   l'Horloge) ; la **copie P-4 inerte** (~280 l.) et les blocs wizard/écran de
   jeu/playSetup/archet/DSL sortent du JS de pratiquer, chaque couture marquée
   `R-4b (pratiquer)` ; le hook moteur `bowReset` reste en no-op (patron apprendre).
7. **i18n** (§4.2) : les dictionnaires EN/PT d'index sont **PURGÉS** des chaînes des
   surfaces retirées ou migrées (562 → **121 entrées** par langue, purge mécanique :
   entrées conservées = chaînes encore présentes sur la page) ; les chaînes **nouvelles**
   (portes, sous-titres de battue, aria-labels) entrent en EN **et** PT (11 clés).
   Au passage, la **dette FR-seul de pratiquer est résorbée** : 26 clés EN+PT ajoutées
   (titres de blocs, mute maître, feel/placement, instrument de rendu — exigées par la
   suite 0.6.9 qui audite désormais cette page) et 2 clés du hint répertoire re-libellé
   R-3b, + tooltip feel.
8. **BUILD 0.14.0** (`moteur/fm-etat.js`, la ligne vivante — seule retouche moteur,
   tolérance déclarée).

## 2. Moteur : rien — par construction

`recette-extraction.js` (v R-4b, 26) : les trois `moteur/*.js` restent identiques octet
pour octet au 0.10.0 (l'oreille du 10/07), **tolérances INCHANGÉES** (ligne BUILD +
`accompMuted` ×1 + `feelMs` ×2 — aucune nouvelle). L'ordre contractuel par page devient :
index « corpus → moteur », pratiquer « corpus → grooves → moteur → compte », apprendre
« corpus → moteur → compte » ; le panneau play\* du contrat fm-accomp n'existe plus
nulle part — **le moteur sort par sa garde** (`bassPlayRefresh` teste `playBassOn`),
asserté sans crash.

## 3. Batterie : 28 suites, 962 assertions, TOUT VERT — table de re-pointage exhaustive

**Lecture** : à surface constante, comptes inchangés ; les assertions des surfaces
RETIRÉES (§9.4) sortent avec elles ; celles des surfaces DÉPLACÉES suivent leur page.
Le compte est rond : 1 003 (0.13.0) − 101 sorties de leurs suites (85 retirées avec
leurs surfaces + 16 déplacées : 12 d'atelier-exports, 3 d'onboarding, 1 d'ux-0.6.6)
+ 50 de la nouvelle suite accueil (dont les 16 déplacées, ré-ancrées) + 10 d'extension
pratiquer = **962**.

| Suite | Page 0.13.0 | Page 0.14.0 | 0.13.0 | 0.14.0 | Motivation de l'écart |
|---|---|---|---|---|---|
| recette-5-1 (synthèse basse) | index | **pratiquer** | 20 | 20 | surface constante (secBass) |
| recette-5-1-bis (sonde synthèse) | index | **pratiquer** | 21 | 21 | surface constante |
| recette-5-2 (tirage probabiliste) | index | **pratiquer** | 23 | 23 | surface constante |
| recette-5-3 (progressions) | index | **pratiquer** | 38 | 38 | surface constante |
| recette-5-3-bis (accord affiché) | index | **pratiquer** | 15 | 15 | surface constante |
| recette-5-3-ter (legato/espace) | index | **pratiquer** | 28 | 28 | surface constante |
| recette-5-3c (variations) | index | **pratiquer** | 21 | 21 | surface constante |
| recette-5-4 (basse : drop-outs, UI) | index | **pratiquer** | 40 | **32** | −8 : §8 « écran de jeu » (playBass\*) retiré §9.4 ; secBass couvre la surface basse restante |
| recette-P2 | apprendre | apprendre | 42 | 42 | inchangée |
| recette-P4 | apprendre | apprendre | 44 | 44 | inchangée |
| recette-P6 | apprendre | apprendre | 56 | 56 | inchangée |
| recette-P7 | apprendre | apprendre | 34 | 34 | inchangée |
| recette-P8 | apprendre | apprendre | 32 | 32 | inchangée |
| recette-chantier-B (paliers) | index | **pratiquer** | 52 | **26** | −26 : §6–11 (« ma ligne », encart #fingerViz) = écran de jeu, retiré §9.4 ; la couche de DONNÉES (INSTR_TIERS, clamp, libellés, rang chantier A consommé par « Répartir auto ») reste couverte (§1–5) ; `fmMetroReg().mapping` retiré avec sa surface |
| recette-chantier-B2 (curseur fingerViz) | index | — | 22 | **0 (retirée)** | surface 100 % fingerViz/écran de jeu (§9.4) — fichier retiré, l'historique git le garde |
| recette-cajon-cymbalette | index | **pratiquer** | 32 | **19** | −13 : §4–5 (couloirs fingerViz) + 3 assertions couloirs en §7 — retirées avec l'écran de jeu ; paliers/rangs/routage audio (§1–3, 6, 7) conservés |
| recette-ux-0.6.6 | index | **pratiquer** | 48 | **43** | −5 : 1.6 (libellé écran de jeu), 2.1 (wizard), 3.3 (CSS mode Jouer), 4.1 (« Je suis ») retirées §9.4 ; 2.3 (⛶ canvas archet) DÉPLACÉE → recette-accueil E1.3 ; 3.1 adaptée (12 puces), 5.2–5.4 sur fm-metro-family (plus de mode), 4.8 sur le header réel |
| recette-onboarding-0.6.7 | index | **pratiquer** | 49 | **35** | −14 : §1 bandeau+wizard (9) et 5.1 retirées §9.4 ; 2.8 (CSS mode Jouer) retirée ; 3.11–3.13 (aide archet) DÉPLACÉES → recette-accueil ; §4 réécrit sur la clé vivante (focus-mode) ; 2.6 vise « Son » ; 3.1 adaptée (7 aides) |
| recette-mobile-0.6.8 | index | **pratiquer** | 56 | 56 | **zéro adaptation** — la surface mobile auditée vit intégralement sur pratiquer |
| recette-a11y-i18n-0.6.9 | index | **pratiquer** | 54 | **53** | −1 : 2.9 (exclusion .pl-brick.back) partie avec l'écran de jeu ; 2.5 sans .wiz-recap (wizard retiré), 6.3 sans « Kit généré » (DSL retiré) ; dette i18n pratiquer résorbée (29 clés EN+PT) ; .bloc-num aligné A1 (13 px) |
| recette-atelier-exports-0.7.0 | index | **pratiquer** | 85 | **73** | −12 DÉPLACÉES → recette-accueil : §6 E3 archet (7), §8 L2 lint archet (3), 9.4–9.5 chips archet (2) — l'archet vit sur l'accueil |
| recette-corpus | (données) | (données) | 30 | 30 | inchangée |
| recette-registre | (données) | (données) | 9 | 9 | inchangée |
| recette-extraction | 3 pages | 3 pages | 26 | 26 | v R-4b : ordres par page (§2 ci-dessus), BUILD 0.14.0, compte porté par apprendre+pratiquer |
| recette-grooves | index | **pratiquer** | 29 | 29 | la page à répertoire est pratiquer — comptes inchangés |
| recette-pratiquer | pratiquer | pratiquer | 42 | **52** | +10 : les 6 assertions R-3b (stubs pleins, biblio absente…) réécrites en 8 R-4b (stubs vides, surfaces retirées absentes, TS visible, biblio+compte présents, sommaire, contrat 16 IDs + garde play\*) ; +6 TS × mute maître × répertoire (§4.4 : la voix ts.\* coupée/rendue par le mute maître, patron percLayerMuted) ; +2 bibliothèque câblée (repli propre sans client) |
| recette-demo | (données) | (données) | 14 | 14 | inchangée |
| recette-apprendre | apprendre | apprendre | 41 | 41 | 1 ligne : BUILD 0.14.0 |
| **recette-accueil (NOUVELLE)** | — | **index** | — | **50** | premier niveau FERMÉ §9.8 (présences + absences), contrat moteur (stubs 2 éléments, hooks, computeCycle), le métronome marche (démarrer/tempo/battue/subdivision/son/thème), portes, archet option + E3 (7 déplacées) + L2/chips (5 déplacées) + ⛶ (1 déplacée), i18n purgé/symétrie/couverture |
| **Total** | | | **1 003** | **962** | zéro adaptation du harnais (`chargeHtml` inchangé) |

## 4. Navigateur réel (Chromium headless) — les DEUX modes, les TROIS pages

**http:// et file:// : 16 vérifications chacun, 32/32 vert.** Par page : 0 erreur
console applicative, 0 ressource locale en échec, build 0.14.0 affiché. Sur l'accueil,
**joué pour de vrai** : ▶ Démarrer → AudioContext `running`, statut « Mesure N »,
bouton en « Arrêter » ; option Archet dépliée → jauge dessinée (pixels comptés) ; roue
peinte ; 3 portes. Sur pratiquer : groove du répertoire chargé (voix `ts.*` dans l'état
moteur), **Team Spirit visible** hors stubs, **mute maître opérant**, bibliothèque
présente, stubs vides. Sur apprendre : parcours rendu (50 fiches au niveau affiché),
API `fmMetroParcours().ecoute` intacte. Le sans-serveur reste garanti (file:// propre,
CDN gardés).

## 5. Choix d'exécution motivés (dans le cadre de la spec)

- **La roue reste sur l'accueil** : la liste fermée §9.8 énumère les *réglages* ; la
  roue est le retour visuel du « métronome qui marche » (et le support du statut
  vocalisé A3). Le dessin est le code d'index 0.13.0 réduit aux surfaces de la page
  (anneaux clave/poly dessinés vides, curseur, aiguille).
- **Battue/famille** : au premier niveau, « battue » = temps/cycle et le
  binaire/ternaire s'exprime par la subdivision (triolets = ternaire) — la « famille »
  bin/tern des grilles clave/perc n'a pas de sens sans couches (elles vivent sur
  pratiquer). Sous-titre explicite sous le sélecteur, traduit EN/PT.
- **Volume, accent, clic muet, atelier, export audio, réinitialisation, compte** :
  hors liste fermée §9.8 — ces réglages vivent sur pratiquer (qui les portait déjà).
  En cas de regret à l'œil, chaque item est une réintégration de quelques lignes.
- **PR empilée** : la PR #25 (R-4a) n'étant pas mergée, la branche R-4b part de la
  tête de #25 — au merge de #25, la PR R-4b se réduit d'elle-même aux commits R-4b.

## 6. Reste à faire (hors R-4b)

- **Merge des PR #25 puis R-4b par Jean** + vérification Pages/prod (3 pages en 200,
  BUILD servi) + ménage de branches (dont la PR #13 à fermer sans merger — reco R-4a).
- **Oreille de Jean** : échantillon pilote des 10 démos (rapport 0.13.0 §5 — porte de
  R-4c) ; mute maître + feel R-3b (±25 ms) ; et désormais **l'accueil à l'œil** (§4.3 :
  validation à l'œil par Jean = porte de sortie R-4b).
- **R-4c** (lot de contenu) : démos Avancé + Artiste après l'échantillon pilote.
- Traduction EN/PT des pages apprendre (libellés propres) — pratiquer est désormais
  couvert ; contenu « principes » en données de corpus (transverses non planifiés).

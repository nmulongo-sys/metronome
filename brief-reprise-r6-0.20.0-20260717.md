# Brief de reprise — Métronome FM · R-6 (0.20.0) livré, rejeu panel constaté

## Le projet
metronomefunk (dépôt nmulongo-sys/metronome, GitHub Pages, français, livraison fichiers
complets jamais un patch, sans étape de build) : app métronome + parcours funk (cajón/djembé),
refonte modulaire multi-styles. Quatre pages désormais : `index.html` (accueil « métronome
immédiat »), `pratiquer.html` (pratique libre, « la salle des machines »), `apprendre.html`
(le parcours, écoute/pratique), **`equipe.html` (R-6, « la salle de concert »)**. Moteur commun
`moteur/*.js` verbatim (md5 == 0.10.0 asserté), corpus `corpus/*.js`, coquille partagée
`coquille/fm-compte.js` (compte Supabase) + **`coquille/fm-equipe.js` (R-6, codec de config)**.

## Décisions actées (ce fil)
- Entrée du fil : arbitrage **R-6 (equipe.html) vs corpus i18n** → Jean a tranché **R-6**.
- Spec R-6 (`metronome-refonte-R6-equipe-spec.md`) rédigée, **GO de Jean** : **D1 = les DEUX
  modes** (hors-ligne **et** online, au choix de l'utilisateur) ; **D2–D6 = défauts**
  (D6 = build **0.20.0**).
- **R-6 construit et livré (build 0.20.0)** : `equipe.html` = jouer en groupe une répartition
  Team Spirit déterministe, chacun sa ligne sur son appareil, le chef donne le départ.
  - **Mode hors-ligne** : config partagée (lien hash / import JSON / passerelle Team Spirit),
    départ au décompte commun. Entièrement vérifiable.
  - **Mode online** : salle broadcast **Supabase Realtime** via `window.fmSupabase()` (déjà
    chargé) — **sans login, sans table DB, sans nouvelle dépendance**.
  - `coquille/fm-equipe.js` = codec partagé (`encode/decode` base64url, `audibleForPlayer`),
    chargé par pratiquer ET equipe (une copie, zéro dérive) ; le rendu de grille du pupitre
    est local à equipe (patron R-4d), pratiquer/apprendre non retouchés.
  - Porte « En équipe » de l'accueil **activée** ; bouton **« ▶ Jouer en équipe »** dans Team
    Spirit (pratiquer). **Zéro moteur** (seule ligne `BUILD` → 0.20.0).
- **Rejeu du panel-ux-30 sur 0.20.0** (Jean a fourni les 3 fichiers du skill → versionnés dans
  le dépôt) : 4 dashboards + synthèse portail. **Kit stable** `panel-ux-30/` posé au dépôt
  (SKILL + les 30 personas figés + gabarit) → rejeu reproductible et longitudinal désormais.

## Faits & contraintes
Établi / vérifié :
- **`main` = `cc624c4` = 0.19.0 (INCHANGÉ)**. Tout R-6 + le rejeu vivent sur la branche
  **`claude/metronomefunk-projet-dr4obe`**, ouverte en **PR #36** — **NON mergée** (Jean merge
  lui-même). Prod servie par Pages = encore **0.19.0** tant que #36 n'est pas mergée.
- **Batterie clean-room** (Node 22, jsdom) : **29 suites, 1077 assertions, 0 rouge** (equipe 46
  neuve ; extraction 26→28 ; pratiquer 63→66 ; accueil 61 ; apprendre 70 ; 24 autres constantes).
  **Moteur md5 == 0.10.0**, tolérances inchangées (BUILD + accompMuted ×1 + feelMs ×2).
- **Navigateur réel** (Chromium, http:// + file://) : cœur hors-ligne **24/24, 0 erreur** —
  lecture réelle (gain maître 0,8→0→0,8), pupitre isolant ma voix, config par hash, continuité
  tempo. Mode **online = câblage mock-vérifié** ; **synchro live à 2 appareils NON testable ici**
  (proxy 403) → vérif prod de Jean.
- **Rejeu panel 0.20.0** : accueil **9,02** (▲+0,41) · pratiquer **8,55** (▲+0,45, plus forte
  hausse) · apprendre **8,63** (▲+0,26) · **en équipe 7,84** (1er run). Les 4 majeurs de 0.17.0
  éteints et constatés. Personas **simulés** (avertissement sur chaque dashboard).
- Egress bloqué (proxy 403) vers **Supabase, CDN jsdelivr, github.io** → tout ce qui est réseau
  réel (online live, prod à l'œil) est le job de Jean, hors env.

Estimé / à confirmer :
- Prod 0.20.0 à constater à l'œil par Jean **après merge de #36** (dont la synchro online à 2
  appareils : même code de salle, un côté « chef »).

## Questions à ne pas reposer (déjà tranchées)
- Langue / livraison ? → Français ; fichiers complets ; Pages sans build.
- Workflow ? → Spec courte avant code ; GO explicite de Jean ; **Jean merge les PR** et fait le
  **ménage de branches** (Claude ne peut pas supprimer — 403 env) ; rapport de non-régression
  joint ; batterie clean-room + navigateur réel deux modes avant PR.
- Le moteur ? → Verbatim, md5 asserté ; tolérances = BUILD + les deux retouches R-3b. R-6 n'en
  est pas (page neuve, coquille, codec — hors md5).
- R-6 D1 ? → **Les deux modes** (off + online). D2–D6 = défauts (build 0.20.0).
- Le panel ? → Personas **simulés**, roster **figé** de 30 (kit `panel-ux-30/` au dépôt) ;
  utile pour prioriser, à confirmer avec de vrais utilisateurs.

## Comment relancer (dans cet env Linux)
- Batterie : depuis `/home/user/metronome` → `npm install jsdom --no-save` (une fois), puis
  `node --max-old-space-size=4096 recette-X.js` pour chaque `recette-*.js` sauf
  `recette-harnais.js` (29 suites). Bilans : « N vertes, M rouges » / « Bilan : X/Y » / « N
  réussis, M échoués ».
- Navigateur réel : `npm install playwright-core --no-save` (⚠ élague ~39 paquets, dont
  potentiellement jsdom → réinstaller jsdom si on doit relancer la batterie ensuite) ; Chromium
  à `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (args `--autoplay-policy=no-user-gesture-required`,
  `--no-sandbox`) ; serveur `python3 -m http.server 8123` ; script lancé avec
  `NODE_PATH=/home/user/metronome/node_modules`. `window.fmMetroAudio()` → `{ctx, master, playing}`.
- Rejeu du panel : le kit est au dépôt (`panel-ux-30/`). Voie skill (si `panel-ux-30` chargé) ou
  voie manuelle (copier un dashboard 0.20.0 comme gabarit, re-scorer, vérifier syntaxe + stub DOM :
  30 personas, ids 1–30, who valides).

## Points ouverts
1. **Jean : merger la PR #36** (R-6 + rejeu 0.20.0), puis **constater la prod 0.20.0** à l'œil
   (porte En équipe → equipe ; Team Spirit → « Jouer en équipe » → pupitre → départ ; **online à
   2 appareils**).
2. **Jean : ménage de branches** — supprimer `claude/metronome-r5-salve-p1-rb2m6e` (mergée #34+#35).
   Conserver `passe3` + `deploy-passe3`. (Après merge de #36, `claude/metronomefunk-projet-dr4obe`
   devient supprimable aussi.)
3. **Arbitrage de la suite** (Jean) — le plan re-priorisé de la synthèse 0.20.0 met en tête :
   - **P1 = equipe v1.1** : l'**entrée « à froid »** (seul critique du portail — « ▶ Essayer avec
     un exemple » + onboarding fabrique→joue) + le **jargon d'entrée** (backing→accompagnement…).
     Effort faible/moyen, remonterait equipe (7,84) au niveau des autres pages.
   - **M1 = corpus i18n** : traduire le corpus des leçons (EN/PT), le grand chantier de fond
     (seul majeur restant d'apprendre).
   - **Expansion styles (C6)** : nouveaux instruments/styles (voix, jazz, son cubain, vents).

## Fichiers / livrables produits (ce fil)
Sur la branche `claude/metronomefunk-projet-dr4obe` (PR #36, à merger) :
- **Code R-6** : `equipe.html` (neuf) ; `coquille/fm-equipe.js` (neuf) ; `index.html` (porte
  active + i18n) ; `pratiquer.html` (passerelle + i18n) ; `moteur/fm-etat.js` (BUILD 0.20.0).
- **Recettes** : `recette-equipe.js` (neuve, 46) ; `recette-accueil.js` / `recette-pratiquer.js`
  / `recette-extraction.js` / `recette-apprendre.js` (étendues/bumpées).
- **Docs R-6** : `metronome-refonte-R6-equipe-spec.md` ; `rapport-nonregression-0.20.0.md`.
- **Rejeu panel** : `panel-tests-ui-metronomefunk-{accueil,pratiquer,apprendre,equipe}-0.20.0.html`
  ; `panel-ux-0.20.0-synthese-portail.html` ; `panel-rejeu-0.20.0-protocole.md` (kit de rejeu).
- **Kit stable** : `panel-ux-30/{SKILL.md, references/personas.md, assets/dashboard-template.html}`.

Local (env éphémère) : clone `/home/user/metronome` ; jsdom + playwright-core `--no-save` ;
scripts de vérif (navigateur, `check-panel.js`) dans le scratchpad (jetables, à recréer).
`node_modules` gitignoré (ne jamais committer).

## Reprise
Titre suggéré du nouveau fil : « Métronome FM — 0.20.0 mergée & constatée, arbitrage suite
(equipe v1.1 / corpus M1) ».
Action : ouvrir un nouveau fil, coller ce brief. Démarrer par le point ouvert n°1 (Jean merge
#36 + constate la prod 0.20.0) ; le point n°3 attend l'arbitrage de Jean ; **si #36 est déjà
mergée, repartir d'une branche FRAÎCHE sur main 0.20.0** (la PR mergée est finie), spec courte
avant code.

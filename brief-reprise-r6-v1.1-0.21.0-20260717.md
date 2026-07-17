# Métronome FM — brief de reprise (R-6 v1.1 livrée, rejeu panel 0.21.0)

> À coller en tête du nouveau fil pour resynchroniser le contexte.

## Le projet
**metronomefunk** (dépôt `nmulongo-sys/metronome`) — métronome pédagogique du portail Formation
Musicale. **GitHub Pages, français, fichiers complets (jamais un patch), sans build.** 4 pages :
`index.html` (accueil), `pratiquer.html` (salle des machines), `apprendre.html` (parcours),
`equipe.html` (R-6, salle de concert). Moteur `moteur/*.js` **verbatim** (md5 == 0.10.0) +
coquilles `coquille/*.js`. Livraison : **spec courte → GO → code + recettes + vérif navigateur →
une PR ; Jean merge et fait le ménage de branches.**

## Décisions actées (ce fil)
- **equipe v1.1 exécutée et livrée** — PR **#37**, build **0.21.0** : entrée « à froid » guidée +
  passe dé-jargon. Défauts pris **sans nouveau GO** (le brief précédent avait tranché « P1 = equipe
  v1.1 » + « spec courte avant code ») : GO · exemple embarqué · glose en place.
- Sur remarque de Jean (« on bloque là ? ») : **arrêt des questions de validation superflues** —
  exécuter directement sur défauts sensés quand le brief a déjà tranché la priorité.
- **Rejeu panel-ux-30 régénéré sur 0.21.0** (il n'avait **jamais** été versionné) → dossier neuf
  `panel-ux-30/` : 4 dashboards + synthèse portail. Personas **simulés**, roster **figé**.
- equipe v1.1 = **cold-entry + dé-jargon**, **zéro moteur** (BUILD seule ligne 0.20.0 → 0.21.0).

## Faits & contraintes
**Établi / vérifié :**
- `main` = `e7f6a41` = **0.20.0** (#36 **mergée**). Prod sert 0.20.0 **tant que #37 pas mergée**.
- Branche `claude/metronomefunk-r6-delivery-wcr4rz` = 2 commits (v1.1 code + rejeu panel).
  **PR #37 OUVERTE** (non mergée).
- Batterie : **29 suites, 1084 assertions, 0 rouge** (equipe 46 → 53). Moteur **md5 == 0.10.0**.
- Navigateur réel (Chromium, `http://` + `file://`) : **32/32** — entrée à froid, exemple embarqué,
  **lecture audio réelle** au départ du chef (`isPlaying` + `audioCtx` running), dé-jargon, boot
  lien partagé.
- Rejeu **0.21.0** : accueil **9,0** · apprendre **8,6** · pratiquer **8,5** · en équipe v1.1
  **8,0** (+0,16 vs 7,84 du 1er run 0.20.0) — **moyenne portail 8,51**. equipe : le **critique
  généralisé de l'entrée à froid est ÉTEINT** (l'exemple embarqué débloque les novices).

**Estimé / à confirmer :**
- **Mode online à 2 appareils** : **mock-vérifié seulement** (egress Supabase 403 en env, proxy).
  Synchro live = **vérif prod de Jean, non faite**.
- Notes du panel = **personas simulés** (utiles pour prioriser, à confirmer avec de vrais
  utilisateurs).
- Le rejeu accueil/pratiquer/apprendre reflète l'arbre 0.21.0 (≈ 0.20.0) ; seule la note de la
  porte « En équipe » de l'accueil a bougé.

## Questions à ne pas reposer (déjà tranchées)
- **Langue de travail ?** → français.
- **Forme de livraison ?** → fichiers complets (jamais un patch), GitHub Pages **sans build**.
- **Moteur ?** → `moteur/*.js` verbatim, **md5 == 0.10.0** ; seule la ligne BUILD bouge (tolérances
  déclarées : BUILD + `accompMuted`×1 + `feelMs`×2).
- **Workflow ?** → spec courte **avant** code, puis code + recettes + vérif navigateur, une PR prête
  à relire ; **Jean merge, Jean fait le ménage de branches**. Ne pas sur-verrouiller de questions
  quand les défauts sont évidents.
- **i18n ?** → chrome trilingue FR/EN/PT symétrique pour chaque chaîne ; le **contenu des leçons
  reste FR** (= chantier **M1** à venir).
- **Panel ?** → skill `panel-ux-30`, 30 personas simulés, **roster figé** ; avertissement méthodo
  conservé ; un run par page + synthèse ; dashboards dans **`panel-ux-30/`**.
- **Numéro de build ?** → une PR = un minor (0.20.0 → 0.21.0).
- **Env de test ?** → Node 22 ; jsdom + playwright installés dans le scratchpad
  (`NODE_PATH` = `.../scratchpad/node_modules`), Chromium à `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

## Points ouverts
- **Jean** : merger **#37**, constater la prod **0.21.0** (entrée à froid + « Essayer avec un
  exemple » à l'œil), et **vérifier le mode EN LIGNE à 2 appareils** (seul point invérifiable hors prod).
- **Jean** : ménage de branches — supprimer `claude/metronome-r5-salve-p1-rb2m6e` ; conserver
  `passe3` + `deploy-passe3`.
- **Arbitrage de la suite** (plan re-priorisé par le rejeu 0.21.0) :
  - **P1 = equipe v1.2** — guider le mode « En ligne » (**SEUL critique restant** : créer/rejoindre
    un code, état de salle lisible « qui est là / qui est chef », « le chef lance ») + préparer une
    répartition **sans quitter la page** + **franciser « Team Spirit »** (anglicisme transverse).
  - **M1 = corpus i18n** — traduire le contenu des leçons (objectif/consigne/critère) : seul majeur
    d'apprendre, transverse au portail.
  - **P2 = pratiquer** : mode « simple / classe » + franciser les puces du sommaire.
  - **C6 = expansion styles** (voix, jazz, son cubain, vents…).

## Fichiers / livrables produits (ce fil)
- `equipe.html` — **v1.1** (entrée à froid + dé-jargon) · `index.html` (porte allégée) ·
  `moteur/fm-etat.js` (**BUILD 0.21.0**) · `recette-{equipe,accueil,apprendre,pratiquer,extraction}.js`.
- `metronome-refonte-R6-equipe-v1.1-spec.md` · `rapport-nonregression-0.21.0.md`.
- `panel-ux-30/` : `panel-tests-ui-metronomefunk-{accueil,apprendre,pratiquer,equipe}-0.21.0.html`
  + `panel-ux-0.21.0-synthese-portail.html`.
- Tout sur la branche `claude/metronomefunk-r6-delivery-wcr4rz`, **PR #37 (ouverte)**.

## Reprise
- **Titre suggéré du nouveau fil** : « Métronome FM — R-6 v1.1 livrée (0.21.0), suite P1 equipe v1.2 »
- **Action** : ouvrir un nouveau fil, coller ce brief en premier message. Démarrer par : **constater
  #37** (mergée ? sinon repartir d'une branche fraîche sur `main` à jour, PR mergée = finie), puis
  **P1 = equipe v1.2**, spec courte avant code.

# Métronome FM — passe 2 close, cap sur la passe 3 (team spirit) : brief de reprise

> À coller en tête du nouveau fil pour resynchroniser le contexte.

## Le projet

Métronome web du **Portail Formation Musicale** : application HTML **fichier unique**, offline, sans dépendance JS, français, mobile-first Android, déployée sur GitHub Pages. Livraison du code toujours en **fichier complet, jamais en patch**. La **passe 2 est terminée et recettée** (étapes 2-5 de `metronome-passe2-spec.md` + §7.7 asservi) et **validée sur appareil par l'utilisateur** (« tout fonctionne »). Le push est **volontairement différé** : les tutoriels publiés portent sur la version précédente. Prochain chantier : **spécification de la passe 3** — mode « team spirit » + bibliothèque de grooves, dont le corpus de recherche (6 familles) est livré et validé dans le dossier.

## Décisions actées

**Passe 2 — close**
- Étape 5 (recette) exécutée en deux volets : machine (preview headless, 100 % conforme, zéro erreur console — rapport dans `metronome-etape5-recette.md`) et appareil (validé par l'utilisateur, aucune anomalie signalée).
- **§7.7 asservi et livré** : les valeurs 12/16 de `#claveCount` et `#percCount` passent par `setFamily` — changer l'un aligne l'autre et la family-bar, divergence binaire/ternaire impossible. Le **8 pas clave reste une exception locale** (presets tresillo/cinquillo) : il ne touche ni la famille ni la percussion, et les presets 8 pas posent la valeur sans passer par l'écouteur. Vérifié en preview (4 cas + lecture + console vierge). Changement purement UI : la validation appareil antérieure reste valable.
- Push GitHub **différé sine die** (tutoriels sur l'ancienne version) ; rien de la passe 2 n'est poussé.

**Passe 3 — principe acté, spec à écrire**
- **Mode team spirit**, deux sens du même objet (liste de voix hétérogènes assignées à des participants) : *accumulation* (empiler des lignes solos → ensemble) et *distribution* (partitionner un groove total entre N participants, reconstitution = le groove).
- Le chantier structurel unique : **moteur multi-instruments** — des voix d'instruments différents simultanément (aujourd'hui un seul `S.perc.instr` + 2 claves). C'est la dette « généralisation de l'ajout/suppression de voix arbitraires » explicitement laissée par l'étape 3 (spec passe 2 §4).
- **Bibliothèque de grooves** = données, pas moteur ; corpus de recherche livré (voir Fichiers).
- **Timbres nouveaux** (reco-reco, agogô, surdo…) : une recette WebAudio par instrument ; le reco-reco (raclement) est le plus difficile, agogô/surdo faciles (cloche et fûts existants).
- Discipline conservée : **spec d'abord, une étape par session**. Un cycle `decoupe-lots` redevient pertinent pour les **tables de grooves** (données à corpus), pas pour l'édition du fichier unique.

**Corpus grooves — livré et validé (méthode et verdicts)**
- Chaîne : prompt de recherche → essai Gemini (Brésil) → **correctif Opus** (archivé `grooves-bresil-correctif-opus.md`) → **6 agents parallèles avec recherche web** (règles durcies : double corroboration, INCERTAIN systématique, format strict, sources réellement consultées).
- Résultat : **6 familles, 31 fiches, 171 grilles toutes conformes** (12/16 pas exacts), AUTO-CRITIQUE partout. Vérifié par script (`check_grooves.py`, scratchpad).
- **Fiabilité graduée** : hip-hop le mieux sourcé (swing MPC sourcé Roger Linn) ; Brésil solide (Ijexá réparé : agogô 2 tons vérifié Pulsewave/partition) ; funk/reggae/rock bons ; **ouest-africain le plus faible** — origines/mètres/rôles corroborés mais **toutes les positions de frappe sont des reconstructions marquées INCERTAIN** (57), les transcriptions de référence étant payantes/protégées. **Priorité de validation à l'oreille**, ou livre en main (Billmeier & Keïta, Konaté « Rhythmen der Malinke ») si l'utilisateur en possède un.
- 3 corrections post-agents faites et tracées dans les fichiers : zabumba xote complété 15→16 pas (INCERTAIN), motif djembé 8 pas étendu par répétition sur 16, notation illustrative `^` nettoyée (reggae).
- Leçon opérationnelle : 4 agents Fable coupés par la limite de session (2 avaient déjà écrit leur fichier) ; relance des 2 manquants **sur Opus** avec la consigne « **écrire le fichier tôt puis l'améliorer** » — à réutiliser pour tout agent long.

## Faits & contraintes

- **Établi / vérifié** :
  - Source à jour : **`metronome.html`** (étapes 2-4 + §7.7 asservi), validée appareil + recette machine complète. Sauvegarde pré-passe-2 : `metronome.passe1.backup.html`.
  - Recette machine (détail dans `metronome-etape5-recette.md`) : wizard 3 contextes + quiz (Q6 conditionnelle), masquages croisés, bascule famille, clave 3-2 (5 frappes, 1re accentuée `acc`), gap §5 (a)(b)(c) en lecture réelle avec statuts « ● GAP — <voix> en silence » / « ● COUPÉ », gap ciblé clave percussion éteinte, survie/repli de cible, routine `gap 1/2` forçant `all`, clic muet, ligne de réduction, archet plein écran.
  - Preview : config `metronome-passe2` (python http.server **8731**, dossier « test skill decoupe ») dans `C:\Users\le_ma\Desktop\claude\.claude\launch.json`. Headless : `.click()` synthétique ne démarre PAS l'audio (geste non « trusted ») → utiliser `preview_click` sur `#startBtn` ; `statusLine` est mis à jour par le scheduler en lecture (échantillonnable) ; canvas/rAF figés à l'arrêt ; IIFE → piloter par le DOM.
  - Thème : attribut `data-fm-theme` + variables `--fm-*` ; transition CSS 0,5 s (une lecture immédiate du fond calculé après clic est trompeuse).
  - Dépôt : `https://github.com/nmulongo-sys/metronome`, fichier distant `index.html`, Pages : `https://nmulongo-sys.github.io/metronome/`. **Rien de la passe 2 n'est poussé** (décision, pas oubli).
- **Estimé / à confirmer** :
  - Plein écran archet : affichait « 92 BPM » avec tempo courant 240 en headless (libellé probablement rafraîchi par la boucle de dessin, figée hors lecture). Non bloquant, l'utilisateur n'a rien signalé sur appareil — à re-vérifier d'un coup d'œil un jour.
  - Q5 du quiz : `periodOverride` écrase la période de `RULES_TABLE` (design assumé).
  - Grilles ouest-africaines : reconstructions INCERTAIN à valider à l'oreille avant encodage passe 3.
  - **Sécurité** : `httpsgithub.comnmulongo-sysmetronom.txt` (dossier) contient un **jeton GitHub en clair** — à révoquer/effacer (signalé deux fois à l'utilisateur, pas encore fait à connaissance du fil).
  - README (`README.md`) toujours **périmé** (état passe 1) — à régénérer via `readme-dev` avant le push, en incluant étapes 2-4 + §7.7.

## Questions à ne pas reposer (déjà tranchées)

- **Langue ? Mode de livraison ?** → Français ; fichier HTML complet, jamais un patch ; app autonome offline mobile-first.
- **Quelle source ?** → `metronome.html` du dossier « test skill decoupe ». `index (6).html` = périmé, à ignorer.
- **IA à l'exécution ?** → Non. Moteur de règles embarqué uniquement.
- **Découper l'implémentation en lots ?** → Non pour le fichier unique (tranché trois fois). Oui envisageable pour les **tables de grooves** de la passe 3 (données).
- **Pousser la passe 2 maintenant ?** → Non : différé tant que les tutoriels visent l'ancienne version. Ne pas relancer.
- **Le 8 pas clave doit-il suivre la famille ?** → Non : exception locale assumée, nécessaire aux presets, sans grille perc 8 pas en face.
- **Quel modèle pour quels travaux ?** → Fable pour l'architecture/spec/recette dans le fil ; agents économiques (Opus) pour la recherche parallélisable — préférence coût explicite de l'utilisateur. Consigne agents longs : écrire le livrable tôt.
- **Le corpus grooves est-il exploitable tel quel ?** → Format oui (171 grilles conformes, vérifiées script). Contenu : gradué — voir fiabilité ; l'ouest-africain exige validation à l'oreille avant encodage.
- **Interaction GitHub ?** → Sur demande de push : demander la clé, exécuter, rappeler d'effacer le jeton, sans discours de sécurité. Skill `github-push` ; cible distante `index.html`.
- **Peux-tu ouvrir le nouveau fil toi-même ?** → Non. L'utilisateur ouvre le fil et colle ce brief.
- **Posture ?** → Architecte critique, direct, zéro conjecture, vérifié ≠ hypothétique, corriger explicitement ses erreurs.
- **Contexte pro (conformité ITT/dual-use) ?** → Sans rapport avec ce projet musical ; ne jamais mélanger, jamais sur GitHub.
- **Skills pertinents ?** → `decoupe-lots`, `readme-dev`, `github-push`, `brief-reprise`, `tuto-episode`.

## Points ouverts

- **Spec passe 3 à rédiger** (l'objet du nouveau fil) : moteur multi-instruments (dette étape 3), mode team spirit (accumulation + distribution, UI d'assignation participants, solo/mute par participant), schéma des tables de grooves (conversion des 6 fichiers `grooves-*.md`, champs : famille, grilles par voix, tessiture, ordre d'entrée en jam, difficulté, variations, tempo, INCERTAIN), timbres nouveaux (reco-reco à prototyper), plan d'étapes (une par session).
- **Validation à l'oreille du corpus** : ouest-africain en priorité ; xote brésilien (grille complétée) ; double tap rim de « Right Time » (reggae).
- README + licence (MIT recommandée) + push : après réalignement des tutoriels — pipeline inchangé.
- Jeton GitHub en clair à révoquer (utilisateur).

## Fichiers / livrables produits

Tous dans `C:\Users\le_ma\Desktop\claude\test skill decoupe\` :
- **`metronome.html`** — source vivante : passe 2 complète (étapes 2-4) + §7.7 asservi. Recettée machine + appareil.
- **`metronome-etape5-recette.md`** — rapport de recette étape 5 (volets machine et appareil, §7.7 tracé).
- **`grooves-ouest-africain.md`, `grooves-bresil.md`, `grooves-funk.md`, `grooves-reggae.md`, `grooves-hiphop.md`, `grooves-rock.md`** — corpus passe 3 : 31 fiches, 171 grilles conformes, AUTO-CRITIQUE par famille.
- **`grooves-bresil-correctif-opus.md`** — note d'audit Opus (méthode + fiche Samba validée), archive de traçabilité.
- **`metronome-passe2-spec.md`** — spec passe 2 (référence close) ; **`metronome.passe1.backup.html`** — sauvegarde.
- **`README.md`** — périmé (passe 1), à régénérer avant push.
- Historique : briefs antérieurs (`metronome-etape5-brief-reprise.md`, etc.), `LOT-00…07` + `prompt_LOT-*`. À ignorer : `index (6).html`.
- Hors dossier : `C:\Users\le_ma\Desktop\claude\.claude\launch.json` (preview port 8731).

## Reprise

- **Titre suggéré du nouveau fil** : « Métronome FM — passe 3 : spec team spirit & bibliothèque de grooves »
- **Action** : ouvrir un nouveau fil, coller ce brief en premier message. Démarrer par la rédaction de la spec passe 3 (schéma des voix multi-instruments d'abord — tout en découle), en consommant les 6 fichiers grooves comme intrant avec leur gradation de fiabilité. La validation à l'oreille de l'ouest-africain peut se faire en parallèle de la rédaction.

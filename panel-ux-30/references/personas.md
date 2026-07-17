# Le panel fixe — 30 testeurs

Ces 30 personas sont **figés** : mêmes identités, âges, appareils, niveaux numériques et sensibilités à chaque invocation du skill. Seuls leurs *constats*, *citations*, *notes* et *scénarios* changent, car ils dépendent du HTML testé.

Champs fixes par persona : `id`, `nom`, `age`, `role`, `it` (1–5), `dev` (mobile/tablette/ordinateur), `devLbl`.
Champs à générer à chaque test (ancrés dans le code réel) : `note` (/10, une décimale), `duree`, `quote`, `scenario`, `constats[]` (2–4, avec `sev` ∈ critique/majeur/mineur et `th` = thème), `aime[]` (1–2).

La colonne **Sensibilités** dicte ce que chaque persona remarque en priorité : c'est la clé de la cohérence entre invocations. La colonne **Comportement** décrit sa manière de tester.

| id | Nom | Âge | Rôle (univers musical) | IT | Appareil (devLbl) | Sensibilités | Comportement |
|----|-----|-----|------------------------|----|--------------------|--------------|--------------|
| 1 | Léa | 9 | Élève en éveil musical (percussions) | 1 | tablette (iPad école) | Murs de texte, vocabulaire adulte, absence de gros bouton évident ; adore les animations et les sons | Teste 15 min avec un adulte ; ferme l'app si elle est perdue ; note sévèrement toute surcharge |
| 2 | Tom | 12 | Collégien, batterie 1re année | 3 | mobile (Android Samsung A25) | Taille des cibles au pouce, aspect « jeu », rapidité | À l'aise mais impatient ; se perd si deux sections se ressemblent |
| 3 | Inès | 14 | Flûtiste, conservatoire 2e cycle | 3 | mobile (iPhone 13) | Découvrabilité des aides/assistants, correspondance avec le vocabulaire du solfège | Méthodique ; revient une 2e fois et remarque ce qu'elle avait raté |
| 4 | Hugo | 16 | Bassiste autodidacte (YouTube) | 4 | ordinateur (PC portable Windows) | Veut voir/repiquer ce qu'il entend ; saute les pavés de texte et rate des options | Explore vite, en profondeur ; note généreusement les fonctions créatives |
| 5 | Emma | 17 | Chanteuse de chorale lycéenne | 2 | mobile (Android Xiaomi) | Libellés non conformes au vocabulaire appris en cours ; retours visuels manquants (valeurs, mute) | Cherche littéralement les mots qu'elle connaît ; bloque sinon |
| 6 | Nathan | 19 | Étudiant STAPS, djembé en association | 3 | mobile (Android milieu de gamme) | Performance audio sur téléphone modeste, gestes tactiles fins, pédagogie main gauche/droite | Pousse l'app dans ses retranchements (tempo élevé, couches multiples) |
| 7 | Chloé | 22 | Étudiante en musicologie | 3 | ordinateur (MacBook Air) | Exactitude musicologique, sources/références, hiérarchie de l'information | Lit tout ; vérifie la justesse du contenu ; académique |
| 8 | Yanis | 24 | DJ amateur, production MAO | 5 | ordinateur (PC gamer, Chrome) | Intégration au workflow (export, sync), rangement logique des fonctions | Compare à ses outils pro ; pragmatique |
| 9 | Maria | 26 | Prof de capoeira, brésilienne | 2 | mobile (Android Motorola) | Qualité et complétude des traductions, effets de bord des réglages globaux | Bascule la langue dès le début ; teste en PT-BR |
| 10 | Julien | 28 | Développeur web, guitariste | 5 | ordinateur (laptop Linux, Firefox) | Accessibilité technique (aria, focus, alternatives aux canvas), validation en direct des entrées | Inspecte le code, teste au clavier ; le plus technique du panel |
| 11 | Sofia | 31 | Violoniste semi-professionnelle | 3 | tablette (iPad 10e gén.) | Fonctions propres à son instrument, taille des zones de visualisation en portrait | Exigeante mais enthousiaste si le contenu est unique |
| 12 | Marc | 33 | Batteur de groupe rock | 4 | mobile (Android Pixel) | Feedback de progression (scores, stats), enchaînements type setlist | Utilisateur intensif d'apps d'entraînement ; compare |
| 13 | Aïcha | 35 | Professeure des écoles (chorale de classe) | 2 | ordinateur (PC école ancien, Firefox) | Simplicité pour usage en classe, e-mails filtrés (messagerie académique), repères de navigation | Cherche le minimum viable pour sa classe ; peu de temps |
| 14 | Diego | 38 | Percussionniste cubain (son, timba) | 3 | mobile (iPhone SE, petit écran) | Exactitude des patterns de sa culture, gestes de précision sur petit écran | Valide ou invalide le contenu culturel ; sévère sur le tactile |
| 15 | Camille | 40 | Cheffe de chœur et d'ensemble percus | 3 | ordinateur (laptop Windows) | Fonctions de groupe, formats d'export lisibles par des élèves (pas des machines) | Pense « atelier de 10 personnes » en permanence |
| 16 | Olivier | 42 | Ingénieur, trompettiste d'harmonie | 5 | ordinateur (PC Windows, Edge) | Automatisation/scripts, raccourcis clavier, persistance des données personnelles | Systématique ; lit la doc en dernier recours |
| 17 | Nadia | 45 | Pianiste amatrice (reprise après 15 ans) | 2 | tablette (iPad ancien) | Petits textes grisés, densité intimidante, besoin d'un guide pas à pas | Intimidée au départ ; l'assistant peut la sauver |
| 18 | Pierre | 47 | Luthier, violoncelliste amateur | 2 | ordinateur (PC Windows 10 ancien) | Justesse « métier » du contenu, impression/support papier, peur de casser en modifiant | Prudent ; n'ose pas modifier sans exemple |
| 19 | Fatou | 50 | Animatrice d'ateliers djembé | 2 | mobile (Android entrée de gamme) | Usage collectif à distance (gros affichage), mise en veille de l'écran, robustesse | L'appareil est posé au sol au milieu du groupe |
| 20 | Laurent | 52 | Bassiste funk semi-pro | 3 | ordinateur (laptop + interface audio) | Authenticité culturelle du contenu, lisibilité des infos pendant qu'il joue | Le plus généreux quand le contenu est juste ; détails d'expert |
| 21 | Anne | 55 | Documentaliste, choriste | 1 | ordinateur (PC familial, Chrome) | Peur de « tout casser », formulations inquiétantes (jargon de connexion), portes de sortie | Se méfie ; refuse de donner son e-mail si le libellé est étrange |
| 22 | Bernard | 58 | Batteur jazz amateur | 2 | tablette (iPad) | Précision des réglages au doigt (curseurs), presets prêts à l'emploi pour son style | Connaisseur exigeant sur le fond, maladroit sur le tactile |
| 23 | Rosa | 61 | Prof de formation musicale retraitée | 2 | ordinateur (laptop, Chrome) | Qualité pédagogique, longueur des textes d'aide, parcours de découverte pour enseignants | Évalue pour recommander à des collègues |
| 24 | Michel | 63 | Accordéoniste de bal musette | 1 | mobile (smartphone hérité de sa fille) | Libellés opaques pour les tâches de base, termes anglais bloquants | Une seule tâche simple en tête ; échoue ou réussit dessus |
| 25 | Denise | 66 | Choriste paroissiale | 1 | tablette (Android entrée de gamme) | Contraste et taille de police, absence de bouton « réinitialiser », peur après fausse manœuvre | Testée avec aide ; n'ose plus toucher après une erreur |
| 26 | Georges | 68 | Violoniste amateur (50 ans de pratique) | 2 | ordinateur (PC Windows, écran 24") | Vocabulaire de son instrument, découvrabilité des modes plein écran, impression | Patient ; découvre les choses « par hasard » |
| 27 | Malika | 71 | Pianiste retraitée, ex-professeure | 2 | tablette (iPad) | Navigation dans les longues pages (sommaire), icônes sans texte | Perd sa position ; réclame une table des matières |
| 28 | Jean-Paul | 74 | Clarinettiste d'harmonie municipale | 1 | ordinateur (PC, Chrome installé par son fils) | Anglicismes et jargon, taille des cibles (mains qui tremblent) | S'interdit d'explorer ce qu'il ne comprend pas |
| 29 | Suzanne | 77 | Organiste liturgique | 1 | tablette (Android) | Touchers involontaires (éléments qui s'ouvrent/se ferment), visibilité de l'état du système | Testée avec aide ; déstabilisée par tout mouvement imprévu |
| 30 | Henri | 80 | Ancien chef d'harmonie | 1 | ordinateur (PC ancien, écran 1366×768) | Lisibilité au zoom navigateur 150 %+, besoin d'un manuel imprimable | Émerveillé par le visuel, gêné par la lecture |

## Barème indicatif des notes

La note dépend du site testé, mais reste cohérente avec le profil :
- IT 1–2 : partent de ~7 et perdent gros sur chaque friction de prise en main, lisibilité, jargon (plancher réaliste ≈ 4.5).
- IT 3 : équilibrés, sensibles à leur domaine musical.
- IT 4–5 : partent de ~8 si le fond est riche, pénalisent surtout les manques fonctionnels et techniques.
- Les experts d'un domaine (Sofia/archet, Diego/claves, Laurent/funk, Bernard/jazz…) montent à 8.5–9.5 si le contenu de leur spécialité est juste et unique — et descendent nettement s'il est absent ou faux.
- Moyenne panel attendue : entre 5.5 (site à problèmes) et 8.5 (site excellent). Éviter l'uniformité : l'écart-type fait la crédibilité.

## Thèmes de constats (utiliser exactement ces libellés)

`Prise en main` · `Mobile & tactile` · `Accessibilité` · `Terminologie` · `Navigation` · `Audio & son` · `Fonctions expertes` · `Compte & connexion` · `Visuel & lisibilité` · `Performance`

(« Audio & son » et « Performance » ne s'appliquent que si le site testé a de l'audio ou des animations temps réel ; sinon les omettre.)

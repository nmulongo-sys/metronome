/* ============================================================================
   Corpus « bresil » — premier style ouvert par l'axe C6, niveau Intermédiaire.
   9 modules : 6 au cajón (un par rythme — l'identité du style) et 3 au djembé
   (le tapis, les palmas 3-3-2, l'indépendance). Contrairement au funk où cajón
   et djembé sont deux CHEMINS alternatifs, ils sont ici deux RÔLES simultanés
   d'un même ensemble : le cajón porte la voix identitaire (zabumba, bombo,
   surdo, pandeiro), le djembé le tapis (triângulo, ganzá) et les palmas.
   Schéma de corpus : spec R-1 §4.1 / spec R-2. Spec du lot :
   metronome-C6-bresil-spec.md (découpage 9 modules acté par Jean le 19/07).

   SOURCE : corpus-rythmes-bresiliens-vol2.md (v1.1, 18/07), fiches 9, 3, 1, 5,
   8, 6. Les 3 fiches à divergence structurelle ouverte (samba de roda, xaxado,
   frevo) sont reportées au lot 2. Grilles converties par la convention du
   projet (passe 3 §5, en-tête de corpus/grooves/*.js) : X->2 · x->1 · .->0.

   UNITÉ DE COMPTAGE — le moteur étale toute démo sur UNE mesure de 4/4
   (fm-audio : pas = 240000/tempo/steps). Cinq grilles sur six sont déjà
   « 16 pas = 4 noires » (1 mesure de 4/4, ou 2 de 2/4) : report direct. La
   bossa nova est notée par la source sur 2 mesures de 4/4 EN CROCHES, soit
   8 noires : son tempo d'app compte donc la BLANCHE (la bossa se compte en
   deux) — 44 ici = 88 à la noire dans la notation de la source, qui est bien
   son tempo de travail. Le clic est subdivisé (subdiv 2) pour rendre la noire.

   Pas de bloc « instruments » ni « patterns » : ce corpus réutilise ceux du
   funk par l'union (FM_ASM fusionne par clé et lève sur doublon — déclarer
   « cajon » ici ferait échouer le chargement). Presets au clic seul : la basse
   funk générative n'a rien à faire sous un rythme brésilien.
   ============================================================================ */
(function () {
  'use strict';
  window.FM_CORPUS = window.FM_CORPUS || {};
  window.FM_CORPUS['bresil'] = {
  meta: { id: 'bresil', label: 'Brésil', version: '1.0',
    description: "Six rythmes brésiliens en réduction à deux joueurs : la ronde lente de la ciranda, la marche de l'arrasta-pé, le balancement du xote, la retenue de la bossa nova, le claqué du coco, et le 3-3-2 du partido alto." },
  // C6 : clé préfixée par meta.id — un niveau appartient à UN SEUL corpus dans FM_ASM
  // (moteur/fm-etat.js:36, verbatim). Les 6 premiers codes sont les modules cajón, les
  // 3 derniers les modules djembé : chaque colonne saute les codes qui ne sont pas les siens.
  niveaux: { 'bresil:intermediaire': ["CIR", "ARR", "XOT", "BOS", "COC", "PAR", "TAP", "PAL", "IND"] },
  modules: {
    'MOD-BR-CJ-I-CIR': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Ciranda — le temps qui domine",
      exercices: ["EX-BR-CIR-01", "EX-BR-CIR-02", "EX-BR-CIR-03", "EX-BR-CIR-04", "EX-BR-CIR-05"] },
    'MOD-BR-CJ-I-ARR': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Arrasta-pé — la marche sautillée",
      exercices: ["EX-BR-ARR-01", "EX-BR-ARR-02", "EX-BR-ARR-03", "EX-BR-ARR-04", "EX-BR-ARR-05"] },
    'MOD-BR-CJ-I-XOT': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Xote — l'anticipation douce",
      exercices: ["EX-BR-XOT-01", "EX-BR-XOT-02", "EX-BR-XOT-03", "EX-BR-XOT-04", "EX-BR-XOT-05"] },
    'MOD-BR-CJ-I-BOS': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Bossa nova — jouer piano",
      exercices: ["EX-BR-BOS-01", "EX-BR-BOS-02", "EX-BR-BOS-03", "EX-BR-BOS-04", "EX-BR-BOS-05"] },
    'MOD-BR-CJ-I-COC': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Coco — le claqué qui marque la cadence",
      exercices: ["EX-BR-COC-01", "EX-BR-COC-02", "EX-BR-COC-03", "EX-BR-COC-04", "EX-BR-COC-05"] },
    'MOD-BR-CJ-I-PAR': { parcours: 'cajon', style: 'bresil', niveau: 'intermediaire', objet: "Partido alto — la frappe qui freine",
      exercices: ["EX-BR-PAR-01", "EX-BR-PAR-02", "EX-BR-PAR-03", "EX-BR-PAR-04", "EX-BR-PAR-05"] },
    'MOD-BR-DJ-I-TAP': { parcours: 'djembe', style: 'bresil', niveau: 'intermediaire', objet: "Le tapis — tenir sans peser",
      exercices: ["EX-BR-TAP-01", "EX-BR-TAP-02", "EX-BR-TAP-03", "EX-BR-TAP-04", "EX-BR-TAP-05"] },
    'MOD-BR-DJ-I-PAL': { parcours: 'djembe', style: 'bresil', niveau: 'intermediaire', objet: "Les palmas en trois-trois-deux",
      exercices: ["EX-BR-PAL-01", "EX-BR-PAL-02", "EX-BR-PAL-03", "EX-BR-PAL-04", "EX-BR-PAL-05"] },
    'MOD-BR-DJ-I-IND': { parcours: 'djembe', style: 'bresil', niveau: 'intermediaire', objet: "L'indépendance — tenir pendant que ça syncope",
      exercices: ["EX-BR-IND-01", "EX-BR-IND-02", "EX-BR-IND-03", "EX-BR-IND-04", "EX-BR-IND-05"] }
  },
  exercices: {

    /* ---- CIRANDA (fiche 9 · fiabilité ÉLEVÉE / ÉLEVÉE · tempo 63) -------------
       Grille sourcée presque littéralement : « un coup grave sur la tête du compas
       et des coups étouffés sur les autres temps ». La hiérarchie dynamique EST le
       rythme — d'où l'accent (2) sur 1 et les frappes simples (1) sur 2-3-4. */
    'EX-BR-CIR-01': {
      kind: "atome",
      objet: "Le grave ouvert sur le 1",
      consigne: "Ne joue que le 1 : un seul grave, ouvert, que tu laisses sonner — les trois autres temps restent vides.",
      critere: "quand le 1 sonne encore au moment où tu arrives sur le 2.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}} },
    'EX-BR-CIR-02': {
      kind: "atome",
      objet: "Les trois étouffés",
      consigne: "Pose la paume à plat sur la tapa et joue 2, 3 et 4 en frappes sourdes, sans laisser vibrer.",
      critere: "quand les trois frappes sortent mates et courtes, et se ressemblent entre elles.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "cajon", steps: 16, voix: {grave: [0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-CIR-03': {
      kind: "atome",
      objet: "Fort, doux, doux, doux",
      consigne: "Enchaîne le grave ouvert et les trois étouffés en boucle, en marchant les quatre pas de la ronde — départ du pied gauche sur le fort.",
      critere: "quand quelqu'un qui entre dans la pièce trouve le 1 sans avoir à compter.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-CIR-04': {
      kind: "atome",
      objet: "Le tapis d'en face",
      consigne: "Écoute le tapis de croches que tient l'autre, puis pose ta ronde dedans sans le pousser.",
      critere: "quand ton 1 tombe dans le tapis sans le bousculer.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]}} },
    'EX-BR-CIR-05': {
      kind: "synthese",
      objet: "Synthèse — garder l'écart quand le clic s'absente",
      consigne: "Tiens la ronde pendant que le clic disparaît une mesure sur quatre, en surveillant l'écart entre le 1 et les trois autres.",
      critere: "quand le clic revient sur ton 1 et que les étouffés ne sont pas montés à son niveau.",
      preset: {metro: true, tempo: 63, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },

    /* ---- ARRASTA-PÉ (fiche 3 · ÉLEVÉE / MOYENNE · tempo 104) ------------------
       La zabumba en mode marche : grave sur chaque temps, bacalhau en contretemps
       continu. Le rythme du corpus qui survit le mieux à la réduction. */
    'EX-BR-ARR-01': {
      kind: "atome",
      objet: "Un grave sur chaque temps",
      consigne: "Pose un grave sur chacun des quatre temps, tous du même poids — aucun ne doit dépasser.",
      critere: "quand aucun des quatre graves ne ressort si tu fermes les yeux.",
      preset: {metro: true, tempo: 104},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0]}} },
    'EX-BR-ARR-02': {
      kind: "atome",
      objet: "Le contretemps sec",
      consigne: "Laisse le grave et place une frappe sèche et aiguë juste entre deux temps, franchement plus légère.",
      critere: "quand le contretemps claque net et reste nettement sous le grave.",
      preset: {metro: true, tempo: 104},
      demo: {instr: "cajon", steps: 16, voix: {aigu: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-ARR-03': {
      kind: "atome",
      objet: "La marche complète",
      consigne: "Superpose les deux mains : grave sur les temps, aigu entre les temps, en boucle.",
      critere: "quand ça sautille au lieu de marcher au pas.",
      preset: {metro: true, tempo: 104},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
        aigu: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-ARR-04': {
      kind: "atome",
      objet: "Sautillé, pas militaire",
      consigne: "Rejoue la même grille en allégeant tout le bras : l'appui doit rebondir au lieu de s'écraser.",
      critere: "quand la marche donne envie de sauter, pas de défiler.",
      preset: {metro: true, tempo: 104},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
        aigu: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-ARR-05': {
      kind: "synthese",
      objet: "Synthèse — tenir la marche sans accélérer",
      consigne: "Enchaîne la marche complète pendant que le clic s'absente une mesure sur quatre : c'est le contretemps qui tire vers l'avant, pas toi.",
      critere: "quand le clic revient exactement là où tu l'attendais, et pas avant.",
      preset: {metro: true, tempo: 104, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
        aigu: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },

    /* ---- XOTE (fiche 1 · ÉLEVÉE / MOYENNE · tempo 72) -------------------------
       Il n'existe pas UNE cellule de xote canonique (sourcé) : c'est la variante
       d'atelier la plus répandue. Le swing des démos (57) rend le point sourcé en
       v1.1 — la subdivision du xote ne se joue pas droite, elle vit entre binaire
       et ternaire. Valeur à confirmer à l'oreille (Dominguinhos). */
    'EX-BR-XOT-01': {
      kind: "atome",
      objet: "Le squelette, sans anticipation",
      consigne: "Grave sur le 1 et sur le 3, claquement aigu sur le 2 et sur le 4 — rien d'autre pour l'instant.",
      critere: "quand le va-et-vient grave-aigu tourne tout seul, sans que tu comptes.",
      preset: {metro: true, tempo: 72},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-XOT-02': {
      kind: "atome",
      objet: "Les deux claquements secs",
      consigne: "Ne garde que les deux frappes aiguës, sur le 2 et sur le 4, poignet souple et bras lourd.",
      critere: "quand les deux claquements sortent identiques, secs et courts.",
      preset: {metro: true, tempo: 72},
      demo: {instr: "cajon", steps: 16, voix: {aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-XOT-03': {
      kind: "atome",
      objet: "L'anticipation, plus douce que le 1",
      consigne: "Ajoute un grave juste après le 2, plus doux que celui du 1 : il annonce le 3, il ne le remplace pas.",
      critere: "quand l'anticipation se glisse sans voler la vedette au 1.",
      preset: {metro: true, tempo: 72},
      demo: {instr: "cajon", steps: 16, swing: 57, voix: {grave: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0]}} },
    'EX-BR-XOT-04': {
      kind: "atome",
      objet: "Le balancement n'est pas dans la grille",
      consigne: "Rejoue la cellule entière en laissant les subdivisions respirer, un peu inégales — le xote ne se joue pas droit.",
      critere: "quand ça balance au lieu de défiler, sans que tu saches dire où tu triches.",
      preset: {metro: true, tempo: 72},
      demo: {instr: "cajon", steps: 16, swing: 57, voix: {grave: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-XOT-05': {
      kind: "synthese",
      objet: "Synthèse — ne pas durcir en baião",
      consigne: "Enchaîne le xote complet au clic : si l'anticipation durcit et que le tempo monte, tu es en train de basculer dans le baião.",
      critere: "quand l'anticipation reste plus douce que le 1 d'un bout à l'autre.",
      preset: {metro: true, tempo: 72, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, swing: 57, voix: {grave: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },

    /* ---- BOSSA NOVA (fiche 5 · ÉLEVÉE / ÉLEVÉE · tempo 44 = 88 à la noire) ----
       Le rythme le mieux documenté du corpus. Grille v1.0 conservée par la source
       (celle du rapport Gemini a été écartée : 5e frappe au pas 14 au lieu de 13,
       et grosse caisse en noires qui perd les anticipations). Le tempo compte la
       blanche — voir l'en-tête du fichier. Tout l'enjeu est dynamique : jouer doux. */
    'EX-BR-BOS-01': {
      kind: "atome",
      objet: "Le grave et ses deux anticipations",
      consigne: "Le clic bat la pulsation lente, la bossa se comptant en deux : pose le grave sur le 1, juste après le 2, sur le 3, juste après le 4.",
      critere: "quand les deux anticipations tombent d'elles-mêmes, sans que tu les cherches.",
      preset: {metro: true, tempo: 44, subdiv: 2},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,1,2,0,0,1,2,0,0,1,2,0,0,1]}} },
    'EX-BR-BOS-02': {
      kind: "atome",
      objet: "Le motif sec de la main droite",
      consigne: "Laisse le grave et joue le seul motif sec et aigu — c'est le tamborim que João Gilberto disait avoir choisi dans tout le samba.",
      critere: "quand le motif revient à sa place tout seul à chaque tour.",
      preset: {metro: true, tempo: 44, subdiv: 2},
      demo: {instr: "cajon", steps: 16, voix: {aigu: [2,0,0,2,0,0,2,0,0,0,2,0,2,0,0,0]}} },
    'EX-BR-BOS-03': {
      kind: "atome",
      objet: "Superposer sans forcer",
      consigne: "Superpose les deux mains, et surtout n'accentue pas le motif aigu : ce n'est pas un backbeat.",
      critere: "quand l'aigu reste au niveau du reste, sans jamais claquer.",
      preset: {metro: true, tempo: 44, subdiv: 2},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,1,2,0,0,1,2,0,0,1,2,0,0,1],
        aigu: [2,0,0,2,0,0,2,0,0,0,2,0,2,0,0,0]}} },
    'EX-BR-BOS-04': {
      kind: "atome",
      objet: "Le tapis d'en face, très doux",
      consigne: "Écoute le tapis régulier que tient l'autre : il doit rester sous le niveau d'une mélodie sifflée.",
      critere: "quand tu peux siffler par-dessus sans forcer la voix.",
      preset: {metro: true, tempo: 44, subdiv: 2},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}} },
    'EX-BR-BOS-05': {
      kind: "synthese",
      objet: "Synthèse — le motif ne se retourne pas",
      consigne: "Tiens la bossa entière ; le clic s'absente puis revient, et ton premier accent aigu doit retomber au même endroit qu'au départ.",
      critere: "quand le motif est encore à l'endroit après le retour du clic.",
      preset: {metro: true, tempo: 44, subdiv: 2, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,1,2,0,0,1,2,0,0,1,2,0,0,1],
        aigu: [2,0,0,2,0,0,2,0,0,0,2,0,2,0,0,0]}} },

    /* ---- COCO (fiche 8 · MOYENNE / MOYENNE · tempo 84) ------------------------
       Fiabilité assumée comme moyenne par la source : origine contestée et cellule
       très variable selon les régions — c'est une variante d'atelier. La priorité
       identitaire est le trupé (claqué de sabot), « quasi un cinquième instrument,
       peut-être le plus important » : il passe au cajón aigu. */
    'EX-BR-COC-01': {
      kind: "atome",
      objet: "Le grave et sa relance",
      consigne: "Appuie le grave sur le 1, puis pose une relance plus légère juste avant le retour du 1 suivant.",
      critere: "quand la relance pousse vers le 1 sans jamais le doubler.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0]}} },
    'EX-BR-COC-02': {
      kind: "atome",
      objet: "Le claqué du sabot de bois",
      consigne: "Sur le 2, une frappe aiguë très sèche : c'est le sabot qui claque au sol, et c'est lui qui marque vraiment la cadence.",
      critere: "quand le claqué est le son le plus net de toute la boucle.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "cajon", steps: 16, voix: {aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-COC-03': {
      kind: "atome",
      objet: "Le coco complet",
      consigne: "Superpose : grave et relance en dessous, claqué sur le 2 au-dessus.",
      critere: "quand le claqué reste collé au 2 sans glisser vers le temps.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-COC-04': {
      kind: "atome",
      objet: "Le tapis et les piqûres d'en face",
      consigne: "Écoute ce que tient l'autre : un tapis serré, et des contretemps qui piquent — ton claqué doit trouver sa place entre les deux.",
      critere: "quand ton claqué ne se confond avec aucun des deux.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        slap: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-COC-05': {
      kind: "synthese",
      objet: "Synthèse — parler vite par-dessus",
      consigne: "Tiens le coco et récite un texte rapide en même temps : n'importe quel texte, débité aussi vite que tu peux.",
      critere: "quand ta bouche part vite et que tes mains, elles, ne bougent pas d'un poil.",
      preset: {metro: true, tempo: 84, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },

    /* ---- PARTIDO ALTO (fiche 6 · ÉLEVÉE / MOYENNE · tempo 76) -----------------
       Les fonctions sont la meilleure source du corpus (dossiê IPHAN). Mais la
       source REFUSE explicitement de fixer la position du tapa (« je ne fixe pas
       la position du tapa en dur : ce serait une reconstitution ») : l'exercice 03
       est donc le seul du corpus SANS DÉMO — l'élève cherche à l'oreille l'endroit
       où sa frappe freine. Ne pas y ajouter de grille sans relevé. */
    'EX-BR-PAR-01': {
      kind: "atome",
      objet: "Les appuis de pouce",
      consigne: "Marque les quatre appuis graves, réguliers et discrets — c'est le socle sur lequel tout le reste va freiner.",
      critere: "quand les quatre appuis passent inaperçus tellement ils sont réguliers.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "cajon", steps: 16, voix: {grave: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-PAR-02': {
      kind: "atome",
      objet: "Les palmas d'en face",
      consigne: "Écoute le trois-trois-deux frappé dans les mains ; compte-le une fois à voix haute, puis laisse-le tourner sans compter.",
      critere: "quand tu entends les trois groupes sans avoir à les compter.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },
    'EX-BR-PAR-03': {
      kind: "atome",
      objet: "La frappe qui freine",
      consigne: "Ajoute une frappe sèche de la paume dans la seconde moitié du cycle, et cherche l'endroit où elle donne l'impression de retenir le rythme : il n'y a pas de place obligée, c'est l'oreille qui tranche.",
      critere: "quand ta frappe donne l'impression de retenir la boucle au lieu de la pousser.",
      preset: {metro: true, tempo: 76} },
    'EX-BR-PAR-04': {
      kind: "atome",
      objet: "Plus posé que le samba",
      consigne: "Rejoue les appuis en cherchant l'allure : le partido va moins vite que le samba, pour laisser passer le chant.",
      critere: "quand tu sens qu'il reste de la place pour une voix au-dessus.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "cajon", steps: 16, voix: {grave: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-PAR-05': {
      kind: "synthese",
      objet: "Synthèse — chanter un refrain par-dessus",
      consigne: "Tiens tes appuis et ta frappe de retenue, et chante un refrain simple par-dessus — deux phrases suffisent.",
      critere: "quand le refrain sort sans que la boucle bronche.",
      preset: {metro: true, tempo: 76, gap: {playN: 4, muteM: 1}},
      demo: {instr: "cajon", steps: 16, voix: {grave: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },

    /* ---- DJEMBÉ 1/3 — LE TAPIS (ciranda 63, coco 84) --------------------------
       La couche la plus constante du corpus : triângulo, ganzá, charleston selon
       les rythmes, mais toujours la même exigence — l'endurance et la régularité. */
    'EX-BR-TAP-01': {
      kind: "atome",
      objet: "Le tapis en croches",
      consigne: "Joue des tones réguliers, un temps sur deux, sans aucun accent — c'est un tapis, pas un rythme.",
      critere: "quand tu n'entends plus aucune frappe ressortir des autres.",
      preset: {metro: true, tempo: 63, subdiv: 2},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]}} },
    'EX-BR-TAP-02': {
      kind: "atome",
      objet: "Le tapis serré",
      consigne: "Resserre : un tone sur chaque pas, toujours sans accent. C'est le tapis du coco et de la bossa.",
      critere: "quand la nappe est si égale qu'on finit par l'oublier.",
      preset: {metro: true, tempo: 84, subdiv: 2},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}} },
    'EX-BR-TAP-03': {
      kind: "atome",
      objet: "Le contretemps léger",
      consigne: "Garde le tapis en croches et ajoute un slap très léger sur le 2 et sur le 4, sans casser la nappe.",
      critere: "quand les deux slaps se posent sans que le tapis change de vitesse.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        slap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]}} },
    'EX-BR-TAP-04': {
      kind: "atome",
      objet: "La ronde d'en face",
      consigne: "Écoute la ronde du cajón — un temps fort, trois étouffés : ton tapis doit passer dessous sans le couvrir.",
      critere: "quand tu entends encore nettement le temps fort de l'autre tout en jouant.",
      preset: {metro: true, tempo: 63},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-TAP-05': {
      kind: "synthese",
      objet: "Synthèse — tenir sans peser",
      consigne: "Tiens le tapis serré pendant que le clic s'absente une mesure sur quatre, sans accélérer ni appuyer.",
      critere: "quand le clic revient pile sur ton tapis, au même volume qu'au départ.",
      preset: {metro: true, tempo: 84, gap: {playN: 4, muteM: 1}},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}} },

    /* ---- DJEMBÉ 2/3 — LES PALMAS 3-3-2 (partido alto 76) ----------------------
       La couche la mieux sourcée de tout le corpus (dossiê IPHAN : les palmas
       « accompagnent beaucoup de rodas dans la paume de la main »), et un jalon
       rythmique qui resservira — c'est le tresillo. */
    'EX-BR-PAL-01': {
      kind: "atome",
      objet: "Trois, trois, deux — dans les mains",
      consigne: "Frappe dans tes mains : trois, trois, deux, en marchant la pulsation. Compte à voix haute au premier tour, puis lâche le comptage.",
      critere: "quand les trois groupes reviennent sans que tu les comptes.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },
    'EX-BR-PAL-02': {
      kind: "atome",
      objet: "Ne pas égaliser en triolets",
      consigne: "Vérifie le piège : les trois frappes ne sont pas à distance égale — les deux premières sont espacées de trois pas, la dernière de deux seulement.",
      critere: "quand tu sens la dernière arriver plus tôt que les autres, et que c'est voulu.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },
    'EX-BR-PAL-03': {
      kind: "atome",
      objet: "La troisième frappe sur le contretemps",
      consigne: "Écoute les appuis réguliers du cajón, qui marquent les temps : ta troisième frappe doit tomber juste entre deux d'entre eux.",
      critere: "quand la troisième frappe se pose pile dans le trou entre deux appuis.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "cajon", steps: 16, voix: {grave: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]}} },
    'EX-BR-PAL-04': {
      kind: "atome",
      objet: "Passer les palmas au djembé",
      consigne: "Reprends la cellule au djembé, en slaps francs : le son doit rester aussi claquant que ta main nue le faisait.",
      critere: "quand le slap claque autant que ta paume claquait.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },
    'EX-BR-PAL-05': {
      kind: "synthese",
      objet: "Synthèse — la cellule ne se retourne pas",
      consigne: "Tiens le trois-trois-deux pendant que le clic s'absente une mesure sur quatre, puis vérifie au retour que tu es toujours à l'endroit.",
      critere: "quand la cellule tombe encore juste au retour du clic.",
      preset: {metro: true, tempo: 76, gap: {playN: 4, muteM: 1}},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },

    /* ---- DJEMBÉ 3/3 — L'INDÉPENDANCE (coco 84, partido alto 76) ---------------
       Le module qui justifie à lui seul un parcours djembé distinct : tenir une
       couche pendant qu'une autre syncope. Le critère de synthèse est la
       traduction en ressenti du critère « mesuré » de la source (spec C6 §5). */
    'EX-BR-IND-01': {
      kind: "atome",
      objet: "Deux mains, deux métiers",
      consigne: "Tapis de tones continu d'une main, slaps de contretemps de l'autre — chaque main garde son métier du début à la fin.",
      critere: "quand tes deux mains n'ont plus besoin l'une de l'autre pour avancer.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        slap: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-IND-02': {
      kind: "atome",
      objet: "Le tapis ne sent rien",
      consigne: "Fais varier les slaps — plus fort, plus doux, un sur deux — et surveille le tapis, qui ne doit rien sentir passer.",
      critere: "quand tu changes les slaps sans que le tapis bronche.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        slap: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} },
    'EX-BR-IND-03': {
      kind: "atome",
      objet: "Tenir pendant que l'autre syncope",
      consigne: "Écoute le coco du cajón et sa relance décalée : ton tapis doit rester droit pendant que lui syncope.",
      critere: "quand la syncope d'en face ne déplace plus ton tapis.",
      preset: {metro: true, tempo: 84},
      demo: {instr: "cajon", steps: 16, voix: {grave: [2,0,0,0,0,0,1,0,2,0,0,0,0,0,0,0],
        aigu: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0]}} },
    'EX-BR-IND-04': {
      kind: "atome",
      objet: "Basculer du tapis aux palmas",
      consigne: "Tiens le tapis quatre tours, bascule sur le trois-trois-deux, puis reviens — sans trou entre les deux.",
      critere: "quand la bascule se fait sans que le tempo bouge d'un cheveu.",
      preset: {metro: true, tempo: 76},
      demo: {instr: "djembe", steps: 16, voix: {slap: [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0]}} },
    'EX-BR-IND-05': {
      kind: "synthese",
      objet: "Synthèse — l'un droit, l'autre penché",
      consigne: "Tiens le tapis pendant que le clic s'absente, et rajoute les slaps de contretemps dès que tu te sens stable.",
      critere: "quand tu peux syncoper au-dessus sans que ta main de tapis bouge.",
      preset: {metro: true, tempo: 84, gap: {playN: 4, muteM: 1}},
      demo: {instr: "djembe", steps: 16, voix: {tone: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        slap: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}} }
  }
  };
})();

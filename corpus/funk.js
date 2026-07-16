/* ============================================================================
   Corpus « funk » — le style funk : parcours cajón/djembé, niveaux Intermédiaire
   (P-2→P-4) puis Avancé/Artiste (P-7/P-8, à peupler ici, format corpus), et les
   patterns/progressions d'accompagnement de la basse funk générative.
   Schéma de corpus : spec R-1 §4.1 / spec R-2. Extrait à l'identique du build
   0.8.0 : patterns et progressions copiés valeur pour valeur depuis le moteur
   (recette-registre.js vérifie l'égalité stricte) ; chaînes inchangées (i18n ok).
   ============================================================================ */
(function () {
  'use strict';
  window.FM_CORPUS = window.FM_CORPUS || {};
  window.FM_CORPUS['funk'] = {
  meta: { id: 'funk', label: 'Funk', version: '1.0',
    description: "Le parcours funk : verrouiller sur la basse, The One, la grille de 16es, le backbeat, les ghosts." },
  instruments: {
    cajon: {
      label: "Cajón",
      couleur: "var(--pf-cajon)"
    },
    djembe: {
      label: "Djembé",
      couleur: "var(--pf-djembe)"
    }
  },
  niveaux: { intermediaire: ["T1", "T2", "B1", "B2", "D1", "I2"], avance: [], artiste: [] },
  modules: {
    'MOD-CJ-I-I2': { parcours: 'cajon', niveau: 'intermediaire', objet: "Verrouiller sur la basse funk",
      exercices: ["EX-SOCLE-I2-01", "EX-CJ-I2-02", "EX-SOCLE-I2-03", "EX-SOCLE-I2-04", "EX-CJ-I2-05"] },
    'MOD-DJ-I-I2': { parcours: 'djembe', niveau: 'intermediaire', objet: "Verrouiller sur la basse funk",
      exercices: ["EX-SOCLE-I2-01", "EX-DJ-I2-02", "EX-SOCLE-I2-03", "EX-SOCLE-I2-04", "EX-DJ-I2-05"] },
    'MOD-CJ-I-T1': { parcours: 'cajon', niveau: 'intermediaire', objet: "The One",
      exercices: ["EX-SOCLE-T1-01", "EX-SOCLE-T1-02", "EX-SOCLE-T1-03", "EX-SOCLE-T1-04", "EX-SOCLE-T1-05"] },
    'MOD-DJ-I-T1': { parcours: 'djembe', niveau: 'intermediaire', objet: "The One",
      exercices: ["EX-SOCLE-T1-01", "EX-SOCLE-T1-02", "EX-SOCLE-T1-03", "EX-SOCLE-T1-04", "EX-SOCLE-T1-05"] },
    'MOD-CJ-I-T2': { parcours: 'cajon', niveau: 'intermediaire', objet: "Grille de 16es",
      exercices: ["EX-SOCLE-T2-01", "EX-SOCLE-T2-02", "EX-SOCLE-T2-03", "EX-SOCLE-T2-04", "EX-SOCLE-T2-05"] },
    'MOD-DJ-I-T2': { parcours: 'djembe', niveau: 'intermediaire', objet: "Grille de 16es",
      exercices: ["EX-SOCLE-T2-01", "EX-SOCLE-T2-02", "EX-SOCLE-T2-03", "EX-SOCLE-T2-04", "EX-SOCLE-T2-05"] },
    'MOD-CJ-I-B1': { parcours: 'cajon', niveau: 'intermediaire', objet: "Backbeat 2 & 4",
      exercices: ["EX-CJ-B1-01", "EX-CJ-B1-02", "EX-CJ-B1-03", "EX-CJ-B1-04", "EX-CJ-B1-05"] },
    'MOD-DJ-I-B1': { parcours: 'djembe', niveau: 'intermediaire', objet: "Backbeat 2 & 4",
      exercices: ["EX-DJ-B1-01", "EX-DJ-B1-02", "EX-DJ-B1-03", "EX-DJ-B1-04", "EX-DJ-B1-05"] },
    'MOD-CJ-I-B2': { parcours: 'cajon', niveau: 'intermediaire', objet: "Backbeat deplace",
      exercices: ["EX-CJ-B2-01", "EX-CJ-B2-02", "EX-CJ-B2-03", "EX-CJ-B2-04", "EX-CJ-B2-05"] },
    'MOD-DJ-I-B2': { parcours: 'djembe', niveau: 'intermediaire', objet: "Backbeat deplace",
      exercices: ["EX-DJ-B2-01", "EX-DJ-B2-02", "EX-DJ-B2-03", "EX-DJ-B2-04", "EX-DJ-B2-05"] },
    'MOD-CJ-I-D1': { parcours: 'cajon', niveau: 'intermediaire', objet: "Ghost pendule",
      exercices: ["EX-SOCLE-D1-01", "EX-SOCLE-D1-02", "EX-SOCLE-D1-03", "EX-SOCLE-D1-04", "EX-SOCLE-D1-05"] },
    'MOD-DJ-I-D1': { parcours: 'djembe', niveau: 'intermediaire', objet: "Ghost pendule",
      exercices: ["EX-SOCLE-D1-01", "EX-SOCLE-D1-02", "EX-SOCLE-D1-03", "EX-SOCLE-D1-04", "EX-SOCLE-D1-05"] }
  },
  exercices: {
    'EX-SOCLE-I2-01': {
      kind: "atome",
      objet: "Grave sur The One",
      consigne: "Pose ton grave exactement sur le 1, en même temps que la fondamentale de la basse.",
      critere: "quand ton grave et celui de la basse sonnent comme une seule frappe.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-I2-02': {
      kind: "atome",
      objet: "Se loger dans le trou (slap catapulte)",
      consigne: "Place ton slap pile dans le trou laissé par la basse, sans la couvrir.",
      critere: "quand ton slap tombe dans le vide de la basse sans jamais marcher dessus.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-I2-02': {
      kind: "atome",
      objet: "Se loger dans le trou (slap fouetté)",
      consigne: "Place ton slap dans le trou de la basse, poignet fouetté, sans la couvrir.",
      critere: "quand ton slap claque dans le vide de la basse sans marcher dessus.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-I2-03': {
      kind: "atome",
      objet: "Nappe de ghosts sous la basse",
      consigne: "Tisse un tapis de ghosts en 16es sous la ligne de basse.",
      critere: "quand tes ghosts font un tapis régulier sans jamais bousculer la basse.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-I2-04': {
      kind: "atome",
      objet: "Drop-out : tenir le time",
      consigne: "Quand la basse disparaît, garde ta pulsation intérieure et retombe pile à son retour.",
      critere: "quand la basse revient et que tu es toujours exactement en place.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: true, everyN: 4, lenBeats: 2}} },
    'EX-CJ-I2-05': {
      kind: "synthese",
      objet: "Synthèse — groove 2 cellules",
      consigne: "Enchaîne grave sur The One + slap dans le trou + nappe ghost, sur les deux mesures.",
      critere: "quand tu tiens le groove entier détendu, même quand la basse change d'accord.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-DJ-I2-05': {
      kind: "synthese",
      objet: "Synthèse — groove 2 cellules",
      consigne: "Enchaîne bass sur The One + slap fouetté dans le trou + nappe ghost, sur les deux mesures.",
      critere: "quand tu tiens le groove entier détendu, même quand la basse change d'accord.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-SOCLE-T1-01': {
      kind: "atome",
      objet: "Le grave sur le 1",
      consigne: "A chaque mesure, pose ton grave exactement sur le 1 - rien d'autre pour l'instant.",
      critere: "quand tu retrouves le 1 sans le chercher, mesure apres mesure.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T1-02': {
      kind: "atome",
      objet: "Le 1 comme repere, pas comme coup de force",
      consigne: "Rejoue ton grave sur le 1, mais doux : c'est une reference d'organisation, pas l'accent le plus fort.",
      critere: "quand le 1 continue de t'organiser meme joue en retrait.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T1-03': {
      kind: "atome",
      objet: "Tenir le 1 quand la basse s'efface",
      consigne: "Quand la basse disparait une mesure, garde ta pulsation interieure et retombe pile sur le 1 suivant.",
      critere: "quand ton 1 retombe juste sans avoir eu besoin de reentendre la basse.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: true, everyN: 4, lenBeats: 4}} },
    'EX-SOCLE-T1-04': {
      kind: "atome",
      objet: "Le 1 ne bouge pas quand l'accord change",
      consigne: "Sur la progression a deux accords, garde ton 1 identique meme quand l'harmonie change a la 2e mesure.",
      critere: "quand le changement d'accord ne deplace jamais ton repere du 1.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-SOCLE-T1-05': {
      kind: "synthese",
      objet: "Groove d'ancrage sur The One",
      consigne: "Enchaine grave sur chaque 1 + une nappe legere de touches entre les temps, sur les deux mesures.",
      critere: "quand le 1 reste ton point fixe pendant que la nappe tourne autour.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-SOCLE-T2-01': {
      kind: "atome",
      objet: "Sentir les 4 doubles-croches",
      consigne: "Joue une touche tres legere sur chacune des 4 doubles-croches d'un temps, regulieres comme un moteur.",
      critere: "quand les 4 touches sont egales, sans trou ni bosse.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T2-02': {
      kind: "atome",
      objet: "Etendre la grille sur la mesure",
      consigne: "Etale la nappe de 16es sur toute la mesure, sans repos, sous la basse.",
      critere: "quand la grille tourne en continu sans que tu y penses.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T2-03': {
      kind: "atome",
      objet: "Le swing des 16es",
      consigne: "Laisse tes contretemps faibles glisser legerement en retard : un swing doux, ni tout a fait binaire ni ternaire.",
      critere: "quand la nappe respire avec un balancement regulier au lieu d'etre raide.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T2-04': {
      kind: "atome",
      objet: "Accentuer un point de la grille",
      consigne: "Garde la nappe egale mais fais ressortir un seul point par temps (le e, puis le a).",
      critere: "quand l'accent choisi ressort sans casser la regularite du reste.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-T2-05': {
      kind: "synthese",
      objet: "Grille complete swinguee",
      consigne: "Tourne la grille complete sur les deux mesures : nappe reguliere + swing + un accent place, sous la basse.",
      critere: "quand la grille tient toute seule et donne envie de bouger.",
      preset: {pattern: "ghostPendule", prog: "vamp2", drop: {on: false}} },
    'EX-CJ-B1-01': {
      kind: "atome",
      objet: "Le slap seul sur 2 et 4 (catapulte)",
      consigne: "Place un slap catapulte franc sur le 2 et sur le 4, rien d'autre.",
      critere: "quand tes deux slaps claquent nets, toujours a la meme place.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B1-02': {
      kind: "atome",
      objet: "Slap tranchant contre grave rond",
      consigne: "Alterne grave rond sur le 1 et slap tranchant sur 2 & 4 : deux couleurs bien distinctes.",
      critere: "quand on entend clairement deux sons opposes, grave et claquant.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B1-03': {
      kind: "atome",
      objet: "Backbeat regulier sous la basse",
      consigne: "Garde tes slaps 2 & 4 exactement cales pendant que la basse bouge.",
      critere: "quand le backbeat ne bronche pas, quoi que fasse la basse.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B1-04': {
      kind: "atome",
      objet: "Backbeat quand la basse coupe",
      consigne: "Meme quand la basse coupe deux temps, tes slaps 2 & 4 restent a l'heure.",
      critere: "quand tes 2 & 4 retombent justes au retour de la basse.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: true, everyN: 4, lenBeats: 2}} },
    'EX-CJ-B1-05': {
      kind: "synthese",
      objet: "Groove backbeat",
      consigne: "Enchaine grave sur 1 + slaps sur 2 & 4, sur les deux mesures de la progression.",
      critere: "quand le backbeat porte le groove sans effort.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-DJ-B1-01': {
      kind: "atome",
      objet: "Le tone/slap seul sur 2 et 4 (fouette)",
      consigne: "Place un slap fouette (ou un tone claquant) sur le 2 et le 4, rien d'autre.",
      critere: "quand tes deux accents claquent nets, toujours a la meme place.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B1-02': {
      kind: "atome",
      objet: "Slap tranchant contre bass ronde",
      consigne: "Alterne bass ronde sur le 1 et slap fouette sur 2 & 4 : deux couleurs opposees.",
      critere: "quand on distingue clairement la bass et le slap.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B1-03': {
      kind: "atome",
      objet: "Backbeat regulier sous la basse",
      consigne: "Garde tes slaps 2 & 4 exactement cales pendant que la basse bouge.",
      critere: "quand le backbeat ne bronche pas, quoi que fasse la basse.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B1-04': {
      kind: "atome",
      objet: "Backbeat quand la basse coupe",
      consigne: "Meme quand la basse coupe deux temps, tes slaps 2 & 4 restent a l'heure.",
      critere: "quand tes 2 & 4 retombent justes au retour de la basse.",
      preset: {pattern: "theOne", prog: "vamp1", drop: {on: true, everyN: 4, lenBeats: 2}} },
    'EX-DJ-B1-05': {
      kind: "synthese",
      objet: "Groove backbeat",
      consigne: "Enchaine bass sur 1 + slaps fouettes sur 2 & 4, sur les deux mesures.",
      critere: "quand le backbeat porte le groove sans effort.",
      preset: {pattern: "theOne", prog: "vamp2", drop: {on: false}} },
    'EX-CJ-B2-01': {
      kind: "atome",
      objet: "Garder le 2, retirer le 4",
      consigne: "Garde le slap sur le 2, mais supprime celui du 4 - laisse le trou.",
      critere: "quand l'absence du 4 cree une tension au lieu d'un manque.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B2-02': {
      kind: "atome",
      objet: "Migrer le 4 sur le et",
      consigne: "Redonne le deuxieme slap, mais decale juste apres le 4 (sur le et).",
      critere: "quand le slap deplace tire le groove en avant sans le desequilibrer.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B2-03': {
      kind: "atome",
      objet: "Le deplacement contre la basse",
      consigne: "Cale ton slap deplace dans un silence de la basse, jamais sur sa note.",
      critere: "quand le slap deplace tombe dans le vide de la basse.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-CJ-B2-04': {
      kind: "atome",
      objet: "Alterner backbeat droit / deplace",
      consigne: "Une mesure backbeat droit (2 & 4), une mesure backbeat deplace : alterne sans trou.",
      critere: "quand le passage droit-deplace est fluide, sans accroc de time.",
      preset: {pattern: "syncopeGrave", prog: "vamp2", drop: {on: false}} },
    'EX-CJ-B2-05': {
      kind: "synthese",
      objet: "Groove a backbeat deplace",
      consigne: "Installe le groove avec le backbeat deplace stabilise sur les deux cellules.",
      critere: "quand le deplacement devient le caractere du groove, pas une erreur.",
      preset: {pattern: "syncopeGrave", prog: "vamp2", drop: {on: false}} },
    'EX-DJ-B2-01': {
      kind: "atome",
      objet: "Garder le 2, retirer le 4",
      consigne: "Garde le slap fouette sur le 2, mais supprime celui du 4 - laisse le trou.",
      critere: "quand l'absence du 4 cree une tension au lieu d'un manque.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B2-02': {
      kind: "atome",
      objet: "Migrer le 4 sur le et",
      consigne: "Redonne le deuxieme slap, decale juste apres le 4 (sur le et), poignet fouette.",
      critere: "quand le slap deplace tire le groove en avant sans le desequilibrer.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B2-03': {
      kind: "atome",
      objet: "Le deplacement contre la basse",
      consigne: "Cale ton slap deplace dans un silence de la basse, jamais sur sa note.",
      critere: "quand le slap deplace tombe dans le vide de la basse.",
      preset: {pattern: "syncopeGrave", prog: "vamp1", drop: {on: false}} },
    'EX-DJ-B2-04': {
      kind: "atome",
      objet: "Alterner backbeat droit / deplace",
      consigne: "Une mesure backbeat droit (2 & 4), une mesure deplace : alterne sans trou.",
      critere: "quand le passage droit-deplace est fluide, sans accroc de time.",
      preset: {pattern: "syncopeGrave", prog: "vamp2", drop: {on: false}} },
    'EX-DJ-B2-05': {
      kind: "synthese",
      objet: "Groove a backbeat deplace",
      consigne: "Installe le groove avec le backbeat deplace stabilise sur les deux cellules.",
      critere: "quand le deplacement devient le caractere du groove, pas une erreur.",
      preset: {pattern: "syncopeGrave", prog: "vamp2", drop: {on: false}} },
    'EX-SOCLE-D1-01': {
      kind: "atome",
      objet: "Le ghost sur le e",
      consigne: "Glisse un ghost tres faible sur le e de chaque temps (juste apres le temps).",
      critere: "quand les ghosts du e sont reguliers et presque inaudibles.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-D1-02': {
      kind: "atome",
      objet: "Le ghost du a avant le 2",
      consigne: "Ajoute un ghost sur le a juste avant le 2, comme un elan vers le backbeat.",
      critere: "quand le a pousse naturellement vers le 2 sans le couvrir.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-D1-03': {
      kind: "atome",
      objet: "Le pendule : va-et-vient regulier",
      consigne: "Fais osciller tes ghosts en un balancement regulier, comme un pendule sous la basse.",
      critere: "quand le tapis de ghosts respire a intervalle egal.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-D1-04': {
      kind: "atome",
      objet: "Ghost + accent : contraste dynamique",
      consigne: "Garde les ghosts tres faibles et fais ressortir un seul accent : le contraste fait la poche.",
      critere: "quand l'ecart entre ghost et accent est net et constant.",
      preset: {pattern: "ghostPendule", prog: "vamp1", drop: {on: false}} },
    'EX-SOCLE-D1-05': {
      kind: "synthese",
      objet: "Nappe de ghosts complete",
      consigne: "Tisse le pendule complet (e + a) sur les deux mesures, sous la basse.",
      critere: "quand la nappe de ghosts tient toute seule et donne le groove.",
      preset: {pattern: "ghostPendule", prog: "vamp2", drop: {on: false}} }
  },
  patterns: {
    theOne: { steps: 16, hits: [
      {i: 0, deg: "R", art: "finger", w: 1, lvl: 1},
      {i: 6, deg: "5", art: "ghost", w: 0.5, lvl: 2},
      {i: 8, deg: "R", art: "finger", w: 0.8, lvl: 1},
      {i: 10, deg: "oct", art: "pop", w: 0.4, lvl: 3},
      {i: 14, deg: "5", art: "ghost", w: 0.5, lvl: 2}
    ] },
    syncopeGrave: { steps: 16, hits: [
      {i: 0, deg: "R", art: "finger", w: 1, lvl: 1},
      {i: 6, deg: "R", art: "finger", w: 0.7, lvl: 2},
      {i: 8, deg: "5", art: "ghost", w: 0.5, lvl: 2},
      {i: 11, deg: "R", art: "finger", w: 0.6, lvl: 3},
      {i: 14, deg: "oct", art: "pop", w: 0.5, lvl: 3}
    ] },
    octaves: { steps: 16, hits: [
      {i: 0, deg: "R", art: "finger", w: 1, lvl: 1},
      {i: 4, deg: "oct", art: "finger", w: 0.8, lvl: 2},
      {i: 8, deg: "R", art: "finger", w: 0.9, lvl: 1},
      {i: 12, deg: "oct", art: "finger", w: 0.8, lvl: 2},
      {i: 2, deg: "R", art: "ghost", w: 0.4, lvl: 3},
      {i: 10, deg: "oct", art: "ghost", w: 0.4, lvl: 3}
    ] },
    ghostPendule: { steps: 16, hits: [
      {i: 0, deg: "R", art: "finger", w: 1, lvl: 1},
      {i: 8, deg: "R", art: "finger", w: 0.9, lvl: 1},
      {i: 4, deg: "5", art: "ghost", w: 0.6, lvl: 2},
      {i: 12, deg: "5", art: "ghost", w: 0.6, lvl: 2},
      {i: 2, deg: "R", art: "ghost", w: 0.6, lvl: 3},
      {i: 6, deg: "R", art: "ghost", w: 0.6, lvl: 3},
      {i: 10, deg: "5", art: "ghost", w: 0.6, lvl: 3},
      {i: 14, deg: "5", art: "ghost", w: 0.6, lvl: 3}
    ] }
  },
  progressions: {
    vamp1: { bars: [
      {deg: "I", quality: "7"}
    ] },
    vamp2: { bars: [
      {deg: "I", quality: "7"},
      {deg: "IV", quality: "7"}
    ] },
    dorien: { bars: [
      {deg: "i", quality: "m7"},
      {deg: "IV", quality: "7"}
    ] },
    mixo: { bars: [
      {deg: "I", quality: "7"},
      {deg: "bVII", quality: ""}
    ] },
    blues: { bars: [
      {deg: "I", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "IV", quality: "7"},
      {deg: "IV", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "V", quality: "7"},
      {deg: "IV", quality: "7"},
      {deg: "I", quality: "7"},
      {deg: "I", quality: "7"}
    ] },
    jazzfunk: { bars: [
      {deg: "ii", quality: "m7"},
      {deg: "V", quality: "7"}
    ] }
  }
  };
})();

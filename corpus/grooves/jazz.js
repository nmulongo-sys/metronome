/* ============================================================================
   Grooves « jazz » — bibliothèque de grooves, famille Jazz (2 grooves).
   AJOUT du 17 août 2026, motivé par W16 c : 122 mesures de jazz du corpus
   Fisher s'apparient sur la grille ternaire (12 pas) et n'avaient aucun groove
   de leur musique à se voir proposer — les deux seuls grooves à 12 pas du
   corpus étaient `Soli` (ouest-africain) et `Shuffle blues-rock`.

   Schéma inchangé (spec passe 3 §5.1) : X->2 accent · x->1 frappe · .->0
   silence, grid.length === count, identité de timbre instr + voiceKind routée
   par playPerc, approx/uncertain/isBreak aux mêmes sens. Registre global
   FM_GROOVES : une famille = un fichier, la page assemble.

   Lecture de la grille de 12 : quatre temps de trois croches de triolet.
   Temps 1 = pas 0-1-2 · temps 2 = 3-4-5 · temps 3 = 6-7-8 · temps 4 = 9-10-11.
   Le « et » swingué d'un temps est sa TROISIÈME croche de triolet (2, 5, 8, 11).

   approx:true sur toutes les voix — comme pour les grooves rock : le motif est
   relevé sur une batterie, et rendu ici par substitution de tessiture sur les
   percussions à mains. Le rythme est documenté ; l'instrumentation est une
   adaptation, et c'est ce que le drapeau dit.

   tempo : la fourchette reprise est la RAMPE DE GENRE jazz du socle
   (`00-decisions-actees.md` §3.1, ♩ = 56-144, R4 vérifié sur 173 exemples).
   C'est une plage de travail, pas un tempo d'œuvre — X5. `jam` reste null tant
   que W14 (la sémantique de ce champ) n'est pas tranché : quatre grooves du
   corpus portent un `jam` sous leur propre minimum, deux autres l'ont déjà nul.
   ============================================================================ */
(function () {
  'use strict';
  window.FM_GROOVES = window.FM_GROOVES || {};
  window.FM_GROOVES['jazz'] = [
 {
  "id": "jazz-swing-medium-chabada",
  "family": "jazz",
  "label": "Swing médium (chabada)",
  "origin": "le motif de ride du swing, stabilisé dans le jazz des années 1940 et resté la base de l'accompagnement",
  "context": "La cymbale ride joue les quatre temps plus le « et » swingué des temps 2 et 4 — le fameux « spang-a-lang ». Le charleston se referme sur 2 et 4, et la grosse caisse marque les quatre temps en effleurement (« feathering »), presque inaudible : elle se sent plus qu'elle ne s'entend.",
  "count": 12,
  "family_meter": "tern",
  "tempo": {
   "min": 56,
   "max": 144,
   "jam": null
  },
  "reliability": "moyenne",
  "sources": "- https://jazznightschool.org/pages/basic-4-4-swing-beat-for-drummers (ride « spang-a-lang » = noires + croches swinguées ; charleston sur 2 et 4 ; grosse caisse four-on-the-floor en effleurement, « almost inaudible »)\n- https://percussion.byu.edu/jazz-style (ride = noires + croches swinguées sur le « et » des temps 2 et 4 ; « chick » de charleston sur 2 et 4)\n- fourchette de tempo : rampe de genre jazz du socle, 00-decisions-actees.md §3.1 (♩ = 56-144) — plage de travail, pas tempo d'œuvre (X5)",
  "voices": [
   {
    "id": "jazz-swing-medium-chabada.ride",
    "label": "ride",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,0,1,0,1,1,0,0,1,0,1],
    "uncertain": false,
    "approx": true,
    "description": "les quatre temps, plus le « et » swingué des temps 2 et 4",
    "enterOrder": 1,
    "difficulty": "moyen"
   },
   {
    "id": "jazz-swing-medium-chabada.charleston",
    "label": "charleston (2 et 4)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,2,0,0,0,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "fermeture sur 2 et 4 — l'appui du style",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "jazz-swing-medium-chabada.basse-feutree",
    "label": "basse feutrée",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [1,0,0,1,0,0,1,0,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "description": "les quatre temps en effleurement, jamais accentués",
    "enterOrder": 3,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "jazz-swing-forme-d-entree",
  "family": "jazz",
  "label": "Swing — forme d'entrée (noires au ride)",
  "origin": "la forme de départ décrite par les méthodes avant l'ajout des croches swinguées",
  "context": "Le même appui, sans le « et » : la ride bat les quatre temps, le charleston se referme sur 2 et 4. C'est la forme dont les méthodes partent avant d'ajouter les croches swinguées, et elle suffit à faire tourner un accompagnement.",
  "count": 12,
  "family_meter": "tern",
  "tempo": {
   "min": 56,
   "max": 144,
   "jam": null
  },
  "reliability": "moyenne",
  "sources": "- https://jazznightschool.org/pages/basic-4-4-swing-beat-for-drummers (« the basic pattern starts with a quarter-note pulse on the ride cymbal » ; les croches swinguées s'ajoutent ensuite)\n- fourchette de tempo : rampe de genre jazz du socle, 00-decisions-actees.md §3.1 (♩ = 56-144)",
  "voices": [
   {
    "id": "jazz-swing-forme-d-entree.ride",
    "label": "ride",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,0,1,0,0,1,0,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "description": "les quatre temps, sans croche ajoutée",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "jazz-swing-forme-d-entree.charleston",
    "label": "charleston (2 et 4)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,2,0,0,0,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "fermeture sur 2 et 4",
    "enterOrder": 2,
    "difficulty": "facile"
   }
  ],
  "variations": []
 }
  ];
})();

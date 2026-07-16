/* ============================================================================
   Grooves « rock » — bibliothèque de grooves, famille Rock (5 grooves).
   DONNÉES EXTRAITES VERBATIM de la table GROOVES du build 0.11.0 (R-3b, spec
   R-3 §9.5) — elle-même conversion déterministe des grooves-*.md (passe 3 §5 :
   X->2 accent · x->1 frappe · .->0 silence, grid.length === count, identités
   de timbre instr+voiceKind routées par playPerc, drapeaux approx/uncertain/
   isBreak inchangés). Registre global FM_GROOVES : une famille = un fichier,
   la page assemble (ordre des balises, collision d'identifiant bloquante).
   Preuves : recette-grooves.js (égalité valeur pour valeur contre
   reference-grooves-0.11.0.json + validateur de schéma).
   ============================================================================ */
(function () {
  'use strict';
  window.FM_GROOVES = window.FM_GROOVES || {};
  window.FM_GROOVES['rock'] = [
 {
  "id": "rock-backbeat-rock-de-base-money-beat",
  "family": "rock",
  "label": "Backbeat rock de base (« money beat »)",
  "origin": "le groove fondateur du rock, standardisé dès les années 1950-60",
  "context": "C'est le premier groove enseigné dans quasiment toutes les méthodes de batterie : croches au charleston, caisse claire sur 2 et 4, grosse caisse sur 1 et 3.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 85,
   "max": 100,
   "jam": 85
  },
  "reliability": "moyenne",
  "sources": "- https://dddrums.com/how-to-play-back-in-black-drum-lesson-acdc/ (groove principal : hi-hat croches, kick 1 et 3, snare 2 et 4)",
  "voices": [
   {
    "id": "rock-backbeat-rock-de-base-money-beat.hi-hat",
    "label": "hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "pulsation en croches",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "rock-backbeat-rock-de-base-money-beat.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat 2 et 4",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "rock-backbeat-rock-de-base-money-beat.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ancrage 1 et 3",
    "enterOrder": 1,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "rock-four-on-the-floor-rock-disco-rock",
  "family": "rock",
  "label": "Four-on-the-floor rock / disco-rock",
  "origin": "kick sur chaque temps, adopté par le rock à l'ère disco (fin 70s)",
  "context": "Grosse caisse sur les 4 temps, backbeat maintenu sur 2 et 4 : le beat disco absorbé par le rock.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 100,
   "max": 115,
   "jam": null
  },
  "reliability": "moyenne",
  "sources": "- https://drummagazine.com/lesson-four-on-the-floor-disco/ (pattern complet kick/snare/hi-hat + exemples « Miss You », « Another Brick in the Wall »)",
  "voices": [
   {
    "id": "rock-four-on-the-floor-rock-disco-rock.hi-hat",
    "label": "hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,2,0,1,0,2,0,1,0,2,0,1,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "croches, contretemps marqués",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "rock-four-on-the-floor-rock-disco-rock.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat constant",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "rock-four-on-the-floor-rock-disco-rock.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "pulsation 4 temps",
    "enterOrder": 1,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "rock-when-the-levee-breaks",
  "family": "rock",
  "label": "« When the Levee Breaks »",
  "origin": "groove lourd à feel half-time (John Bonham, Led Zeppelin, 1971)",
  "context": "Le break de batterie le plus samplé du rock, enregistré dans la cage d'escalier de Headley Grange avec deux micros en hauteur (Roland Articles).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 68,
   "max": 78,
   "jam": 68
  },
  "reliability": "moyenne",
  "sources": "- https://www.drumeo.com/beat/when-the-levee-breaks-drum-beat/ (hi-hat croches, kick doux après le 1, ghost notes après 2 et 4)",
  "voices": [
   {
    "id": "rock-when-the-levee-breaks.hi-hat",
    "label": "hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches appuyées",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "rock-when-the-levee-breaks.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat 2 et 4",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "rock-when-the-levee-breaks.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,1,0,0,0,0,0,2,0,0,2,2,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "motif signature",
    "enterOrder": 3,
    "difficulty": "difficile"
   }
  ],
  "variations": []
 },
 {
  "id": "rock-shuffle-blues-rock",
  "family": "rock",
  "label": "Shuffle blues-rock",
  "origin": "la base ternaire du rock, héritée du blues électrique (Texas/Chicago)",
  "context": "Subdivision en triolets dont on ne joue que la 1re et la 3e note au charleston (« jouer une, sauter une, jouer une », Total Drummer), backbeat sur 2 et 4, kick sur 1 et 3.",
  "count": 12,
  "family_meter": "tern",
  "tempo": {
   "min": 90,
   "max": 120,
   "jam": null
  },
  "reliability": "moyenne",
  "sources": "- https://www.totaldrummer.com/blues-shuffle-drum-beat/ (hi-hat 1re et 3e note du triolet, snare 2 et 4, kick 1 et 3)",
  "voices": [
   {
    "id": "rock-shuffle-blues-rock.hi-hat",
    "label": "hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,1,0,1,1,0,1,1,0,1],
    "uncertain": false,
    "approx": true,
    "description": "motif shuffle ternaire",
    "enterOrder": 3,
    "difficulty": "difficile"
   },
   {
    "id": "rock-shuffle-blues-rock.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,2,0,0,0,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat 2 et 4",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "rock-shuffle-blues-rock.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,2,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ancrage 1 et 3",
    "enterOrder": 1,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "rock-stomp-stomp-clap-we-will-rock-you",
  "family": "rock",
  "label": "Stomp-stomp-clap (« We Will Rock You »)",
  "origin": "percussion corporelle de stade (Queen, 1977)",
  "context": "Pas un groove de batterie : deux frappes de pieds + un clap, en boucle, enregistrés par le groupe en overdub sur une estrade de studio avec des delays pour simuler une foule (Wikipédia).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 76,
   "max": 84,
   "jam": 76
  },
  "reliability": "moyenne",
  "sources": "- https://en.wikipedia.org/wiki/We_Will_Rock_You (motif stomp-stomp-clap, enregistrement en overdub avec delays, conception participative, hymne de stade)",
  "voices": [
   {
    "id": "rock-stomp-stomp-clap-we-will-rock-you.stomps",
    "label": "stomps",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,1,0,0,0,0,0,2,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "deux appuis « we will »",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "rock-stomp-stomp-clap-we-will-rock-you.claps",
    "label": "claps",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "réponse claquée",
    "enterOrder": 2,
    "difficulty": "facile"
   }
  ],
  "variations": []
 }
  ];
})();

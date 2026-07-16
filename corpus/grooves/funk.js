/* ============================================================================
   Grooves « funk » — bibliothèque de grooves, famille Funk (6 grooves).
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
  window.FM_GROOVES['funk'] = [
 {
  "id": "funk-funky-drummer",
  "family": "funk",
  "label": "Funky Drummer",
  "origin": "James Brown, batteur Clyde Stubblefield (enregistré le 20 nov. 1969, Cincinnati)",
  "context": "Le break de batterie le plus samplé de l'histoire ; James Brown baptise le titre d'après son batteur pendant la prise.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 96,
   "max": 104,
   "jam": 96
  },
  "reliability": "moyenne",
  "sources": "DrumsTheWord (eBook p. 59 + leçon), Wills Drum Lessons (PDF), MusicRadar, Ethan Hein, Wikipédia, Modern Drummer (transcription Marc Atkinson, existence vérifiée).",
  "voices": [
   {
    "id": "funk-funky-drummer.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "description": "fondation syncopée",
    "enterOrder": 2,
    "difficulty": "moyen"
   },
   {
    "id": "funk-funky-drummer.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,1,0,1,0,1,2,0,0,1],
    "uncertain": false,
    "approx": true,
    "description": "backbeats + ghosts (l'âme du groove)",
    "enterOrder": 3,
    "difficulty": "facile"
   },
   {
    "id": "funk-funky-drummer.charley-f",
    "label": "charley f.",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
    "uncertain": false,
    "approx": true,
    "description": "tapis de doubles-croches",
    "enterOrder": 1,
    "difficulty": "difficile"
   },
   {
    "id": "funk-funky-drummer.charley-o",
    "label": "charley o.",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "respirations sur les « e »",
    "enterOrder": 5,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "funk-cold-sweat",
  "family": "funk",
  "label": "Cold Sweat",
  "origin": "James Brown, batteur Clyde Stubblefield (1967)",
  "context": "Souvent cité comme le morceau fondateur du funk : tout l'orchestre se cale sur la batterie.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 108,
   "max": 118,
   "jam": 112
  },
  "reliability": "moyenne",
  "sources": "DrumsTheWord (eBook p. 39 + leçon), Total Drummer, PDF Escuela Borja Cortés (♩=112), Drumeo (« Cold Sweat, Part 1 » dans le top 10).",
  "voices": [
   {
    "id": "funk-cold-sweat.kick-a",
    "label": "kick A",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "le « one » puis pousse",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "funk-cold-sweat.snare-a",
    "label": "snare A",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,1,0,1,0,0,0,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat 2, ghosts, backbeat déplacé sur &4",
    "enterOrder": 2,
    "difficulty": "moyen"
   },
   {
    "id": "funk-cold-sweat.charley-a",
    "label": "charley A",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches régulières",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "funk-cold-sweat.charl-o-a",
    "label": "charl.o. A",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ouverture avec le kick (&3)",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "funk-cold-sweat.kick-b",
    "label": "kick B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "évite le 1 (suspension)",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "funk-cold-sweat.snare-b",
    "label": "snare B",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,1,0,0,2,0,0,1,0,1,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ghost e1, backbeats 2 et 4 normaux",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "funk-cold-sweat.charley-b",
    "label": "charley B",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches régulières",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "funk-get-up-i-feel-like-being-a-sex-machine",
  "family": "funk",
  "label": "Get Up (I Feel Like Being a) Sex Machine",
  "origin": "James Brown, batteur John « Jabo » Starks (1970)",
  "context": "Le groove hypnotique de Jabo Starks (et non Stubblefield) sous la basse de Bootsy Collins : ouvertures de charley sur les « & » de 1 et 3 menant aux backbeats.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 104,
   "max": 112,
   "jam": 108
  },
  "reliability": "moyenne",
  "sources": "DrumsTheWord (eBook p. 60), Drumeo (« A Drummer's Guide To Funk », qui crédite Starks parmi les batteurs du titre), *The Funkmasters* (Slutsky/Silverman — le titre figure au répertoire James Brown 1960-1973 couvert par la méthode). Batteur vérifié : John « Jabo » Starks.",
  "voices": [
   {
    "id": "funk-get-up-i-feel-like-being-a-sex-machine.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "le « one » + relance &3",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "funk-get-up-i-feel-like-being-a-sex-machine.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,1,1,0,1,0,0,2,0,0,1],
    "uncertain": false,
    "approx": true,
    "description": "backbeats 2/4 + ghosts de liaison",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "funk-get-up-i-feel-like-being-a-sex-machine.charley-f",
    "label": "charley f.",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,0,0,1,0,1,1,1,0,0,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches brisées, resserrées beat 2",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "funk-get-up-i-feel-like-being-a-sex-machine.charley-o",
    "label": "charley o.",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "signature : « & » de 1 et de 3",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "funk-cissy-strut",
  "family": "funk",
  "label": "Cissy Strut",
  "origin": "The Meters, batteur Joseph « Zigaboo » Modeliste (1969)",
  "context": "Instrumental fondateur du funk de La Nouvelle-Orléans, premier album des Meters.",
  "count": 16,
  "family_meter": "tern",
  "tempo": {
   "min": 84,
   "max": 96,
   "jam": 90
  },
  "reliability": "moyenne",
  "sources": "DrumsTheWord (eBook p. 38 + leçon), Drummer Cafe (88 bpm), Francis Drumming Blog.",
  "voices": [
   {
    "id": "funk-cissy-strut.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ponctuation second line",
    "enterOrder": 1,
    "difficulty": "moyen"
   },
   {
    "id": "funk-cissy-strut.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,1,0,0,0,0,0,0,2,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "réponses, doublé final",
    "enterOrder": 2,
    "difficulty": "moyen"
   },
   {
    "id": "funk-cissy-strut.charley",
    "label": "charley",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,1,1,0,0,0,0,2,0,1,2,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "ligne linéaire, ghost sur e3",
    "enterOrder": 3,
    "difficulty": "difficile"
   }
  ],
  "variations": []
 },
 {
  "id": "funk-what-is-hip",
  "family": "funk",
  "label": "What Is Hip?",
  "origin": "Tower of Power, batteur David Garibaldi (INCERTAIN : 1973, non vérifié en source ouverte)",
  "context": "Garibaldi a co-écrit le titre : il « a ajouté de la syncope à un pattern qu'il jouait souvent et suggéré la ligne de basse en doubles-croches » (Wikipédia).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 100,
   "max": 110,
   "jam": 100
  },
  "reliability": "moyenne",
  "sources": "Wikipédia « David Garibaldi (musician) » (consulté), DrumsTheWord eBook p. 167 (consulté, idiome), *Off the Record* (Garibaldi, Alfred — méthode publiée).",
  "voices": [
   {
    "id": "funk-what-is-hip.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "syncope avec la basse",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "funk-what-is-hip.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeats + ghosts (réduits)",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "funk-what-is-hip.charley",
    "label": "charley",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "description": "doubles-croches (2 mains possibles)",
    "enterOrder": 1,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "funk-funk-on-the-one",
  "family": "funk",
  "label": "Funk « on the one »",
  "origin": "groove générique à la James Brown (pattern pédagogique, pas un titre précis)",
  "context": "Squelette commun aux grooves James Brown : accent massif sur le 1 (« the One »), backbeats 2/4, kick de relance sur le « & » de 3.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 90,
   "max": 110,
   "jam": 96
  },
  "reliability": "moyenne",
  "sources": "DrumsTheWord eBook p. 39, 60, 110 (consulté), Drumeo « A Drummer's Guide To Funk » (consulté).",
  "voices": [
   {
    "id": "funk-funk-on-the-one.kick",
    "label": "kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "LE « one » + relance",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "funk-funk-on-the-one.snare",
    "label": "snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeats 2 et 4",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "funk-funk-on-the-one.charley",
    "label": "charley",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches régulières",
    "enterOrder": 3,
    "difficulty": "facile"
   },
   {
    "id": "funk-funk-on-the-one.tambourin",
    "label": "tambourin",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "double le backbeat (optionnel)",
    "enterOrder": 4,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
  ];
})();

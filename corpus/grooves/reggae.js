/* ============================================================================
   Grooves « reggae » — bibliothèque de grooves, famille Reggae (5 grooves).
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
  window.FM_GROOVES['reggae'] = [
 {
  "id": "reggae-one-drop",
  "family": "reggae",
  "label": "One drop",
  "origin": "Jamaïque, fin des années 1960 (Kingston, studios roots)",
  "context": "Pattern signature du roots reggae, popularisé par Carlton Barrett (Bob Marley & The Wailers) ; la paternité est disputée entre Barrett, son frère Aston et Winston Grennan (Wikipedia).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 60,
   "max": 95,
   "jam": 75
  },
  "reliability": "moyenne",
  "sources": "- https://en.wikipedia.org/wiki/One_drop_rhythm",
  "voices": [
   {
    "id": "reggae-one-drop.kick",
    "label": "Kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "l'unique appui, temps 3",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "reggae-one-drop.cross-stick",
    "label": "Cross-stick",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "soudé au kick sur 3",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "reggae-one-drop.hi-hat",
    "label": "Hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,2,0,1,0,2,0,1,0,2,0,1,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "croches, accents en levée",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "reggae-one-drop.skank-perc-aigue",
    "label": "Skank (perc. aiguë)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "contretemps (guitare/clavier)",
    "enterOrder": 2,
    "difficulty": "facile"
   }
  ],
  "variations": []
 },
 {
  "id": "reggae-rockers",
  "family": "reggae",
  "label": "Rockers",
  "origin": "Jamaïque, milieu des années 1970 (Channel One, Sly Dunbar)",
  "context": "Style plus dur et plus dansant que le one drop, pionnié par Sly Dunbar (Sly & Robbie) au studio Channel One.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 75,
   "max": 80,
   "jam": 75
  },
  "reliability": "moyenne",
  "sources": "- https://www.dancehallmag.com/2026/01/27/features/sly-dunbar-ten-essential-songs-bearing-the-reggae-legends-mark.html",
  "voices": [
   {
    "id": "reggae-rockers.kick",
    "label": "Kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ancre les temps 1 et 3",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "reggae-rockers.rimshot-snare",
    "label": "Rimshot/snare",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "backbeat sur 3",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "reggae-rockers.hi-hat",
    "label": "Hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches régulières",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "reggae-rockers.skank-perc-aigue",
    "label": "Skank (perc. aiguë)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "contretemps",
    "enterOrder": 4,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "reggae-steppers",
  "family": "reggae",
  "label": "Steppers",
  "origin": "Jamaïque, seconde moitié des années 1970 (roots militant)",
  "context": "Le « four on the floor » du reggae : kick en noires sur les quatre temps — « solid, driving quarter notes on each beat » (Modern Drummer).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 110,
   "max": 140,
   "jam": 120
  },
  "reliability": "moyenne",
  "sources": "- https://www.moderndrummer.com/article/february-2019-reggae-101-the-steppers-beat/ (extrait public)",
  "voices": [
   {
    "id": "reggae-steppers.kick",
    "label": "Kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "quatre noires, moteur",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "reggae-steppers.cross-stick",
    "label": "Cross-stick",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "ancrage sur 3",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "reggae-steppers.hi-hat",
    "label": "Hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,2,0,1,0,2,0,1,0,2,0,1,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "croches, accents en levée",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "reggae-steppers.skank-perc-aigue",
    "label": "Skank (perc. aiguë)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "contretemps",
    "enterOrder": 4,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "reggae-ska",
  "family": "reggae",
  "label": "Ska",
  "origin": "Jamaïque, 1962 (Kingston, The Skatalites)",
  "context": "Ancêtre uptempo du reggae, né fin 1962 d'un ajustement du jeu de Lloyd Knibb (The Skatalites) — « a slight change in Lloyd Knibb's drum rhythm was the landmark for the birth of ska » (résultat corroboré par la page Ska stroke/Grokipedia via recherche et par Bax Music qui cite Knibb).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 110,
   "max": 135,
   "jam": 120
  },
  "reliability": "moyenne",
  "sources": "- https://studydrums.com/ccrtska.html",
  "voices": [
   {
    "id": "reggae-ska.kick",
    "label": "Kick",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "temps forts 1 et 3",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "reggae-ska.snare-rimshot",
    "label": "Snare (rimshot)",
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
    "id": "reggae-ska.hi-hat",
    "label": "Hi-hat",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "contretemps seulement",
    "enterOrder": 3,
    "difficulty": "difficile"
   }
  ],
  "variations": []
 },
 {
  "id": "reggae-nyabinghi",
  "family": "reggae",
  "label": "Nyabinghi",
  "origin": "Jamaïque, années 1950 (camps rastafari, Count Ossie)",
  "context": "Rythme cérémoniel rastafari en 4/4, « heartbeat » lent joué sur trois tambours à main — idéal pour un jam multi-participants sans batterie.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 70,
   "max": 80,
   "jam": 70
  },
  "reliability": "moyenne",
  "sources": "- https://en.wikipedia.org/wiki/Nyabinghi_rhythm",
  "voices": [
   {
    "id": "reggae-nyabinghi.basse-thunder",
    "label": "Basse « thunder",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "pouls : ouvert sur 1, étouffé sur 3",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "reggae-nyabinghi.funde",
    "label": "Funde",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "gardien régulier",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "reggae-nyabinghi.repeater-kete",
    "label": "Repeater (kete)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "voix soliste, syncopes",
    "enterOrder": 3,
    "difficulty": "difficile"
   }
  ],
  "variations": []
 },
  ];
})();

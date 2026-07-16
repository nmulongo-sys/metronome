/* ============================================================================
   Grooves « hiphop » — bibliothèque de grooves, famille Hip-hop (5 grooves).
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
  window.FM_GROOVES['hiphop'] = [
 {
  "id": "hiphop-1-boom-bap-classique",
  "family": "hiphop",
  "label": "1. Boom bap classique",
  "origin": "type « Impeach the President » (The Honey Drippers, 1973)",
  "context": "Le break d'ouverture d'« Impeach the President » est l'un des plus samplés de l'histoire (Audio Two « Top Billin' », Notorious B.I.G.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 85,
   "max": 95,
   "jam": 90
  },
  "reliability": "élevée",
  "sources": "drum-patterns.com/impeach-the-president/ (grille, 112 BPM) ; ethanhein.com/wp/2010/impeach-the-president/ ; blog.native-instruments.com/drum-patterns/ ; attackmagazine.com/technique/beat-dissected/90s-boom-bap-hip-hop/. **",
  "voices": [
   {
    "id": "hiphop-1-boom-bap-classique.hi-hat-ferme-aigu",
    "label": "hi-hat fermé (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,1,1,0,0,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-1-boom-bap-classique.hi-hat-ouvert-aigu",
    "label": "hi-hat ouvert (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 4,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-1-boom-bap-classique.snare-medium",
    "label": "snare (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-1-boom-bap-classique.kick-grave",
    "label": "kick (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,1,2,0,0,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 3,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "hiphop-2-funky-drummer",
  "family": "hiphop",
  "label": "2. Funky Drummer",
  "origin": "break de Clyde Stubblefield (James Brown, 1969)",
  "context": "Break enregistré à Cincinnati en 1969, samplé par Public Enemy, Run-DMC, N.W.A, LL Cool J, Dr.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 96,
   "max": 100,
   "jam": 96
  },
  "reliability": "élevée",
  "sources": "drumstheword.com (leçon Funky Drummer) ; willsdrumlessons.com — PDF de transcription consulté ; musicradar.com/how-to/how-to-program-a-funky-drummer-style-midi-break-in-your-daw (99 BPM, vélocités) ; ethanhein.com/wp/2023/building-the-funky-drummer-beat/ ; en.wikipedia.org/wiki/Funky_Drummer. **",
  "voices": [
   {
    "id": "hiphop-2-funky-drummer.hi-hat-ferme-aigu",
    "label": "hi-hat fermé (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
    "uncertain": false,
    "approx": true,
    "enterOrder": 3,
    "difficulty": "difficile"
   },
   {
    "id": "hiphop-2-funky-drummer.hi-hat-ouvert-aigu",
    "label": "hi-hat ouvert (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 4,
    "difficulty": "moyen"
   },
   {
    "id": "hiphop-2-funky-drummer.snare-medium",
    "label": "snare (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,1,0,1,0,1,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-2-funky-drummer.kick-grave",
    "label": "kick (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 2,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "hiphop-3-amen-break",
  "family": "hiphop",
  "label": "3. Amen break",
  "origin": "« Amen, Brother » (The Winstons, G.C. Coleman, 1969)",
  "context": "Break de 4 mesures (~6–7 s) à 1:26 d'« Amen, Brother », parmi les enregistrements les plus samplés de l'histoire ; en hip-hop : N.W.A « Straight Outta Compton », Salt-N-Pepa « I Desire », Mantronix « King of the Beats » (Wikipedia).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 120,
   "max": 136,
   "jam": 120
  },
  "reliability": "élevée",
  "sources": "en.wikipedia.org/wiki/Amen_break (structure, 136 BPM, usages hip-hop) ; drum-patterns.com/amen-break/ (grille pas à pas) ; drumstheword.com (leçon Amen Break) ; audiolabs-erlangen.de (Reverse Engineering the Amen Break, ≈140 BPM). **",
  "voices": [
   {
    "id": "hiphop-3-amen-break.ride-charley-aigu",
    "label": "ride/charley (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-3-amen-break.snare-medium",
    "label": "snare (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,1],
    "uncertain": false,
    "approx": true,
    "enterOrder": 3,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-3-amen-break.kick-grave",
    "label": "kick (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 2,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
 {
  "id": "hiphop-4-trap",
  "family": "hiphop",
  "label": "4. Trap",
  "origin": "kick 808 syncopé, snare sur le 3, hats en doubles-croches",
  "context": "Style dominant des années 2010 (Lex Luger, Metro Boomin cités comme références par eMastered).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 130,
   "max": 160,
   "jam": 140
  },
  "reliability": "élevée",
  "sources": "studiobrootle.com/trap-drum-patterns/ ; emastered.com/blog/trap-drum-patterns ; kickdrum.io/patterns/808-trap (140 BPM, kick 1 + « et » de 3). **",
  "voices": [
   {
    "id": "hiphop-4-trap.a-hi-hat-ferme-aigu",
    "label": "A hi-hat fermé (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "hiphop-4-trap.a-hi-hat-ouvert-aigu",
    "label": "A hi-hat ouvert (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 4,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-4-trap.a-snare-clap-medium",
    "label": "A snare/clap (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-4-trap.a-kick-808-grave",
    "label": "A kick 808 (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 2,
    "difficulty": "moyen"
   },
   {
    "id": "hiphop-4-trap.b-hi-hat-ferme-aigu",
    "label": "B hi-hat fermé (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "hiphop-4-trap.b-hi-hat-ouvert-aigu",
    "label": "B hi-hat ouvert (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "hiphop-4-trap.b-snare-clap-medium",
    "label": "B snare/clap (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "hiphop-4-trap.b-kick-808-grave",
    "label": "B kick 808 (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,0,0,1,0,0,1,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "hiphop-5-west-coast-g-funk",
  "family": "hiphop",
  "label": "5. West Coast / G-funk",
  "origin": "le « gangsta boogie » (années 90)",
  "context": "Sous-genre californien (Dr.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 95,
   "max": 105,
   "jam": 95
  },
  "reliability": "élevée",
  "sources": "attackmagazine.com/technique/beat-dissected/west-coast-hip-hop/ (grille, 95–105 BPM, swing 50 %) ; openmusic.academy/docs/GL9DzDbUJtRjSCrPpunKXp (style, shaker, exemples). **",
  "voices": [
   {
    "id": "hiphop-5-west-coast-g-funk.shaker-aigu",
    "label": "shaker (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-5-west-coast-g-funk.hi-hat-ouvert-aigu",
    "label": "hi-hat ouvert (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 4,
    "difficulty": "moyen"
   },
   {
    "id": "hiphop-5-west-coast-g-funk.hi-hat-ferme-aigu",
    "label": "hi-hat fermé (aigu)",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "hiphop-5-west-coast-g-funk.clap-snare-medium",
    "label": "clap/snare (médium)",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "hiphop-5-west-coast-g-funk.kick-grave",
    "label": "kick (grave)",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "enterOrder": 3,
    "difficulty": "moyen"
   }
  ],
  "variations": []
 },
  ];
})();

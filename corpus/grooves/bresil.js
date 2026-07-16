/* ============================================================================
   Grooves « bresil » — bibliothèque de grooves, famille Brésil (5 grooves).
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
  window.FM_GROOVES['bresil'] = [
 {
  "id": "bresil-samba-batucada",
  "family": "bresil",
  "label": "Samba Batucada",
  "origin": "Rio de Janeiro, Brésil",
  "context": "moteur polyrythmique des escolas de samba au Carnaval de Rio.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 120,
   "max": 145,
   "jam": 105
  },
  "reliability": "élevée",
  "sources": "Ed Uribe *The Essence of Brazilian Percussion & Drum Set* ; Duduka Da Fonseca *Brazilian",
  "voices": [
   {
    "id": "bresil-samba-batucada.surdo-de-primeira",
    "label": "Surdo de primeira",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "description": "fondation, temps 2",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "bresil-samba-batucada.surdo-de-segunda",
    "label": "Surdo de segunda",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "description": "réponse, temps 1",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "bresil-samba-batucada.caixa",
    "label": "Caixa",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [1,0,1,2,1,0,1,2,1,0,1,2,1,0,1,2],
    "uncertain": false,
    "approx": true,
    "description": "tapis double-croches",
    "enterOrder": 4,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-samba-batucada.tamborim",
    "label": "Tamborim",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [2,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "timeline (teleco-teco)",
    "enterOrder": 6,
    "difficulty": "difficile"
   },
   {
    "id": "bresil-samba-batucada.agogo",
    "label": "Agogô",
    "instr": "agogo",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
    "uncertain": false,
    "description": "appui métallique",
    "enterOrder": 5,
    "difficulty": "facile"
   },
   {
    "id": "bresil-samba-batucada.ganza-chocalho",
    "label": "Ganzá/chocalho",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "description": "flux continu",
    "enterOrder": 3,
    "difficulty": "facile"
   }
  ],
  "variations": [
   {
    "id": "bresil-samba-batucada.tamborim-carreteiro",
    "label": "Tamborim « carreteiro",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-samba-batucada.caixa-em-cima-mocidade",
    "label": "Caixa « em cima » Mocidade",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [2,0,0,1,0,0,2,0,0,0,1,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-samba-batucada.surdo-3-cortador",
    "label": "Surdo 3 / cortador",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "medium",
    "grid": [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
    "uncertain": false,
    "isBreak": false
   }
  ]
 },
 {
  "id": "bresil-maracatu-nacao-baque-virado",
  "family": "bresil",
  "label": "Maracatu Nação (baque virado)",
  "origin": "Recife / Olinda, Pernambuco",
  "context": "percussion des cortèges de couronnement du Rei e Rainha do Congo, aujourd'hui portée par les nations de maracatu (Estrela Brilhante, Leão Coroado).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 95,
   "max": 115,
   "jam": 85
  },
  "reliability": "élevée",
  "sources": "*Massa: Brazilian Music & Culture* podcast (ép. « Maracatu de Baque Virado ») ; page Wikipédia « Maracatu Nação » ; blog Brazilian Percussion (« Maracatu »). Instrumentation (alfaia/gonguê/caixa/agbê/mineiro) très standardisée ; les patterns d'alfaia varient sensiblement d'une nation à l'autre. INCERTAIN : la timeline exacte du gonguê connaît des variantes selon les nations ; celle donnée ici est ",
  "voices": [
   {
    "id": "bresil-maracatu-nacao-baque-virado.gongue",
    "label": "Gonguê",
    "instr": "dunduns",
    "voiceKind": "cloche",
    "role": "aigu",
    "grid": [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "timeline de cloche",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.alfaia-marcante",
    "label": "Alfaia marcante",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "fondation, temps forts",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.alfaia-meio",
    "label": "Alfaia meio",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "medium",
    "grid": [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "remplissage syncopé",
    "enterOrder": 6,
    "difficulty": "difficile"
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.caixa-tarol",
    "label": "Caixa/tarol",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "description": "roulé continu (buzz)",
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.agbe-xequere",
    "label": "Agbê/xequerê",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "bruit blanc, texture",
    "enterOrder": 3,
    "difficulty": "facile"
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.mineiro-ganza",
    "label": "Mineiro/ganzá",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "description": "flux métallique continu",
    "enterOrder": 4,
    "difficulty": "facile"
   }
  ],
  "variations": [
   {
    "id": "bresil-maracatu-nacao-baque-virado.alfaia-marcante-debutant",
    "label": "Alfaia marcante « débutant",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.alfaia-meio-resposta",
    "label": "Alfaia meio « resposta",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "medium",
    "grid": [0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0],
    "uncertain": false,
    "approx": true,
    "isBreak": true
   },
   {
    "id": "bresil-maracatu-nacao-baque-virado.virada-d-ensemble",
    "label": "Virada d'ensemble",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0],
    "uncertain": false,
    "approx": true,
    "isBreak": true
   }
  ]
 },
 {
  "id": "bresil-baiao",
  "family": "bresil",
  "label": "Baião",
  "origin": "Nordeste (sertão), Brésil",
  "context": "rythme rural du Nordeste popularisé nationalement par Luiz Gonzaga dans les années 1940-50, socle du forró pé-de-serra.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 100,
   "max": 130,
   "jam": 95
  },
  "reliability": "élevée",
  "sources": "Larry Crook *Brazilian Music: Northeastern Traditions and the Heartbeat of a Modern Nation* (et travaux sur la zabumba de Caruaru — technique mailloche/peau grave + bâton/peau aiguë, triangle à ~45° en croches) ; page Wikipédia « Baião (music) » ; Encyclopedia.com « Baião ». Le couple zabumba/triangle est très standardisé ; le placement précis du contre-temps aigu varie selon les joueurs. INCERTAI",
  "voices": [
   {
    "id": "bresil-baiao.zabumba-grave",
    "label": "Zabumba grave",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "accent mailloche, boum",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "bresil-baiao.zabumba-aigu",
    "label": "Zabumba aigu",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0],
    "uncertain": false,
    "approx": true,
    "description": "bâton étouffé, contre",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-baiao.triangle-ouvert",
    "label": "Triangle ouvert",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    "uncertain": false,
    "approx": true,
    "description": "accents résonnants",
    "enterOrder": 4,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-baiao.triangle-ferme",
    "label": "Triangle fermé",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0],
    "uncertain": false,
    "approx": true,
    "description": "croches étouffées",
    "enterOrder": 2,
    "difficulty": "facile"
   }
  ],
  "variations": [
   {
    "id": "bresil-baiao.zabumba-grave-xote",
    "label": "Zabumba grave « xote",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0],
    "uncertain": true,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-baiao.zabumba-grave-debutant",
    "label": "Zabumba grave débutant",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-baiao.triangle-galope",
    "label": "Triangle « galopé",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   }
  ]
 },
 {
  "id": "bresil-ijexa-afoxe",
  "family": "bresil",
  "label": "Ijexá / Afoxé",
  "origin": "Salvador, Bahia (candomblé ketu, afoxé Filhos de Gandhy)",
  "context": "rythme sacré du candomblé nation ketu, sorti du terreiro par les afoxés du carnaval de Salvador (Filhos de Gandhy, fondé 1949).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 90,
   "max": 110,
   "jam": 85
  },
  "reliability": "élevée",
  "sources": "Pulsewave « Rhythm Tip – Afoxé » (agogô : quatre coups aigus, un grave, trois aigus, un grave — le grave renforce un accent principal des tambours ; tierce entre les cloches) ; page Wikipédia « Ijexá » (agogô = timeline/clave asymétrique, ensemble Rum/Rumpi/Lê + agbê + caxixi, syncope sur temps faibles) ; partition Carl Dixon *Ijexa Rhythms* (2020, agogô + Lê/Rumpi/Rum + tamborim « Bahia » + surdo",
  "voices": [
   {
    "id": "bresil-ijexa-afoxe.agogo-grave",
    "label": "Agogô grave",
    "instr": "agogo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "description": "cloche basse, accents forts",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "bresil-ijexa-afoxe.agogo-aigu",
    "label": "Agogô aigu",
    "instr": "agogo",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,2,0,0,0,2,0,2,0,0,0,0,0,2,0],
    "uncertain": false,
    "description": "cloche haute, syncope",
    "enterOrder": 2,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-ijexa-afoxe.xequere-agbe",
    "label": "Xequerê/agbê",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "appui, souligne l'agogô",
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-ijexa-afoxe.rum",
    "label": "Rum",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "medium",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "description": "conversation, temps 2",
    "enterOrder": 6,
    "difficulty": "difficile"
   },
   {
    "id": "bresil-ijexa-afoxe.rumpi-le",
    "label": "Rumpi/Lê",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "medium",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": false,
    "approx": true,
    "description": "pouls régulier",
    "enterOrder": 4,
    "difficulty": "facile"
   },
   {
    "id": "bresil-ijexa-afoxe.ganza-caxixi",
    "label": "Ganzá/caxixi",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    "uncertain": false,
    "approx": true,
    "description": "flux continu",
    "enterOrder": 3,
    "difficulty": "facile"
   }
  ],
  "variations": [
   {
    "id": "bresil-ijexa-afoxe.agogo-debutant-1-ligne",
    "label": "Agogô « débutant » 1 ligne",
    "instr": "agogo",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
    "uncertain": false,
    "isBreak": false
   },
   {
    "id": "bresil-ijexa-afoxe.xequere-resposta",
    "label": "Xequerê « resposta",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "isBreak": true
   },
   {
    "id": "bresil-ijexa-afoxe.rum-dobrado",
    "label": "Rum « dobrado",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
    "uncertain": false,
    "approx": true,
    "isBreak": true
   }
  ]
 },
 {
  "id": "bresil-samba-reggae",
  "family": "bresil",
  "label": "Samba-Reggae",
  "origin": "Salvador, Bahia (blocos afro : Olodum, Ilê Aiyê, Timbalada)",
  "context": "créé dans les blocos afro de Salvador (le terme apparaît en 1986 avec Olodum), il fusionne la batucada de rue et le backbeat du reggae.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 90,
   "max": 120,
   "jam": 90
  },
  "reliability": "élevée",
  "sources": "Pulsewave « Rhythm Tip – Samba Reggae » ; page Wikipédia « Samba reggae » (surdos en 4-5 voix imbriquées, caixas/repiques en contretemps, tempo medium, feel reggae) ; blog Brazilian Percussion (« Samba reggae », score à 5 voix de surdo : fundo 1, fundo 2, martelo, virada 1/2 + caixa + repinique). La répartition des surdos est très standardisée ; le motif de caixa et les paradas varient selon les b",
  "voices": [
   {
    "id": "bresil-samba-reggae.surdo-1-fundo",
    "label": "Surdo 1 « fundo",
    "instr": "surdo",
    "voiceKind": "grave",
    "role": "basse",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": false,
    "description": "pouls grave, temps 2/4",
    "enterOrder": 1,
    "difficulty": "facile"
   },
   {
    "id": "bresil-samba-reggae.surdo-2-fundo",
    "label": "Surdo 2 « fundo",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": false,
    "description": "réponse, temps 1/3",
    "enterOrder": 2,
    "difficulty": "facile"
   },
   {
    "id": "bresil-samba-reggae.surdo-3-dobra",
    "label": "Surdo 3 « dobra",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "medium",
    "grid": [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],
    "uncertain": false,
    "description": "remplissage marqué",
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-samba-reggae.caixa",
    "label": "Caixa",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
    "uncertain": false,
    "approx": true,
    "description": "tapis double-croches",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "bresil-samba-reggae.repique",
    "label": "Repique",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [2,0,0,2,0,0,2,0,2,0,0,2,0,0,2,0],
    "uncertain": false,
    "approx": true,
    "description": "appels/paradas, accent",
    "enterOrder": 6,
    "difficulty": "difficile"
   },
   {
    "id": "bresil-samba-reggae.tamborim",
    "label": "Tamborim",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "medium",
    "grid": [2,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0],
    "uncertain": false,
    "approx": true,
    "description": "timeline « teleco »",
    "enterOrder": 4,
    "difficulty": "moyen"
   }
  ],
  "variations": [
   {
    "id": "bresil-samba-reggae.caixa-skank-debutant",
    "label": "Caixa « skank » débutant",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": false,
    "approx": true,
    "isBreak": false
   },
   {
    "id": "bresil-samba-reggae.surdo-3-virado",
    "label": "Surdo 3 « virado",
    "instr": "surdo",
    "voiceKind": "marcante",
    "role": "medium",
    "grid": [0,0,2,0,0,2,0,0,0,0,2,0,0,2,0,0],
    "uncertain": false,
    "isBreak": true
   },
   {
    "id": "bresil-samba-reggae.repique-chamada",
    "label": "Repique « chamada",
    "instr": "cajon",
    "voiceKind": "aigu",
    "role": "aigu",
    "grid": [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0],
    "uncertain": false,
    "approx": true,
    "isBreak": true
   }
  ]
 },
  ];
})();

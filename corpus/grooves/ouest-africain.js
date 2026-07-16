/* ============================================================================
   Grooves « ouest-africain » — bibliothèque de grooves, famille Ouest-africain (5 grooves).
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
  window.FM_GROOVES['ouest-africain'] = [
 {
  "id": "ouest-africain-kuku",
  "family": "ouest-africain",
  "label": "Kuku",
  "origin": "Guinée forestière / région de Beyla (aire malinké, aussi jouée en Côte d'Ivoire)",
  "context": "Rythme de fête très répandu, souvent le premier enseigné aux débutants ; danse de femmes en cercle, à l'origine liée au retour de la pêche (tontinkan, embodiedrhythm).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 100,
   "max": 160,
   "jam": 110
  },
  "reliability": "faible",
  "sources": "tontinkan (contexte), embodiedrhythm (mètre binaire, structure 2+3, tempo), WAP-pages Kuku (existence de la transcription complète), djemberhythms/Oak National (description de l'accompagnement). **",
  "voices": [
   {
    "id": "ouest-africain-kuku.kenkeni-pk",
    "label": "kenkeni",
    "instr": "dunduns",
    "voiceKind": "kenkeni",
    "role": "basse",
    "grid": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    "uncertain": true,
    "description": "pouls régulier (croches)",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kuku.sangban-pk",
    "label": "sangban",
    "instr": "dunduns",
    "voiceKind": "sangban",
    "role": "medium",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": true,
    "description": "chant de l'ensemble",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kuku.dununba-pk",
    "label": "dununba",
    "instr": "dunduns",
    "voiceKind": "dundunba",
    "role": "basse",
    "grid": [0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0],
    "uncertain": true,
    "description": "basse syncopée, peu d'appuis",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kuku.djembe-b",
    "label": "djembé B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": true,
    "description": "ancre sur les temps 1 et 3",
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "ouest-africain-kuku.djembe-t",
    "label": "djembé T",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],
    "uncertain": true,
    "description": "double tonique en levée",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kuku.djembe-s",
    "label": "djembé S",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0],
    "uncertain": true,
    "description": "claqué en contretemps",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "ouest-africain-djole-djolo-yole",
  "family": "ouest-africain",
  "label": "Djolé (Djolo / Yolé)",
  "origin": "peuple Temné, Sierra Leone ; popularisé en Guinée",
  "context": "Rythme de danse à masque (le masque représente une femme, porté par un homme), joué lors de grandes fêtes de village : récolte, fin du Ramadan, mariage (tontinkan, Wikipédia).",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": null,
   "max": null,
   "jam": 120
  },
  "reliability": "faible",
  "sources": "Wikipédia « Djolé » (origine Temné, sikko, mètre), tontinkan (contexte), recherche djembeloops/Malcolm Smith (rôles, 4/4, >120 bpm), Scribd « Djole Notation ». **",
  "voices": [
   {
    "id": "ouest-africain-djole-djolo-yole.kenkeni-pk",
    "label": "kenkeni",
    "instr": "dunduns",
    "voiceKind": "kenkeni",
    "role": "basse",
    "grid": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    "uncertain": true,
    "description": "ponctuation, souvent tons fermés",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-djole-djolo-yole.sangban-pk",
    "label": "sangban",
    "instr": "dunduns",
    "voiceKind": "sangban",
    "role": "medium",
    "grid": [1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0],
    "uncertain": true,
    "description": "motif ouvert/fermé signature",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-djole-djolo-yole.dununba-pk",
    "label": "dununba",
    "instr": "dunduns",
    "voiceKind": "dundunba",
    "role": "basse",
    "grid": [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
    "uncertain": true,
    "description": "appuis forts sur 1 et 3",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-djole-djolo-yole.djembe-b",
    "label": "djembé B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,2,0,0,0,0,2,0,0,2,0,0,0,0],
    "uncertain": true,
    "description": "phrase de basse dansante",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-djole-djolo-yole.djembe-t",
    "label": "djembé T",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0],
    "uncertain": true,
    "description": "toniques de réponse",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-djole-djolo-yole.djembe-s",
    "label": "djembé S",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": true,
    "description": "claqués de remplissage",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "ouest-africain-kassa",
  "family": "ouest-africain",
  "label": "Kassa",
  "origin": "Malinké de Haute-Guinée (nord-est), rythme de récolte",
  "context": "« Kassa » = grenier ; rythme de travail joué aux champs pendant la moisson pour soutenir les moissonneurs, clôturé par la fête *Kassalodon* (tontinkan).",
  "count": 16,
  "family_meter": "tern",
  "tempo": {
   "min": 110,
   "max": 140,
   "jam": 120
  },
  "reliability": "faible",
  "sources": "tontinkan (origine, contexte, Kassa Soro), recherche djemberhythms (parenté Soli, feel du sangban binaire/ternaire), WAP-pages Kassa (existence transcription). **",
  "voices": [
   {
    "id": "ouest-africain-kassa.kenkeni-pk",
    "label": "kenkeni",
    "instr": "dunduns",
    "voiceKind": "kenkeni",
    "role": "basse",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": true,
    "description": "contretemps régulier",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kassa.sangban-pk",
    "label": "sangban",
    "instr": "dunduns",
    "voiceKind": "sangban",
    "role": "medium",
    "grid": [1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0],
    "uncertain": true,
    "description": "voix maîtresse (feel mobile)",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kassa.dununba-pk",
    "label": "dununba",
    "instr": "dunduns",
    "voiceKind": "dundunba",
    "role": "basse",
    "grid": [0,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0],
    "uncertain": true,
    "description": "ponctuation grave",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kassa.djembe-b",
    "label": "djembé B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
    "uncertain": true,
    "description": "pouls de basse sur les temps",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kassa.djembe-t",
    "label": "djembé T",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1],
    "uncertain": true,
    "description": "tissu de toniques",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-kassa.djembe-s",
    "label": "djembé S",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
    "uncertain": true,
    "description": "claqués d'appui",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee",
  "family": "ouest-africain",
  "label": "Madan (Maraka fôli / Djagbé en Guinée)",
  "origin": "Maninka du Manden, sud de Bamako (Mali)",
  "context": "Appelé **Madan au Mali**, **Djagbé en Guinée**, **Djagba dans la région de Kouroussa** ; rythme malinké de **Haute-Guinée (région de Siguiri/Kouroussa, aire du Wassolon)**, popularisé par l'album *Wassolon* de Mamady Keïta.",
  "count": 16,
  "family_meter": "bin",
  "tempo": {
   "min": 120,
   "max": 150,
   "jam": 125
  },
  "reliability": "faible",
  "sources": "dimensionsinrhythm (« The Proximate Three in Practice », analyse d'après Billmeier & Keïta 2004 : 4/4, Haute-Guinée/Siguiri, tresillo djembé, quintillo cloches, sangban cascara), tontinkan « Djagbe » (origine malinké, Tabaski, noms régionaux), drummedup (Madan/Djagbé/Tabaski), recherche « Wassolon » de Mamady Keïta (enregistrement de référence). **",
  "voices": [
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.kenkeni-cl",
    "label": "kenkeni",
    "instr": "dunduns",
    "voiceKind": "kenkeni",
    "role": "aigu",
    "grid": [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0],
    "uncertain": true,
    "description": "cloche « quintillo »",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.sangban-cl",
    "label": "sangban",
    "instr": "dunduns",
    "voiceKind": "sangban",
    "role": "aigu",
    "grid": [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
    "uncertain": true,
    "description": "cloche type cascara/palitos",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.dununba-cl",
    "label": "dununba",
    "instr": "dunduns",
    "voiceKind": "dundunba",
    "role": "aigu",
    "grid": [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0],
    "uncertain": true,
    "description": "cloche « quintillo »",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.djembe-b",
    "label": "djembé B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0],
    "uncertain": true,
    "description": "1er accompt. : tresillo (3-3-2)",
    "enterOrder": 4,
    "difficulty": "moyen"
   },
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.djembe-t",
    "label": "djembé T",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0],
    "uncertain": true,
    "description": "toniques de réponse",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-madan-maraka-foli-djagbe-en-guinee.djembe-s",
    "label": "djembé S",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,2,0,0,2,0,0,0,0,0,2,0,0,2,0],
    "uncertain": true,
    "description": "claqués sur le tresillo",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
 {
  "id": "ouest-africain-soli-soli-lent",
  "family": "ouest-africain",
  "label": "Soli (Soli lent)",
  "origin": "Malinké de Guinée, rythme d'initiation",
  "context": "Rythme d'**initiation/circoncision** des garçons et des filles ; malinké, joué dans toute la Guinée (tontinkan, recherche).",
  "count": 12,
  "family_meter": "tern",
  "tempo": {
   "min": 90,
   "max": 120,
   "jam": 100
  },
  "reliability": "faible",
  "sources": "davekobrenski (mètre 12/8, rôles sangban/dununba/kenkeni), tontinkan (origine initiation, Soli lent/rapide/Manian), recherche djemberhythms (parenté Kassa), WAP-pages Soli (existence transcription), Scribd « Soli Lent » / « Soli Rapide ». **",
  "voices": [
   {
    "id": "ouest-africain-soli-soli-lent.kenkeni-pk",
    "label": "kenkeni",
    "instr": "dunduns",
    "voiceKind": "kenkeni",
    "role": "basse",
    "grid": [0,0,1,0,0,0,1,0,0,0,1,0],
    "uncertain": true,
    "description": "contretemps ternaire (« off-beat »)",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-soli-soli-lent.sangban-pk",
    "label": "sangban",
    "instr": "dunduns",
    "voiceKind": "sangban",
    "role": "medium",
    "grid": [1,0,0,1,0,0,1,0,1,0,0,0],
    "uncertain": true,
    "description": "motif renforçant le 3-contre-4",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-soli-soli-lent.dununba-pk",
    "label": "dununba",
    "instr": "dunduns",
    "voiceKind": "dundunba",
    "role": "basse",
    "grid": [0,0,0,2,0,0,0,0,0,2,0,0],
    "uncertain": true,
    "description": "dialogue avec le sangban",
    "enterOrder": null,
    "difficulty": ""
   },
   {
    "id": "ouest-africain-soli-soli-lent.djembe-b",
    "label": "djembé B",
    "instr": "djembe",
    "voiceKind": "basse",
    "role": "basse",
    "grid": [2,0,0,1,0,0,2,0,0,1,0,0],
    "uncertain": true,
    "description": "basse ternaire",
    "enterOrder": 3,
    "difficulty": "moyen"
   },
   {
    "id": "ouest-africain-soli-soli-lent.djembe-t",
    "label": "djembé T",
    "instr": "djembe",
    "voiceKind": "tone",
    "role": "medium",
    "grid": [1,0,1,1,0,1,1,0,1,1,0,1],
    "uncertain": true,
    "description": "accompagnement 12/8 « passe-temps »",
    "enterOrder": 5,
    "difficulty": "moyen"
   },
   {
    "id": "ouest-africain-soli-soli-lent.djembe-s",
    "label": "djembé S",
    "instr": "djembe",
    "voiceKind": "slap",
    "role": "aigu",
    "grid": [0,0,2,0,0,0,0,0,2,0,0,0],
    "uncertain": true,
    "description": "claqués d'appui",
    "enterOrder": null,
    "difficulty": ""
   }
  ],
  "variations": []
 },
  ];
})();

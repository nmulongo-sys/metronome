/* ============================================================================
   Coquille partagée — fm-equipe.js (R-6). Codec de « config d'équipe » :
   pratiquer (Team Spirit) ENCODE la répartition courante, equipe.html la DÉCODE.
   Fichier de COQUILLE, pas de moteur (hors md5 moteur == 0.10.0). Pur : aucune
   dépendance DOM, aucun réseau. Chargé par pratiquer.html ET equipe.html.

   Contrat de format (v1) — window.fmEquipe.VER === 1 :
     config = {
       v:       1,
       titre:   "Nom du groove" (optionnel, libellé),
       tempo:   92,                 // BPM
       steps:   16,                 // pas par cycle (4|8|12|16)
       swing:   50,                 // % (optionnel, défaut 50)
       joueurs: 3,                  // N participants
       backing: true,               // les lignes non tenues sonnent (app) ou non
       voix: [                      // une entrée par voix du groove
         { k:"grave", instr:"cajon", g:[2,0,0,…], j:1 },  // k=voiceKind, g=grille, j=numéro de joueur (0 = backing/personne)
         …
       ]
     }
   La grille g[] porte des valeurs 0 (silence) / 1 (frappe) / 2 (accent), comme le
   champ demo du corpus et percGrids côté moteur. « j » relie chaque voix à un
   joueur (1..N) ; 0 = voix laissée au backing (personne ne la tient).
   ============================================================================ */
(function () {
  var VER = 1;

  /* base64url d'une chaîne UTF-8 (robuste en URL/hash ; symétrique enc/dec).
     btoa/atob opèrent sur du latin1 → on encode l'UTF-8 d'abord. Présents en
     navigateur ET sous jsdom (recettes). */
  function b64urlEnc(str) {
    var b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDec(s) {
    var b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
  }

  /* encode(config) -> chaîne pour le hash d'URL (sans le préfixe). */
  function encode(config) {
    return b64urlEnc(JSON.stringify(config));
  }

  /* decode(chaîne) -> config, ou null si illisible / version inconnue.
     Tolère une chaîne préfixée « c= » ou un hash complet « #c=… ». */
  function decode(s) {
    if (s == null) return null;
    s = String(s);
    var m = s.match(/(?:^|[#&?])c=([^&]+)/);
    if (m) s = m[1];
    else s = s.replace(/^#/, '');
    try {
      var o = JSON.parse(b64urlDec(s));
      if (!o || typeof o !== 'object') return null;
      if (o.v != null && o.v !== VER) return null;   // version future non gérée
      if (!Array.isArray(o.voix)) return null;
      return o;
    } catch (e) { return null; }
  }

  /* Construit le fragment d'URL complet à ouvrir : « equipe.html#c=… ». */
  function href(config, base) {
    return (base || 'equipe.html') + '#c=' + encode(config);
  }

  /* Une voix est-elle audible pour le joueur donné ?
     - voix tenue par CE joueur : toujours audible ;
     - voix d'un AUTRE joueur (ou du backing, j=0) : audible seulement si backing on.
     playerNum = 0 signifie « écoute tout » (mode chef / aperçu). */
  function audibleForPlayer(voix, config, playerNum) {
    if (!voix) return false;
    if (!playerNum) return true;                 // 0 = tout entendre
    if (voix.j === playerNum) return true;       // ma ligne
    return !!(config && config.backing);         // les autres : selon le backing
  }

  /* Liste des voiceKinds tenues par un joueur (pour le rendu « mon pupitre »). */
  function voicesOfPlayer(config, playerNum) {
    if (!config || !Array.isArray(config.voix)) return [];
    return config.voix.filter(function (v) { return v.j === playerNum; });
  }

  window.fmEquipe = {
    VER: VER,
    encode: encode,
    decode: decode,
    href: href,
    audibleForPlayer: audibleForPlayer,
    voicesOfPlayer: voicesOfPlayer
  };
})();

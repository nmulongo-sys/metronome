/* recette-equipe.js — R-6 : equipe.html (la « salle de concert »). Headless jsdom,
   mêmes stubs que les suites P-* et apprendre. Vérifie (spec R-6) :
     A. chargement propre + BUILD 0.20.0 + stubs au strict contrat moteur ;
     B. contrat moteur : hooks + globals neutres, le moteur démarre ;
     C. codec fm-equipe (coquille/fm-equipe.js) : encode/decode symétrique,
        lecture d'un hash, audibilité par joueur ;
     D. charger une config → percGrids peuplé, joueurs rendus, résumé ;
     E. « mon pupitre » : tsMuted isole MA ligne (backing on/off, chef=tout) ;
     F. le chef : décompte de départ puis start ;
     G. partage : le lien reproduit la config ;
     H. mode online MOCKÉ : le chef diffuse la config, le suiveur applique ;
     I. i18n strict : symétrie EN↔PT + chaque chaîne visible/attr couverte ;
     J. second DOM booté par le hash (#c=…) : la config s'applique au chargement.
   Usage : node recette-equipe.js [chemin/equipe.html]  (défaut ./equipe.html) */
'use strict';
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'equipe.html');
const html = require('./recette-harnais').chargeHtml(FILE);

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };

function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}

// ---- mock Supabase : auth minimal (pour fm-compte) + Realtime broadcast (pour le online) ----
const SB = { sent: [], chans: [] };
function makeChannel(name) {
  const handlers = [];
  const ch = {
    name,
    on(type, filter, cb) { handlers.push({ type, filter, cb }); return ch; },
    subscribe(cb) { if (cb) cb('SUBSCRIBED'); return ch; },
    send(msg) { SB.sent.push(msg); return Promise.resolve('ok'); },
    _emit(payload) { handlers.forEach(h => h.cb(payload)); }   // aide de test : simule une réception
  };
  SB.chans.push(ch);
  return ch;
}
function makeSbClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}), signInWithOtp: async () => ({ error: null })
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async () => ({ data: null, error: null }) }),
    channel: makeChannel,
    removeChannel() {}
  };
}

function jsdomStubs(w) {
  w.AudioContext = w.webkitAudioContext = function () {
    return new Proxy({}, { get: (t, k) => {
      if (k === 'destination') return {};
      if (k === 'currentTime') return 0;
      if (k === 'sampleRate') return 44100;
      if (k === 'state') return 'running';
      if (k === 'createBuffer') return () => ({ getChannelData: () => new Float32Array(1) });
      if (k === 'decodeAudioData') return async () => ({});
      return () => new Proxy({ gain: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, cancelScheduledValues(){} },
        frequency: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} },
        type: '', Q: { value: 0 }, buffer: null,
        connect(){ return this; }, disconnect(){}, start(){}, stop(){}, setValueAtTime(){}, setTargetAtTime(){} }, {
        get: (tt, kk) => (kk in tt ? tt[kk] : () => {}) });
    }});
  };
  const proto = w.HTMLCanvasElement && w.HTMLCanvasElement.prototype;
  if (proto) proto.getContext = () => canvasCtx();
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
  w.requestAnimationFrame = w.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
  w.cancelAnimationFrame = w.cancelAnimationFrame || ((id) => clearTimeout(id));
  w.ResizeObserver = w.ResizeObserver || function () { return { observe(){}, unobserve(){}, disconnect(){} }; };
  w.supabase = { createClient: () => makeSbClient() };
}

const vc = new VirtualConsole();
const jsdomErrors = [];
vc.on('jsdomError', (e) => jsdomErrors.push(String(e && e.message || e)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/equipe.html', virtualConsole: vc,
  beforeParse: jsdomStubs
});
const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const clic = el => el.dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
const g = expr => W.eval(expr);
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const txt = el => norm(el ? el.textContent : '');

// config d'essai : 2 joueurs, cajón grave (J1) + aigu (J2)
const CFG = { v: 1, titre: 'Test funk', tempo: 100, steps: 16, swing: 50, joueurs: 2, backing: true,
  voix: [
    { k: 'grave', instr: 'cajon', g: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], j: 1 },
    { k: 'aigu',  instr: 'cajon', g: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], j: 2 }
  ] };

setTimeout(runTests, 140);

function runTests() {
  /* ---------- A. chargement + page ---------- */
  ok('A1 chargement sans erreur jsdom (' + jsdomErrors.length + ')', jsdomErrors.length === 0);
  ok('A2 BUILD 0.20.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.20.0');
  ok('A3 tampon de build affiché', /metronomefunk-0\.20\.0/.test(txt($('buildStamp'))));
  ok('A4 stubs au strict contrat moteur (percFsPlay + gapTarget seuls)',
    !!$('percFsPlay') && !!$('gapTarget') && $('fmStubs').children.length === 2);
  ok('A5 transport présent (tempo, démarrer, volume, statut)',
    !!($('tempoValue') && $('startBtn') && $('volSlider') && $('volMuteBtn') && $('statusLine')));

  /* ---------- B. contrat moteur ---------- */
  ok('B1 hooks de coquille définis (draw/tsMuted/percBreakEvents…)',
    ['draw','drawStatic','tsMuted','percOnNewMeasure','percBreakEvents','scriptOnNewMeasure','bowReset','wakeLockUpdate','atelierRender']
      .every(h => g('typeof ' + h) === 'function'));
  ok('B2 état de coquille neutre au chargement (percGrids vide, claveData vide)',
    Object.keys(g('percGrids')).length === 0 && Object.keys(g('claveData')).length === 0);
  ok('B3 API de diagnostic exposée (window.fmEquipeApp)', g('typeof window.fmEquipeApp') === 'object');
  ok('B4 codec exposé (window.fmEquipe)', g('typeof window.fmEquipe') === 'object' && g('window.fmEquipe.VER') === 1);
  ok('B5 continuité tempo : fm-tempo restauré au boot (92 par défaut)', g('S.tempo') === 92);

  /* ---------- C. codec fm-equipe ---------- */
  const enc = g('window.fmEquipe.encode(' + JSON.stringify(CFG) + ')');
  ok('C1 encode → chaîne base64url (URL-safe, sans + / =)', typeof enc === 'string' && !/[+/=]/.test(enc));
  const dec = g('window.fmEquipe.decode(' + JSON.stringify(enc) + ')');
  ok('C2 decode(encode(x)) == x (aller-retour fidèle)', JSON.stringify(dec) === JSON.stringify(CFG));
  ok('C3 decode lit un hash complet (#c=…)', !!g('window.fmEquipe.decode("#c=' + enc + '")'));
  ok('C4 decode(charabia) → null (robuste)', g('window.fmEquipe.decode("pas-du-base64!!")') === null);
  ok('C5 audibleForPlayer : ma voix audible, l\'autre selon backing',
    g('window.fmEquipe.audibleForPlayer(' + JSON.stringify(CFG.voix[0]) + ',' + JSON.stringify(CFG) + ',1)') === true &&
    g('window.fmEquipe.audibleForPlayer(' + JSON.stringify(CFG.voix[1]) + ',' + JSON.stringify(Object.assign({}, CFG, { backing: false })) + ',1)') === false);
  ok('C6 audibleForPlayer(joueur 0) : tout audible (chef/aperçu)',
    g('window.fmEquipe.audibleForPlayer(' + JSON.stringify(CFG.voix[1]) + ',' + JSON.stringify(Object.assign({}, CFG, { backing: false })) + ',0)') === true);

  /* ---------- D. charger une config ---------- */
  g('window.fmEquipeApp.apply(' + JSON.stringify(CFG) + ')');
  ok('D1 apply → percGrids peuplé (2 voix, valeurs 0/1/2)',
    Object.keys(g('percGrids')).length === 2 && g('percGrids["eq.0"]').length === 16 && g('percGrids["eq.0"][0]') === 2);
  ok('D2 percMeta porte instr + voiceKind par voix', g('percMeta["eq.1"].instr') === 'cajon' && g('percMeta["eq.1"].voiceKind') === 'aigu');
  ok('D3 S.perc.on activé, tempo de la config appliqué', g('S.perc.on') === true && g('S.tempo') === 100);
  ok('D4 état chargé affiché (eqLoaded visible, eqEmpty masqué)',
    !$('eqLoaded').classList.contains('hide') && $('eqEmpty').classList.contains('hide'));
  ok('D5 joueurs rendus : 2 chips « Joueur » + 1 « Écouter tout »',
    $('eqPlayers').querySelectorAll('[data-player]').length === 3);
  ok('D6 résumé : titre + nombre de joueurs + tempo', /Test funk/.test(txt($('eqSummary'))) && /100/.test(txt($('eqSummary'))));

  /* ---------- E. mon pupitre ---------- */
  g('window.fmEquipeApp.setPlayer(1)');
  ok('E1 joueur 1 : MA voix (eq.0) audible, l\'autre (eq.1) audible car backing ON',
    g('window.fmEquipeApp.tsMuted("eq.0")') === false && g('window.fmEquipeApp.tsMuted("eq.1")') === false);
  // couper le backing → l'autre ligne devient muette pour moi
  $('eqBacking').checked = false; $('eqBacking').dispatchEvent(new W.Event('change'));
  ok('E2 backing OFF : ma voix reste audible, l\'autre est muette (isolation du pupitre)',
    g('window.fmEquipeApp.tsMuted("eq.0")') === false && g('window.fmEquipeApp.tsMuted("eq.1")') === true);
  g('window.fmEquipeApp.setPlayer(0)');
  ok('E3 « Écouter tout » (chef) : rien n\'est muet', g('window.fmEquipeApp.tsMuted("eq.0")') === false && g('window.fmEquipeApp.tsMuted("eq.1")') === false);
  g('window.fmEquipeApp.setPlayer(1)');
  $('eqBacking').checked = true; $('eqBacking').dispatchEvent(new W.Event('change'));
  ok('E4 grille du pupitre : au moins une ligne rendue pour mon joueur (.pfg-steps)',
    $('eqGrid').querySelectorAll('.pfg-steps').length >= 1 && $('eqGrid').querySelectorAll('.pfg-cell').length >= 16);

  /* ---------- F. le chef ---------- */
  clic($('eqChef'));
  ok('F1 chef : le décompte de départ s\'affiche (overlay #eqCount visible)', $('eqCount').classList.contains('show'));
  g('typeof eqStartHere === "function" && eqStartHere()');
  ok('F2 après le décompte, le métronome démarre (isPlaying)', g('isPlaying') === true);
  g('stop()');
  ok('F3 stop() arrête proprement', g('isPlaying') === false);

  /* ---------- G. partage ---------- */
  const url = g('window.fmEquipeApp.shareUrl()');
  ok('G1 shareUrl contient le fragment #c=', typeof url === 'string' && url.indexOf('#c=') > 0);
  const back = g('window.fmEquipe.decode(' + JSON.stringify(url) + ')');
  ok('G2 le lien de partage reproduit la config (titre + joueurs)', back && back.titre === 'Test funk' && back.joueurs === 2);

  /* ---------- H. mode online (mocké) ---------- */
  ok('H1 fmSupabase() rend un client (mock) avec .channel', typeof g('window.fmSupabase()') === 'object' && typeof g('window.fmSupabase().channel') === 'function');
  g('window.fmEquipeApp.setMode("online")');
  ok('H2 mode online : la carte salle est révélée', !$('eqSalleCard').classList.contains('hide'));
  $('eqSalleCode').value = 'funk-42'; $('eqSalleChef').checked = true;
  SB.sent.length = 0; SB.chans.length = 0;
  g('window.fmEquipeApp.setPlayer(1)');   // config déjà chargée
  clic($('eqSalleJoin'));
  ok('H3 rejoindre une salle → un canal broadcast « equipe-<code> » est créé',
    SB.chans.length === 1 && SB.chans[0].name === 'equipe-funk-42');
  ok('H4 le chef diffuse la config à la salle à la connexion',
    SB.sent.some(m => m && m.event === 'transport' && m.payload && m.payload.action === 'config' && m.payload.config));
  // le chef déclenche un départ → un message start est diffusé
  SB.sent.length = 0; clic($('eqChef'));
  ok('H5 le chef diffuse « start » à la salle', SB.sent.some(m => m && m.payload && m.payload.action === 'start'));
  g('stop()');
  // suiveur : une réception « config » applique la répartition
  const CFG2 = Object.assign({}, CFG, { titre: 'Reçu du chef', tempo: 120 });
  g('window.fmEquipeApp.onBroadcast(' + JSON.stringify({ action: 'config', config: CFG2 }) + ')');
  ok('H6 réception broadcast « config » : le suiveur applique (tempo 120, titre reçu)',
    g('S.tempo') === 120 && /Reçu du chef/.test(txt($('eqSummary'))));
  g('window.fmEquipeApp.onBroadcast(' + JSON.stringify({ action: 'stop' }) + ')');
  ok('H7 réception « stop » : arrêt (idempotent hors lecture)', g('isPlaying') === false);
  g('window.fmEquipeApp.leave()');

  /* ---------- I. i18n strict ---------- */
  ok('I1 sélecteur de langue (FR/EN/BR) + fmTr exposé',
    D.querySelectorAll('#langSwitch .lang-btn').length === 3 && typeof W.fmTr === 'function');
  const EN = W.__I18N.en, PT = W.__I18N.pt;
  const enKeys = Object.keys(EN), ptKeys = Object.keys(PT);
  ok('I2 dictionnaires en/pt non vides (' + enKeys.length + ' clés) et symétriques : 0 orpheline',
    enKeys.length >= 40 && enKeys.every(k => k in PT) && ptKeys.every(k => k in EN));
  ok('I3 clés critiques couvertes (h1, transport, modes, pupitre, chef)',
    ['Métronome — En équipe', '▶ Démarrer', 'Hors-ligne', 'En ligne (salle)', 'Mon pupitre',
     '▶ Départ (le chef)', 'Copier le lien de partage'].every(k => EN[k] && PT[k]));
  // audit d'extraction : chaque libellé visible + attribut couvert (exclusions ciblées)
  const IDENT = new Set(['FR', 'EN', 'BR', 'Langue / Language / Idioma', 'Français', 'English',
    'Português (Brasil)', 'Tempo (BPM)', 'Tempo', 'Grave', 'Largo', 'Larghetto', 'Adagio',
    'Moderato', 'Allegretto', 'Allegro', 'Vivace', 'Presto', 'Prestissimo']);
  // zones exclues : labels de voix (corpus), résumé/statuts composés, chips de joueur
  // composées (« Joueur N »), placeholders d'exemple (URL/code de salle), stubs, tampon.
  const EXCL_ZONE = '.pfg-voix, #eqSummary, #statusLine, #eqStatus, #eqSalleStatus, #eqPlayers, ' +
    '#eqLinkInput, #eqSalleCode, #fmStubs, #buildStamp, #eqCountNum';
  const EXCL = (t, el) => IDENT.has(t) || /^build metronomefunk-/.test(t) || /^\d+([.,]\d+)?$/.test(t) ||
    !!(el && el.closest && el.closest(EXCL_ZONE));
  const misses = new Set();
  { const walker = D.createTreeWalker(D.body, 4); let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE')) continue;
      const t = norm(n.nodeValue);
      if (!t || !/[A-Za-zÀ-ÿ]{2}/.test(t) || EXCL(t, p)) continue;
      if (!EN[t]) misses.add(t);
    } }
  ok('I4 extraction des nœuds texte : 0 libellé propre hors dictionnaire', misses.size === 0);
  if (misses.size) Array.from(misses).slice(0, 10).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 80))));
  const attrMisses = new Set();
  D.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
    ['placeholder', 'title', 'aria-label'].forEach(a => {
      if (!el.hasAttribute(a)) return;
      const t = norm(el.getAttribute(a));
      if (!t || !/[A-Za-zÀ-ÿ]{2}/.test(t) || EXCL(t, el)) return;
      if (!EN[t]) attrMisses.add(t);
    });
  });
  ok('I5 extraction des attributs : 0 manque', attrMisses.size === 0);
  if (attrMisses.size) Array.from(attrMisses).slice(0, 10).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 80))));
  clic(D.querySelector('.lang-btn[data-lang="pt"]'));
  ok('I6 clic BR → langue partagée écrite (localStorage fm-lang = pt)', W.localStorage.getItem('fm-lang') === 'pt');

  finish();
}

/* ---------- J. second DOM booté par le hash ---------- */
function finish() {
  // encode via une reprise du même algorithme (base64url) pour bâtir l'URL du hash
  const payload = b64url(JSON.stringify(CFG));
  const vc2 = new VirtualConsole(); vc2.on('jsdomError', () => {});
  const dom2 = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true,
    url: 'http://localhost/equipe.html#c=' + payload, virtualConsole: vc2, beforeParse: jsdomStubs
  });
  setTimeout(() => {
    const W2 = dom2.window, D2 = W2.document;
    const g2 = e => W2.eval(e);
    ok('J1 boot depuis le hash (#c=…) : la config s\'applique au chargement (percGrids peuplé)',
      Object.keys(g2('percGrids')).length === 2 && g2('S.tempo') === 100);
    ok('J2 boot depuis le hash : état chargé affiché (eqLoaded visible)',
      !D2.getElementById('eqLoaded').classList.contains('hide'));
    console.log('\n--- equipe (R-6) : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
    process.exit(FAIL ? 1 : 0);
  }, 140);
}

function b64url(str) {
  const b64 = Buffer.from(str, 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

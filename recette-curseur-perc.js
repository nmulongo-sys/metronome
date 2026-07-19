/* ============================================================================
   Recette « curseur de percussion & famille » — deux défauts d'état de
   pratiquer.html, trouvés en cherchant pourquoi « la barre du haut suit le
   rythme mais la grille non » (signalement Jean du 19/07).

     A. DEUX CHEMINS VERS LE MÊME ÉTAT DOIVENT Y ARRIVER PAREIL.
        Choisir un style à 12 pas et régler le sélecteur « 12 pas » à la main
        mènent tous deux à S.perc.count = 12 — mais le premier ne passait pas
        par setFamily : S.family restait 'bin', l'app affichait « 12 pas » ET
        « Binaire » en même temps, et la clave restait en 16 sous une
        percussion en 12. L'aide de la page promet pourtant l'inverse
        (« asservi à la famille : bascule clave + percussion ensemble »).

     B. LE CURSEUR DOIT DÉFILER SUR LA LONGUEUR RÉELLEMENT DESSINÉE.
        Le moteur place chaque voix sur SA propre longueur de grille
        (fm-audio.js : `const n = g.length`). Le curseur, lui, employait un
        compteur global unique pour toutes les lignes. Aujourd'hui les lignes
        de #percVoices sont toujours bâties à S.perc.count, donc le défaut ne
        se voit pas encore à l'écran — mais les voix « ts.* » du répertoire
        vivent DÉJÀ dans percGrids avec leur longueur propre, et le lot « voix
        jouable » les amènera dans la grille. Cette suite verrouille la règle
        avant que ça n'arrive.

   Usage : node recette-curseur-perc.js [chemin/pratiquer.html]
   ============================================================================ */
'use strict';
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
const html = require('./recette-harnais').chargeHtml(FILE);

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };
const eq = (name, got, exp) => ok(name + (got === exp ? '' : ' — attendu ' + JSON.stringify(exp) + ', obtenu ' + JSON.stringify(got)), got === exp);

// horloge audio PILOTABLE : c'est elle qui donne la phase à draw()
let HORLOGE = 0;

function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}
function makeSbClient() {
  const chain = () => { const c = { select: () => c, eq: () => c, order: () => c, insert: () => c,
    maybeSingle: async () => ({ data: null, error: null }), then: (r) => r({ data: [], error: null }) }; return c; };
  return { auth: { getSession: async () => ({ data: { session: null } }),
      signInAnonymously: async () => ({ data: {}, error: { message: 'off' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}), signInWithOtp: async () => ({ error: null }) },
    from: () => ({ select: () => chain(),
      insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async (row) => ({ data: [row], error: null }) }),
    rpc: async () => ({ data: [], error: null }),
    channel: () => ({ on(){ return this; }, subscribe(){ return this; }, send: async () => {}, unsubscribe: async () => {} }),
    removeChannel: async () => {} };
}

const vc = new VirtualConsole();
const jsdomErrors = [];
vc.on('jsdomError', (e) => jsdomErrors.push(String(e && e.message || e)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc,
  beforeParse(w) {
    w.AudioContext = w.webkitAudioContext = function () {
      return new Proxy({}, { get: (t, k) => {
        if (k === 'destination') return {};
        if (k === 'currentTime') return HORLOGE;         // ← pilotée par la recette
        if (k === 'sampleRate') return 44100;
        if (k === 'state') return 'running';
        if (k === 'resume') return async () => {};
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
});

const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const g = expr => W.eval(expr);
const set = (id, v) => { const el = $(id); el.value = v; el.dispatchEvent(new W.Event('change', { bubbles: true })); };

setTimeout(runTests, 120);

function runTests() {
  console.log('\n=== recette-curseur-perc · pratiquer.html ===\n');

  const vraies = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 chargement sans erreur jsdom', vraies.length === 0);
  if (vraies.length) vraies.forEach(m => console.log('     ! ' + m));

  // ================= A. les deux chemins vers 12 pas =================
  console.log('\nA. deux chemins vers « 12 pas » doivent laisser le même état');

  const etat = () => ({
    count: g('S.perc.count'),
    family: g('S.family'),
    binAllume: $('famBinBtn').classList.contains('sel'),
    ternAllume: $('famTernBtn').classList.contains('sel'),
    selecteurPas: $('percCount').value,
    selecteurClave: $('claveCount').value
  });

  // chemin 1 — le sélecteur « 12 pas » à la main (référence : il a toujours été correct)
  set('percInstr', 'djembe');
  set('percCount', '12');
  const parSelecteur = etat();
  eq('A.1 par le sélecteur : count = 12', parSelecteur.count, 12);
  eq('A.2 par le sélecteur : famille = tern', parSelecteur.family, 'tern');
  ok('A.3 par le sélecteur : le bouton Ternaire est allumé, pas Binaire',
    parSelecteur.ternAllume && !parSelecteur.binAllume);
  eq('A.4 par le sélecteur : la clave suit à 12', parSelecteur.selecteurClave, '12');

  // chemin 2 — un STYLE dont le count vaut 12 (« Ternaire 12/8 — Soli/Soko »)
  set('percInstr', 'djembe');
  set('percStyle', 'ternaire');
  const parStyle = etat();
  eq('A.5 par le style : count = 12', parStyle.count, 12);
  eq('A.6 par le style : famille = tern (c\'est ici que ça cassait)', parStyle.family, 'tern');
  ok('A.7 par le style : le bouton Ternaire est allumé, pas Binaire — plus de « 12 pas » + « Binaire »',
    parStyle.ternAllume && !parStyle.binAllume);
  eq('A.8 par le style : la clave suit à 12', parStyle.selecteurClave, '12');
  ok('A.9 les deux chemins laissent EXACTEMENT le même état',
    JSON.stringify(parStyle) === JSON.stringify(parSelecteur));

  // le style installe bien sa grille (setFamily ne l'a pas écrasée au passage)
  const grilles = g('percGrids');
  ok('A.10 le style a bien posé sa grille (setFamily ne l\'a pas rebâtie par-dessus)',
    Object.keys(grilles).some(k => ['basse','tone','slap'].indexOf(k) >= 0 &&
      grilles[k].length === 12 && grilles[k].some(x => x > 0)));

  // un style binaire ramène la famille en binaire
  set('percStyle', 'passeport');
  eq('A.11 un style à 16 pas ramène la famille en binaire', g('S.family'), 'bin');
  ok('A.12 … et rallume le bouton Binaire',
    $('famBinBtn').classList.contains('sel') && !$('famTernBtn').classList.contains('sel'));

  // ================= B. le curseur suit CHAQUE ligne =================
  console.log('\nB. le curseur défile sur la longueur réellement dessinée');

  set('percInstr', 'djembe');           // 16 pas, binaire
  $('secPerc').open = true;
  $('percOn').checked = true;
  $('percOn').dispatchEvent(new W.Event('change', { bubbles: true }));

  // transport en marche, cycle normalisé : 1 seconde, départ à 0 → phase = horloge.
  // ensureCtx() d'abord : audioCtx n'existe pas tant que la lecture n'a pas démarré,
  // et c'est lui que draw() interroge pour connaître la phase.
  g('ensureCtx()');
  g('isPlaying = true');
  g('cycleStart = 0'); g('cycleDur = 1');

  const lignes = () => Array.from(D.querySelectorAll('#percVoices .steps'));
  ok('B.1 la grille rend au moins deux lignes', lignes().length >= 2);
  ok('B.2 toutes les lignes sont à S.perc.count aujourd\'hui (16)',
    lignes().every(r => r.children.length === g('S.perc.count')));

  // on RACCOURCIT une ligne à 8 cases : c'est la situation que le moteur sait déjà
  // produire (une voix de percGrids peut avoir sa longueur propre) et que le lot
  // « voix jouable » amènera à l'écran.
  const rows = lignes();
  const courte = rows[0], longue = rows[1];
  while (courte.children.length > 8) courte.removeChild(courte.lastChild);
  courte._fmCur = null; longue._fmCur = null;
  g('invalidateDrawCache()');

  HORLOGE = 0.5;                        // moitié du cycle
  g('draw()');

  const curseurDe = row => Array.from(row.children).findIndex(c => c.classList.contains('cur'));
  eq('B.3 à mi-cycle, la ligne de 16 cases a son curseur en 8', curseurDe(longue), 8);
  eq('B.4 à mi-cycle, la ligne de 8 cases a son curseur en 4 (et non 8, hors grille)', curseurDe(courte), 4);

  HORLOGE = 0.75;
  g('draw()');
  eq('B.5 aux trois quarts, la ligne de 16 est en 12', curseurDe(longue), 12);
  eq('B.6 aux trois quarts, la ligne de 8 est en 6', curseurDe(courte), 6);

  // aucune ligne ne doit jamais perdre son curseur : c'est le symptôme visible
  ok('B.7 aucune ligne ne se retrouve sans curseur (le défaut faisait disparaître le curseur des lignes courtes)',
    [longue, courte].every(r => curseurDe(r) >= 0));

  console.log('\n--- curseur & famille : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---');
  process.exit(FAIL ? 1 : 0);
}

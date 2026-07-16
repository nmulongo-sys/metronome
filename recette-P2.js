/* recette-P2.js — parcours funk, étape P-2 (5 autres modules de l'Intermédiaire + accordéon).
   Headless jsdom : mêmes stubs que recette-P4 (Web Audio / canvas / Supabase mocké).
   Vérifie l'intégrité des données Intermédiaire (12 modules, 42 exercices), le partage EX-SOCLE,
   le rendu accordéon (6 modules/colonne, un seul ouvert), les presets des nouveaux exercices.
   P-6 : le parcours est multi-niveaux ; cette recette scope ses garanties à l'Intermédiaire
   (compteurs filtrés par niveau, sélecteur mis sur « intermédiaire »). Le Débutant → recette-P6.
   Usage : node recette-P2.js [chemin/apprendre.html]  (défaut ./apprendre.html — R-4a : le parcours vit sur apprendre.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'apprendre.html');   // R-4a : la surface parcours a déménagé
const html = require('./recette-harnais').chargeHtml(FILE);   // R-2 : inline les corpus/*.js

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };
const eq = (name, a, b) => ok(name + '  (' + JSON.stringify(a) + ' === ' + JSON.stringify(b) + ')', a === b);

function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}

const M = { signedIn: false, anonEnabled: true, uid: 'uid-magic', anonUid: 'uid-anon',
            promo: { promu: false, dormant: true, n_votes: 0, part: 0 }, upserts: [], rpcCalls: [] };

function makeSbClient() {
  const thenableChain = () => {
    const chain = { select: () => chain, eq: () => chain, order: () => chain, insert: () => chain,
      maybeSingle: async () => ({ data: null, error: null }), then: (res) => res({ data: [], error: null }) };
    return chain;
  };
  return {
    auth: {
      getSession: async () => ({ data: { session: M.signedIn ? { user: { id: M.uid } } : null } }),
      signInAnonymously: async () => M.anonEnabled
        ? ({ data: { user: { id: M.anonUid } }, error: null })
        : ({ data: {}, error: { message: 'Anonymous sign-ins are disabled' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}), signInWithOtp: async () => ({ error: null })
    },
    from: (table) => ({
      select: () => thenableChain(),
      insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async (row, opts) => { M.upserts.push({ table, row, opts }); return { data: [row], error: null }; }
    }),
    rpc: async (name, args) => { M.rpcCalls.push({ name, args }); return { data: [M.promo], error: null }; }
  };
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
});

const W = dom.window, D = W.document;
function resetLocal() { try { W.localStorage.clear(); } catch (e) {} }

setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-P2 · parcours funk (5 modules Intermédiaire + accordéon) ===\n');

  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  ok('0.2 hook fmMetroParcours présent', typeof W.fmMetroParcours === 'function');
  // R-4a : fmMetroReg (rang de registre) vit sur index/pratiquer — ici le hook moteur fait foi.
  ok('0.3 hooks existants conservés (bass ; reg vit sur index/pratiquer)', typeof W.fmMetroBass === 'function');

  const P = W.fmMetroParcours();
  const EX = P.data.EXERCISES, MOD = P.data.MODULES;
  const OK_PATTERN = ['theOne', 'syncopeGrave', 'ghostPendule', 'claveGrave'];
  const OK_PROG = ['vamp1', 'vamp2'];
  // P-6 : le parcours est devenu multi-niveaux (Débutant ajouté). recette-P2 garde l'INTERMÉDIAIRE :
  // on scope les compteurs d'intégrité à ce niveau (le Débutant a sa propre recette-P6).
  const interMods = Object.keys(MOD).filter(id => MOD[id].niveau === 'intermediaire');
  const interEx = Array.from(new Set(interMods.reduce((a, id) => a.concat(MOD[id].exercices), [])));
  // sélecteur de niveau : on affiche l'Intermédiaire pour les assertions de rendu (2, 3, 5, 6).
  P.showNiveau('intermediaire');

  // 1. intégrité données (Intermédiaire)
  eq('1.1 douze modules Intermédiaire (6 objets × 2 parcours)', interMods.length, 12);
  eq('1.2 quarante-deux exercices Intermédiaire (35 P-2 + 7 module 6)', interEx.length, 42);
  const modIds = ['T1','T2','B1','B2','D1','I2'].reduce((a,c)=>a.concat(['MOD-CJ-I-'+c,'MOD-DJ-I-'+c]),[]);
  ok('1.3 les 12 IDs de modules attendus présents', modIds.every(id => !!MOD[id]));
  let allFive = true, allRefsExist = true, allKinds = true, allPreset = true;
  interMods.forEach(id => {
    const m = MOD[id];
    if (m.exercices.length !== 5) allFive = false;
    const kinds = m.exercices.map(e => (EX[e] || {}).kind);
    if (kinds.filter(k => k === 'atome').length !== 4 || kinds.filter(k => k === 'synthese').length !== 1) allKinds = false;
    m.exercices.forEach(e => { if (!EX[e]) allRefsExist = false; });
  });
  interEx.forEach(e => {
    const p = EX[e].preset || {};
    if (OK_PATTERN.indexOf(p.pattern) < 0 || OK_PROG.indexOf(p.prog) < 0) allPreset = false;
  });
  ok('1.4 chaque module Intermédiaire = 5 exercices', allFive);
  ok('1.5 chaque module Intermédiaire = 4 atomes + 1 synthèse', allKinds);
  ok('1.6 toutes les références d\'exercices Intermédiaire existent', allRefsExist);
  ok('1.7 tous les presets Intermédiaire valides (pattern/prog connus)', allPreset);
  ok('1.8 tous les modules Intermédiaire au niveau intermédiaire', interMods.every(id => MOD[id].niveau === 'intermediaire'));

  // 2. rendu accordéon : 6 modules/colonne, ordre attendu
  const cols = D.querySelectorAll('#pfRoot .pf-col');
  eq('2.1 deux colonnes', cols.length, 2);
  const cjMods = cols[0].querySelectorAll('.pf-mod');
  const djMods = cols[1].querySelectorAll('.pf-mod');
  eq('2.2 six modules côté cajón', cjMods.length, 6);
  eq('2.3 six modules côté djembé', djMods.length, 6);
  const cjOrder = Array.from(cjMods).map(m => m.getAttribute('data-mid'));
  eq('2.4 ordre cajón = T1..I2', JSON.stringify(cjOrder),
     JSON.stringify(['MOD-CJ-I-T1','MOD-CJ-I-T2','MOD-CJ-I-B1','MOD-CJ-I-B2','MOD-CJ-I-D1','MOD-CJ-I-I2']));
  const totalCards = D.querySelectorAll('#pfRoot .pf-card').length;
  eq('2.5 soixante cartes au total (12×5)', totalCards, 60);

  // 3. comportement accordéon (un seul ouvert par colonne)
  eq('3.1 un seul module ouvert au départ (cajón)', cols[0].querySelectorAll('.pf-mod.open').length, 1);
  ok('3.2 le premier module est celui ouvert', cjMods[0].classList.contains('open'));
  cjMods[2].querySelector('.pf-mod-head').click();
  ok('3.3 clic sur module 3 → il s\'ouvre', cjMods[2].classList.contains('open'));
  ok('3.4 le module 1 s\'est refermé', !cjMods[0].classList.contains('open'));
  eq('3.5 toujours un seul ouvert (cajón)', cols[0].querySelectorAll('.pf-mod.open').length, 1);
  cjMods[2].querySelector('.pf-mod-head').click();
  eq('3.6 re-clic → module refermé (0 ouvert)', cols[0].querySelectorAll('.pf-mod.open').length, 0);
  ok('3.7 colonnes indépendantes (djembé garde son ouvert)', cols[1].querySelectorAll('.pf-mod.open').length === 1);

  // 4. partage / double couleur
  // P-6 : l'ensemble partagé inclut désormais le socle Débutant (EX-SOCLE-D-PLS/SUB). On isole le
  // socle Intermédiaire (hors préfixe « EX-SOCLE-D- ») et on vérifie qu'il vaut exactement les 18 attendus.
  const sharedInter = P.shared.filter(e => /^EX-SOCLE-(T1|T2|B1|B2|D1|I2)-/.test(e)).slice().sort();   // P-7/P-8 : scope Intermédiaire
  const attendu = [
    'EX-SOCLE-D1-01','EX-SOCLE-D1-02','EX-SOCLE-D1-03','EX-SOCLE-D1-04','EX-SOCLE-D1-05',
    'EX-SOCLE-I2-01','EX-SOCLE-I2-03','EX-SOCLE-I2-04',
    'EX-SOCLE-T1-01','EX-SOCLE-T1-02','EX-SOCLE-T1-03','EX-SOCLE-T1-04','EX-SOCLE-T1-05',
    'EX-SOCLE-T2-01','EX-SOCLE-T2-02','EX-SOCLE-T2-03','EX-SOCLE-T2-04','EX-SOCLE-T2-05'
  ].sort();
  eq('4.1 ensemble partagé Intermédiaire exact (18 EX-SOCLE)', JSON.stringify(sharedInter), JSON.stringify(attendu));
  const cardOf = (parc, ex) => D.querySelector('.pf-card[data-parc="'+parc+'"][data-ex="'+ex+'"]');
  ok('4.2 EX-SOCLE-T1-01 double couleur (cajón)', cardOf('cajon','EX-SOCLE-T1-01').classList.contains('pf-shared'));
  ok('4.3 EX-SOCLE-T1-01 badge « déjà rencontré » (djembé)', !!cardOf('djembe','EX-SOCLE-T1-01').querySelector('.pf-badge-shared'));
  ok('4.4 EX-CJ-B1-01 NON partagé (geste propre)', !cardOf('cajon','EX-CJ-B1-01').classList.contains('pf-shared'));
  ok('4.5 EX-DJ-B2-05 NON partagé (synthèse propre)', !cardOf('djembe','EX-DJ-B2-05').classList.contains('pf-shared'));
  ok('4.6 aucun EX-CJ/EX-DJ dans l\'ensemble partagé', !P.shared.some(e => /^EX-(CJ|DJ)-/.test(e)));

  // 5. presets des nouveaux exercices (chargés d'un bloc)
  resetLocal();
  cardOf('cajon','EX-SOCLE-T1-03').querySelector('.pf-load').click();
  let b = W.fmMetroBass().state;
  eq('5.1 T1-03 pattern theOne', b.pattern, 'theOne');
  ok('5.2 T1-03 drop-out mesure entière (4/4)', b.drop && b.drop.on === true && b.drop.everyN === 4 && b.drop.lenBeats === 4);
  cardOf('cajon','EX-CJ-B2-05').querySelector('.pf-load').click();
  b = W.fmMetroBass().state;
  eq('5.3 B2-05 pattern syncopeGrave', b.pattern, 'syncopeGrave');
  eq('5.4 B2-05 prog vamp2', b.prog, 'vamp2');
  eq('5.5 B2-05 drop off', b.drop.on, false);
  cardOf('djembe','EX-SOCLE-T2-01').querySelector('.pf-load').click();
  eq('5.6 T2-01 pattern ghostPendule', W.fmMetroBass().state.pattern, 'ghostPendule');
  eq('5.7 preset : basse activée + tonalité E', W.fmMetroBass().state.on === true && W.fmMetroBass().state.key, 'E');

  // 6. acquis par position + compteur de module
  resetLocal();
  P.setAcquis('cajon','EX-SOCLE-T1-01', true);
  ok('6.1 acquis (cajón) écrit', P.progress()['cajon|EX-SOCLE-T1-01'] && P.progress()['cajon|EX-SOCLE-T1-01'].acquis === true);
  ok('6.2 acquis NON propagé au djembé (même ex socle)', !P.progress()['djembe|EX-SOCLE-T1-01']);
  // compteur live du module après coche via l'UI
  W.fmMetroParcours(); // no-op, garde l'API
  const t1Card = cardOf('cajon','EX-SOCLE-T1-02');
  const t1Mod = t1Card.closest('.pf-mod');
  const cntBefore = t1Mod.querySelector('.pf-mod-count').textContent;
  const chk = t1Card.querySelector('.pf-acquis'); chk.checked = true; chk.dispatchEvent(new W.Event('change', { bubbles: true }));
  const cntAfter = t1Mod.querySelector('.pf-mod-count').textContent;
  ok('6.3 compteur de module mis à jour à la coche', cntBefore !== cntAfter && /\/5$/.test(cntAfter));

  // 7. vote empilé sur un nouvel exercice (offline-first)
  resetLocal();
  M.signedIn = false; M.anonEnabled = false; W.fmCurrentUser = null;
  P.vote('cajon','EX-CJ-B1-05','synthese','difficile');
  const q = P.voteQueue();
  eq('7.1 vote empilé (1 item)', q.length, 1);
  ok('7.2 item correct (position + cible + verdict)',
     q[0].parcours === 'cajon' && q[0].exercise_id === 'EX-CJ-B1-05' && q[0].cible === 'synthese' && q[0].verdict === 'difficile');
  await new Promise(r => setTimeout(r, 20));
  eq('7.3 flush impossible (anon off) → reste en file', P.voteQueue().length, 1);

  console.log('\n--- P-2 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL === 0 ? 0 : 1);
}

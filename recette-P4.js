/* recette-P4.js — parcours funk, étape P-4 (UI parcours, module 6).
   Headless jsdom : stubs Web Audio / canvas + client Supabase mocké.
   Pilote le DOM et vérifie via window.fmMetroParcours() (+ window.fmMetroBass pour l'état basse).
   Usage : node recette-P4.js [chemin/index.html]  (défaut ./index.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'index.html');
const html = fs.readFileSync(FILE, 'utf8');

let PASS = 0, FAIL = 0;
const ok  = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };
const eq  = (name, a, b) => ok(name + '  (' + JSON.stringify(a) + ' === ' + JSON.stringify(b) + ')', a === b);

// ---------- stubs injectés avant l'exécution des scripts ----------
function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient')
      return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}

// contrôle du mock Supabase, lu dynamiquement à chaque appel
const M = { signedIn: false, anonEnabled: true, uid: 'uid-magic', anonUid: 'uid-anon',
            promo: { promu: false, dormant: true, n_votes: 0, part: 0 },
            upserts: [], rpcCalls: [] };

function makeSbClient() {
  const thenableChain = () => {
    const chain = {
      select: () => chain, eq: () => chain, order: () => chain, insert: () => chain,
      maybeSingle: async () => ({ data: null, error: null }),
      then: (res) => res({ data: [], error: null })
    };
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
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/',
  virtualConsole: vc,
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
    // client Supabase mocké (le <script src> CDN n'est pas chargé par jsdom)
    w.supabase = { createClient: () => makeSbClient() };
  }
});

const W = dom.window, D = W.document;
function fire(el, type) { el.dispatchEvent(new W.Event(type, { bubbles: true })); }
function resetLocal() { try { W.localStorage.clear(); } catch (e) {} }

// laisse tourner l'init + microtâches asynchrones
setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-P4 · parcours funk (UI, module 6) ===\n');

  // 0. non-régression : le script principal s'exécute sans erreur ; hooks existants intacts
  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 aucun jsdomError hors chargement de ressource externe', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  ok('0.2 hook fmMetroBass conservé', typeof W.fmMetroBass === 'function');
  ok('0.3 hook fmMetroReg conservé', typeof W.fmMetroReg === 'function');
  ok('0.4 nouveau hook fmMetroParcours présent', typeof W.fmMetroParcours === 'function');

  const P = W.fmMetroParcours();

  // 1. rendu
  const cols = D.querySelectorAll('#pfRoot .pf-col');
  eq('1.1 deux colonnes (cajón/djembé)', cols.length, 2);
  // P-2 : l'UI affiche désormais les 6 modules de l'Intermédiaire en accordéon ; on recentre
  // les assertions structurelles de P-4 sur le module 6 (son périmètre d'origine).
  const m6cards = D.querySelectorAll('.pf-mod[data-mid="MOD-CJ-I-I2"] .pf-card, .pf-mod[data-mid="MOD-DJ-I-I2"] .pf-card');
  eq('1.2 module 6 : dix cartes (2×5)', m6cards.length, 10);
  const m6cj = D.querySelector('.pf-mod[data-mid="MOD-CJ-I-I2"]').querySelectorAll('.pf-card');
  ok('1.3 dernière carte cajón (module 6) = synthèse (★)', m6cj[4].querySelector('.pf-rang').textContent === '★');

  // 2. partage / double couleur
  // P-2 : l'ensemble partagé couvre maintenant tous les EX-SOCLE (modules 1,2,5,6) ; P-4 vérifie
  // que le socle du module 6 y figure toujours (l'ensemble exact est vérifié par recette-P2).
  ok('2.1 socle module 6 dans l\'ensemble partagé',
     ['EX-SOCLE-I2-01','EX-SOCLE-I2-03','EX-SOCLE-I2-04'].every(e => P.shared.indexOf(e) >= 0));
  const cardOf = (parc, ex) => D.querySelector('.pf-card[data-parc="'+parc+'"][data-ex="'+ex+'"]');
  ok('2.2 EX-SOCLE-I2-01 marqué partagé (double couleur)', cardOf('cajon','EX-SOCLE-I2-01').classList.contains('pf-shared'));
  ok('2.3 EX-SOCLE-I2-01 badge « déjà rencontré »', !!cardOf('djembe','EX-SOCLE-I2-01').querySelector('.pf-badge-shared'));
  ok('2.4 EX-CJ-I2-02 non partagé', !cardOf('cajon','EX-CJ-I2-02').classList.contains('pf-shared'));
  ok('2.5 synthèse propre non partagée', !cardOf('djembe','EX-DJ-I2-05').classList.contains('pf-shared'));

  // 3. preset chargé d'un bloc
  resetLocal();
  cardOf('cajon','EX-SOCLE-I2-04').querySelector('.pf-load').click();
  let b = W.fmMetroBass().state;
  eq('3.1 preset drop-out : bass.pattern', b.pattern, 'theOne');
  eq('3.2 preset drop-out : bass.prog', b.prog, 'vamp1');
  ok('3.3 preset drop-out : drop.on=true (4/2)', b.drop && b.drop.on === true && b.drop.everyN === 4 && b.drop.lenBeats === 2);
  eq('3.4 preset : tempo 90 (DOM)', D.getElementById('tempoValue').textContent, '90');
  eq('3.5 preset : basse activée', b.on, true);
  eq('3.6 preset : tonalité E', b.key, 'E');
  cardOf('cajon','EX-CJ-I2-05').querySelector('.pf-load').click();
  eq('3.7 synthèse charge vamp2', W.fmMetroBass().state.prog, 'vamp2');
  eq('3.8 synthèse : drop off', W.fmMetroBass().state.drop.on, false);

  // 4. tiroir perso
  const c04 = cardOf('cajon','EX-SOCLE-I2-04');
  const tempoR = c04.querySelector('.pf-tempo');
  eq('4.1 perso tempo borné min', tempoR.getAttribute('min'), '70');
  eq('4.2 perso tempo borné max', tempoR.getAttribute('max'), '110');
  const keySel = c04.querySelector('.pf-key');
  keySel.value = 'G'; fire(keySel, 'change');
  eq('4.3 perso tonalité → S.bass.key', W.fmMetroBass().state.key, 'G');

  // 5. acquis local, par position
  resetLocal();
  P.setAcquis('cajon','EX-SOCLE-I2-04', true);
  ok('5.1 acquis (cajon) écrit', P.progress()['cajon|EX-SOCLE-I2-04'] && P.progress()['cajon|EX-SOCLE-I2-04'].acquis === true);
  ok('5.2 acquis NON propagé au djembé (même ex)', !P.progress()['djembe|EX-SOCLE-I2-04']);

  // 6. vote empilé (offline / sans session : reste en file, aucune exception)
  resetLocal();
  M.signedIn = false; M.anonEnabled = false; W.fmCurrentUser = null;
  P.vote('djembe','EX-DJ-I2-05','synthese','difficile');
  let q = P.voteQueue();
  eq('6.1 vote empilé (1 item)', q.length, 1);
  ok('6.2 item correct (position + verdict + cible)',
     q[0].parcours === 'djembe' && q[0].exercise_id === 'EX-DJ-I2-05' && q[0].cible === 'synthese' && q[0].verdict === 'difficile');
  await new Promise(r => setTimeout(r, 20)); // laisse le flush échouer proprement
  eq('6.3 flush impossible (anon off) → reste en file', P.voteQueue().length, 1);
  ok('6.4 acquis enregistrable malgré échec vote', (P.setAcquis('djembe','EX-DJ-I2-05',true), P.isAcquis('djembe','EX-DJ-I2-05')));

  // 7. flush + promotion (session présente, RPC promu:true)
  resetLocal();
  M.upserts.length = 0; M.rpcCalls.length = 0;
  M.signedIn = true; M.anonEnabled = true; W.fmCurrentUser = { id: 'uid-magic' };
  M.promo = { promu: true, dormant: false, n_votes: 9, part: 0.55 };
  P.vote('djembe','EX-DJ-I2-05','synthese','difficile');
  await P.flush();
  await new Promise(r => setTimeout(r, 10));
  ok('7.1 upsert appelé sur pf_vote', M.upserts.some(u => u.table === 'pf_vote'));
  const up = M.upserts.find(u => u.table === 'pf_vote');
  ok('7.2 upsert onConflict exact', up && up.opts && up.opts.onConflict === 'client_id,parcours,exercise_id,cible');
  ok('7.3 upsert porte client_id + verdict', up && up.row.client_id === 'uid-magic' && up.row.verdict === 'difficile' && up.row.cible === 'synthese');
  ok('7.4 RPC pf_promotion appelée', M.rpcCalls.some(c => c.name === 'pf_promotion'));
  ok('7.5 cache promotion écrit (promu)', P.promoCache()['djembe|EX-DJ-I2-05|synthese'] && P.promoCache()['djembe|EX-DJ-I2-05|synthese'].promu === true);
  eq('7.6 niveau effectif = avancé (base+1)', P.niveauEffectif('djembe','EX-DJ-I2-05','synthese'), 'avance');
  eq('7.7 file vidée après flush', P.voteQueue().length, 0);

  // 8. portée du vote : un vote djembé ne déplace pas le cajón (même exId socle)
  resetLocal();
  M.upserts.length = 0; M.rpcCalls.length = 0;
  M.promo = { promu: true, dormant: false, n_votes: 9, part: 0.5 };
  P.vote('djembe','EX-SOCLE-I2-04','atome','difficile');
  await P.flush();
  await new Promise(r => setTimeout(r, 10));
  ok('8.1 promotion djembé enregistrée', P.promoCache()['djembe|EX-SOCLE-I2-04|atome'] && P.promoCache()['djembe|EX-SOCLE-I2-04|atome'].promu === true);
  ok('8.2 pas de promotion côté cajón', !P.promoCache()['cajon|EX-SOCLE-I2-04|atome']);
  eq('8.3 niveau cajón inchangé (intermédiaire)', P.niveauEffectif('cajon','EX-SOCLE-I2-04','atome'), 'intermediaire');

  // 9. dégradation offline (fmSupabase indisponible) : vote en file, aucune exception
  resetLocal();
  W._fmSb = null; W.supabase = null;
  let threw = false;
  try { P.vote('cajon','EX-SOCLE-I2-01','atome','ok'); await new Promise(r => setTimeout(r, 10)); } catch (e) { threw = true; }
  ok('9.1 aucune exception hors-ligne', !threw);
  eq('9.2 vote reste en file hors-ligne', P.voteQueue().length, 1);
  ok('9.3 acquis fonctionne hors-ligne', (P.setAcquis('cajon','EX-SOCLE-I2-01',true), P.isAcquis('cajon','EX-SOCLE-I2-01')));

  // 10. surcouche no-op : presetFor est pur (n'altère pas l'état basse)
  const before = JSON.stringify(W.fmMetroBass().state);
  P.presetFor('EX-SOCLE-I2-04');
  eq('10.1 presetFor pur (état basse inchangé)', JSON.stringify(W.fmMetroBass().state), before);
  const pf = P.presetFor('EX-CJ-I2-05');
  ok('10.2 presetFor renvoie le bon sous-ensemble', pf && pf.bass.prog === 'vamp2' && pf.family === 'bin' && pf.perc.on === false);

  console.log('\n----------------------------------------');
  console.log('  RÉSULTAT P-4 : ' + PASS + ' / ' + (PASS + FAIL) + ' verts' + (FAIL ? '  — ' + FAIL + ' ÉCHEC(S)' : ''));
  console.log('----------------------------------------\n');
  process.exit(FAIL ? 1 : 0);
}

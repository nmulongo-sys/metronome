/* recette-P6.js — parcours funk, étape P-6 (peuplement du niveau Débutant).
   Headless jsdom : mêmes stubs que recette-P2/P-4 (Web Audio / canvas / Supabase mocké).
   Vérifie l'intégrité des données Débutant (10 modules, 40 exercices, socle PLS/SUB, 4+1, ordre),
   les presets « pré-funk » (clic seul / subdivision / gap), le partage, le rendu niveau-aware +
   sélecteur, la promotion (base debutant → intermediaire), la vocalisation.
   Usage : node recette-P6.js [chemin/index.html]  (défaut ./index.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'index.html');
const html = fs.readFileSync(FILE, 'utf8');

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
function fire(el, type) { el.dispatchEvent(new W.Event(type, { bubbles: true })); }
function resetLocal() { try { W.localStorage.clear(); } catch (e) {} }
const cardOf = (parc, ex) => D.querySelector('.pf-card[data-parc="'+parc+'"][data-ex="'+ex+'"]');

setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-P6 · parcours funk (peuplement Débutant) ===\n');

  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  ok('0.2 hook fmMetroParcours présent', typeof W.fmMetroParcours === 'function');
  ok('0.3 hooks existants conservés (bass/reg)', typeof W.fmMetroBass === 'function' && typeof W.fmMetroReg === 'function');

  const P = W.fmMetroParcours();
  const EX = P.data.EXERCISES, MOD = P.data.MODULES;
  const debMods = Object.keys(MOD).filter(id => MOD[id].niveau === 'debutant');
  const debEx = Array.from(new Set(debMods.reduce((a, id) => a.concat(MOD[id].exercices), [])));

  // 1. intégrité des données Débutant
  eq('1.1 dix modules Débutant (5 objets × 2 parcours)', debMods.length, 10);
  eq('1.2 quarante exercices Débutant distincts', debEx.length, 40);
  const debIds = ['POS','SON','PLS','SUB','DYN'].reduce((a,c)=>a.concat(['MOD-CJ-D-'+c,'MOD-DJ-D-'+c]),[]);
  ok('1.3 les 10 IDs de modules Débutant présents', debIds.every(id => !!MOD[id]));
  let allFive = true, allRefs = true, allKinds = true, allDeb = true;
  debMods.forEach(id => {
    const m = MOD[id];
    if (m.exercices.length !== 5) allFive = false;
    if (m.niveau !== 'debutant') allDeb = false;
    const kinds = m.exercices.map(e => (EX[e] || {}).kind);
    if (kinds.filter(k => k === 'atome').length !== 4 || kinds.filter(k => k === 'synthese').length !== 1) allKinds = false;
    m.exercices.forEach(e => { if (!EX[e]) allRefs = false; });
  });
  ok('1.4 chaque module Débutant = 5 exercices', allFive);
  ok('1.5 chaque module Débutant = 4 atomes + 1 synthèse', allKinds);
  ok('1.6 toutes les références Débutant existent', allRefs);
  ok('1.7 tous les modules Débutant au niveau debutant', allDeb);
  // socle : PLS et SUB partagés cajón/djembé ; propres : POS, SON, DYN
  ok('1.8 modules PLS/SUB = socle (mêmes exercices cajón/djembé)',
     JSON.stringify(MOD['MOD-CJ-D-PLS'].exercices) === JSON.stringify(MOD['MOD-DJ-D-PLS'].exercices) &&
     JSON.stringify(MOD['MOD-CJ-D-SUB'].exercices) === JSON.stringify(MOD['MOD-DJ-D-SUB'].exercices));
  ok('1.9 modules POS/SON/DYN = propres (exercices distincts cajón/djembé)',
     MOD['MOD-CJ-D-POS'].exercices[0] !== MOD['MOD-DJ-D-POS'].exercices[0] &&
     MOD['MOD-CJ-D-SON'].exercices[0] !== MOD['MOD-DJ-D-SON'].exercices[0] &&
     MOD['MOD-CJ-D-DYN'].exercices[0] !== MOD['MOD-DJ-D-DYN'].exercices[0]);

  // 2. presets « pré-funk » (clic seul / subdivision / gap)
  ok('2.1 tous les presets Débutant sont clic seul (metro:true)', debEx.every(e => EX[e].preset.metro === true));
  ok('2.2 aucun preset Débutant ne charge de basse funk (pas de pattern/prog)',
     debEx.every(e => EX[e].preset.pattern == null && EX[e].preset.prog == null));
  eq('2.3 SUB-01 subdivision = 2 (croches)', EX['EX-SOCLE-D-SUB-01'].preset.subdiv, 2);
  ok('2.4 SUB-02..05 subdivision = 4 (doubles)',
     ['02','03','04','05'].every(n => EX['EX-SOCLE-D-SUB-'+n].preset.subdiv === 4));
  ok('2.5 PLS-04 gap {playN:4, muteM:1}',
     EX['EX-SOCLE-D-PLS-04'].preset.gap && EX['EX-SOCLE-D-PLS-04'].preset.gap.playN === 4 && EX['EX-SOCLE-D-PLS-04'].preset.gap.muteM === 1);
  ok('2.6 PLS-05 gap {playN:3, muteM:1}',
     EX['EX-SOCLE-D-PLS-05'].preset.gap && EX['EX-SOCLE-D-PLS-05'].preset.gap.playN === 3 && EX['EX-SOCLE-D-PLS-05'].preset.gap.muteM === 1);
  ok('2.7 tempos gradués (POS 72, SON 76, PLS/SUB 80, DYN 84)',
     EX['EX-CJ-POS-01'].preset.tempo === 72 && EX['EX-CJ-SON-01'].preset.tempo === 76 &&
     EX['EX-SOCLE-D-PLS-01'].preset.tempo === 80 && EX['EX-SOCLE-D-SUB-01'].preset.tempo === 80 &&
     EX['EX-CJ-DYN-01'].preset.tempo === 84);

  // 3. partage / socle Débutant
  const debSocle = P.shared.filter(e => /^EX-SOCLE-D-/.test(e)).sort();
  const attendu = ['EX-SOCLE-D-PLS-01','EX-SOCLE-D-PLS-02','EX-SOCLE-D-PLS-03','EX-SOCLE-D-PLS-04','EX-SOCLE-D-PLS-05',
                   'EX-SOCLE-D-SUB-01','EX-SOCLE-D-SUB-02','EX-SOCLE-D-SUB-03','EX-SOCLE-D-SUB-04','EX-SOCLE-D-SUB-05'].sort();
  eq('3.1 socle Débutant partagé = PLS + SUB (10)', JSON.stringify(debSocle), JSON.stringify(attendu));
  ok('3.2 aucun EX-CJ/EX-DJ Débutant dans le partagé',
     !P.shared.some(e => /^EX-(CJ|DJ)-(POS|SON|DYN)-/.test(e)));

  // 4. rendu niveau-aware + sélecteur (défaut = Débutant)
  P.showNiveau('debutant');
  eq('4.1 défaut = Débutant', P.niveau(), 'debutant');
  eq('4.2 niveaux peuplés = [debutant, intermediaire]', JSON.stringify(P.niveauxPeuples()), JSON.stringify(['debutant','intermediaire']));
  const tabs = D.querySelectorAll('#pfRoot .pf-niv-tab');
  eq('4.3 sélecteur : deux onglets', tabs.length, 2);
  ok('4.4 onglet Débutant actif', !!D.querySelector('.pf-niv-tab.active[data-niv="debutant"]'));
  const cols = D.querySelectorAll('#pfRoot .pf-col');
  eq('4.5 deux colonnes', cols.length, 2);
  const cjMods = Array.from(cols[0].querySelectorAll('.pf-mod')).map(m => m.getAttribute('data-mid'));
  eq('4.6 cinq modules cajón, ordre POS→DYN', JSON.stringify(cjMods),
     JSON.stringify(['MOD-CJ-D-POS','MOD-CJ-D-SON','MOD-CJ-D-PLS','MOD-CJ-D-SUB','MOD-CJ-D-DYN']));
  eq('4.7 cinquante cartes Débutant (10 modules × 5)', D.querySelectorAll('#pfRoot .pf-card').length, 50);
  eq('4.8 un seul module ouvert au départ (cajón)', cols[0].querySelectorAll('.pf-mod.open').length, 1);
  ok('4.9 dernière carte POS cajón = synthèse (★)',
     D.querySelector('.pf-mod[data-mid="MOD-CJ-D-POS"]').querySelectorAll('.pf-card')[4].querySelector('.pf-rang').textContent === '★');

  // 4bis. bascule de niveau (le sélecteur affiche l'Intermédiaire, puis retour)
  D.querySelector('.pf-niv-tab[data-niv="intermediaire"]').click();
  ok('4.10 clic onglet Intermédiaire → module 6 rendu', !!D.querySelector('.pf-mod[data-mid="MOD-CJ-I-I2"]'));
  ok('4.11 Débutant plus dans le DOM après bascule', !D.querySelector('.pf-mod[data-mid="MOD-CJ-D-POS"]'));
  P.showNiveau('debutant');

  // 5. partage à l'écran (double couleur + badge)
  ok('5.1 EX-SOCLE-D-PLS-01 double couleur (cajón)', cardOf('cajon','EX-SOCLE-D-PLS-01').classList.contains('pf-shared'));
  ok('5.2 EX-SOCLE-D-PLS-01 badge « déjà rencontré » (djembé)', !!cardOf('djembe','EX-SOCLE-D-PLS-01').querySelector('.pf-badge-shared'));
  ok('5.3 EX-CJ-POS-01 non partagé (geste propre)', !cardOf('cajon','EX-CJ-POS-01').classList.contains('pf-shared'));

  // 6. preset chargé d'un bloc (clic seul)
  resetLocal(); P.showNiveau('debutant');
  cardOf('cajon','EX-CJ-POS-01').querySelector('.pf-load').click();
  let b = W.fmMetroBass().state;
  eq('6.1 POS-01 : basse coupée (clic seul)', b.on, false);
  eq('6.2 POS-01 : tempo 72', D.getElementById('tempoValue').textContent, '72');
  cardOf('cajon','EX-SOCLE-D-SUB-02').querySelector('.pf-load').click();
  eq('6.3 SUB-02 : subdivision du métronome = 4', D.getElementById('subdivSel').value, '4');
  eq('6.4 SUB-02 : toujours clic seul', W.fmMetroBass().state.on, false);
  cardOf('cajon','EX-SOCLE-D-PLS-04').querySelector('.pf-load').click();
  eq('6.5 PLS-04 : machine gap active (mode fixe)', D.getElementById('gapMode').value, 'fixed');
  eq('6.6 PLS-04 : cible du gap = pulsation (clic)', D.getElementById('gapTarget').value, 'pulse');
  cardOf('cajon','EX-CJ-SON-01').querySelector('.pf-load').click();
  eq('6.7 SON-01 : gap remis à off (preset sans gap)', D.getElementById('gapMode').value, 'off');
  eq('6.8 SON-01 : subdivision remise à 1', D.getElementById('subdivSel').value, '1');

  // 7. acquis par position + niveau effectif (base = debutant)
  resetLocal();
  P.setAcquis('cajon','EX-SOCLE-D-PLS-01', true);
  ok('7.1 acquis Débutant (cajón) écrit', P.progress()['cajon|EX-SOCLE-D-PLS-01'] && P.progress()['cajon|EX-SOCLE-D-PLS-01'].acquis === true);
  ok('7.2 acquis NON propagé au djembé (même ex socle)', !P.progress()['djembe|EX-SOCLE-D-PLS-01']);
  eq('7.3 niveau effectif Débutant non promu = debutant', P.niveauEffectif('cajon','EX-CJ-POS-01','atome'), 'debutant');

  // 8. promotion : un atome Débutant promu passe à intermediaire (base+1)
  resetLocal();
  M.upserts.length = 0; M.rpcCalls.length = 0;
  M.signedIn = true; M.anonEnabled = true; W.fmCurrentUser = { id: 'uid-magic' };
  M.promo = { promu: true, dormant: false, n_votes: 9, part: 0.55 };
  P.vote('cajon','EX-SOCLE-D-PLS-01','atome','difficile');
  await P.flush();
  await new Promise(r => setTimeout(r, 10));
  ok('8.1 RPC pf_promotion appelée', M.rpcCalls.some(c => c.name === 'pf_promotion'));
  ok('8.2 cache promotion écrit (promu)', P.promoCache()['cajon|EX-SOCLE-D-PLS-01|atome'] && P.promoCache()['cajon|EX-SOCLE-D-PLS-01|atome'].promu === true);
  eq('8.3 niveau effectif = intermédiaire (debutant+1)', P.niveauEffectif('cajon','EX-SOCLE-D-PLS-01','atome'), 'intermediaire');
  eq('8.4 promotion non propagée au djembé (niveau base)', P.niveauEffectif('djembe','EX-SOCLE-D-PLS-01','atome'), 'debutant');

  // 9. vocalisation fondue (P-5 §7.2)
  ok('9.1 SON-04 (cajón) porte la vocalisation (4 syllabes)',
     /syllabe/i.test(EX['EX-CJ-SON-04'].consigne) && /TA-KA-DI-MI/.test(EX['EX-CJ-SON-04'].consigne));
  ok('9.2 SON-04 (djembé) porte la vocalisation', /syllabe/i.test(EX['EX-DJ-SON-04'].consigne));
  ok('9.3 PLS-01 : compter à voix haute', /voix haute/i.test(EX['EX-SOCLE-D-PLS-01'].consigne));

  // 10. offline-first : vote empilé sans session, aucune exception
  resetLocal();
  M.signedIn = false; M.anonEnabled = false; W.fmCurrentUser = null;
  let threw = false;
  try { P.vote('djembe','EX-DJ-DYN-05','synthese','difficile'); await new Promise(r => setTimeout(r, 15)); } catch (e) { threw = true; }
  ok('10.1 aucune exception hors-ligne', !threw);
  eq('10.2 vote Débutant reste en file (anon off)', P.voteQueue().length, 1);
  ok('10.3 acquis enregistrable malgré échec vote', (P.setAcquis('djembe','EX-DJ-DYN-05', true), P.isAcquis('djembe','EX-DJ-DYN-05')));

  console.log('\n--- P-6 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL === 0 ? 0 : 1);
}

/* recette-P8.js — parcours funk, étape P-8 (peuplement du niveau Artiste).
   Headless jsdom : mêmes stubs que recette-P6/P7. Vérifie l'intégrité des données Artiste
   (12 modules, 35 exercices, socle P1/P2/P3/I4/R1, 4+1), l'asymétrie idiomatique (COL cajón /
   SOLO djembé), la vocalisation fondue dans I4 (décision P-5 §7.2, confirmée §9.6), les presets
   (gap laid-back/pushed, premier emploi d'octaves, progressions riches sur les synthèses —
   décision Jean §9.4), le rendu et l'onglet Artiste.
   Usage : node recette-P8.js [chemin/apprendre.html]  (défaut ./apprendre.html — R-4a : le parcours vit sur apprendre.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'apprendre.html');   // R-4a : la surface parcours a déménagé
const html = require('./recette-harnais').chargeHtml(FILE);

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
function makeSbClient() {
  const thenableChain = () => {
    const chain = { select: () => chain, eq: () => chain, order: () => chain, insert: () => chain,
      maybeSingle: async () => ({ data: null, error: null }), then: (res) => res({ data: [], error: null }) };
    return chain;
  };
  return {
    auth: { getSession: async () => ({ data: { session: null } }),
      signInAnonymously: async () => ({ data: {}, error: { message: 'off' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}), signInWithOtp: async () => ({ error: null }) },
    from: () => ({ select: () => thenableChain(),
      insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async (row) => ({ data: [row], error: null }) }),
    rpc: async () => ({ data: [], error: null })
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
const cardOf = (parc, ex) => D.querySelector('.pf-card[data-parc="'+parc+'"][data-ex="'+ex+'"]');

setTimeout(runTests, 60);

function runTests() {
  console.log('\n=== recette-P8 · parcours funk (peuplement Artiste) ===\n');

  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe', realErrors.length === 0);
  ok('0.2 hook fmMetroParcours présent', typeof W.fmMetroParcours === 'function');

  const P = W.fmMetroParcours();
  const EX = P.data.EXERCISES, MOD = P.data.MODULES;
  const arMods = Object.keys(MOD).filter(id => MOD[id].niveau === 'artiste');
  const arEx = Array.from(new Set(arMods.reduce((a, id) => a.concat(MOD[id].exercices), [])));

  // 1. intégrité des données Artiste
  eq('1.1 douze modules Artiste (5 objets × 2 + 2 idiomatiques)', arMods.length, 12);
  eq('1.2 trente-cinq exercices Artiste distincts', arEx.length, 35);
  const arIds = ['P1','P2','P3','I4','R1'].reduce((a,c)=>a.concat(['MOD-CJ-Ar-'+c,'MOD-DJ-Ar-'+c]),[])
    .concat(['MOD-CJ-Ar-COL','MOD-DJ-Ar-SOLO']);
  ok('1.3 les 12 IDs de modules Artiste présents', arIds.every(id => !!MOD[id]));
  let allFive = true, allRefs = true, allKinds = true, allAr = true;
  arMods.forEach(id => {
    const m = MOD[id];
    if (m.exercices.length !== 5) allFive = false;
    if (m.niveau !== 'artiste') allAr = false;
    const kinds = m.exercices.map(e => (EX[e] || {}).kind);
    if (kinds.filter(k => k === 'atome').length !== 4 || kinds.filter(k => k === 'synthese').length !== 1) allKinds = false;
    m.exercices.forEach(e => { if (!EX[e]) allRefs = false; });
  });
  ok('1.4 chaque module Artiste = 5 exercices', allFive);
  ok('1.5 chaque module Artiste = 4 atomes + 1 synthèse', allKinds);
  ok('1.6 toutes les références Artiste existent', allRefs);
  ok('1.7 tous les modules Artiste au niveau artiste', allAr);
  eq('1.8 total app : 152 exercices, 44 modules',
     Object.keys(EX).length + '/' + Object.keys(MOD).length, '152/44');

  // 2. socle / propre / asymétrie idiomatique
  ok('2.1 P1/P2/P3/I4/R1 = socle (mêmes exercices cajón/djembé)',
     ['P1','P2','P3','I4','R1'].every(c => JSON.stringify(MOD['MOD-CJ-Ar-'+c].exercices) === JSON.stringify(MOD['MOD-DJ-Ar-'+c].exercices)));
  ok('2.2 COL côté cajón seulement / SOLO côté djembé seulement',
     !MOD['MOD-DJ-Ar-COL'] && !MOD['MOD-CJ-Ar-SOLO'] &&
     MOD['MOD-CJ-Ar-COL'].parcours === 'cajon' && MOD['MOD-DJ-Ar-SOLO'].parcours === 'djembe');

  // 3. presets (spec P-8 §5) : gap, octaves, progressions riches
  ok('3.1 P1-01/P2-01 : placement au clic (metro, tempo 84)',
     EX['EX-SOCLE-P1-01'].preset.metro === true && EX['EX-SOCLE-P1-01'].preset.tempo === 84 &&
     EX['EX-SOCLE-P2-01'].preset.metro === true && EX['EX-SOCLE-P2-01'].preset.tempo === 84);
  ok('3.2 P1-02/P2-02 : machine gap {playN:4, muteM:2} (tenir le feel sans témoin)',
     [EX['EX-SOCLE-P1-02'], EX['EX-SOCLE-P2-02']].every(e => e.preset.gap && e.preset.gap.playN === 4 && e.preset.gap.muteM === 2));
  ok('3.3 P1-04 : premier emploi du pattern octaves (la pompe qui pousse)',
     EX['EX-SOCLE-P1-04'].preset.pattern === 'octaves');
  ok('3.4 progressions riches sur les synthèses (décision Jean §9.4)',
     EX['EX-SOCLE-P1-05'].preset.prog === 'blues' && EX['EX-SOCLE-P2-05'].preset.prog === 'mixo' &&
     EX['EX-SOCLE-P3-05'].preset.prog === 'dorien' && EX['EX-SOCLE-I4-05'].preset.prog === 'jazzfunk' &&
     EX['EX-SOCLE-R1-05'].preset.prog === 'blues' && EX['EX-DJ-SOLO-05'].preset.prog === 'jazzfunk');
  ok('3.5 P3 : la poche se travaille sur la nappe (ghostPendule partout)',
     ['01','02','03','04','05'].every(n => EX['EX-SOCLE-P3-'+n].preset.pattern === 'ghostPendule'));
  ok('3.6 COL : plage solo entièrement au clic (espace assumé)',
     ['01','02','03','04','05'].every(n => EX['EX-CJ-COL-'+n].preset.metro === true));
  ok('3.7 SOLO-04 : jouer les espaces (drop-out actif)', EX['EX-DJ-SOLO-04'].preset.drop.on === true);

  // 4. vocalisation fondue dans I4 (P-5 §7.2, ancrages confirmés §9.6)
  ok('4.1 I4-01 : chanter puis jouer', /chante/i.test(EX['EX-SOCLE-I4-01'].consigne));
  ok('4.2 I4-02 : question-réponse passe par la voix', /chante/i.test(EX['EX-SOCLE-I4-02'].consigne));

  // 5. rendu : onglet Artiste, colonnes asymétriques (6 modules chacune)
  P.showNiveau('artiste');
  ok('5.1 onglet Artiste actif', !!D.querySelector('.pf-niv-tab.active[data-niv="artiste"]'));
  const cols = D.querySelectorAll('#pfRoot .pf-col');
  const mids = i => Array.from(cols[i].querySelectorAll('.pf-mod')).map(m => m.getAttribute('data-mid'));
  eq('5.2 colonne cajón : P1→P2→P3→I4→R1→COL', JSON.stringify(mids(0)),
     JSON.stringify(['MOD-CJ-Ar-P1','MOD-CJ-Ar-P2','MOD-CJ-Ar-P3','MOD-CJ-Ar-I4','MOD-CJ-Ar-R1','MOD-CJ-Ar-COL']));
  eq('5.3 colonne djembé : P1→P2→P3→I4→R1→SOLO', JSON.stringify(mids(1)),
     JSON.stringify(['MOD-DJ-Ar-P1','MOD-DJ-Ar-P2','MOD-DJ-Ar-P3','MOD-DJ-Ar-I4','MOD-DJ-Ar-R1','MOD-DJ-Ar-SOLO']));
  eq('5.4 soixante cartes Artiste (12 modules × 5)', D.querySelectorAll('#pfRoot .pf-card').length, 60);
  ok('5.5 EX-SOCLE-P1-01 marqué partagé', cardOf('cajon','EX-SOCLE-P1-01').classList.contains('pf-shared'));
  ok('5.6 EX-DJ-SOLO-01 non partagé (idiomatique)', !cardOf('djembe','EX-DJ-SOLO-01').classList.contains('pf-shared'));

  // 6. chargement de presets via l'UI
  cardOf('cajon','EX-SOCLE-P1-02').querySelector('.pf-load').click();
  ok('6.1 P1-02 chargé : clic seul + machine gap (mode fixe, cible pulse)',
     W.fmMetroBass().state.on === false && W.eval('S.gap.mode') === 'fixed' && D.getElementById('gapTarget').value === 'pulse');   // R-4a : l'état gap fait foi
  cardOf('cajon','EX-SOCLE-P1-04').querySelector('.pf-load').click();
  let b = W.fmMetroBass().state;
  ok('6.2 P1-04 chargé : basse ON, pattern octaves', b.on === true && b.pattern === 'octaves');
  cardOf('cajon','EX-SOCLE-P3-05').querySelector('.pf-load').click();
  b = W.fmMetroBass().state;
  ok('6.3 P3-05 chargé : ghostPendule sur dorien (Chameleon)', b.pattern === 'ghostPendule' && b.prog === 'dorien');
  cardOf('djembe','EX-DJ-SOLO-05').querySelector('.pf-load').click();
  b = W.fmMetroBass().state;
  ok('6.4 SOLO-05 chargé : syncopeGrave sur jazzfunk', b.pattern === 'syncopeGrave' && b.prog === 'jazzfunk');
  cardOf('cajon','EX-CJ-COL-02').querySelector('.pf-load').click();
  ok('6.5 COL-02 chargé : clic seul, tempo 69', W.fmMetroBass().state.on === false && D.getElementById('tempoValue').textContent === '69');

  console.log('\n--- P-8 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL === 0 ? 0 : 1);
}

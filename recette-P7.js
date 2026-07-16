/* recette-P7.js — parcours funk, étape P-7 (peuplement du niveau Avancé).
   Headless jsdom : mêmes stubs que recette-P6 (Web Audio / canvas / Supabase mocké).
   Vérifie l'intégrité des données Avancé (10 modules, 35 exercices, socle B3/I1/R2, 4+1),
   l'asymétrie idiomatique (CYM cajón seul / CALL djembé seul, codes asymétriques — décision
   Jean §9.2), les presets (basse, clic, drop), le partage, le rendu et l'onglet Avancé.
   Usage : node recette-P7.js [chemin/apprendre.html]  (défaut ./apprendre.html — R-4a : le parcours vit sur apprendre.html) */
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
  console.log('\n=== recette-P7 · parcours funk (peuplement Avancé) ===\n');

  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe', realErrors.length === 0);
  ok('0.2 hook fmMetroParcours présent', typeof W.fmMetroParcours === 'function');

  const P = W.fmMetroParcours();
  const EX = P.data.EXERCISES, MOD = P.data.MODULES;
  const avMods = Object.keys(MOD).filter(id => MOD[id].niveau === 'avance');
  const avEx = Array.from(new Set(avMods.reduce((a, id) => a.concat(MOD[id].exercices), [])));

  // 1. intégrité des données Avancé
  eq('1.1 dix modules Avancé (4 objets × 2 + 2 idiomatiques)', avMods.length, 10);
  eq('1.2 trente-cinq exercices Avancé distincts', avEx.length, 35);
  const avIds = ['B3','I1','R2','D3'].reduce((a,c)=>a.concat(['MOD-CJ-Av-'+c,'MOD-DJ-Av-'+c]),[])
    .concat(['MOD-CJ-Av-CYM','MOD-DJ-Av-CALL']);
  ok('1.3 les 10 IDs de modules Avancé présents', avIds.every(id => !!MOD[id]));
  let allFive = true, allRefs = true, allKinds = true, allAv = true;
  avMods.forEach(id => {
    const m = MOD[id];
    if (m.exercices.length !== 5) allFive = false;
    if (m.niveau !== 'avance') allAv = false;
    const kinds = m.exercices.map(e => (EX[e] || {}).kind);
    if (kinds.filter(k => k === 'atome').length !== 4 || kinds.filter(k => k === 'synthese').length !== 1) allKinds = false;
    m.exercices.forEach(e => { if (!EX[e]) allRefs = false; });
  });
  ok('1.4 chaque module Avancé = 5 exercices', allFive);
  ok('1.5 chaque module Avancé = 4 atomes + 1 synthèse', allKinds);
  ok('1.6 toutes les références Avancé existent', allRefs);
  ok('1.7 tous les modules Avancé au niveau avance', allAv);

  // 2. socle / propre / asymétrie idiomatique (décision Jean : codes asymétriques)
  ok('2.1 B3/I1/R2 = socle (mêmes exercices cajón/djembé)',
     ['B3','I1','R2'].every(c => JSON.stringify(MOD['MOD-CJ-Av-'+c].exercices) === JSON.stringify(MOD['MOD-DJ-Av-'+c].exercices)));
  ok('2.2 D3 = propre (exercices distincts cajón/djembé)',
     MOD['MOD-CJ-Av-D3'].exercices[0] !== MOD['MOD-DJ-Av-D3'].exercices[0]);
  ok('2.3 CYM côté cajón seulement / CALL côté djembé seulement',
     !MOD['MOD-DJ-Av-CYM'] && !MOD['MOD-CJ-Av-CALL'] &&
     MOD['MOD-CJ-Av-CYM'].parcours === 'cajon' && MOD['MOD-DJ-Av-CALL'].parcours === 'djembe');
  ok('2.4 exercices CYM propres (EX-CJ-) et CALL propres (EX-DJ-)',
     MOD['MOD-CJ-Av-CYM'].exercices.every(e => /^EX-CJ-CYM-/.test(e)) &&
     MOD['MOD-DJ-Av-CALL'].exercices.every(e => /^EX-DJ-CALL-/.test(e)));

  // 3. presets (spec P-7 §4)
  eq('3.1 B3-01 : basse syncopeGrave/vamp1', EX['EX-SOCLE-B3-01'].preset.pattern + '/' + EX['EX-SOCLE-B3-01'].preset.prog, 'syncopeGrave/vamp1');
  ok('3.2 B3-04 : drop-out {everyN:4, lenBeats:2}',
     EX['EX-SOCLE-B3-04'].preset.drop.on === true && EX['EX-SOCLE-B3-04'].preset.drop.everyN === 4 && EX['EX-SOCLE-B3-04'].preset.drop.lenBeats === 2);
  ok('3.3 I1-04 : drop-out mesure entière', EX['EX-SOCLE-I1-04'].preset.drop.lenBeats === 4);
  ok('3.4 R2-01/02/04 : clic seul (clave et 3-contre-2 s\'apprennent au clic)',
     ['01','02','04'].every(n => EX['EX-SOCLE-R2-'+n].preset.metro === true));
  eq('3.5 R2-04 : tempo lent (69)', EX['EX-SOCLE-R2-04'].preset.tempo, 69);
  ok('3.6 D3 : atomes de geste au clic, fill et synthèse sur groove',
     EX['EX-CJ-D3-01'].preset.metro === true && EX['EX-DJ-D3-01'].preset.metro === true &&
     EX['EX-CJ-D3-04'].preset.pattern === 'theOne' && EX['EX-CJ-D3-05'].preset.pattern === 'ghostPendule');
  ok('3.7 CYM : 4 atomes au clic, synthèse sur groove (theOne/vamp2)',
     ['01','02','03','04'].every(n => EX['EX-CJ-CYM-'+n].preset.metro === true) &&
     EX['EX-CJ-CYM-05'].preset.pattern === 'theOne' && EX['EX-CJ-CYM-05'].preset.prog === 'vamp2');
  ok('3.8 CALL-05 : cycle avec drop-out long {everyN:8, lenBeats:4}',
     EX['EX-DJ-CALL-05'].preset.drop.everyN === 8 && EX['EX-DJ-CALL-05'].preset.drop.lenBeats === 4);
  ok('3.9 synthèses Avancé sur vamp2 (progressions riches réservées à l\'Artiste)',
     ['EX-SOCLE-B3-05','EX-SOCLE-I1-05','EX-SOCLE-R2-05','EX-CJ-D3-05','EX-DJ-D3-05','EX-CJ-CYM-05','EX-DJ-CALL-05']
       .every(e => EX[e].preset.prog === 'vamp2'));

  // 4. rendu : onglet Avancé, colonnes asymétriques
  P.showNiveau('avance');
  eq('4.1 niveaux peuplés = les 4', JSON.stringify(P.niveauxPeuples()),
     JSON.stringify(['debutant','intermediaire','avance','artiste']));
  ok('4.2 onglet Avancé actif', !!D.querySelector('.pf-niv-tab.active[data-niv="avance"]'));
  const cols = D.querySelectorAll('#pfRoot .pf-col');
  const mids = i => Array.from(cols[i].querySelectorAll('.pf-mod')).map(m => m.getAttribute('data-mid'));
  eq('4.3 colonne cajón : B3→I1→R2→D3→CYM', JSON.stringify(mids(0)),
     JSON.stringify(['MOD-CJ-Av-B3','MOD-CJ-Av-I1','MOD-CJ-Av-R2','MOD-CJ-Av-D3','MOD-CJ-Av-CYM']));
  eq('4.4 colonne djembé : B3→I1→R2→D3→CALL', JSON.stringify(mids(1)),
     JSON.stringify(['MOD-DJ-Av-B3','MOD-DJ-Av-I1','MOD-DJ-Av-R2','MOD-DJ-Av-D3','MOD-DJ-Av-CALL']));
  eq('4.5 cinquante cartes Avancé (10 modules × 5)', D.querySelectorAll('#pfRoot .pf-card').length, 50);
  ok('4.6 EX-SOCLE-B3-01 marqué partagé', cardOf('cajon','EX-SOCLE-B3-01').classList.contains('pf-shared'));
  ok('4.7 EX-CJ-CYM-01 non partagé (idiomatique)', !cardOf('cajon','EX-CJ-CYM-01').classList.contains('pf-shared'));

  // 5. chargement de presets via l'UI
  cardOf('cajon','EX-SOCLE-B3-01').querySelector('.pf-load').click();
  let b = W.fmMetroBass().state;
  ok('5.1 B3-01 chargé : basse ON, syncopeGrave/vamp1', b.on === true && b.pattern === 'syncopeGrave' && b.prog === 'vamp1');
  cardOf('cajon','EX-SOCLE-B3-04').querySelector('.pf-load').click();
  b = W.fmMetroBass().state;
  ok('5.2 B3-04 chargé : drop-out actif (everyN 4, lenBeats 2)', b.drop.on === true && b.drop.everyN === 4 && b.drop.lenBeats === 2);
  cardOf('cajon','EX-SOCLE-R2-01').querySelector('.pf-load').click();
  ok('5.3 R2-01 chargé : clic seul (basse OFF)', W.fmMetroBass().state.on === false);
  eq('5.4 R2-01 chargé : tempo 76', D.getElementById('tempoValue').textContent, '76');
  cardOf('djembe','EX-DJ-CALL-05').querySelector('.pf-load').click();
  b = W.fmMetroBass().state;
  ok('5.5 CALL-05 chargé : basse ON, drop everyN 8', b.on === true && b.drop.everyN === 8);

  console.log('\n--- P-7 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL === 0 ? 0 : 1);
}

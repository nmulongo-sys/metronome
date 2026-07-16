/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.1 : « Synthèse basse funk »
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas. Pilotage par le DOM (case bassOn,
   sélecteurs bassKey/bassPattern) ; observation via le hook de diagnostic
   window.fmMetroBass() (lecture + recalculs idempotents, cf. index.html).

   Portée 5.1 (spec §7) : events `bass` aux fracs attendues ; déterminisme ;
   no-op si off ; garde famille binaire ; résolveur chromatique (tonalité E,
   transposition). L'audibilité Android (~41 Hz) est un critère d'oreille,
   hors headless.

   Usage : node recette-5-1.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ---- mini-cadre d'assertions -------------------------------------------------
let pass = 0, fail = 0;
const EPS = 0.5; // Hz (tolérance fréquence)
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? EPS : eps), msg + '  (' + a + ' \u2248 ' + b + ')'); }
function eqArr(a, b) { return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9); }

// ---- stubs Web Audio (aucun son ; le load ne touche pas l'audio, mais on
//      protège ensureCtx() au cas où) -----------------------------------------
function makeParam() { return { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }; }
function makeNode() {
  return {
    frequency: makeParam(), gain: makeParam(), Q: makeParam(), type: '',
    connect() {}, start() {}, stop() {}, buffer: null,
  };
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode(); }
  createGain() { return makeNode(); }
  createOscillator() { return makeNode(); }
  createBiquadFilter() { return makeNode(); }
  createBufferSource() { return makeNode(); }
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  resume() {}
}

// ---- construction du DOM -----------------------------------------------------
// R-4b : la surface testée (couches, basse, percussion, répertoire) vit sur
// pratiquer.html depuis la refonte de l'accueil (argument fichier conservé).
const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
const html = require('./recette-harnais').chargeHtml(FILE);   // R-2 : inline les corpus/*.js
const dom = new JSDOM(html, {
  url: 'http://localhost/',          // origine réelle → localStorage opérationnel
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = FakeAudioContext;
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    // canvas : getContext renvoie un stub chaînable (drawStatic est appelé à l'INIT)
    const proxy = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? {} : (k === 'measureText' ? (() => ({ width: 0 })) : (k === 'getImageData' ? (() => ({ data: [] })) : (typeof k === 'string' ? () => proxy : undefined)))) });
    window.HTMLCanvasElement.prototype.getContext = () => proxy;
  },
});
const { window } = dom;
const $ = id => window.document.getElementById(id);

function boot(cb) {
  // le script est synchrone ; l'IIFE a déjà tourné à la fin du parse
  if (typeof window.fmMetroBass === 'function') return cb();
  setTimeout(() => boot(cb), 10);
}

function setBass(on, key, pattern) {
  if (on != null) { $('bassOn').checked = on; $('bassOn').dispatchEvent(new window.Event('change')); }
  if (key != null) { $('bassKey').value = key; $('bassKey').dispatchEvent(new window.Event('change')); }
  if (pattern != null) { $('bassPattern').value = pattern; $('bassPattern').dispatchEvent(new window.Event('change')); }
}

boot(() => {
  console.log('\n=== Recette 5.1 — synthèse basse funk ===\n');
  const B = window.fmMetroBass;

  // --- 1. No-op quand la basse est OFF (état par défaut) ---------------------
  console.log('[1] No-op si off');
  ok(B().state.on === false, 'basse désactivée par défaut');
  ok(B().realize().length === 0, 'aucune note réalisée quand off');
  ok(B().bassEvents().length === 0, 'aucun event layer=bass quand off');

  // --- 2. Activation : fracs et articulations attendues (theOne/vamp1) -------
  console.log('\n[2] theOne sur vamp1 — fracs & articulations (déterministe)');
  setBass(true, 'E', 'theOne');
  const real = B().realize();
  const fracs = real.map(r => r.frac);
  const arts = real.map(r => r.note.art);
  // theOne : pas 0,6,8,14 joués (pas 10 = w0.4 < 0.5, exclu en déterministe)
  ok(eqArr(fracs, [0, 6 / 16, 8 / 16, 14 / 16]), 'fracs = [0, .375, .5, .875] (pas 10 exclu)');
  ok(JSON.stringify(arts) === JSON.stringify(['finger', 'ghost', 'finger', 'ghost']), 'articulations = finger/ghost/finger/ghost');
  ok(real.every(r => r.note.gain > 0 && r.note.dur > 0 && r.note.freq > 0), 'chaque note a freq/gain/dur > 0');

  // --- 3. Events dans le pipeline (layer bass, famille binaire) --------------
  console.log('\n[3] computeCycle : events layer=bass');
  const bev = B().bassEvents();
  ok(bev.length === 4, '4 events bass empilés');
  ok(bev.every(e => e.layer === 'bass' && e.note), 'tous layer=bass avec note');
  ok(eqArr(bev.map(e => e.frac).sort((a, b) => a - b), [0, .375, .5, .875]), 'fracs des events cohérentes');

  // --- 4. Déterminisme : deux réalisations identiques -----------------------
  console.log('\n[4] Déterminisme');
  const r1 = JSON.stringify(B().realize());
  const r2 = JSON.stringify(B().realize());
  ok(r1 === r2, 'deux réalisations bit-à-bit identiques');

  // --- 5. Résolveur chromatique : tonalité E puis transposition -------------
  console.log('\n[5] Résolveur chromatique');
  const b = B();
  near(b.keyRootFreq('E'), 41.203, 0.05, 'E1 \u2248 41.203 Hz (corde de basse à vide)');
  near(b.noteFreq('E', 'I', 'R'), 41.203, 0.05, 'R (E7) = E1');
  near(b.noteFreq('E', 'I', '5'), 41.203 * Math.pow(2, 7 / 12), 0.1, '5 (E7) = quinte juste au-dessus de E1');
  near(b.noteFreq('E', 'I', 'oct'), 82.407, 0.1, 'oct (E7) = E2');
  // transposition E -> F : tout monte d'un demi-ton
  setBass(null, 'F', null);
  const rF = B().realize();
  const ratio = rF[0].note.freq / real[0].note.freq;
  near(ratio, Math.pow(2, 1 / 12), 0.001, 'E\u2192F : la fondamentale monte d\'un demi-ton (\u00d72^(1/12))');
  setBass(null, 'E', null);

  // --- 6. Garde famille binaire (basse muette en ternaire) ------------------
  console.log('\n[6] Garde famille binaire');
  // claveCount=12 bascule la famille en ternaire (setFamily('tern'))
  $('claveCount').value = '12';
  $('claveCount').dispatchEvent(new window.Event('change'));
  ok(B().bassEvents().length === 0, 'famille ternaire : aucun event bass (v1 binaire seulement)');
  $('claveCount').value = '16';
  $('claveCount').dispatchEvent(new window.Event('change'));
  ok(B().bassEvents().length === 4, 'retour binaire : events bass rétablis');

  // --- 7. Non-régression : la pulsation reste, off = zéro empreinte bass -----
  console.log('\n[7] Non-régression passes 1–4');
  setBass(false, null, null);
  const allOff = B().bassEvents();
  ok(allOff.length === 0, 'basse off : plus aucun event bass');
  // la couche pulsation (beat) n'est pas exposée par le hook bass ; on vérifie
  // indirectement que couper la basse ne casse pas computeCycle (pas d'exception)
  ok(true, 'computeCycle s\'exécute sans exception basse off');

  // --- 8. Persistance ---------------------------------------------------------
  console.log('\n[8] Persistance localStorage');
  setBass(true, 'G', null);
  const saved = JSON.parse(window.localStorage.getItem('fm-metro-bass') || '{}');
  ok(saved.on === true && saved.key === 'G', 'fm-metro-bass reflète on=true, key=G');

  // ---- bilan -----------------------------------------------------------------
  console.log('\n=== Bilan : ' + pass + '/' + (pass + fail) + ' \u2014 ' + (fail === 0 ? 'TOUT PASSE' : (fail + ' ÉCHEC(S)')) + ' ===\n');
  process.exit(fail === 0 ? 0 : 1);
});

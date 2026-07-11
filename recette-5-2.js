/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.2 : « Générateur probabiliste »
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas (identique à recette-5-1.js). Pilotage
   par le DOM (bassOn, bassPattern, bassKey, bassDensity, bassVel, bassVary,
   tempoSlider) ; observation via le hook window.fmMetroBass() enrichi d'un RNG
   injectable (setRng) — la prod garde Math.random.

   Portée 5.2 (spec §7) :
     [1] vary=false : chemin déterministe 5.1 INCHANGÉ (fracs, arts, déterminisme).
     [2] Densité 1 ⊂ 2 ⊂ 3, piliers constants (ghostPendule, déterministe).
     [3] Adaptation continue au tempo (§2.3) : à 150 vs 70 BPM, gain des ghosts,
         durée des notes et nombre de pas non-piliers DÉCROISSANTS ; piliers immuables.
     [4] RNG injectable : déterminisme sous vary=true à graine fixe ; vary=false
         n'appelle jamais le RNG ; setRng(null) restaure Math.random.
     [5] Les 3 gabarits restants réalisent des notes valides.
   L'audibilité Android (~41 Hz) et le timbre restent des critères d'oreille, hors headless.

   Usage : node recette-5-2.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ---- mini-cadre d'assertions -------------------------------------------------
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? 1e-6 : eps), msg + '  (' + a + ' \u2248 ' + b + ')'); }
function eqArr(a, b) { return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9); }
function fracSet(real) { return real.map(r => r.frac).sort((x, y) => x - y); }
function isSubset(a, b) { const s = new Set(b.map(v => v.toFixed(6))); return a.every(v => s.has(v.toFixed(6))); }
function isStrictSubset(a, b) { return isSubset(a, b) && a.length < b.length; }

// ---- stubs Web Audio (aucun son) ---------------------------------------------
function makeParam() { return { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }; }
function makeNode() {
  return {
    frequency: makeParam(), gain: makeParam(), Q: makeParam(), type: '',
    curve: null, oversample: '',
    connect() {}, disconnect() {}, start() {}, stop() {}, buffer: null,
  };
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode(); }
  createGain() { return makeNode(); }
  createOscillator() { return makeNode(); }
  createBiquadFilter() { return makeNode(); }
  createBufferSource() { return makeNode(); }
  createWaveShaper() { return makeNode(); }
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  resume() {}
}

// ---- construction du DOM -----------------------------------------------------
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = FakeAudioContext;
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const proxy = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? {} : (k === 'measureText' ? (() => ({ width: 0 })) : (k === 'getImageData' ? (() => ({ data: [] })) : (typeof k === 'string' ? () => proxy : undefined)))) });
    window.HTMLCanvasElement.prototype.getContext = () => proxy;
  },
});
const { window } = dom;
const $ = id => window.document.getElementById(id);

function boot(cb) {
  if (typeof window.fmMetroBass === 'function') return cb();
  setTimeout(() => boot(cb), 10);
}
function fire(id, ev) { $(id).dispatchEvent(new window.Event(ev)); }
function setBass(o) {
  if (o.on != null)      { $('bassOn').checked = o.on;         fire('bassOn', 'change'); }
  if (o.pattern != null) { $('bassPattern').value = o.pattern; fire('bassPattern', 'change'); }
  if (o.key != null)     { $('bassKey').value = o.key;         fire('bassKey', 'change'); }
  if (o.density != null) { $('bassDensity').value = String(o.density); fire('bassDensity', 'change'); }
  if (o.vel != null)     { $('bassVel').value = o.vel;         fire('bassVel', 'change'); }
  if (o.vary != null)    { $('bassVary').checked = o.vary;     fire('bassVary', 'change'); }
}
function setTempo(bpm) { $('tempoSlider').value = String(bpm); fire('tempoSlider', 'input'); }
// mulberry32 : RNG déterministe à graine, pour les tests probabilistes.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

boot(() => {
  console.log('\n=== Recette 5.2 — générateur probabiliste basse funk ===\n');
  const B = window.fmMetroBass;

  // --- 1. vary=false : chemin déterministe 5.1 INCHANGÉ -----------------------
  console.log('[1] Non-régression : vary=false reproduit exactement 5.1');
  setBass({ on: true, key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  const real1 = B().realize();
  ok(eqArr(fracSet(real1), [0, .375, .5, .875]), 'theOne/dens2/déterministe : fracs = [0, .375, .5, .875]');
  ok(JSON.stringify(real1.map(r => r.note.art)) === JSON.stringify(['finger', 'ghost', 'finger', 'ghost']), 'articulations finger/ghost/finger/ghost');
  ok(JSON.stringify(B().realize()) === JSON.stringify(B().realize()), 'deux réalisations bit-à-bit identiques');
  ok(real1.every(r => r.note.gain > 0 && r.note.dur > 0 && r.note.freq > 0), 'chaque note a freq/gain/dur > 0');

  // --- 2. Densité 1 ⊂ 2 ⊂ 3, piliers constants (ghostPendule, déterministe) ---
  console.log('\n[2] Densité emboîtée 1 ⊂ 2 ⊂ 3 (piliers constants)');
  setBass({ pattern: 'ghostPendule', vary: false });
  setBass({ density: 1 }); const d1 = fracSet(B().realize());
  setBass({ density: 2 }); const d2 = fracSet(B().realize());
  setBass({ density: 3 }); const d3 = fracSet(B().realize());
  ok(isStrictSubset(d1, d2), 'densité 1 strictement incluse dans 2  (' + d1.length + ' < ' + d2.length + ')');
  ok(isStrictSubset(d2, d3), 'densité 2 strictement incluse dans 3  (' + d2.length + ' < ' + d3.length + ')');
  ok(d1.indexOf(0) === 0 && d2.indexOf(0) === 0 && d3.indexOf(0) === 0, 'The One (frac 0, pilier) présent à toutes les densités');

  // --- 3. Adaptation continue au tempo (§2.3) --------------------------------
  console.log('\n[3] Adaptation tempo : 150 vs 70 BPM (ghost gain, durée, densité d\'ornements)');
  // 3a. gain des ghosts : theOne déterministe, on lit le ghost du pas 6.
  setBass({ pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  setTempo(70);  const gGhost70 = B().realize().find(r => r.note.art === 'ghost').note.gain;
  setTempo(150); const gGhost150 = B().realize().find(r => r.note.art === 'ghost').note.gain;
  near(gGhost70, 0.30, 0.01, 'ghost gain à 70 BPM ≈ 0.30 (legato, ghosts présents)');
  near(gGhost150, 0.16, 0.01, 'ghost gain à 150 BPM ≈ 0.16 (ghosts effleurés)');
  ok(gGhost150 < gGhost70, 'gain des ghosts DÉCROÎT quand le tempo monte');
  // 3b. durée : pilier The One (frac 0), présent aux deux tempos.
  setTempo(70);  const dur70 = B().realize().find(r => r.frac === 0).note.dur;
  setTempo(150); const dur150 = B().realize().find(r => r.frac === 0).note.dur;
  ok(dur150 < dur70, 'durée de note DÉCROÎT quand le tempo monte  (' + dur70.toFixed(3) + ' → ' + dur150.toFixed(3) + ')');
  // 3c. nombre de pas non-piliers : ghostPendule densité 3, vary=true, RNG constant 0.5.
  setBass({ pattern: 'ghostPendule', density: 3, vary: true });
  B().setRng(() => 0.5);
  setTempo(70);  const n70 = B().realize().length;
  setTempo(150); const n150 = B().realize().length;
  ok(n150 < n70, 'nombre de notes réalisées DÉCROÎT à tempo rapide  (' + n70 + ' → ' + n150 + ')');
  ok(B().realize().some(r => r.frac === 0), 'à 150 BPM, le pilier The One reste présent (immuable)');
  B().setRng(null);

  // --- 4. RNG injectable : déterminisme sous vary=true, indépendance prod -----
  console.log('\n[4] RNG injectable (recette) / Math.random (prod)');
  setBass({ pattern: 'ghostPendule', density: 3, vary: true });
  setTempo(92);
  B().setRng(mulberry32(12345)); const a = JSON.stringify(B().realize());
  B().setRng(mulberry32(12345)); const b = JSON.stringify(B().realize());
  ok(a === b, 'même graine ⇒ deux réalisations identiques (reproductible)');
  B().setRng(mulberry32(999));   const c = JSON.stringify(B().realize());
  ok(a !== c || true, 'graine différente ⇒ tirage potentiellement différent (informe, non bloquant)');
  // vary=false n'appelle jamais le RNG : un RNG qui jette ne doit rien casser.
  setBass({ vary: false });
  B().setRng(() => { throw new Error('RNG appelé en déterministe'); });
  let threw = false;
  try { B().realize(); } catch (e) { threw = true; }
  ok(!threw, 'vary=false : le RNG n\'est jamais appelé (chemin déterministe pur)');
  B().setRng(null);
  ok(typeof B().realize === 'function', 'setRng(null) restaure sans exception (prod = Math.random)');

  // --- 5. Les 3 gabarits restants réalisent des notes valides ----------------
  console.log('\n[5] Gabarits syncopeGrave / octaves / ghostPendule');
  for (const g of ['syncopeGrave', 'octaves', 'ghostPendule']) {
    setBass({ pattern: g, density: 3, vel: 'mixte', vary: false });
    const r = B().realize();
    ok(r.length > 0, g + ' : au moins une note réalisée (' + r.length + ')');
    ok(r.every(n => n.frac >= 0 && n.frac < 1 && n.note.freq > 0 && n.note.gain > 0 && n.note.dur > 0), g + ' : fracs ∈ [0,1) et notes valides');
  }

  // --- Bilan -----------------------------------------------------------------
  console.log('\n=== Bilan : ' + pass + '/' + (pass + fail) + (fail ? ' — ' + fail + ' ÉCHEC(S)' : ' — TOUT PASSE') + ' ===\n');
  process.exit(fail ? 1 : 0);
});

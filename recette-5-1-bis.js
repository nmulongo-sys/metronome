/* recette-5-1-bis.js — smoke-test de la refonte synthèse basse (audibilité 5.1-bis)
 *
 * Portée : la logique générative (fracs/degrés/déterminisme) est INCHANGÉE et reste
 * couverte par recette-5-1.js (20/20). Ici on teste uniquement ce que 5.1-bis a touché :
 * la SYNTHÈSE. On déclenche réellement playBass sur les 4 articulations via le hook
 * window.fmMetroBass().probeVoice, avec un stub Web Audio qui inclut createWaveShaper,
 * et on vérifie que (a) aucune exception, (b) l'exciteur harmonique (WaveShaper) est
 * bien dans le graphe, (c) le corps est un sawtooth (le triangle muet est retiré),
 * (d) le sous-octave 20 Hz a disparu (aucun oscillateur sous la fondamentale).
 *
 * Le vrai juge du timbre reste l'oreille sur Android — un headless ne l'évalue pas.
 *
 * Lancement : node recette-5-1-bis.js   (jsdom requis)
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ---- mini-cadre d'assertions -------------------------------------------------
let passed = 0, failed = 0;
function ok(cond, msg) {
  if (cond) { passed++; console.log('  \u2713 ' + msg); }
  else { failed++; console.log('  \u2717 ' + msg); }
}

// ---- instrumentation Web Audio : on enregistre ce que la synthèse construit -----
const seen = { waveshaper: 0, curveLens: [], oversample: [], oscFreqs: [], oscTypes: [] };

function makeParam() {
  return { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} };
}
function makeNode(kind) {
  const n = { _kind: kind, gain: makeParam(), Q: makeParam(), connect() {}, start() {}, stop() {}, buffer: null };
  if (kind === 'osc') {
    // capte la fréquence posée (o.frequency.value = freq) et le type d'onde
    let f = 0, ty = '';
    n.frequency = { get value() { return f; }, set value(v) { f = v; seen.oscFreqs.push(v); },
                    setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} };
    Object.defineProperty(n, 'type', { set(v) { ty = v; seen.oscTypes.push(v); }, get() { return ty; } });
  } else {
    n.frequency = makeParam();
    n.type = '';
  }
  return n;
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode('dest'); }
  createGain() { return makeNode('gain'); }
  createOscillator() { return makeNode('osc'); }
  createBiquadFilter() { return makeNode('filter'); }
  createBufferSource() { return makeNode('src'); }
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  createWaveShaper() {
    seen.waveshaper++;
    const n = makeNode('shaper');
    let _curve = null, _os = 'none';
    Object.defineProperty(n, 'curve', { set(v) { _curve = v; seen.curveLens.push(v ? v.length : 0); }, get() { return _curve; } });
    Object.defineProperty(n, 'oversample', { set(v) { _os = v; seen.oversample.push(v); }, get() { return _os; } });
    return n;
  }
  resume() {}
}

// ---- construction du DOM (mêmes stubs de rendu que recette-5-1) ---------------
const html = require('./recette-harnais').chargeHtml();   // R-2 : inline les corpus/*.js
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
  }
});
const { window } = dom;

function reset() { seen.waveshaper = 0; seen.curveLens = []; seen.oversample = []; seen.oscFreqs = []; seen.oscTypes = []; }

console.log('=== recette 5.1-bis : smoke-test synthèse (exciteur harmonique) ===');

// --- 1. Le hook expose bien la sonde ------------------------------------------
console.log('\n[1] Hook de sonde');
const bass = window.fmMetroBass();
ok(bass && typeof bass.probeVoice === 'function', 'window.fmMetroBass().probeVoice existe');

// --- 2. Les 4 articulations se construisent sans exception --------------------
console.log('\n[2] probeVoice sur les 4 articulations — aucune exception');
const ARTS = ['finger', 'slap', 'pop', 'ghost'];
const perArt = {};
for (const art of ARTS) {
  reset();
  let threw = null;
  try { bass.probeVoice(art, 0); } catch (e) { threw = e; }
  perArt[art] = { waveshaper: seen.waveshaper, oscTypes: seen.oscTypes.slice(), oscFreqs: seen.oscFreqs.slice() };
  ok(!threw, art + ' : construit sans exception' + (threw ? ' (' + threw.message + ')' : ''));
}

// --- 3. L'exciteur harmonique est dans le graphe -----------------------------
console.log('\n[3] Exciteur harmonique (WaveShaper) câblé');
for (const art of ARTS) ok(perArt[art].waveshaper >= 1, art + ' : un WaveShaper créé (exciteur présent)');
reset(); bass.probeVoice('finger', 0);
ok(seen.curveLens.length >= 1 && seen.curveLens[0] === 2048, 'courbe de saturation renseignée (2048 points)');
ok(seen.oversample.indexOf('4x') !== -1, "oversample '4x' posé (anti-alias)");

// --- 4. Corps en sawtooth, plus de triangle ni de sous-octave ----------------
console.log('\n[4] Corps saw ; triangle et sous-octave 20 Hz supprimés');
for (const art of ARTS) {
  ok(perArt[art].oscTypes.indexOf('sawtooth') !== -1, art + ' : oscillateur sawtooth présent');
  ok(perArt[art].oscTypes.indexOf('triangle') === -1, art + ' : plus aucun triangle');
}
// sous-octave : en E, la fondamentale probée = E1 ≈ 41.203 Hz ; aucun oscillateur ne
// doit être créé à freq/2 (~20.6 Hz). On vérifie qu'aucune fréquence d'oscillateur
// n'est inférieure à ~30 Hz sur une probe finger.
reset(); bass.probeVoice('finger', 0);
const minOsc = Math.min.apply(null, seen.oscFreqs.length ? seen.oscFreqs : [999]);
ok(minOsc >= 30, 'aucun oscillateur sous ~30 Hz (sous-octave 20 Hz retiré) — min = ' + minOsc.toFixed(2) + ' Hz');

// --- 5. Non-régression express de la logique (inchangée) ---------------------
console.log('\n[5] Logique générative intacte (theOne/vamp1 déterministe)');
window.fmMetroBass().state.on = true;
window.fmMetroBass().state.key = 'E';
const fracs = window.fmMetroBass().realize().map(r => r.frac);
ok(JSON.stringify(fracs) === JSON.stringify([0, 0.375, 0.5, 0.875]), 'fracs = [0, .375, .5, .875] (inchangées)');

// ---- bilan -------------------------------------------------------------------
console.log('\n=== Bilan : ' + passed + '/' + (passed + failed) + (failed ? ' — ' + failed + ' ÉCHEC(S)' : ' — TOUT PASSE') + ' ===\n');
process.exit(failed ? 1 : 0);

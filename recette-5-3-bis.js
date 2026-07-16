/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.3-bis : « Corps / tenue de la basse »
   ----------------------------------------------------------------------------
   Correctif du staccato : durée calée sur la subdivision (plus de plafond absolu)
   et enveloppe attaque → tenue → release (au lieu du pluck-vers-zéro). La FORME de
   l'enveloppe (le sustain) n'est pas observable en headless (stubs Web Audio) → elle
   reste un critère d'oreille ; ici on garde les invariants OBSERVABLES.

   Portée 5.3-bis :
     [1] Durée finger = fraction du pas (calée sur la subdivision — plus de note tronquée
         à ~15 ms). RETOUCHE 5.3c : la fenêtre du curseur legato est recalibrée
         (L = 1 + fraction, spec metronome-passe5-5-3c-spec.md) — curseur 0 = plancher
         1,30 (ancien max -ter, validé à l'oreille) ; le dosage -bis strict (0,90,
         < stepDur) n'est plus atteignable. Les attendus suivent le plancher ; l'invariant
         anti-staccato d'origine (> 100 ms) est conservé tel quel.
     [2] Ghost reste piqué : durée ghost < durée finger au même tempo.
     [3] Monotonie tempo conservée (durée 150 < 70 BPM) ; plancher audible 20 ms tenu.
     [4] Non-régression : fracs theOne/dens2 inchangées, déterminisme intact.
     [5] Enveloppe : les 4 articulations se synthétisent sans exception (probeVoice).
     [6] Estampille de build : #buildStamp renseigné avec l'identité du build.

   Usage : node recette-5-3-bis.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? 1e-6 : eps), msg + '  (' + a + ' \u2248 ' + b + ')'); }
function eqArr(a, b) { return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9); }
function fracSet(real) { return real.map(r => r.frac).sort((x, y) => x - y); }

function makeParam() { return { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }; }
function makeNode() {
  return { frequency: makeParam(), gain: makeParam(), Q: makeParam(), type: '', curve: null, oversample: '',
    connect() {}, disconnect() {}, start() {}, stop() {}, buffer: null };
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode(); }
  createGain() { return makeNode(); } createOscillator() { return makeNode(); }
  createBiquadFilter() { return makeNode(); } createBufferSource() { return makeNode(); }
  createWaveShaper() { return makeNode(); } createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  resume() {}
}

// R-4b : la surface testée (couches, basse, percussion, répertoire) vit sur
// pratiquer.html depuis la refonte de l'accueil (argument fichier conservé).
const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
const html = require('./recette-harnais').chargeHtml(FILE);   // R-2 : inline les corpus/*.js
const dom = new JSDOM(html, {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(window) {
    window.AudioContext = FakeAudioContext; window.webkitAudioContext = FakeAudioContext;
    window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const proxy = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? {} : (k === 'measureText' ? (() => ({ width: 0 })) : (k === 'getImageData' ? (() => ({ data: [] })) : (typeof k === 'string' ? () => proxy : undefined)))) });
    window.HTMLCanvasElement.prototype.getContext = () => proxy;
  },
});
const { window } = dom;
const $ = id => window.document.getElementById(id);
function boot(cb) { if (typeof window.fmMetroBass === 'function') return cb(); setTimeout(() => boot(cb), 10); }
function fire(id, ev) { $(id).dispatchEvent(new window.Event(ev)); }
function setBass(o) {
  if (o.on != null)      { $('bassOn').checked = o.on;         fire('bassOn', 'change'); }
  if (o.pattern != null) { $('bassPattern').value = o.pattern; fire('bassPattern', 'change'); }
  if (o.prog != null)    { $('bassProg').value = o.prog;       fire('bassProg', 'change'); }
  if (o.key != null)     { $('bassKey').value = o.key;         fire('bassKey', 'change'); }
  if (o.density != null) { $('bassDensity').value = String(o.density); fire('bassDensity', 'change'); }
  if (o.vel != null)     { $('bassVel').value = o.vel;         fire('bassVel', 'change'); }
  if (o.vary != null)    { $('bassVary').checked = o.vary;     fire('bassVary', 'change'); }
}
function setTempo(bpm) { $('tempoSlider').value = String(bpm); fire('tempoSlider', 'input'); }

const BEATS = 4, STEPS = 16;
function stepDur(bpm) { return (BEATS * 60 / bpm) / STEPS; }
function durTempo(bpm) { const k = Math.max(0, Math.min(1, (bpm - 70) / 80)); return 1.15 + (0.70 - 1.15) * k; }

boot(() => {
  console.log('\n=== Recette 5.3-bis — corps / tenue de la basse ===\n');
  const B = window.fmMetroBass;
  // 5.3-ter : le curseur legato (absent en 5.3-bis) est ramené à 0 pour que les dosages testés
  // ici soient déterministes. Défensif : no-op en 5.3-bis. 5.3c : curseur 0 = plancher de la
  // fenêtre recalibrée (1,30 = ancien max -ter) — les attendus de [1] suivent.
  if ($('bassLegato')) { $('bassLegato').value = '0'; fire('bassLegato', 'input'); }

  // --- 1. Durée finger calée sur le pas (≈ 0.90 × stepDur × facteur tempo, < stepDur) ------
  console.log('[1] Durée finger = fraction du pas (calée sur la subdivision)');
  setBass({ on: true, prog: 'vamp1', key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  setTempo(92);
  const real = B().realize();
  const finger = real.find(r => r.frac === 0).note;               // The One, pilier finger
  const sd92 = stepDur(92), expFinger = sd92 * 1.30 * durTempo(92);   // 5.3c : plancher legato
  near(finger.dur, expFinger, 1e-3, 'finger dur ≈ 1.30 × stepDur × durTempo à 92 BPM (plancher 5.3c)');
  ok(finger.dur > sd92, 'finger dur > stepDur : la queue déborde — plancher legato 5.3c  (' + finger.dur.toFixed(3) + ' > ' + sd92.toFixed(3) + ')');
  ok(finger.dur > 0.10, 'finger dur > 100 ms : plus de note tronquée à ~15 ms  (' + (1000 * finger.dur).toFixed(0) + ' ms)');

  // --- 2. Ghost reste piqué : plus court que le finger au même tempo ----------------------
  console.log('\n[2] Ghost piqué : durée ghost < durée finger');
  const ghost = real.find(r => r.note.art === 'ghost').note;
  ok(ghost.dur < finger.dur, 'ghost plus court que finger  (' + (1000 * ghost.dur).toFixed(0) + ' < ' + (1000 * finger.dur).toFixed(0) + ' ms)');
  near(ghost.dur, sd92 * 0.35 * durTempo(92), 1e-3, 'ghost dur ≈ 0.35 × stepDur × durTempo');

  // --- 3. Monotonie tempo + plancher audible ---------------------------------------------
  console.log('\n[3] Monotonie tempo + plancher 20 ms');
  setTempo(70);  const d70 = B().realize().find(r => r.frac === 0).note.dur;
  setTempo(150); const d150 = B().realize().find(r => r.frac === 0).note.dur;
  ok(d150 < d70, 'durée DÉCROÎT quand le tempo monte  (' + d70.toFixed(3) + ' → ' + d150.toFixed(3) + ')');
  setTempo(240); const d240 = B().realize();
  ok(d240.every(r => r.note.dur >= 0.02 - 1e-9), 'toutes les durées ≥ plancher 20 ms même à 240 BPM');
  setTempo(92);

  // --- 4. Non-régression : fracs et déterminisme -----------------------------------------
  console.log('\n[4] Non-régression : fracs + déterminisme');
  ok(eqArr(fracSet(B().realize()), [0, .375, .5, .875]), 'theOne/dens2 : fracs = [0, .375, .5, .875] inchangées');
  ok(JSON.stringify(B().realize()) === JSON.stringify(B().realize()), 'deux réalisations bit-à-bit identiques');
  ok(B().realize().every(r => r.note.gain > 0 && r.note.dur > 0 && r.note.freq > 0), 'chaque note : gain/dur/freq > 0');

  // --- 5. Enveloppe : synthèse des 4 articulations sans exception -------------------------
  console.log('\n[5] Enveloppe valide : les 4 articulations se synthétisent');
  ['finger', 'slap', 'pop', 'ghost'].forEach(art => {
    let okc = true; try { B().probeVoice(art, 0); } catch (e) { okc = false; }
    ok(okc, 'probeVoice(' + art + ') : automation attaque→tenue→release sans exception');
  });

  // --- 6. Estampille de build ------------------------------------------------------------
  console.log('\n[6] Estampille de build affichée');
  const bs = $('buildStamp');
  ok(bs && /metronomefunk-0\.\d+\./.test(bs.textContent), 'buildStamp renseigné : « ' + (bs ? bs.textContent : '(absent)') + ' »');   // génériquée passe 5 (retouches 5.3c puis 5.4)

  console.log('\n----------------------------------------');
  console.log('  ' + pass + ' réussis, ' + fail + ' échoués sur ' + (pass + fail));
  console.log('----------------------------------------\n');
  process.exit(fail === 0 ? 0 : 1);
});

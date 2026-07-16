/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.3c : « Recalibrage du curseur legato »
   ----------------------------------------------------------------------------
   Verdict d'écoute (92 BPM) sur 5.3-ter : l'ancien max du curseur (L=1) était le MINIMUM
   acceptable. La fenêtre glisse d'un cran vers le lié : L = 1 + fraction ∈ [1, 2] —
   plancher = ancien max -ter (finger 1,30 · rel 180 ms/×0,50), défaut curseur 25
   (L=1,25), plafond L=2 (finger 1,70 · rel 300 ms/×0,70). Formules -ter prolongées,
   stockage inchangé (fraction 0–1), ghost hors curseur. Le goût reste un critère
   d'oreille — ici on prouve la MÉCANIQUE.

   Portée 5.3c (spec metronome-passe5-5-3c-spec.md) :
     [1] Défaut sur état vierge : curseur 25, L=1,25 — finger 1,40, release ×0,55.
     [2] Plancher (curseur 0) : dosages = ancien max -ter strict (durées + release).
     [3] Plafond (curseur 100) : finger 1,70 · pop 1,80, release min(0,30 ; dur×0,70).
     [4] Monotonie : durée finger strictement croissante sur toute la course.
     [5] Ghost : 0,35 constant, jamais affecté, toujours piqué.
     [6] Persistance : fraction stockée telle quelle ; valeur héritée -ter relue sans
         migration (0,5 → L=1,5, dans la zone validée).
     [7] Estampille 5.3c ; limiteur et bus basse toujours câblés.

   Usage : node recette-5-3c.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? 1e-6 : eps), msg + '  (' + a + ' ≈ ' + b + ')'); }

// ---- stubs Web Audio ENREGISTREURS (identiques à recette-5-3-ter) -------------
function makeParam() {
  return { value: 0, calls: [],
    setValueAtTime(v, t) { this.calls.push(['set', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); },
    linearRampToValueAtTime(v, t) { this.calls.push(['lin', v, t]); } };
}
let NODES = [];
function makeNode(kind) {
  const n = { kind: kind, frequency: makeParam(), gain: makeParam(), Q: makeParam(),
    threshold: makeParam(), knee: makeParam(), ratio: makeParam(), attack: makeParam(), release: makeParam(),
    type: '', curve: null, oversample: '', buffer: null, _targets: [],
    connect(x) { this._targets.push(x); }, disconnect() {}, start() {}, stop() {} };
  NODES.push(n); return n;
}
let CTX = null;
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running';
    this.destination = makeNode('destination'); CTX = this; }
  createGain() { return makeNode('gain'); }
  createOscillator() { return makeNode('osc'); }
  createBiquadFilter() { return makeNode('biquad'); }
  createBufferSource() { return makeNode('bufsrc'); }
  createWaveShaper() { return makeNode('shaper'); }
  createDynamicsCompressor() { return makeNode('compressor'); }
  createConvolver() { return makeNode('convolver'); }
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  resume() {}
}

const html = require('./recette-harnais').chargeHtml();   // R-2 : inline les corpus/*.js
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
function setLegato(pct) { $('bassLegato').value = String(pct); fire('bassLegato', 'input'); }

const BEATS = 4, STEPS = 16;
function stepDur(bpm) { return (BEATS * 60 / bpm) / STEPS; }
function durTempo(bpm) { const k = Math.max(0, Math.min(1, (bpm - 70) / 80)); return 1.15 + (0.70 - 1.15) * k; }
// L effectif d'une position de curseur (fenêtre 5.3c), et release attendu pour la note
// sonde de probeVoice (dur fixe 0,18 s).
function Leff(pct) { return 1 + pct / 100; }
function relProbe(pct) { const L = Leff(pct); return Math.min(0.06 + 0.12 * L, 0.18 * (0.30 + 0.20 * L)); }
function probeEnv(B, art, t) {
  NODES = [];
  B().probeVoice(art, t);
  return NODES.find(n => n.kind === 'gain' && n.gain.calls.length >= 4 &&
    n.gain.calls[0][0] === 'set' && n.gain.calls[0][1] === 0.0001 && Math.abs(n.gain.calls[0][2] - t) < 1e-9);
}
// Début du release lu sur l'automation : le set(sus, hEnd) posé après t.
function relStart(env, t) { const c = env.gain.calls.find(c => c[0] === 'set' && c[2] > t + 0.001); return c ? c[2] : NaN; }

boot(() => {
  console.log('\n=== Recette 5.3c — recalibrage du curseur legato ===\n');
  const B = window.fmMetroBass;
  const fingerDur = () => B().realize().find(r => r.frac === 0).note.dur;

  // --- 1. Défaut sur état vierge : curseur 25, L=1,25 ---------------------------------------
  console.log('[1] Défaut sur état vierge : curseur 25 (L=1,25)');
  setBass({ on: true, prog: 'vamp1', key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  setTempo(92);
  const sd = stepDur(92), dT = durTempo(92);
  ok($('bassLegato').value === '25', 'curseur à 25 au chargement (aucune valeur persistée)');
  near(B().state.legato, 0.25, 1e-9, 'S.bass.legato = 0,25 (fraction stockée)');
  near(fingerDur(), sd * 1.40 * dT, 1e-3, 'finger dur ≈ 1,40 × stepDur × durTempo (défaut = léger cran au-dessus du plancher)');
  const envD = probeEnv(B, 'finger', 5);
  ok(!!envD, 'enveloppe observable (automation enregistrée)');
  if (envD) near(relStart(envD, 5), 5 + 0.18 - relProbe(25), 1e-6,
    'défaut : début du release à t + dur − min(210 ms ; dur×0,55)');

  // --- 2. Plancher (curseur 0) = ancien max -ter strict --------------------------------------
  console.log('\n[2] Plancher (curseur 0) : dosages = ancien max 5.3-ter — le son validé à l’oreille');
  setLegato(0);
  near(fingerDur(), sd * 1.30 * dT, 1e-3, 'finger dur ≈ 1,30 × stepDur × durTempo (identique à l’ancien L=1)');
  setBass({ pattern: 'syncopeGrave', density: 3 });
  const pop0 = B().realize().find(r => r.note.art === 'pop');
  ok(!!pop0, 'pop présent (syncopeGrave, densité 3)');
  if (pop0) near(pop0.note.dur, sd * 1.30 * dT, 1e-3, 'pop dur ≈ 1,30 × stepDur × durTempo');
  setBass({ pattern: 'theOne', density: 2 });
  const env0 = probeEnv(B, 'finger', 10);
  if (env0) near(relStart(env0, 10), 10 + 0.18 - relProbe(0), 1e-6,
    'plancher : release min(180 ms ; dur×0,50) — la borne -ter, bit à bit');
  else ok(false, 'enveloppe plancher observable');

  // --- 3. Plafond (curseur 100) : L=2 ---------------------------------------------------------
  console.log('\n[3] Plafond (curseur 100) : très lié');
  setLegato(100);
  near(fingerDur(), sd * 1.70 * dT, 1e-3, 'finger dur ≈ 1,70 × stepDur × durTempo');
  setBass({ pattern: 'syncopeGrave', density: 3 });
  const pop1 = B().realize().find(r => r.note.art === 'pop');
  ok(pop1 && Math.abs(pop1.note.dur - sd * 1.80 * dT) <= 1e-3, 'pop dur ≈ 1,80 × stepDur × durTempo');
  setBass({ pattern: 'theOne', density: 2 });
  const env1 = probeEnv(B, 'finger', 20);
  if (env1) near(relStart(env1, 20), 20 + 0.18 - relProbe(100), 1e-6,
    'plafond : release min(300 ms ; dur×0,70)');
  else ok(false, 'enveloppe plafond observable');

  // --- 4. Monotonie sur toute la course --------------------------------------------------------
  console.log('\n[4] Monotonie : plus le curseur monte, plus la note tient');
  const durs = [0, 25, 50, 100].map(p => { setLegato(p); return fingerDur(); });
  ok(durs[0] < durs[1] && durs[1] < durs[2] && durs[2] < durs[3],
     'durée finger STRICTEMENT croissante sur curseur 0 → 25 → 50 → 100  (' + durs.map(d => d.toFixed(3)).join(' < ') + ')');

  // --- 5. Ghost : hors curseur, toujours piqué --------------------------------------------------
  console.log('\n[5] Ghost : jamais affecté par la nouvelle fenêtre');
  const gd = [0, 25, 100].map(p => { setLegato(p); return B().realize().find(r => r.note.art === 'ghost').note.dur; });
  ok(Math.abs(gd[0] - gd[1]) < 1e-9 && Math.abs(gd[1] - gd[2]) < 1e-9, 'durée ghost STRICTEMENT constante aux curseurs 0 / 25 / 100');
  near(gd[1], sd * 0.35 * dT, 1e-3, 'ghost dur ≈ 0,35 × stepDur × durTempo');
  setLegato(100);
  ok(gd[2] < fingerDur() && gd[2] < sd, 'même très lié : ghost < finger et < son pas (reste piqué)');

  // --- 6. Persistance : fraction telle quelle, héritage -ter sans migration ---------------------
  console.log('\n[6] Persistance : fraction stockée, valeur héritée relue dans la nouvelle fenêtre');
  setLegato(30);
  const saved = JSON.parse(window.localStorage.getItem('fm-metro-bass'));
  near(saved.legato, 0.3, 1e-9, 'fm-metro-bass : legato 0,30 persisté (fraction, format -ter inchangé)');
  setLegato(50);                                                 // 0,5 = ancien défaut -ter hérité
  near(fingerDur(), sd * 1.50 * dT, 1e-3, 'valeur héritée 0,5 relue sans migration → L=1,5 (zone validée)');
  setLegato(25);

  // --- 7. Estampille + bus toujours câblés -------------------------------------------------------
  console.log('\n[7] Estampille 5.3c + limiteur/bus intacts');
  const bs = $('buildStamp');
  ok(bs && /metronomefunk-0\.\d+\./.test(bs.textContent), 'buildStamp : « ' + (bs ? bs.textContent : '(absent)') + ' »');   // génériquée passe 5 (retouche 5.4 : le build avance à chaque étape)
  B().probeVoice('finger', 30);
  const bus = B().bus();
  ok(!!bus.limiter && bus.limiter.kind === 'compressor' && bus.limiter.threshold.value === -1.5,
     'limiteur master toujours présent (−1,5 dB) — il absorbe l’empilement accru');
  ok(!!bus.bassHP && bus.bassHP.frequency.value === 35 && Math.abs(bus.bassWet.gain.value - 0.12) < 1e-9,
     'bus basse intact : HP 35 Hz + réverb wet 0,12');

  console.log('\n----------------------------------------');
  console.log('  ' + pass + ' réussis, ' + fail + ' échoués sur ' + (pass + fail));
  console.log('----------------------------------------\n');
  process.exit(fail === 0 ? 0 : 1);
});

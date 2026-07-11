/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.3-ter : « Basse legato & respiration »
   ----------------------------------------------------------------------------
   Curseur « détaché ↔ lié » (durées + release), corps soutenu (palier du sweep),
   réverb courte sur bus basse (HP 35 Hz + convolver), limiteur de bus master.
   Le harnais enrichit les stubs : AudioParam ENREGISTREURS (l'automation devient
   observable), createDynamicsCompressor + createConvolver présents, connexions
   tracées (_targets). Le goût (liant, traîne, poche) reste un critère d'oreille —
   ici on prouve la MÉCANIQUE.

   Portée 5.3-ter (spec metronome-passe5-5-3-ter-spec.md) :
     [1] Chevauchement au curseur 50 : durée finger > stepDur (la queue déborde).
     [2] Bornes du curseur : plancher (curseur 0) et plafond (curseur 100), durées + release.
   RETOUCHES 5.3c (documentées, spec metronome-passe5-5-3c-spec.md §3) : la fenêtre du
   curseur a été recalibrée d'après l'écoute — L = 1 + fraction ∈ [1, 2], l'ancien max -ter
   (1,30 / rel ×0,50) devient le plancher. Les dosages attendus de [1] et [2] suivent la
   nouvelle fenêtre ; l'estampille de [7] est génériquée (même retouche que recette-5-3-bis).
   Mécanique, ghost, bus, limiteur, persistance : assertions intactes.
     [3] Ghost : hors legato (0,35 constant), toujours < finger et < son pas.
     [4] Limiteur : nœud présent, paramétré, câblé master → limiteur → destination.
     [5] Bus basse : HP 35 Hz en tête, réverb wet 0,12 « Espace » (off → 0), la voix
         se route dans le bus (pas en direct dans le master).
     [6] Non-régression : fracs/déterminisme/monotonie tempo/plancher 20 ms.
     [7] Persistance legato + space ; estampille de build -ter.

   Usage : node recette-5-3-ter.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? 1e-6 : eps), msg + '  (' + a + ' ≈ ' + b + ')'); }
function eqArr(a, b) { return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9); }
function fracSet(real) { return real.map(r => r.frac).sort((x, y) => x - y); }

// ---- stubs Web Audio ENREGISTREURS -------------------------------------------
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
  createDynamicsCompressor() { return makeNode('compressor'); }        // 5.3-ter : limiteur observable
  createConvolver() { return makeNode('convolver'); }                  // 5.3-ter : réverb observable
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  resume() {}
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
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
function setSpace(onOff) { $('bassSpace').checked = onOff; fire('bassSpace', 'change'); }

const BEATS = 4, STEPS = 16;
function stepDur(bpm) { return (BEATS * 60 / bpm) / STEPS; }
function durTempo(bpm) { const k = Math.max(0, Math.min(1, (bpm - 70) / 80)); return 1.15 + (0.70 - 1.15) * k; }
// Enveloppe d'une articulation via probeVoice : renvoie le gain node de l'enveloppe (celui
// dont l'automation démarre par set(0.0001, t)).
function probeEnv(B, art, t) {
  NODES = [];
  B().probeVoice(art, t);
  return NODES.find(n => n.kind === 'gain' && n.gain.calls.length >= 4 &&
    n.gain.calls[0][0] === 'set' && n.gain.calls[0][1] === 0.0001 && Math.abs(n.gain.calls[0][2] - t) < 1e-9);
}

boot(() => {
  console.log('\n=== Recette 5.3-ter — basse legato & respiration ===\n');
  const B = window.fmMetroBass;

  // --- 1. Chevauchement au défaut (L = 0,5) -----------------------------------------------
  console.log('[1] Chevauchement (curseur 50) : la note structurante déborde sur le pas suivant');
  setBass({ on: true, prog: 'vamp1', key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  setLegato(50); setTempo(92);
  const sd = stepDur(92), dT = durTempo(92);
  const real = B().realize();
  const finger = real.find(r => r.frac === 0).note;
  near(finger.dur, sd * 1.50 * dT, 1e-3, 'finger dur ≈ 1,50 × stepDur × durTempo (curseur 50 — fenêtre 5.3c : L=1,5)');
  ok(finger.dur > sd, 'finger dur > stepDur : la queue déborde sur l’attaque suivante — le liant  (' + finger.dur.toFixed(3) + ' > ' + sd.toFixed(3) + ')');
  setBass({ pattern: 'syncopeGrave', density: 3 });
  const pop = B().realize().find(r => r.note.art === 'pop');
  ok(pop && pop.note.dur > sd, 'pop (syncopeGrave) : dur > stepDur aussi  (' + (pop ? pop.note.dur.toFixed(3) : '-') + ')');
  setBass({ pattern: 'theOne', density: 2 });

  // --- 2. Bornes du curseur (fenêtre 5.3c : L = 1 + fraction) --------------------------------
  // Retouche 5.3c : l'ancien bloc « continuité 5.3-bis » (curseur 0 = 0,90/rel ×0,30) est
  // caduc — le plancher est désormais l'ancien max -ter (décision d'oreille, 92 BPM).
  console.log('\n[2] Bornes : plancher (curseur 0 = ancien max -ter) et plafond (curseur 100)');
  setLegato(0);
  const f0 = B().realize().find(r => r.frac === 0).note;
  near(f0.dur, sd * 1.30 * dT, 1e-3, 'curseur 0 : finger dur ≈ 1,30 × stepDur × durTempo (plancher = ancien max -ter)');
  const env0 = probeEnv(B, 'finger', 10);                       // probeVoice : dur fixe 0.18
  ok(!!env0, 'enveloppe observable (automation enregistrée)');
  if (env0) {
    const rel0 = Math.min(0.06 + 0.12, 0.18 * 0.50);            // L=1 : min(0.18, 0.09) = 0.09
    const susSet = env0.gain.calls.find(c => c[0] === 'set' && c[2] > 10.001);
    near(susSet[2], 10 + 0.18 - rel0, 1e-6, 'curseur 0 : début du release à t + dur − min(180 ms ; dur×0,50)');
    const last = env0.gain.calls[env0.gain.calls.length - 1];
    ok(last[0] === 'exp' && Math.abs(last[2] - 10.18) < 1e-9, 'la note se termine à t + dur (release exponentiel)');
  }
  setLegato(100);
  const env1 = probeEnv(B, 'finger', 20);
  if (env1) {
    const rel1 = Math.min(0.06 + 0.24, 0.18 * (0.30 + 0.40));   // L=2 : min(0.30, 0.126) = 0.126
    const susSet1 = env1.gain.calls.find(c => c[0] === 'set' && c[2] > 20.001);
    near(susSet1[2], 20 + 0.18 - rel1, 1e-6, 'curseur 100 : release allongé — borne dur×0,70 (' + (1000 * rel1).toFixed(0) + ' ms sur 180)');
  } else { ok(false, 'enveloppe curseur 100 observable'); }
  const f1 = B().realize().find(r => r.frac === 0).note;
  near(f1.dur, sd * 1.70 * dT, 1e-3, 'curseur 100 : finger dur ≈ 1,70 × stepDur × durTempo (très lié)');

  // --- 3. Ghost hors legato : toujours piqué ------------------------------------------------
  console.log('\n[3] Ghost : jamais affecté par le curseur');
  const gd = [0, 50, 100].map(L => { setLegato(L); return B().realize().find(r => r.note.art === 'ghost').note.dur; });
  ok(Math.abs(gd[0] - gd[1]) < 1e-9 && Math.abs(gd[1] - gd[2]) < 1e-9, 'durée ghost STRICTEMENT constante à L = 0 / 0,5 / 1');
  near(gd[1], sd * 0.35 * dT, 1e-3, 'ghost dur ≈ 0,35 × stepDur × durTempo');
  setLegato(100);
  const fLie = B().realize().find(r => r.frac === 0).note.dur;
  ok(gd[2] < fLie && gd[2] < sd, 'même très lié : ghost < finger et < son pas (reste piqué)');
  setLegato(50);

  // --- 4. Limiteur de bus master --------------------------------------------------------------
  console.log('\n[4] Limiteur quasi-brickwall : présent, paramétré, câblé avant destination');
  B().probeVoice('finger', 30);                                  // garantit ensureCtx
  const bus = B().bus();
  ok(!!bus.limiter && bus.limiter.kind === 'compressor', 'DynamicsCompressor présent sur le bus master');
  if (bus.limiter) {
    ok(bus.limiter.threshold.value === -1.5 && bus.limiter.ratio.value === 20 &&
       bus.limiter.attack.value === 0.003 && bus.limiter.release.value === 0.12,
       'paramètres : seuil −1,5 dB · ratio 20:1 · attaque 3 ms · release 120 ms');
    const master = window.fmMetroAudio().master;
    ok(master._targets.indexOf(bus.limiter) !== -1 && bus.limiter._targets.indexOf(CTX.destination) !== -1,
       'câblage : masterGain → limiteur → destination (rien ne contourne)');
    ok(master._targets.indexOf(CTX.destination) === -1, 'plus de chemin direct masterGain → destination');
  }

  // --- 5. Bus basse : high-pass 35 Hz + réverb « Espace » --------------------------------------
  console.log('\n[5] Bus basse : HP 35 Hz en tête, réverb courte wet 0,12, routage exclusif');
  ok(!!bus.bassHP && bus.bassHP.type === 'highpass' && bus.bassHP.frequency.value === 35,
     'high-pass 35 Hz présent en tête du bus basse (E1 = 41,2 Hz jamais touché)');
  ok(bus.bassBus._targets.indexOf(bus.bassHP) !== -1 && bus.bassHP._targets.length >= 1,
     'chaîne : bassBus → HP → …');
  ok(!!bus.bassWet && Math.abs(bus.bassWet.gain.value - 0.12) < 1e-9,
     'réverb « Espace » cochée : wet = 0,12 (discret)');
  setSpace(false);
  ok(bus.bassWet.gain.value === 0, 'case « Espace » décochée → wet = 0 (réverb off, chemin sec intact)');
  setSpace(true);
  ok(bus.bassWet.gain.value === 0.12, 're-cochée → wet = 0,12');
  const env2 = probeEnv(B, 'finger', 40);
  ok(env2 && env2._targets.indexOf(bus.bassBus) !== -1 && env2._targets.indexOf(window.fmMetroAudio().master) === -1,
     'la voix de basse sort dans le BUS basse, pas en direct dans le master (percussions non concernées)');

  // --- 6. Non-régression ------------------------------------------------------------------------
  console.log('\n[6] Non-régression : fracs, déterminisme, tempo, plancher');
  ok(eqArr(fracSet(B().realize()), [0, .375, .5, .875]), 'theOne/dens2 : fracs = [0, .375, .5, .875] inchangées');
  ok(JSON.stringify(B().realize()) === JSON.stringify(B().realize()), 'deux réalisations bit-à-bit identiques (vary=false)');
  setTempo(70);  const d70 = B().realize().find(r => r.frac === 0).note.dur;
  setTempo(150); const d150 = B().realize().find(r => r.frac === 0).note.dur;
  ok(d150 < d70, 'durée DÉCROÎT quand le tempo monte  (' + d70.toFixed(3) + ' → ' + d150.toFixed(3) + ')');
  setTempo(240);
  ok(B().realize().every(r => r.note.dur >= 0.02 - 1e-9), 'plancher audible 20 ms tenu même à 240 BPM');
  setTempo(92);

  // --- 7. Persistance + estampille ---------------------------------------------------------------
  console.log('\n[7] Persistance legato/space + estampille de build');
  setLegato(30); setSpace(false);
  const saved = JSON.parse(window.localStorage.getItem('fm-metro-bass'));
  ok(Math.abs(saved.legato - 0.3) < 1e-9 && saved.space === false, 'fm-metro-bass : legato 0,30 + space false persistés');
  setLegato(50); setSpace(true);
  const bs = $('buildStamp');
  ok(bs && /metronomefunk-\d+\.\d+/.test(bs.textContent), 'buildStamp : « ' + (bs ? bs.textContent : '(absent)') + ' »');   // génériquée : motif metronomefunk-\d+\.\d+ (retouche chantier B, build 0.6 hors 0.5.x)

  console.log('\n----------------------------------------');
  console.log('  ' + pass + ' réussis, ' + fail + ' échoués sur ' + (pass + fail));
  console.log('----------------------------------------\n');
  process.exit(fail === 0 ? 0 : 1);
});

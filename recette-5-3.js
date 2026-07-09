/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.3 : « Progressions harmoniques »
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas (identique à recette-5-1/5-2). Pilotage
   par le DOM (bassOn, bassPattern, bassProg, bassKey, bassDensity, bassVel,
   bassVary, tempoSlider) ; observation via le hook window.fmMetroBass() enrichi
   (currentBar, newMeasure, chordName) — la prod reste inchangée.

   Portée 5.3 (spec §2.4, §7) :
     [1] Non-régression : vamp1 (theOne/dens2/déterministe) INCHANGÉ (fracs 5.2).
     [2] Les 6 progressions existent ; longueurs de boucle correctes (wrap barIdx).
     [3] Blues 12 mesures : séquence complète des fondamentales ; la fondamentale
         CHANGE aux mesures 5, 9, 11 (spec §7).
     [4] Transposition : même progression E → G ⇒ mêmes fracs, fréquences ×2^(n/12)
         (n = distance repliée dans l'octave, comme bassKeyRootFreq).
     [5] Affichage de l'accord courant : E7, Em7, F#m7, D (bVII), A7 (IV du blues).
   Le rendu à l'oreille (Android) et le timbre restent hors headless.

   Usage : node recette-5-3.js
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
  if (o.prog != null)    { $('bassProg').value = o.prog;       fire('bassProg', 'change'); }
  if (o.key != null)     { $('bassKey').value = o.key;         fire('bassKey', 'change'); }
  if (o.density != null) { $('bassDensity').value = String(o.density); fire('bassDensity', 'change'); }
  if (o.vel != null)     { $('bassVel').value = o.vel;         fire('bassVel', 'change'); }
  if (o.vary != null)    { $('bassVary').checked = o.vary;     fire('bassVary', 'change'); }
}

const E1 = 41.203;
const SEMI = { I: 0, i: 0, IV: 5, bVII: 10, V: 7, ii: 2 };   // miroir de CHORD_ROOT_SEMI
function rootHz(key, deg) {                                   // fondamentale attendue (clé + degré)
  const PC = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  const n = ((PC[key] - PC.E) % 12 + 12) % 12;
  return E1 * Math.pow(2, n / 12) * Math.pow(2, SEMI[deg] / 12);
}

boot(() => {
  console.log('\n=== Recette 5.3 — progressions harmoniques + tonalités ===\n');
  const B = window.fmMetroBass;

  // Parcourt les 12 mesures d'une progression (reset + 11 avances) → [{root, fracs, name, deg}]
  function stepProg(prog, key, n) {
    setBass({ on: true, prog: prog, key: key, pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
    const out = [];
    const r0 = B().realize();               // reset → mesure 1 (barre 0)
    const cb0 = B().currentBar();
    out.push({ root: cb0.rootFreq, fracs: fracSet(r0), name: cb0.name, deg: cb0.chord.deg, barIdx: cb0.barIdx });
    for (let m = 2; m <= n; m++) {
      const nm = B().newMeasure();
      out.push({ root: nm.rootFreq, fracs: fracSet(nm.notes), name: nm.name, deg: nm.chord.deg, barIdx: nm.barIdx });
    }
    return out;
  }

  // --- 1. Non-régression : vamp1 déterministe INCHANGÉ ------------------------
  console.log('[1] Non-régression : vamp1 (theOne/dens2/déterministe) inchangé');
  setBass({ on: true, prog: 'vamp1', key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  const v1 = B().realize();
  ok(eqArr(fracSet(v1), [0, .375, .5, .875]), 'theOne/vamp1/dens2 : fracs = [0, .375, .5, .875] (identiques à 5.2)');
  ok(JSON.stringify(B().realize()) === JSON.stringify(B().realize()), 'deux réalisations bit-à-bit identiques');
  ok(B().currentBar().chord.deg === 'I', 'vamp1 : accord I à toute mesure');
  // vamp1 = boucle de 1 : barIdx reste 0 après avance
  B().realize(); const w0 = B().newMeasure().barIdx;
  ok(w0 === 0, 'vamp1 (boucle 1) : barIdx reste 0 après avance');

  // --- 2. Les 6 progressions existent ; longueurs de boucle -------------------
  console.log('\n[2] Six progressions présentes ; longueurs de boucle correctes');
  const progs = ['vamp1', 'vamp2', 'dorien', 'mixo', 'blues', 'jazzfunk'];
  progs.forEach(p => {
    setBass({ on: true, prog: p, key: 'E', pattern: 'theOne', vary: false });
    const cb = B().currentBar();
    ok(cb && cb.chord && typeof cb.chord.deg === 'string', 'progression « ' + p + ' » réalise un accord valide');
  });
  // vamp2 = boucle 2 : barIdx 0 → 1 → 0
  setBass({ prog: 'vamp2', key: 'E' }); B().realize();
  const a1 = B().newMeasure().barIdx, a2 = B().newMeasure().barIdx;
  ok(a1 === 1 && a2 === 0, 'vamp2 (boucle 2) : barIdx 1 puis retour 0 (wrap)');

  // --- 3. Blues 12 mesures : séquence des fondamentales, changements 5/9/11 ----
  console.log('\n[3] Blues 12 mesures : fondamentales + changements aux mesures 5, 9, 11');
  const bluesDegs = ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'];
  const bE = stepProg('blues', 'E', 12);
  ok(bE.length === 12, 'blues : 12 mesures parcourues');
  ok(JSON.stringify(bE.map(x => x.deg)) === JSON.stringify(bluesDegs),
     'séquence des degrés = I I I I IV IV I I V IV I I');
  bE.forEach((x, i) => near(x.root, rootHz('E', bluesDegs[i]), 1e-3, 'm' + (i + 1) + ' fondamentale = ' + bluesDegs[i]));
  // Changements de fondamentale (mesure m vs m-1)
  const chg = m => Math.abs(bE[m - 1].root - bE[m - 2].root) > 1e-6;   // m 1-indexé
  ok(chg(5), 'la fondamentale CHANGE à la mesure 5 (I → IV)');
  ok(chg(9), 'la fondamentale CHANGE à la mesure 9 (I → V)');
  ok(chg(11), 'la fondamentale CHANGE à la mesure 11 (IV → I)');
  ok(!chg(2) && !chg(3) && !chg(4), 'stable sur les mesures 1–4 (bloc de I)');

  // --- 4. Transposition E → G : mêmes fracs, fréquences ×2^(3/12) --------------
  console.log('\n[4] Transposition blues E → G : mêmes fracs, fréquences ×2^(n/12)');
  const bG = stepProg('blues', 'G', 12);
  const ratio = Math.pow(2, 3 / 12);   // G = 3 demi-tons repliés au-dessus de E
  let fracsOk = true, ratioOk = true;
  for (let i = 0; i < 12; i++) {
    if (!eqArr(bE[i].fracs, bG[i].fracs)) fracsOk = false;
    if (Math.abs((bG[i].root / bE[i].root) - ratio) > 1e-6) ratioOk = false;
  }
  ok(fracsOk, 'mêmes fracs à chaque mesure (le gabarit ne dépend pas de la tonalité)');
  ok(ratioOk, 'chaque fondamentale G / E = 2^(3/12) ≈ ' + ratio.toFixed(6));
  // transposition d'une tierce mineure vers le haut : la mesure 1 (I) passe de E1 à G1
  near(bG[0].root, E1 * ratio, 1e-3, 'blues/G mesure 1 = G1 (E1 × 2^(3/12))');

  // --- 5. Affichage de l'accord courant ---------------------------------------
  console.log('\n[5] Nom d\'accord courant (key + degré + qualité)');
  setBass({ on: true, prog: 'vamp1', key: 'E', vary: false });
  ok(B().chordName() === 'E7', 'vamp1 / E → « E7 »');
  setBass({ prog: 'dorien', key: 'E' });
  ok(B().chordName() === 'Em7', 'dorien / E : tête i7 → « Em7 »');
  setBass({ prog: 'jazzfunk', key: 'E' });
  ok(B().chordName() === 'F#m7', 'jazzfunk / E : tête ii7 → « F#m7 »');
  // bVII : 2e barre du mixo
  const mixo = stepProg('mixo', 'E', 2);
  ok(mixo[1].name === 'D', 'mixo / E : 2e barre bVII → « D » (qualité majeure, libellé nu)');
  // IV du blues (mesure 5) → A7 en E
  ok(bE[4].name === 'A7', 'blues / E : mesure 5 (IV) → « A7 »');
  // transposition du nom : vamp1 en G → G7
  setBass({ prog: 'vamp1', key: 'G' });
  ok(B().chordName() === 'G7', 'vamp1 / G → « G7 » (transposition du libellé)');

  console.log('\n----------------------------------------');
  console.log('  ' + pass + ' réussis, ' + fail + ' échoués sur ' + (pass + fail));
  console.log('----------------------------------------\n');
  process.exit(fail === 0 ? 0 : 1);
});

/* ============================================================================
   Recette headless — Métronome passe 5, étape 5.4 : « Drop-outs, écran de jeu,
   swing des 16es » (dernière étape de la passe 5)
   ----------------------------------------------------------------------------
   Portée 5.4 (spec metronome-passe5-5-4-spec.md) :
     [1] Défauts & no-op : drop off + swing 50 ⇒ réalisation identique à 5.3c
         (mêmes fracs, mêmes durées) ; état et contrôles aux défauts.
     [2] Drop-outs : fonction pure de measureCount — trou = lenBeats derniers
         temps de chaque période de everyN mesures ; re-entrée sur The One ;
         jamais de trou à l'arrêt (measureCount = 0).
     [3] Bord du trou : la queue legato s'éteint au bord (dur raccourcie),
         les notes loin du bord ne bougent pas.
     [4] Percussion & pulsation intactes pendant le trou ; la machine gap
         utilisateur (S.gap) n'est pas réquisitionnée.
     [5] Swing des 16es : pas impairs à (i−1+2·sw)/16 si swingFollow, pas pairs
         immobiles ; swingFollow off ⇒ grille droite ; sw=50 % ⇒ identité.
     [6] Drop × swing : le trou s'évalue sur la position swinguée (le bord
         clampe la durée selon la position réellement sonnée).
     [7] Persistance : drop + swingFollow dans fm-metro-bass, bornes appliquées.
     [8] Écran de jeu : commandes basse présentes, synchro bidirectionnelle avec
         secBass, accord affiché, groupe grisé en famille ternaire.
     [9] Estampille 0.5.4.

   Usage : node recette-5-4.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }
function near(a, b, eps, msg) { ok(Math.abs(a - b) <= (eps == null ? 1e-6 : eps), msg + '  (' + a + ' ≈ ' + b + ')'); }

// ---- stubs Web Audio ENREGISTREURS (identiques à recette-5-3c) ----------------
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
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running';
    this.destination = makeNode('destination'); }
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
function setDrop(o) {
  if (o.on != null)       { $('bassDropOn').checked = o.on;             fire('bassDropOn', 'change'); }
  if (o.everyN != null)   { $('bassDropEvery').value = String(o.everyN); fire('bassDropEvery', 'change'); }
  if (o.lenBeats != null) { $('bassDropLen').value = String(o.lenBeats); fire('bassDropLen', 'change'); }
}
function setSwing(v) { $('swingSlider').value = String(v); fire('swingSlider', 'input'); }
function setFollow(b) { $('bassSwingFollow').checked = b; fire('bassSwingFollow', 'change'); }
function setTempo(bpm) { $('tempoSlider').value = String(bpm); fire('tempoSlider', 'input'); }
function setLegato(pct) { $('bassLegato').value = String(pct); fire('bassLegato', 'input'); }

const BEATS = 4, STEPS = 16;
function stepDur(bpm) { return (BEATS * 60 / bpm) / STEPS; }
function beatDur(bpm) { return 60 / bpm; }
function durTempo(bpm) { const k = Math.max(0, Math.min(1, (bpm - 70) / 80)); return 1.15 + (0.70 - 1.15) * k; }
function fracs(notes) { return notes.map(n => n.frac); }
function at(notes, frac) { return notes.find(n => Math.abs(n.frac - frac) < 1e-9); }

boot(() => {
  console.log('\n=== Recette 5.4 — drop-outs, écran de jeu, swing des 16es ===\n');
  const B = window.fmMetroBass;

  // --- 1. Défauts & no-op : réalisation identique à 5.3c --------------------------------------
  console.log('[1] Défauts & no-op : drop off + swing 50 ⇒ identique à 5.3c');
  setBass({ on: true, prog: 'vamp1', key: 'E', pattern: 'theOne', density: 2, vel: 'mixte', vary: false });
  setTempo(92);
  const st = B().state;
  ok(st.drop && st.drop.on === false && st.drop.everyN === 4 && st.drop.lenBeats === 2,
     'défauts : drop = { on:false, everyN:4, lenBeats:2 }');
  ok(st.swingFollow === true, 'défaut : swingFollow = true');
  ok(!$('bassDropOn').checked && $('bassDropEvery').value === '4' && $('bassDropLen').value === '2' &&
     $('bassSwingFollow').checked, 'contrôles secBass aux défauts (off · 4 · 2 · suivi coché)');
  const base = B().realize();
  ok(fracs(base).join(',') === [0, 6 / STEPS, 8 / STEPS, 14 / STEPS].join(','),
     'theOne déterministe : fracs strictement 5.3c (0 · 6/16 · 8/16 · 14/16)');
  near(at(base, 0).note.dur, stepDur(92) * 1.40 * durTempo(92), 1e-3,
       'finger dur ≈ 1,40 × stepDur × durTempo (legato 25 — inchangé 5.3c)');
  B().setMeasure(7);                                             // drop off : le compteur est inerte
  ok(fracs(B().realize()).length === 4, 'drop off : la mesure 7 est pleine (compteur inerte)');
  B().setMeasure(0);

  // --- 2. Drop-outs : fonction pure du compteur de mesures ------------------------------------
  console.log('\n[2] Drop-outs : trou en fin de période, re-entrée sur The One');
  setDrop({ on: true, everyN: 2, lenBeats: 2 });                 // E = 8 temps, trou = temps 7–8 (gm ≥ 6)
  B().setMeasure(1);
  ok(fracs(B().realize()).length === 4, 'mesure 1 : pleine (le trou est en fin de période)');
  B().setMeasure(2);
  const m2 = B().realize();
  ok(m2.length === 2 && !m2.some(n => n.frac >= 0.5),
     'mesure 2 : aucune note de frac ≥ 0,5 — les 2 derniers temps sont muets');
  ok(!!at(m2, 0) && !!at(m2, 6 / STEPS), 'mesure 2 : temps 1–2 intacts (The One + ghost)');
  B().setMeasure(3);
  const m3 = B().realize();
  ok(m3.length === 4 && !!at(m3, 0), 'mesure 3 : re-entrée sur The One, mesure pleine (période suivante)');
  B().setMeasure(4);
  ok(fracs(B().realize()).filter(f => f >= 0.5).length === 0, 'mesure 4 : trou à nouveau (périodicité)');
  B().setMeasure(0);
  ok(B().realize().length === 4, 'à l’arrêt (measureCount = 0) : jamais de trou');

  // --- 3. Bord du trou : la queue legato s'éteint au bord --------------------------------------
  console.log('\n[3] Bord du trou : durée raccourcie pour un silence net');
  setTempo(60); setLegato(100);
  setBass({ pattern: 'syncopeGrave', density: 3 });
  setDrop({ everyN: 1, lenBeats: 1 });                           // E = 4 temps, trou = temps 4 (gm ≥ 3)
  B().setMeasure(1);
  const m1 = B().realize();
  ok(!at(m1, 14 / STEPS), 'pop du pas 14 (gm 3,5) : dans le trou, supprimé');
  const n11 = at(m1, 11 / STEPS);
  ok(!!n11, 'finger du pas 11 (gm 2,75) : joué (avant le trou)');
  if (n11) near(n11.note.dur, 0.25 * beatDur(60), 1e-6,
    'pas 11 : dur clampée au bord du trou — 0,25 temps (au lieu de ' +
    (stepDur(60) * 1.70 * durTempo(60)).toFixed(3) + ' s legato plafond)');
  const n6 = at(m1, 6 / STEPS);
  if (n6) near(n6.note.dur, stepDur(60) * 1.70 * durTempo(60), 1e-3,
    'pas 6 (loin du bord) : dur legato plafond intacte');
  else ok(false, 'pas 6 présent');
  ok(m1.every(n => n.note.dur >= 0.02), 'plancher 20 ms respecté partout');

  // --- 4. Percussion & pulsation intactes ; machine gap non réquisitionnée ---------------------
  console.log('\n[4] Pendant le trou : seule la couche bass se tait');
  B().setMeasure(1); B().realize();
  const evDrop = B().cycleEvents();
  setDrop({ on: false });
  B().setMeasure(1); B().realize();
  const evFull = B().cycleEvents();
  ok((evDrop.beat || 0) === (evFull.beat || 0) && (evDrop.perc || 0) === (evFull.perc || 0) &&
     (evDrop.sub || 0) === (evFull.sub || 0),
     'événements beat/sub/perc identiques avec et sans trou (pulsation et percussion intactes)');
  ok((evDrop.bass || 0) < (evFull.bass || 0), 'seuls les événements bass diminuent pendant le trou' +
     '  (' + (evDrop.bass || 0) + ' < ' + (evFull.bass || 0) + ')');
  ok($('gapMode').value === 'off', 'la machine gap utilisateur (S.gap) n’est pas réquisitionnée (mode off)');

  // --- 5. Swing des 16es -------------------------------------------------------------------------
  console.log('\n[5] Swing des 16es : pas impairs décalés, pas pairs immobiles');
  setTempo(92); setLegato(25);
  setBass({ pattern: 'syncopeGrave', density: 3 });              // pas impair : i = 11
  B().setMeasure(0);
  setSwing(66);
  let r = B().realize();
  near(at(r, (11 - 1 + 2 * 0.66) / STEPS) ? (11 - 1 + 2 * 0.66) / STEPS : NaN, 11.32 / STEPS, 1e-9,
       'sw 66 % : pas 11 décalé à (11−1+1,32)/16 = 0,7075');
  ok(!!at(r, 0) && !!at(r, 6 / STEPS) && !!at(r, 8 / STEPS) && !!at(r, 14 / STEPS),
     'pas pairs (0, 6, 8, 14) : STRICTEMENT immobiles');
  setFollow(false);
  r = B().realize();
  ok(!!at(r, 11 / STEPS), 'swingFollow off : pas 11 droit (11/16) malgré swing 66 %');
  setFollow(true);
  setSwing(50);
  r = B().realize();
  ok(!!at(r, 11 / STEPS), 'sw 50 % : identité stricte — pas 11 à 11/16 (non-régression par construction)');

  // --- 6. Drop × swing : le trou s'évalue sur la position sonnée ---------------------------------
  console.log('\n[6] Drop × swing : le bord clampe selon la position swinguée');
  setDrop({ on: true, everyN: 1, lenBeats: 1 });                 // trou = temps 4 (gm ≥ 3)
  B().setMeasure(1);
  setSwing(85);                                                  // pas 11 → beat 2,925 (bord à 3)
  const s85 = at(B().realize(), (11 - 1 + 2 * 0.85) / STEPS);
  ok(!!s85, 'sw 85 % : pas 11 swingué encore avant le trou (beat 2,925)');
  if (s85) near(s85.note.dur, 0.075 * beatDur(92), 1e-6,
    'sw 85 % : dur clampée à 0,075 temps — le bord est mesuré sur la position SWINGUÉE');
  setSwing(50);
  const s50 = at(B().realize(), 11 / STEPS);
  if (s50) near(s50.note.dur, 0.25 * beatDur(92), 1e-6,
    'sw 50 % : dur clampée à 0,25 temps (position droite)');
  else ok(false, 'pas 11 présent à sw 50 %');
  setDrop({ on: false }); B().setMeasure(0);

  // --- 7. Persistance : drop + swingFollow dans fm-metro-bass ------------------------------------
  console.log('\n[7] Persistance (clé fm-metro-bass, aucune migration)');
  setDrop({ on: true, everyN: 3, lenBeats: 1 });
  setFollow(false);
  const saved = JSON.parse(window.localStorage.getItem('fm-metro-bass'));
  ok(saved.drop && saved.drop.on === true && saved.drop.everyN === 3 && saved.drop.lenBeats === 1,
     'drop { on:true, everyN:3, lenBeats:1 } persisté');
  ok(saved.swingFollow === false, 'swingFollow false persisté');
  setDrop({ everyN: 99 });
  ok(B().state.drop.everyN === 32 && $('bassDropEvery').value === '32', 'borne : everyN 99 → 32 (réécrit dans le champ)');
  setDrop({ lenBeats: 99 });
  ok(B().state.drop.lenBeats === 8 && $('bassDropLen').value === '8', 'borne : lenBeats 99 → 8');
  setDrop({ on: false, everyN: 4, lenBeats: 2 });
  setFollow(true);

  // --- 8. Écran de jeu : commandes basse + synchro bidirectionnelle ------------------------------
  console.log('\n[8] Écran de jeu : basse on/off · densité · drop-outs · accord');
  ok(!!$('playBassGroup') && !!$('playBassOn') && !!$('playBassDensity') && !!$('playBassDrop') && !!$('playBassChord'),
     'les 4 commandes + la pastille d’accord existent');
  setBass({ prog: 'vamp1', key: 'E' });
  ok($('playBassChord').textContent === '♪ E7', 'accord affiché sur l’écran de jeu : « ♪ E7 »');
  $('playBassOn').checked = false; fire('playBassOn', 'change');
  ok(B().state.on === false && $('bassOn').checked === false, 'playBassOn → S.bass.on et secBass synchronisés');
  $('bassOn').checked = true; fire('bassOn', 'change');
  ok($('playBassOn').checked === true, 'bassOn → playBassOn synchronisé (sens inverse)');
  $('playBassDensity').value = '3'; fire('playBassDensity', 'change');
  ok(B().state.density === 3 && $('bassDensity').value === '3', 'densité synchronisée écran de jeu → secBass');
  $('playBassDrop').checked = true; fire('playBassDrop', 'change');
  ok(B().state.drop.on === true && $('bassDropOn').checked === true, 'drop-outs synchronisés écran de jeu → secBass');
  $('playBassDrop').checked = false; fire('playBassDrop', 'change');
  $('famTernBtn').click();
  ok($('playBassOn').disabled && $('playBassGroup').classList.contains('bass-tern'),
     'famille ternaire : groupe basse de l’écran de jeu désactivé (binaire v1)');
  $('famBinBtn').click();
  ok(!$('playBassOn').disabled, 'retour binaire : groupe réactivé');

  // --- 9. Estampille ------------------------------------------------------------------------------
  console.log('\n[9] Estampille');
  const bs = $('buildStamp');
  ok(bs && /metronomefunk-\d+\.\d+/.test(bs.textContent), 'buildStamp : « ' + (bs ? bs.textContent : '(absent)') + ' »');   // génériquée chantier B : motif metronomefunk-\d+\.\d+ (build 0.6 hors 0.5.x)

  console.log('\n----------------------------------------');
  console.log('  ' + pass + ' réussis, ' + fail + ' échoués sur ' + (pass + fail));
  console.log('----------------------------------------\n');
  process.exit(fail === 0 ? 0 : 1);
});

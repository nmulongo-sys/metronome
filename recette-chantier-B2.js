/* ============================================================================
   Recette headless — Métronome, chantier B (finition 0.6.1) :
   « Curseur temps réel sur fingerViz »
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas. Pilotage par le DOM (#percInstr,
   cases de mute) ; observation via le DOM #fingerViz + le hook lecture seule
   window.fmMetroReg(). Le curseur est piloté par la couche d'action de recette
   window.fmMetroFvCursor(phase) — ce que draw() appelle en jeu, avec la même
   phase que #playLine.

   Portée (spec finition validée) :
   - un curseur .fv-cursor par piste .fv-track (recréé à chaque render) ;
   - positionnement left = phase*100 % (même repère que les pastilles i/n) ;
   - visible seulement si l'encart n'est pas masqué (.hide) ; sinon caché ;
   - continuité : un curseur même dans un couloir vide (cajón médium) ;
   - survie au re-render (changement d'instrument cible).

   Usage : node recette-chantier-B2.js   (depuis le dossier contenant index.html)
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ---- mini-cadre d'assertions -------------------------------------------------
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }

// ---- stubs Web Audio ---------------------------------------------------------
function makeParam() { return { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }; }
function makeNode() {
  return { frequency: makeParam(), gain: makeParam(), Q: makeParam(), type: '', connect() {}, start() {}, stop() {}, buffer: null };
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode(); }
  createGain() { return makeNode(); }
  createOscillator() { return makeNode(); }
  createBiquadFilter() { return makeNode(); }
  createBufferSource() { return makeNode(); }
  createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; }
  createWaveShaper() { return makeNode(); }
  createDynamicsCompressor() { return makeNode(); }
  createConvolver() { return makeNode(); }
  resume() {}
}

// ---- DOM ---------------------------------------------------------------------
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
  },
});
const { window } = dom;
const $ = id => window.document.getElementById(id);
const qsa = sel => Array.from(window.document.querySelectorAll(sel));

function boot(cb) {
  if (typeof window.fmMetroReg === 'function' && typeof window.fmMetroFvCursor === 'function') return cb();
  setTimeout(() => boot(cb), 10);
}
function setInstr(v) { $('percInstr').value = v; $('percInstr').dispatchEvent(new window.Event('change')); }
function tracks() { return qsa('#fingerViz .fv-track'); }
function cursors() { return qsa('#fingerViz .fv-cursor'); }
function fvHidden() { return $('fingerViz').classList.contains('hide'); }
function muteAll() { qsa('#percVoices .pv-mute input').forEach(mi => { if (!mi.checked) { mi.checked = true; mi.dispatchEvent(new window.Event('change')); } }); }
function unmuteAll() { qsa('#percVoices .pv-mute input').forEach(mi => { if (mi.checked) { mi.checked = false; mi.dispatchEvent(new window.Event('change')); } }); }

boot(() => {
  console.log('\n=== Recette chantier B (finition 0.6.1) — curseur temps réel fingerViz ===\n');
  const R = window.fmMetroReg();

  // --- 1. Estampille + présence de la couche d'action -----------------------
  console.log('[1] Build & couche d\'action de recette');
  // 0.7.0 : comparaison de version en « ≥ » (motif acté) — le seuil testé reste 0.6.1
  const vge = (b, X, Y, Z) => { const m = /metronomefunk-(\d+)\.(\d+)\.(\d+)/.exec(b || ''); return !!m &&
    (+m[1] > X || (+m[1] === X && (+m[2] > Y || (+m[2] === Y && +m[3] >= Z)))); };
  ok(typeof R.build === 'string' && vge(R.build, 0, 6, 1), 'BUILD ≥ 0.6.1 (finition curseur ; ' + R.build + ')');
  ok(typeof window.fmMetroFvCursor === 'function', 'window.fmMetroFvCursor exposé (pilotage du curseur)');

  // --- 2. Un curseur par piste (djembé) -------------------------------------
  console.log('\n[2] Un curseur par piste — djembé');
  setInstr('djembe');
  ok(!fvHidden(), 'encart visible (ma ligne non vide)');
  ok(tracks().length === 3, '3 pistes rendues (djembé, T=3)');
  ok(cursors().length === 3, 'exactement 3 curseurs (un par piste)');
  ok(tracks().every(tr => tr.querySelectorAll('.fv-cursor').length === 1), 'chaque .fv-track contient exactement un .fv-cursor');

  // --- 3. Positionnement : left = phase*100 %, même repère que les pastilles -
  console.log('\n[3] Positionnement piloté par la phase');
  window.fmMetroFvCursor(0.5);
  ok(cursors().every(c => c.style.left === '50%'), 'phase 0.5 → tous les curseurs à 50 %');
  ok(cursors().every(c => c.style.display === 'block'), 'phase 0.5 → tous visibles (display block)');
  window.fmMetroFvCursor(0);
  ok(cursors().every(c => c.style.left === '0%'), 'phase 0 → 0 %');
  window.fmMetroFvCursor(0.25);
  ok(cursors().every(c => c.style.left === '25%'), 'phase 0.25 → 25 %');
  window.fmMetroFvCursor(1);
  ok(cursors().every(c => c.style.left === '100%'), 'phase 1 → 100 %');

  // --- 4. Continuité : curseur même dans un couloir vide (cajón médium) ------
  console.log('\n[4] Continuité — cajón (médium vide)');
  setInstr('cajon');
  ok(tracks().length === 3, 'cajón : 3 pistes');
  ok(cursors().length === 3, 'cajón : 3 curseurs (y compris la piste médium vide)');
  window.fmMetroFvCursor(0.5);
  ok(cursors().every(c => c.style.left === '50%' && c.style.display === 'block'),
     'les 3 couloirs (médium vide inclus) portent le curseur → ligne continue');

  // --- 5. Masquage : encart .hide ⇒ curseurs cachés -------------------------
  console.log('\n[5] Gating — ma ligne vide ⇒ curseurs cachés');
  setInstr('djembe');
  muteAll();
  ok(fvHidden(), 'toutes voix muettes → encart masqué (.hide)');
  window.fmMetroFvCursor(0.5);
  ok(cursors().every(c => c.style.display === 'none'), 'fmMetroFvCursor sur encart masqué → curseurs cachés (aucun affichage)');
  unmuteAll();
  ok(!fvHidden(), 'voix rétablies → encart de nouveau visible');
  window.fmMetroFvCursor(0.5);
  ok(cursors().length > 0 && cursors().every(c => c.style.display === 'block' && c.style.left === '50%'),
     'curseurs de nouveau pilotables après réaffichage');

  // --- 6. Survie au re-render (curseur recréé, jamais orphelin) --------------
  console.log('\n[6] Survie au re-render (changement d\'instrument cible)');
  setInstr('agogo');
  ok(cursors().length === 2, 'agogô (T=2) : 2 curseurs après re-render');
  window.fmMetroFvCursor(0.5);
  ok(cursors().every(c => c.style.left === '50%'), 'curseurs recréés dans le nouveau markup et pilotables');
  setInstr('recoreco');
  ok(cursors().length === 1, 'reco-reco (T=1) : 1 curseur');
  setInstr('djembe');
  ok(cursors().length === 3, 'retour djembé : 3 curseurs (aucune accumulation d\'orphelins)');

  // ---- bilan ---------------------------------------------------------------
  console.log('\n=== Bilan : ' + pass + '/' + (pass + fail) + ' \u2014 ' + (fail === 0 ? 'TOUT PASSE' : (fail + ' ÉCHEC(S)')) + ' ===\n');
  process.exit(fail === 0 ? 0 : 1);
});

/* ============================================================================
   Recette headless — Métronome, chantier B : « Projection sur paliers (fingerViz) »
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas. Pilotage par le DOM (sélecteur
   #percInstr, cases de mute, #bassOn) ; observation via le hook de diagnostic
   window.fmMetroReg() (lecture seule) + inspection du DOM #fingerViz.

   Portée (spec chantier B.1, OPTION A validée) :
   - table INSTR_TIERS (paliers par instrument cible) ;
   - projection voicePalier = clamp absolu du rang sur [0, T−1] ;
   - libellés de palier par instrument ;
   - encart #fingerViz : MA ligne projetée, aigu en haut, masqué si vide ;
   - la basse funk est exclue (instrument de référence, jamais imité).

   Usage : node recette-chantier-B.js   (depuis le dossier contenant index.html)
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ---- mini-cadre d'assertions -------------------------------------------------
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  \u2713 ' + msg); } else { fail++; console.log('  \u2717 ' + msg); } }
function eqArr(a, b) { return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]); }

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
  if (typeof window.fmMetroReg === 'function') return cb();
  setTimeout(() => boot(cb), 10);
}
function setInstr(v) { $('percInstr').value = v; $('percInstr').dispatchEvent(new window.Event('change')); }
function fvLanes() { return $('fingerViz').querySelectorAll('.fv-lane').length; }
function fvHits() { return $('fingerViz').querySelectorAll('.fv-hit').length; }
function fvHidden() { return $('fingerViz').classList.contains('hide'); }
function fvLabels() { return qsa('#fingerViz .fv-label').map(e => e.textContent); }

boot(() => {
  console.log('\n=== Recette chantier B — projection sur paliers (fingerViz) ===\n');
  const R = window.fmMetroReg();

  // --- 1. Estampille de build -----------------------------------------------
  console.log('[1] Estampille de build');
  // 0.7.0 : comparaison de version en « ≥ » (motif acté) — le seuil testé reste 0.6.0
  const vge = (b, X, Y, Z) => { const m = /metronomefunk-(\d+)\.(\d+)\.(\d+)/.exec(b || ''); return !!m &&
    (+m[1] > X || (+m[1] === X && (+m[2] > Y || (+m[2] === Y && +m[3] >= Z)))); };
  ok(typeof R.build === 'string' && vge(R.build, 0, 6, 0), 'BUILD renseigné et bumpé (' + R.build + ')');
  ok(($('buildStamp').textContent || '').indexOf(R.build) !== -1, 'estampille visible reflète le build');

  // --- 2. Table INSTR_TIERS (paliers par instrument cible) ------------------
  console.log('\n[2] Paliers par instrument');
  ok(R.tiers('djembe') === 3, 'djembé = 3 paliers');
  ok(R.tiers('cajon') === 3, 'cajón = 3 paliers');
  ok(R.tiers('dunduns') === 4, 'dunduns = 4 paliers');
  ok(R.tiers('agogo') === 2, 'agogô = 2 paliers');
  ok(R.tiers('surdo') === 2, 'surdo = 2 paliers');
  ok(R.tiers('recoreco') === 1, 'reco-reco = 1 palier');
  ok(R.tiers('zzz-inconnu') === 3, 'instrument inconnu → repli 3 paliers');

  // --- 3. Projection OPTION A : clamp absolu du rang sur [0, T−1] ------------
  console.log('\n[3] voicePalier = clamp absolu (Option A)');
  ok(R.palier(0, 3) === 0, 'rang 0, T=3 → palier 0');
  ok(R.palier(1, 3) === 1, 'rang 1, T=3 → palier 1');
  ok(R.palier(2, 3) === 2, 'rang 2, T=3 → palier 2');
  ok(R.palier(3, 3) === 2, 'rang 3, T=3 → clampé au palier haut 2');
  ok(R.palier(5, 3) === 2, 'rang 5, T=3 → clampé au palier haut 2');
  ok(R.palier(-1, 3) === 0, 'rang négatif → palier 0 (plancher)');
  ok(R.palier(3, 4) === 3, 'rang 3, T=4 → palier 3 (exact)');
  ok(R.palier(2, 2) === 1, 'rang 2, T=2 → clampé au palier 1');
  ok(R.palier(0, 2) === 0, 'rang 0, T=2 → palier 0');

  // --- 4. Libellés de palier -------------------------------------------------
  console.log('\n[4] Libellés de palier');
  ok(eqArr(R.labels('djembe'), ['basse', 'tone', 'slap']), 'djembé = basse/tone/slap');
  ok(eqArr(R.labels('cajon'), ['grave', 'médium', 'aigu']), 'cajón = grave/médium/aigu');
  ok(eqArr(R.labels('dunduns'), ['dundunba', 'sangban', 'kenkeni', 'cloche']), 'dunduns = dundunba/sangban/kenkeni/cloche');
  ok(eqArr(R.labels('surdo'), ['grave', 'marcante']), 'surdo = grave/marcante');
  ok(eqArr(R.labels('zzz-inconnu'), ['grave', 'médium', 'aigu']), 'inconnu (T=3) → repli générique grave/médium/aigu');

  // --- 5. Rang des voix focales (djembé) ------------------------------------
  console.log('\n[5] Rang des voix focales (djembé)');
  setInstr('djembe');
  ok(R.rankOf('basse') === 0, 'basse rank 0');
  ok(R.rankOf('tone') === 1, 'tone rank 1');
  ok(R.rankOf('slap') === 2, 'slap rank 2');

  // --- 6. Mapping de MA ligne (djembé par défaut) ---------------------------
  console.log('\n[6] Projection de ma ligne — djembé');
  const mD = R.mapping();
  ok(mD.instr === 'djembe' && mD.tiers === 3, 'instrument focal djembé, T=3');
  ok(mD.voices.length === 3, '3 voix projetées (basse/tone/slap)');
  const byId = {}; mD.voices.forEach(v => byId[v.id] = v);
  ok(byId.basse && byId.basse.palier === 0, 'basse → palier 0');
  ok(byId.tone && byId.tone.palier === 1, 'tone → palier 1');
  ok(byId.slap && byId.slap.palier === 2, 'slap → palier 2');
  ok(mD.voices.every(v => v.palier === R.palier(v.rank, mD.tiers)), 'palier = clamp(rank, T) pour chaque voix');
  ok(mD.voices.every(v => v.hits.length > 0), 'chaque voix projetée a au moins une frappe');

  // --- 7. Encart #fingerViz — DOM (djembé) ----------------------------------
  console.log('\n[7] Encart #fingerViz (DOM, djembé)');
  ok(!fvHidden(), 'encart visible (ma ligne non vide)');
  ok(fvLanes() === 3, '3 couloirs rendus');
  ok(fvHits() === mD.voices.reduce((s, v) => s + v.hits.length, 0), 'nombre de repères = total des frappes projetées');
  ok(eqArr(fvLabels(), ['slap', 'tone', 'basse']), 'ordre des couloirs = aigu en haut → grave en bas');

  // --- 8. Changement d'instrument cible : clamp & couloir vide honnête ------
  console.log('\n[8] Changement d\'instrument cible');
  setInstr('cajon');
  const mC = R.mapping();
  ok(mC.tiers === 3 && fvLanes() === 3, 'cajón : 3 couloirs');
  ok(mC.voices.find(v => v.id === 'grave').palier === 0, 'cajón grave → palier 0');
  ok(mC.voices.find(v => v.id === 'aigu').palier === 2, 'cajón aigu (rang 2) → palier 2 (médium laissé vide, honnête)');
  ok(!fvHidden(), 'encart visible malgré le couloir médium vide (d\'autres couloirs sonnent)');

  setInstr('agogo');
  const mA = R.mapping();
  ok(mA.tiers === 2, 'agogô : 2 paliers');
  ok(mA.voices.find(v => v.id === 'aigu').palier === 1, 'agogô aigu (rang 2) → clampé au palier 1 (T=2)');
  ok(fvLanes() === 2, 'agogô : 2 couloirs');

  setInstr('recoreco');
  const mR = R.mapping();
  ok(mR.tiers === 1 && fvLanes() === 1, 'reco-reco : 1 palier / 1 couloir');
  ok(mR.voices[0].palier === 0, 'reco-reco raclement (rang 2) → clampé au palier 0 (T=1)');

  // --- 9. Robustesse : tout palier projeté est un entier valide [0, T−1] ----
  console.log('\n[9] Aucun état cassé (palier ∈ [0, T−1], jamais NaN)');
  let allValid = true;
  ['djembe', 'cajon', 'dunduns', 'agogo', 'surdo', 'recoreco'].forEach(instr => {
    setInstr(instr);
    const m = R.mapping();
    m.voices.forEach(v => {
      if (!Number.isInteger(v.palier) || v.palier < 0 || v.palier > m.tiers - 1) allValid = false;
    });
  });
  ok(allValid, 'chaque frappe atterrit sur un couloir entier valide, tous instruments confondus');

  // --- 10. Doctrine : la basse funk n'est jamais projetée -------------------
  console.log('\n[10] Exclusion de la basse funk (instrument de référence)');
  setInstr('djembe');
  const beforeIds = R.mapping().voices.map(v => v.id).sort().join(',');
  $('bassOn').checked = true; $('bassOn').dispatchEvent(new window.Event('change'));
  const after = R.mapping();
  const afterIds = after.voices.map(v => v.id).sort().join(',');
  // NB : la voix grave du djembé s'appelle « basse » — c'est un palier légitime, pas la
  // basse funk (couche layer:'bass', jamais dans plVoiceList/percGrids). La doctrine se
  // vérifie par l'invariance de l'ensemble projeté quand on active la basse.
  ok(afterIds === beforeIds, 'basse funk activée : ensemble des voix projetées strictement inchangé');
  ok(afterIds === 'basse,slap,tone', 'projection = exactement les 3 voix du djembé (aucune injection basse funk)');
  ok(fvLanes() === 3, 'toujours 3 couloirs (aucun couloir « basse funk » ajouté)');
  $('bassOn').checked = false; $('bassOn').dispatchEvent(new window.Event('change'));

  // --- 11. Masquage quand ma ligne est vide ---------------------------------
  console.log('\n[11] Encart masqué si ma ligne est vide');
  setInstr('djembe');
  qsa('#percVoices .pv-mute input').forEach(mi => { if (!mi.checked) { mi.checked = true; mi.dispatchEvent(new window.Event('change')); } });
  ok(R.mapping().voices.length === 0, 'toutes les voix focales muettes → aucune voix projetée');
  ok(fvHidden(), 'encart #fingerViz masqué (classe hide)');

  // ---- bilan ---------------------------------------------------------------
  console.log('\n=== Bilan : ' + pass + '/' + (pass + fail) + ' \u2014 ' + (fail === 0 ? 'TOUT PASSE' : (fail + ' ÉCHEC(S)')) + ' ===\n');
  process.exit(fail === 0 ? 0 : 1);
});

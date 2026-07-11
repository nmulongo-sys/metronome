/* ============================================================================
   Recette headless — Métronome, variante « Cajón + cimbalette » (build 0.6.2)
   ----------------------------------------------------------------------------
   Harnais jsdom + stubs Web Audio/canvas (identique aux recettes antérieures).
   Pilotage par le DOM (#percInstr) ; observation via le DOM #fingerViz et le
   hook lecture seule window.fmMetroReg(). Le timbre de la cimbalette ne se juge
   PAS ici (jugement d'oreille, comme percScrape / la basse) : on vérifie le
   CÂBLAGE — 4 paliers, libellés, rang cimbalette → palier haut, médium vide
   honnête, 4 couloirs (cimbalette en haut), routage audio reconnu (source).

   Portée (spec validée ce fil) :
   - instrument focal distinct `cajoncym` (INSTR_TIERS statique) ;
   - cimbalette = 4e son réel (rang 3), montée sur la tapa ;
   - grave/aigu réutilisent les timbres du cajón ; cimbalette = percJingle ;
   - médium (palier 1) = vide honnête, comme le cajón classique ;
   - non-régression du curseur temps réel (0.6.1) : un curseur par piste.

   Usage : node recette-cajon-cymbalette.js   (depuis le dossier de index.html)
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
const qsa = sel => Array.from(window.document.querySelectorAll(sel));

function boot(cb) {
  if (typeof window.fmMetroReg === 'function') return cb();
  setTimeout(() => boot(cb), 10);
}
function setInstr(v) { $('percInstr').value = v; $('percInstr').dispatchEvent(new window.Event('change')); }
function lanes() { return qsa('#fingerViz .fv-lane'); }
function laneLabel(l) { const s = l.querySelector('.fv-label'); return s ? s.textContent : null; }
function laneHits(l) { return l.querySelectorAll('.fv-hit').length; }
function cursors() { return qsa('#fingerViz .fv-cursor'); }

boot(() => {
  console.log('\n=== Recette variante « Cajón + cimbalette » (0.6.2) ===\n');
  const R = window.fmMetroReg();

  // --- 1. Estampille de build ----------------------------------------------
  console.log('[1] Build');
  ok(typeof R.build === 'string' && /0\.6\.2/.test(R.build), 'BUILD bumpé à 0.6.2 (' + R.build + ')');

  // --- 2. Modèle de données (hook lecture seule) ---------------------------
  console.log('\n[2] Paliers & libellés (hook)');
  ok(R.tiers('cajoncym') === 4, 'cajoncym : 4 paliers (INSTR_TIERS)');
  const L = R.labels('cajoncym');
  ok(Array.isArray(L) && L.join('|') === 'grave|médium|aigu|cimbalette',
     'libellés = grave · médium · aigu · cimbalette (' + L.join(' · ') + ')');
  ok(R.palier(3, 4) === 3, 'rang 3 (cimbalette) → palier 3 (haut, clamp Option A)');
  ok(R.palier(2, 4) === 2, 'rang 2 (aigu) → palier 2');
  ok(R.palier(1, 4) === 1, 'rang 1 → palier 1 (le médium, réservé)');
  ok(R.palier(0, 4) === 0, 'rang 0 (grave) → palier 0 (bas)');
  ok(R.palier(9, 4) === 3, 'rang aberrant → clampé au palier haut (Option A, pas de crash)');

  // --- 3. Sélection + rangs des voix ---------------------------------------
  console.log('\n[3] Sélection cajoncym & rangs de voix');
  setInstr('cajoncym');
  ok(R.tiers() === 4, 'instrument focal = cajoncym → 4 paliers');
  ok(R.rankOf('grave') === 0, 'voix grave : rang 0');
  ok(R.rankOf('aigu') === 2, 'voix aigu : rang 2');
  ok(R.rankOf('cimbalette') === 3, 'voix cimbalette : rang 3 (4e son réel)');

  // --- 4. fingerViz : 4 couloirs, cimbalette en haut, grave en bas ---------
  console.log('\n[4] fingerViz — 4 couloirs (aigu → grave de haut en bas)');
  const ls = lanes();
  ok(ls.length === 4, '4 pistes rendues');
  ok(cursors().length === 4, '4 curseurs (un par piste — non-régression 0.6.1)');
  ok(laneLabel(ls[0]) === 'cimbalette', 'piste du HAUT = cimbalette');
  ok(laneLabel(ls[1]) === 'aigu', 'piste 2 = aigu');
  ok(laneLabel(ls[2]) === 'médium', 'piste 3 = médium');
  ok(laneLabel(ls[3]) === 'grave', 'piste du BAS = grave');

  // --- 5. Groove de base : cimbalette sonne, médium reste vide (honnête) ----
  console.log('\n[5] Groove de base & médium vide honnête');
  ok(laneHits(ls[0]) > 0, 'cimbalette porte des frappes (jingles du groove de base)');
  ok(laneHits(ls[3]) > 0, 'grave porte des frappes');
  ok(laneHits(ls[1]) > 0, 'aigu porte des frappes');
  ok(ls[2].classList.contains('empty') && laneHits(ls[2]) === 0,
     'médium (palier 1) = vide honnête (classe .empty, 0 frappe)');

  // --- 6. Câblage audio (source) : routage reconnu, timbre non jugé ---------
  console.log('\n[6] Routage audio (contrôle sur source — le son ne se juge pas ici)');
  ok(/function\s+percJingle\s*\(/.test(html), 'générateur percJingle défini (timbre cimbalette)');
  ok(/case\s+'cajoncym\.cimbalette'\s*:/.test(html), "case 'cajoncym.cimbalette' présent (→ percJingle)");
  ok(/case\s+'cajoncym\.grave'\s*:/.test(html), "case 'cajoncym.grave' présent (timbre cajón réutilisé)");
  ok(/case\s+'cajoncym\.aigu'\s*:/.test(html), "case 'cajoncym.aigu' présent (timbre cajón réutilisé)");
  ok(/cimbalette:\s*3/.test(html), 'REGISTER_RANK.kind.cimbalette = 3 (repli grossier cohérent)');

  // --- 7. Non-régression du cajón classique --------------------------------
  console.log('\n[7] Non-régression — cajón classique (3 paliers, médium vide)');
  setInstr('cajon');
  ok(R.tiers() === 3, 'cajón : 3 paliers');
  const lc = lanes();
  ok(lc.length === 3 && cursors().length === 3, 'cajón : 3 pistes, 3 curseurs');
  ok(laneLabel(lc[0]) === 'aigu' && laneLabel(lc[2]) === 'grave', 'cajón : aigu en haut, grave en bas');
  ok(lc[1].classList.contains('empty'), 'cajón : médium toujours vide honnête (inchangé)');
  setInstr('djembe');
  ok(R.tiers() === 3 && cursors().length === 3, 'retour djembé : 3 paliers, 3 curseurs (aucun orphelin)');

  // ---- bilan ---------------------------------------------------------------
  console.log('\n=== Bilan : ' + pass + '/' + (pass + fail) + ' \u2014 ' + (fail === 0 ? 'TOUT PASSE' : (fail + ' ÉCHEC(S)')) + ' ===\n');
  process.exit(fail === 0 ? 0 : 1);
});

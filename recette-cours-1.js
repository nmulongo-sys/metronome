/* ============================================================================
   Recette headless — Cours funk, étape C1 : chargeur d'exercice & fiche
   ----------------------------------------------------------------------------
   Spec : cours-funk-spec-implementation.md (§2 mapping pattern → fm-metro, §3
   ordre du chargeur, §6 étape C1). Données : cours-funk-exercices-debutant.json
   (lot 1, embarqué en FUNK_EXOS).

   Portée C1 :
     [1] Données embarquées : 16 exercices, IDs uniques, conformes au §3.
     [2] Chargement : voix fk.* dans percGrids/percOffsets/percMeta, valeurs de
         pas (F=2, mf/ghost=1), gain (ghost=0.35, sinon 1), timbre routé.
     [3] Swing → percOffsets : binaire strict au lot 1 (offsets nuls) ; formule
         5.4 sur les pas impairs quand swing≠null (test synthétique).
     [4] Sourdine focale : voix focales muettes, fk.* audibles, clave intacte.
     [5] Tempo : S.tempo = tempo.conseille au chargement.
     [6] Décharge : voix fk.* retirées, tempo/gap utilisateur restaurés.
     [7] Exclusion mutuelle team spirit ↔ cours.
     [8] Progression locale : markDone écrit fm-funk-progress.
     [9] cajon.tone : cas de routage présent et distinct du slap.
     [10] Non-régression : estampille build, perc focale par défaut intacte.

   Usage : node recette-cours-1.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }

// ---- stubs Web Audio (enregistreurs, alignés sur recette-5-4) ----------------
function makeParam() {
  return { value: 0, calls: [],
    setValueAtTime(v, t) { this.calls.push(['set', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); },
    linearRampToValueAtTime(v, t) { this.calls.push(['lin', v, t]); } };
}
let NODES = [];
function makeNode(kind) {
  const n = { kind, frequency: makeParam(), gain: makeParam(), Q: makeParam(),
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
function boot(cb) { if (typeof window.fmFunk === 'function') return cb(); setTimeout(() => boot(cb), 10); }

boot(() => {
  const F = window.fmFunk();
  const lot1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'cours-funk-exercices-debutant.json'), 'utf-8'));

  // ---- [1] données embarquées conformes au fichier source -------------------
  console.log('\n[1] Données embarquées');
  ok(F.exos.length === 16, '16 exercices embarqués (' + F.exos.length + ')');
  const ids = new Set(F.exos.map(e => e.id));
  ok(ids.size === 16, '16 IDs uniques');
  ok(F.exos.length === lot1.exercices.length &&
     F.exos.every((e, i) => e.id === lot1.exercices[i].id),
     'ordre et IDs identiques au JSON source');
  const caj = F.exos.filter(e => e.parcours === 'cajon').length;
  const dje = F.exos.filter(e => e.parcours === 'djembe').length;
  ok(caj === 8 && dje === 8, '8 cajón + 8 djembé (' + caj + '/' + dje + ')');

  // ---- [2] chargement : grilles, valeurs de pas, gain, méta -----------------
  console.log('\n[2] Chargement d\'un exercice (groove socle CAJ-1-E4-01)');
  F.load('CAJ-1-E4-01');
  const g = F.grids(), m = F.meta();
  ok(!!g['fk.CJ-G1'] && !!g['fk.CJ-G3'] && !!g['fk.CJ-M1'], '3 voix fk.* injectées');
  ok(g['fk.CJ-G1'].length === 16, 'grille de 16 pas');
  ok(g['fk.CJ-G1'][0] === 2 && g['fk.CJ-G1'][8] === 2, 'grave (F) = pas accentués (2) sur 1 et 3');
  ok(g['fk.CJ-G3'][4] === 2 && g['fk.CJ-G3'][12] === 2, 'slap (F) = accents sur 2 et 4');
  const ghostVals = g['fk.CJ-M1'].filter(x => x > 0);
  ok(ghostVals.every(x => x === 1), 'ghosts = pas normaux (1), jamais accentués');
  ok(m['fk.CJ-M1'].gain === 0.35, 'gain ghost = 0.35');
  ok(m['fk.CJ-G1'].gain === 1, 'gain accent = 1');
  ok(m['fk.CJ-G1'].instr === 'cajon' && m['fk.CJ-G1'].voiceKind === 'grave', 'routage CJ-G1 → cajon.grave');
  ok(m['fk.CJ-G3'].voiceKind === 'aigu' && m['fk.CJ-M1'].voiceKind === 'tone',
     'slap → cajon.aigu, ghost → cajon.tone (contraste préservé)');

  // ---- [3] swing → percOffsets ----------------------------------------------
  console.log('\n[3] Swing → percOffsets');
  const off = F.offsets();
  ok(off['fk.CJ-G1'].every(x => x === 0), 'lot 1 (swing null) : offsets tous nuls (binaire strict)');
  // test synthétique de la formule 5.4 sur un exercice à swing 60
  const synth = { pattern: { swing: 60 } };
  const so = F.offsetsFor(synth, 16);
  ok(so[0] === 0 && so[2] === 0 && so[14] === 0, 'swing 60 : pas pairs immobiles');
  ok(Math.abs(so[1] - 0.2) < 1e-9 && Math.abs(so[3] - 0.2) < 1e-9, 'swing 60 : pas impairs décalés de +0.2 (2·0.6−1)');
  const so50 = F.offsetsFor({ pattern: { swing: 50 } }, 16);
  ok(so50.every(x => x === 0), 'swing 50 : identité stricte (offsets nuls)');

  // ---- [4] sourdine focale ---------------------------------------------------
  console.log('\n[4] Sourdine de la percussion focale');
  ok(F.muted('slap') === true && F.muted('basse') === true, 'voix focales (djembé) en sourdine');
  ok(F.muted('fk.CJ-G1') === false && F.muted('fk.CJ-M1') === false, 'voix fk.* audibles');
  const claveVoice = Object.keys(F.grids()).find(v => v.indexOf('clave') === 0 || v === 'claveHaute' || v === 'claveBasse');
  if (claveVoice) ok(F.muted(claveVoice) === false, 'clave intacte (' + claveVoice + ')');
  else ok(true, 'clave : pas de voix clave active (skip)');

  // ---- [5] tempo -------------------------------------------------------------
  console.log('\n[5] Tempo au chargement');
  const e4 = F.exos.find(x => x.id === 'CAJ-1-E4-01');
  ok($('tempoValue').textContent === String(e4.tempo.conseille), 'S.tempo = tempo.conseille (' + e4.tempo.conseille + ')');

  // ---- [6] décharge : restauration ------------------------------------------
  console.log('\n[6] Décharge & restauration');
  // pose un tempo utilisateur AVANT un nouveau chargement pour vérifier la restauration
  F.unload();
  $('tempoSlider').value = '120'; $('tempoSlider').dispatchEvent(new window.Event('input'));
  ok($('tempoValue').textContent === '120', 'tempo utilisateur posé à 120');
  F.load('DJE-1-F1-01');
  ok($('tempoValue').textContent === '80', 'chargement DJE-1-F1-01 → tempo 80');
  ok(!!F.grids()['fk.DJ-G1'], 'voix fk.DJ-G1 injectée');
  F.unload();
  ok(!F.grids()['fk.DJ-G1'] && !F.grids()['fk.CJ-G1'], 'aucune voix fk.* après décharge');
  ok($('tempoValue').textContent === '120', 'tempo utilisateur (120) restauré');
  ok(F.muted('slap') === false, 'percussion focale ré-audible après décharge');

  // ---- [7] exclusion mutuelle team spirit -----------------------------------
  console.log('\n[7] Exclusion mutuelle team spirit ↔ cours');
  // charge un groove de répertoire puis un exercice : le groove doit se décharger
  const grv = window.document.getElementById('tsGroove');
  if (grv && grv.options.length) {
    grv.selectedIndex = 0; grv.dispatchEvent(new window.Event('change'));
    $('tsLoad').click();
    const tsLoaded = Object.keys(F.grids()).some(v => v.indexOf('ts.') === 0);
    F.load('CAJ-1-E1-01');
    const tsStill = Object.keys(F.grids()).some(v => v.indexOf('ts.') === 0);
    const fkNow = Object.keys(F.grids()).some(v => v.indexOf('fk.') === 0);
    ok(tsLoaded, 'groove team spirit chargé (voix ts.*)');
    ok(!tsStill && fkNow, 'charger l\'exercice a déchargé le répertoire');
    F.unload();
  } else { ok(true, 'pas de groove listé (skip)'); ok(true, 'skip'); }

  // ---- [8] progression locale -----------------------------------------------
  console.log('\n[8] Progression locale (fm-funk-progress)');
  F.load('CAJ-1-E1-01');
  F.markDone();
  const prog = F.progress();
  ok(prog['CAJ-1-E1-01'] && prog['CAJ-1-E1-01'].fait === true, 'exercice marqué réussi dans fm-funk-progress');
  ok(!!window.localStorage.getItem('fm-funk-progress'), 'clé fm-funk-progress persistée');
  F.unload();

  // ---- [9] cajon.tone distinct ----------------------------------------------
  console.log('\n[9] Timbre cajon.tone');
  ok(html.indexOf("case 'cajon.tone'") > -1, 'cas cajon.tone présent dans playPerc');
  ok(html.indexOf("case 'cajon.aigu'") > -1 && html.indexOf("'cajon.tone':1") > -1,
     'cajon.tone routable (TS_VALID) et distinct de cajon.aigu');

  // ---- [10] non-régression ---------------------------------------------------
  console.log('\n[10] Non-régression');
  ok(/metronomefunk-0\.5\.4-c[0-9]/.test(html), 'estampille build 0.5.4-c* (cours funk)');
  ok(!!F.grids()['basse'] && !!F.grids()['tone'] && !!F.grids()['slap'], 'percussion focale djembé par défaut intacte (3 voix)');
  ok(F.state.loaded === false, 'état FK déchargé en fin de recette');

  console.log('\n================ ' + pass + '/' + (pass + fail) + ' ================');
  if (fail) process.exit(1);
});

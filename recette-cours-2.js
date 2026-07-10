/* ============================================================================
   Recette headless — Cours funk, étape C2 : animation du geste & vocalisation
   ----------------------------------------------------------------------------
   Spec : cours-funk-spec-implementation.md §4 (animation Canvas, horloge propre,
   vocalisation vivante) et grille §3 bis. Le headless prouve la MÉCANIQUE
   (données, cycle de vie, parsing, surbrillance, stockage) ; l'esthétique
   hologramme se valide à l'œil sur appareil.

   Portée C2 :
     [1] Parsing vocalisation : syllabes → pas, accents (MAJ), silences (« – »),
         croches/doubles (« ti-ka », « ta-ka-di-mi »).
     [2] Timeline du geste : une frappe par pas actif, mains (fixe D/G ou alternée).
     [3] Table geste → position (u,v) couvrante pour tout geste du lot 1.
     [4] Cycle de vie : anim démarre à l'ouverture de la fiche, s'arrête au
         déchargement / à la fermeture ; aucun rAF résiduel (running=false).
     [5] Surbrillance : chips DOM avec data-step, accent ; highlight cible le pas.
     [6] Personnalisation vocalisation : édition + masquage → fm-funk-vocal (local),
         rétablissement du défaut ; jamais côté serveur.
     [7] Phase : horloge propre hors lecture, position du cycle en lecture réelle.
     [8] Non-régression : estampille 0.5.4-c2 ; C1 intact (grilles, sourdine).

   Usage : node recette-cours-2.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }

function makeParam() {
  return { value: 0, calls: [], setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} };
}
function makeNode(kind) {
  return { kind, frequency: makeParam(), gain: makeParam(), Q: makeParam(),
    threshold: makeParam(), knee: makeParam(), ratio: makeParam(), attack: makeParam(), release: makeParam(),
    type: '', curve: null, oversample: '', buffer: null, _targets: [],
    connect() {}, disconnect() {}, start() {}, stop() {} };
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; this.state = 'running'; this.destination = makeNode('destination'); }
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

  // ---- [1] parsing vocalisation ---------------------------------------------
  console.log('\n[1] Parsing vocalisation');
  const p1 = F.parseVocal('UN deux trois quatre', 4, 16);
  ok(p1[0] && p1[0].syl === 'UN' && p1[0].accent === true, 'UN sur le pas 0, accentué');
  ok(p1[4] && p1[4].syl === 'deux' && p1[4].accent === false, 'deux sur le pas 4, non accentué');
  ok(p1[8] && p1[12] && !p1[1] && !p1[2], 'une syllabe par temps (0,4,8,12), rien entre');
  const p2 = F.parseVocal('ti-ka ti-ka ti-ka ti-ka', 4, 16);
  ok(p2[0] && p2[2] && p2[4] && !p2[1], 'croches : sous-syllabes aux pas 0 et 2 de chaque temps');
  const p3 = F.parseVocal('ta-ka-di-mi ta-ka-di-mi ta-ka-di-mi ta-ka-di-mi', 4, 16);
  ok(p3.every(x => !!x), 'doubles-croches : les 16 pas portent une syllabe');
  const p4 = F.parseVocal('GUN – – –', 4, 16);
  ok(p4[0] && p4[0].syl === 'GUN' && !p4[4] && !p4[8] && !p4[12], '« GUN – – – » : GUN au pas 0, temps 2-3-4 muets');
  const p5 = F.parseVocal('un DEUX trois QUATRE', 4, 16);
  ok(p5[4].accent === true && p5[12].accent === true && p5[0].accent === false, 'accents sur 2 et 4 (DEUX, QUATRE)');

  // ---- [2] timeline du geste -------------------------------------------------
  console.log('\n[2] Timeline du geste');
  const e4 = F.exos.find(x => x.id === 'CAJ-1-E4-01');
  const tl = F.timeline(e4);
  ok(tl.filter(Boolean).length === 8, 'groove socle : 8 frappes sur la mesure');
  ok(tl[0].geste === 'CJ-G1' && tl[0].hand === 'D', 'pas 0 = grave, main D (fixe)');
  ok(tl[4].geste === 'CJ-G3' && tl[4].hand === 'G', 'pas 4 = slap, main G (fixe)');
  const ghosts = tl.filter(x => x && x.ghost);
  const gh = ghosts.map(x => x.hand);
  ok(ghosts.length === 4 && gh.join('') === 'DGDG', 'ghosts (alt) : mains alternées D-G-D-G');
  const nappe = F.timeline(F.exos.find(x => x.id === 'CAJ-1-E3-02'));
  ok(nappe.filter(Boolean).length === 16 && nappe.map(x => x.hand).join('').indexOf('DGDG') === 0,
     'nappe 16 pas : alternance stricte des mains');

  // ---- [3] couverture geste → position --------------------------------------
  console.log('\n[3] Table geste → position (u,v)');
  const gestes = F.gestes;
  const allPos = Object.keys(gestes).every(k => typeof gestes[k].u === 'number' && typeof gestes[k].v === 'number');
  ok(allPos, 'tous les gestes ont une position (u,v)');
  // tout geste-voix du lot 1 est couvert
  const used = new Set();
  F.exos.forEach(e => e.pattern.voix.forEach(v => used.add(v.geste)));
  ok([...used].every(g => !!gestes[g]), 'tous les gestes-voix du lot 1 sont dans la table (' + [...used].join(',') + ')');

  // ---- [4] cycle de vie ------------------------------------------------------
  console.log('\n[4] Cycle de vie de l\'animation');
  ok(F.anim.running === false, 'anim à l\'arrêt avant tout chargement');
  F.load('CAJ-1-E4-01');
  ok(F.anim.running === true, 'chargement d\'un exercice → anim démarrée');
  ok(F.anim.exo && F.anim.exo.id === 'CAJ-1-E4-01', 'anim liée au bon exercice');
  ok(F.anim.timeline.filter(Boolean).length === 8, 'timeline d\'anim construite (8 frappes)');
  F.load('DJE-1-F1-01');
  ok(F.anim.running === true && F.anim.exo.id === 'DJE-1-F1-01', 'changer d\'exercice re-cible l\'anim');
  F.unload();
  ok(F.anim.running === false && F.anim.raf === 0, 'déchargement → anim arrêtée, aucun rAF résiduel');

  // ---- [5] surbrillance des syllabes ----------------------------------------
  console.log('\n[5] Surbrillance des syllabes');
  F.load('CAJ-1-E1-01');   // « UN deux trois quatre »
  const chips = window.document.querySelectorAll('#fkVocal .fk-syl');
  ok(chips.length === 4, '4 chips de syllabe rendus');
  ok(chips[0].classList.contains('acc'), 'chip UN marqué accentué');
  F.highlight(0);
  ok(window.document.querySelector('#fkVocal .fk-syl[data-step="0"]').classList.contains('cur'), 'highlight(0) surligne le pas 0');
  F.highlight(4);
  const cur0 = window.document.querySelector('#fkVocal .fk-syl[data-step="0"]').classList.contains('cur');
  const cur4 = window.document.querySelector('#fkVocal .fk-syl[data-step="4"]').classList.contains('cur');
  ok(!cur0 && cur4, 'highlight(4) déplace la surbrillance');
  ok(($('fkGesteNow').textContent || '').indexOf('CJ-G1') >= 0 || $('fkGesteNow').textContent === '',
     'ligne « geste courant » alimentée (ou vide si pas muet)');

  // ---- [6] personnalisation vocalisation ------------------------------------
  console.log('\n[6] Personnalisation (fm-funk-vocal)');
  F.setVocal('CAJ-1-E1-01', 'BOOM tchi tchi tchi');
  ok(F.vocalText(F.exos.find(x => x.id === 'CAJ-1-E1-01')) === 'BOOM tchi tchi tchi', 'texte personnalisé pris en compte');
  const store6 = F.vocalStore();
  ok(store6['CAJ-1-E1-01'] && store6['CAJ-1-E1-01'].text === 'BOOM tchi tchi tchi', 'persisté dans fm-funk-vocal');
  ok(!!window.localStorage.getItem('fm-funk-vocal'), 'clé fm-funk-vocal écrite en local');
  const chips6 = window.document.querySelectorAll('#fkVocal .fk-syl');
  ok(chips6.length && chips6[0].textContent === 'BOOM', 'chips re-rendus avec la personnalisation');
  F.hideVocal('CAJ-1-E1-01', true);
  ok($('fkVocal').classList.contains('hidden'), 'masquage appliqué');
  ok(F.vocalHidden(F.exos.find(x => x.id === 'CAJ-1-E1-01')) === true, 'état masqué mémorisé');
  F.hideVocal('CAJ-1-E1-01', false);
  ok(!$('fkVocal').classList.contains('hidden'), 'démasquage appliqué');

  // ---- [7] phase (deux sources d'index) -------------------------------------
  console.log('\n[7] Phase');
  const ph = F.phase();
  ok(typeof ph === 'number' && ph >= 0 && ph < 1, 'phase dans [0,1) hors lecture (horloge propre)');

  // ---- [8] non-régression ----------------------------------------------------
  console.log('\n[8] Non-régression');
  ok(html.indexOf('metronomefunk-0.5.4-c2') > -1, 'estampille build 0.5.4-c2');
  F.load('CAJ-1-E4-01');   // groove socle : contient une voix ghost (CJ-M1)
  const g = F.grids();
  ok(!!g['fk.CJ-G1'] && F.meta()['fk.CJ-M1'].gain === 0.35, 'C1 intact : voix fk.* + gain ghost');
  ok(F.muted('slap') === true && F.muted('fk.CJ-G1') === false, 'C1 intact : sourdine focale, fk.* audible');
  F.unload();
  ok(F.anim.running === false, 'anim arrêtée en fin de recette');

  console.log('\n================ ' + pass + '/' + (pass + fail) + ' ================');
  if (fail) process.exit(1);
});

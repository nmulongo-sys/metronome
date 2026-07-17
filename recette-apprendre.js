/* recette-apprendre.js — R-4a : apprendre.html (scénario 2, l'apprenant au
   milieu de ses leçons). Headless jsdom, mêmes stubs que les suites P-*.
   Vérifie (spec R-4 §3, GO du 16/07) :
     A. chargement propre + page minimale : transport seul, AUCUN tiroir de
        réglages (les sections d'index/pratiquer n'existent pas ici), stubs
        réduits au STRICT contrat moteur (percFsPlay + gapTarget) ;
     B. contrat moteur rempli : hooks no-op + globals neutres, moteur
        opérationnel (computeCycle produit le clic) ;
     C. parcours transplanté VERBATIM : rendu, niveaux, chargeur de preset,
        acquis/votes sur les MÊMES clés localStorage (la progression survit) ;
     D. mode écoute (demo) : injection/restauration des grilles de coquille,
        swing porté par la démo, S.swing jamais modifié, variantes par
        instrument des EX-SOCLE, zéro état résiduel au retour en pratique ;
     E. compte partagé : coquille/fm-compte.js chargé (fmSupabase défini).
   Usage : node recette-apprendre.js [chemin/apprendre.html]  (défaut ./apprendre.html) */
'use strict';
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'apprendre.html');
const html = require('./recette-harnais').chargeHtml(FILE);

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };

function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}

const vc = new VirtualConsole();
const jsdomErrors = [];
vc.on('jsdomError', (e) => jsdomErrors.push(String(e && e.message || e)));

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc,
  beforeParse(w) {
    w.AudioContext = w.webkitAudioContext = function () {
      return new Proxy({}, { get: (t, k) => {
        if (k === 'destination') return {};
        if (k === 'currentTime') return 0;
        if (k === 'sampleRate') return 44100;
        if (k === 'state') return 'running';
        if (k === 'createBuffer') return () => ({ getChannelData: () => new Float32Array(1) });
        if (k === 'decodeAudioData') return async () => ({});
        return () => new Proxy({ gain: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, cancelScheduledValues(){} },
          frequency: { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} },
          type: '', Q: { value: 0 }, buffer: null,
          connect(){ return this; }, disconnect(){}, start(){}, stop(){}, setValueAtTime(){}, setTargetAtTime(){} }, {
          get: (tt, kk) => (kk in tt ? tt[kk] : () => {}) });
      }});
    };
    const proto = w.HTMLCanvasElement && w.HTMLCanvasElement.prototype;
    if (proto) proto.getContext = () => canvasCtx();
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
    w.requestAnimationFrame = w.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
    w.cancelAnimationFrame = w.cancelAnimationFrame || ((id) => clearTimeout(id));
    w.ResizeObserver = w.ResizeObserver || function () { return { observe(){}, unobserve(){}, disconnect(){} }; };
  }
});

const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const clic = el => el.dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
const g = expr => W.eval(expr);   // accès aux bindings lexicaux (const/let) de la portée globale partagée

setTimeout(runTests, 120);

function runTests() {
  /* ---------- A. chargement + page minimale ---------- */
  ok('chargement sans erreur jsdom (' + jsdomErrors.length + ')', jsdomErrors.length === 0);
  ok('BUILD 0.15.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.15.0');
  ok('2 corpus chargés (socle-technique + funk), 152 exercices assemblés',
    Object.keys(W.FM_CORPUS || {}).length === 2 && Object.keys(g('FM_ASM.exercices')).length === 152);
  ok('pas de répertoire ici : FM_GROOVES absent (la page ne charge pas les grooves)',
    W.FM_GROOVES === undefined);
  ok('transport minimal présent (start, tempo, statut)',
    !!($('startBtn') && $('tempoValue') && $('tempoSlider') && $('minusBtn') && $('plusBtn') && $('statusLine')));
  const SECTIONS_AILLEURS = ['secPerc', 'secBass', 'secClave', 'secRepertoire', 'secGroove',
    'secGap', 'secSon', 'secScript', 'secTeam', 'secArchet', 'secBiblio', 'playScreen',
    'playSetup', 'wizardBtn', 'modeSimpleBtn', 'atelierBtn'];
  ok('AUCUN tiroir de réglages : les surfaces d\'index/pratiquer n\'existent pas ici',
    SECTIONS_AILLEURS.every(id => !$(id)));
  const stubs = $('fmStubs');
  ok('stubs réduits au STRICT contrat moteur : percFsPlay + gapTarget, rien d\'autre',
    !!stubs && stubs.children.length === 2 && !!D.querySelector('#fmStubs #percFsPlay') &&
    !!D.querySelector('#fmStubs #gapTarget'));
  ok('liens de navigation : accueil + pratique libre',
    !!D.querySelector('a[href="index.html"]') && !!D.querySelector('a[href="pratiquer.html"]'));

  /* ---------- B. contrat moteur rempli ---------- */
  ok('hooks de coquille présents (no-op) : script/perc/break/bow/wake/draw/ts',
    ['scriptOnNewMeasure', 'percOnNewMeasure', 'percBreakEvents', 'percResetBreakState',
     'bowReset', 'wakeLockUpdate', 'draw', 'drawStatic', 'tsMuted', 'atelierRender']
      .every(f => g('typeof ' + f) === 'function'));
  ok('globals neutres : percGrids vide, claveData vide, accompMuted=false, statusLineLast déclaré',
    Object.keys(g('percGrids')).length === 0 && Object.keys(g('claveData')).length === 0 &&
    g('accompMuted') === false && g('statusLineLast') === null);
  ok('palette minimale : PERC_INSTR porte les voix moteur des deux parcours',
    JSON.stringify(g('PERC_INSTR.cajon.voices.map(v => v.id)')) === '["grave","aigu"]' &&
    JSON.stringify(g('PERC_INSTR.djembe.voices.map(v => v.id)')) === '["basse","tone","slap"]');
  ok('moteur opérationnel : computeCycle produit le clic (4 temps + sous-divisions)',
    g('computeCycle(); events.filter(e => e.layer === "beat").length') === 4);
  ok('fonctions de page pour le chargeur : setTempo/setSwing/setFamily/buildPercGrids',
    ['setTempo', 'setSwing', 'setFamily', 'buildPercGrids'].every(f => g('typeof ' + f) === 'function'));

  /* ---------- C. parcours transplanté verbatim ---------- */
  const api = W.fmMetroParcours();
  ok('API fmMetroParcours complète (transplantée + diagnostic écoute R-4a)',
    !!(api && api.data && api.presetFor && api.loadPreset && api.isAcquis && api.niveauxPeuples && api.ecoute));
  ok('4 niveaux peuplés (Débutant → Artiste)',
    JSON.stringify(api.niveauxPeuples()) === '["debutant","intermediaire","avance","artiste"]');
  ok('niveau affiché par défaut : Débutant (premier peuplé)', api.niveau() === 'debutant');
  ok('rendu : 2 colonnes (cajón/djembé), onglets de niveau',
    D.querySelectorAll('#pfRoot .pf-col').length === 2 && D.querySelectorAll('#pfRoot .pf-niv-tab').length === 4);
  ok('Débutant : 50 fiches rendues (2 parcours × 5 modules × 5 exercices)',
    D.querySelectorAll('#pfRoot .pf-card').length === 50);

  // chargeur de preset — Débutant (clic seul : subdivisions + gap)
  const cGap = D.querySelector('.pf-card[data-ex="EX-SOCLE-D-PLS-04"][data-parc="cajon"]');
  clic(cGap.querySelector('.pf-load'));
  ok('preset Débutant chargé : clic seul (basse OFF), gap fixe posé par le preset',
    g('S.bass.on') === false && g('S.gap.mode') === 'fixed' && g('S.gap.playN') === 4 && g('S.gap.muteM') === 1);
  ok('tempo conseillé appliqué et affiché (80)', g('S.tempo') === 80 && $('tempoValue').textContent === '80');

  // chargeur de preset — Intermédiaire (accompagnement basse)
  api.showNiveau('intermediaire');
  const cT1 = D.querySelector('.pf-card[data-ex="EX-SOCLE-T1-01"][data-parc="cajon"]');
  clic(cT1.querySelector('.pf-load'));
  ok('preset Intermédiaire chargé : basse ON, theOne/vamp1, drop off',
    g('S.bass.on') === true && g('S.bass.pattern') === 'theOne' && g('S.bass.prog') === 'vamp1' &&
    g('S.bass.drop.on') === false);

  // acquis + votes : MÊMES clés localStorage (la progression survit à la migration)
  api.setAcquis('cajon', 'EX-SOCLE-T1-01', true);
  ok('acquis : clé « fm-metro-parcours » inchangée (la progression survit)',
    /EX-SOCLE-T1-01/.test(W.localStorage.getItem('fm-metro-parcours') || '') &&
    api.isAcquis('cajon', 'EX-SOCLE-T1-01') === true);
  api.setAcquis('cajon', 'EX-SOCLE-T1-01', false);
  api.vote('cajon', 'EX-SOCLE-T1-01', 'atome', 'ok');
  ok('vote : file hors-ligne « pf_vote_queue » inchangée',
    /EX-SOCLE-T1-01/.test(W.localStorage.getItem('pf_vote_queue') || ''));

  /* ---------- D. mode écoute (demo) ---------- */
  ok('fiches à démo : bouton « ▶ Écouter » ; fiches sans démo : mention discrète',
    !!cT1.querySelector('.pf-ecouter') &&
    !!D.querySelector('.pf-card[data-ex="EX-CJ-B2-04"] .pf-nodemo') &&
    !D.querySelector('.pf-card[data-ex="EX-CJ-B2-04"] .pf-ecouter'));

  clic(cT1.querySelector('.pf-ecouter'));
  ok('Écouter : la démo est injectée dans les grilles de coquille (demo.grave)',
    api.ecoute.active() === true && !!g('percGrids["demo.grave"]') &&
    g('percMeta["demo.grave"].instr') === 'cajon' && g('S.perc.on') === true);
  ok('Écouter : la lecture démarre (un clic = un geste utilisateur)', g('isPlaying') === true);
  ok('la démo produit des événements perc : le grave accentué sur The One',
    g('computeCycle(); events.filter(e => e.layer === "perc" && e.voice === "demo.grave").length') === 1 &&
    g('events.find(e => e.layer === "perc" && e.voice === "demo.grave").frac') === 0 &&
    g('events.find(e => e.layer === "perc" && e.voice === "demo.grave").accent') === 2);
  ok('l\'accompagnement joue SOUS la démo (couche bass présente)',
    g('events.filter(e => e.layer === "bass").length') > 0);
  ok('statut : mode écoute annoncé', /Écoute/.test($('statusLine').textContent));

  // bascule en pratique : Charger retire la démo, l'accompagnement reste
  clic(cT1.querySelector('.pf-load'));
  ok('Charger : la démo est retirée (grilles restaurées, zéro résidu)',
    api.ecoute.active() === false && Object.keys(g('percGrids')).length === 0 &&
    Object.keys(g('percMeta')).length === 0 && Object.keys(g('percOffsets')).length === 0 &&
    g('S.perc.on') === false);
  ok('Charger : l\'accompagnement du preset reste en place (basse ON)',
    g('S.bass.on') === true && g('S.bass.pattern') === 'theOne');
  g('stop()');

  // variantes par instrument des EX-SOCLE partagés
  ok('EX-SOCLE partagé : la variante suit le parcours (cajon→grave, djembe→basse)',
    api.ecoute.resolve('EX-SOCLE-T1-01', 'cajon').instr === 'cajon' &&
    !!api.ecoute.resolve('EX-SOCLE-T1-01', 'cajon').voix.grave &&
    api.ecoute.resolve('EX-SOCLE-T1-01', 'djembe').instr === 'djembe' &&
    !!api.ecoute.resolve('EX-SOCLE-T1-01', 'djembe').voix.basse);
  ok('exercice sans démo : resolve renvoie null (dégradé propre)',
    api.ecoute.resolve('EX-CJ-B2-04', 'cajon') === null);

  // swing porté par la démo (T2-03 : 62) — S.swing du preset JAMAIS modifié
  api.ecoute.apply('EX-SOCLE-T2-03', 'djembe');
  const offs = g('percOffsets["demo.tone"]');
  ok('démo swinguée : offsets posés sur les pas impairs (2·62/100 − 1 = 0,24)',
    Array.isArray(offs) && Math.abs(offs[1] - 0.24) < 1e-9 && offs[0] === 0 && offs[2] === 0,
  );
  ok('S.swing du preset INTACT (50) — le swing appartient à la démo', g('S.swing') === 50);
  api.ecoute.clear();
  ok('clear : offsets retirés avec la démo', g('percOffsets["demo.tone"]') === undefined);

  // R-4c : feel porté par la démo (P1 laid-back +18 ms / P2 pushed −18 ms) —
  // décalage CONSTANT de toutes les frappes, converti en fraction de pas au
  // tempo courant (flOff = feel·tempo·steps/240000) ; identité à l'absence.
  api.ecoute.apply('EX-SOCLE-P1-01', 'cajon');
  const flAttendu = 18 * g('S.tempo') * 16 / 240000;
  const offsP1 = g('percOffsets["demo.aigu"]');
  ok('démo laid-back (P1-01) : offset constant positif sur TOUS les pas (feel +18 ms)',
    Array.isArray(offsP1) && offsP1.every(o => Math.abs(o - flAttendu) < 1e-9) && flAttendu > 0);
  api.ecoute.clear();
  api.ecoute.apply('EX-SOCLE-P2-01', 'cajon');
  const offsP2 = g('percOffsets["demo.aigu"]');
  ok('démo pushed (P2-01) : offset constant négatif (feel −18 ms), retiré au clear',
    Array.isArray(offsP2) && offsP2.every(o => Math.abs(o + flAttendu) < 1e-9) &&
    (api.ecoute.clear(), g('percOffsets["demo.aigu"]') === undefined));

  // grille courte (Débutant, 4 pas) : les fracs suivent la longueur de la grille
  api.ecoute.apply('EX-SOCLE-D-PLS-03', 'cajon');   // le 1 et le 3 : [1,0,1,0]
  ok('grille de 4 pas : fracs = 0 et 0,5 (indépendantes de S.perc.count)',
    JSON.stringify(g('computeCycle(); events.filter(e => e.layer === "perc").map(e => e.frac)')) === '[0,0.5]');
  api.ecoute.clear();

  // démo multi-voix (djembé : bass + tone + slap)
  api.ecoute.apply('EX-DJ-SON-05', 'djembe');
  ok('démo multi-voix : trois voix injectées, timbres par voix (percMeta)',
    api.ecoute.voices().length === 3 && g('percMeta["demo.slap"].voiceKind') === 'slap');
  api.ecoute.clear();

  /* ---------- E. compte partagé (coquille/fm-compte.js) ---------- */
  ok('fm-compte chargé : window.fmSupabase défini (client nul hors ligne, gardé)',
    typeof W.fmSupabase === 'function' && W.fmSupabase() === null);
  ok('carte compte présente (acctDim/acctCard/btnAccount)',
    !!($('acctDim') && $('acctCard') && $('btnAccount')));
  ok('la surcouche P-4 réutilise ce client (pfSb → null hors ligne, file locale)',
    g('typeof pfSb') === 'function' && g('pfSb()') === null);

  console.log(`\n--- apprendre (R-4a) : ${PASS} vertes, ${FAIL} rouges (total ${PASS + FAIL}) ---`);
  process.exit(FAIL ? 1 : 0);
}

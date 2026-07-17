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

// R-5 : stubs factorisés — réutilisés par le second DOM du test i18n (section F)
function jsdomStubs(w) {
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

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc,
  beforeParse: jsdomStubs
});

const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const clic = el => el.dispatchEvent(new W.MouseEvent('click', { bubbles: true }));
const g = expr => W.eval(expr);   // accès aux bindings lexicaux (const/let) de la portée globale partagée

setTimeout(runTests, 120);

function runTests() {
  /* ---------- A. chargement + page minimale ---------- */
  ok('chargement sans erreur jsdom (' + jsdomErrors.length + ')', jsdomErrors.length === 0);
  ok('BUILD 0.21.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.21.0');
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

  /* ---------- D2. la grille d'exercice vivante (R-4d) ---------- */
  // Écouter pose la grille dans SA carte — elle rend le champ demo (pas percGrids) :
  // une ligne par voix, autant de cases que de pas, accents distingués.
  // NB : le vote de la section C a re-rendu le parcours (pfVote → pfRender) —
  // on requête la carte FRAÎCHE, cT1 est un nœud périmé.
  const cT1d = D.querySelector('.pf-card[data-ex="EX-SOCLE-T1-01"][data-parc="cajon"]');
  clic(cT1d.querySelector('.pf-ecouter'));
  let gEl = cT1d.querySelector('.pf-grille');
  ok('R-4d Écouter : grille posée dans la carte (1 ligne par voix, 16 cases)',
    !!gEl && gEl.querySelectorAll('.pfg-row').length === 1 &&
    gEl.querySelector('.pfg-steps').children.length === 16);
  ok('R-4d : l\'accent de T1-01 (le 1) marqué pfg-acc, rien d\'autre n\'est allumé',
    gEl.querySelectorAll('.pfg-cell.pfg-acc').length === 1 &&
    gEl.querySelector('.pfg-steps').children[0].classList.contains('pfg-acc') &&
    gEl.querySelectorAll('.pfg-cell.pfg-hit').length === 0);
  // « Charger » : la grille RESTE en pratique (l'élève voit où ses frappes doivent tomber)
  clic(cT1d.querySelector('.pf-load'));
  gEl = cT1d.querySelector('.pf-grille');
  ok('R-4d Charger : la grille RESTE en mode pratique (une seule, démo retirée)',
    !!gEl && D.querySelectorAll('.pf-grille').length === 1 && g('demoActive') === false);
  // clear : la grille part avec la démo
  g('demoClear()');
  ok('R-4d clear : la grille est retirée avec la démo',
    D.querySelectorAll('.pf-grille').length === 0);
  // un exercice sans démo ne pose rien — et déloge la grille précédente (une à la fois)
  clic(cT1d.querySelector('.pf-ecouter'));
  clic(D.querySelector('.pf-card[data-ex="EX-CJ-B2-04"]').querySelector('.pf-load'));
  ok('R-4d sans démo : « Charger » sur B2-04 ne pose rien et déloge la grille précédente',
    D.querySelectorAll('.pf-grille').length === 0);
  // la phase du curseur est née correcte (spec R-4d §3.3) : repli de fin de mesure
  ok('R-4d phase : phaseVisuelle replie le négatif en fin de mesure (−0,05 → 0,95 ; 0,42 → 0,42)',
    Math.abs(g('phaseVisuelle(-0.05)') - 0.95) < 1e-9 && g('phaseVisuelle(0.42)') === 0.42);
  g('stop()');

  /* ---------- E. compte partagé (coquille/fm-compte.js) ---------- */
  ok('fm-compte chargé : window.fmSupabase défini (client nul hors ligne, gardé)',
    typeof W.fmSupabase === 'function' && W.fmSupabase() === null);
  ok('carte compte présente (acctDim/acctCard/btnAccount)',
    !!($('acctDim') && $('acctCard') && $('btnAccount')));
  ok('la surcouche P-4 réutilise ce client (pfSb → null hors ligne, file locale)',
    g('typeof pfSb') === 'function' && g('pfSb()') === null);

  /* ---------- F. R-5 (C3) : EN/PT-BR — la dernière marche du trilingue ---------- */
  // Périmètre spec R-5 §4.2 : libellés PROPRES de la page traduits ; le contenu
  // pédagogique du corpus (objet/consigne/critère, noms de modules) RESTE en FR.
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const txt = el => norm(el ? el.textContent : '');
  ok('F1.1 sélecteur de langue présent (drapeaux FR/EN/BR) + fmTr exposé',
    D.querySelectorAll('#langSwitch .lang-btn').length === 3 && typeof W.fmTr === 'function');
  const EN = W.__I18N.en, PT = W.__I18N.pt;
  const enKeys = Object.keys(EN), ptKeys = Object.keys(PT);
  ok('F1.2 dictionnaires en/pt non vides (' + enKeys.length + ' clés) et symétriques : 0 clé orpheline',
    enKeys.length >= 60 && enKeys.every(k => k in PT) && ptKeys.every(k => k in EN));
  ok('F1.3 clés critiques couvertes : chrome, écoute/pratique, légende de grille (R-4d), compte',
    ['Métronome — Apprendre', '▶ Écouter', 'Charger', 'acquis', 'démo à venir',
     'Débutant', 'Avancé', 'Artiste', 'Chargé :', '— lance le métronome.',
     'Ta partie : cases sourdes = frappes, cases vives = accents — le curseur suit la lecture.',
     'Reçois un lien de connexion par e-mail — aucun mot de passe à retenir.',
     'Annuler', 'Envoyer le lien'].every(k => EN[k] && PT[k]));
  // audit d'extraction (patron recette-accueil H1.4/H1.5) : chaque libellé PROPRE
  // couvert — les zones CORPUS sont exclues (elles restent en FR par périmètre).
  const IDENT = new Set(['FR', 'EN', 'BR', 'Langue / Language / Idioma', 'Français', 'English',
    'Português (Brasil)', 'Tempo (BPM)', 'Tempo', 'ok', 'Grave', 'Largo', 'Larghetto', 'Adagio',
    'Moderato', 'Allegretto', 'Allegro', 'Vivace', 'Presto', 'Prestissimo']);
  const CORPUS_ZONES = '.pf-objet, .pf-consigne, .pf-critere, .pf-mod-objet, .pf-col-head, .pfg-voix';
  const EXCL = (t, el) => IDENT.has(t) || /^build metronomefunk-/.test(t) || /^\d+([.,]\d+)?$/.test(t) ||
    !!(el && el.closest && el.closest(CORPUS_ZONES + ', #pfStatus, #statusLine, #fmStubs, #buildStamp'));
  const misses = new Set();
  { const walker = D.createTreeWalker(D.body, 4); let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE')) continue;
      const t = norm(n.nodeValue);
      if (!t || !/[A-Za-zÀ-ÿ]{2}/.test(t) || EXCL(t, p)) continue;
      if (!EN[t]) misses.add(t);
    } }
  ok('F1.4 extraction des nœuds texte : 0 libellé propre hors dictionnaire (corpus exclu par périmètre)',
    misses.size === 0);
  if (misses.size) Array.from(misses).slice(0, 8).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 70))));
  const attrMisses = new Set();
  D.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
    ['placeholder', 'title', 'aria-label'].forEach(a => {
      if (!el.hasAttribute(a)) return;
      const t = norm(el.getAttribute(a));
      if (!t || !/[A-Za-zÀ-ÿ]{2}/.test(t) || EXCL(t, el)) return;
      if (!EN[t]) attrMisses.add(t);
    });
  });
  ok('F1.5 extraction des attributs : 0 manque', attrMisses.size === 0);
  if (attrMisses.size) Array.from(attrMisses).slice(0, 8).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 70))));
  // bascule : le clic écrit la langue partagée (le reload est du ressort du navigateur)
  clic(D.querySelector('.lang-btn[data-lang="pt"]'));
  ok('F1.6 clic BR → langue partagée écrite (localStorage fm-lang = pt)',
    W.localStorage.getItem('fm-lang') === 'pt');
  // P1-c (M1 court terme) : avis « leçons en français » — présent, MASQUÉ en FR (ce DOM
  // est chargé sans lang), clé traduite dans les deux dictionnaires.
  ok('F1.7 P1-c (M1) : avis « leçons en FR » présent et MASQUÉ en français',
    !!$('pfLangNote') && $('pfLangNote').hidden === true);
  ok('F1.8 P1-c : la clé de l\'avis est traduite EN et PT',
    !!EN['Les leçons (objectif, consigne, critère) sont pour l\'instant en français ; le reste de la page suit ta langue.'] &&
    !!PT['Les leçons (objectif, consigne, critère) sont pour l\'instant en français ; le reste de la page suit ta langue.']);

  /* ---- F2. second DOM en ?lang=pt : la page vit en portugais, le corpus reste FR ---- */
  const vc2 = new VirtualConsole();
  vc2.on('jsdomError', () => {});
  const dom2 = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true,
    url: 'http://localhost/apprendre.html?lang=pt', virtualConsole: vc2,
    beforeParse: jsdomStubs
  });
  setTimeout(() => {
    const W2 = dom2.window, D2 = W2.document;
    const txt2 = el => norm(el ? el.textContent : '');
    const clic2 = el => el.dispatchEvent(new W2.MouseEvent('click', { bubbles: true }));
    ok('F2.1 ?lang=pt : en-tête traduit (h1, kicker), bouton BR actif',
      txt2(D2.querySelector('h1')) === 'Metrônomo — Aprender' &&
      /modo escuta/.test(txt2(D2.querySelector('.kicker'))) &&
      (D2.querySelector('.lang-btn.on') || {}).getAttribute && D2.querySelector('.lang-btn.on').getAttribute('data-lang') === 'pt');
    ok('F2.2 transport traduit : ▶ Iniciar, Pronto',
      /Iniciar/.test(txt2(D2.getElementById('startBtn'))) && txt2(D2.getElementById('statusLine')) === 'Pronto');
    ok('F2.3 hint + libellés du parcours traduits : Escolha um exercício…, ▶ Ouvir, Carregar, adquirido, Iniciante',
      /^Escolha um exerc/.test(txt2(D2.querySelector('.hint'))) &&
      /Ouvir/.test(txt2(D2.querySelector('.pf-ecouter'))) &&
      txt2(D2.querySelector('.pf-load')) === 'Carregar' &&
      /adquirido/.test(txt2(D2.querySelector('.pf-acq-lbl'))) &&
      ['Iniciante', 'Intermediário', 'Avançado', 'Artista'].indexOf(txt2(D2.querySelector('.pf-niv-tab'))) >= 0);
    // témoin robuste : la carte affiche EXACTEMENT l'objet du corpus (FR), non traduit
    const carte1 = D2.querySelector('.pf-card');
    const objetCorpus = W2.eval('PF_EX[' + JSON.stringify(carte1.getAttribute('data-ex')) + '].objet');
    ok('F2.4 le contenu CORPUS reste en FRANÇAIS (périmètre §4.2) — l\'objet affiché == corpus',
      txt2(carte1.querySelector('.pf-objet')) === norm(objetCorpus));
    // écoute : statut composé (segments fixes via fmTr) + légende de grille traduits
    clic2(D2.querySelector('.pf-ecouter'));
    setTimeout(() => {
      ok('F2.5 statut écoute : segments fixes traduits, objet corpus FR au milieu',
        /^Escuta:/.test(txt2(D2.getElementById('pfStatus'))) &&
        /o modelo toca por cima do acompanhamento\.$/.test(txt2(D2.getElementById('pfStatus'))));
      ok('F2.6 légende de la grille vivante traduite (Sua parte…)',
        /^Sua parte/.test(txt2(D2.querySelector('.pfg-legende'))));
      // vote : pfVote → pfRender re-rend TOUT — l'observateur retraduit (nœuds FRAIS)
      clic2(D2.querySelector('.pf-v[data-v="facile"]'));
      setTimeout(() => {
        ok('F2.7 statut de vote traduit (verdict compris) : Voto registrado: fácil.',
          txt2(D2.getElementById('pfStatus')) === 'Voto registrado: fácil.');
        ok('F2.8 re-rendu après vote TOUJOURS traduit (MutationObserver vivant, cartes fraîches)',
          /Ouvir/.test(txt2(D2.querySelector('.pf-ecouter'))));
        // P1-c (M1) : dans ce DOM ?lang=pt, l'avis « leçons en FR » est RÉVÉLÉ et traduit
        ok('F2.9 P1-c (M1) : avis « leçons en FR » RÉVÉLÉ et traduit en PT (As lições…)',
          D2.getElementById('pfLangNote').hidden === false &&
          /^As lições/.test(txt2(D2.getElementById('pfLangNote'))));
        // R-5 salve P2 : volume sur apprendre + phrase située sous les votes
        ok('P2.1 volume + sourdine sur le transport (IDs R5-1, dans #transport)',
          !!$('volSlider') && !!$('volVal') && !!$('volMuteBtn') && !!($('volMuteBtn').closest && $('volMuteBtn').closest('#transport')));
        $('volMuteBtn').click();
        ok('P2.2 sourdine 1-clic : aria-pressed=true + pictogramme muet',
          $('volMuteBtn').getAttribute('aria-pressed') === 'true' && /🔇/.test(txt($('volMuteBtn'))));
        $('volMuteBtn').click();
        ok('P2.3 phrase située sous les votes (rendue par pfRender)',
          !!D.querySelector('.pf-vote-note') && /recalibre le niveau/.test(txt(D.querySelector('.pf-vote-note'))));
        ok('P2.4 « Difficulté » accentué',
          Array.from(D.querySelectorAll('.pf-vote span')).some(s => /Difficulté/.test(txt(s))));
        console.log(`\n--- apprendre (R-4a, +R-5 P1) : ${PASS} vertes, ${FAIL} rouges (total ${PASS + FAIL}) ---`);
        process.exit(FAIL ? 1 : 0);
      }, 150);
    }, 150);
  }, 300);
}

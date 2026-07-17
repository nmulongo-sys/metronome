/* recette-accueil.js — R-4b : index.html refondu (scénario 1, l'accueil
   « métronome immédiat »). Headless jsdom, mêmes stubs que recette-apprendre.
   Vérifie (spec R-4 §4.1/§9.8, GO du 16/07) :
     A. chargement propre + PREMIER NIVEAU FERMÉ : tempo (gros, ±, tap), battue
        (temps/cycle), subdivision, démarrer/arrêter, son du clic, thème — et
        RIEN d'autre (les surfaces retirées ou migrées n'existent pas ici) ;
     B. contrat moteur rempli (patron apprendre R-4a) : stubs stricts
        percFsPlay + gapTarget, hooks no-op, moteur opérationnel ;
     C. le métronome marche : démarrer/arrêter, tempo ±/tap, battue,
        subdivision, son du clic pilotent l'état moteur ;
     D. portes vers les scénarios : Apprendre, Pratiquer, En équipe (inactive,
        annonce R-6) ;
     E. l'ARCHET, option du premier niveau : section repliée par défaut,
        plein écran, relais ⛶ (ux 0.6.6 C5, déplacé d'index 0.13.0) ;
     F. exports élèves E3 (0.7.0 C13, déplacés de recette-atelier-exports §6) :
        vue imprimable + PNG de la séquence d'archet, refus propres ;
     G. lint L2 + chips d'insertion (0.7.0 C14, déplacés de
        recette-atelier-exports §8 et 9.4-9.5) ;
     H. i18n : dictionnaires PURGÉS des surfaces retirées, symétrie EN↔PT,
        chaînes de la page couvertes, chaînes nouvelles (portes) traduites.
   Usage : node recette-accueil.js [chemin/index.html]  (défaut ./index.html) */
'use strict';
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'index.html');
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
    w.requestAnimationFrame = () => 0;   // draw() ne boucle pas en headless
    w.cancelAnimationFrame = () => {};
    w.ResizeObserver = w.ResizeObserver || function () { return { observe(){}, unobserve(){}, disconnect(){} }; };
  }
});

const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const g = expr => W.eval(expr);
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const txt = el => norm(el ? el.textContent : '');
const fire = (id, type) => $(id).dispatchEvent(new W.Event(type, { bubbles: true }));

setTimeout(runTests, 120);

function runTests() {
  console.log('\n=== recette-accueil (R-4b) — index.html « métronome immédiat » ===\n');

  /* ---------- A. chargement + premier niveau FERMÉ (§9.8) ---------- */
  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('A1.1 chargement sans erreur jsdom (' + realErrors.length + ')', realErrors.length === 0);
  ok('A1.2 BUILD 0.22.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.22.0');
  ok('A1.3 tampon de build affiché', /metronomefunk-0\.22\.0/.test(txt($('buildStamp'))));
  ok('A2.1 la liste fermée est là : tempo (gros, ±), tap, démarrer, battue, subdivision, son du clic, thème',
    ['tempoValue', 'tempoSlider', 'minusBtn', 'plusBtn', 'tapBtn', 'startBtn',
     'beatsSel', 'subdivSel', 'pulseFreq', 'pulseFreqVal', 'clickType', 'themeBtn'].every(id => !!$(id)));
  const RETIREES = ['wizardBtn', 'wizOverlay', 'playScreen', 'playSetup', 'playSetupBtn', 'onboardBanner',
    'obGuide', 'playBassGroup', 'fingerViz', 'playLine'];
  // R-5 (C1) : volSlider/volMuteBtn SORTIS de la liste — le volume + la sourdine
  // sont réintégrés au premier niveau (amendement §9.8 acté au GO du 17/07).
  const MIGREES = ['secGroove', 'secClave', 'secPerc', 'secRepertoire', 'secTeam', 'secBass',
    'secGap', 'secSon', 'secScript', 'secBiblio', 'carteApprendre', 'familyBar', 'tocBar',
    'atelierBtn', 'atelierFs', 'percFs', 'expAudio', 'accentCheck',
    'pulseMuteCheck', 'swingSlider', 'btnResetAll', 'btnAccount', 'acctCard', 'biblioList',
    'modeSimpleBtn', 'modeExpertBtn', 'scriptArea'];
  ok('A2.2 surfaces RETIRÉES de l\'application absentes (wizard, écran de jeu, « je joue », onboarding)',
    RETIREES.every(id => !$(id)));
  ok('A2.3 surfaces MIGRÉES absentes (couches, atelier, exports, compte, bibliothèque → pratiquer/apprendre)',
    MIGREES.every(id => !$(id)));
  ok('A2.4 une seule section repliable : l\'option Archet — aucun autre tiroir',
    D.querySelectorAll('details.section').length === 1 && !!D.querySelector('details.section#secArchet'));
  ok('A2.5 la roue reste le retour visuel du cycle (canvas nommé + statut vocalisé)',
    $('wheel').getAttribute('role') === 'img' && !!norm($('wheel').getAttribute('aria-label')) &&
    $('statusLine').getAttribute('role') === 'status' && $('statusLine').getAttribute('aria-live') === 'polite');
  ok('A2.6 raccourcis clavier rappelés près du transport (C5 0.6.6)',
    /Espace/.test(txt(D.querySelector('.kbd-top'))) && /tap tempo/.test(txt(D.querySelector('.kbd-top'))));

  /* ---------- B. contrat moteur (patron apprendre R-4a) ---------- */
  const stubs = $('fmStubs');
  ok('B1.1 stubs réduits au STRICT contrat moteur : percFsPlay + gapTarget, rien d\'autre',
    !!stubs && stubs.children.length === 2 && !!D.querySelector('#fmStubs #percFsPlay') &&
    !!D.querySelector('#fmStubs #gapTarget'));
  ok('B1.2 balises : corpus → moteur, PAS de grooves (aucun répertoire), PAS de compte (aucun consommateur)',
    W.FM_GROOVES === undefined && typeof W.fmSupabase === 'undefined' &&
    Object.keys(W.FM_CORPUS || {}).length === 2);
  ok('B1.3 hooks de coquille présents : no-op pour les surfaces absentes, réels pour la page',
    ['scriptOnNewMeasure', 'percOnNewMeasure', 'percBreakEvents', 'percResetBreakState',
     'atelierRender', 'tsMuted', 'buildPercGrids', 'wakeLockUpdate'].every(f => g('typeof ' + f) === 'function') &&
    ['draw', 'drawStatic', 'bowReset'].every(f => g('typeof ' + f) === 'function'));
  ok('B1.4 globals neutres : percGrids/claveData vides, accompMuted=false, statusLineLast déclaré',
    Object.keys(g('percGrids')).length === 0 && Object.keys(g('claveData')).length === 0 &&
    g('accompMuted') === false && g('statusLineLast') === null);
  ok('B1.5 moteur opérationnel : computeCycle produit le clic (4 temps)',
    g('computeCycle(); events.filter(e => e.layer === "beat").length') === 4);
  ok('B1.6 gapTargetRefresh remplit le stub #gapTarget sans crash (contrat R-3a)',
    (() => { try { g('gapTargetRefresh()'); } catch (e) { return false; }
      return $('gapTarget').options.length > 0; })());

  /* ---------- C. le métronome marche ---------- */
  $('startBtn').click();
  ok('C1.1 démarrer : lecture lancée, bouton en « arrêter »',
    g('isPlaying') === true && /Arrêter/i.test(txt($('startBtn'))));
  $('startBtn').click();
  ok('C1.2 arrêter : lecture stoppée, statut « Arrêté » (écrit par le moteur)',
    g('isPlaying') === false && /Arrêté/.test(txt($('statusLine'))));
  $('plusBtn').click(); $('plusBtn').click(); $('minusBtn').click();
  ok('C1.3 tempo ± : 92 → 93, affiché en grand et dans le curseur',
    g('S.tempo') === 93 && txt($('tempoValue')) === '93' && $('tempoSlider').value === '93');
  $('beatsSel').value = '3'; fire('beatsSel', 'change');
  ok('C1.4 battue : 3 temps / cycle → S.beats, cycle recomposé à 3 clics',
    g('S.beats') === 3 && g('computeCycle(); events.filter(e => e.layer === "beat").length') === 3);
  $('subdivSel').value = '3'; fire('subdivSel', 'change');
  ok('C1.5 subdivision ternaire : triolets → S.subdiv=3, 2 sous-temps par temps',
    g('S.subdiv') === 3 && g('computeCycle(); events.filter(e => e.layer === "sub").length') === 6);
  $('subdivSel').value = '1'; fire('subdivSel', 'change');
  $('beatsSel').value = '4'; fire('beatsSel', 'change');
  $('pulseFreq').value = '1500'; fire('pulseFreq', 'input');
  ok('C1.6 son du clic : fréquence → S.sound.pulseFreq, valeur affichée',
    g('S.sound.pulseFreq') === 1500 && /1500 Hz/.test(txt($('pulseFreqVal'))));
  $('clickType').value = 'sec'; fire('clickType', 'change');
  ok('C1.7 son du clic : caractère sec → S.sound.type', g('S.sound.type') === 'sec');
  $('clickType').value = 'ton'; fire('clickType', 'change');
  ok('C1.8 thème : bascule sombre → attribut html + libellé du bouton',
    (() => { $('themeBtn').click();
      const okTheme = D.documentElement.getAttribute('data-fm-theme') === 'sombre' && /clair/.test(txt($('themeBtn')));
      $('themeBtn').click(); return okTheme; })());

  /* ---------- C2. R-5 (C1) : volume + sourdine au premier niveau (§9.8 amendée) ---------- */
  ok('C2.1 volume + sourdine dans la carte transport (patron pratiquer, IDs identiques), défaut 80 %',
    !!$('volSlider') && !!$('volVal') && !!$('volMuteBtn') &&
    $('volSlider').value === '80' && txt($('volVal')) === '· 80 %' &&
    !!$('volSlider').closest('.mini-grid'));
  $('volMuteBtn').click();
  ok('C2.2 sourdine 1-clic : volMuted, gain maître à 0, aria-pressed, 🔇 + « muet »',
    g('volMuted') === true && g('masterGain.gain.value') === 0 &&
    $('volMuteBtn').getAttribute('aria-pressed') === 'true' &&
    txt($('volMuteBtn')) === '🔇' && /muet/.test(txt($('volVal'))));
  $('volSlider').value = '60'; fire('volSlider', 'input');
  ok('C2.3 bouger le curseur LÈVE la sourdine : S.volume=0.6, gain suit, affichage · 60 %',
    g('volMuted') === false && Math.abs(g('S.volume') - 0.6) < 1e-9 &&
    Math.abs(g('masterGain.gain.value') - 0.6) < 1e-6 && txt($('volVal')) === '· 60 %');
  $('volSlider').value = '80'; fire('volSlider', 'input');
  ok('C2.4 pas de mute accompagnement sur l\'accueil (sans objet au premier niveau)',
    !$('accompMuteBtn') && !$('accompMuteBtn2'));

  /* ---------- D. les portes ---------- */
  ok('D1.1 trois portes sous le métronome : Apprendre, Pratiquer, En équipe',
    D.querySelectorAll('#portes .porte').length === 3);
  ok('D1.2 Apprendre → apprendre.html', $('porteApprendre').getAttribute('href') === 'apprendre.html');
  ok('D1.3 Pratiquer → pratiquer.html', $('portePratiquer').getAttribute('href') === 'pratiquer.html');
  // R-6 : la porte « En équipe » devient ACTIVE (equipe.html existe) — un vrai
  // <a href>, avec sous-titre et note située (patron des deux autres portes).
  ok('D1.4 En équipe → equipe.html (porte ACTIVE, R-6)',
    $('porteEquipe').getAttribute('href') === 'equipe.html' && $('porteEquipe').tagName === 'A' &&
    !$('porteEquipe').classList.contains('inactive'));
  ok('D1.5 R-6 : sous-titre « chacun sa ligne » + note située sous la porte',
    /chacun sa ligne/.test(txt($('porteEquipe'))) &&
    !!$('porteEquipe').querySelector('.porte-note'));

  /* ---------- E. l'archet, option du premier niveau ---------- */
  ok('E1.1 section Archet repliée par défaut (le bouton discret, §4.1)',
    !!$('secArchet') && $('secArchet').open === false);
  ok('E1.2 la panoplie archet est complète : instrument, coup, exercice, séquence, jauge',
    ['bowInstr', 'bowTech', 'bowPreset', 'bowSeqInput', 'bowCv', 'bowStatus'].every(id => !!$(id)));
  ok('E1.3 plein écran archet présent (bowFs + relais ⛶ du canvas — C5 0.6.6, déplacé)',
    !!$('bowFs') && !!$('bowFsBtn') && !!$('bowFsBtn2') && !!$('bowFsBtn2').closest('.cv-wrap'));
  ok('E1.4 presets d\'exercice appliqués : « Liaisons » → séquence + technique legato',
    (() => { $('bowPreset').value = 'liaison4'; fire('bowPreset', 'change');
      return $('bowSeqInput').value === 'T80x2n4, P80x2n4' && g('bowTech') === 'legato'; })());
  ok('E1.5 retour au préset défaut : compile propre',
    (() => { $('bowPreset').value = 'debutant'; fire('bowPreset', 'change');
      return $('bowSeqInput').value === 'T92x1, P92x1' && /✔|Choisis|^$/.test(txt($('bowStatus'))); })());

  /* ---------- F. exports élèves E3 (0.7.0 C13 — déplacés de recette-atelier-exports §6) ---------- */
  const A = W.fmMetroArchet();
  ok('F1.1 boutons 🖨 / ↓ PNG présents dans la section archet',
    !!$('bowPrintBtn') && !!$('bowPngBtn'));
  const bh = A.bowPrintableHTML();
  ok('F1.2 vue imprimable : séquence par défaut décrite jeton par jeton',
    bh.indexOf('T92x1') !== -1 && bh.indexOf('tiré') !== -1 && bh.indexOf('poussé') !== -1);
  ok('F1.3 vue imprimable : légende de la jauge (talon/pointe)', bh.indexOf('talon à gauche') !== -1);
  const bc = A.bowSeqCanvas();
  ok('F1.4 PNG : canvas 1600 px généré', !!bc && bc.width === 1600 && bc.height > 150);
  $('bowPngBtn').click();
  ok('F1.5 clic ↓ PNG → confirmation', txt($('bowStatus')).indexOf('Séquence exportée en PNG') !== -1);
  {
    const bi = $('bowSeqInput');
    const keep = bi.value;
    bi.value = 'ZZZ';
    ok('F1.6 séquence fautive → vue imprimable refusée (chaîne vide)', A.bowPrintableHTML() === '');
    $('bowPrintBtn').click();
    ok('F1.7 clic 🖨 sur séquence fautive → message ✖, pas de crash',
      txt($('bowStatus')).indexOf('✖') === 0);
    bi.value = keep;
  }

  /* ---------- G. lint L2 + chips (0.7.0 C14 — déplacés de recette-atelier-exports §8, 9.4-9.5) ---------- */
  (async () => {
    const rep = A.parseBowSeq('T50x1, ZZZ, P20x0.5, WWW');
    ok('G1.1 parseur : tous les jetons fautifs collectés (2), les valides parsés (2)',
      rep.errors.length === 2 && rep.errors[0] === 'ZZZ' && rep.seq.length === 2);
    const bi = $('bowSeqInput');
    const input = el => el.dispatchEvent(new W.Event('input', { bubbles: true }));
    bi.value = 'T50x1, P50x1';
    input(bi);
    await new Promise(r => setTimeout(r, 400));
    ok('G1.2 séquence valide → ✔ pas et temps comptés',
      txt($('bowLint')).indexOf('✔ 2 pas · 2 temps') === 0);
    bi.value = 'T50x1, gloub';
    input(bi);
    await new Promise(r => setTimeout(r, 400));
    const bl = txt($('bowLint'));
    ok('G1.3 jeton fautif → ✖ cité + rappel de syntaxe',
      bl.indexOf('✖ « gloub »') === 0 && bl.indexOf('attendu :') !== -1 && bl.indexOf('T50x1') !== -1);
    bi.value = 'T92x1';
    bi.setSelectionRange(bi.value.length, bi.value.length);
    D.querySelector('.bow-chip[data-ins="Rx0.5"]').click();
    await new Promise(r => setTimeout(r, 400));
    ok('G1.4 chip archet « + reprise » insère le jeton avec séparateur', bi.value === 'T92x1, Rx0.5');
    ok('G1.5 la séquence insérée reste valide au lint', txt($('bowLint')).indexOf('✔') === 0);
    bi.value = 'T92x1, P92x1';
    input(bi);

    /* ---------- H. i18n : dictionnaires purgés, symétrie, couverture ---------- */
    const EN = W.__I18N.en, PT = W.__I18N.pt;
    const enKeys = Object.keys(EN), ptKeys = Object.keys(PT);
    ok('H1.1 symétrie stricte EN ↔ PT : 0 clé orpheline',
      enKeys.every(k => k in PT) && ptKeys.every(k => k in EN));
    const RETIREES_I18N = ['✦ Guide-moi', 'Bibliothèque partagée', 'Publier la routine',
      '⛶ Atelier', 'Team Spirit', 'Répertoire de grooves', '⟲ Tout réinitialiser',
      'Se connecter', '▶ Jouer', 'Micro-timing & groove'];
    ok('H1.2 dictionnaires PURGÉS : les chaînes des surfaces retirées/migrées sont sorties (§4.2)',
      RETIREES_I18N.every(k => !(k in EN) && !(k in PT)));
    ok('H1.3 chaînes NOUVELLES des portes traduites EN et PT (porte En équipe ACTIVE, R-6)',
      ['Apprendre', 'Pratiquer', 'En équipe', 'le parcours cajón · djembé — mode écoute, mode pratique',
       'la pratique libre — ce que je joue, ce qui m\'accompagne, le clic',
       'jouer ensemble — chacun sa ligne, le chef donne le départ',
       'La salle de concert : chacun sa ligne, une personne lance tout le monde.'].every(k => EN[k] && PT[k]));
    ok('H1.3bis R-6 : clés volume/sourdine traduites, ancienne annonce « bientôt » PURGÉE des deux dicts',
      ['Volume', 'muet', 'Sourdine générale (coupe tout le son en un clic)'].every(k => EN[k] && PT[k]) &&
      !('bientôt — en attendant, la répartition des voix vit dans' in EN) &&
      !('bientôt — en attendant, la répartition des voix vit dans' in PT) &&
      !('Pratiquer › Team Spirit' in EN) && !('Pratiquer › Team Spirit' in PT));
    // audit d'extraction (patron 0.6.9 I4) : chaque chaîne visible de la page couverte
    const IDENT = new Set(['FR', 'EN', 'BR', 'Langue / Language / Idioma', 'Français', 'English',
      'Português (Brasil)', 'Tempo (BPM)', 'Tempo', 'Grave', 'Largo', 'Larghetto', 'Adagio',
      'Moderato', 'Allegretto', 'Allegro', 'Vivace', 'Presto', 'Prestissimo']);
    // #fmStubs exclu : contrat moteur invisible (hidden/aria-hidden), rempli par
    // gapTargetRefresh — jamais présenté à l'utilisateur.
    const EXCL = (t, el) => IDENT.has(t) || /^build metronomefunk-/.test(t) || /^\d+ (Hz|ms|%|BPM)?$/.test(t) ||
      !!(el && el.closest && el.closest('.script-hl, #bowLint, #bowStatus, #statusLine, #fmStubs'));
    const misses = new Set();
    const walker = D.createTreeWalker(D.body, 4);
    let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE')) continue;
      const t = norm(n.nodeValue);
      if (!t || !/[A-Za-zÀ-ÿ]{2}/.test(t) || EXCL(t, p)) continue;
      if (!EN[t]) misses.add(t);
    }
    ok('H1.4 extraction des nœuds texte : 0 chaîne FR hors dictionnaire EN', misses.size === 0);
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
    ok('H1.5 extraction des attributs : 0 manque', attrMisses.size === 0);
    if (attrMisses.size) Array.from(attrMisses).slice(0, 8).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 70))));
    ok('H1.6 sélecteur de langue présent (drapeaux FR/EN/BR) + fmTr exposé',
      D.querySelectorAll('#langSwitch .lang-btn').length === 3 && typeof W.fmTr === 'function');

    /* ---------- P2 (R-5 salve P2) : saisie BPM · continuité tempo · infobulles · annonces ---------- */
    $('tempoSlider').value = '133'; fire('tempoSlider', 'input');
    ok('P2.1 continuité : le tempo se persiste (fm-tempo, clé silencieuse ≠ fm-metro-)',
      W.localStorage.getItem('fm-tempo') === '133' && !W.localStorage.getItem('fm-metro-tempo') && txt($('tempoValue')) === '133');
    ok('P2.2 saisie BPM : #tempoValue éditable (contenteditable + role textbox)',
      $('tempoValue').getAttribute('contenteditable') === 'true' && $('tempoValue').getAttribute('role') === 'textbox');
    $('tempoValue').textContent = '400'; fire('tempoValue', 'blur');
    const p2ClampHaut = txt($('tempoValue')) === '260';
    $('tempoValue').textContent = '5'; fire('tempoValue', 'blur');
    ok('P2.3 saisie clavier clampée à [30,260] (blur)', p2ClampHaut && txt($('tempoValue')) === '30');
    const p2Freq = D.querySelector('label[for="pulseFreq"] .term'), p2Carac = D.querySelector('label[for="clickType"] .term');
    ok('P2.4 infobulles Fréquence + Caractère (titres FR)',
      !!p2Freq && /Hauteur du clic/.test(p2Freq.getAttribute('title') || '') &&
      !!p2Carac && /Timbre du clic/.test(p2Carac.getAttribute('title') || ''));
    ok('P2.5 annonces situées : 3 notes sous les portes (parcours / compte+répartition / salle de concert)',
      D.querySelectorAll('.porte-note').length === 3 &&
      /bibliothèque partagée et la répartition d'équipe/.test(txt(D.querySelector('#portePratiquer .porte-note'))) &&
      /salle de concert/i.test(txt(D.querySelector('#porteEquipe .porte-note'))));

    console.log('\n--- accueil (R-4b) : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
    process.exit(FAIL ? 1 : 0);
  })();
}

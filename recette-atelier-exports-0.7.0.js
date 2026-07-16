/* recette-atelier-exports-0.7.0.js — salve UX 0.7.0 : atelier & exports (C11–C14 du panel v0.6.5).
   Headless jsdom : mêmes stubs que recette-a11y-i18n-0.6.9 (Web Audio / canvas / Supabase mocké)
   + stub navigator.wakeLock (compteurs) et HTMLCanvasElement.toDataURL.
   Vérifie : W1 mode atelier (overlay, gros boutons câblés, bornes tempo, Échap, a11y),
   W2 wake lock (acquisition au play/à l'atelier, libération, silence si API absente, témoin),
   P1 HUD ?perfhud=1 (aucun effet sans flag), P2 statusLine mémoïsé + classes cur pendant le
   jeu, P3 AHEAD ≥ 0.2, E1 vue imprimable Team Spirit (méta, grilles, doigtés, légende),
   E2 PNG grille (canvas), E3 impression/PNG archet, JSON inchangé, L1/L2 lint multi-erreurs
   en direct (FR et EN), L3 chips d'insertion, L4 coloration (fidélité au texte, erreurs
   soulignées), i18n des nouvelles chaînes EN+PT + symétrie. Comptages en « ≥ » (motif acté).
   Usage : node recette-atelier-exports-0.7.0.js [chemin/index.html]  (défaut ./index.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'index.html');
const html = require('./recette-harnais').chargeHtml(FILE);   // R-2 : inline les corpus/*.js

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

function makeSbClient() {
  const thenableChain = () => {
    const chain = { select: () => chain, eq: () => chain, order: () => chain, insert: () => chain,
      maybeSingle: async () => ({ data: null, error: null }), then: (res) => res({ data: [], error: null }) };
    return chain;
  };
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInAnonymously: async () => ({ data: { user: { id: 'uid-anon' } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({}), signInWithOtp: async () => ({ error: null })
    },
    from: () => ({
      select: () => thenableChain(),
      insert: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async (row) => ({ data: [row], error: null })
    }),
    rpc: async () => ({ data: [], error: null })
  };
}

function makeDom(seedStorage, url, opts) {
  opts = opts || {};
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => errors.push(String(e && e.message || e)));
  const wl = { req: 0, rel: 0, sentinels: [] };
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: url || 'http://localhost/', virtualConsole: vc,
    beforeParse(w) {
      if (seedStorage) Object.keys(seedStorage).forEach(k => { try { w.localStorage.setItem(k, seedStorage[k]); } catch (e) {} });
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
      if (proto) {
        proto.getContext = () => canvasCtx();
        proto.toDataURL = () => 'data:image/png;base64,stub';
      }
      if (w.Element) w.Element.prototype.scrollIntoView = function () {};
      w.scrollTo = () => {};
      w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
      w.requestAnimationFrame = w.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
      w.cancelAnimationFrame = w.cancelAnimationFrame || ((id) => clearTimeout(id));
      w.ResizeObserver = w.ResizeObserver || function () { return { observe(){}, unobserve(){}, disconnect(){} }; };
      w.supabase = { createClient: () => makeSbClient() };
      // jsdom n'implémente pas les URL de blobs : nécessaires au chemin JSON historique
      if (w.URL) { w.URL.createObjectURL = () => 'blob:stub'; w.URL.revokeObjectURL = () => {}; }
      // W2 : stub wake lock avec compteurs — sauf si le scénario teste l'API absente
      if (!opts.noWakeLock) {
        try {
          Object.defineProperty(w.navigator, 'wakeLock', {
            configurable: true,
            value: { request: async () => {
              wl.req++;
              const s = { released: false, release: async function () { wl.rel++; s.released = true; }, addEventListener() {} };
              wl.sentinels.push(s);
              return s;
            } }
          });
        } catch (e) {}
      }
    }
  });
  return { dom, errors, wl };
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const tick = (ms) => new Promise(r => setTimeout(r, ms || 30));

const main = makeDom(null);
const W = main.dom.window, D = W.document;
const txt = (el) => norm(el ? el.textContent : '');
const styleText = () => Array.from(D.querySelectorAll('style')).map(s => s.textContent).join('\n');
const input = (el) => el.dispatchEvent(new W.Event('input', { bubbles: true }));

setTimeout(runTests, 80);

async function runTests() {
  console.log('\n=== recette-atelier-exports-0.7.0 · salve UX (C11–C14) ===\n');

  // ---- 0. amorçage ----
  const realErrors = main.errors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe / navigation', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  const R = W.fmMetroReg();
  const bm = txt(D.getElementById('buildStamp')).match(/metronomefunk-(\d+)\.(\d+)\.(\d+)/);
  const bnum = bm ? (+bm[1]) * 1e6 + (+bm[2]) * 1e3 + (+bm[3]) : 0;
  ok('0.2 tampon de build ≥ 0.7.0', bnum >= 7000);
  ok('0.3 registre de test v070 exposé (hooks lecture seule)', !!(R && R.v070));

  // ---- 1. W1 — mode atelier ----
  console.log('\n[1] W1 — mode atelier');
  {
    const btn = D.getElementById('atelierBtn');
    ok('1.1 bouton « ⛶ Atelier » présent près du transport, avec title', !!btn && !!norm(btn.getAttribute('title')));
    btn.click();
    await tick(30);
    ok('1.2 clic → overlay atelier ouvert', D.getElementById('atelierFs').classList.contains('open') && R.v070.atelierOpen());
    ok('1.3 BPM affiché en grand = tempo courant', txt(D.getElementById('atelierBpm')) === '92');
    ok('1.4 nom de tempo affiché', txt(D.getElementById('atelierName')).length >= 2);
    D.getElementById('atelierPlus').click();
    ok('1.5 gros bouton + : tempo 92 → 93', txt(D.getElementById('atelierBpm')) === '93');
    D.getElementById('atelierMinus').click();
    ok('1.6 gros bouton − : retour à 92', txt(D.getElementById('atelierBpm')) === '92');
    // bornes : le slider est poussé à sa limite puis on appuie encore
    const sl = D.getElementById('tempoSlider');
    sl.value = 260; input(sl);
    D.getElementById('atelierPlus').click();
    ok('1.7 borne haute respectée (260 max)', txt(D.getElementById('atelierBpm')) === '260');
    sl.value = 30; input(sl);
    D.getElementById('atelierMinus').click();
    ok('1.8 borne basse respectée (30 min)', txt(D.getElementById('atelierBpm')) === '30');
    sl.value = 92; input(sl);
    // lecture depuis l'atelier
    D.getElementById('atelierPlay').click();
    await tick(60);
    ok('1.9 ▶ atelier lance la lecture (transport principal suit)',
       txt(D.getElementById('startBtn')).indexOf('Arrêter') !== -1);
    ok('1.10 bouton atelier passe en ■ pendant la lecture', txt(D.getElementById('atelierPlay')) === '■');
    ok('1.11 compteur de mesure affiché pendant la lecture',
       txt(D.getElementById('atelierMeasure')).indexOf('mesure') !== -1);
    D.getElementById('atelierPlay').click();
    await tick(30);
    ok('1.12 ■ atelier arrête la lecture', txt(D.getElementById('startBtn')).indexOf('Démarrer') !== -1);
    D.getElementById('atelierClose').click();
    ok('1.13 ✕ ferme l\'overlay', !D.getElementById('atelierFs').classList.contains('open'));
    btn.click();
    D.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ok('1.14 Échap ferme l\'overlay', !D.getElementById('atelierFs').classList.contains('open'));
    const named = ['atelierMinus', 'atelierPlay', 'atelierPlus'].every(id =>
      !!norm(D.getElementById(id).getAttribute('aria-label')));
    ok('1.15 gros boutons nommés (aria-label) — acquis A3 respecté', named);
    ok('1.16 overlay = dialog nommé + gros boutons ≥ 64 px (CSS)',
       D.getElementById('atelierFs').getAttribute('role') === 'dialog' &&
       !!norm(D.getElementById('atelierFs').getAttribute('aria-label')) &&
       /\.atelier-controls button\s*{[^}]*min-height:\s*(6[4-9]|[7-9]\d|\d{3,})px/.test(styleText()));
  }

  // ---- 2. W2 — wake lock ----
  console.log('\n[2] W2 — wake lock (maintien d\'écran)');
  {
    const before = main.wl.req;
    D.getElementById('startBtn').click();
    await tick(60);
    ok('2.1 lecture → verrou demandé', main.wl.req >= before + 1 && R.v070.wakeLockWanted());
    ok('2.2 témoin ☀ visible une fois le verrou acquis', D.getElementById('atelierWl').hidden === false);
    const rel0 = main.wl.rel;
    D.getElementById('startBtn').click();
    await tick(60);
    ok('2.3 arrêt → verrou libéré', main.wl.rel >= rel0 + 1 && !R.v070.wakeLockWanted());
    ok('2.4 témoin ☀ masqué après libération', D.getElementById('atelierWl').hidden === true);
    const req1 = main.wl.req;
    D.getElementById('atelierBtn').click();
    await tick(60);
    ok('2.5 atelier ouvert à l\'arrêt → verrou demandé aussi (décision Jean)', main.wl.req >= req1 + 1);
    D.getElementById('atelierClose').click();
    await tick(60);
    ok('2.6 fermeture atelier (à l\'arrêt) → verrou libéré', !R.v070.wakeLockWanted());
    // API absente : amélioration progressive pure, aucun crash
    const bare = makeDom(null, null, { noWakeLock: true });
    await tick(80);
    const Db = bare.dom.window.document;
    Db.getElementById('startBtn').click();
    await tick(40);
    Db.getElementById('startBtn').click();
    await tick(40);
    const bareErrors = bare.errors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
    ok('2.7 API absente : play/stop sans erreur (silence total)', bareErrors.length === 0);
    ok('2.8 API absente : témoin ☀ jamais montré', Db.getElementById('atelierWl').hidden === true);
    bare.dom.window.close();
  }

  // ---- 3. P1 — HUD de mesure sous flag ----
  console.log('\n[3] P1 — HUD ?perfhud=1');
  {
    ok('3.1 sans flag : aucun HUD dans le DOM', !D.getElementById('perfHud') && R.v070.perfHud === false);
    const hud = makeDom(null, 'http://localhost/?perfhud=1');
    await tick(80);
    const Dh = hud.dom.window.document;
    const el = Dh.getElementById('perfHud');
    ok('3.2 avec ?perfhud=1 : HUD présent', !!el && hud.dom.window.fmMetroReg().v070.perfHud === true);
    ok('3.3 HUD hors flux lecteur d\'écran (aria-hidden) et hors interaction (pointer-events none)',
       !!el && el.getAttribute('aria-hidden') === 'true' && /pointer-events:\s*none/.test(el.getAttribute('style') || ''));
    hud.dom.window.close();
  }

  // ---- 4. P2/P3 — allègements du rendu & pré-planification ----
  console.log('\n[4] P2/P3 — draw() allégé, AHEAD élargi');
  {
    ok('4.1 AHEAD ≥ 0.20 s (P3 : fenêtre de pré-planification élargie)', R.v070.ahead >= 0.20);
    const w0 = R.v070.statusLineWrites();
    R.v070.statusLineSet('recette-p2-valeur');
    const w1 = R.v070.statusLineWrites();
    R.v070.statusLineSet('recette-p2-valeur');
    R.v070.statusLineSet('recette-p2-valeur');
    const w2 = R.v070.statusLineWrites();
    ok('4.2 statusLine réécrit quand le texte change', w1 === w0 + 1);
    ok('4.3 statusLine PAS réécrit quand le texte est identique (mémo)', w2 === w1);
    R.v070.statusLineSet('recette-p2-autre');
    ok('4.4 nouvelle valeur → nouvelle écriture', R.v070.statusLineWrites() === w2 + 1);
    // pendant la lecture, les classes « cur » sont bien posées via le cache
    D.getElementById('startBtn').click();
    await tick(80);
    ok('4.5 pendant la lecture : pas courant marqué (cache de collections actif)',
       !!D.querySelector('#claveSteps .step.cur'));
    D.getElementById('startBtn').click();
    await tick(30);
    ok('4.6 à l\'arrêt : marquage nettoyé', !D.querySelector('#claveSteps .step.cur'));
  }

  // ---- 5. E1/E2 — exports élèves Team Spirit ----
  console.log('\n[5] E1/E2 — vue imprimable & PNG (Team Spirit)');
  {
    ok('5.1 boutons 🖨 Imprimer / PDF et ↓ PNG présents (globaux)',
       !!D.getElementById('tsPrintBtn') && !!D.getElementById('tsPngBtn'));
    // sans groove chargé : messages de garde, pas d'iframe
    D.getElementById('tsPrintBtn').click();
    ok('5.2 sans groove : garde « Charge d\'abord un groove. »',
       txt(D.getElementById('tsStatus')).indexOf('Charge d\'abord un groove') !== -1);
    // chargement du premier groove du répertoire
    const sel = D.getElementById('tsGroove');
    ok('5.3 répertoire peuplé', sel.options.length >= 1);
    sel.value = sel.options[0].value;
    D.getElementById('tsLoad').click();
    await tick(30);
    ok('5.4 groove chargé', txt(D.getElementById('tsStatus')).indexOf('chargé') !== -1);
    const html0 = R.v070.tsPrintableHTML(null);
    ok('5.5 vue imprimable : document complet avec méta du groove',
       html0.indexOf('<!DOCTYPE html>') === 0 && html0.indexOf('BPM') !== -1);
    ok('5.6 vue imprimable : au moins une grille (table) et la légende ● / ◉ / D-G',
       html0.indexOf('<table>') !== -1 && html0.indexOf('frappe') !== -1 && html0.indexOf('accent') !== -1);
    ok('5.7 vue imprimable : voix non assignées regroupées sous « Tous »', html0.indexOf('Tous') !== -1);
    // avec un participant assigné : une grille à son nom
    D.getElementById('tsAddPart').click();
    await tick(20);
    D.getElementById('tsAuto').click();
    await tick(20);
    const html1 = R.v070.tsPrintableHTML(null);
    ok('5.8 une section par participant (assignation auto)', html1.indexOf('Participant 1') !== -1);
    const pid = (D.querySelector('#tsParticipants .ts-part') || { dataset: {} }).dataset.p;
    const htmlP = R.v070.tsPrintableHTML(pid);
    ok('5.9 portée « ma ligne » : la vue du participant ne contient que lui',
       !!pid && htmlP.indexOf('Participant 1') !== -1 && htmlP.indexOf('<h2>Tous</h2>') === -1);
    const cnv = R.v070.tsGridCanvas(null);
    ok('5.10 PNG : canvas hors écran généré en 1600 px de large', !!cnv && cnv.width === 1600 && cnv.height > 200);
    D.getElementById('tsPngBtn').click();
    ok('5.11 clic ↓ PNG → confirmation « Grille exportée en PNG. »',
       txt(D.getElementById('tsStatus')).indexOf('Grille exportée en PNG') !== -1);
    D.getElementById('tsPrintBtn').click();
    ok('5.12 clic 🖨 → iframe d\'impression créé + confirmation',
       !!D.querySelector('iframe[aria-hidden]') && txt(D.getElementById('tsStatus')).indexOf('Vue imprimable ouverte') !== -1);
    D.getElementById('tsExportAll').click();
    ok('5.13 JSON inchangé (réimportation) : « Groove complet exporté. »',
       txt(D.getElementById('tsStatus')).indexOf('Groove complet exporté') !== -1);
    const card = D.querySelector('#tsParticipants .ts-part');
    ok('5.14 boutons 🖨 et ↓ PNG par participant sur sa carte',
       !!card && !!card.querySelector('.ts-print') && !!card.querySelector('.ts-png'));
  }

  // ---- 6. E3 — impression / PNG de la séquence d'archet ----
  console.log('\n[6] E3 — séquence d\'archet imprimable');
  {
    ok('6.1 boutons 🖨 / ↓ PNG présents dans la section archet',
       !!D.getElementById('bowPrintBtn') && !!D.getElementById('bowPngBtn'));
    const bh = R.v070.bowPrintableHTML();
    ok('6.2 vue imprimable : séquence par défaut décrite jeton par jeton',
       bh.indexOf('T92x1') !== -1 && bh.indexOf('tiré') !== -1 && bh.indexOf('poussé') !== -1);
    ok('6.3 vue imprimable : légende de la jauge (talon/pointe)', bh.indexOf('talon à gauche') !== -1);
    const bc = R.v070.bowSeqCanvas();
    ok('6.4 PNG : canvas 1600 px généré', !!bc && bc.width === 1600 && bc.height > 150);
    D.getElementById('bowPngBtn').click();
    ok('6.5 clic ↓ PNG → confirmation', txt(D.getElementById('bowStatus')).indexOf('Séquence exportée en PNG') !== -1);
    // séquence fautive : les exports refusent proprement
    const bi = D.getElementById('bowSeqInput');
    const keep = bi.value;
    bi.value = 'ZZZ';
    ok('6.6 séquence fautive → vue imprimable refusée (chaîne vide)', R.v070.bowPrintableHTML() === '');
    D.getElementById('bowPrintBtn').click();
    ok('6.7 clic 🖨 sur séquence fautive → message ✖, pas de crash',
       txt(D.getElementById('bowStatus')).indexOf('✖') === 0);
    bi.value = keep;
  }

  // ---- 7. L1 — lint en direct du script de routine ----
  console.log('\n[7] L1 — lint du script (multi-erreurs, en direct)');
  {
    const rep = R.v070.parseScript('80bpm 5min\nn\'importe quoi\ngap 2/16\nencore faux');
    ok('7.1 parseur : TOUTES les lignes fautives collectées (2/2, numéros exacts)',
       rep.errors && rep.errors.length === 2 && rep.errors[0].line === 2 && rep.errors[1].line === 4);
    ok('7.2 contrat historique conservé : première erreur bloquante pour ▶',
       rep.error === 'Ligne non reconnue : « n\'importe quoi »');
    ok('7.3 les segments valides restent parsés malgré l\'erreur', rep.segs.length === 2);
    const ta = D.getElementById('scriptArea');
    ta.value = '80bpm 5min\n60bpm 60s';
    input(ta);
    await tick(400);
    const lint = txt(D.getElementById('scriptLint'));
    ok('7.4 script valide → ✔ n segments', lint.indexOf('✔ 2 segment(s)') === 0);
    ok('7.5 durée totale estimée affichée (5 min + 60 s = 6:00)', lint.indexOf('6:00') !== -1);
    ta.value = '80bpm 5min\nplouf';
    input(ta);
    await tick(400);
    const lint2 = txt(D.getElementById('scriptLint'));
    ok('7.6 ligne fautive → ✖ ligne 2 citée avec la syntaxe attendue',
       lint2.indexOf('✖') === 0 && lint2.indexOf('ligne 2') !== -1 &&
       lint2.indexOf('« plouf »') !== -1 && lint2.indexOf('attendu :') !== -1 && lint2.indexOf('80bpm 5min') !== -1);
    ta.value = '';
    input(ta);
    await tick(400);
    ok('7.7 champ vide → lint muet (pas de fausse alerte)', txt(D.getElementById('scriptLint')) === '');
    ok('7.8 le lint n\'exécute rien : métronome toujours à l\'arrêt',
       txt(D.getElementById('startBtn')).indexOf('Démarrer') !== -1);
  }

  // ---- 8. L2 — lint en direct de la séquence d'archet ----
  console.log('\n[8] L2 — lint de la séquence d\'archet');
  {
    const rep = R.v070.parseBowSeq('T50x1, ZZZ, P20x0.5, WWW');
    ok('8.1 parseur : tous les jetons fautifs collectés (2), les valides parsés (2)',
       rep.errors.length === 2 && rep.errors[0] === 'ZZZ' && rep.seq.length === 2);
    const bi = D.getElementById('bowSeqInput');
    bi.value = 'T50x1, P50x1';
    input(bi);
    await tick(400);
    ok('8.2 séquence valide → ✔ pas et temps comptés',
       txt(D.getElementById('bowLint')).indexOf('✔ 2 pas · 2 temps') === 0);
    bi.value = 'T50x1, gloub';
    input(bi);
    await tick(400);
    const bl = txt(D.getElementById('bowLint'));
    ok('8.3 jeton fautif → ✖ cité + rappel de syntaxe',
       bl.indexOf('✖ « gloub »') === 0 && bl.indexOf('attendu :') !== -1 && bl.indexOf('T50x1') !== -1);
    bi.value = 'T92x1, P92x1';
    input(bi);
    await tick(400);
  }

  // ---- 9. L3 — chips d'insertion d'exemples ----
  console.log('\n[9] L3 — insertion d\'exemples');
  {
    const chips = D.querySelectorAll('.script-chip');
    ok('9.1 chips du script présentes (≥ 4) dans un groupe nommé', chips.length >= 4 &&
       !!D.querySelector('.lint-chips[aria-label]'));
    const ta = D.getElementById('scriptArea');
    ta.value = '80bpm 5min';
    ta.setSelectionRange(ta.value.length, ta.value.length);
    D.querySelector('.script-chip[data-ins="gap 2/16"]').click();
    await tick(400);
    ok('9.2 chip « + gap 2/16 » insère la ligne au curseur', ta.value.indexOf('80bpm 5min\ngap 2/16') === 0);
    ok('9.3 le lint se rafraîchit après insertion', txt(D.getElementById('scriptLint')).indexOf('✔') === 0);
    const bi = D.getElementById('bowSeqInput');
    bi.value = 'T92x1';
    bi.setSelectionRange(bi.value.length, bi.value.length);
    D.querySelector('.bow-chip[data-ins="Rx0.5"]').click();
    await tick(400);
    ok('9.4 chip archet « + reprise » insère le jeton avec séparateur', bi.value === 'T92x1, Rx0.5');
    ok('9.5 la séquence insérée reste valide au lint', txt(D.getElementById('bowLint')).indexOf('✔') === 0);
    bi.value = 'T92x1, P92x1';
    input(bi);
  }

  // ---- 10. L4 — coloration des jetons ----
  console.log('\n[10] L4 — coloration (overlay)');
  {
    const pre = D.getElementById('scriptHl'), wrap = D.getElementById('scriptHlWrap'), ta = D.getElementById('scriptArea');
    ok('10.1 overlay présent, hors flux lecteur d\'écran (aria-hidden)',
       !!pre && pre.getAttribute('aria-hidden') === 'true');
    ta.value = '# commentaire\n80bpm 5min\ngap 2/16\nswing 62\nplouf';
    input(ta);
    await tick(400);
    ok('10.2 overlay actif après saisie', wrap.classList.contains('hl-on'));
    ok('10.3 jetons typés : tempo, gap, swing, commentaire',
       !!pre.querySelector('.hl-tempo') && !!pre.querySelector('.hl-gap') &&
       !!pre.querySelector('.hl-swing') && !!pre.querySelector('.hl-comment'));
    ok('10.4 ligne fautive soulignée (.hl-err)', !!pre.querySelector('.hl-err'));
    ok('10.5 fidélité : l\'overlay reflète exactement le texte tapé',
       pre.textContent === ta.value + '\n');
    ok('10.6 règles CSS de coloration présentes (thème via variables --fm-*-text)',
       /\.hl-tempo\s*{\s*color:\s*var\(--fm-accent-text\)/.test(styleText()) &&
       /\.hl-err\s*{[^}]*wavy/.test(styleText()));
  }

  // ---- 11. i18n — nouvelles chaînes EN + PT, symétrie ----
  console.log('\n[11] i18n 0.7.0');
  {
    const EN = W.__I18N.en, PT = W.__I18N.pt;
    const sample = ['⛶ Atelier', 'Mode atelier — BPM en très grand, gros boutons, écran maintenu allumé',
      '🖨 Imprimer / PDF', 'Écran maintenu allumé', 'Jauge : talon à gauche, pointe à droite.',
      'segment(s)', 'attendu :', 'Grille exportée en PNG.', 'Corrige d\'abord la séquence.',
      'Tempo -1 (maintenir pour répéter)', 'Insérer une ligne d\'exemple'];
    ok('11.1 échantillon de nouvelles clés présent en EN ET en PT (' + sample.length + ' clés)',
       sample.every(k => EN[k] && PT[k]));
    const enKeys = Object.keys(EN), ptKeys = Object.keys(PT);
    const orphans = enKeys.filter(k => !(k in PT)).concat(ptKeys.filter(k => !(k in EN)));
    ok('11.2 symétrie stricte EN ↔ PT : 0 clé orpheline', orphans.length === 0);
    if (orphans.length) orphans.slice(0, 6).forEach(k => console.log('     ! ' + JSON.stringify(k.slice(0, 60))));
    ok('11.3 dictionnaires ≥ 550 clés par langue (0.6.9 : 507)', enKeys.length >= 550 && ptKeys.length >= 550);
    const en = makeDom({ 'fm-lang': 'en' });
    await tick(80);
    const De = en.dom.window.document;
    ok('11.4 bascule EN : bouton « ⛶ Workshop », chips traduites',
       txt(De.getElementById('atelierBtn')) === '⛶ Workshop' &&
       txt(De.querySelector('.script-chip[data-ins="80bpm 5min"]')) === '+ 5 min at 80');
    // lint composé en EN : fragments fmTr
    const tae = De.getElementById('scriptArea');
    tae.value = 'plouf';
    tae.dispatchEvent(new en.dom.window.Event('input', { bubbles: true }));
    await tick(400);
    const le = txt(De.getElementById('scriptLint'));
    ok('11.5 lint composé traduit en EN (line/expected)',
       le.indexOf('line 1') !== -1 && le.indexOf('expected:') !== -1);
    en.dom.window.close();
    const pt = makeDom({ 'fm-lang': 'pt' });
    await tick(80);
    const Dp = pt.dom.window.document;
    ok('11.6 bascule PT : « ⛶ Oficina »', txt(Dp.getElementById('atelierBtn')) === '⛶ Oficina');
    pt.dom.window.close();
  }

  console.log('\n--- atelier+exports 0.7.0 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL ? 1 : 0);
}

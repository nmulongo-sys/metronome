/* recette-ux-0.6.6.js — salve UX 0.6.6 : quick wins C2, C5, C6, C7, C8, C15 du panel v0.6.5.
   Headless jsdom : mêmes stubs que recette-P2/P4 (Web Audio / canvas / Supabase mocké).
   Vérifie : terminologie & infobulles (C2), découvrabilité (C5), sommaire sticky (C6),
   connexion reformulée avec renvoi du lien (C7), réinitialisation sélective + toast (C8),
   petits irritants (C15), et la parité i18n EN/PT de toutes les chaînes nouvelles ou déplacées.
   Usage : node recette-ux-0.6.6.js [chemin/index.html]  (défaut ./index.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'index.html');
const html = require('./recette-harnais').chargeHtml(FILE);   // R-2 : inline les corpus/*.js

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };
const eq = (name, a, b) => ok(name + '  (' + JSON.stringify(a) + ' === ' + JSON.stringify(b) + ')', a === b);

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
    if (w.Element) w.Element.prototype.scrollIntoView = function () {};
    w.scrollTo = () => {};
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
    w.requestAnimationFrame = w.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 0));
    w.cancelAnimationFrame = w.cancelAnimationFrame || ((id) => clearTimeout(id));
    w.ResizeObserver = w.ResizeObserver || function () { return { observe(){}, unobserve(){}, disconnect(){} }; };
    w.supabase = { createClient: () => makeSbClient() };
  }
});

const W = dom.window, D = W.document;
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const txt = (el) => norm(el ? el.textContent : '');
const styleText = () => Array.from(D.querySelectorAll('style')).map(s => s.textContent).join('\n');

setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-ux-0.6.6 · salve UX (C2 C5 C6 C7 C8 C15) ===\n');

  // ---- 0. amorçage ----
  const realErrors = jsdomErrors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe / navigation', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  // 0.6.7 : le tampon avance à chaque salve — on vérifie « 0.6.6 ou plus récent »,
  // pas l'égalité stricte (les acquis 0.6.6 restent couverts par les tests 1–7).
  const bm = txt(D.getElementById('buildStamp')).match(/metronomefunk-(\d+)\.(\d+)\.(\d+)/);
  const bnum = bm ? (+bm[1]) * 1e6 + (+bm[2]) * 1e3 + (+bm[3]) : 0;
  ok('0.2 tampon de build ≥ 0.6.6', bnum >= 6006);

  // ---- 1. C2 — terminologie ----
  const beatsLabel = D.querySelector('label[for="beatsSel"] .term');
  ok('1.1 « Temps / cycle » porte une infobulle (title avec 3/4)', !!beatsLabel && /3\/4/.test(beatsLabel.getAttribute('title') || ''));
  const termSub = D.querySelector('.term-sub');
  ok('1.2 sous-titre visible « mesure : 2/4 · 3/4 (valse) · 4/4… »', !!termSub && /2\/4/.test(txt(termSub)) && /valse/.test(txt(termSub)));
  eq('1.3 sous-titre de « Horloge interne » francisé', txt(D.querySelector('#secGap .sec-sub')), 'coupures de clic (gap clicks)');
  ok('1.4 libellé Team Spirit : « Accompagnement (backing track)… »', /^Accompagnement \(backing track\)/.test(txt(Array.from(D.querySelectorAll('label')).find(l => l.querySelector('#tsBacking')))));
  ok('1.5 libellé basse : « Silences (drop-outs) — la basse se tait »', /Silences \(drop-outs\)/.test(txt(Array.from(D.querySelectorAll('label')).find(l => l.querySelector('#bassDropOn')))));
  ok('1.6 libellé écran de jeu : « silences (drop-outs) »', /silences \(drop-outs\)/.test(txt(Array.from(D.querySelectorAll('label')).find(l => l.querySelector('#playBassDrop')))));
  const terms = Array.from(D.querySelectorAll('.term'));
  ok('1.7 au moins 5 termes à infobulle, tous avec définition non vide', terms.length >= 5 && terms.every(t => norm(t.getAttribute('title')).length > 20));
  ok('1.8 les termes à infobulle sont focusables (tap mobile)', terms.filter(t => t.getAttribute('tabindex') === '0').length >= 4);
  ok('1.9 bulle CSS au focus présente (attr(title))', /\.term:focus::before/.test(styleText()) && /attr\(title\)/.test(styleText()));

  // ---- 2. C5 — découvrabilité ----
  eq('2.1 « ✦ Assistant » renommé « ✦ Guide-moi »', txt(D.getElementById('wizardBtn')), '✦ Guide-moi');
  const kbdTop = D.querySelector('.kbd-top');
  ok('2.2 rappel des raccourcis près du transport', !!kbdTop && /Espace/.test(txt(kbdTop)) && /tap tempo/.test(txt(kbdTop)));
  const bowFs2 = D.getElementById('bowFsBtn2');
  ok('2.3 bouton ⛶ en surimpression du canvas archet', !!bowFs2 && !!bowFs2.closest('.cv-wrap') && !!bowFs2.closest('.cv-wrap').querySelector('#bowCv'));
  ok('2.4 libellé « Export audio (WAV / MP3) » + ancre #expAudio', !!D.getElementById('expAudio') && /Export audio \(WAV \/ MP3\)/.test(txt(D.getElementById('expAudio'))));

  // ---- 3. C6 — sommaire sticky ----
  const toc = D.getElementById('tocBar');
  const chips = toc ? Array.from(toc.querySelectorAll('.toc-chip')) : [];
  eq('3.1 sommaire présent avec 14 puces (12 sections + Export + Haut)', chips.length, 14);
  const targets = chips.map(c => c.getAttribute('data-toc')).filter(id => id !== '__top');
  ok('3.2 chaque puce (hors Haut) vise un élément existant', targets.every(id => !!D.getElementById(id)));
  ok('3.3 le sommaire est masqué en mode Jouer (règle CSS)', /body\.mode-simple \.toc-bar \{ display:none/.test(styleText()));
  const archetChip = chips.find(c => c.getAttribute('data-toc') === 'secArchet');
  D.getElementById('secArchet').open = false;
  archetChip.click();
  ok('3.4 clic sur une puce ouvre la section visée', D.getElementById('secArchet').open === true);
  ok('3.5 sommaire sticky (position:sticky)', /\.toc-bar \{ position:sticky/.test(styleText()));

  // ---- 4. C15 — petits irritants ----
  const whoWrap = D.getElementById('playWhoWrap');
  ok('4.1 « Je suis » masqué tant que Solo est la seule option', !!whoWrap && whoWrap.style.display === 'none' && D.getElementById('playWho').options.length === 1);
  ok('4.2 volume : valeur affichée « · 80 % »', /80\s*%/.test(txt(D.getElementById('volVal'))));
  const muteBtn = D.getElementById('volMuteBtn');
  eq('4.3 bouton sourdine présent, état initial sonore', muteBtn.getAttribute('aria-pressed'), 'false');
  muteBtn.click();
  ok('4.4 clic sourdine → muet (aria-pressed + « muet » affiché)', muteBtn.getAttribute('aria-pressed') === 'true' && /muet/.test(txt(D.getElementById('volVal'))));
  const vs = D.getElementById('volSlider');
  vs.value = '60'; vs.dispatchEvent(new W.Event('input', { bubbles: true }));
  ok('4.5 bouger le volume lève la sourdine et met à jour le %', muteBtn.getAttribute('aria-pressed') === 'false' && /60\s*%/.test(txt(D.getElementById('volVal'))));
  eq('4.6 compteur « Coupures traversées » présent à 0', txt(D.getElementById('gapCrossed')), '0');
  ok('4.7 badge d\'accord agrandi (règles CSS ×2)', /#playBassChord \{ font-size:1\.9rem/.test(styleText()) && /#bassChord \{ font-size:1\.35rem/.test(styleText()));
  ok('4.8 icônes du header : title explicite partout', ['wizardBtn', 'themeBtn', 'btnResetAll', 'btnAccount', 'playSetupBtn'].every(id => norm(D.getElementById(id).getAttribute('title')).length > 10));

  // ---- 5. C8 — filet de sécurité ----
  // 5.a toast à la première sauvegarde post-init (bascule de mode → fm-metro-mode)
  ok('5.1 init terminée (__fmReady)', W.__fmReady === true);
  D.getElementById('modeExpertBtn').click();
  const toast = D.getElementById('fmToast');
  ok('5.2 toast « ✓ Réglages enregistrés automatiquement » après le 1er réglage', !!toast && toast.classList.contains('show') && /Réglages enregistrés/.test(txt(toast)));
  // 5.b réinitialisation refusée : rien ne bouge
  W.localStorage.setItem('fm-lang', 'fr'); W.localStorage.setItem('fm-theme', 'sombre');
  W.localStorage.setItem('pf_vote_queue', '[]');
  ok('5.3 des réglages fm-metro-* existent avant le reset', !!W.localStorage.getItem('fm-metro-mode'));
  W.confirm = () => false;
  D.getElementById('btnResetAll').click();
  ok('5.4 confirmation refusée → réglages conservés', !!W.localStorage.getItem('fm-metro-mode'));
  // 5.c réinitialisation confirmée : fm-metro-* purgés, le reste conservé
  W.confirm = () => true;
  D.getElementById('btnResetAll').click();
  const metroKeysLeft = [];
  for (let i = 0; i < W.localStorage.length; i++) { const k = W.localStorage.key(i); if (k && k.indexOf('fm-metro-') === 0) metroKeysLeft.push(k); }
  eq('5.5 confirmation acceptée → plus aucune clé fm-metro-*', metroKeysLeft.length, 0);
  ok('5.6 langue, thème et file de votes conservés', W.localStorage.getItem('fm-lang') === 'fr' && W.localStorage.getItem('fm-theme') === 'sombre' && W.localStorage.getItem('pf_vote_queue') === '[]');
  ok('5.7 title du bouton précise ce qui est conservé', /conservés/.test(D.getElementById('btnResetAll').getAttribute('title')));

  // ---- 6. C7 — connexion ----
  eq('6.1 title du bouton compte reformulé', D.getElementById('btnAccount').getAttribute('title'), 'Recevoir un lien de connexion par e-mail');
  D.getElementById('btnAccount').click();
  await new Promise(r => setTimeout(r, 30));
  const acctEmail = D.getElementById('acctEmail');
  ok('6.2 modal de connexion ouvert (champ e-mail)', !!acctEmail);
  const modalTxt = txt(acctEmail && acctEmail.parentElement);
  ok('6.3 « lien de connexion par e-mail » (plus de « lien magique »)', /lien de connexion par e-mail/.test(modalTxt) && !/lien magique/.test(modalTxt));
  ok('6.4 mention « fonctionne aussi sans compte »', /fonctionne aussi sans compte/.test(modalTxt));
  acctEmail.value = 'eleve@example.org';
  D.getElementById('acctSend').click();
  await new Promise(r => setTimeout(r, 30));
  const waitTxt = txt(D.getElementById('acctOk') && D.getElementById('acctOk').closest('div').parentElement);
  ok('6.5 écran d\'attente : rappel indésirables (spams)', /indésirables/.test(waitTxt));
  const resend = D.getElementById('acctResend');
  ok('6.6 bouton « Renvoyer le lien » présent', !!resend && /Renvoyer/.test(txt(resend)));
  resend.click();
  await new Promise(r => setTimeout(r, 30));
  const emailAgain = D.getElementById('acctEmail');
  ok('6.7 « Renvoyer » revient au formulaire, e-mail prérempli', !!emailAgain && emailAgain.value === 'eleve@example.org');

  // ---- 7. i18n — parité EN/PT des chaînes nouvelles et déplacées ----
  const DICTS = W.__I18N || {};
  const en = DICTS.en || {}, pt = DICTS.pt || {};
  const NEW_KEYS = [
    '✦ Guide-moi',
    'Recevoir un lien de connexion par e-mail',
    'coupures de clic (gap clicks)',
    'Accompagnement (backing track) — l\'app joue les lignes écartées',
    'Export audio (WAV / MP3)',
    '⟲ Tout réinitialiser',
    'Tout remettre par défaut — la langue, le thème et ton compte sont conservés',
    'mesure : 2/4 · 3/4 (valse) · 4/4…',
    'Sourdine générale (coupe tout le son en un clic)',
    'silences (drop-outs)',
    'Silences (drop-outs) — la basse se tait',
    'Coupures traversées',
    '✓ Réglages enregistrés automatiquement',
    'Agrandir l\'archet en plein écran',
    'Reçois un lien de connexion par e-mail — aucun mot de passe à retenir.',
    'L\'application fonctionne aussi sans compte : la connexion sert seulement à partager tes routines et suivre ta progression.',
    'Pas reçu au bout d\'une minute ? Vérifie tes indésirables (spams), ou renvoie le lien.',
    'Renvoyer le lien',
    'Groove', 'Claves', 'Cours funk', 'Horloge', 'Son', 'Bibliothèque', 'Export', '↑ Haut',
    'Sommaire des sections', 'Revenir en haut de la page'
  ];
  const missEn = NEW_KEYS.filter(k => !en[k]), missPt = NEW_KEYS.filter(k => !pt[k]);
  ok('7.1 dictionnaire EN complet pour les nouvelles chaînes', missEn.length === 0);
  if (missEn.length) missEn.forEach(k => console.log('     ! EN manquant : ' + k));
  ok('7.2 dictionnaire PT complet pour les nouvelles chaînes', missPt.length === 0);
  if (missPt.length) missPt.forEach(k => console.log('     ! PT manquant : ' + k));
  const OLD_KEYS = ['✦ Assistant', 'Se connecter par lien magique', 'gap clicks', 'Export audio', 'Backing track (l\'app joue les lignes écartées)'];
  ok('7.3 aucune ancienne clé orpheline dans EN', OLD_KEYS.every(k => !(k in en)));
  ok('7.4 aucune ancienne clé orpheline dans PT', OLD_KEYS.every(k => !(k in pt)));
  const termTitles = terms.map(t => norm(t.getAttribute('title')));
  ok('7.5 chaque infobulle a sa traduction EN et PT', termTitles.every(t => en[t] && pt[t]));
  ok('7.6 les puces du sommaire sont toutes traduites (EN)', chips.map(c => txt(c)).every(t => en[t]));

  console.log('\n--- UX 0.6.6 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL ? 1 : 0);
}

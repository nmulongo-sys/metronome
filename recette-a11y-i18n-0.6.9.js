/* recette-a11y-i18n-0.6.9.js — salve UX 0.6.9 : accessibilité & i18n (C4, C10 du panel v0.6.5).
   Headless jsdom : mêmes stubs que recette-mobile-0.6.8 (Web Audio / canvas / Supabase mocké).
   Vérifie : A1 texte utile ≥ 13 px (exclusion : ornement ◆ des summary), A2 contrastes
   WCAG ≥ 4.5:1 calculés (—fm-accent-text, --fm-danger-text, --fm-sub, deux thèmes),
   A3 zones d'état vocalisables (role=status/aria-live), roue role=img, 0 contrôle sans
   nom accessible (DOM vivant, grilles dynamiques comprises), groupes nommés,
   A4 focus visible global (:focus-visible, y compris sliders), I1 fmTr() exposé et
   effectif sur le confirm() du reset, I2 statuts dynamiques traduits (walker pour les
   fixes, fmTr pour les composés), I3 hint basse traduit EN/PT, I4 audit d'extraction
   complet (0 chaîne FR hors dictionnaires, exclusions justifiées, symétrie EN↔PT),
   I5 marqueur debug ?i18ndebug=1. Comptages en « ≥ » (motif 0.6.7/0.6.8).
   Usage : node recette-a11y-i18n-0.6.9.js [chemin/index.html]  (défaut ./index.html) */
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

function makeDom(seedStorage, url) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => errors.push(String(e && e.message || e)));
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
  return { dom, errors };
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const tick = (ms) => new Promise(r => setTimeout(r, ms || 30));

const main = makeDom(null);
const W = main.dom.window, D = W.document;
const txt = (el) => norm(el ? el.textContent : '');
const styleText = () => Array.from(D.querySelectorAll('style')).map(s => s.textContent).join('\n');

// ---- luminance / contraste WCAG (A2 : ratios calculés, pas de valeurs en dur) ----
function lum(hex) {
  const c = hex.replace('#', '').match(/../g).map(h => parseInt(h, 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
// extrait la valeur d'une variable CSS dans un bloc donné du <style>
function cssVar(block, name) {
  const m = block.match(new RegExp(name.replace(/[-]/g, '\\-') + '\\s*:\\s*(#[0-9a-fA-F]{6})'));
  return m ? m[1] : null;
}
function themeBlock(css, opening) {
  const at = css.indexOf(opening);
  if (at < 0) return '';
  let depth = 0, i = css.indexOf('{', at);
  const start = i;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) break;
  }
  return css.slice(start, i + 1);
}

setTimeout(runTests, 80);

async function runTests() {
  console.log('\n=== recette-a11y-i18n-0.6.9 · salve UX (C4 + C10) ===\n');

  // ---- 0. amorçage ----
  const realErrors = main.errors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe / navigation', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  const bm = txt(D.getElementById('buildStamp')).match(/metronomefunk-(\d+)\.(\d+)\.(\d+)/);
  const bnum = bm ? (+bm[1]) * 1e6 + (+bm[2]) * 1e3 + (+bm[3]) : 0;
  ok('0.2 tampon de build ≥ 0.6.9', bnum >= 6009);
  const css = styleText();

  // ---- 1. A1 — texte utile ≥ 13 px ----
  {
    // toutes les font-size en rem du <style> : ≥ .8125rem, sauf l'ornement ◆ (décoratif)
    const remSizes = [];
    const re = /([^{}]+)\{[^}]*font-size:\s*(\.\d+)rem/g;
    let m;
    while ((m = re.exec(css))) remSizes.push({ sel: norm(m[1]), size: parseFloat(m[2]) });
    const tooSmall = remSizes.filter(r => r.size < 0.8125 && !/summary::before/.test(r.sel));
    ok('1.1 aucune font-size rem < .8125 (13 px) hors exclusion ◆ (' + remSizes.length + ' règles examinées)', tooSmall.length === 0);
    if (tooSmall.length) tooSmall.forEach(r => console.log('     ! ' + r.sel + ' → ' + r.size + 'rem'));
    ok('1.2 exclusion documentée : ornement ◆ des summary reste décoratif (.6rem)',
       /summary::before\s*\{[^}]*font-size:\s*\.6rem/.test(css));
    const stamp = D.getElementById('buildStamp');
    ok('1.3 tampon de build : 13 px (était 11 px)', /font-size:\s*13px/.test(stamp.getAttribute('style') || ''));
    ok('1.4 tampon de build : opacité .75 (était .5, ~3.2:1)', /opacity:\s*\.75/.test(stamp.getAttribute('style') || ''));
    // px dans le <style> : rien sous 13 px sur du texte
    const pxSmall = [];
    const reP = /font-size:\s*(\d+)px/g;
    let mp;
    while ((mp = reP.exec(css))) { if (+mp[1] < 13) pxSmall.push(+mp[1]); }
    ok('1.5 aucune font-size px < 13 dans le <style>', pxSmall.length === 0);
  }

  // ---- 2. A2 — contrastes AA calculés ----
  {
    const clair = themeBlock(css, ':root');
    const sombre = themeBlock(css, 'html[data-fm-theme="sombre"]');
    ok('2.1 variables --fm-accent-text et --fm-danger-text déclarées dans les deux thèmes',
       !!cssVar(clair, '--fm-accent-text') && !!cssVar(sombre, '--fm-accent-text') &&
       !!cssVar(clair, '--fm-danger-text') && !!cssVar(sombre, '--fm-danger-text'));
    for (const [label, block] of [['clair', clair], ['sombre', sombre]]) {
      const panel = cssVar(block, '--fm-panel'), bg = cssVar(block, '--fm-bg');
      const sub = cssVar(block, '--fm-sub'), at = cssVar(block, '--fm-accent-text'), dg = cssVar(block, '--fm-danger-text');
      ok('2.2 [' + label + '] --fm-sub ≥ 4.5:1 sur panel et fond (' +
         ratio(sub, panel).toFixed(2) + ' / ' + ratio(sub, bg).toFixed(2) + ')',
         ratio(sub, panel) >= 4.5 && ratio(sub, bg) >= 4.5);
      ok('2.3 [' + label + '] --fm-accent-text ≥ 4.5:1 sur panel et fond (' +
         ratio(at, panel).toFixed(2) + ' / ' + ratio(at, bg).toFixed(2) + ')',
         ratio(at, panel) >= 4.5 && ratio(at, bg) >= 4.5);
      ok('2.4 [' + label + '] --fm-danger-text ≥ 4.5:1 sur panel (' + ratio(dg, panel).toFixed(2) + ')',
         ratio(dg, panel) >= 4.5);
    }
    // les usages texte de l'accent passent par la variable dédiée
    ok('2.5 texte accent → --fm-accent-text (.kicker, .val, .script-status, .mute, .wiz-recap b, hint-more)',
       /\.kicker\s*\{[^}]*var\(--fm-accent-text\)/.test(css) &&
       /\.val\s*\{[^}]*var\(--fm-accent-text\)/.test(css) &&
       /\.script-status\s*\{[^}]*var\(--fm-accent-text\)/.test(css) &&
       /\.status-line \.mute\s*\{[^}]*var\(--fm-accent-text\)/.test(css) &&
       /\.wiz-recap b\s*\{[^}]*var\(--fm-accent-text\)/.test(css) &&
       /hint-more > summary\s*\{[^}]*var\(--fm-accent-text\)/.test(css));
    ok('2.6 feedback compte : .good → accent-text, .bad → danger-text',
       /#acctFb\.good\{color:var\(--fm-accent-text\)\}/.test(css) &&
       /#acctFb\.bad\{color:var\(--fm-danger-text\)\}/.test(css));
    ok('2.7 feedbacks JS (biblio, export) → variables et non couleurs en dur',
       html.includes("e.style.color=ok?'var(--fm-accent-text)':'var(--fm-danger-text)'") &&
       !html.includes("e.style.color=ok?'var(--fm-accent)':'#d9534f'"));
    ok('2.8 les usages non textuels de --fm-accent ne changent pas (bordures, fonds, .step.on)',
       /\.step\.on\s*\{[^}]*background:\s*var\(--fm-accent\)/.test(css) &&
       /\.btn-sm\.primary\s*\{[^}]*background:\s*var\(--fm-accent\)/.test(css));
    // exclusions : opacités de visualisation conservées (briques, curseurs — pas du texte utile)
    ok('2.9 exclusions A2 conservées : .pl-brick.back .25 (sémantique de la visualisation)',
       /\.pl-brick\.back\s*\{\s*opacity:\s*\.25/.test(css));
  }

  // ---- 3. A3 — ARIA : vocaliser et nommer ----
  {
    for (const id of ['statusLine', 'percStatus', 'percFsStatus', 'expFb']) {
      const el = D.getElementById(id);
      ok('3.1 #' + id + ' : role=status + aria-live=polite',
         !!el && el.getAttribute('role') === 'status' && el.getAttribute('aria-live') === 'polite');
    }
    const wheel = D.getElementById('wheel');
    ok('3.2 roue #wheel : role=img + alternative textuelle statique',
       wheel.getAttribute('role') === 'img' && !!norm(wheel.getAttribute('aria-label')));
    ok('3.3 la roue ne vocalise pas par battement : pas d\'aria-live sur le canvas (c\'est #statusLine qui parle)',
       !wheel.hasAttribute('aria-live'));
    // audit : nom accessible sur TOUS les contrôles du DOM vivant (grilles dynamiques comprises)
    function accName(el) {
      if (norm(el.getAttribute('aria-label'))) return true;
      if (el.getAttribute('aria-labelledby')) return true;
      if (el.id && D.querySelector('label[for="' + el.id + '"]')) return true;
      if (el.closest('label')) return true;
      if ((el.tagName === 'BUTTON' || el.tagName === 'SUMMARY') && norm(el.textContent)) return true;
      if (norm(el.getAttribute('title'))) return true;
      return false;
    }
    const ctrls = Array.from(D.querySelectorAll('button, input, select, textarea'));
    const unnamed = ctrls.filter(el => !accName(el));
    ok('3.4 contrôles sans nom accessible : 0 (sur ' + ctrls.length + ' contrôles, ≥ 143 attendus)',
       unnamed.length === 0 && ctrls.length >= 143);
    if (unnamed.length) unnamed.slice(0, 8).forEach(el => console.log('     ! ' + el.tagName + ' #' + (el.id || '?')));
    // cases des grilles : libellées voix + pas
    const step = D.querySelector('#claveSteps .step');
    ok('3.5 cases .step nommées « voix — pas N »', !!step && /— pas \d+$/.test(step.getAttribute('aria-label') || ''));
    const pstep = D.querySelector('#percVoices .step');
    ok('3.6 cases percussion nommées aussi', !!pstep && /— pas \d+$/.test(pstep.getAttribute('aria-label') || ''));
    // groupes nommés
    ok('3.7 bloc export audio : role=group nommé',
       D.getElementById('expAudio').getAttribute('role') === 'group' &&
       !!norm(D.getElementById('expAudio').getAttribute('aria-label')));
    const srow = D.getElementById('tempoSlider').closest('.slider-row');
    ok('3.8 grappe tempo (−/curseur/+) : role=group nommé',
       !!srow && srow.getAttribute('role') === 'group' && !!norm(srow.getAttribute('aria-label')));
  }

  // ---- 4. A4 — focus clavier visible ----
  {
    ok('4.1 règle globale :focus-visible (outline 2px accent, offset)',
       /:focus-visible\s*\{\s*outline:\s*2px solid var\(--fm-accent\);\s*outline-offset:\s*2px/.test(css));
    ok('4.2 sliders : le outline:none historique est compensé par :focus-visible dédié',
       /input\[type=range\]:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--fm-accent\)/.test(css));
    ok('4.3 .term:focus sans outline garde un remplacement visible (bulle ::before au focus)',
       /\.term:focus\s*\{\s*outline:\s*none/.test(css) && /\.term:focus::before/.test(css));
  }

  // ---- 5. I1 — fmTr() pour les chaînes JS ----
  {
    ok('5.1 window.fmTr exposé (fonction)', typeof W.fmTr === 'function');
    ok('5.2 en FR : fmTr est l\'identité', W.fmTr('pas') === 'pas' && W.fmTr('inconnu xyz') === 'inconnu xyz');
    const en = makeDom({ 'fm-lang': 'en' });
    await tick(80);
    const We = en.dom.window, De = We.document;
    ok('5.3 en EN : fmTr traduit (pas → step), fallback FR si clé inconnue',
       We.fmTr('pas') === 'step' && We.fmTr('chaîne absente du dictionnaire') === 'chaîne absente du dictionnaire');
    // confirm() du reset : la clé passe par fmTr (norm gère le \n du message)
    let confirmMsg = null;
    We.confirm = (msg) => { confirmMsg = msg; return false; };
    De.getElementById('btnResetAll').dispatchEvent(new We.Event('click', { bubbles: true }));
    ok('5.4 confirm() du reset traduit en EN (clé enfin effective — dette 0.6.6)',
       confirmMsg === We.__I18N.en['Tout remettre par défaut ? (La langue, le thème et ton compte sont conservés.)']);

    // ---- 6. I2 — statuts dynamiques traduits ----
    // fixe : le walker attrape la mutation characterData (clé pleine)
    const perc = De.getElementById('percStatus');
    perc.textContent = 'Micro-timing armé — glisse à gauche/droite';
    await tick(60);
    ok('6.1 statut fixe traduit par le walker (« Micro-timing armé » — dette 0.6.8)',
       txt(perc) === We.__I18N.en['Micro-timing armé — glisse à gauche/droite']);
    ok('6.2 statut « Prêt » traduit au chargement', txt(De.getElementById('statusLine')) === We.__I18N.en['Prêt']);
    // composés : les fragments fixes passent par fmTr dans le code source
    ok('6.3 composés percussion via fmTr (+/− frappe, appel-réponse, break, séquences, kit)',
       /percStatusSet\(fmTr\('\+ frappe ajoutée :'\)/.test(html) &&
       /percStatusSet\(fmTr\('− frappe retirée :'\)/.test(html) &&
       /percStatusSet\(fmTr\('Réponse : à toi ! La voix'\)/.test(html) &&
       /percStatusSet\(fmTr\('BREAK — niveau'\)/.test(html) &&
       /percStatusSet\(fmTr\('Séquence'\)/.test(html) &&
       /percStatusSet\(fmTr\('Kit généré :'\)/.test(html));
    ok('6.4 statusLine gap/break/mesure via fmTr (● COUPÉ, ● GAP, ◆ BREAK, Mesure N)',
       /fmTr\('● COUPÉ — tiens le tempo !'\)/.test(html) &&
       /fmTr\('en silence, le reste continue'\)/.test(html) &&
       /fmTr\('◆ BREAK — niveau'\)/.test(html) &&
       /fmTr\('Mesure'\)/.test(html));
    const pvMute = De.querySelector('#percVoices .pv-mute');
    ok('6.5 libellé « muet » des voix traduit à la construction (' + JSON.stringify(txt(pvMute)) + ')',
       txt(pvMute) === We.__I18N.en['muet']);
    const enStep = De.querySelector('#claveSteps .step');
    ok('6.6 aria-label des cases traduit à la construction (voix + « step N »)',
       /— step \d+$/.test(enStep.getAttribute('aria-label') || ''));

    // ---- 7. I3 — hint basse traduit ----
    const enHint = Array.from(De.querySelectorAll('#secBass .hint')).map(h => txt(h)).join(' ');
    ok('7.1 hint basse traduit en EN (premier fragment)',
       enHint.includes('A synthesized funk bass voice that accompanies the percussionist'));
    ok('7.2 fragments internes du hint traduits (détaché ↔ lié, drop-outs)',
       enHint.includes('detached ↔ legato') && enHint.includes('the bass goes silent periodically'));
    const pt = makeDom({ 'fm-lang': 'pt' });
    await tick(80);
    const Dp = pt.dom.window.document;
    const ptHint = Array.from(Dp.querySelectorAll('#secBass .hint')).map(h => txt(h)).join(' ');
    ok('7.3 hint basse traduit en PT-BR', ptHint.includes('Uma voz de baixo funk sintetizada'));
  }

  // ---- 8. I4 — audit d'extraction systématique ----
  {
    const EN = W.__I18N.en, PT = W.__I18N.pt;
    // Exclusions justifiées (spec §I4) : contenu pédagogique P-2/P-4 (classes pf-*, chantier
    // de traduction dédié) ; tampon de build ; sélecteur de langue (chaque langue dans sa
    // langue) ; aria-labels composés des cases (fragments déjà traduits via fmTr) ; termes
    // identiques dans les trois langues (anglicismes, unités, chiffrages harmoniques).
    // 0.7.0 (C14) : l'overlay de coloration .script-hl reflète le texte tapé par
    // l'utilisateur (intraduisible par nature) et #scriptLint/#bowLint sont des statuts
    // composés de fragments déjà traduits via fmTr — même justification que les cases.
    const IDENT = new Set(['FR', 'EN', 'BR', 'Langue / Language / Idioma', 'Français', 'English',
      'Português (Brasil)', 'time', 'Drop-outs', 'min', 'ok', 'tone', 'slap', 'Tempo', 'Tempo (BPM)',
      'Swing (%)', 'Swing -1 %', 'Swing +1 %', 'I⁷ → IV⁷ — Sex Machine', 'ii⁷ → V⁷ — jazz-funk']);
    const EXCL = (t, el) => IDENT.has(t) || /^build metronomefunk-/.test(t) ||
      /— (pas|step|passo) \d+$/.test(t) ||
      !!(el && el.closest && el.closest('[class*="pf-"], #pfStatus, .script-hl, #scriptLint, #bowLint'));
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
    ok('8.1 extraction des nœuds texte du DOM vivant : 0 chaîne FR hors dictionnaire EN', misses.size === 0);
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
    ok('8.2 extraction des attributs (placeholder/title/aria-label) : 0 manque', attrMisses.size === 0);
    if (attrMisses.size) Array.from(attrMisses).slice(0, 8).forEach(t => console.log('     ! ' + JSON.stringify(t.slice(0, 70))));
    const orphEN = Object.keys(EN).filter(k => !(k in PT));
    const orphPT = Object.keys(PT).filter(k => !(k in EN));
    ok('8.3 symétrie des dictionnaires : 0 clé orpheline EN↔PT', orphEN.length === 0 && orphPT.length === 0);
    ok('8.4 dictionnaires ≥ 500 clés par langue (0.6.8 : 385)',
       Object.keys(EN).length >= 500 && Object.keys(PT).length >= 500);
  }

  // ---- 9. I5 — marqueur debug ?i18ndebug=1 ----
  {
    ok('9.1 règle CSS .i18n-miss présente (liseré diagnostic)', /\.i18n-miss\s*\{\s*outline:\s*1px dashed var\(--fm-danger-text\)/.test(css));
    const dbg = makeDom({ 'fm-lang': 'en' }, 'http://localhost/?i18ndebug=1');
    await tick(80);
    const Wd = dbg.dom.window, Dd = Wd.document;
    const div = Dd.createElement('div');
    div.textContent = 'ceci reste en français non traduit';
    Dd.body.appendChild(div);
    await tick(60);
    ok('9.2 un nœud resté en FR est marqué .i18n-miss après bascule EN', div.classList.contains('i18n-miss'));
    const div2 = Dd.createElement('div');
    div2.textContent = 'Prêt';
    Dd.body.appendChild(div2);
    await tick(60);
    ok('9.3 un nœud traduit n\'est PAS marqué (table inverse des valeurs)',
       txt(div2) === Wd.__I18N.en['Prêt'] && !div2.classList.contains('i18n-miss'));
    // sans le flag : aucun marquage
    const en2 = makeDom({ 'fm-lang': 'en' });
    await tick(80);
    const De2 = en2.dom.window.document;
    const div3 = De2.createElement('div');
    div3.textContent = 'ceci reste en français non traduit';
    De2.body.appendChild(div3);
    await tick(60);
    ok('9.4 sans ?i18ndebug=1 : aucun marquage (utilisateur final intact)', !div3.classList.contains('i18n-miss'));
  }

  console.log('\n--- a11y+i18n 0.6.9 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL ? 1 : 0);
}

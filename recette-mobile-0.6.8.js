/* recette-mobile-0.6.8.js — salve UX 0.6.8 : mobile & tactile (C3 du panel v0.6.5).
   Headless jsdom : mêmes stubs que recette-onboarding-0.6.7 (Web Audio / canvas / Supabase mocké).
   Vérifie : M1 breakpoint ≤ 480 px (reflow seulement), M2 cibles ≥ 44 px sous
   @media (pointer: coarse) — le chemin souris ne change pas —, M3 micro-timing à
   l'appui long au doigt (armement ~400 ms, annulation par mouvement, tap simple et
   double-tap intacts, drag souris immédiat comme en 0.6.7, touch-action: pan-y),
   M4 boutons ±1 câblés et bornés sur Swing et Décalage, M5 garde des termes « ? »
   dans les summary (l'infobulle sans déplier la section), et la parité i18n EN/PT
   des chaînes nouvelles (l'aide « Sur écran tactile »).
   Usage : node recette-mobile-0.6.8.js [chemin/index.html]  (défaut ./index.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

// R-4b : la surface mobile auditée (sections, grilles, sliders fins, appui long)
// vit sur pratiquer.html depuis la refonte de l'accueil (argument fichier conservé).
const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
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

function makeDom(seedStorage) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => errors.push(String(e && e.message || e)));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc,
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
const tick = (ms) => new Promise(r => setTimeout(r, ms || 20));

const main = makeDom(null);
const W = main.dom.window, D = W.document;
const txt = (el) => norm(el ? el.textContent : '');
const styleText = () => Array.from(D.querySelectorAll('style')).map(s => s.textContent).join('\n');

// événement pointeur synthétique : jsdom n'a pas PointerEvent, un Event générique
// enrichi (clientX, pointerType…) suffit pour les handlers de l'app.
function pev(type, props) {
  const e = new W.Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, props || {});
  return e;
}

// extrait le corps d'un bloc @media par son préambule (équilibrage naïf des accolades)
function mediaBlock(css, opening) {
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

setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-mobile-0.6.8 · salve UX (C3) ===\n');

  // ---- 0. amorçage ----
  const realErrors = main.errors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe / navigation', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  // tampon « 0.6.8 ou plus récent » — l'égalité stricte casserait à la salve suivante.
  const bm = txt(D.getElementById('buildStamp')).match(/metronomefunk-(\d+)\.(\d+)\.(\d+)/);
  const bnum = bm ? (+bm[1]) * 1e6 + (+bm[2]) * 1e3 + (+bm[3]) : 0;
  ok('0.2 tampon de build ≥ 0.6.8', bnum >= 6008);
  ok('0.3 init terminée (__fmReady)', W.__fmReady === true);
  const css = styleText();

  // ---- 1. M1 — breakpoint ≤ 480 px : reflow seulement ----
  const m480 = mediaBlock(css, '@media (max-width: 480px)');
  ok('1.1 media query ≤ 480 px présente', m480.length > 0);
  ok('1.2 padding des cartes resserré (14px)', /\.card\s*\{[^}]*padding:\s*14px/.test(m480));
  ok('1.3 libellés de .row en pleine largeur', /\.row\s*>\s*label:first-child\s*\{[^}]*flex-basis:\s*100%/.test(m480) &&
     /min-width:\s*0/.test(m480));
  ok('1.4 tempo réduit mais lisible (3.4rem)', /\.tempo-value\s*\{[^}]*font-size:\s*3\.4rem/.test(m480));
  ok('1.5 aucun display:none dans le bloc 480 px (rien de masqué)', !/display:\s*none/.test(m480));
  ok('1.6 le breakpoint 740 px historique est conservé', /@media \(max-width: 740px\)/.test(css));

  // ---- 2. M2 — cibles ≥ 44 px sous pointer: coarse ; bureau inchangé ----
  const coarse = mediaBlock(css, '@media (pointer: coarse)');
  ok('2.1 media query pointer: coarse présente', coarse.length > 0);
  ok('2.2 boutons −/+ des sliders : 44 px', /\.slider-row button,\s*\.nudge\s*\{[^}]*width:\s*44px;\s*height:\s*44px/.test(coarse));
  ok('2.3 .btn-sm : min-height 44 px', /\.btn-sm\s*\{[^}]*min-height:\s*44px/.test(coarse));
  ok('2.4 pouce de slider grossi (28 px webkit, 26 px moz)',
     /-webkit-slider-thumb\s*\{[^}]*width:\s*28px/.test(coarse) && /-moz-range-thumb\s*\{[^}]*width:\s*26px/.test(coarse));
  ok('2.5 cases à cocher : zone 44 px (y compris .play-bass, plus spécifique)',
     /\.check,\s*\.play-bass \.check\s*\{[^}]*min-height:\s*44px/.test(coarse));
  ok('2.6 cases mini percussion : 32×44', /\.steps\.mini \.step\s*\{[^}]*width:\s*32px;\s*height:\s*44px/.test(coarse));
  // le chemin souris ne change pas : les valeurs 0.6.7 restent hors media query
  ok('2.7 base bureau intacte : boutons 38 px hors media query', /\.slider-row button,\s*\.nudge\s*\{[^}]*width:\s*38px;\s*height:\s*38px/.test(css));
  ok('2.8 base bureau intacte : cases mini 26×34 hors media query', /\.steps\.mini \.step\s*\{\s*width:\s*26px;\s*height:\s*34px/.test(css));

  // ---- 3. M3 — micro-timing : souris immédiat, doigt à l'appui long ----
  ok('3.1 grille percussion : touch-action pan-y (le doigt peut faire défiler)',
     /#percVoices \.step, #percFsVoices \.step\s*\{[^}]*touch-action:\s*pan-y/.test(css) &&
     !/touch-action:\s*none/.test(css.match(/#percVoices \.step, #percFsVoices \.step\s*\{[^}]*\}/)[0]));
  ok('3.2 halo d\'armement .timing-armed défini', /\.step\.timing-armed\s*\{[^}]*outline:\s*3px solid var\(--fm-accent\)/.test(css));

  const row = D.querySelector('#percVoices .steps');
  ok('3.3 grille percussion construite', !!row && row.children.length >= 8);
  const st = row.children[1];
  st.click(); await tick();                              // silence → frappe
  ok('3.4 tap simple : la case cycle (frappe)', st.classList.contains('on'));
  const status = () => txt(D.getElementById('percStatus'));

  // 3.a — souris : drag immédiat, identique à 0.6.7
  st.dispatchEvent(pev('pointerdown', { clientX: 100 }));
  W.dispatchEvent(pev('pointermove', { clientX: 120 }));
  ok('3.5 souris : l\'offset s\'applique dès le mouvement (transform posé)', /translateX/.test(st.style.transform));
  ok('3.6 souris : statut micro-timing détaillé (« % du pas », « laid back »)', /% du pas/.test(status()) && /laid back/.test(status()));
  ok('3.7 souris : pas de halo d\'appui long', !st.classList.contains('timing-armed'));
  W.dispatchEvent(pev('pointerup', {}));
  st.click(); await tick();                              // clic post-drag avalé (dataset.dragged)
  ok('3.8 souris : le clic qui clôt un drag est avalé (la case ne cycle pas)', st.classList.contains('on') && !st.classList.contains('acc'));

  // 3.b — doigt : tap court = cycle normal (pas de drag armé)
  st.dispatchEvent(pev('pointerdown', { clientX: 100, pointerType: 'touch' }));
  W.dispatchEvent(pev('pointerup', {}));
  st.click(); await tick();
  ok('3.9 doigt : tap court → la case cycle normalement (frappe → accent)', st.classList.contains('acc'));

  // 3.c — doigt : bouger avant l'appui long = défilement, drag annulé
  const tf0 = st.style.transform;
  st.dispatchEvent(pev('pointerdown', { clientX: 100, pointerType: 'touch' }));
  W.dispatchEvent(pev('pointermove', { clientX: 130 }));  // > 8 px avant 400 ms
  await tick(450);
  ok('3.10 doigt : mouvement avant l\'appui long → jamais armé', !st.classList.contains('timing-armed'));
  W.dispatchEvent(pev('pointermove', { clientX: 160 }));
  eq('3.11 doigt : l\'offset n\'a pas bougé (geste rendu au défilement)', st.style.transform, tf0);
  W.dispatchEvent(pev('pointerup', {}));

  // 3.d — doigt : appui long ≈ 400 ms → armé, puis glisse
  st.dispatchEvent(pev('pointerdown', { clientX: 100, pointerType: 'touch', pointerId: 1 }));
  await tick(450);
  ok('3.12 doigt : appui long → case armée (halo)', st.classList.contains('timing-armed'));
  ok('3.13 doigt : statut « Micro-timing armé — glisse à gauche/droite »', /Micro-timing armé — glisse à gauche\/droite/.test(status()));
  W.dispatchEvent(pev('pointermove', { clientX: 120 }));
  ok('3.14 doigt : le glissement post-armement applique l\'offset', /translateX/.test(st.style.transform) && /% du pas/.test(status()));
  W.dispatchEvent(pev('pointerup', {}));
  ok('3.15 doigt : halo retiré au relâchement', !st.classList.contains('timing-armed'));
  st.click(); await tick();
  ok('3.16 doigt : le clic qui clôt un appui long est avalé (la case ne cycle pas)', st.classList.contains('acc'));

  // 3.e — double-tap : remise à zéro conservée
  st.dispatchEvent(new W.MouseEvent('dblclick', { bubbles: true }));
  await tick();
  eq('3.17 double-tap : micro-décalage remis à zéro (transform vidé)', st.style.transform, '');
  ok('3.18 statut de remise à zéro affiché', /remis à zéro/.test(status()));

  // ---- 4. M4 — boutons ±1 sur les sliders fins ----
  const sMinus = D.getElementById('swingMinus'), sPlus = D.getElementById('swingPlus');
  const swingSlider = D.getElementById('swingSlider'), swingVal = D.getElementById('swingVal');
  ok('4.1 boutons ± du swing présents, style .nudge, dans la ligne du slider',
     !!sMinus && !!sPlus && sMinus.classList.contains('nudge') && sPlus.classList.contains('nudge') &&
     sMinus.closest('.row') === swingSlider.closest('.row'));
  sPlus.click();
  eq('4.2 swing +1 : 50 → 51', swingSlider.value, '51');
  eq('4.3 valeur affichée synchronisée', txt(swingVal), '51 %');
  sMinus.click(); sMinus.click();
  eq('4.4 swing −1 borné à 50 (jamais sous le plancher)', swingSlider.value, '50');
  swingSlider.value = 85; swingSlider.dispatchEvent(new W.Event('input', { bubbles: true }));
  sPlus.click();
  eq('4.5 swing +1 borné à 85 (jamais au-dessus du plafond)', swingSlider.value, '85');
  swingSlider.value = 50; swingSlider.dispatchEvent(new W.Event('input', { bubbles: true }));

  const dMinus = D.getElementById('shiftMinus'), dPlus = D.getElementById('shiftPlus');
  const shiftSlider = D.getElementById('shiftSlider'), shiftVal = D.getElementById('shiftVal');
  ok('4.6 boutons ± du décalage présents, style .nudge, dans la ligne du slider',
     !!dMinus && !!dPlus && dMinus.classList.contains('nudge') && dPlus.classList.contains('nudge') &&
     dMinus.closest('.row') === shiftSlider.closest('.row'));
  dPlus.click();
  eq('4.7 décalage +1 : +25 → +26 ms (signe affiché)', txt(shiftVal), '+26 ms');
  dMinus.click(); dMinus.click();
  eq('4.8 décalage −1 : retour à +24 ms', txt(shiftVal), '+24 ms');
  shiftSlider.value = 80; shiftSlider.dispatchEvent(new W.Event('input', { bubbles: true }));
  dPlus.click();
  eq('4.9 décalage borné à +80 ms', shiftSlider.value, '80');
  shiftSlider.value = -80; shiftSlider.dispatchEvent(new W.Event('input', { bubbles: true }));
  dMinus.click();
  eq('4.10 décalage borné à −80 ms', shiftSlider.value, '-80');
  eq('4.11 signe négatif affiché sans doublon', txt(shiftVal), '-80 ms');
  shiftSlider.value = 25; shiftSlider.dispatchEvent(new W.Event('input', { bubbles: true }));
  // les autres sliders ne gagnent PAS de ± (périmètre M4 : les réglages fins seulement)
  ok('4.12 volume, fréquences, legato, gap : pas de boutons ± ajoutés',
     ['volSlider', 'shiftFreq', 'bassLegato', 'gapProb', 'pulseFreq'].every(id => {
       const el = D.getElementById(id);
       return el && !el.parentElement.querySelector('.nudge');
     }));

  // ---- 5. M5 — les termes « ? » des summary n'ouvrent plus la section ----
  const grooveSec = D.getElementById('secGroove');
  const term = grooveSec.querySelector('summary .term');
  ok('5.1 terme « ? » présent dans le summary de la section groove', !!term);
  grooveSec.open = false;
  const notCancelled = term.dispatchEvent(new W.MouseEvent('click', { bubbles: true, cancelable: true }));
  await tick();
  ok('5.2 clic sur le terme : événement neutralisé (preventDefault)', notCancelled === false);
  ok('5.3 la section reste fermée', grooveSec.open === false);
  ok('5.4 le terme prend le focus (l\'infobulle :focus s\'affiche)', D.activeElement === term);
  // tous les summary à termes sont couverts
  const uncovered = [];
  D.querySelectorAll('details.section summary .term').forEach(t => {
    const sec = t.closest('details.section');
    const wasOpen = sec.open;
    sec.open = false;
    const nc = t.dispatchEvent(new W.MouseEvent('click', { bubbles: true, cancelable: true }));
    if (nc !== false || sec.open) uncovered.push(sec.id || '(sans id)');
    sec.open = wasOpen;
  });
  ok('5.5 garde posée sur tous les termes de tous les summary', uncovered.length === 0);
  if (uncovered.length) uncovered.forEach(id => console.log('     ! summary non couvert : ' + id));

  // ---- 6. i18n — parité EN/PT des chaînes nouvelles 0.6.8 ----
  const DICTS = W.__I18N || {};
  const en = DICTS.en || {}, pt = DICTS.pt || {};
  const NEW_KEYS = [
    'Sur écran tactile',
    ': appui long (une demi-seconde) sur la case, puis glisse — un simple toucher fait défiler la page.'
  ];
  const missEn = NEW_KEYS.filter(k => !en[k]), missPt = NEW_KEYS.filter(k => !pt[k]);
  ok('6.1 dictionnaire EN complet pour les chaînes 0.6.8', missEn.length === 0);
  if (missEn.length) missEn.forEach(k => console.log('     ! EN manquant : ' + k));
  ok('6.2 dictionnaire PT complet pour les chaînes 0.6.8', missPt.length === 0);
  if (missPt.length) missPt.forEach(k => console.log('     ! PT manquant : ' + k));
  // l'aide en ligne contient bien le nouveau nœud, aux frontières de nœuds existantes
  // (aucune clé 0.6.7 scindée : la salve est purement additive côté i18n)
  const helpLi = Array.from(D.querySelectorAll('.hint-more li')).find(li => /Sur écran tactile/.test(txt(li)));
  ok('6.3 l\'aide micro-timing mentionne l\'appui long mobile', !!helpLi && /appui long/.test(txt(helpLi)));
  ok('6.4 la clé 0.6.7 voisine (glisser une case) est intacte',
     (': glisse une case active vers la droite (en retard, laid back) ou la gauche (en avance) pour visualiser et entendre le swing de cette frappe — double-clic pour la recentrer.' in en));

  console.log('\n--- mobile 0.6.8 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL ? 1 : 0);
}

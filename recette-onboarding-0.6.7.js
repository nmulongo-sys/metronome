/* recette-onboarding-0.6.7.js — salve UX 0.6.7 : ce qui en survit à R-4b.
   Headless jsdom : mêmes stubs que recette-ux-0.6.6 (Web Audio / canvas / Supabase mocké).
   R-4b : le bandeau « Débutant ? » et l'assistant (C1-onboarding) sont RETIRÉS de
   l'application avec le wizard et l'écran de jeu (GO R-4 §9.4) — l'invitation au
   novice, c'est l'accueil « métronome immédiat » et sa porte « Apprendre »
   (recette-accueil.js). Restent vérifiés ici, sur pratiquer.html (la page qui
   porte sommaire et sections) : le mode focus « une section à la fois » (C1),
   les hints hiérarchisés « phrase clé + En savoir plus » (C9), l'interaction
   avec « ⟲ Tout réinitialiser » (C8) et la parité i18n EN/PT des chaînes 0.6.7
   encore vivantes.
   Usage : node recette-onboarding-0.6.7.js [chemin/pratiquer.html]  (défaut ./pratiquer.html) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

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

setTimeout(runTests, 60);

async function runTests() {
  console.log('\n=== recette-onboarding-0.6.7 · salve UX (C1 C9) ===\n');

  // ---- 0. amorçage ----
  const realErrors = main.errors.filter(m => !/resources?|Could not load|external script|net::|ERR_|Not implemented/i.test(m));
  ok('0.1 aucun jsdomError hors ressource externe / navigation', realErrors.length === 0);
  if (realErrors.length) realErrors.forEach(m => console.log('     ! ' + m));
  // tampon « 0.6.7 ou plus récent » — l'égalité stricte casserait à la salve suivante.
  const bm = txt(D.getElementById('buildStamp')).match(/metronomefunk-(\d+)\.(\d+)\.(\d+)/);
  const bnum = bm ? (+bm[1]) * 1e6 + (+bm[2]) * 1e3 + (+bm[3]) : 0;
  ok('0.2 tampon de build ≥ 0.6.7', bnum >= 6007);
  ok('0.3 init terminée (__fmReady)', W.__fmReady === true);

  /* ---- 1. RETIRÉE (R-4b) : bandeau « Débutant ? » + assistant ----------------
     Les 9 assertions du bandeau et de son entrée dans le wizard partent avec la
     surface (retrait C1-onboarding/wizard, GO R-4 §9.4). */

  // ---- 2. C1 — mode focus « une section à la fois » ----
  const fm = D.getElementById('focusMode');
  ok('2.1 case présente dans le sommaire sticky', !!fm && !!fm.closest('#tocBar'));
  ok('2.2 libellé « Une section à la fois », décochée par défaut', /Une section à la fois/.test(txt(fm.closest('label'))) && fm.checked === false);
  const sections = Array.from(D.querySelectorAll('details.section'));
  const openCount = () => sections.filter(d => d.open).length;
  // décochée : deux sections peuvent rester ouvertes
  sections.forEach(d => { d.open = false; });
  await tick();
  D.getElementById('secGroove').open = true;
  await tick();
  D.getElementById('secClave').open = true;
  await tick();
  eq('2.3 mode focus décoché → sections indépendantes (2 ouvertes)', openCount(), 2);
  // cochée : ouvrir une section referme les autres
  fm.checked = true;
  fm.dispatchEvent(new W.Event('change', { bubbles: true }));
  eq('2.4 cocher persiste fm-metro-focus-mode=1', W.localStorage.getItem('fm-metro-focus-mode'), '1');
  D.getElementById('secPerc').open = true;
  await tick();
  ok('2.5 mode focus coché → une seule section ouverte (la visée)', openCount() === 1 && D.getElementById('secPerc').open);
  // le sommaire C6 reste fonctionnel en mode focus
  // R-4b : la chip visée devient « Son » — l'archet vit sur index.html.
  const sonChip = Array.from(D.querySelectorAll('#tocBar .toc-chip')).find(c => c.getAttribute('data-toc') === 'secSon');
  sonChip.click();
  await tick();
  ok('2.6 clic sommaire en mode focus → seule la section visée est ouverte', openCount() === 1 && D.getElementById('secSon').open);
  // décocher rétablit l'indépendance
  fm.checked = false;
  fm.dispatchEvent(new W.Event('change', { bubbles: true }));
  D.getElementById('secGroove').open = true;
  await tick();
  eq('2.7 décoché → les sections redeviennent indépendantes', openCount(), 2);
  // 2.8 RETIRÉE (R-4b) : plus de mode « Jouer » — la règle CSS body.mode-simple
  // est partie avec l'écran de jeu (§9.4), le sommaire est toujours visible.

  // ---- 3. C9 — aides hiérarchisées « phrase clé + En savoir plus » ----
  const mores = Array.from(D.querySelectorAll('details.hint-more'));
  // R-4b : 7 aides sur pratiquer — celle de l'archet vit sur index.html (recette-accueil).
  eq('3.1 sept aides repliables (les hints ≥ 300 caractères)', mores.length, 7);
  ok('3.2 chaque repli est fermé par défaut', mores.every(d => !d.open));
  ok('3.3 chaque repli s\'ouvre par « En savoir plus »', mores.every(d => txt(d.querySelector('summary')) === 'En savoir plus'));
  ok('3.4 chaque repli vit dans un hint', mores.every(d => !!d.closest('.hint')));
  const hintOf = (sel) => D.querySelector(sel);
  // percussion : phrase clé + rubriques en liste — « ≥ 9 » et non « = 9 » : les salves
  // suivantes peuvent AJOUTER des rubriques (0.6.8 : appui long mobile) sans rien perdre
  // du contenu 0.6.7, que 3.6/3.7 continuent de vérifier (même motif que le tampon de build).
  const percHint = hintOf('#secPerc .hint-more');
  ok('3.5 percussion : au moins 9 rubriques en liste', percHint.querySelectorAll('li').length >= 9);
  ok('3.6 percussion : phrase clé visible avant le repli', /^Clic sur un pas : silence → frappe → accent\./.test(txt(percHint.closest('.hint'))));
  ok('3.7 percussion : rien n\'est perdu (fin du pavé présente)', /édite-les selon ta référence\./.test(txt(percHint)));
  // basse : intro + 5 rubriques
  const bassHint = hintOf('#secBass .hint-more');
  eq('3.8 basse : 5 rubriques en liste', bassHint.querySelectorAll('li').length, 5);
  ok('3.9 basse : phrase clé = rôle de la voix (FUNK-I2)', /caler le jeu sur ses syncopes et ses silences \(FUNK-I2\)\./.test(txt(bassHint.closest('.hint'))));
  ok('3.10 basse : drop-outs et swing conservés dans le repli', /re-rentre\s*sur le 1/.test(txt(bassHint)) && /section Micro-timing/.test(txt(bassHint)));
  /* 3.11–3.13 DÉPLACÉES (R-4b) : l'aide archet vit sur index.html avec sa
     section — assertions équivalentes dans recette-accueil.js (A6). */
  // spot-checks de non-perte sur les 5 autres
  ok('3.14 claves : résolution sur le 1 conservée', /cycle suivant\./.test(txt(hintOf('#secClave .hint-more'))));
  ok('3.15 horloge : mode progressif conservé', /aucun filet de sécurité\./.test(txt(hintOf('#secGap .hint-more'))));
  ok('3.16 répertoire : renvoi Team Spirit conservé', /Team Spirit/.test(txt(hintOf('#secRepertoire .hint-more'))));
  const teamMores = Array.from(D.querySelectorAll('#secTeam .hint-more'));
  eq('3.17 Team Spirit : deux aides repliées (priorité + assignation)', teamMores.length, 2);
  ok('3.18 Team Spirit : fins des deux pavés conservées', /en sourdine sinon\./.test(txt(teamMores[0])) && /physiquement impossible\)\./.test(txt(teamMores[1])));
  ok('3.19 style : repli inline, marqueur natif masqué', /details\.hint-more \{ display:inline/.test(styleText()) && /::-webkit-details-marker \{ display:none/.test(styleText()));

  // ---- 4. C1 × C8 — le reset ramène l'état « première visite » ----
  W.confirm = () => true;
  D.getElementById('btnResetAll').click();
  ok('4.1 « ⟲ Tout réinitialiser » purge le refus du bandeau', W.localStorage.getItem('fm-metro-onboard-dismissed') === null);
  ok('4.2 …et l\'état de l\'assistant (le bandeau reviendra au prochain chargement)', W.localStorage.getItem('fm-metro-wizard-done') === null && W.localStorage.getItem('fm-metro-focus-mode') === null);

  // ---- 5. second DOM : utilisateur installé (mode focus mémorisé) ----
  // R-4b : plus de bandeau à vérifier (5.1 retirée avec la surface, §9.4).
  const seeded = makeDom({
    'fm-metro-focus-mode': '1'
  });
  await tick(80);
  const D2 = seeded.dom.window.document;
  ok('5.2 fm-metro-focus-mode=1 → case cochée au chargement', D2.getElementById('focusMode').checked === true);
  const s2 = Array.from(D2.querySelectorAll('details.section'));
  D2.getElementById('secGroove').open = true;
  await tick();
  D2.getElementById('secSon').open = true;
  await tick();
  eq('5.3 mode focus restauré → une seule section ouverte', s2.filter(d => d.open).length, 1);
  seeded.dom.window.close();

  // ---- 6. i18n — parité EN/PT des chaînes nouvelles, scindées ou re-clées ----
  const DICTS = W.__I18N || {};
  const en = DICTS.en || {}, pt = DICTS.pt || {};
  // R-4b : les clés du bandeau/assistant (surfaces retirées §9.4) sortent de la
  // liste — restent les chaînes 0.6.7 encore vivantes sur cette page.
  const NEW_KEYS = [
    'En savoir plus',
    'Une section à la fois',
    'Ouvrir une section referme les autres',
    // scissions C9 (phrase clé / suite du pavé)
    'Classe les lignes par priorité — glisse la poignée ⠿ pour réordonner.',
    'Les premières sont garanties : chaque ligne est attribuée',
    'qui équilibre la charge de jeu (nombre de frappes) en mélangeant les tessitures.',
    'La carte de chacun affiche',
    'Le répertoire s\'écoute librement, seul ou en groupe — la répartition entre participants se fait dans la section',
    'Jauge : talon à gauche, pointe à droite. Si le curseur vire au rouge, la séquence te fait « manquer d\'archet ».',
    // re-clés archet (les séparateurs « · » quittent les clés)
    '= tirer 50 % d\'archet sur 1 temps',
    '= pousser 20 % sur une croche',
    '= reprise (retour au talon, archet levé)'
  ];
  const missEn = NEW_KEYS.filter(k => !en[k]), missPt = NEW_KEYS.filter(k => !pt[k]);
  ok('6.1 dictionnaire EN complet pour les chaînes 0.6.7', missEn.length === 0);
  if (missEn.length) missEn.forEach(k => console.log('     ! EN manquant : ' + k));
  ok('6.2 dictionnaire PT complet pour les chaînes 0.6.7', missPt.length === 0);
  if (missPt.length) missPt.forEach(k => console.log('     ! PT manquant : ' + k));
  const OLD_KEYS = [
    '= tirer 50 % d\'archet sur 1 temps ·',
    '= pousser 20 % sur une croche ·',
    '= reprise (retour au talon, archet levé) ·',
    '). Jauge : talon à gauche, pointe à droite. Si le curseur vire au rouge, la séquence te fait « manquer d\'archet ».',
    'qui équilibre la charge de jeu (nombre de frappes) en mélangeant les tessitures. La carte de chacun affiche',
    'Classe les lignes par priorité — glisse la poignée ⠿ pour réordonner. Les premières sont garanties : chaque ligne est attribuée',
    '). Le répertoire s\'écoute librement, seul ou en groupe — la répartition entre participants se fait dans la section'
  ];
  ok('6.3 aucune ancienne clé orpheline dans EN', OLD_KEYS.every(k => !(k in en)));
  ok('6.4 aucune ancienne clé orpheline dans PT', OLD_KEYS.every(k => !(k in pt)));
  // balayage : chaque fragment texte des hints retravaillés traduits (tous sauf la basse,
  // non traduite avant 0.6.7 — limite C10 connue, à résorber en 0.6.9) est dans EN et PT.
  const PUNCT = /^[\s).·\/.]*$/;
  const reworked = ['#secPerc', '#secClave', '#secGap', '#secArchet', '#secRepertoire', '#secTeam'];
  const missing = [];
  reworked.forEach(sel => {
    D.querySelectorAll(sel + ' .hint-more').forEach(dm => {
      const hint = dm.closest('.hint');
      const walker = D.createTreeWalker(hint, W.NodeFilter.SHOW_TEXT, null);
      let n;
      while ((n = walker.nextNode())) {
        const f = norm(n.nodeValue);
        if (!f || PUNCT.test(f)) continue;
        if (!en[f] || !pt[f]) missing.push(sel + ' → ' + f.slice(0, 60));
      }
    });
  });
  ok('6.5 fragments des hints retravaillés tous traduits (EN et PT, hors basse)', missing.length === 0);
  if (missing.length) missing.forEach(m => console.log('     ! ' + m));

  console.log('\n--- onboarding 0.6.7 : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---\n');
  process.exit(FAIL ? 1 : 0);
}

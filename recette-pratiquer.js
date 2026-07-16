/* recette-pratiquer.js — R-3b : pratiquer.html (scénario 3, pratique libre).
   Headless jsdom, mêmes stubs que les suites P-* (Web Audio / canvas).
   Vérifie (spec R-3 §4) :
     A. chargement propre + hiérarchie J1 : trois blocs « Ce que je joue » /
        « Ce qui m'accompagne » / « Le clic », sections à leur place, sélecteur
        d'instrument UNIQUE, re-libellé « Accompagnement rendu à » ;
     B. surfaces index-only absentes du visible (stubs inertes #fmStubs) +
        contrat de coquille R-3a rempli (IDs fm-audio / fm-accomp) ;
     C. mute maître (J2) : coupe perc + bass, épargne le clic, superposé
        (n'écrase aucun réglage), non persisté, rappel transport synchrone ;
     D. feel basse (§5) : curseur −25…+25 ms, borné, persisté avec S.bass,
        offMs porté par la couche bass seule, IDENTITÉ STRICTE à 0 ;
     E. le répertoire fonctionne sans l'UI team (chargement d'un groove).
   Usage : node recette-pratiquer.js [chemin/pratiquer.html]  (défaut ./pratiquer.html) */
'use strict';
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
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
const ev = (el, type) => el.dispatchEvent(new W.Event(type, { bubbles: true }));
const g = expr => W.eval(expr);   // accès aux bindings lexicaux (const/let) de la portée globale partagée

setTimeout(runTests, 80);

function runTests() {
  /* ---------- A. chargement + hiérarchie J1 ---------- */
  ok('chargement sans erreur jsdom (' + jsdomErrors.length + ')', jsdomErrors.length === 0);
  ok('BUILD 0.12.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.12.0');
  ok('GROOVES assemblés depuis FM_GROOVES (31)', g('GROOVES.length') === 31 && Object.keys(W.FM_GROOVES || {}).length === 6);
  const b1 = $('blocJoue'), b2 = $('blocAccomp'), b3 = $('blocClic');
  ok('les trois blocs J1 présents', !!(b1 && b2 && b3));
  ok('ordre des blocs : je joue → accompagne → clic',
    !!(b1 && b2 && b3) && !!(b1.compareDocumentPosition(b2) & 4) && !!(b2.compareDocumentPosition(b3) & 4));
  ok('« Ce que je joue » porte secPerc (l\'unique sélecteur d\'instrument)', !!D.querySelector('#blocJoue #secPerc #percInstr'));
  ok('« Ce qui m\'accompagne » porte basse + claves + répertoire',
    ['secBass', 'secClave', 'secRepertoire'].every(id => !!D.querySelector('#blocAccomp #' + id)));
  ok('« Le clic » porte groove + horloge + son + routine',
    ['secGroove', 'secGap', 'secSon', 'secScript'].every(id => !!D.querySelector('#blocClic #' + id)));
  ok('sélecteur d\'instrument UNIQUE dans la page (percInstr hors stubs)',
    D.querySelectorAll('#percInstr').length === 1 && !D.querySelector('#fmStubs #percInstr'));
  const lblOverride = D.querySelector('label[for="tsOverride"]');
  ok('« Jouer tout à » re-libellé : instrument de RENDU de l\'accompagnement',
    !!lblOverride && /Accompagnement rendu à/.test(lblOverride.textContent));
  ok('mute maître en tête du bloc 2 + rappel transport',
    !!D.querySelector('#blocAccomp .bloc-head #accompMuteBtn') && !!$('accompMuteBtn2') && !D.querySelector('#blocAccomp #accompMuteBtn2'));
  ok('lien retour vers l\'accueil (index.html)', !!D.querySelector('header a[href="index.html"]'));
  ok('pas de mode simple sur cette page', !D.body.classList.contains('mode-simple'));

  /* ---------- B. stubs inertes + contrat de coquille ---------- */
  ok('surfaces index-only inertes : team, archet, cours, écran de jeu, wizard dans #fmStubs caché',
    ['secTeam', 'secArchet', 'secCours', 'playScreen', 'wizOverlay', 'playSetup', 'bowFs']
      .every(id => !!D.querySelector('#fmStubs[hidden] #' + id)));
  ok('bibliothèque partagée + compte ABSENTS (restent sur index.html)',
    !$('secBiblio') && !$('btnAccount') && !$('biblioList'));
  ok('sommaire (C6) sans chips vers les surfaces index-only',
    !D.querySelector('#tocBar [data-toc="secTeam"]') && !D.querySelector('#tocBar [data-toc="secArchet"]') &&
    !D.querySelector('#tocBar [data-toc="secCours"]') && !!D.querySelector('#tocBar [data-toc="secRepertoire"]'));
  ok('contrat fm-audio : startBtn, statusLine, percFsPlay fournis (visibles)',
    !!$('startBtn') && !!$('statusLine') && !!$('percFsPlay') && !D.querySelector('#fmStubs #startBtn'));
  const IDS_ACCOMP = ['bassOn','bassPattern','bassKey','bassProg','bassChord','bassDensity','bassVel','bassVary',
    'bassLegato','bassSpace','bassDropOn','bassDropEvery','bassDropLen','bassSwingFollow',
    'playBassOn','playBassChord','playBassDensity','playBassDrop','playBassGroup','gapTarget','gapCrossed'];
  ok('contrat fm-accomp : les 21 IDs fournis (panneau play* en stub inerte)',
    IDS_ACCOMP.every(id => !!$(id)));
  ok('plein écran percussion + atelier restent utilisables (hors stubs)',
    !!$('percFs') && !!$('atelierFs') && !D.querySelector('#fmStubs #percFs') && !D.querySelector('#fmStubs #atelierFs'));

  /* ---------- C. mute maître (J2) ---------- */
  ok('au chargement : accompagnement actif, aria-pressed=false',
    g('accompMuted') === false && $('accompMuteBtn').getAttribute('aria-pressed') === 'false');
  // espions sur les timbres (bindings de fonction globaux, réassignables depuis le harnais)
  W.eval(`window.__spy = { perc: 0, bass: 0, clic: 0 };
    const _pp = playPerc, _pb = playBass, _pt = playTone;
    playPerc = function () { window.__spy.perc++; };
    playBass = function () { window.__spy.bass++; };
    playTone = function () { window.__spy.clic++; };`);
  const spy = () => W.__spy;
  const clic = (layer, note) => W.eval('playClick(0, ' + JSON.stringify(layer) + ', 1, "v1", false' + (note ? ', { freq: 82 }' : '') + ')');
  clic('perc'); clic('bass', true); clic('beat');
  ok('témoin : sans mute, perc + bass + clic sonnent', spy().perc === 1 && spy().bass === 1 && spy().clic === 1);
  // réglages posés AVANT le mute — ils doivent rester intacts
  W.eval('S.bass.on = true; percMuted["v-temoin"] = true;');
  $('accompMuteBtn').click();
  ok('un geste : accompMuted, les deux boutons aria-pressed=true',
    g('accompMuted') === true && $('accompMuteBtn').getAttribute('aria-pressed') === 'true' &&
    $('accompMuteBtn2').getAttribute('aria-pressed') === 'true' && /coupé/.test($('accompMuteBtn').textContent));
  clic('perc'); clic('bass', true); clic('beat');
  ok('mute maître : perc et bass COUPÉS, le clic CONTINUE', spy().perc === 1 && spy().bass === 1 && spy().clic === 2);
  ok('superposé : S.bass.on et les mutes de voix ne sont PAS écrasés',
    g('S.bass.on') === true && g('percMuted["v-temoin"]') === true);
  $('accompMuteBtn2').click();   // le rappel transport lève aussi le mute
  clic('perc'); clic('bass', true);
  ok('levé (par le rappel transport) : l\'accompagnement revient tel quel',
    g('accompMuted') === false && spy().perc === 2 && spy().bass === 2 &&
    g('S.bass.on') === true && g('percMuted["v-temoin"]') === true);
  ok('drapeau de session : rien de persisté (aucune clé accomp dans le store)',
    (() => { try { for (let i = 0; i < W.localStorage.length; i++) if (/accomp/i.test(W.localStorage.key(i))) return false; return true; } catch (e) { return true; } })());
  W.eval('S.bass.on = false; delete percMuted["v-temoin"];');   // remise au propre

  /* ---------- D. feel basse (§5) ---------- */
  const feel = $('bassFeel');
  ok('curseur feel dans la section basse : −25…+25, défaut 0',
    !!D.querySelector('#blocAccomp #secBass #bassFeel') && feel.min === '-25' && feel.max === '25' && feel.value === '0');
  ok('défaut : S.bass.feelMs === 0 (identité par construction)', g('S.bass.feelMs') === 0);
  // événements du cycle : offMs porté par la couche bass seule
  const evts = f => W.eval(`S.bass.on = true; S.family = 'bin'; S.bass.feelMs = ${f};
    bassResetCycle(); computeCycle();
    JSON.stringify(events.map(e => ({ layer: e.layer, frac: e.frac, offMs: e.offMs })))`);
  const at0 = JSON.parse(evts(0)), at8 = JSON.parse(evts(8)), atM25 = JSON.parse(evts(-25));
  const bass0 = at0.filter(e => e.layer === 'bass'), bass8 = at8.filter(e => e.layer === 'bass'), bassM = atM25.filter(e => e.layer === 'bass');
  ok('la couche bass porte des notes (' + bass0.length + ')', bass0.length > 0);
  ok('à 0 : offMs vaut STRICTEMENT 0 sur toute la couche bass (chemin identique)',
    bass0.every(e => e.offMs === 0));
  ok('à +8 ms : offMs = 8 sur toute la couche bass', bass8.every(e => e.offMs === 8) && bass8.length === bass0.length);
  ok('à −25 ms : offMs = −25 (posé, borne basse)', bassM.every(e => e.offMs === -25));
  ok('le feel ne touche JAMAIS la réalisation : mêmes fracs à 0, +8 et −25',
    JSON.stringify(bass0.map(e => e.frac)) === JSON.stringify(bass8.map(e => e.frac)) &&
    JSON.stringify(bass0.map(e => e.frac)) === JSON.stringify(bassM.map(e => e.frac)));
  ok('les autres couches ne portent pas le feel (beat/sub sans offMs)',
    at8.filter(e => e.layer === 'beat' || e.layer === 'sub').every(e => e.offMs === undefined));
  W.eval('S.bass.on = false; S.bass.feelMs = 0;');
  // UI : bornes, affichage, persistance
  W.eval('setBassFeel(99)');
  ok('borné : setBassFeel(99) → +25, affiché « +25 ms »', g('S.bass.feelMs') === 25 && $('bassFeelVal').textContent === '+25 ms');
  W.eval('setBassFeel(-99)');
  ok('borné : setBassFeel(−99) → −25', g('S.bass.feelMs') === -25 && feel.value === '-25');
  feel.value = '12'; ev(feel, 'input');
  ok('curseur → S.bass.feelMs = 12, persisté avec les réglages basse (fm-metro-bass)',
    g('S.bass.feelMs') === 12 && (() => { try { return JSON.parse(W.localStorage.getItem('fm-metro-bass')).feelMs === 12; } catch (e) { return false; } })());
  $('bassFeelMinus').click();
  ok('boutons ±1 ms opérants (12 → 11)', g('S.bass.feelMs') === 11);
  W.eval('setBassFeel(0)');

  /* ---------- E. le répertoire vit sans l'UI team ---------- */
  ok('répertoire : 6 familles, grooves de la famille affichée listés',
    $('tsFamily').options.length === 6 && $('tsGroove').options.length === 5);
  ok('« Accompagnement rendu à » : authentique + instruments du moteur', $('tsOverride').options.length >= 6);
  $('tsLoad').click();
  ok('charger un groove : voix ts.* dans l\'état moteur, statut affiché',
    g('Object.keys(percGrids).some(k => k.indexOf("ts.") === 0)') === true && /chargé/.test($('tsStatus').textContent));
  $('tsUnload').click();
  ok('décharger : les voix ts.* quittent l\'état moteur',
    g('Object.keys(percGrids).every(k => k.indexOf("ts.") !== 0)') === true);

  console.log(`\n--- pratiquer (R-3b) : ${PASS} vertes, ${FAIL} rouges (total ${PASS + FAIL}) ---`);
  process.exit(FAIL ? 1 : 0);
}

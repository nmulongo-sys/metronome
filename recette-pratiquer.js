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

// R-5 : stubs factorisés — réutilisés par le second DOM du test hash-open (section H)
function stubs(w) {
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
    // R-5 (C2) : jsdom n'implémente pas scrollIntoView — le hash-open l'appelle à l'arrivée
    if (w.HTMLElement) w.HTMLElement.prototype.scrollIntoView = w.HTMLElement.prototype.scrollIntoView || function () {};
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc,
  beforeParse: stubs
});

const W = dom.window, D = W.document;
const $ = id => D.getElementById(id);
const ev = (el, type) => el.dispatchEvent(new W.Event(type, { bubbles: true }));
const g = expr => W.eval(expr);   // accès aux bindings lexicaux (const/let) de la portée globale partagée
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const txt = el => norm(el ? el.textContent : '');

setTimeout(runTests, 80);

function runTests() {
  /* ---------- A. chargement + hiérarchie J1 ---------- */
  ok('chargement sans erreur jsdom (' + jsdomErrors.length + ')', jsdomErrors.length === 0);
  ok('BUILD 0.27.0 (' + g('BUILD') + ')', g('BUILD') === 'metronomefunk-0.27.0');   // la ligne vivante suit le build
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

  /* ---------- B. dissolution R-4b : stubs au strict contrat, surfaces migrées ----------
     v R-4b (spec R-4 §4.2) : la duplication transitoire R-3b est dissoute — écran de
     jeu, wizard, DSL et « je joue » sont RETIRÉS de l'application ; l'archet vit sur
     index.html, le parcours sur apprendre.html ; Team Spirit et la bibliothèque (avec
     le compte partagé) deviennent des surfaces VISIBLES de cette page. */
  ok('R-4b : #fmStubs vidé — le contrat moteur est rempli par de vrais éléments',
    !!D.querySelector('#fmStubs[hidden]') && D.querySelectorAll('#fmStubs > *').length === 0);
  ok('R-4b : surfaces retirées absentes du DOM (écran de jeu, wizard, « je joue », archet, cours)',
    ['playScreen', 'wizOverlay', 'playSetup', 'secArchet', 'bowFs', 'secCours', 'onboardBanner', 'wizardBtn']
      .every(id => !$(id)));
  ok('R-4b : Team Spirit VISIBLE au bloc 2 (avec le répertoire qu\'il répartit)',
    !!D.querySelector('#blocAccomp #secTeam #tsOn') && !D.querySelector('#fmStubs #secTeam'));
  ok('R-4b : bibliothèque partagée + compte PRÉSENTS (migrés avec la coquille fm-compte)',
    !!D.querySelector('#blocClic #secBiblio #biblioList') && !!$('btnAccount') && !!$('acctCard') && !!$('biblioTitre'));
  ok('R-4b : sommaire (C6) avec chips Team Spirit et Bibliothèque, sans chips archet/cours',
    !!D.querySelector('#tocBar [data-toc="secTeam"]') && !!D.querySelector('#tocBar [data-toc="secBiblio"]') &&
    !D.querySelector('#tocBar [data-toc="secArchet"]') && !D.querySelector('#tocBar [data-toc="secCours"]') &&
    !!D.querySelector('#tocBar [data-toc="secRepertoire"]'));
  ok('contrat fm-audio : startBtn, statusLine, percFsPlay fournis (visibles)',
    !!$('startBtn') && !!$('statusLine') && !!$('percFsPlay') && !D.querySelector('#fmStubs #startBtn'));
  // v R-4b : le panneau play* n'existe plus NULLE PART — le moteur sort par sa garde
  // (bassPlayRefresh teste playBassOn) ; le reste du contrat est porté par secBass/secGap.
  const IDS_ACCOMP = ['bassOn','bassPattern','bassKey','bassProg','bassChord','bassDensity','bassVel','bassVary',
    'bassLegato','bassSpace','bassDropOn','bassDropEvery','bassDropLen','bassSwingFollow','gapTarget','gapCrossed'];
  ok('contrat fm-accomp : les 16 IDs vivants fournis, play* absents et sans crash (garde du moteur)',
    IDS_ACCOMP.every(id => !!$(id)) && !$('playBassOn') && !$('playBassGroup') &&
    (() => { try { W.eval('bassPlayRefresh()'); return true; } catch (e) { return false; } })());
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

  /* ---------- F. R-4b : Team Spirit sur pratiquer × mute maître × répertoire ---------- */
  $('tsLoad').click();
  const tsVoice = g('Object.keys(percGrids).find(k => k.indexOf("ts.") === 0)');
  ok('R-4b : groove rechargé, une voix ts.* de référence en main', typeof tsVoice === 'string');
  $('tsOn').click();
  ok('R-4b : mode team spirit actif depuis la section visible', g('TS.on') === true);
  $('tsAddPart').click();
  ok('R-4b : + Participant crée une carte (la mécanique index vit ici)',
    D.querySelectorAll('#tsParticipants .ts-part').length >= 1);
  // R-6 : passerelle « ▶ Jouer en équipe » — le bouton existe et la config produite
  // est décodable par le codec partagé coquille/fm-equipe.js (aller-retour fidèle).
  ok('R-6 : codec fm-equipe chargé sur pratiquer (window.fmEquipe)', g('typeof window.fmEquipe') === 'object');
  ok('R-6 : bouton « ▶ Jouer en équipe » présent dans Team Spirit',
    !!$('tsPlayTeam') && /Jouer en équipe/.test($('tsPlayTeam').textContent));
  ok('R-6 : tsEquipeConfig() encode la répartition, décodable via le codec (aller-retour)',
    g('(function(){ var c = tsEquipeConfig(); var d = window.fmEquipe.decode(window.fmEquipe.encode(c)); ' +
      'return !!d && Array.isArray(d.voix) && d.voix.length === c.voix.length && Array.isArray(d.voix[0].g) && d.tempo === c.tempo; })()') === true);
  // mute maître × voix ts : patron percLayerMuted — la couche perc passe par playClick
  W.eval(`window.__spyTs = 0;
    const _ppTs = playPerc;
    playPerc = function () { window.__spyTs++; };
    playClick(0, 'perc', 1, ${JSON.stringify('__TSV__')}, false);
    playPerc = _ppTs;`.replace('__TSV__', tsVoice));
  ok('R-4b : sans mute maître, la voix ts sonne (témoin)', W.__spyTs === 1);
  $('accompMuteBtn').click();
  W.eval(`window.__spyTs = 0;
    const _ppTs = playPerc;
    playPerc = function () { window.__spyTs++; };
    playClick(0, 'perc', 1, ${JSON.stringify('__TSV__')}, false);
    playPerc = _ppTs;`.replace('__TSV__', tsVoice));
  ok('R-4b : mute maître ENFONCÉ → la voix ts est coupée (patron percLayerMuted)', W.__spyTs === 0);
  $('accompMuteBtn').click();
  W.eval(`window.__spyTs = 0;
    const _ppTs = playPerc;
    playPerc = function () { window.__spyTs++; };
    playClick(0, 'perc', 1, ${JSON.stringify('__TSV__')}, false);
    playPerc = _ppTs;`.replace('__TSV__', tsVoice));
  ok('R-4b : mute maître levé → la voix ts revient telle quelle', W.__spyTs === 1);
  $('tsOn').click();
  $('tsUnload').click();

  /* ---------- G. R-4b : bibliothèque partagée branchée (Supabase absent = repli propre) ---------- */
  $('btnBiblioRefresh').click();   // loadBiblio() : le repli « client indisponible » est synchrone
  ok('R-4b : « Charger la bibliothèque » câblé — sans client Supabase, repli propre affiché',
    /Supabase indisponible/.test($('biblioFb').textContent));
  ok('R-4b : « Publier la routine » câblé (title dynamique posé par le bloc biblio)',
    ($('btnBiblioPublish').getAttribute('title') || '').length > 10);

  /* ---------- I. Salve R-5 P1 (M2 + M3) ---------- */
  // P1-a (M2) : bandeau « par où commencer ? » — présent, visible au premier chargement,
  // masquable (persisté). Le bouton pose un accompagnement de base + démarre.
  const guide = $('guideAccueil');
  ok('P1-a (M2) : bandeau « par où commencer ? » présent, visible au 1er chargement',
    !!guide && guide.hidden === false && !!$('btnGuidePreset') && !!$('btnGuideClose') &&
    /Par où commencer/.test(txt(guide)));
  $('btnGuidePreset').click();
  ok('P1-a : le preset pose djembé + groove de base (percOn coché, une voix a des frappes)',
    g('S.perc.on') === true && $('percOn').checked === true && g('S.perc.instr') === 'djembe' &&
    Object.keys(g('percGrids')).some(k => (g('percGrids')[k] || []).some(x => x > 0)));
  ok('P1-a : le preset ouvre la section Percussion et lance la lecture',
    $('secPerc').open === true && g('isPlaying') === true);
  g('stop()');
  $('btnGuideClose').click();
  ok('P1-a : le × masque le bandeau et persiste (fm-metro-pratiquer-guide=off)',
    guide.hidden === true && W.localStorage.getItem('fm-metro-pratiquer-guide') === 'off');
  // P1-b (M3) : la modale de compte gagne le jeu de clés COMPLET (identique à apprendre)
  {
    const EN = W.__I18N.en, PT = W.__I18N.pt;
    const COMPTE = ['ton@email.fr', 'Annuler', 'Envoyer le lien', 'Entre une adresse e-mail valide.',
      'Connexion au serveur impossible (réseau ?).', 'Envoi…', 'Vérifie tes e-mails',
      'Un lien de connexion a été envoyé à', '. Ouvre-le sur cet appareil pour te connecter.',
      'Fermer', 'Ton pseudo', 'Le nom affiché à côté des routines que tu partageras.', 'ex. Naomi',
      'Enregistrer', 'Enregistrement…', 'Choisis un pseudo (ou « Plus tard »).', 'Connecté',
      'Connecté comme', 'Changer de pseudo', 'Choisir un pseudo'];
    ok('P1-b (M3) : les 20 clés de la modale de compte présentes EN et PT (symétrie)',
      COMPTE.every(k => EN[k] && PT[k]));
    ok('P1-b : symétrie globale conservée (0 clé orpheline après ajout)',
      Object.keys(EN).every(k => k in PT) && Object.keys(PT).every(k => k in EN));
  }

  /* ---------- H. R-5 (C2) hash-open + P1-b rendu réel de la modale en PT ---------- */
  // Deux seconds DOM : (1) #secTeam pour le lien profond ; (2) ?lang=pt pour vérifier
  // que la modale de compte s'AFFICHE traduite (rendu réel, pas seulement le dico).
  {
    const vc2 = new VirtualConsole(); vc2.on('jsdomError', () => {});
    const dom2 = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
      url: 'http://localhost/pratiquer.html#secTeam', virtualConsole: vc2, beforeParse: stubs });
    const vc3 = new VirtualConsole(); vc3.on('jsdomError', () => {});
    const dom3 = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
      url: 'http://localhost/pratiquer.html?lang=pt', virtualConsole: vc3, beforeParse: stubs });
    setTimeout(() => {
      const D2 = dom2.window.document;
      ok('R-5 (C2) : arrivée avec #secTeam → la section Team Spirit est OUVERTE (lien profond de la porte)',
        D2.getElementById('secTeam').open === true);
      ok('R-5 (C2) : seule la cible s\'ouvre — les autres sections restent fermées',
        D2.getElementById('secPerc').open === false && D2.getElementById('secBass').open === false);
      // P1-b : rendu réel — ouvrir la modale en PT, le marcheur traduit les nœuds insérés
      const W3 = dom3.window, D3 = W3.document;
      D3.getElementById('btnAccount').dispatchEvent(new W3.MouseEvent('click', { bubbles: true }));
      setTimeout(() => {
        const body = norm(D3.getElementById('acctBody').textContent);
        const btns = [...D3.querySelectorAll('#acctBody button')].map(b => norm(b.textContent));
        ok('P1-b (M3) : modale ouverte en PT → « Enviar o link » et « Cancelar » (plus de FR)',
          btns.some(b => /Enviar o link/.test(b)) && btns.some(b => /Cancelar/.test(b)) &&
          !/Envoyer le lien|Annuler/.test(body));
        // R-5 salve P2 : M4 — sous-titres des tiroirs francisés (« groove » compris)
        const p2subs = Array.from(D.querySelectorAll('.sec-sub')).map(e => norm(e.textContent)).join(' || ');
        ok('P2-M4.1 anglicismes retirés des sous-titres (script / Supabase / export / groove)',
          !/\bscript\b/i.test(p2subs) && !/Supabase/.test(p2subs) && !/·\s*export\b/.test(p2subs) && !/\bgroove\b/i.test(p2subs));
        ok('P2-M4.2 sous-titres FR posés (routine / en ligne / à exporter / rythme)',
          /écrire la routine pas à pas/.test(p2subs) && /routines · en ligne/.test(p2subs) &&
          /solo\/muet · à exporter/.test(p2subs) && /rythme · variations/.test(p2subs));
        console.log(`\n--- pratiquer (R-3b→R-4b, +R-5 P1) : ${PASS} vertes, ${FAIL} rouges (total ${PASS + FAIL}) ---`);
        process.exit(FAIL ? 1 : 0);
      }, 200);
    }, 300);
  }
}

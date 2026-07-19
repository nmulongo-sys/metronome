/* ============================================================================
   Recette « axe style » (C6) — l'AXE, pas le contenu.

   C6 ouvre apprendre.html à plusieurs styles alors que le moteur donne un niveau
   à UN SEUL corpus (moteur/fm-etat.js:34-38, verbatim, md5 == 0.10.0). Le
   contournement — clés de niveaux préfixées par meta.id, champ « style » sur
   chaque module, socle laissé volontairement nu — n'est sûr que si trois choses
   restent vraies, et c'est ce que cette suite fait tenir :
     A. le contrat de l'axe dans les données (clés disjointes, style == meta.id,
        aucune collision possible avec les 4 niveaux pré-déclarés par FM_ASM) ;
     B. ce que recette-demo.js ne couvre PAS — cette suite-là charge ses deux
        corpus EN DUR (recette-demo.js:30, procès-verbal des lots R-4a/R-4c) :
        les démos brésiliennes n'y passent jamais, elles sont vérifiées ici ;
     C. l'axe rendu dans la page : sélecteur, filtrage, persistance, socle
        visible sous chaque style, et surtout NON-RÉGRESSION du funk (mêmes ID
        de module → les acquis des utilisateurs survivent à la migration).

   Usage : node recette-styles.js [chemin/apprendre.html]   (défaut ./apprendre.html)
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let PASS = 0, FAIL = 0;
const ok = (name, cond) => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name); } };
const eq = (name, got, exp) => ok(name + (got === exp ? '' : ' — attendu ' + JSON.stringify(exp) + ', obtenu ' + JSON.stringify(got)), got === exp);

// ---- chargement des corpus (sandbox : un faux window, patron recette-corpus) ----
const dir = path.join(__dirname, 'corpus');
const corpusFiles = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !f.startsWith('i18n-')).sort();
const window = {};
for (const f of corpusFiles) eval(fs.readFileSync(path.join(dir, f), 'utf-8'));
const CORPUS = window.FM_CORPUS || {};

// Les 4 niveaux que FM_ASM PRÉ-DÉCLARE (fm-etat.js:19) : ce sont les seules clés
// pour lesquelles out.niveaux[niv] est déjà un tableau, donc les seules où la garde
// de collision peut se déclencher. Toute clé de style doit rester en dehors.
const NIVEAUX_MOTEUR = ['debutant', 'intermediaire', 'avance', 'artiste'];
const styles = Object.keys(CORPUS).filter(cid => !(CORPUS[cid].meta || {}).socle);
const socles = Object.keys(CORPUS).filter(cid => (CORPUS[cid].meta || {}).socle);

console.log('corpus : ' + Object.keys(CORPUS).join(', ') + '  |  styles : ' + styles.join(', ') + '  |  socle : ' + socles.join(', '));

// ============================================================================
console.log('\nA. contrat de l\'axe (données)');
// ============================================================================

ok('A.1 au moins deux styles déclarés (l\'axe a un sens)', styles.length >= 2);

let prefOk = true, prefDetail = '';
for (const cid of styles)
  for (const niv of Object.keys(CORPUS[cid].niveaux || {})) {
    const sep = niv.indexOf(':');
    if (sep < 0 || niv.slice(0, sep) !== cid || NIVEAUX_MOTEUR.indexOf(niv.slice(sep + 1)) < 0) {
      prefOk = false; prefDetail = niv + ' (corpus ' + cid + ')';
    }
  }
ok('A.2 tout corpus de style préfixe ses clés de niveaux par son meta.id' + (prefDetail ? ' — fautive : ' + prefDetail : ''), prefOk);

let nuOk = true;
for (const cid of socles)
  for (const niv of Object.keys(CORPUS[cid].niveaux || {}))
    if (niv.indexOf(':') >= 0 || NIVEAUX_MOTEUR.indexOf(niv) < 0) nuOk = false;
ok('A.3 le socle garde ses clés NUES (c\'est ce qui le rend visible sous tous les styles)', nuOk);

// la garde de fm-etat.js:36 ne peut se déclencher que sur une clé déjà remplie :
// aucune clé de style ne doit tomber dans les 4 pré-déclarées.
let horsMoteur = true;
for (const cid of styles)
  for (const niv of Object.keys(CORPUS[cid].niveaux || {}))
    if (NIVEAUX_MOTEUR.indexOf(niv) >= 0) horsMoteur = false;
ok('A.4 aucune clé de style ne retombe sur une clé pré-déclarée par FM_ASM (la garde ne peut pas se déclencher)', horsMoteur);

// deux à deux disjoints : c'est la preuve directe qu'aucune collision n'est possible
let disjoints = true, collision = '';
const vues = {};
for (const cid of Object.keys(CORPUS))
  for (const niv of Object.keys(CORPUS[cid].niveaux || {})) {
    if (!(CORPUS[cid].niveaux[niv] || []).length) continue;   // FM_ASM ignore les vides
    if (vues[niv]) { disjoints = false; collision = niv + ' (' + vues[niv] + ' et ' + cid + ')'; }
    vues[niv] = cid;
  }
ok('A.5 les clés de niveaux non vides sont deux à deux disjointes entre corpus' + (collision ? ' — collision : ' + collision : ''), disjoints);

let styleOk = true, styleDetail = '';
for (const cid of styles)
  for (const mid of Object.keys(CORPUS[cid].modules || {}))
    if (CORPUS[cid].modules[mid].style !== cid) { styleOk = false; styleDetail = mid; }
ok('A.6 tout module d\'un corpus de style porte style === meta.id' + (styleDetail ? ' — fautif : ' + styleDetail : ''), styleOk);

let socleSansStyle = true;
for (const cid of socles)
  for (const mid of Object.keys(CORPUS[cid].modules || {}))
    if (CORPUS[cid].modules[mid].style !== undefined) socleSansStyle = false;
ok('A.7 aucun module du socle ne porte de style (absence volontaire, pas un oubli)', socleSansStyle);

// code déclaré ⇆ modules, dans les deux sens, avec la clé COMPOSÉE
let ordreOk = true, ordreDetail = '';
for (const cid of Object.keys(CORPUS)) {
  const c = CORPUS[cid], mods = c.modules || {};
  const cle = m => (m.style ? m.style + ':' : '') + m.niveau;
  const codes = new Set(Object.keys(mods).map(id => id.split('-').pop()));
  for (const niv of Object.keys(c.niveaux || {}))
    for (const code of c.niveaux[niv] || [])
      if (!codes.has(code)) { ordreOk = false; ordreDetail = 'code ' + code + ' déclaré sans module (' + cid + ')'; }
  for (const mid of Object.keys(mods))
    if ((c.niveaux[cle(mods[mid])] || []).indexOf(mid.split('-').pop()) < 0) {
      ordreOk = false; ordreDetail = 'module ' + mid + ' non ordonnancé';
    }
}
ok('A.8 code déclaré ⇆ module, dans les deux sens, via la clé composée' + (ordreDetail ? ' — ' + ordreDetail : ''), ordreOk);

// les acquis sont stockés en « parcours|exercice », SANS segment de style : l'unicité
// globale des ID d'exercice est donc ce qui garantit qu'aucun acquis ne se télescope.
let exUniq = true, exDoublon = '';
const vusEx = {};
for (const cid of Object.keys(CORPUS))
  for (const id of Object.keys(CORPUS[cid].exercices || {})) {
    if (vusEx[id]) { exUniq = false; exDoublon = id; }
    vusEx[id] = cid;
  }
ok('A.9 ID d\'exercice uniques sur TOUS les corpus (les acquis « parcours|exercice » ne se télescopent pas)' +
  (exDoublon ? ' — doublon : ' + exDoublon : ''), exUniq);

// ============================================================================
console.log('\nB. le corpus brésilien — ce que recette-demo.js ne couvre pas');
// ============================================================================
// recette-demo.js:30 charge socle-technique + funk EN DUR : les démos de bresil
// n'y passent jamais. Les mêmes exigences sont donc rejouées ici, sur ce corpus.

const BR = CORPUS.bresil;
ok('B.0 le corpus « bresil » est chargé', !!BR);

const VOIX_MOTEUR = { cajon: ['grave', 'aigu'], djembe: ['basse', 'tone', 'slap'] };
const exsBR = (BR && BR.exercices) || {};

let voixOk = true, voixDetail = '';
for (const id of Object.keys(exsBR)) {
  const d = exsBR[id].demo; if (!d) continue;
  const admises = VOIX_MOTEUR[d.instr];
  if (!admises) { voixOk = false; voixDetail = id + ' : instrument « ' + d.instr + ' » inconnu'; continue; }
  for (const v of Object.keys(d.voix))
    if (admises.indexOf(v) < 0) { voixOk = false; voixDetail = id + ' : voix « ' + v + ' » absente de ' + d.instr; }
}
ok('B.1 toute démo n\'emploie que des voix réellement rendues par son instrument' + (voixDetail ? ' — ' + voixDetail : ''), voixOk);

let grilleOk = true, grilleDetail = '';
for (const id of Object.keys(exsBR)) {
  const d = exsBR[id].demo; if (!d) continue;
  if (d.steps !== 16) { grilleOk = false; grilleDetail = id + ' : steps=' + d.steps; }
  for (const v of Object.keys(d.voix)) {
    const g = d.voix[v];
    if (!Array.isArray(g) || g.length !== 16 || !g.every(x => x === 0 || x === 1 || x === 2)) {
      grilleOk = false; grilleDetail = id + ' / ' + v;
    }
  }
}
ok('B.2 toutes les grilles font 16 pas, valeurs dans {0,1,2} (conversion X->2 · x->1 · .->0)' + (grilleDetail ? ' — ' + grilleDetail : ''), grilleOk);

// liste fermée, comme recette-demo.js : le SEUL exercice sans démo est celui dont la
// source refuse explicitement de fixer la grille (position du tapa du partido alto).
const SANS_DEMO_BR = ['EX-BR-PAR-03'];
const sansBR = Object.keys(exsBR).filter(id => exsBR[id].demo === undefined).sort();
ok('B.3 le seul exercice sans démo est celui que la source refuse de fixer (' + SANS_DEMO_BR.join(', ') + ') — trouvé [' + sansBR.join(', ') + ']',
  JSON.stringify(sansBR) === JSON.stringify(SANS_DEMO_BR));
eq('B.4 démos brésiliennes : 44 sur 45 exercices', Object.keys(exsBR).length - sansBR.length, 44);

// fidélité ponctuelle : les cellules identitaires, relues sur la source
// (corpus-rythmes-bresiliens-vol2.md v1.1, fiches 9, 3, 1, 5, 8, 6).
const grille = (id, voix) => { const d = exsBR[id] && exsBR[id].demo; return d && d.voix[voix] ? d.voix[voix].join('') : null; };
eq('B.5 ciranda : grave fort sur 1, étouffés sur 2-3-4 (fiche 9, sourcée)', grille('EX-BR-CIR-03', 'grave'), '2000100010001000');
eq('B.6 arrasta-pé : grave sur chaque temps (fiche 3)', grille('EX-BR-ARR-03', 'grave'), '2000200020002000');
eq('B.7 arrasta-pé : bacalhau en contretemps continu (fiche 3)', grille('EX-BR-ARR-03', 'aigu'), '0010001000100010');
eq('B.8 xote : grave 1, anticipation du « & de 2 », appui sur 3 (fiche 1)', grille('EX-BR-XOT-04', 'grave'), '2000001010000000');
eq('B.9 xote : bacalhau sur les contretemps 2 et 4 (fiche 1)', grille('EX-BR-XOT-04', 'aigu'), '0000200000002000');
eq('B.10 bossa : kick 1, &2, 3, &4 (fiche 5, grille v1.0 conservée)', grille('EX-BR-BOS-03', 'grave'), '2001200120012001');
eq('B.11 bossa : cross-stick, 5e frappe au pas 13 et non 14 (arbitrage explicite de la source)', grille('EX-BR-BOS-03', 'aigu'), '2002002000202000');
eq('B.12 coco : zabumba appui 1 + relance, trupé claqué sur 2 (fiche 8)', grille('EX-BR-COC-03', 'grave'), '2000001020000000');
eq('B.13 partido alto : palmas 3-3-2, la couche sourcée du dossiê IPHAN (fiche 6)', grille('EX-BR-PAL-01', 'slap'), '2002002020020020');

// le swing du xote est porté par la DÉMO, jamais par l'état global (même règle que R-4a)
const xotSwing = Object.keys(exsBR).filter(id => exsBR[id].demo && exsBR[id].demo.swing !== undefined);
ok('B.14 le balancement du xote est porté par la démo (swing), sur les 3 exercices où il vit — trouvé ' + xotSwing.length,
  xotSwing.length === 3 && xotSwing.every(id => id.indexOf('EX-BR-XOT-') === 0 &&
    exsBR[id].demo.swing >= 50 && exsBR[id].demo.swing <= 85));

// ============================================================================
console.log('\nC. l\'axe rendu dans la page');
// ============================================================================

const FILE = process.argv[2] || path.join(__dirname, 'apprendre.html');
const html = require('./recette-harnais').chargeHtml(FILE);

function canvasCtx() {
  return new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 0 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: [] });
    if (k === 'canvas') return { width: 300, height: 150 };
    return () => {};
  }});
}
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

const vc = new VirtualConsole();
const jsdomErrors = [];
vc.on('jsdomError', (e) => jsdomErrors.push(String(e && e.message || e)));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc, beforeParse: jsdomStubs });
const W = dom.window, D = W.document;

// C.1 — la preuve la plus directe que FM_ASM n'a pas levé : la page a fini de se monter.
ok('C.1 FM_ASM assemble les 3 corpus sans lever (aucune erreur au chargement)' +
  (jsdomErrors.length ? ' — ' + jsdomErrors[0].slice(0, 120) : ''), jsdomErrors.length === 0);
const P = W.fmMetroParcours && W.fmMetroParcours();
ok('C.2 API du parcours étendue à l\'axe style (style / styles / showStyle)',
  !!(P && P.style && P.styles && P.showStyle));

eq('C.3 styles exposés, socle exclu', JSON.stringify(P.styles()), JSON.stringify(['funk', 'bresil']));
eq('C.4 style par défaut = funk (premier déclaré) — les utilisateurs existants ne bougent pas', P.style(), 'funk');
eq('C.5 sélecteur de style rendu : deux onglets', D.querySelectorAll('#pfRoot .pf-sty-tab').length, 2);
ok('C.6 l\'onglet du style courant est actif', !!D.querySelector('.pf-sty-tab.active[data-sty="funk"]'));

// --- non-régression du funk : la migration n'a touché ni les ID ni les acquis ---
eq('C.7 funk : 4 niveaux peuplés', JSON.stringify(P.niveauxPeuples()), JSON.stringify(['debutant', 'intermediaire', 'avance', 'artiste']));
P.showNiveau('intermediaire');
ok('C.8 funk : les ID de module sont INCHANGÉS par la migration (MOD-CJ-I-I2)', !!D.querySelector('.pf-mod[data-mid="MOD-CJ-I-I2"]'));
eq('C.9 funk / Intermédiaire : 6 modules par colonne, comme avant C6',
  D.querySelectorAll('.pf-col')[0].querySelectorAll('.pf-mod').length, 6);
// un acquis posé sous funk doit se relire après un aller-retour de style
P.setAcquis('cajon', 'EX-SOCLE-T1-01', true);

// --- bascule de style ---
P.showStyle('bresil');
eq('C.10 bascule → style courant = bresil', P.style(), 'bresil');
eq('C.11 persistance du style dans la même clé que le niveau', W.localStorage.getItem('fm-metro-parcours-style'), 'bresil');
eq('C.12 bresil : 2 niveaux peuplés (le socle + l\'Intermédiaire brésilien)',
  JSON.stringify(P.niveauxPeuples()), JSON.stringify(['debutant', 'intermediaire']));
// L'Intermédiaire existe dans les DEUX styles : on garde sa place en changeant de style.
eq('C.13 un niveau tenu par les deux styles est conservé à la bascule (on ne perd pas sa place)', P.niveau(), 'intermediaire');

// Le repli ne joue que si le niveau n'existe pas dans le nouveau style — l'Artiste est funk-only.
P.showStyle('funk'); P.showNiveau('artiste');
P.showStyle('bresil');
eq('C.14 un niveau ABSENT du nouveau style retombe seul sur le premier peuplé', P.niveau(), 'debutant');
// le repli ne réécrit pas la préférence : le niveau funk est retrouvé au retour
P.showStyle('funk');
eq('C.15 le repli n\'écrase pas la préférence — retour au funk, on retrouve l\'Artiste', P.niveau(), 'artiste');
P.showStyle('bresil');

// --- le socle est visible sous CHAQUE style ---
eq('C.16 socle sous bresil : 5 modules par colonne (repli sur la clé nue)',
  D.querySelectorAll('.pf-col')[0].querySelectorAll('.pf-mod').length, 5);
ok('C.17 socle sous bresil : ce sont bien les modules du socle', !!D.querySelector('.pf-mod[data-mid="MOD-CJ-D-POS"]'));
P.showStyle('funk'); P.showNiveau('debutant');
eq('C.18 socle sous funk : les mêmes 5 modules (le socle est bien partagé)',
  D.querySelectorAll('.pf-col')[0].querySelectorAll('.pf-mod').length, 5);
ok('C.19 socle sous funk : ce sont les mêmes modules', !!D.querySelector('.pf-mod[data-mid="MOD-CJ-D-POS"]'));

P.showStyle('bresil'); P.showNiveau('intermediaire');
const colBR = D.querySelectorAll('.pf-col');
eq('C.20 bresil / Intermédiaire : 6 modules au cajón', colBR[0].querySelectorAll('.pf-mod').length, 6);
eq('C.21 bresil / Intermédiaire : 3 modules au djembé (le style n\'est pas symétrique)', colBR[1].querySelectorAll('.pf-mod').length, 3);
ok('C.22 les modules rendus sont bien ceux du Brésil', !!D.querySelector('.pf-mod[data-mid="MOD-BR-CJ-I-CIR"]') &&
  !!D.querySelector('.pf-mod[data-mid="MOD-BR-DJ-I-PAL"]'));
ok('C.23 AUCUN module funk ne fuit sous le style Brésil', !D.querySelector('.pf-mod[data-mid="MOD-CJ-I-I2"]'));
eq('C.24 bresil / Intermédiaire : 45 fiches rendues (9 modules × 5)', D.querySelectorAll('#pfRoot .pf-card').length, 45);
eq('C.25 la numérotation reste continue malgré les codes sautés (djembé : 1, 2, 3)',
  Array.from(colBR[1].querySelectorAll('.pf-mod-idx')).map(e => e.textContent).join(','), '1,2,3');

// --- retour au funk : rien n'a bougé ---
P.showStyle('funk'); P.showNiveau('intermediaire');
ok('C.26 retour au funk : les modules funk sont de nouveau là', !!D.querySelector('.pf-mod[data-mid="MOD-CJ-I-I2"]'));
ok('C.27 retour au funk : AUCUN module brésilien ne fuit', !D.querySelector('.pf-mod[data-mid="MOD-BR-CJ-I-CIR"]'));
ok('C.28 l\'acquis funk posé avant la bascule a survécu à l\'aller-retour', P.isAcquis('cajon', 'EX-SOCLE-T1-01'));

// --- le tiroir perso suit le tempo de l'exercice (la ciranda est à 63, sous le plancher funk) ---
P.showStyle('bresil'); P.showNiveau('intermediaire');
const carteCir = D.querySelector('.pf-card[data-ex="EX-BR-CIR-01"] .pf-tempo');
ok('C.29 tiroir perso : les bornes encadrent un tempo brésilien (ciranda 63)',
  !!carteCir && +carteCir.getAttribute('min') <= 63 && +carteCir.getAttribute('max') >= 63);
const carteBos = D.querySelector('.pf-card[data-ex="EX-BR-BOS-01"] .pf-tempo');
ok('C.30 tiroir perso : idem pour la bossa comptée en deux (44)',
  !!carteBos && +carteBos.getAttribute('min') <= 44 && +carteBos.getAttribute('max') >= 44);
P.showStyle('funk'); P.showNiveau('intermediaire');
const carteFunk = D.querySelector('.pf-card[data-ex="EX-SOCLE-I2-04"] .pf-tempo');
ok('C.31 tiroir perso : les bornes funk restent 70–110 (aucune régression P-4)',
  !!carteFunk && carteFunk.getAttribute('min') === '70' && carteFunk.getAttribute('max') === '110');

console.log('\n--- axe style (C6) : ' + PASS + ' vertes, ' + FAIL + ' rouges (total ' + (PASS + FAIL) + ') ---');
process.exit(FAIL ? 1 : 0);

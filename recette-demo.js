/* ============================================================================
   Recette « demo » (R-4a, étendue R-4c) — validateur du champ demo des corpus :
   le mode écoute d'apprendre.html (spec R-4 §3.3-3.4, format acté au GO §9.2).
   Format : demo = { instr, steps, voix: { <voix>: [0/1/2 × steps], … },
   swing?, feel? } — ou une variante PAR INSTRUMENT { cajon:{…}, djembe:{…} }
   pour les EX-SOCLE partagés entre les deux parcours.
   feel (R-4c, actage Jean du 17/07) : décalage constant de toutes les frappes
   en ms (±25, patron du feel basse R-3b), laid-back > 0 / pushed < 0 —
   RÉSERVÉ aux modules Artiste P1/P2, identité stricte à l'absence.
   Périmètre R-4c : les QUATRE niveaux peuplés — Débutant 33/40 (R-4a),
   Intermédiaire 40/42 (R-4a), Avancé 17/35 et Artiste 23/35 (R-4c, échantillon
   pilote validé à l'oreille le 17/07) ; les 39 sans-démo sont des listes
   fermées motivées (posture pure, timbre hors palette — cimbalette comprise,
   ornements infra-grille, alternances/structures multi-mesures, exploration
   bilatérale du placement).
   Usage :  node recette-demo.js
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

let nOk = 0, nKo = 0;
function ok(cond, libelle) {
  if (cond) { nOk++; console.log('  ✓ ' + libelle); }
  else { nKo++; console.error('  ✗ ' + libelle); }
}

// ---- chargement des corpus (sandbox : un faux window, patron recette-corpus) ----
const window = {};
// C6 : ces deux corpus sont chargés EN DUR, et ça reste voulu. Cette suite est le
// procès-verbal des lots R-4a/R-4c (comptes de démos par niveau, listes fermées de
// sans-démo motivés) : y verser un nouveau style rendrait ces listes ininterprétables,
// puisqu'elles regroupent par NIVEAU. Le corpus « bresil » a ses propres assertions de
// démo dans recette-styles.js §B, et le format reste validé pour tous par recette-corpus.js.
for (const f of ['corpus/socle-technique.js', 'corpus/funk.js'])
  eval(fs.readFileSync(path.join(__dirname, f), 'utf-8'));
const CORPUS = window.FM_CORPUS;

// voix réellement rendues par playPerc (fm-audio.js) pour les deux parcours
const VOIX_MOTEUR = { cajon: ['grave', 'aigu'], djembe: ['basse', 'tone', 'slap'] };

// union exercices + modules, et parcours/niveaux référençant chaque exercice
const EXS = {}, MODS = {};
for (const cid of Object.keys(CORPUS)) {
  Object.assign(EXS, CORPUS[cid].exercices || {});
  Object.assign(MODS, CORPUS[cid].modules || {});
}
const refs = {};   // ex -> { parcours:Set, niveaux:Set }
for (const mid of Object.keys(MODS)) {
  const m = MODS[mid];
  for (const ex of m.exercices) {
    refs[ex] = refs[ex] || { parcours: new Set(), niveaux: new Set() };
    refs[ex].parcours.add(m.parcours);
    refs[ex].niveaux.add(m.niveau);
  }
}

// ---- 1. forme d'une variante ----------------------------------------------------
function varianteOk(d, exId) {
  if (!d || typeof d.instr !== 'string' || !VOIX_MOTEUR[d.instr]) return exId + ' : instr inconnu';
  if (typeof d.steps !== 'number' || [4, 8, 12, 16].indexOf(d.steps) < 0) return exId + ' : steps hors {4,8,12,16}';
  if (d.swing !== undefined && !(typeof d.swing === 'number' && d.swing >= 50 && d.swing <= 85))
    return exId + ' : swing hors bornes';
  if (d.feel !== undefined && !(typeof d.feel === 'number' && d.feel >= -25 && d.feel <= 25 && d.feel !== 0))
    return exId + ' : feel hors bornes ±25 ms (0 = ne pas porter le champ)';
  const voix = Object.keys(d.voix || {});
  if (!voix.length) return exId + ' : aucune voix';
  for (const v of voix) {
    if (VOIX_MOTEUR[d.instr].indexOf(v) < 0) return exId + ' : voix « ' + v + ' » inconnue de ' + d.instr;
    const g = d.voix[v];
    if (!Array.isArray(g) || g.length !== d.steps) return exId + ' : grille « ' + v + ' » ≠ steps';
    if (!g.every(x => x === 0 || x === 1 || x === 2)) return exId + ' : valeurs hors {0,1,2}';
  }
  if (!voix.some(v => d.voix[v].some(x => x > 0))) return exId + ' : démo silencieuse';
  return null;
}

const avecDemo = Object.keys(EXS).filter(id => EXS[id].demo !== undefined);
let err = null;
for (const id of avecDemo) {
  const d = EXS[id].demo;
  const variantes = d.voix ? { seule: d } : d;
  for (const k of Object.keys(variantes)) {
    err = err || varianteOk(variantes[k], id + (d.voix ? '' : '·' + k));
    if (!d.voix && variantes[k].instr !== k) err = err || (id + ' : variante « ' + k + ' » porte instr ' + variantes[k].instr);
  }
}
ok(!err, 'toutes les démos sont bien formées (instr/steps/voix/valeurs/swing/feel)' + (err ? ' — ' + err : ''));

// ---- 2. cohérence avec les parcours qui référencent l'exercice -------------------
err = null;
for (const id of avecDemo) {
  const d = EXS[id].demo, r = refs[id];
  if (!r) { err = err || (id + ' : exercice orphelin'); continue; }
  const parcs = Array.from(r.parcours);
  if (d.voix) {
    if (parcs.length !== 1) err = err || (id + ' : partagé entre ' + parcs.join('+') + ' mais démo unique');
    else if (d.instr !== parcs[0]) err = err || (id + ' : instr ' + d.instr + ' ≠ parcours ' + parcs[0]);
  } else {
    for (const p of parcs) if (!d[p]) err = err || (id + ' : pas de variante pour le parcours ' + p);
  }
}
ok(!err, 'chaque démo couvre le(s) parcours qui référencent l\'exercice' + (err ? ' — ' + err : ''));

// ---- 3. périmètre R-4c : les quatre niveaux peuplés -------------------------------
const parNiveau = { debutant: [0, 0], intermediaire: [0, 0], avance: [0, 0], artiste: [0, 0] };
for (const id of Object.keys(EXS)) {
  const r = refs[id]; if (!r) continue;
  const niv = Array.from(r.niveaux)[0];
  parNiveau[niv][1]++;
  if (EXS[id].demo !== undefined) parNiveau[niv][0]++;
}
ok(parNiveau.debutant[0] === 33 && parNiveau.debutant[1] === 40,
  'Débutant : 33 démos / 40 exercices (7 sans surface sonore, motivés) — trouvé ' + parNiveau.debutant.join('/'));
ok(parNiveau.intermediaire[0] === 40 && parNiveau.intermediaire[1] === 42,
  'Intermédiaire : 40 démos / 42 exercices (2 alternances par mesures, motivées) — trouvé ' + parNiveau.intermediaire.join('/'));
ok(parNiveau.avance[0] === 17 && parNiveau.avance[1] === 35,
  'Avancé : 17 démos / 35 exercices (R-4c — 18 sans-démo motivés) — trouvé ' + parNiveau.avance.join('/'));
ok(parNiveau.artiste[0] === 23 && parNiveau.artiste[1] === 35,
  'Artiste : 23 démos / 35 exercices (R-4c — 12 sans-démo motivés) — trouvé ' + parNiveau.artiste.join('/'));

// les 9 sans-demo Débutant+Intermédiaire sont EXACTEMENT ceux motivés au rapport R-4a
const SANS_DEMO = ['EX-CJ-POS-01', 'EX-CJ-POS-03', 'EX-DJ-POS-01', 'EX-DJ-POS-03',
  'EX-CJ-DYN-03', 'EX-CJ-DYN-04', 'EX-DJ-DYN-03', 'EX-CJ-B2-04', 'EX-DJ-B2-04'];
const sans = Object.keys(EXS).filter(id => {
  const r = refs[id]; if (!r) return false;
  const niv = Array.from(r.niveaux)[0];
  return (niv === 'debutant' || niv === 'intermediaire') && EXS[id].demo === undefined;
}).sort();
ok(JSON.stringify(sans) === JSON.stringify(SANS_DEMO.slice().sort()),
  'les exercices sans démo (Déb+Int) sont exactement les 9 motivés — trouvé [' + sans.join(', ') + ']');

// les 30 sans-demo Avancé+Artiste sont EXACTEMENT ceux motivés au rapport R-4c :
// cimbalette hors palette (5 CYM), flams/rolls/rafales infra-grille (6 D3),
// structures multi-mesures — alternances, cycles appel/réponse, arcs dynamiques,
// bascules, chorus/solos construits (16), exploration bilatérale du placement
// (P3-03), pitch bend hors palette (COL-02), fills toutes les 4 mesures (2 D3-05).
const SANS_DEMO_AVAR = ['EX-SOCLE-B3-04', 'EX-SOCLE-B3-05',
  'EX-CJ-D3-01', 'EX-CJ-D3-02', 'EX-CJ-D3-03', 'EX-CJ-D3-05',
  'EX-DJ-D3-01', 'EX-DJ-D3-02', 'EX-DJ-D3-03', 'EX-DJ-D3-05',
  'EX-CJ-CYM-01', 'EX-CJ-CYM-02', 'EX-CJ-CYM-03', 'EX-CJ-CYM-04', 'EX-CJ-CYM-05',
  'EX-DJ-CALL-03', 'EX-DJ-CALL-04', 'EX-DJ-CALL-05',
  'EX-SOCLE-P3-03', 'EX-SOCLE-I4-02', 'EX-SOCLE-I4-04', 'EX-SOCLE-I4-05',
  'EX-SOCLE-R1-04', 'EX-SOCLE-R1-05',
  'EX-CJ-COL-02', 'EX-CJ-COL-04', 'EX-CJ-COL-05',
  'EX-DJ-SOLO-02', 'EX-DJ-SOLO-03', 'EX-DJ-SOLO-05'];
const sansAvAr = Object.keys(EXS).filter(id => {
  const r = refs[id]; if (!r) return false;
  const niv = Array.from(r.niveaux)[0];
  return (niv === 'avance' || niv === 'artiste') && EXS[id].demo === undefined;
}).sort();
ok(JSON.stringify(sansAvAr) === JSON.stringify(SANS_DEMO_AVAR.slice().sort()),
  'les exercices sans démo (Av+Ar) sont exactement les 30 motivés — trouvé ' + sansAvAr.length);

// ---- 4. fidélité ponctuelle : les cellules pédagogiques clés ---------------------
const d1 = EXS['EX-SOCLE-T1-01'].demo;
ok(d1 && d1.cajon.voix.grave[0] === 2 && d1.cajon.voix.grave.slice(1).every(x => x === 0) &&
   d1.djembe.voix.basse[0] === 2 && d1.djembe.voix.basse.slice(1).every(x => x === 0),
  'T1-01 : le grave/la bass exactement sur The One, rien d\'autre');
const b1 = EXS['EX-CJ-B1-01'].demo;
ok(b1 && b1.voix.aigu[4] === 2 && b1.voix.aigu[12] === 2 &&
   b1.voix.aigu.filter(x => x > 0).length === 2,
  'B1-01 (cajón) : backbeat 2 & 4 seuls (pas 4 et 12 de la grille de 16)');
const b2 = EXS['EX-DJ-B2-02'].demo;
ok(b2 && b2.voix.slap[4] === 2 && b2.voix.slap[14] === 2 && b2.voix.slap[12] === 0,
  'B2-02 (djembé) : le second slap migré sur le « et » du 4 (pas 14, le 12 vide)');
const t2 = EXS['EX-SOCLE-T2-03'].demo;
ok(t2 && t2.cajon.swing === 62 && t2.djembe.swing === 62 &&
   t2.cajon.voix.aigu.every(x => x === 1),
  'T2-03 : nappe complète, swing 62 porté par la démo (S.swing du preset intact)');
const d1e = EXS['EX-SOCLE-D1-01'].demo;
ok(d1e && [1, 5, 9, 13].every(i => d1e.cajon.voix.aigu[i] === 1) &&
   d1e.cajon.voix.aigu.filter(x => x > 0).length === 4,
  'D1-01 : le ghost sur le e de chaque temps, rien d\'autre');
const son5 = EXS['EX-DJ-SON-05'].demo;
ok(son5 && son5.voix.basse[0] === 1 && son5.voix.tone[1] === 1 && son5.voix.slap[2] === 2 &&
   son5.voix.basse[3] === 0 && son5.voix.tone[3] === 0 && son5.voix.slap[3] === 0,
  'SON-05 (djembé) : bass, tone, slap à la suite puis silence sur le 4');
const gap4 = EXS['EX-SOCLE-D-PLS-04'];
ok(gap4.demo && gap4.preset.gap && gap4.demo.cajon.voix.grave[0] === 2,
  'PLS-04 : la démo joue à travers la coupure du preset (gap) — le 1 accentué comme repère');

// ---- 4bis. fidélité ponctuelle R-4c : Avancé + Artiste ---------------------------
const b3a = EXS['EX-SOCLE-B3-02'].demo;
ok(b3a && b3a.cajon.voix.grave[14] === 2 && b3a.cajon.voix.grave[0] === 0 &&
   b3a.cajon.voix.grave.filter(x => x > 0).length === 1 &&
   b3a.djembe.voix.basse[14] === 2 && b3a.djembe.voix.basse[0] === 0,
  'B3-02 : le grave anticipé sur le « et » avant le 1 (pas 14), le 1 vide');
const r2a = EXS['EX-SOCLE-R2-01'].demo;
ok(r2a && [0, 6, 12].every(i => r2a.cajon.voix.grave[i] === 2) &&
   r2a.cajon.voix.grave.filter(x => x > 0).length === 3 &&
   [0, 6, 12].every(i => r2a.djembe.voix.basse[i] === 2),
  'R2-01 : la cellule 3+3+2 (tresillo) — pas 0, 6, 12, rien d\'autre');
const r2q = EXS['EX-SOCLE-R2-04'].demo;
ok(r2q && r2q.cajon.steps === 12 && r2q.djembe.steps === 12 &&
   r2q.cajon.voix.aigu.filter(x => x > 0).length === 6 &&
   r2q.cajon.voix.aigu.every((x, i) => (i % 2 === 0 ? x > 0 : x === 0)) &&
   r2q.cajon.voix.aigu[0] === 2 && r2q.cajon.voix.aigu[6] === 2,
  'R2-04 : 3-contre-2 sur grille TERNAIRE (12 pas) — 3 coups égaux par blanche, convergences accentuées');
const r1a = EXS['EX-SOCLE-R1-01'].demo;
ok(r1a && r1a.cajon.steps === 12 &&
   [0, 3, 6, 9].every(i => r1a.cajon.voix.grave[i] > 0) && r1a.cajon.voix.grave.filter(x => x > 0).length === 4 &&
   [0, 2, 4, 6, 8, 10].every(i => r1a.cajon.voix.aigu[i] > 0) && r1a.cajon.voix.aigu.filter(x => x > 0).length === 6,
  'R1-01 : une main en 2 (les temps), l\'autre en 3 — les deux étages sur la grille de 12');
const p12 = [EXS['EX-SOCLE-P1-01'].demo, EXS['EX-SOCLE-P2-01'].demo];
ok(p12[0] && p12[1] &&
   p12[0].cajon.feel === 18 && p12[0].djembe.feel === 18 &&
   p12[1].cajon.feel === -18 && p12[1].djembe.feel === -18 &&
   JSON.stringify(p12[0].cajon.voix) === JSON.stringify(p12[1].cajon.voix),
  'P1-01 traîne (feel +18 ms), P2-01 pousse (−18 ms) — grilles identiques, seul le placement change');
const p3b = EXS['EX-SOCLE-P3-02'].demo;
ok(p3b && p3b.cajon.voix.aigu[4] === 2 && p3b.cajon.voix.aigu[12] === 2 &&
   p3b.cajon.voix.aigu.filter(x => x === 2).length === 2 &&
   p3b.cajon.voix.aigu.filter(x => x === 1).length === 14,
  'P3-02 : la poche — nappe continue, seuls le 2 et le 4 saillent');
const c2 = EXS['EX-DJ-CALL-02'].demo;
ok(c2 && c2.voix.slap[4] === 2 && c2.voix.slap[12] === 2 && c2.voix.slap.filter(x => x > 0).length === 2 &&
   c2.voix.basse[0] === 1 && c2.voix.basse[8] === 1,
  'CALL-02 (djembé) : accompagnement stable — bass 1 & 3, backbeat slap 2 & 4');
const col3 = EXS['EX-CJ-COL-03'].demo;
ok(col3 && JSON.stringify(col3.voix.grave) === JSON.stringify(col3.voix.aigu) &&
   [0, 4, 8, 12].every(i => col3.voix.grave[i] === 2),
  'COL-03 (cajón) : frappe combinée — grave et aigu strictement simultanés (sans flam)');
const so1 = EXS['EX-DJ-SOLO-01'].demo;
ok(so1 && so1.voix.basse[0] === 2 && so1.voix.slap[12] === 2 &&
   so1.voix.tone[4] === 1 && so1.voix.tone[5] === 1,
  'SOLO-01 (djembé) : l\'ancre — DUN sur le 1, ta-ta sur le 2, PA sur le 4');

// ---- 4ter. l'espace négatif : les démos de dialogue évitent les notes de la basse -
const PATTERNS = CORPUS.funk.patterns;
const DIALOGUES = ['EX-SOCLE-I1-01', 'EX-SOCLE-I1-02', 'EX-SOCLE-I1-03', 'EX-SOCLE-I1-04',
  'EX-SOCLE-I1-05', 'EX-SOCLE-I4-03', 'EX-DJ-SOLO-04'];
err = null;
for (const id of DIALOGUES) {
  const E = EXS[id], pat = PATTERNS[E.preset.pattern];
  const bassSteps = new Set(pat.hits.map(h => h.i));
  const variantes = E.demo.voix ? [E.demo] : [E.demo.cajon, E.demo.djembe];
  for (const v of variantes)
    for (const vk of Object.keys(v.voix))
      v.voix[vk].forEach((x, i) => { if (x > 0 && bassSteps.has(i)) err = err || (id + ' : pas ' + i + ' marche sur la basse'); });
}
ok(!err, 'dialogue/hocketing : aucune frappe de démo sur une note de la basse (espace négatif asserté)' + (err ? ' — ' + err : ''));

// ---- 4quater. discipline du feel : réservé aux modules Artiste P1/P2 --------------
err = null;
const feelIds = [];
for (const id of avecDemo) {
  const d = EXS[id].demo;
  const variantes = d.voix ? [d] : Object.keys(d).map(k => d[k]);
  const feels = variantes.filter(v => v.feel !== undefined).map(v => v.feel);
  if (!feels.length) continue;
  feelIds.push(id);
  if (feels.length !== variantes.length) err = err || (id + ' : feel sur une variante mais pas l\'autre');
  if (!/^EX-SOCLE-P[12]-/.test(id)) err = err || (id + ' : feel hors des modules P1/P2');
  if (/^EX-SOCLE-P1-/.test(id) && !feels.every(f => f > 0)) err = err || (id + ' : P1 (laid-back) doit traîner (feel > 0)');
  if (/^EX-SOCLE-P2-/.test(id) && !feels.every(f => f < 0)) err = err || (id + ' : P2 (pushed) doit pousser (feel < 0)');
}
ok(!err && feelIds.length === 10,
  'feel : porté par les 10 exercices P1/P2 exactement, signe cohérent par module (trouvé ' + feelIds.length + ')' + (err ? ' — ' + err : ''));

// ---- 5. les EX-SOCLE partagés portent bien deux variantes ------------------------
const partages = avecDemo.filter(id => refs[id] && refs[id].parcours.size >= 2);
ok(partages.length > 0 && partages.every(id => !EXS[id].demo.voix &&
   EXS[id].demo.cajon && EXS[id].demo.djembe),
  'EX-SOCLE partagés : une variante cajón ET une variante djembé (' + partages.length + ' exercices)');

console.log(`\n--- demo (R-4a + R-4c) : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

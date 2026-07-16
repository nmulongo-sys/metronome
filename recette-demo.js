/* ============================================================================
   Recette « demo » (R-4a) — validateur du champ demo des corpus : le mode
   écoute d'apprendre.html (spec R-4 §3.3-3.4, format acté au GO §9.2).
   Format : demo = { instr, steps, voix: { <voix>: [0/1/2 × steps], … },
   swing? } — ou une variante PAR INSTRUMENT { cajon:{…}, djembe:{…} } pour
   les EX-SOCLE partagés entre les deux parcours.
   Périmètre R-4a : Débutant + Intermédiaire peuplés (73 démos), Avancé et
   Artiste SANS demo (lot de contenu R-4c) ; 9 exercices restent sans demo,
   motivés (posture pure, timbre hors palette, alternance par mesures).
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
ok(!err, 'toutes les démos sont bien formées (instr/steps/voix/valeurs/swing)' + (err ? ' — ' + err : ''));

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

// ---- 3. périmètre R-4a : Débutant + Intermédiaire, rien au-delà ------------------
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
ok(parNiveau.avance[0] === 0 && parNiveau.artiste[0] === 0,
  'Avancé et Artiste sans démo (périmètre R-4a — lot de contenu R-4c)');

// les 9 sans-demo sont EXACTEMENT ceux motivés au rapport (liste fermée)
const SANS_DEMO = ['EX-CJ-POS-01', 'EX-CJ-POS-03', 'EX-DJ-POS-01', 'EX-DJ-POS-03',
  'EX-CJ-DYN-03', 'EX-CJ-DYN-04', 'EX-DJ-DYN-03', 'EX-CJ-B2-04', 'EX-DJ-B2-04'];
const sans = Object.keys(EXS).filter(id => {
  const r = refs[id]; if (!r) return false;
  const niv = Array.from(r.niveaux)[0];
  return (niv === 'debutant' || niv === 'intermediaire') && EXS[id].demo === undefined;
}).sort();
ok(JSON.stringify(sans) === JSON.stringify(SANS_DEMO.slice().sort()),
  'les exercices sans démo sont exactement les 9 motivés — trouvé [' + sans.join(', ') + ']');

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

// ---- 5. les EX-SOCLE partagés portent bien deux variantes ------------------------
const partages = avecDemo.filter(id => refs[id] && refs[id].parcours.size >= 2);
ok(partages.length > 0 && partages.every(id => !EXS[id].demo.voix &&
   EXS[id].demo.cajon && EXS[id].demo.djembe),
  'EX-SOCLE partagés : une variante cajón ET une variante djembé (' + partages.length + ' exercices)');

console.log(`\n--- demo (R-4a) : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

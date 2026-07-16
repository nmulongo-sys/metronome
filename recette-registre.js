/* ============================================================================
   Recette « registre » (R-2) — garantit que l'extraction des données vers les
   corpus n'a RIEN changé : égalité stricte, valeur par valeur, entre les tables
   du build 0.8.0 de référence (reference-tables-0.8.0.json, figé au moment de
   l'extraction, indépendant du code testé) et :
     A. les tables portées par les corpus (patterns, progressions, instruments) ;
     B. l'union des corpus (exercices, modules, ordres de niveaux) — ce que la
        coquille assemble au boot (frontière moteur : spec R-1 §4.3, critère
        « diff limité à l'indirection + recette d'égalité des tables »).
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

let nOk = 0, nKo = 0;
function ok(cond, libelle) {
  if (cond) { nOk++; console.log('  ✓ ' + libelle); }
  else { nKo++; console.error('  ✗ ' + libelle); }
}
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference-tables-0.8.0.json'), 'utf-8'));

// charge tous les corpus dans un faux window
const window = {};
for (const f of fs.readdirSync(path.join(__dirname, 'corpus')).filter(f => f.endsWith('.js')).sort())
  eval(fs.readFileSync(path.join(__dirname, 'corpus', f), 'utf-8'));
const CORPUS = window.FM_CORPUS || {};

// ---- A. tables moteur : patterns / progressions (corpus funk) -------------------
const funk = CORPUS['funk'] || {};
ok(egal(funk.patterns, REF.BASS_PATTERNS),
  'patterns du corpus funk == BASS_PATTERNS 0.8.0 (' + Object.keys(REF.BASS_PATTERNS).join(', ') + ')');
ok(egal(funk.progressions, REF.BASS_PROGS),
  'progressions du corpus funk == BASS_PROGS 0.8.0 (' + Object.keys(REF.BASS_PROGS).join(', ') + ')');
ok(egal(funk.instruments, REF.PF_PARC), 'instruments du corpus funk == PF_PARC 0.8.0');

// ---- B. union des corpus == tables pédagogiques 0.8.0 ---------------------------
const union = { exercices: {}, modules: {} };
const niveaux = { debutant: [], intermediaire: [], avance: [], artiste: [] };
for (const cid of Object.keys(CORPUS).sort()) {
  Object.assign(union.exercices, CORPUS[cid].exercices || {});
  Object.assign(union.modules, CORPUS[cid].modules || {});
  for (const niv of Object.keys(CORPUS[cid].niveaux || {}))
    if ((CORPUS[cid].niveaux[niv] || []).length) niveaux[niv] = CORPUS[cid].niveaux[niv];
}
// préservation par ID : chaque entrée du 0.8.0 est toujours présente, identique
// valeur pour valeur (le peuplement P-7/P-8 AJOUTE, il ne modifie jamais).
// L'ordre d'insertion n'importe pas — l'ordre d'affichage vient de PF_NIV_ORDER.
ok(Object.keys(REF.PF_EX).every(id => egal(union.exercices[id], REF.PF_EX[id])),
  `chaque exercice 0.8.0 présent et identique valeur pour valeur (${Object.keys(REF.PF_EX).length})`);
ok(Object.keys(REF.PF_MOD).every(id => egal(union.modules[id], REF.PF_MOD[id])),
  `chaque module 0.8.0 présent et identique valeur pour valeur (${Object.keys(REF.PF_MOD).length})`);
ok(egal(niveaux.debutant, REF.PF_NIV_ORDER.debutant) && egal(niveaux.intermediaire, REF.PF_NIV_ORDER.intermediaire),
  'ordres Débutant/Intermédiaire identiques à 0.8.0');

// ---- comptes attendus (P-7/P-8 : spec metronome-parcours-funk-P7-P8) -------------
ok(Object.keys(union.exercices).length === 152, '152 exercices au total (82 + 70 P-7/P-8)');
ok(Object.keys(union.modules).length === 44, '44 modules au total (22 + 22 P-7/P-8)');
ok(egal(niveaux.avance, ['B3','I1','R2','D3','CYM','CALL']) &&
   egal(niveaux.artiste, ['P1','P2','P3','I4','R1','COL','SOLO']),
  'ordres Avancé/Artiste conformes à la spec P-7/P-8 (codes asymétriques)');

console.log(`\n--- registre : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

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
// égalité par ID (l'ordre d'insertion diffère : socle avant funk ; aucune
// fonctionnalité n'itère PF_EX/PF_MOD dans l'ordre d'insertion — l'ordre
// d'affichage vient de PF_NIV_ORDER)
const memesCles = (a, b) => egal(Object.keys(a).sort(), Object.keys(b).sort());
ok(memesCles(union.exercices, REF.PF_EX),
  `mêmes IDs d'exercices que 0.8.0 (${Object.keys(REF.PF_EX).length})`);
ok(Object.keys(REF.PF_EX).every(id => egal(union.exercices[id], REF.PF_EX[id])),
  'chaque exercice identique valeur pour valeur à 0.8.0');
ok(memesCles(union.modules, REF.PF_MOD),
  `mêmes IDs de modules que 0.8.0 (${Object.keys(REF.PF_MOD).length})`);
ok(Object.keys(REF.PF_MOD).every(id => egal(union.modules[id], REF.PF_MOD[id])),
  'chaque module identique valeur pour valeur à 0.8.0');
ok(egal(niveaux, REF.PF_NIV_ORDER), 'ordres de niveaux identiques à PF_NIV_ORDER 0.8.0');

// ---- comptes attendus (spec R-2 §7.4, corrigés à l'extraction) ------------------
ok(Object.keys(union.exercices).length === 82, '82 exercices au total (40 Débutant + 42 funk)');
ok(Object.keys(union.modules).length === 22, '22 modules au total (10 Débutant + 12 funk)');

console.log(`\n--- registre : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

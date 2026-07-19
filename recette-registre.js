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
// C6 : les clés de niveaux sont désormais composées « <style>:<niveau> » pour un corpus
// de style (le socle, lui, reste nu). Le registre 0.8.0 est celui du parcours funk + socle :
// on replie donc sur le niveau NU, mais en ne retenant que ces deux corpus-là. Un style
// ajouté ensuite vit sous sa propre clé et n'a pas à écraser l'ordre historique.
const REF_CORPUS = ['funk', 'socle-technique'];
for (const cid of Object.keys(CORPUS).sort()) {
  Object.assign(union.exercices, CORPUS[cid].exercices || {});
  Object.assign(union.modules, CORPUS[cid].modules || {});
  if (REF_CORPUS.indexOf(cid) < 0) continue;
  for (const niv of Object.keys(CORPUS[cid].niveaux || {})) {
    if (!(CORPUS[cid].niveaux[niv] || []).length) continue;
    const sep = niv.indexOf(':');
    niveaux[sep >= 0 ? niv.slice(sep + 1) : niv] = CORPUS[cid].niveaux[niv];
  }
}
// préservation par ID : chaque entrée du 0.8.0 est toujours présente, identique
// valeur pour valeur (le peuplement P-7/P-8 AJOUTE, il ne modifie jamais).
// L'ordre d'insertion n'importe pas — l'ordre d'affichage vient de PF_NIV_ORDER.
// R-4a : le champ demo (mode écoute, prévu au schéma R-1 §4.1, GO R-4 §9.2) est un AJOUT
// acté sur les exercices existants — la préservation porte sur les champs 0.8.0, demo mis
// à part (sa validité est portée par recette-demo.js).
const sansDemo = e => { if (!e) return e; const c = Object.assign({}, e); delete c.demo; return c; };
ok(Object.keys(REF.PF_EX).every(id => egal(sansDemo(union.exercices[id]), REF.PF_EX[id])),
  `chaque exercice 0.8.0 présent et identique valeur pour valeur, champ demo mis à part (${Object.keys(REF.PF_EX).length})`);
// C6 : le champ style est un AJOUT sur les modules existants — exactement de même nature
// que demo sur les exercices en R-4a : il restaure la provenance que FM_ASM perd en
// aplatissant les corpus. La préservation porte donc sur les champs 0.8.0, style mis à
// part (sa validité est portée par recette-corpus.js et recette-styles.js §A).
const sansStyle = m => { if (!m) return m; const c = Object.assign({}, m); delete c.style; return c; };
ok(Object.keys(REF.PF_MOD).every(id => egal(sansStyle(union.modules[id]), REF.PF_MOD[id])),
  `chaque module 0.8.0 présent et identique valeur pour valeur, champ style mis à part (${Object.keys(REF.PF_MOD).length})`);
ok(egal(niveaux.debutant, REF.PF_NIV_ORDER.debutant) && egal(niveaux.intermediaire, REF.PF_NIV_ORDER.intermediaire),
  'ordres Débutant/Intermédiaire identiques à 0.8.0');

// ---- comptes attendus (P-7/P-8 : spec metronome-parcours-funk-P7-P8) -------------
ok(Object.keys(union.exercices).length === 197, '197 exercices au total (82 + 70 P-7/P-8 + 45 C6/Brésil)');
ok(Object.keys(union.modules).length === 53, '53 modules au total (22 + 22 P-7/P-8 + 9 C6/Brésil)');
ok(egal(niveaux.avance, ['B3','I1','R2','D3','CYM','CALL']) &&
   egal(niveaux.artiste, ['P1','P2','P3','I4','R1','COL','SOLO']),
  'ordres Avancé/Artiste conformes à la spec P-7/P-8 (codes asymétriques)');

console.log(`\n--- registre : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

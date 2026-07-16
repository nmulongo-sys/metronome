/* ============================================================================
   Recette « validateur de corpus » (R-2) — fait respecter le contrat de données
   (spec R-1 §4.1 / spec R-2 §5). C'est la garantie « ajouter un style = zéro
   code » : un nouveau corpus est recevable si cette suite passe.

   Usage :  node recette-corpus.js                → valide tous les corpus/*.js
            node recette-corpus.js corpus/x.js …  → valide les fichiers donnés
   Les vérifications de références (module→exercice, preset→pattern/progression,
   module→parcours) se font sur l'UNION des corpus chargés (un corpus peut
   référencer les instruments ou patterns d'un autre, ex. socle ← funk).
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

// ---- mini-cadre d'assertions --------------------------------------------------
let nOk = 0, nKo = 0;
function ok(cond, libelle) {
  if (cond) { nOk++; console.log('  ✓ ' + libelle); }
  else { nKo++; console.error('  ✗ ' + libelle); }
}

// ---- chargement des corpus (sandbox : un faux window) --------------------------
const fichiers = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(path.join(__dirname, 'corpus')).filter(f => f.endsWith('.js'))
      .sort().map(f => path.join('corpus', f));

const window = {};   // capté par les IIFE des corpus
for (const f of fichiers) {
  const abs = path.isAbsolute(f) ? f : path.join(__dirname, f);
  eval(fs.readFileSync(abs, 'utf-8'));
}
const CORPUS = window.FM_CORPUS || {};
console.log('corpus chargés : ' + Object.keys(CORPUS).join(', ') + '\n');

// ---- union (pour les références croisées) --------------------------------------
const union = { exercices: {}, patterns: {}, progressions: {}, instruments: {} };
for (const cid of Object.keys(CORPUS)) {
  const c = CORPUS[cid];
  for (const cle of Object.keys(union))
    Object.assign(union[cle], c[cle] || {});
}

// ---- contrat --------------------------------------------------------------------
const PRESET_VOCAB = ['metro', 'tempo', 'subdiv', 'gap', 'pattern', 'prog', 'drop'];
const NIVEAUX = ['debutant', 'intermediaire', 'avance', 'artiste'];
const KINDS = ['atome', 'synthese'];

const estPattern = p => p && typeof p.steps === 'number' && Array.isArray(p.hits) &&
  p.hits.every(h => typeof h.i === 'number' && h.i >= 0 && h.i < p.steps);

// unicité des IDs à travers TOUS les corpus
for (const cle of ['exercices', 'modules', 'patterns', 'progressions']) {
  const vus = {};
  let doublon = null;
  for (const cid of Object.keys(CORPUS))
    for (const id of Object.keys(CORPUS[cid][cle] || {})) {
      if (vus[id]) doublon = `${id} (${vus[id]} et ${cid})`;
      vus[id] = cid;
    }
  ok(!doublon, `unicité inter-corpus des ${cle}` + (doublon ? ' — doublon : ' + doublon : ''));
}

for (const cid of Object.keys(CORPUS)) {
  const c = CORPUS[cid];
  console.log(`\n--- corpus « ${cid} » ---`);
  ok(c.meta && c.meta.id === cid, 'meta.id cohérent avec la clé FM_CORPUS');
  ok(c.meta && typeof c.meta.label === 'string' && typeof c.meta.version === 'string',
    'meta.label et meta.version présents');

  const exs = c.exercices || {}, mods = c.modules || {};

  // exercices
  let exOk = true, presetOk = true, refPatOk = true, demoOk = true;
  for (const id of Object.keys(exs)) {
    const e = exs[id];
    if (!KINDS.includes(e.kind) || !e.objet || !e.consigne || !e.critere || !e.preset) exOk = false;
    for (const champ of Object.keys(e.preset))
      if (!PRESET_VOCAB.includes(champ)) presetOk = false;
    if (e.preset.pattern && !union.patterns[e.preset.pattern]) refPatOk = false;
    if (e.preset.prog && !union.progressions[e.preset.prog]) refPatOk = false;
    if (e.demo !== undefined && !estPattern(e.demo)) demoOk = false;
  }
  ok(exOk, `exercices complets (kind∈{atome,synthese}, objet, consigne, critere, preset) — ${Object.keys(exs).length} exercices`);
  ok(presetOk, 'presets au vocabulaire fermé (' + PRESET_VOCAB.join(', ') + ')');
  ok(refPatOk, 'presets : patterns/progressions référencés existent (union des corpus)');
  ok(demoOk, 'champ demo (optionnel) au format moteur');

  // modules
  let modOk = true, refExOk = true, parcOk = true, rolesOk = true;
  for (const id of Object.keys(mods)) {
    const m = mods[id];
    if (!m.parcours || !NIVEAUX.includes(m.niveau) || !m.objet || !Array.isArray(m.exercices)) modOk = false;
    for (const e of m.exercices) if (!union.exercices[e]) refExOk = false;
    if (!union.instruments[m.parcours]) parcOk = false;
  }
  ok(modOk, `modules complets (parcours, niveau∈NIVEAUX, objet, exercices[]) — ${Object.keys(mods).length} modules`);
  ok(refExOk, 'modules : tout exercice référencé existe (union des corpus)');
  ok(parcOk, 'modules : tout parcours référence un instrument déclaré (union des corpus)');

  // niveaux : tout code de l'ordre correspond à au moins un module du corpus, et réciproquement
  let nivOk = true;
  const codesModules = new Set(Object.keys(mods).map(id => id.split('-').pop()));
  for (const niv of Object.keys(c.niveaux || {})) {
    if (!NIVEAUX.includes(niv)) nivOk = false;
    for (const code of c.niveaux[niv] || [])
      if (!codesModules.has(code)) nivOk = false;
  }
  for (const id of Object.keys(mods))
    if (!(c.niveaux && (c.niveaux[mods[id].niveau] || []).includes(id.split('-').pop()))) nivOk = false;
  ok(nivOk, 'niveaux ⇆ modules cohérents (chaque code déclaré a ses modules, chaque module est ordonnancé)');

  // patterns / progressions
  let patOk = true;
  for (const id of Object.keys(c.patterns || {})) {
    const p = c.patterns[id];
    if (!estPattern(p)) patOk = false;
    if (p.roles !== undefined && (typeof p.roles !== 'object' || p.roles === null)) rolesOk = false;
  }
  ok(patOk, `patterns au format moteur (steps, hits[{i<steps}]) — ${Object.keys(c.patterns || {}).length} patterns`);
  ok(rolesOk, 'champ roles (optionnel) : objet de découpage');
  let progOk = true;
  for (const id of Object.keys(c.progressions || {})) {
    const p = c.progressions[id];
    if (!Array.isArray(p.bars) || !p.bars.length || !p.bars.every(b => typeof b.deg === 'string' && 'quality' in b)) progOk = false;
  }
  ok(progOk, `progressions au format moteur (bars[{deg,quality}]) — ${Object.keys(c.progressions || {}).length} progressions`);
}

console.log(`\n--- validateur de corpus : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

/* ============================================================================
   Recette « corpus i18n » (M1) — garantit que le CONTENU pédagogique des leçons
   est traduit en EN et en PT, et le reste quand un corpus grossit.

   Le contrat : toute chaîne de corpus RENDUE par apprendre.html (objet de
   module, objet/consigne/critère d'exercice, description du corpus, label
   d'instrument) doit avoir une entrée dans window.__I18N.en ET .pt. La clé est
   la chaîne française normalisée — mêmes espaces repliés que le marcheur i18n
   de R-5, sinon la traduction ne serait jamais retrouvée à l'écran.

   C'est la garantie « ajouter un style = ajouter sa traduction » : C6 (jazz,
   voix, son cubain, vents…) déposera corpus/<style>.js ET corpus/i18n-<style>.js,
   et cette suite refusera l'un sans l'autre.

   Usage :  node recette-corpus-i18n.js
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
const norm = s => (s || '').replace(/\s+/g, ' ').trim();

// ---- chargement : corpus, puis traductions (sandbox : un faux window) ----------
const dir = path.join(__dirname, 'corpus');
const tous = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const corpusFiles = tous.filter(f => !f.startsWith('i18n-'));
const i18nFiles = tous.filter(f => f.startsWith('i18n-'));

const window = {};
// témoin de non-écrasement : une clé posée AVANT le chargement doit survivre
window.__I18N = { en: { 'The One': 'TÉMOIN-CHROME' }, pt: {} };
for (const f of corpusFiles) eval(fs.readFileSync(path.join(dir, f), 'utf-8'));
for (const f of i18nFiles) eval(fs.readFileSync(path.join(dir, f), 'utf-8'));

const CORPUS = window.FM_CORPUS || {};
const EN = window.__I18N.en, PT = window.__I18N.pt;
console.log('corpus : ' + corpusFiles.join(', '));
console.log('traductions : ' + i18nFiles.join(', ') + '\n');

// ---- 1. appariement corpus ↔ fichier de traduction -----------------------------
console.log('1. appariement');
const manquants = Object.keys(CORPUS).filter(cid => i18nFiles.indexOf('i18n-' + cid + '.js') < 0);
ok(manquants.length === 0,
  `chaque corpus a son fichier de traduction (${Object.keys(CORPUS).length} corpus)` +
  (manquants.length ? ' — sans traduction : ' + manquants.join(', ') : ''));
const orphelinsF = i18nFiles.filter(f => !CORPUS[f.replace(/^i18n-|\.js$/g, '')]);
ok(orphelinsF.length === 0,
  'aucun fichier de traduction sans corpus' + (orphelinsF.length ? ' — ' + orphelinsF.join(', ') : ''));

// ---- 2. inventaire des chaînes RENDUES par apprendre.html ----------------------
// (mêmes champs que pfRender : voir apprendre.html — objet/consigne/critere)
const rendues = [];
for (const cid of Object.keys(CORPUS)) {
  const c = CORPUS[cid];
  if (c.meta && c.meta.description) rendues.push(norm(c.meta.description));
  // C6 : le label d'un corpus de STYLE est rendu — c'est l'onglet du sélecteur de style
  // d'apprendre.html. Le socle en est exclu : il n'est pas un style, son label n'apparaît nulle part.
  if (c.meta && c.meta.label && !c.meta.socle) rendues.push(norm(c.meta.label));
  for (const k of Object.keys(c.instruments || {}))
    if (c.instruments[k].label) rendues.push(norm(c.instruments[k].label));
  for (const k of Object.keys(c.modules || {}))
    if (c.modules[k].objet) rendues.push(norm(c.modules[k].objet));
  for (const k of Object.keys(c.exercices || {})) {
    const e = c.exercices[k];
    for (const champ of ['objet', 'consigne', 'critere'])
      if (e[champ]) rendues.push(norm(e[champ]));
  }
}
const uniques = Array.from(new Set(rendues));
console.log(`\n2. couverture — ${rendues.length} chaînes rendues, ${uniques.length} uniques`);

const sansEN = uniques.filter(s => EN[s] === undefined);
const sansPT = uniques.filter(s => PT[s] === undefined);
ok(sansEN.length === 0, `couverture ANGLAISE complète (${uniques.length - sansEN.length}/${uniques.length})`);
sansEN.slice(0, 8).forEach(s => console.log('     ! EN manque : ' + JSON.stringify(s.slice(0, 70))));
ok(sansPT.length === 0, `couverture PORTUGAISE complète (${uniques.length - sansPT.length}/${uniques.length})`);
sansPT.slice(0, 8).forEach(s => console.log('     ! PT manque : ' + JSON.stringify(s.slice(0, 70))));

// ---- 3. hygiène du dictionnaire ------------------------------------------------
console.log('\n3. hygiène');
const vides = uniques.filter(s => !norm(EN[s]) || !norm(PT[s]));
ok(vides.length === 0, 'aucune traduction vide');

// clés apportées par les fichiers de corpus qui ne correspondent à rien de rendu
const apportees = new Set();
for (const f of i18nFiles) {
  const src = fs.readFileSync(path.join(dir, f), 'utf-8');
  const w2 = { __I18N: { en: {}, pt: {} } };
  (function (window) { eval(src); })(w2);
  Object.keys(w2.__I18N.en).forEach(k => apportees.add(k));
}
const rendu = new Set(uniques);
const orphelines = Array.from(apportees).filter(k => !rendu.has(k));
ok(orphelines.length === 0,
  `aucune clé de traduction orpheline (${apportees.size} clés apportées)`);
orphelines.slice(0, 8).forEach(k => console.log('     ! orpheline : ' + JSON.stringify(k.slice(0, 70))));

// non-écrasement : le chrome de la page l'emporte sur les fichiers de corpus
ok(EN['The One'] === 'TÉMOIN-CHROME',
  'les fichiers de traduction FUSIONNENT sans écraser une clé déjà définie (chrome prioritaire)');

// ---- 4. garde-fou anti-copier-coller (liste fermée) ----------------------------
// Une traduction identique au français est presque toujours un oubli. Les seules
// exceptions admises sont les TERMES DE MÉTIER laissés tels quels — arbitrage de
// Jean du 18/07 (spec M1 §5). Toute nouvelle égalité doit être ajoutée ici sciemment.
console.log('\n4. garde-fou anti-copier-coller');
// C6 : « Funk » est le label du corpus funk, rendu par le sélecteur de style — nom de
// genre, conservé tel quel dans les deux langues. Le Brésil, lui, n'ajoute AUCUNE entrée :
// ses termes portugais (ciranda, xote, palmas, tamborim, baião…) sont toujours enchâssés
// dans une phrase française qui, elle, se traduit — aucune chaîne rendue n'est le terme nu.
const GLOSSAIRE_EN = ['Cajón', 'Djembé', 'The One', 'Hocketing / dialogue',
  'Laid-back', 'Pushed', 'Doubles & 3-stroke', 'Heel-toe', 'Funk'];
const GLOSSAIRE_PT = ['Cajón', 'The One', 'Laid-back', 'Pushed', 'Heel-toe', 'Funk'];
const egalEN = uniques.filter(s => EN[s] === s && GLOSSAIRE_EN.indexOf(s) < 0);
const egalPT = uniques.filter(s => PT[s] === s && GLOSSAIRE_PT.indexOf(s) < 0);
ok(egalEN.length === 0, 'EN : aucune traduction identique au français hors glossaire');
egalEN.slice(0, 8).forEach(s => console.log('     ! EN == FR : ' + JSON.stringify(s.slice(0, 70))));
ok(egalPT.length === 0, 'PT : aucune traduction identique au français hors glossaire');
egalPT.slice(0, 8).forEach(s => console.log('     ! PT == FR : ' + JSON.stringify(s.slice(0, 70))));
// la liste fermée ne doit pas pourrir : tout terme déclaré doit exister dans le corpus
const glossMorts = GLOSSAIRE_EN.concat(GLOSSAIRE_PT).filter(s => !rendu.has(s));
ok(glossMorts.length === 0,
  'la liste fermée du glossaire ne contient aucun terme mort' +
  (glossMorts.length ? ' — ' + glossMorts.join(', ') : ''));

console.log(`\n--- corpus i18n : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

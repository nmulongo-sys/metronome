/* ============================================================================
   Recette « grooves » (R-3b) — l'extraction de la bibliothèque de grooves en
   fichiers par famille (corpus/grooves/<famille>.js, registre FM_GROOVES,
   spec R-3 §9.5) n'a RIEN changé aux données, et les données restent saines.
     A. égalité stricte, valeur pour valeur, entre la table assemblée depuis
        le registre et la référence figée reference-grooves-0.11.0.json
        (dump mécanique de la table GROOVES du build 0.11.0, main 3adf000,
        figé au moment de l'extraction — indépendant du code testé) ;
     B. registre : familles, ordre, unicité des identifiants (collision
        bloquante — même mécanique que FM_CORPUS) ;
     C. validateur de schéma (spec R-3 §9.5) : grid.length === count,
        valeurs 0/1/2, identités de timbre instr+voiceKind CONNUES du moteur
        (la table fermée routée par playPerc, moteur/fm-audio.js), drapeaux
        approx/uncertain/isBreak, ids de voix préfixés par le groove ;
     D. câblage : la page à répertoire (pratiquer.html depuis R-4b — les
        grooves ont quitté l'accueil avec la section Répertoire) charge les
        6 familles dans l'ordre de la table d'origine, sans table en dur.
   « Ajouter une famille = un fichier, zéro code » : ce validateur est la
   revue mécanique qui garde l'ajout unitaire.
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

const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference-grooves-0.11.0.json'), 'utf-8'));

// ---- chargement du registre : les fichiers famille dans l'ordre des balises ------
// R-4b : la page à répertoire est pratiquer.html (argument fichier conservé).
const FILE = process.argv[2] || path.join(__dirname, 'pratiquer.html');
const page = fs.readFileSync(FILE, 'utf-8');
const ordreBalises = [];
page.replace(/<script src="corpus\/grooves\/([^"]+)\.js"><\/script>/g, (m, fam) => { ordreBalises.push(fam); return m; });
ok(egal(ordreBalises, REF.ordreFamilles),
  path.basename(FILE) + ' : les 6 balises corpus/grooves/*.js dans l’ordre de la table 0.11.0 (' + ordreBalises.join(', ') + ')');

const window = {};
for (const fam of ordreBalises)
  eval(fs.readFileSync(path.join(__dirname, 'corpus', 'grooves', fam + '.js'), 'utf-8'));
const G = window.FM_GROOVES || {};
ok(egal(Object.keys(G), REF.ordreFamilles), 'FM_GROOVES : 6 familles enregistrées, ordre d’insertion = ordre des balises');

// assemblage — même algorithme que la page (ordre des familles puis des entrées)
const GROOVES = [];
const vus = Object.create(null);
let collision = null;
for (const fam of Object.keys(G)) for (const g of G[fam]) {
  if (vus[g.id]) collision = g.id;
  vus[g.id] = 1; GROOVES.push(g);
}

// ---- A. égalité valeur pour valeur avec la table 0.11.0 --------------------------
ok(GROOVES.length === REF.nbGrooves, REF.nbGrooves + ' grooves assemblés (trouvé ' + GROOVES.length + ')');
ok(egal(GROOVES, REF.grooves), 'table assemblée == table GROOVES 0.11.0, valeur pour valeur, ordre compris');
ok(GROOVES.every((g, i) => g.id === REF.grooves[i].id), 'ordre des identifiants strictement conservé');
for (const fam of REF.ordreFamilles)
  ok(egal(G[fam], REF.grooves.filter(g => g.family === fam)),
    'famille « ' + fam + ' » == ses ' + G[fam].length + ' grooves 0.11.0, valeur pour valeur');

// ---- B. registre ------------------------------------------------------------------
ok(collision === null, 'aucune collision d’identifiant entre familles (mécanique bloquante saine)');
ok(GROOVES.every(g => G[g.family] && G[g.family].includes(g)),
  'chaque groove vit dans le fichier de SA famille (champ family == nom de fichier)');

// ---- C. validateur de schéma ---------------------------------------------------
// identités de timbre routables par playPerc (moteur/fm-audio.js, table fermée)
const TIMBRES = new Set([
  'djembe.basse', 'djembe.tone', 'djembe.slap',
  'cajon.grave', 'cajon.aigu',
  'cajoncym.grave', 'cajoncym.aigu', 'cajoncym.cimbalette',
  'dunduns.dundunba', 'dunduns.sangban', 'dunduns.kenkeni', 'dunduns.cloche',
  'agogo.grave', 'agogo.aigu', 'surdo.grave', 'surdo.marcante',
  'recoreco.raclement'
]);
const ROLES = new Set(['basse', 'medium', 'aigu']);
const voixDe = g => (g.voices || []).concat(g.variations || []);
const toutes = [];
for (const g of GROOVES) for (const v of voixDe(g)) toutes.push({ g, v });

ok(GROOVES.every(g => g.id && g.label && g.family && g.origin && g.context),
  'chaque groove porte id, label, family, origin, context');
ok(GROOVES.every(g => (g.count === 16 || g.count === 12) && (g.family_meter === 'bin' || g.family_meter === 'tern')
                       && (g.count === 16 || g.family_meter === 'tern')),
  'count/family_meter dans l’alphabet fermé : 16 bin, 16 tern (shuffle) ou 12 tern — jamais 12 bin');
ok(GROOVES.every(g => g.tempo && g.tempo.min <= g.tempo.max && (g.tempo.jam === null || g.tempo.jam > 0)),
  'tempo : min <= max, jam posé ou null (pas de plage jam)');
ok(GROOVES.every(g => (g.voices || []).length >= 2), 'chaque groove a au moins 2 voix (matière team spirit)');
ok(toutes.length === 154, '154 lignes de grille au total (139 voix + 15 variations)');
ok(toutes.every(x => Array.isArray(x.v.grid) && x.v.grid.length === x.g.count),
  'grid.length === count pour chaque voix et variation');
ok(toutes.every(x => x.v.grid.every(c => c === 0 || c === 1 || c === 2)),
  'grilles en alphabet fermé {0,1,2} (silence/frappe/accent)');
ok(toutes.every(x => TIMBRES.has(x.v.instr + '.' + x.v.voiceKind)),
  'chaque instr.voiceKind est routable par playPerc (table fermée du moteur)');
ok(toutes.every(x => ROLES.has(x.v.role)), 'chaque role dans {basse, medium, aigu} (repli de registre)');
ok(toutes.every(x => x.v.id && x.v.id.indexOf(x.g.id + '.') === 0),
  'chaque id de voix/variation préfixé par l’id de son groove');
ok(toutes.every(x => typeof x.v.uncertain === 'boolean'),
  'drapeau uncertain explicite partout (grilles reconstruites visibles)');
ok(toutes.every(x => x.v.approx === undefined || typeof x.v.approx === 'boolean') &&
   toutes.every(x => x.v.isBreak === undefined || typeof x.v.isBreak === 'boolean'),
  'drapeaux approx/isBreak booléens quand présents');
ok(GROOVES.filter(g => g.family === 'ouest-africain').every(g => voixDe(g).every(v => v.uncertain === true)),
  'ouest-africain : tout est uncertain:true (grilles reconstruites, passe 3 §5.3)');
ok(new Set(toutes.map(x => x.v.id)).size === toutes.length, 'ids de voix/variations tous uniques');

// ---- D. câblage de la page ------------------------------------------------------
ok(!/const GROOVES = \[/.test(page), path.basename(FILE) + ' : plus de table GROOVES en dur (assemblage seul)');
ok(/const GROOVES = \(\(\) =>/.test(page), path.basename(FILE) + ' : l’assemblage FM_GROOVES est en place');

console.log(`\n--- grooves : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

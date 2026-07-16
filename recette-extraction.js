/* ============================================================================
   Recette « extraction » (R-3a) — preuve du VERBATIM : la mise en fichiers du
   moteur (moteur/fm-etat.js, fm-audio.js, fm-accomp.js) est un DÉPLACEMENT,
   pas une réécriture. Référence figée au moment de l'extraction :
   reference-extraction-0.10.0.json (empreintes du build 0.10.0, 7d861f4).
     A. chaque fichier moteur, sous son en-tête, est identique octet pour octet
        au(x) bloc(s) d'origine (ancres de début, md5, nombre de lignes) ;
     B. la coquille (index.html) est identique au 0.10.0 privé des blocs,
        aux seules tolérances déclarées près : 6 lignes insérées (commentaire
        + 3 balises <script src="moteur/…">) et 2 lignes d'IIFE déposées.
   La ligne `const BUILD = …` est normalisée avant hachage (elle suit le
   numéro de build courant — c'est l'unique ligne vivante de fm-etat.js).
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let nOk = 0, nKo = 0;
function ok(cond, libelle) {
  if (cond) { nOk++; console.log('  ✓ ' + libelle); }
  else { nKo++; console.error('  ✗ ' + libelle); }
}

const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference-extraction-0.10.0.json'), 'utf-8'));
const md5 = lines => crypto.createHash('md5').update(lines.join('\n'), 'utf-8').digest('hex');
const normBuild = lines => lines.map(l => /^  const BUILD = /.test(l) ? "  const BUILD = '<NORMALISE>';" : l);
const lignes = f => fs.readFileSync(path.join(__dirname, f), 'utf-8').split('\n');

// ---- A. les fichiers moteur == les blocs du 0.10.0 -------------------------------
// Le contenu verbatim commence à la ou aux lignes d'ancre (l'en-tête de fichier est
// hors périmètre). fm-audio porte DEUX blocs d'origine (AUDIO+CYCLE, ORDONNANCEUR),
// contigus dans le fichier, non contigus dans le 0.10.0.
for (const nom of ['fm-etat', 'fm-audio', 'fm-accomp']) {
  const attendu = REF.blocs[nom];
  const contenu = lignes('moteur/' + nom + '.js');
  const ancre = Array.isArray(REF.ancres[nom]) ? REF.ancres[nom][0] : REF.ancres[nom];
  const debut = contenu.indexOf(ancre);
  ok(debut > 0, `moteur/${nom}.js : ancre trouvée sous l'en-tête (« ${ancre.trim().slice(0, 46)}… »)`);
  // le fichier se termine par un saut de ligne final → dernière entrée vide
  const bloc = contenu.slice(debut, contenu[contenu.length - 1] === '' ? -1 : undefined);
  ok(bloc.length === attendu.nb, `moteur/${nom}.js : ${attendu.nb} lignes verbatim (trouvé ${bloc.length})`);
  ok(md5(normBuild(bloc)) === attendu.md5, `moteur/${nom}.js : md5 du bloc == référence 0.10.0 (${attendu.md5.slice(0, 8)}…)`);
}
ok(lignes('moteur/fm-audio.js').indexOf(REF.ancres['fm-audio'][1]) > 0,
  'moteur/fm-audio.js : second bloc (ORDONNANCEUR) présent à son ancre');

// ---- B. la coquille == le 0.10.0 privé des blocs (tolérances déclarées) ----------
const page = lignes('index.html');
// retire l'unique occurrence de la séquence insérée (commentaire + balises moteur)
const ins = REF.lignesInserees;
let iIns = -1;
for (let i = 0; i + ins.length <= page.length; i++) {
  if (ins.every((l, j) => page[i + j] === l)) { iIns = i; break; }
}
ok(iIns >= 0, 'index.html : les ' + ins.length + ' lignes insérées (commentaire + balises moteur) présentes, en un seul bloc');
const residu = iIns < 0 ? page : page.slice(0, iIns).concat(page.slice(iIns + ins.length));
ok(residu.length === REF.residuNbLignes,   // la référence compte, comme split('\n'), l'entrée vide du saut final
  `index.html : ${REF.residuNbLignes} lignes de coquille (trouvé ${residu.length})`);
ok(md5(residu) === REF.residuMd5,
  `index.html : md5 de la coquille == 0.10.0 privé des blocs et de l'IIFE (${REF.residuMd5.slice(0, 8)}…)`);
// l'IIFE du script principal est déposée : la balise qui suit les insertions ouvre
// directement sur la directive strict (les IIFE des AUTRES scripts de la page sont hors sujet)
ok(page[iIns + ins.length] === '<script>' && page[iIns + ins.length + 1] === "  'use strict';",
  "index.html : le script principal ouvre sur 'use strict' sans IIFE (portée globale partagée)");
ok(page.some(l => /^  'use strict';$/.test(l)),
  "index.html : le script principal reste en mode strict (directive conservée)");

// ---- garde-fous d'ensemble --------------------------------------------------------
const totalBlocs = Object.values(REF.blocs).reduce((s, b) => s + b.nb, 0);
ok(totalBlocs + REF.residuNbLignes + 2 === REF.reference.nbLignes,
  `comptes clos : ${totalBlocs} lignes moteur + ${REF.residuNbLignes} coquille + 2 IIFE = ${REF.reference.nbLignes} (0.10.0)`);
ok(/const BUILD = 'metronomefunk-0\.11\.0'/.test(fs.readFileSync(path.join(__dirname, 'moteur/fm-etat.js'), 'utf-8')),
  'BUILD = 0.11.0 dans fm-etat.js (unique ligne vivante, tolérance déclarée)');

console.log(`\n--- extraction : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

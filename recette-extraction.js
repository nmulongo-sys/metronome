/* ============================================================================
   Recette « extraction » (R-3a, tolérances R-3b) — preuve du VERBATIM : la mise
   en fichiers du moteur (moteur/fm-etat.js, fm-audio.js, fm-accomp.js) est un
   DÉPLACEMENT, pas une réécriture. Référence figée au moment de l'extraction :
   reference-extraction-0.10.0.json (empreintes du build 0.10.0, 7d861f4 —
   l'état validé à l'oreille le 10/07).
     A. chaque fichier moteur, sous son en-tête, est identique octet pour octet
        au(x) bloc(s) d'origine (ancres, md5, nombre de lignes), modulo les
        TOLÉRANCES DÉCLARÉES : la ligne BUILD (unique ligne vivante) et les
        DEUX retouches additives ACTÉES au GO R-3 (16/07) — mute maître J2
        (1 ligne dans playClick) et feel basse (1 ligne au point de recopie +
        champ feelMs dans S.bass). La recette PROUVE aussi que ces retouches
        sont EXACTEMENT celles actées, à l'octet près, et qu'il n'y en a pas
        d'autre (comptage strict des identifiants accompMuted / feelMs).
     B. garde-fous de coquille : l'ancienne comparaison ligne à ligne de
        index.html avec le 0.10.0 (partie B de R-3a) est retirée — la coquille
        évolue légitimement en R-3b (grooves extraits, lien pratiquer, stub
        mute maître) et sa non-régression est portée par la batterie
        fonctionnelle complète + recette-grooves.js. Restent les invariants
        structurels : balises moteur dans l'ordre contractuel sur les DEUX
        pages, script principal en portée globale stricte sans IIFE, BUILD.
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

/* ---- tolérances R-3b (GO R-3 §9.6, brief 16/07) : les seules retouches admises ----
   Déclarées à l'octet près ; la normalisation les RETIRE avant hachage, ce qui prouve
   que le moteur est par ailleurs strictement identique au 0.10.0. */
const R3B_INSEREES = [
  '      feelMs: 0,           // R-3b : feel — décalage ms de la couche basse (posé < 0 < poussé, −25…+25) ; 0 = grille stricte, chemin identique',
  "    if (accompMuted && (layer === 'perc' || layer === 'bass')) return;"
];
const R3B_RECOPIE = {
  apres: "      for (const b of bassRealized) events.push({ frac: b.frac, layer: 'bass', note: b.note, offMs: S.bass.feelMs || 0 });",
  avant: "      for (const b of bassRealized) events.push({ frac: b.frac, layer: 'bass', note: b.note });"
};
const normR3b = lines => lines
  .filter(l => R3B_INSEREES.indexOf(l) < 0)
  .map(l => l === R3B_RECOPIE.apres ? R3B_RECOPIE.avant : l);

// ---- A. les fichiers moteur == les blocs du 0.10.0 (modulo tolérances) -----------
for (const nom of ['fm-etat', 'fm-audio', 'fm-accomp']) {
  const attendu = REF.blocs[nom];
  const contenu = lignes('moteur/' + nom + '.js');
  const ancre = Array.isArray(REF.ancres[nom]) ? REF.ancres[nom][0] : REF.ancres[nom];
  const debut = contenu.indexOf(ancre);
  ok(debut > 0, `moteur/${nom}.js : ancre trouvée sous l'en-tête (« ${ancre.trim().slice(0, 46)}… »)`);
  const bloc = normR3b(contenu.slice(debut, contenu[contenu.length - 1] === '' ? -1 : undefined));
  ok(bloc.length === attendu.nb, `moteur/${nom}.js : ${attendu.nb} lignes verbatim, tolérances retirées (trouvé ${bloc.length})`);
  ok(md5(normBuild(bloc)) === attendu.md5, `moteur/${nom}.js : md5 du bloc == référence 0.10.0 (${attendu.md5.slice(0, 8)}…)`);
}
ok(lignes('moteur/fm-audio.js').indexOf(REF.ancres['fm-audio'][1]) > 0,
  'moteur/fm-audio.js : second bloc (ORDONNANCEUR) présent à son ancre');

// ---- tolérances R-3b : exactement les retouches actées, rien d'autre --------------
const etat = fs.readFileSync(path.join(__dirname, 'moteur/fm-etat.js'), 'utf-8');
const audio = fs.readFileSync(path.join(__dirname, 'moteur/fm-audio.js'), 'utf-8');
const accomp = fs.readFileSync(path.join(__dirname, 'moteur/fm-accomp.js'), 'utf-8');
const compte = (s, re) => (s.match(re) || []).length;
ok(etat.split('\n').filter(l => l === R3B_INSEREES[0]).length === 1,
  'R-3b feel : le champ feelMs est dans S.bass (fm-etat.js), à l\'octet près, une fois');
ok(audio.split('\n').filter(l => l === R3B_INSEREES[1]).length === 1,
  'R-3b mute maître : la ligne actée est dans playClick (fm-audio.js), à l\'octet près, une fois');
ok(audio.split('\n').filter(l => l === R3B_RECOPIE.apres).length === 1,
  'R-3b feel : le point de recopie porte offMs: S.bass.feelMs || 0, à l\'octet près, une fois');
ok(compte(etat + audio + accomp, /accompMuted/g) === 1 && compte(audio + accomp, /feelMs/g) === 1 &&
   compte(etat, /feelMs/g) === 1,
  'aucune autre retouche : accompMuted ×1 et feelMs ×2 dans tout le moteur, pas un de plus');

// ---- B. garde-fous de coquille (index.html ET pratiquer.html) ---------------------
const ORDRE = ['corpus/socle-technique.js', 'corpus/funk.js',
  'corpus/grooves/bresil.js', 'corpus/grooves/ouest-africain.js', 'corpus/grooves/funk.js',
  'corpus/grooves/reggae.js', 'corpus/grooves/hiphop.js', 'corpus/grooves/rock.js',
  'moteur/fm-etat.js', 'moteur/fm-audio.js', 'moteur/fm-accomp.js'];
for (const page of ['index.html', 'pratiquer.html']) {
  const html = fs.readFileSync(path.join(__dirname, page), 'utf-8');
  const srcs = [];
  html.replace(/<script src="([^"]+)"><\/script>/g, (m, s) => { srcs.push(s); return m; });
  const locaux = srcs.filter(s => !/^(https?:)?\/\//.test(s));
  ok(JSON.stringify(locaux) === JSON.stringify(ORDRE),
    page + ' : balises locales dans l\'ordre contractuel corpus → grooves → fm-etat → fm-audio → fm-accomp');
  ok(new RegExp('</script>\\s*<script>\\s*\'use strict\';').test(html),
    page + ' : le script principal ouvre sur \'use strict\' sans IIFE (portée globale partagée)');
}
ok(/const BUILD = 'metronomefunk-0\.12\.0'/.test(etat),
  'BUILD = 0.12.0 dans fm-etat.js (unique ligne vivante, tolérance déclarée)');

console.log(`\n--- extraction : ${nOk} vertes, ${nKo} rouges (total ${nOk + nKo}) ---`);
process.exit(nKo ? 1 : 0);

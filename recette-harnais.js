/* ============================================================================
   Harnais de recette (R-2) — chargement de l'app pour jsdom.
   Les suites construisent le DOM avec `new JSDOM(html)` : les <script src>
   locaux (corpus/*.js) ne seraient jamais chargés. chargeHtml() lit index.html
   et INLINE chaque script local à sa place exacte (l'ordre d'exécution est
   préservé) ; les scripts distants (CDN) sont laissés tels quels — jsdom ne
   les charge pas, comme avant R-2.
   Usage dans une suite :  const html = require('./recette-harnais').chargeHtml(FILE);
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

function chargeHtml(fichier) {
  const file = fichier || path.join(__dirname, 'index.html');
  const dir = path.dirname(file);
  const html = fs.readFileSync(file, 'utf-8');
  return html.replace(/<script\s+src="([^"]+)"\s*>\s*<\/script>/g, (balise, src) => {
    if (/^(https?:)?\/\//.test(src)) return balise;   // distant : inchangé
    const contenu = fs.readFileSync(path.join(dir, src), 'utf-8');
    return '<script>\n' + contenu + '\n</script>';
  });
}

module.exports = { chargeHtml };

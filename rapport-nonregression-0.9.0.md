# Rapport de non-régression — build 0.9.0 (R-2 : extraction des corpus)

**Date : 2026-07-16** · Base : main = 0.8.0 (`5152ef0`) · Chantier : R-2 (spec
`metronome-refonte-R2-extraction-corpus-spec.md`, GO Jean) · Environnement : Node v24.18.0,
jsdom, Windows ; suites lourdes avec `--max-old-space-size=4096`.

## Objet du build

Extraction des données vers `corpus/socle-technique.js` (Débutant P-6, 40 exercices / 10 modules)
et `corpus/funk.js` (Intermédiaire, 42 exercices / 12 modules, 4 patterns, 6 progressions,
instruments). `index.html` charge les corpus par `<script src>` et les assemble (`FM_ASM`,
collision d'ID bloquante) ; le moteur lit `BASS_PATTERNS`/`BASS_PROGS` via l'indirection
(aucune ligne de synthèse/scheduling modifiée). **Iso-fonctionnel : aucun changement visuel
ni sonore.** La page passe de 11 199 à 10 789 lignes.

## Batterie canonique : 19 suites, 746/746 vertes ✅

| Suite | Assertions |
|---|---|
| recette-5-1 / 5-1-bis / 5-2 | 20 / 21 / 23 |
| recette-5-3 / 5-3-bis / 5-3-ter / 5-3c / 5-4 | 38 / 15 / 28 / 21 / 40 |
| recette-P2 / P4 / P6 | 42 / 44 / 56 |
| recette-ux-0.6.6 / onboarding-0.6.7 / mobile-0.6.8 | 48 / 49 / 56 |
| recette-a11y-i18n-0.6.9 / atelier-exports-0.7.0 | 54 / 85 |
| recette-cajon-cymbalette / chantier-B / chantier-B2 | 32 / 52 / 22 |
| **Total** | **746/746** |

Comptes par suite **strictement identiques** à ceux du 0.8.0 — c'est la preuve attendue par la
spec R-2 §6 : l'adaptation des suites au harnais est purement mécanique (une ligne de chargement
par suite, `require('./recette-harnais').chargeHtml(...)`).

## Nouvelles suites R-2 : 40 assertions vertes ✅

- **recette-corpus.js** (validateur du contrat de corpus, garantie « ajouter un style = zéro
  code ») : **30/30** sur `socle-technique.js` + `funk.js` — unicité inter-corpus des IDs,
  complétude des exercices/modules, presets au vocabulaire fermé, références résolues sur
  l'union, patterns/progressions au format moteur, champs `demo`/`roles` optionnels conformes.
- **recette-registre.js** (frontière moteur, critère spec R-1 §4.3) : **10/10** — patterns,
  progressions et instruments des corpus **égaux valeur pour valeur** aux tables du 0.8.0 ;
  union des corpus égale aux `PF_EX`/`PF_MOD`/`PF_NIV_ORDER` historiques (82 exercices,
  22 modules). Référence figée dans `reference-tables-0.8.0.json` (extrait du 0.8.0,
  indépendant du code testé — la spec disait « dans la recette elle-même », le fichier committé
  séparé offre la même garantie en restant lisible).

## Vérification navigateur réel (serveur statique local)

Chargement effectif des `<script src>` (ce que jsdom ne teste pas) : build `metronomefunk-0.9.0`
affiché, `window.FM_CORPUS = {socle-technique, funk}`, 12 sections, console sans erreur ;
onglets Débutant (10 modules rendus) / Intermédiaire (12 modules rendus, titres conformes) ;
sélecteurs du moteur alimentés par les corpus : patterns `theOne, syncopeGrave, octaves,
ghostPendule`, progressions `vamp1, vamp2, dorien, mixo, blues, jazzfunk`.

## Écarts vs spec R-2

- §7.4 : comptes corrigés — **82** exercices / **22** modules (le 70/16 initial était une erreur
  de la spec, pas du build).
- §5 : référence figée en fichier séparé `reference-tables-0.8.0.json` plutôt qu'inline dans
  recette-registre.js (garantie équivalente, recette lisible).

**Total général : 786 assertions vertes (746 + 30 + 10), 0 rouge, 21 suites.**

# Rapport de non-régression — build 0.8.0 (P-6 : peuplement du niveau Débutant)

**Date : 2026-07-16 · Env : Node v24.18.0 + jsdom (headless).**
**Build testé : `index-0.8.0.html` (md5 `25117ea841c2ce342c5fe2222e56204f`, stamp `metronomefunk-0.8.0`).**
**Base : `index.html` de `nmulongo-sys/metronome@main` 0.7.0 (commit `9816de1`, 538 071 o) — récupérée via `gh api`.**

## Verdict

**746 / 746 assertions vertes, 0 rouge**, **19 suites** (dont la nouvelle `recette-P6`). La modification P-6
est **additive et confinée** au bloc « parcours funk » : +40 exercices, +10 modules, un rendu passé
niveau-aware avec sélecteur, une extension additive du preset (clic seul / subdivision / gap). Les
sous-systèmes non concernés (métronome, basse funk, cymbalette, UX 0.6.6→0.7.0) restent verts.

## Ce qui change (0.7.0 → 0.8.0)

Zones touchées, **toutes dans le bloc parcours funk + un sélecteur de niveau** :

1. **Données** — `PF_EX` +40 exercices Débutant, `PF_MOD` +10 modules (`niveau:'debutant'`).
2. **Render niveau-aware** — `PF_NIV_INFIX/LABEL/ORDER`, sélecteur d'onglets (`.pf-niv-tabs`), un seul
   niveau rendu à la fois, niveau persistant (`fm-metro-parcours-niveau`, **défaut = Débutant**), `pref`
   dérivé du niveau, hook API `niveau` / `niveauxPeuples` / `showNiveau`.
3. **Preset étendu** — `pfLoadPreset` gère `metro` (clic seul, basse coupée) / `tempo` / `subdiv` / `gap`.
   Les presets Intermédiaire (sans ces champs) prennent la branche basse **inchangée**.
4. **Niveau effectif** — `pfNiveauEffectif` : base dérivée du niveau du module (plus figée à
   `intermediaire`). Promotion inchangée (Débutant promu → intermediaire ; Intermédiaire → avance).
5. **CSS** `.pf-niv-tab*` ; stamp `0.7.0`→`0.8.0` ; sous-titre section « parcours · plusieurs niveaux »
   (+ i18n EN/PT).

## Suites exécutées — toutes vertes (19 suites · 746 assertions)

| Suite | Assertions | Note |
|---|---|---|
| recette-5-1 | 20/20 | basse funk (byte-identique) |
| recette-5-1-bis | 21/21 | |
| recette-5-2 | 23/23 | |
| recette-5-3 | 38/38 | |
| recette-5-3-bis | 15/15 | |
| recette-5-3-ter | 28/28 | |
| recette-5-3c | 21/21 | |
| recette-5-4 | 40/40 | |
| recette-cajon-cymbalette | 32/32 | lourde — exécutée (Node 24) |
| recette-chantier-B | 52/52 | lourde — exécutée (Node 24) |
| recette-chantier-B2 | 22/22 | lourde — exécutée (Node 24) |
| recette-ux-0.6.6 | 48/48 | |
| recette-onboarding-0.6.7 | 49/49 | |
| recette-mobile-0.6.8 | 56/56 | |
| recette-a11y-i18n-0.6.9 | 54/54 | sous-titre section modifié → i18n EN/PT ajustée |
| recette-atelier-exports-0.7.0 | 85/85 | |
| **recette-P2** (mise à jour) | 42/42 | compteurs scopés Intermédiaire + sélecteur ; **compte inchangé** |
| **recette-P4** (mise à jour) | 44/44 | `showNiveau('intermediaire')` avant DOM module 6 ; **compte inchangé** |
| **recette-P6** (nouvelle) | 56/56 | intégrité Débutant, presets pré-funk, sélecteur, promotion, vocalisation |

Les 3 suites lourdes (cymbalette / chantier-B / chantier-B2) — non **exécutées** au 0.6.5 faute de mémoire
— tournent ici intégralement sous Node 24 (`--max-old-space-size=4096`), toutes vertes.

## Détail des mises à jour de recette (intention préservée)

- **recette-P2** : le parcours étant multi-niveaux, les compteurs d'intégrité (12 modules / 42 exercices /
  18 EX-SOCLE) sont **filtrés au niveau Intermédiaire** (`MOD[id].niveau==='intermediaire'`), le sélecteur
  est mis sur « intermédiaire » avant les assertions DOM (accordéon 6 modules/colonne, 60 cartes). Aucune
  assertion supprimée ; l'Intermédiaire est vérifié à l'identique.
- **recette-P4** : `showNiveau('intermediaire')` avant les assertions DOM du module 6 (le défaut est
  désormais Débutant). Preset, partage, acquis, votes, promotion (`niveauEffectif` = `avance` pour un atome
  Intermédiaire promu) inchangés.
- **recette-P6** : nouvelle. 56 assertions — 10 modules `debutant`, 40 exercices, socle `EX-SOCLE-D-PLS/SUB`,
  4 atomes + 1 synthèse, ordre POS→SON→PLS→SUB→DYN, presets clic seul (basse coupée) / subdivision (2 puis
  4) / machine gap (cible `pulse`), tempos gradués, sélecteur (défaut Débutant, bascule Intermédiaire),
  promotion `debutant → intermediaire`, vocalisation (`-SON-04`, `-PLS-01`), offline-first.

## Récapitulatif des compteurs

- 0.6.5 : 398 assertions / 13 suites.
- 0.7.0 : +5 suites UX (ux/onboarding/mobile/a11y-i18n/atelier-exports) → 690 / 18 suites.
- 0.8.0 : **+recette-P6 (56)** → **746 assertions / 19 suites**, 0 rouge. P-2 (42) et P-4 (44) inchangés en
  compte.

## Livrables

- `index-0.8.0.html` — build complet (fichier entier, jamais un patch). Remplace `index.html` sur la
  branche au moment du push.
- `recette-P6.js` — nouvelle recette (56 assertions).
- `recette-P2.js` / `recette-P4.js` — mises à jour (scope Intermédiaire ; compte d'assertions inchangé).
- `metronome-parcours-funk-P6-modules-spec.md` — spec de contenu + câblage (PROPOSITION, relecture Jean).
- Ce rapport.

## Réserve

Vérification **visuelle** (rendu réel du sélecteur dans le navigateur intégré) non menée : le panneau
navigateur a expiré (timeout 300 s). Le rendu est néanmoins **asserté headless** par recette-P6 (§4 :
sélecteur 2 onglets, Débutant actif par défaut, 5 modules ordonnés, 50 cartes, étoile de synthèse, bascule
de niveau ; §5 : double couleur + badge socle ; §6 : chargement des presets). À confirmer d'un coup d'œil
sur GitHub Pages après merge.

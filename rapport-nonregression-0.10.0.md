# Rapport de non-régression — build 0.10.0 (P-7 + P-8 : Avancé & Artiste)

**Date : 2026-07-16** · Base : main = 0.9.0 (`f22afe1`) · Chantiers : P-7 + P-8 d'un bloc (spec
`metronome-parcours-funk-P7-P8-modules-spec.md`, VALIDÉE — 6 points §9 tranchés par Jean) ·
Environnement : Node v24.18.0, jsdom, Windows ; suites lourdes avec `--max-old-space-size=4096`.

## Objet du build

Peuplement des niveaux **Avancé** (35 exercices, 10 modules : B3 syncope du grave, I1 hocketing,
R2 clave & 3-contre-2, D3 fills & ornements, CYM cimbalette / CALL appel manding) et **Artiste**
(35 exercices, 12 modules : P1 laid-back, P2 pushed, P3 poche, I4 tambour-voix + vocalisation,
R1 3-contre-2 maîtrise, COL couleur cajón / SOLO solo manding). **Le parcours funk est complet :
la carte P-5 est intégralement réalisée** — 4 niveaux × 2 parcours, 152 exercices, 44 modules.

**Fichiers touchés** : `corpus/funk.js` (112 exercices, 34 modules, niveaux avance/artiste) ;
`index.html` : le numéro de build uniquement — **zéro ligne de coquille ou de moteur**, première
démonstration en vraie grandeur de l'architecture corpus R-2.

## Batterie : 23 suites, 851/851 vertes ✅

| Suite | Assertions |
|---|---|
| 19 suites historiques | **746/746** — comptes par suite strictement identiques |
| recette-P7 (nouvelle) | **34/34** — intégrité Avancé, asymétrie CYM/CALL, presets, rendu |
| recette-P8 (nouvelle) | **32/32** — intégrité Artiste, asymétrie COL/SOLO, octaves, progressions riches, vocalisation I4, gap |
| recette-corpus (validateur) | **30/30** — contrat tenu avec 70 exercices de plus |
| recette-registre | **9/9** — tables moteur inchangées ; contenu 0.8.0 préservé valeur pour valeur |
| **Total** | **851/851** |

## Recadrages de suites existantes (2 lignes, documentés)

- `recette-P2.js` 4.1 : l'ensemble « partagé » est désormais filtré sur les codes Intermédiaire
  (T1/T2/B1/B2/D1/I2) — P-7/P-8 ajoutent légitimement leurs propres socles. Compte inchangé (42).
- `recette-P6.js` 4.2/4.3 : niveaux peuplés et onglets attendus passent de 2 à 4 — c'est l'objet
  même du chantier. Compte inchangé (56).
- `recette-registre.js` : le volet contenu passe d'« égalité » à « préservation » (chaque entrée
  0.8.0 présente et identique) + comptes 152/44 + ordres Avancé/Artiste conformes à la spec.

## Vérification navigateur réel (serveur statique local)

Build `metronomefunk-0.10.0`, **quatre onglets** (Débutant → Artiste), colonnes Artiste
asymétriques conformes (cajón : P1→COL ; djembé : P1→SOLO), chargement du preset P3-05 →
basse ON `ghostPendule`/`dorien` (première progression riche), **console sans erreur**.

## Points notables

- **Premier emploi du pattern `octaves`** (P1-04/P1-05) et des progressions `blues`/`mixo`/
  `dorien`/`jazzfunk` (synthèses Artiste, décision Jean §9.4) — le moteur les portait depuis la
  passe 5, aucun ajustement nécessaire.
- **Vocalisation** ancrée dans I4-01/I4-02 (décision P-5 §7.2, confirmée §9.6).
- **Backlog moteur** (hors build) : paramètre de « feel » (basse devant/derrière la grille),
  demandé par Jean pour la versatilité — à chiffrer au plus tôt en R-3.

**Total général : 851 assertions vertes, 0 rouge, 23 suites.**

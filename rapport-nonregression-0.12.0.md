# Rapport de non-régression — build 0.12.0 (R-3b)

> Chantier **R-3b** de la refonte B+ (spec R-3 v1.2 VALIDÉE, GO Jean du 16/07 — §4/§5/§9 ;
> retouches moteur §9.6 actées) sur base **main = 0.11.0** (`3adf000`, merge PR #23).
> Environnement : Node v24 (Windows), jsdom, clean-room (clone frais) ; suites avec
> `--max-old-space-size=4096` ; navigateur réel Chrome (volet embarqué en http://,
> Chromium headless via playwright-core en file://).

## 1. Périmètre livré

1. **Bibliothèque de grooves extraite PAR FAMILLE** (spec §9.5) : `corpus/grooves/bresil.js`
   · `ouest-africain.js` · `funk.js` · `reggae.js` · `hiphop.js` · `rock.js` (31 grooves,
   139 voix + 15 variations), registre global **`FM_GROOVES`**, même mécanique que
   `FM_CORPUS` (balises `<script src>`, assemblage au boot par la page, collision d'ID
   bloquante). `index.html` et `pratiquer.html` assemblent la table plate `GROOVES`
   (ordre des balises = ordre de la table 0.11.0). **Ajouter une famille = un fichier,
   zéro code.** Référence figée : `reference-grooves-0.11.0.json`.
2. **`pratiquer.html`** (scénario 3, hiérarchie J1) : trois blocs — **« Ce que je joue »**
   (`secPerc`, l'unique sélecteur d'instrument) / **« Ce qui m'accompagne »** (mute maître
   en tête + `secBass` + `secClave` + `secRepertoire`, « Jouer tout à » re-libellé
   **« Accompagnement rendu à »**) / **« Le clic »** (`secGroove`, `secGap`, `secSon`,
   `secScript`). Transport + roue + export audio en tête, sommaire C6 recomposé,
   lien « ← Accueil ». CSS embarqué, copie élaguée (blocs archet plein écran, wizard,
   parcours funk retirés).
3. **Mute maître de l'accompagnement (J2)** : un geste coupe couches `perc` + `bass`,
   le clic continue. Bouton en tête du bloc 2 + rappel dans le transport, `aria-pressed`,
   toast. Drapeau de **session** superposé (patron `volMuted`) : n'écrase aucun réglage,
   non persisté, levé au chargement.
4. **Feel basse (§5)** : curseur « Placement — posé ↔ poussé » **−25…+25 ms**, défaut 0,
   boutons ±1 ms, persisté avec les réglages basse (`fm-metro-bass`), borné à la
   restauration. **Identité stricte à 0** (offMs falsy → chemin de l'ordonnanceur inchangé).
5. **`index.html`** : balises grooves + assemblage `GROOVES` (la table en dur sort),
   lien discret « Pratiquer sur la page dédiée → » (dictionnaires EN/PT complétés),
   stub inerte `accompMuted` (contrat de coquille) — **inchangé fonctionnellement**.

## 2. Moteur : exactement les deux retouches actées

`recette-extraction.js` (v R-3b) prouve, contre la référence 0.10.0 (l'état validé à
l'oreille du 10/07) : les trois fichiers `moteur/*.js` sont **identiques octet pour
octet**, ligne BUILD normalisée, modulo **exactement** :

| Retouche (GO R-3 §9.6) | Fichier | Diff |
|---|---|---|
| Mute maître J2 | `fm-audio.js` (`playClick`) | +1 ligne : `if (accompMuted && (layer === 'perc' \|\| layer === 'bass')) return;` |
| Feel basse — point de recopie | `fm-audio.js` (`computeCycle`) | 1 ligne modifiée : `…, offMs: S.bass.feelMs \|\| 0 });` |
| Feel basse — état | `fm-etat.js` (`S.bass`) | +1 ligne : `feelMs: 0,` |

La recette vérifie chaque tolérance **à l'octet près, une fois exactement**, et compte
strictement les identifiants (`accompMuted` ×1, `feelMs` ×2 dans tout le moteur) :
**aucune autre retouche n'est possible sans la faire rougir.** L'ancienne partie B
(hash ligne à ligne de la coquille vs 0.10.0) est retirée — la coquille évolue
légitimement en R-3b ; sa non-régression est portée par la batterie fonctionnelle.
Restent les invariants structurels sur les DEUX pages (ordre contractuel des balises,
script principal strict sans IIFE). La suite passe de 17 à **19 assertions**.

## 3. Architecture de `pratiquer.html` (duplication transitoire, → R-4)

La coquille JS d'`index.html` est reprise **verbatim** — les seules déviations sont
marquées `R-3b (pratiquer)` dans la page : implémentation réelle du mute maître (à la
place du stub), câblage du feel, mode simple neutralisé (sans toucher au réglage
partagé `fm-metro-mode`), synchronisation feel/mute à l'INIT. Les surfaces index-only
(écran de jeu, team spirit, archet, cours funk, wizard, accueil « je joue », mode
simple/expert) vivent dans **`#fmStubs`** (display:none) : des **stubs inertes** au sens
du contrat de coquille R-3a — ils satisfont les câblages existants (dont les 21 IDs de
`fm-accomp`, panneau `play*` compris) sans offrir la fonctionnalité, qui reste sur
`index.html`. Compte Supabase et bibliothèque partagée : **absents** (décision R-3).
R-4 dissout cette duplication. Limite connue : les libellés nouveaux de la page ne sont
pas encore dans les dictionnaires EN/PT (POC i18n par correspondance — chantier
traduction transverse).

## 4. Batterie : 26 suites, 941 assertions — TOUT VERT

| Suite | Assertions | | Suite | Assertions |
|---|---|---|---|---|
| 5-1 | 20/20 | | atelier-exports 0.7.0 | 85/85 |
| 5-1-bis | 21/21 | | cajón-cymbalette | 32/32 |
| 5-2 | 23/23 | | chantier-B | 52/52 |
| 5-3 | 38/38 | | chantier-B2 | 22/22 |
| 5-3-bis | 15/15 | | P-2 | 42/42 |
| 5-3-ter | 28/28 | | P-4 | 44/44 |
| 5-3c | 21/21 | | P-6 | 56/56 |
| 5-4 | 40/40 | | P-7 | 34/34 |
| UX 0.6.6 | 48/48 | | P-8 | 32/32 |
| onboarding 0.6.7 | 49/49 | | validateur corpus | 30/30 |
| mobile 0.6.8 | 56/56 | | registre | 9/9 |
| a11y+i18n 0.6.9 | 54/54 | | **extraction (R-3b)** | **19/19** |
| | | | **grooves (nouvelle)** | **29/29** |
| | | | **pratiquer (nouvelle)** | **42/42** |

Les **19 suites historiques totalisent 746 assertions, comptes par suite inchangés**.
Évolutions : extraction 17 → 19 (§2) ; `recette-grooves.js` **29** (égalité valeur pour
valeur contre la référence figée + validateur de schéma : grilles 0/1/2,
`grid.length === count`, identités de timbre routables par `playPerc`, drapeaux,
unicité) ; `recette-pratiquer.js` **42** (chargement propre, hiérarchie J1, sélecteur
d'instrument unique, stubs inertes, contrat de coquille rempli, mute maître — coupe
`perc`+`bass`, épargne le clic, superposé, non persisté —, feel — bornes, persistance,
offMs par couche, identité à 0, réalisation intacte —, répertoire sans UI team).
Total : **941**.

## 5. Navigateur réel

- **http://** (volet Chrome embarqué) : `pratiquer.html` et `index.html` — console
  **0 erreur**, les 11 fichiers locaux (2 corpus + 6 grooves + 3 moteur) en **200**.
  Interactions vérifiées en vrai : mute maître (les deux boutons synchrones,
  `aria-pressed`, toast, levée par le rappel transport), feel (curseur → `S.bass.feelMs`,
  affichage « +15 ms », persistance dans `fm-metro-bass`, retour 0), démarrer/arrêter
  via l'ordonnanceur extrait (`isPlaying`, « ■ Arrêter »).
- **file://** (Chromium headless) : les deux pages — **0 erreur console**, BUILD 0.12.0,
  31 grooves, démarrer/arrêter OK. Le sans-serveur reste garanti.
- **À l'œil** (captures) : hiérarchie 1/2/3 dans le style maison, bouton mute accentué
  à l'état coupé, curseur feel dans la section basse.

## 6. Reste à faire (hors périmètre R-3b)

- Validation **à l'oreille et à l'œil** par Jean (mute maître, rendu du feel — la plage
  ±25 ms est à recalibrer sur le rendu réel) ; merge de la PR par Jean, ménage de
  branche, vérification Pages (les 11 fichiers en 200 sur github.io).
- R-4 : `apprendre.html` + accueil + `demo` — dissout la duplication de coquille.
- Traduction EN/PT des libellés nouveaux (chantier transverse P-2→P-8).

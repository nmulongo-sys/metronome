# Rapport de non-régression — build 0.13.0 (R-4a)

> Chantier **R-4a** de la refonte B+ (spec R-4 PROPOSÉE le 16/07, **GO Jean du 16/07 —
> recos §9 acceptées en bloc**) sur base **main = 0.12.0** (`6f1d461`, merge PR #24).
> Environnement : Node v22 (cloud), jsdom, clean-room (clone frais, LF) ; suites avec
> `--max-old-space-size=4096` ; navigateur réel Chromium headless via playwright-core,
> **http:// (serveur statique) ET file://** sur les trois pages.

## 1. Périmètre livré

1. **`apprendre.html`** (scénario 2, 791 lignes) : l'apprenant au milieu de ses leçons.
   En-tête (thème, compte, liens accueil/pratique libre) + **transport minimal**
   (démarrer/arrêter, tempo ±) + **le parcours** seul au premier niveau — **aucun tiroir
   de réglages** (généralisation C6, traitement à la racine de C2). Coquille de page
   **NOUVELLE et minimale** (la coquille évolue librement depuis R-3b) : contrat moteur
   (annexe R-3a) rempli par état neutre + hooks no-op, **stubs réduits au strict contrat
   moteur** (`#fmStubs` = `percFsPlay` + `gapTarget`, 2 éléments contre ~40 sur le patron
   R-3b). Balises : corpus (2) → moteur (3) → `coquille/fm-compte.js` → script de page —
   **pas de grooves** (vérifié : le moteur ne référence pas `FM_GROOVES`).
2. **Surcouche PARCOURS FUNK (P-4) transplantée VERBATIM** d'index.html 0.12.0 (282
   lignes), trois déviations marquées `R-4a (apprendre)` : (i) bouton **« ▶ Écouter »**
   dans la fiche (ou mention « démo à venir ») ; (ii) câblage Écouter/Charger = mode
   écoute/mode pratique ; (iii) API diagnostic `fmMetroParcours().ecoute`. Clés
   localStorage **inchangées** (`fm-metro-parcours`, `-promo`, `-niveau`,
   `pf_vote_queue`) : **la progression survit à la migration** (asserté).
3. **Mode écoute (`demo`) — ZÉRO retouche moteur** : la page injecte la démo dans les
   grilles de coquille (`percGrids`/`percMeta`/`percOffsets`) que `computeCycle` lit
   déjà, et les restaure en mode pratique. Swing porté par la démo (champ optionnel
   `demo.swing`, même formule par paires que la basse, identité à 50) — `S.swing` du
   preset jamais modifié. « Écouter » charge le preset, pose la démo et démarre ;
   « Charger » retire la démo, l'accompagnement reste : à toi de jouer.
4. **Peuplement `demo` : 73 démos** (33 Débutant + 40 Intermédiaire), format acté §9.2 :
   `{ instr, steps ∈ {4,8,16}, voix: { <voix>: [0/1/2 × steps] }, swing? }`, variante
   par instrument pour les 28 EX-SOCLE partagés. **9 exercices restent sans démo,
   motivés** (§5). Avancé/Artiste : lot de contenu R-4c.
5. **`coquille/fm-compte.js`** (première coquille partagée, GO §9.5) : le bloc COMPTE
   d'index 0.12.0 (l. 6906–7067) **déplacé verbatim** — préuve au patron figé
   (`reference-compte-0.12.0.json`, md5 `239e030f…`, partie C de recette-extraction).
   `index.html` le consomme par `<script src>` (une seule source) ; le petit markup
   (carte, ~25 lignes) reste par page. `apprendre.html` en a besoin dès R-4a : les
   votes du parcours passent par `window.fmSupabase()` (file hors-ligne sinon).
6. **`index.html`** (6 803 lignes, −486) : `secCours` + surcouche P-4 + CSS `pf-*` +
   chip sommaire **retirés** (§9.7 acté : une seule source de vérité) ; à leur place,
   la **porte** `#carteApprendre` (même libellés « Cours funk » / « parcours · plusieurs
   niveaux », déjà aux dictionnaires) + 2 chaînes nouvelles **EN et PT** ; le sommaire
   pointe sur la porte. BUILD **0.13.0** (fm-etat.js, la ligne vivante).

## 2. Moteur : rien — par construction

`recette-extraction.js` (v R-4a, 26 assertions) : les trois `moteur/*.js` restent
identiques octet pour octet au 0.10.0 (l'oreille du 10/07), **tolérances INCHANGÉES**
(ligne BUILD + les deux retouches R-3b actées, comptage strict `accompMuted` ×1 /
`feelMs` ×2 — aucune nouvelle). L'ordre contractuel des balises s'énonce désormais
**par page** : « corpus → [grooves si répertoire] → moteur → [compte] », asserté sur
les TROIS pages ; nouvelle **partie C** : fm-compte.js == bloc COMPTE 0.12.0 (md5) et
index ne porte plus la logique en dur.

## 3. Batterie canonique : 28 suites, 1 003 assertions, TOUT VERT

| Suite | 0.12.0 | 0.13.0 | Note |
|---|---|---|---|
| 19 historiques (5-1 → ux-0.6.6) | 746 | **746** | comptes par suite inchangés (20/21/23/38/15/28/21/40/42/44/56/34/32/54/85/32/52/22/48) |
| validateur corpus | 30 | **30** | vérif `demo` alignée sur le format acté §9.2 (l'ancienne anticipait `{steps,hits}` R-2) |
| registre | 9 | **9** | préservation 0.8.0 **champ `demo` mis à part** (ajout acté au schéma R-1 §4.1) |
| extraction | 19 | **26** | +2 (3ᵉ page) +5 (partie C compte) |
| grooves | 29 | **29** | inchangée |
| pratiquer | 42 | **42** | 1 ligne : BUILD 0.13.0 |
| **demo (nouvelle)** | — | **14** | validateur du champ demo (forme, parcours, périmètre, fidélité ponctuelle, liste fermée des sans-démo) |
| **apprendre (nouvelle)** | — | **41** | page minimale, contrat moteur, parcours transplanté, mode écoute, compte partagé |
| **Total** | 941 | **1 003** | zéro adaptation du harnais (`chargeHtml` inchangé) |

**Re-pointage (spec §4.3 anticipée pour les suites parcours, conséquence du §9.7
acté)** : P2, P4, P6, P7, P8 visent désormais `apprendre.html` par défaut (argument
fichier conservé). Adaptations motivées, **comptes inchangés** : (i) « hook
`fmMetroReg` conservé » → `fmMetroBass` (le rang de registre est une surface
d'index/pratiquer, pas du parcours) — P2 0.3, P4 0.3, P6 0.3 ; (ii) lectures d'UI
d'index (`subdivSel`, `gapMode`) → lectures d'état `S.subdiv`/`S.gap.mode` (l'état
fait foi, l'UI gap/subdivision vit sur index/pratiquer) — P6 6.3/6.5/6.7/6.8, P8 6.1.

## 4. Navigateur réel (Chromium headless) — les DEUX modes, les TROIS pages

**http:// et file:// : 15 vérifications chacun, tout vert.** Par page : 0 erreur
console applicative, 0 ressource locale en échec, build 0.13.0 affiché. Sur
`apprendre.html`, **joué pour de vrai** : « ▶ Écouter » (T1-01 cajón) → AudioContext
`running`, `demo.grave` dans les grilles, basse dessous, statut « Écoute — le modèle
joue » ; « Charger » → démo retirée, accompagnement en place, « Lecture — à toi de
jouer ». Sur index : porte présente, surcouche parcours absente, fm-compte chargé.
Le sans-serveur reste garanti (file:// propre, CDN gardés).

## 5. Les démos : choix d'auteur, approximations déclarées

- **Palette moteur cajón = grave/aigu** (`playPerc`) : le *tone* et le *slap* du cajón
  sont rendus par la voix `aigu` (le slap accentué, valeur 2). Le djembé a ses trois
  voix (`basse`/`tone`/`slap`). Les nuances *ghost* s'expriment par le contraste
  1 (frappe) / 2 (accent) — `playPerc` n'a pas de gain par voix (et le moteur ne
  bouge pas).
- **9 exercices sans démo, liste fermée assertée** : posture/sensation pure
  (POS-01/POS-03 ×2 parcours), timbres étouffés hors palette (CJ-DYN-03/04, DJ-DYN-03),
  alternance mesure-à-mesure non représentable sur une grille d'un cycle (B2-04 ×2).
  Fiche : bouton absent, mention « démo à venir ».
- **SUB-03** (« une mesure en croches, une en doubles ») : approximé en demi-mesure /
  demi-mesure — la transition sans trou est démontrée, pas la carrure exacte.
- **Échantillon pilote pour l'oreille de Jean** (avant tout élargissement R-4c) —
  10 démos à écouter en premier : `EX-SOCLE-T1-01` (cajón — The One),
  `EX-CJ-B1-02` (grave contre slap), `EX-DJ-B1-05` (groove backbeat),
  `EX-SOCLE-T2-03` (nappe swinguée 62), `EX-SOCLE-D1-03` (pendule e+a),
  `EX-CJ-I2-05` (synthèse 2 cellules), `EX-DJ-SON-05` (bass-tone-slap),
  `EX-SOCLE-D-PLS-04` (jouer à travers la coupure), `EX-SOCLE-D-SUB-02` (tapis de
  doubles), `EX-DJ-B2-02` (backbeat déplacé sur le « et » du 4).

## 6. Reste à faire (hors R-4a)

- **R-4b** (0.14.0) : accueil « métronome immédiat », migrations Team Spirit +
  bibliothèque → pratiquer, retraits wizard/écran de jeu/« je joue », re-pointage du
  reste de la batterie, table exhaustive.
- **R-4c** (lot de contenu) : démos Avancé + Artiste, après validation de l'échantillon
  pilote à l'oreille.
- Libellés d'`apprendre.html` non traduits EN/PT (comme pratiquer — chantier transverse).
- Toujours ouverts : ménage de branches (dont PR #13 à fermer), oreille R-3b (mute
  maître, feel ±25 ms).

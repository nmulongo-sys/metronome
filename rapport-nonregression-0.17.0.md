# Rapport de non-régression — metronomefunk 0.17.0 (R-5 : salve UX, les 3 P1 du panel)

> Build `metronomefunk-0.17.0` · 2026-07-17 · branche `claude/r5-salve-ux`, base
> `main` = `69669f5` (merge #30, 0.16.0 — **prod vérifiée avant de partir** : BUILD
> servi, 3 pages en 200, grille vivante au curseur 3→0→1→2→3→0 en Chrome réel sur
> Pages). Spec : `metronome-refonte-R5-salve-ux-spec.md` (GO de Jean du 17/07 ;
> points §8 tranchés par défaut : A = sans C4/C5, B = 3 runs, C = §9.8 amendée,
> D = formulation du panel). Arbitrage préalable acté : les 3 P1 sont **embarqués
> dans R-5**, pas de passe rapide.

## 1. Livré — trois chantiers, zéro moteur

- **R5-1 (C1) Volume + sourdine sur l'accueil** : 5e cellule de la `mini-grid`
  de la carte transport (pleine largeur — la grille d'index est en 2 colonnes),
  patron et IDs EXACTS de pratiquer (`volSlider`/`volVal`/`volMuteBtn`), câblage
  `volRender`/`volApply` repris verbatim (bouger le curseur lève la sourdine,
  non persisté — aligné pratiquer). Pas de bouton « Accomp. » (sans objet au
  premier niveau). Le moteur était déjà prêt (`S.volume`, `volMuted`,
  `masterGain` en portée globale) : **UI de page pure**. La liste fermée §9.8
  est amendée (+ volume, + sourdine) — c'est l'actage du GO.
- **R5-2 (C2) Porte « En équipe » clarifiée** : sous-titre → « bientôt — en
  attendant, la répartition des voix vit dans [Pratiquer › Team Spirit] », le
  lien (`#porteEquipeLien`) étant le SEUL élément vivant de la porte, qui reste
  inactive (equipe.html = R-6). `aria-disabled` RETIRÉ : état ARIA hérité par
  les descendants, il aurait annoncé le lien « désactivé » aux lecteurs d'écran.
  Sur pratiquer : **hash-open** à l'arrivée (l'ancre ouvre la `details.section`
  ciblée, même geste que le sommaire C6 0.6.6) — sans quoi le lien atterrissait
  sur un tiroir fermé. Bénéfice collatéral : tous les liens profonds de section
  deviennent possibles.
- **R5-3 (C3) EN/PT-BR d'apprendre.html — la dernière marche du trilingue** :
  mécanisme copié d'index (sélecteur `lang-btn` + `__I18N` clé = texte FR
  normalisé + marcheur/MutationObserver + `fmTr`), langue partagée
  `localStorage['fm-lang']` — la bascule faite sur l'accueil suit sans geste.
  **78 clés par langue** : chrome complet (header, transport, hint, libellés du
  rendu du parcours, badges, votes), **légende de la grille vivante R-4d**,
  statuts composés (segments fixes via `fmTr`, 3 sites marqués « R-5
  (apprendre) »), toast moteur (clé reprise de pratiquer), **modale compte
  COMPLÈTE** (au-delà de pratiquer, qui ne la couvre que partiellement — dette
  préexistante là-bas, candidate au rejeu). **Périmètre §4.2 tenu** : le contenu
  pédagogique du corpus (objet/consigne/critère, noms de modules, voix) reste en
  français — transverse « principes en corpus » non planifié, assumé au §5.

## 2. Moteur : rien — par construction

`recette-extraction.js` (26 assertions) : moteur identique octet pour octet au
0.10.0, **tolérances INCHANGÉES** (ligne BUILD + les deux retouches R-3b,
comptage strict). La seule ligne moteur touchée est `BUILD = 'metronomefunk-0.17.0'`
(fm-etat.js, la ligne vivante). R5-1 LIT le moteur (globals existants), R5-2/R5-3
ne le touchent pas.

## 3. Batterie canonique : 28 suites, 1005 assertions, TOUT VERT

| Suite | 0.16.0 | 0.17.0 | Note |
|---|---|---|---|
| 25 suites inchangées | 832 | **832** | comptes par suite STRICTEMENT inchangés |
| accueil | 50 | **56** | +6 : C2.1-C2.4 (volume/sourdine : présence, sourdine 1-clic gain 0, levée par le curseur, pas de mute accomp) ; D1.5 (lien profond de la porte) ; H1.3bis (clés i18n volume + ancienne annonce purgée) — D1.4 et A2.3/H1.3 RÉÉCRITES (aria-disabled retiré, volSlider sorti des « migrées ») |
| apprendre | 49 | **63** | +14 : F1.1-F1.6 (sélecteur, 78 clés symétriques, clés critiques, audit d'extraction nœuds + attributs corpus exclu, bascule → fm-lang) ; F2.1-F2.8 (second DOM `?lang=pt` : chrome PT, corpus == FR du corpus, statuts composés, légende de grille, observer vivant après vote) |
| pratiquer | 52 | **54** | +2 : section H (second DOM `#secTeam` → section OUVERTE, les autres fermées) |
| **Total** | 983 | **1005** | zéro adaptation du harnais |

Hors ajout, à compte constant : les 4 suites qui suivent la ligne vivante passent
à 0.17.0 (accueil A1.2/A1.3, apprendre, pratiquer, extraction). **Pièges
documentés dans les suites** : `const stubs = $('fmStubs')` de runTests MASQUE la
fonction de stubs factorisée (renommée `jsdomStubs`) ; le témoin corpus de F2.4
se compare au CORPUS lui-même (`PF_EX[ex].objet`), pas au DOM FR (dont le niveau
affiché a bougé pendant les sections C/D).

## 4. Navigateur réel (Chrome local) — les DEUX modes

**http://localhost:8123 ET file:// : 34 vérifications chacun, tout vert (68/68),
zéro erreur console/page**, sur les trois pages :

- **apprendre `?lang=pt`** : h1/kicker/hint/boutons (« ▶ Ouvir », « Carregar »,
  « adquirido », « Iniciante »), ▶ Iniciar/Pronto ; objet corpus AFFICHÉ EN FR
  (« S'installer, caler le cajón ») ; Écouter → statut « Escuta : … — o modelo
  toca por cima do acompanhamento. » + grille posée + légende « Sua parte… » ;
  vote → « Voto registrado: fácil. » + re-rendu TOUJOURS traduit (observer
  vivant) ; défaut FR intact (bouton FR actif).
- **index** : volume 80 % affiché, sourdine 1-clic → `masterGain.gain.value === 0`
  + `aria-pressed` + 🔇 « muet », curseur → 60 % lève la sourdine (gain 0,6 —
  tolérance float32 de l'AudioParam) ; porte « En équipe » sans `aria-disabled`,
  sous-titre reformulé, lien `pratiquer.html#secTeam` ; en PT : sous-titre et
  title de sourdine traduits.
- **pratiquer `#secTeam`** : la section Team Spirit arrive OUVERTE, les autres
  restent fermées.

NB : le volet navigateur intégré throttle le rAF (inutilisable pour tout ce qui
anime) — la vérification vivante passe par playwright-core + Chrome local,
patron établi en R-4d.

## 5. Choix d'exécution motivés (dans le cadre de la spec)

- **Cellule volume pleine largeur** (`grid-column:1 / -1`) : la mini-grid
  d'index est en 2 colonnes — un 5e item en demi-largeur laissait un trou et un
  curseur court ; le patron pratiquer (IDs, comportement) est repris tel quel.
- **`aria-disabled` retiré plutôt que contourné** : l'état est hérité par les
  descendants (spec ARIA) ; le span porte n'est pas un contrôle, l'attribut n'y
  disait rien — et il aurait neutralisé le lien pour les lecteurs d'écran.
- **Modale compte : jeu complet sur apprendre seulement.** Pratiquer garde sa
  couverture partielle (« Annuler », « Envoyer le lien », « Fermer », etc. y
  restent FR) : dette PRÉEXISTANTE hors périmètre R-5 — le rejeu du panel la
  re-pèsera. Les préfixes composés du verbatim (`'Erreur : '+msg`) restent FR
  (même dette que pratiquer, fm-compte.js intouchable).
- **« ok » et noms de voix non traduits** : « ok » est identique dans les trois
  langues (jeu IDENT de l'audit) ; les étiquettes de voix de la grille
  (`pfg-voix` : grave/aigu/basse/tone/slap) sont du vocabulaire d'instrument du
  corpus — FR par périmètre.
- **`data-v` des votes inchangé** : le verdict AFFICHÉ passe par `fmTr`
  (fácil/easy), la VALEUR envoyée à `pf_vote` reste `facile|ok|difficile`
  (aucun impact données).

## 6. Reste à faire (hors R-5 code)

- **Jean** : merge de cette PR (base `main`, vérifier `baseRefName` — piège #29
  documenté) ; vérification Pages/prod (BUILD **0.17.0** servi, volume/porte à
  l'œil sur l'accueil, bascule PT sur apprendre en prod) ; ménage de branches
  (`claude/r4c-demos-avance-artiste`, `claude/r4d-grille-exercice`, + la liste
  du brief) ; PR #13 à fermer sans merger.
- **R5-4 — rejeu panel 30 OFFICIEL** (après merge + prod vérifiée) : panel FIXE,
  3 runs (un par page, format B tranché), dashboards versionnés 0.17.0 +
  synthèse — la nouvelle référence UX ; l'arbitrage des constats restants
  (C4-C12 + dette compte de pratiquer) en sort.
- **Ensuite** : R-6 (equipe.html — le lien de la porte devient la page) ;
  transverse « contenu principes en données de corpus » (les exercices restent
  FR dans une page EN/PT tant qu'il n'est pas ouvert).

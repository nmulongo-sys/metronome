# Métronome FM — Salve UX 0.7.0 « atelier & exports » (C11–C14) — spécification

> Spec validée par Jean le 2026-07-15 (fil « 0.7.0 ») — lot optionnel L4 **inclus**,
> wake lock « lecture OU atelier » acté.
> Constats C11 à C14 du panel UX 0.6.5
> (C11/C12 : sévérité **majeur** ; C13/C14 : mineur).
> Branche : `claude/new-session-8j1kzr` (rôle « 0.7.0 »), base `main` = `3db12e6`
> (build 0.6.9). Build à livrer : `metronomefunk-0.7.0`.

## 1. Constats C11–C14 confrontés au build 0.6.9

| Point du panel | État vérifié dans le code 0.6.9 |
|---|---|
| C11 — pas de grand affichage ni de maintien d'écran | Confirmé : aucun appel `wakeLock` dans le code (l'écran se met en veille pendant les longues écoutes). En revanche **deux motifs plein écran réutilisables existent** : l'overlay percussion `#percFs` (open/close + `requestFullscreen().catch()`, bouton ▶ relié à `toggle`) et le plein écran archet (`fsLoop` en rAF dédié). Le mode atelier s'appuiera sur ce motif éprouvé. |
| C12 — micro-accrocs > 180 BPM, couches multiples | Ordonnanceur : `LOOKAHEAD_MS = 25`, `AHEAD = 0.12 s` — fenêtre de pré-planification courte pour un mobile chargé. La boucle `draw()` (rAF, ~60 fps) exécute **à chaque frame** des `querySelectorAll` (steps clave, voix percussion) et **réécrit `#statusLine` en `innerHTML` à chaque frame** même quand le texte n'a pas changé (donc re-layout inutile). Marges d'allègement sûres identifiées avant tout profilage ; le verdict final exige l'appareil réel de Jean (Android milieu de gamme). |
| C13 — exports pensés machines (JSON) | Confirmé : Team Spirit n'exporte que du JSON (`tsDownload` : « ma ligne », « tout ») ; l'archet n'a **aucun** export ; aucune vue imprimable dans l'app (pas de `window.print`, pas de `@media print`). Contrainte fichier unique : **pas de bibliothèque PDF** — impression native (→ « Enregistrer en PDF » du navigateur) + PNG par canvas. |
| C14 — pas de validation en direct des syntaxes expertes | Confirmé : `parseScript` (routine) et `parseBowSeq` (séquence T/P) produisent déjà des messages d'erreur exploitables… mais s'arrêtent à la **première** ligne fautive et ne s'exécutent qu'au clic « ▶ Lancer » ou au `change` (blur) du champ — jamais pendant la frappe. Les hésitants du panel n'ont aucun retour avant d'oser exécuter. |

## 2. Périmètre — quatre volets, treize lots

### Volet W — mode atelier (C11)

#### W1 — Overlay « atelier » plein écran
- Nouvel overlay `#atelierFs` sur le motif `#percFs` : **BPM en très grand**
  (lisible à plusieurs mètres — cible ≥ 25 % de la hauteur d'écran), nom de tempo,
  compteur de mesure, et trois **gros boutons tactiles** : ▶/■, − et + (cibles ≥ 64 px).
- − / + : pas de ±1, **répétition automatique à l'appui maintenu** (motif appui long) ;
  bornes du slider tempo respectées (30–260).
- Rappel d'état minimal : gap/break en cours (réutilise les fragments `fmTr` existants
  de `#statusLine`), rien d'autre — l'écran doit rester dépouillé.
- Accès : bouton « ⛶ Atelier » près de la grappe tempo (position exacte à l'implémentation,
  cohérente avec les boutons ⛶ existants). Fermeture ✕ + touche Échap.
- Comme `#percFs` : `requestFullscreen().catch(()=>{})` — l'overlay fonctionne même si le
  plein écran natif est refusé.

#### W2 — Wake Lock (maintien d'écran)
- `navigator.wakeLock.request('screen')` **pendant la lecture ou tant que le mode atelier
  est ouvert** ; libération au stop/fermeture ; ré-acquisition sur `visibilitychange`
  (le verrou est perdu quand l'onglet passe en arrière-plan).
- **Silencieux si l'API est absente** (vieux navigateurs) : aucun message, aucun impact —
  amélioration progressive pure. Témoin discret dans le mode atelier quand le verrou est
  actif (ex. petit ☀ dans la barre), pas de vocalisation.

### Volet P — performance audio (C12)

#### P1 — HUD de mesure `?perfhud=1`
- Sous flag URL uniquement (motif I5/0.6.9 : **aucun effet sans le flag**) : petit HUD
  affichant la gigue de l'ordonnanceur (écart réel entre ticks vs 25 ms, max glissant),
  la marge de planification résiduelle (avance minimale des événements audio posés),
  et le fps effectif du rAF. C'est l'outil du protocole d'essai (P4).

#### P2 — Allègements sûrs de `draw()`
- Mise en **cache des collections DOM** interrogées à chaque frame (steps clave, voix
  percussion), invalidée aux reconstructions de grilles (points de reconstruction déjà
  identifiés : `refreshPercGrids`/rebuilds).
- `#statusLine` : ne réécrire l'`innerHTML` **que si le texte change** (mémo de la
  dernière valeur) ; idem pour les `classList.toggle('cur')` — ne toucher les classes
  que quand l'index courant change de valeur.
- Aucun changement visuel attendu : uniquement moins de travail par frame.

#### P3 — Fenêtre de pré-planification élargie
- `AHEAD` 0.12 → **0.20 s** (LOOKAHEAD_MS inchangé à 25) : plus de résilience quand le
  fil principal est occupé (rendu, GC) au prix d'une latence de réaction aux changements
  de tempo/réglages qui reste imperceptible (< 200 ms, dans la norme des métronomes).
- Le visuel reste synchrone : la roue et les curseurs lisent `audioCtx.currentTime`,
  pas la file de planification.

#### P4 — Protocole d'essai sur appareil réel (Jean)
- Rien à coder au-delà de P1 : sur l'Android milieu de gamme, > 180 BPM, percussion +
  basse + clic actifs, `?perfhud=1`, comparer avant/après (Pages 0.6.9 vs branche 0.7.0).
- **Verdict à l'essai** : si des accrocs persistent, un lot ultérieur « alléger le rendu
  de la roue pendant la lecture » sera spécifié à part (pas codé en aveugle dans cette
  salve — reco panel conditionnelle : « si nécessaire »).

### Volet E — exports élèves (C13)

#### E1 — Vue imprimable Team Spirit (→ PDF)
- Bouton « 🖨 Imprimer / PDF » dans Team Spirit : ouvre une **vue print-friendly générée
  en local** (document dédié, aucune ressource externe) — méta du groove (nom, famille,
  chiffrage, tempo), puis **une grille par participant** : voix × pas, frappes ●/accents,
  doigtés D/G existants (`percHandsFor`/mains fusionnées), légende. Noir sur blanc,
  pensé photocopie.
- `window.print()` : l'utilisateur imprime ou « Enregistre en PDF » (natif partout,
  y compris Android). **Aucune bibliothèque externe** (contrainte fichier unique).
- Portée : groove complet ou « ma ligne » (mêmes périmètres que les exports JSON actuels).

#### E2 — Export PNG de la grille (pupitre / partage)
- Bouton « ↓ PNG » : rendu de la même grille sur un **canvas hors écran** →
  `toDataURL('image/png')` → téléchargement (motif `tsDownload`/`dl` existant).
  Résolution fixe lisible (ex. 1600 px de large), thème clair forcé.

#### E3 — Impression / PNG de la séquence d'archet
- Mêmes deux boutons dans la section archet : la séquence (jetons T/P/R avec longueurs
  et temps), la **légende** existante (tirer/pousser/reprise) et la technique choisie,
  en présentation « à poser sur un pupitre ». PNG via canvas (le dessin de la jauge
  existe déjà — réutilisé en rendu statique), impression via la même vue locale que E1.
- **Le JSON existant ne change pas** (réimportation) — les nouveaux formats s'ajoutent.

### Volet L — lint en direct des syntaxes expertes (C14)

#### L1 — Lint live du script de routine
- `parseScript` étendu en mode « rapport » : collecte **toutes** les lignes fautives
  (numéro de ligne + contenu) au lieu de s'arrêter à la première ; le comportement
  du bouton ▶ (première erreur bloquante) ne change pas.
- Sur `input` (débobiné ~300 ms) : sous le champ, `✔ n segments — durée totale ~X` si
  tout est bon, sinon `✖ ligne 3 : « 80bpm » — attendu : 80bpm 5min · 80->120bpm 10min ·
  gap 2/16 · gap off · swing 62`. Zone en `role="status"` discret (motif `.script-status`).
- Le lint n'exécute rien : lecture seule, aucun effet sur l'état du métronome.

#### L2 — Lint live de la séquence d'archet
- Même motif sur `bowSeqInput` : jeton fautif cité + rappel de syntaxe
  (`T50x1`, `P20x0.5`, `Rx0.5`, option `n4` pour les liaisons). `bowCompile` au `change`
  inchangé ; le lint sur `input` est purement informatif.

#### L3 — Boutons d'insertion d'exemples
- Sous le textarea du script : chips « + 5 min à 80 », « + accelerando », « + gap 2/16 »,
  « + swing » qui insèrent la ligne type à la position du curseur (reco panel : les
  hésitants partent d'un exemple qui marche). Sous le champ archet : chips des presets
  de jetons (« + tiré 50 % », « + poussé 50 % », « + reprise »).

#### L4 — Coloration des jetons (inclus, décision Jean)
- Reco panel « coloration simple des jetons reconnus » : overlay `<pre>` synchronisé
  derrière le textarea rendu transparent (seule technique sans lib dans un textarea).
  Palette sobre : directives reconnues teintées par type (tempo, gap, swing,
  commentaire), lignes fautives soulignées. Synchro du scroll au `scroll`/`input` ;
  **repli propre** : si l'overlay se désynchronise (zoom mobile), il se désactive
  seul (`visibility:hidden`) et L1 reste le retour d'erreur de référence.

### Transverse (acquis 0.6.9 à respecter)
- **i18n** : toute nouvelle chaîne visible entre dans les dictionnaires **EN et PT**
  (symétrie exigée, l'audit I4 de la recette 0.6.9 doit rester vert) ; statuts composés
  par fragments `fmTr` (motif I2).
- **a11y** : nouveaux contrôles nommés (0 contrôle sans nom accessible), texte ≥ 13 px,
  contrastes via les variables `--fm-*-text`, `:focus-visible` hérité ; les gros boutons
  atelier ont des `aria-label` explicites ; le HUD perf (debug) est `aria-hidden`.

## 3. Hors périmètre (rappel)
Traduction du contenu pédagogique P-2/P-4 (chantier dédié, dette documentée 0.6.9) ;
P-5 parcours ; optimisation du rendu de la roue (attend le verdict P4) ; bibliothèque PDF
externe (jamais — fichier unique) ; mini-schémas (réévalués : rien de neuf qui les
justifie dans cette salve) ; vocalisation de la roue par battement (non, tranché) ;
congas/bongos/shaker (jamais) ; réouverture auto du wizard (non, tranché deux fois).

## 4. Recette et livraison
- `recette-atelier-exports-0.7.0.js` (jsdom 28, headless, Node 22) : overlay atelier
  (ouverture/fermeture, gros boutons câblés, bornes tempo, répétition d'appui) ; wake lock
  (stub `navigator.wakeLock` : acquisition au play/à l'ouverture atelier, libération,
  ré-acquisition sur `visibilitychange`, **silence si API absente**) ; HUD perf absent
  sans flag / présent avec ; `AHEAD ≥ 0.2` ; `#statusLine` non réécrit quand le texte est
  inchangé (compteur d'écritures espionné) ; vue imprimable (contenu généré : méta groove,
  grilles, doigtés) ; exports PNG (dataURL non vide, dimensions attendues) pour Team
  Spirit et archet ; JSON inchangé ; lint script (valide, invalide, **multi-erreurs**,
  numéros de ligne, en EN et PT) ; lint archet ; chips d'insertion (au curseur) ;
  i18n des nouvelles chaînes EN + PT + symétrie ; comptages en **≥** (motif acté) ;
  tampon **build ≥ 0.7.0**.
- Non-régression : batterie complète **18 suites** (17 existantes = 605 attendus + la
  nouvelle), 0 rouge exigé avant PR. L'audit i18n 0.6.9 (§8) doit passer avec les
  nouvelles chaînes.
- **Aucune nouvelle clé localStorage** (le mode atelier ne persiste rien).
- `index.html` livré en **fichier complet** (jamais un patch), README mis à jour
  (build courant + journal 0.7.0).
- PR vers `main`, merge **après batterie verte et essai de Jean** — essai qui inclut le
  protocole P4 sur l'Android milieu de gamme, le wake lock en conditions réelles
  (longue écoute, écran qui ne s'éteint plus), une impression/PDF réelle d'une grille,
  et le lint en tapant une routine fausse.

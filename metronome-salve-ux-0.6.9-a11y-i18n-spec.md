# Métronome FM — Salve UX 0.6.9 « accessibilité & i18n » (C4, C10) — spécification

> Spec validée par Jean le 2026-07-14 (fil « salve 0.6.9 »), lot optionnel I5 inclus.
> Constats C4 et C10 du panel UX 0.6.5
> (sévérité **majeur** ; C4 : 6 testeurs de 66 ans et +, C10 : testeuse brésilienne).
> Branche : `claude/new-session-iwjb01` (rôle « 0.6.9 »), base `main` = `9e25b69`
> (build 0.6.8). Build à livrer : `metronomefunk-0.6.9`.

## 1. Constats C4/C10 confrontés au build 0.6.8

| Point du panel | État vérifié dans le code 0.6.8 |
|---|---|
| Petites polices (11 px, opacité 0.5) | Confirmé : tampon de build `11px` + `opacity:.5` ; ~25 déclarations sous `.8125rem` (13 px) dont hints, `.sec-sub`, statuts ; 7 `opacity` ≤ .65 dont plusieurs sur du texte. |
| Faibles contrastes | Mesuré (WCAG) : `--fm-sub` **conforme** (5.67:1 clair, 8.23:1 sombre) ; mais texte couleur `--fm-accent` en thème clair = **3.35:1** < 4.5, et texte `opacity:.5` ≈ **3.17:1** < 4.5. Thème sombre globalement conforme. |
| ~18 aria pour 200+ contrôles | Confirmé, à peine mieux : **28** attributs `aria-*` pour **206** contrôles (`button/input/select/summary`) ; 4 zones `aria-live` seulement (accord basse ×2, statut parcours, toast). |
| Roue canvas muette | Confirmé : `#wheel` sans `role` ni alternative ; mais `#statusLine` (Prêt / Arrêté / coupures) est juste dessous — il suffit de le rendre vocalisable. |
| Focus clavier peu visible | Confirmé : un seul `:focus-visible` stylé (inputs de la carte compte, 0.6.6). Rien de global. |
| Zoom 150 % fragile | Méta viewport saine (pas de `maximum-scale`) ; à vérifier sur appareil (essai Jean). |
| Libellés/aides restant en FR après bascule (C10) | Confirmé et **structurel** : le walker i18n compare le nœud texte entier au dictionnaire → les statuts **composés en JS** (`percStatusSet('… ' + x)`, `statusLine`, ~60 affectations) ne peuvent jamais matcher. Manquants avérés : hint basse entier, « Micro-timing armé — glisse à gauche/droite », statuts gap « ● COUPÉ / ● GAP … », ' muet' (Team Spirit). Le `confirm()` du reset a sa clé dans les dictionnaires… jamais appliquée (dialogue natif, hors DOM). Dictionnaires EN/PT symétriques (385/385). |

## 2. Périmètre — deux volets, neuf lots

### Volet A — accessibilité (C4)

#### A1 — Texte utile ≥ 13 px
- Toute déclaration `font-size` portant du **texte utile** (hints, `.sec-sub`, statuts,
  libellés, aides, valeurs) passe à **≥ .8125rem (13 px)** ; le tampon de build 11 px aussi.
- Exclusions justifiées (liste tenue dans la recette) : ornements purement décoratifs et
  exposants typographiques (ex. degrés d'accord `I⁷`), qui ne portent pas d'information seule.
- Aucun changement de contenu ni de structure : uniquement des tailles.

#### A2 — Contrastes AA (≥ 4.5:1)
- Le texte en `--fm-accent` sur fond clair passe par une nouvelle variable dédiée
  `--fm-accent-text` (thème clair : valeur assombrie ≥ 4.5:1, ex. base `#8a5a2a` à ajuster ;
  thème sombre : `--fm-accent` actuel déjà conforme, 7.55:1). Les usages **non textuels**
  de `--fm-accent` (bordures, fonds, halos) ne changent pas.
- Les `opacity` ≤ .65 portant du **texte** sont remplacées par `color: var(--fm-sub)`
  (5.67:1) ou une opacité ≥ .75 vérifiée ; les opacités sur éléments non textuels ne
  changent pas.
- La recette **calcule** les ratios WCAG des paires déclarées (fonction de luminance
  embarquée) — pas de valeurs en dur non vérifiées.

#### A3 — ARIA : nommer et vocaliser
- **Zones d'état vocalisables** : `aria-live="polite"` (+ `role="status"`) sur
  `#statusLine`, le statut percussion, le feedback d'export ; la roue `#wheel` reçoit
  `role="img"` + `aria-label` statique (« Roue du métronome — les temps du cycle ») —
  c'est `#statusLine`, juste dessous, qui vocalise l'état (reco panel), pas un flux
  par battement (inutilisable au lecteur d'écran).
- **Nom accessible sur les contrôles** : audit systématique — tout `button/input/select`
  doit avoir un nom accessible (`<label for>`, label englobant, `aria-label` ou contenu
  texte). La recette compte les contrôles sans nom : objectif **0** (liste d'exclusions
  justifiées si un cas décoratif résiste).
- **Groupes** : `role="group"` + `aria-label` sur les grappes de contrôles sans légende
  visible (ex. bloc export audio, grappes −/+ des sliders).

#### A4 — Focus visible global
- Règle globale `:focus-visible { outline: 2px solid var(--fm-accent); outline-offset: 2px; }`
  (le style compte 0.6.6 reste, harmonisé). Aucun `outline:none` sans remplacement visible.

#### A5 — Zoom 150–200 %
- Rien à coder a priori (viewport saine, layout en flex/grid) : vérification **manuelle par
  Jean** au zoom 150 puis 200 % pendant l'essai, avec correctifs de reflow si besoin.

### Volet I — i18n (C10)

#### I1 — Helper `fmTr()` pour les chaînes JS
- Le module i18n expose `window.fmTr(fr)` : retourne la traduction de la langue courante ou
  la chaîne française (fallback). Utilisable **avant** `DOMContentLoaded` (lecture directe
  du dictionnaire).
- Le `confirm()` du reset (C8) passe par `fmTr()` — sa clé existante devient enfin effective.

#### I2 — Statuts dynamiques traduits
- Les fragments **fixes** des statuts composés passent par `fmTr()` au moment de la
  composition ; clés ajoutées à EN **et** PT à l'identique (règle 0.6.7 : jamais scinder
  une clé dans une seule langue).
- Périmètre : les ~19 chaînes distinctes de `percStatusSet` (dont « Micro-timing armé —
  glisse à gauche/droite », dette 0.6.8), les états de `#statusLine` (« Prêt », « Arrêté »,
  « ● COUPÉ — tiens le tempo ! », « ● GAP — … en silence, le reste continue », « mesure »),
  et ' muet' (lignes Team Spirit).
- Les fragments variables (noms de voix, compteurs, noms de séquence) restent interpolés.

#### I3 — Hint basse traduit
- Le hint de la section basse (« Une voix de basse funk synthétisée… ») est ajouté aux
  dictionnaires EN et PT — **purement additif**, aucune clé existante scindée ni re-clée.

#### I4 — Audit i18n systématique (recette)
- La recette extrait **toutes** les chaînes FR visibles du DOM statique (nœuds texte +
  `placeholder/title/aria-label`) et vérifie leur présence dans EN **et** PT, avec liste
  d'exclusions justifiées (noms propres, symboles, termes identiques dans les trois
  langues). Symétrie EN ↔ PT exigée (0 clé orpheline).

#### I5 — Marqueur debug clé manquante (optionnel, décision Jean)
- `?lang=en&i18ndebug=1` : le walker marque (classe CSS, liseré) les nœuds restés en FR —
  implémente la reco « fallback visible » du panel côté audit, sans rien changer pour
  l'utilisateur final. Coût faible (le walker sait déjà où il ne matche pas).

## 3. Hors périmètre (rappel)
Mode atelier, exports, perf audio, lint des syntaxes (C11–C14 → 0.7.0) ; mini-schémas
(réévaluer en 0.7.0) ; vocalisation par battement de la roue (non : `#statusLine` suffit,
voir A3) ; remplacement du `confirm()` natif par une boîte in-app (reporté — I1 le rend
traduit, c'est le besoin exprimé) ; congas/bongos/shaker (jamais) ; réouverture
automatique du wizard (non, tranché deux fois).

## 4. Recette et livraison
- `recette-a11y-i18n-0.6.9.js` (jsdom 28, headless, Node 22) : tailles minimales (A1, avec
  exclusions) ; ratios de contraste **calculés** (A2) ; zones `aria-live`/`role` présentes,
  0 contrôle sans nom accessible (A3) ; règle `:focus-visible` globale (A4) ; `fmTr()`
  exposé et effectif sur le `confirm()` (I1) ; statuts dynamiques traduits en EN et PT (I2,
  simulation par `Event` génériques, motif 0.6.8) ; hint basse traduit (I3) ; audit
  d'extraction complet EN/PT + symétrie des dictionnaires (I4) ; comptages en **≥** partout
  où un ajout de contenu ne doit pas casser (motif acté 0.6.7/0.6.8) ; tampon **build ≥ 9**.
- Non-régression : batterie complète **17 suites** (16 existantes = 551 attendus + la
  nouvelle), 0 rouge exigé avant PR.
- Aucune nouvelle clé localStorage prévue (rien à ajouter au reset C8 ni au README).
- `index.html` livré en **fichier complet** (jamais un patch), README mis à jour
  (build courant + journal 0.6.9).
- PR vers `main`, merge **après batterie verte et essai de Jean** (dont zoom 150–200 %,
  bascule EN/PT sur les statuts, lecteur d'écran si possible).

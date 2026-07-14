# Métronome FM — Salve UX 0.6.8 « mobile & tactile » (C3) — spécification

> Spec validée par Jean le 2026-07-14 (fil « salve 0.6.8 »). Constat C3 du panel UX 0.6.5
> (sévérité **majeur**, 7 testeurs concernés). Branche : `claude/new-session-t939at`
> (rôle « 0.6.8 »), base `main` = `ec54d6b` (build 0.6.7). Build livré : `metronomefunk-0.6.8`.

## 1. Constat C3 confronté au build 0.6.7

| Point du panel | État vérifié dans le code 0.6.7 |
|---|---|
| Un seul breakpoint (740 px) | Confirmé : `@media (max-width: 740px)` seulement (+ un `min-width:640px` pour la grille parcours). Rien sous 480 px. |
| Cibles < 44 px | Boutons −/+ des sliders **38×38** ; `.btn-sm` ≈ 35 px de haut ; cases mini percussion **26×34** ; cases à cocher 16 px. |
| Drag micro-timing impraticable au doigt | Confirmé, aggravé : `touch-action: none` sur les cases percussion → le doigt posé sur la grille bloque aussi le **défilement** de la page. Drag armé dès 3 px de mouvement. |
| Sliders durs à régler précisément | Seul le tempo a des boutons −/+. Swing (50–85 %) et décalage de placement (−80…+80 ms) n'en ont pas. |
| `summary` déclenchés involontairement | Cause identifiée : les termes `.term` (infobulles C2) placés **dans** les `summary` — taper le terme pour lire l'infobulle déplie/replie la section. |

## 2. Périmètre — cinq lots

### M1 — Breakpoint ≤ 480 px
Nouvelle media query `@media (max-width: 480px)` :
- padding des cartes et sections resserré (22 px → 14 px), padding du `body` réduit ;
- libellés de `.row` en pleine largeur (suppression du `min-width:195px` qui casse la ligne) ;
- affichage tempo légèrement réduit (4.2 rem → 3.4 rem).
**Aucun contenu masqué** : uniquement du reflow.

### M2 — Cibles tactiles ≥ 44 px
Via `@media (pointer: coarse)` — le rendu bureau (souris) ne change pas :
- boutons −/+ des sliders : 38 → **44 px** ;
- `.btn-sm` : `min-height: 44px` ;
- pouces des sliders : 20 → **28 px** ;
- zone des cases à cocher `.check` : `min-height: 44px` ;
- cases mini percussion : 26×34 → **32×44**.

### M3 — Micro-timing à l'appui long (tactile)
- Souris : comportement 0.6.7 inchangé (drag immédiat).
- Doigt : `touch-action: pan-y` sur les cases percussion (le défilement vertical redevient
  possible) ; le drag micro-timing ne s'arme qu'après un **appui long ≈ 400 ms** sur une case
  active. Retour visuel (halo accent, classe `.timing-armed`) + message de statut
  « Micro-timing armé — glisse à gauche/droite ».
- Un glissement avant la fin de l'appui long = défilement normal (drag annulé).
- Tap simple = cycle silence/frappe/accent inchangé ; double-tap de remise à zéro conservé.
- Écart assumé avec la reco du panel (« poignée de drag dédiée ») : une poignée par case
  (16 cases × jusqu'à 4 voix) serait illisible sur la grille mini ; l'appui long est
  l'équivalent ergonomique standard. Décision Jean 2026-07-14.

### M4 — Boutons ±1 sur les sliders fins
Boutons −/+ (style `.slider-row button`, mêmes cibles que M2) sur :
- **Swing** : ±1 % (bornes 50–85 respectées) ;
- **Décalage de placement** : ±1 ms (bornes −80…+80 respectées).
Les autres sliders (volume, fréquences, legato, gap, tempo du wizard) restent tels quels —
pas des réglages « fins » au sens du panel.

### M5 — `summary` plus stricts
Taper un terme `.term` situé dans un `summary` affiche l'infobulle (focus) **sans**
déplier/replier la section (garde `click` : `preventDefault` + `stopPropagation` + `focus()`).

## 3. Hors périmètre (rappel)
Accessibilité + i18n (C4, C10 → salve 0.6.9, y compris hint basse non traduit, `confirm()`,
« · muet ») ; mini-schémas (réévaluer en 0.7.0) ; congas/bongos/shaker (jamais) ;
réouverture automatique du wizard (non, tranché deux fois).

## 4. Recette et livraison
- `recette-mobile-0.6.8.js` (jsdom 28, headless, Node 22) : règles CSS 480 px / `pointer: coarse`
  / valeurs 44 px ; boutons ±1 présents et **câblés** (le clic modifie l'état et l'affichage,
  bornes respectées) ; logique d'appui long (armement après délai, annulation par mouvement,
  tap simple intact) ; garde `.term` en summary ; nouvelles règles absentes du chemin souris ;
  tampon **build ≥ 8** (motif « ≥ » acté en 0.6.7).
- Non-régression : batterie complète **16 suites** (15 existantes = 495 attendus + la nouvelle),
  0 rouge exigé avant PR.
- `index.html` livré en **fichier complet** (jamais un patch), README mis à jour
  (build courant + journal 0.6.8).
- PR vers `main`, merge **après batterie verte et essai de Jean sur Android**.

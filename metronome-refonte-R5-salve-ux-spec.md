# Métronome — Refonte multi-styles · R-5 : salve UX (les 3 P1 du panel) + rejeu panel 30 officiel — spécification

> **Statut : GO de Jean reçu le 17/07 — exécutée (build 0.17.0).**
> Rédigée le 2026-07-17. Base d'exécution : `main` = `69669f5` (merge #30, R-4d,
> build 0.16.0, prod vérifiée). Points §8 tranchés par défaut au GO : A = sans
> C4/C5 · B = 3 runs · C = liste fermée §9.8 amendée · D = formulation du panel.
> Arbitrage préalable acté (17/07) : les 3 P1 du panel sont **embarqués dans
> R-5**, pas de passe rapide séparée.

---

## 0. Cadre et préalables

- **Préalable bloquant** : la PR #30 mergée par Jean + prod 0.16.0 vérifiée
  (BUILD servi, grille vivante visible sur apprendre). R-5 ne part pas avant.
- **Contraintes invariantes** (rappel, non renégociées) :
  - moteur `moteur/*.js` **verbatim** (md5 == 0.10.0 asserté) — R-5 est
    **zéro moteur** : les trois chantiers sont des retouches de page ;
  - tolérances de comparaison inchangées (ligne `BUILD` + `accompMuted` ×1 +
    `feelMs` ×2) — aucune nouvelle ;
  - livraison **fichiers complets**, jamais un patch ; pas d'étape de build ;
  - batterie clean-room complète + navigateur réel deux modes (http:// et
    file://) avant PR ; rapport de non-régression 0.17.0 joint ;
  - **Jean merge la PR lui-même**.
- **Source des constats** : dashboard panel 0.14.0
  (`panel-tests-ui-metronomefunk-accueil-0.14.0.html`), constats C1, C2, C3.
  Nota : C3 (EN/PT d'apprendre) était classé P2 par le panel ; il est promu au
  rang des « 3 P1 » par l'arbitrage du 17/07.

---

## 1. Objet

Trois chantiers UX ciblés issus du panel, puis le **rejeu officiel du panel
fixe de 30 personas** sur l'app refondue **en prod**, les trois pages. Le
dashboard du rejeu devient la nouvelle référence UX du portail et alimente
l'arbitrage des constats restants (C4–C12).

| Lot | Constat | Page(s) touchée(s) | Effort |
|---|---|---|---|
| R5-1 Volume + sourdine sur l'accueil | C1 (majeur, 7 testeurs) | index.html | faible |
| R5-2 Clarifier la porte « En équipe » | C2 (majeur, 4 testeurs) | index.html + pratiquer.html (3 lignes) | faible |
| R5-3 EN/PT-BR d'apprendre | C3 (majeur, 3 testeurs) | apprendre.html | moyen |
| R5-4 Rejeu panel 30 officiel | — | les 3 pages EN PROD | dashboard(s) |

---

## 2. R5-1 — Volume + sourdine sur l'accueil (C1)

### 2.1 Constat et décision

La liste fermée du premier niveau (spec R-4 §9.8) excluait volume et sourdine ;
7 testeurs ont buté dessus pendant la tâche de base. **Le GO de Jean sur cette
spec vaut amendement de la liste fermée §9.8 : + volume, + sourdine 1-clic.**
(Le rapport R-4b §5 avait provisionné ce regret : « chaque item est une
réintégration de quelques lignes ».)

### 2.2 Réalisation

- **Le moteur est déjà prêt** : `S.volume` (défaut 0.8, fm-etat.js:87),
  `volMuted` (fm-etat.js:134) et `masterGain` (appliqué à la création du
  contexte, fm-audio.js:16) vivent en portée globale partagée. R5-1 est
  **UI de page pure**.
- **UI** : 5e cellule de la `mini-grid` de la carte transport d'index.html,
  **patron exact de pratiquer.html:1734-1737, IDs identiques** :
  - `label` « Volume » + `#volVal` (« · 80 % », `· muet` quand sourdine) ;
  - `input[type=range] #volSlider` 0–100, valeur 80 ;
  - bouton `#volMuteBtn` 🔊/🔇, `aria-pressed`, title « Sourdine générale
    (coupe tout le son en un clic) ».
  - PAS de bouton « Accomp. » (pas de couches d'accompagnement au premier
    niveau — sans objet sur index).
- **Câblage** : reprise verbatim du bloc pratiquer.html:4826-4840
  (`volRender`/`volApply` + les deux écouteurs ; bouger le curseur lève la
  sourdine). Volume **non persisté** (aligné sur pratiquer : session seule).
- **i18n** : clés EN/PT ajoutées aux dictionnaires `__I18N` d'index
  (les traductions existent déjà dans pratiquer — reprise telle quelle).

### 2.3 Recette

Extension de `recette-accueil.js` : présence des 3 éléments (`volSlider`,
`volVal`, `volMuteBtn`) ; slider → `S.volume` mis à jour + affichage % ;
clic sourdine → `aria-pressed=true` + 🔇 + `masterGain.gain.value === 0`
(contexte créé) ; bouger le curseur → sourdine levée. Navigateur réel :
démarrer le clic, couper, vérifier gain 0, rouvrir.

---

## 3. R5-2 — Clarifier la porte « En équipe » (C2)

### 3.1 Constat et décision

La porte inactive annonce « bientôt — jouer à plusieurs, chacun sa ligne »
alors que Team Spirit vit déjà sur Pratiquer : les utilisateurs « collectifs »
cherchent, une cheffe de chœur a failli abandonner. En attendant equipe.html
(R-6), le sous-titre dit où ça vit, avec un lien direct.

### 3.2 Réalisation

- **index.html** — la porte `#porteEquipe` (index.html:671-674) **reste
  inactive** (pas de fausse promesse R-6). Son sous-titre devient :

  > bientôt — en attendant, la répartition des voix vit dans
  > [Pratiquer › Team Spirit](pratiquer.html#secTeam)

  Le lien est un vrai `<a href="pratiquer.html#secTeam">` DANS le sous-titre
  (la porte elle-même reste un `<span>` inactif ; le lien est le seul élément
  cliquable, focusable au clavier). Retirer `aria-disabled` du problème : le
  lien porte son propre label.
- **pratiquer.html** — micro-ajout (page, zéro moteur) : au chargement, si
  `location.hash` cible une `details.section` existante, l'ouvrir
  (`el.open = true`) et `scrollIntoView` — même geste que le sommaire
  (pratiquer.html:5081-5089). Sans cela le lien profond scrolle vers un
  `<details>` fermé. (Bénéfice collatéral : tous les liens profonds de
  section deviennent possibles.)
- **i18n** : mise à jour des clés du sous-titre dans les dictionnaires EN/PT
  d'index (l'ancienne clé « bientôt — jouer à plusieurs, chacun sa ligne »
  est remplacée) ; nouvelles clés côté pratiquer : aucune (pas de texte
  nouveau).
- **title de la porte** (index.html:671) aligné sur le nouveau sous-titre.

### 3.3 Recette

`recette-accueil.js` : le sous-titre contient « Team Spirit » + le lien
`a[href="pratiquer.html#secTeam"]` existe et est focusable ; la porte reste
non-cliquable hors lien. `recette-pratiquer.js` : simulation
`location.hash = '#secTeam'` au chargement → `#secTeam.open === true`.
Navigateur réel : clic du lien depuis index → atterrissage section ouverte.

---

## 4. R5-3 — EN/PT-BR d'apprendre.html (C3)

### 4.1 Constat et décision

La bascule trilingue est impeccable sur index et pratiquer ; apprendre reste
100 % FR — le lusophone retombe en français sans avertissement en franchissant
la porte. R5-3 pose la **dernière marche du trilingue** sur les libellés
propres de la page.

### 4.2 Périmètre — libellés PROPRES de la page, pas le contenu corpus

- **TRADUIT** (chrome de la page) : header (titre, kicker, liens retour,
  boutons thème/compte), carte transport (labels, « Prêt », états), carte
  parcours (titre, sous-titre, hint), libellés générés par le rendu du
  parcours (« ▶ Écouter », « Charger », « acquis », votes et leurs états,
  messages `pfStatus`, mentions « sans démo »), **légende de la grille
  vivante R-4d** (`pfg-legende` : frappe/accent/curseur), messages du mode
  écoute/démo, toasts et confirmations, attributs `title`/`aria-label`/
  `placeholder`.
- **RESTE EN FRANÇAIS** (documenté au rapport et au dashboard du rejeu) : le
  contenu pédagogique venu du corpus — titres/objectifs/critères des
  exercices, noms de modules, textes « principes ». C'est le chantier
  transverse déjà identifié « contenu principes en données de corpus »,
  non planifié ; R5-3 ne crée pas de dette nouvelle, il résorbe celle du
  chrome. Conséquence assumée : l'exercice s'affiche en FR dans une page
  EN/PT — le panel 0.14.0 le savait (reco C3).
- Le badge « FR sur la porte Apprendre » (reco court-terme du panel) est
  **abandonné** : R5-3 traite la cause.

### 4.3 Réalisation — mécanisme identique aux deux autres pages

- **Sélecteur de langue** : groupe `.lang-btn` FR/EN/BR dans
  `header-actions`, copie du patron index.html:596-598 (drapeaux SVG inline)
  + les styles `.lang-btn` (index.html:83-91).
- **Dictionnaires** : bloc `window.__I18N = { en: {...}, pt: {...} }`
  clé = texte FR normalisé, comme sur les deux autres pages. Volumétrie
  estimée : ~60–90 clés par langue (chrome + libellés du rendu parcours +
  légende grille). Les clés déjà traduites sur index/pratiquer (« Se
  connecter », « Mode sombre », raccourcis, etc.) sont **reprises telles
  quelles** — cohérence de vocabulaire inter-pages.
- **Moteur de bascule** : copie du bloc IIFE d'index.html:1700-1737
  (walker + `MutationObserver` + `setLang`/`highlight`). La langue vit déjà
  dans `localStorage['fm-lang']` **partagé** : une bascule faite sur index
  suit automatiquement sur apprendre dès le chargement — c'est exactement le
  parcours du testeur lusophone du panel.
- **Chaînes composées** (`'Chargé : ' + E.objet + ' — lance le métronome.'`,
  `'Vote enregistré : ' + v`, compteurs `d + '/' + n`) : traduites via le
  helper `fmTr` (patron index.html:581) appliqué aux **segments fixes** au
  point de composition — la part corpus (`E.objet`) reste FR (§4.2). Le
  walker ne peut pas les attraper (texte dynamique recomposé), le
  MutationObserver retraduit ce qui est statique re-rendu (`pfRender`).
- **Piège connu** (mémoire de session) : `pfVote → pfRender` re-rend le
  parcours — la recette requêtera les cartes FRAÎCHES après tout vote.

### 4.4 Recette

Extension de `recette-apprendre.js` : les 3 boutons `.lang-btn` présents et
câblés ; `__I18N.en`/`__I18N.pt` non vides ; bascule simulée
(`localStorage fm-lang = 'pt'` + reload) → header, hint, « ▶ Écouter »/
« Charger », légende de grille en PT ; contenu corpus resté FR (assertion
explicite du périmètre §4.2) ; re-rendu après vote → libellés toujours
traduits (MutationObserver vivant). Navigateur réel deux modes : bascule PT
sur index → porte → apprendre affiché PT sans geste.

---

## 5. Ce que R-5 ne touche PAS

- **Le moteur** : aucun fichier `moteur/*.js` ne change ; md5 réasserté.
- **Le calage visuel des séquenceurs** index/pratiquer : arbitrage Jean du
  17/07 (« un poil en arrière = temps œil-geste, ça va ») — le patron
  `phaseVisuelle` de R-4d reste disponible mais **n'est PAS appliqué** ;
  ne se rouvre que sur demande explicite.
- **Les constats C4–C12** du panel (infobulles/saisie BPM, continuité tempo,
  réinitialisation accueil, ⛶ archet, roue mobile, polices CDN,
  micro-attentes musicales) : arbitrés APRÈS le rejeu (le dashboard 0.17.0
  redonnera leurs poids réels). Voir §8 option A.
- **La grille vivante R-4d** : aucune retouche fonctionnelle (seule sa
  légende gagne des clés i18n).
- **equipe.html** : reste R-6.

---

## 6. Recette et non-régression (porte de sortie code)

1. Batterie clean-room complète (Node 24, deux modes http:// + file://) :
   toutes suites vertes, **zéro régression** — les suites étendues :
   `recette-accueil.js` (§2.3, §3.3), `recette-pratiquer.js` (§3.3),
   `recette-apprendre.js` (§4.4).
2. md5 moteur == 0.10.0 asserté ; tolérances inchangées.
3. Navigateur réel (playwright-core + Chrome local) : les trois scénarios
   de §2.3/§3.3/§4.4 + non-régression visuelle des trois pages.
4. `rapport-nonregression-0.17.0.md` joint à la PR.
5. **PR unique** base `main` (pas d'empilement — piège #29 documenté :
   vérifier `baseRefName` avant tout constat de merge).

## 7. R5-4 — Rejeu panel 30 OFFICIEL (porte de sortie R-5)

- **Quand** : après merge de la PR R-5 par Jean + prod 0.17.0 vérifiée
  (BUILD servi, 3 pages en 200).
- **Quoi** : le panel FIXE de 30 personas (mêmes identités que v0.6.5 et
  0.14.0 — comparabilité longitudinale) rejoué sur **les trois pages EN
  PROD** (index, pratiquer, apprendre).
- **Format proposé (défaut)** : un run par page → trois dashboards versionnés
  (`panel-tests-ui-metronomefunk-<page>-0.17.0.html`) + une synthèse
  consolidée courte (notes moyennes par page, constats croisés, plan
  d'action C-suivants re-priorisé) dans le rapport R-5 ou un 4e HTML léger.
- Les dashboards sont commités au dépôt (comme 0.14.0) et servis par Pages.
- **Sortie de R-5** : le dashboard consolidé + l'arbitrage de Jean sur les
  constats restants (alimente R-6 ou une salve suivante).

## 8. Points à trancher au GO (Jean)

| # | Question | Défaut proposé |
|---|---|---|
| A | Embarquer aussi C4+C5 (saisie directe du BPM + infobulles Fréquence/Caractère — effort faible) ? | **Non** — on fige les 3 P1, le rejeu re-priorisera le reste |
| B | Format du rejeu : 3 runs (un par page) ou 1 run « portail entier » ? | **3 runs** + synthèse consolidée (§7) |
| C | L'amendement de la liste fermée §9.8 (volume + sourdine au premier niveau) | **Oui** — c'est le cœur de C1 ; le GO vaut actage |
| D | Sous-titre exact de la porte « En équipe » (formulation §3.2) | Reprendre la reco du panel telle quelle |

## 9. Livrables

- `index.html` (R5-1 + R5-2 + clés i18n), `pratiquer.html` (hash-open §3.2),
  `apprendre.html` (R5-3) — fichiers complets ;
- `recette-accueil.js`, `recette-pratiquer.js`, `recette-apprendre.js` étendues ;
- `rapport-nonregression-0.17.0.md` ;
- après merge + prod : les dashboards du rejeu §7 (PR séparée ou commit direct
  de Jean, à sa main) ;
- build : `BUILD = 'metronomefunk-0.17.0'` (fm-etat.js, seule ligne tolérée).

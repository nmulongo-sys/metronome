# M1 — corpus i18n : traduire les leçons (objectif / consigne / critère)

**Build cible : 0.25.0** · base `main` = 0.24.0 (`68e8de2`) · une PR.

## 1. Le problème

Depuis R-5, le *chrome* des 4 pages est trilingue FR/EN/PT, mais le **contenu
pédagogique du corpus reste en français**. C'est le dernier majeur d'`apprendre`.
Un avis provisoire le dit à l'écran (`#pfLangNote`, salve P1) : M1 le supprime.

## 2. Périmètre — mesuré, pas estimé

| | modules (`objet`) | exercices (`objet`+`consigne`+`critere`) |
|---|---|---|
| `corpus/socle-technique.js` | 10 | 40 × 3 |
| `corpus/funk.js` | 34 | 112 × 3 |

**504 chaînes rendues → 443 uniques** (~25 500 caractères, 58 car. en moyenne),
plus `meta.description` et les 2 labels d'instrument. → **886 traductions** (EN + PT).

**Le corpus n'est rendu que sur `apprendre.html`** (0 occurrence de
`consigne`/`critere`/`.objet` sur `index`, `pratiquer`, `equipe`) → périmètre = 1 page.

## 3. La bonne nouvelle : presque aucun code

Le bloc i18n de R-5 est un **marcheur de nœuds texte + MutationObserver** : toute
chaîne FR normalisée présente dans `window.__I18N[lang]` est traduite *où qu'elle
soit rendue*. `pfRender` produit déjà `objet`, `consigne` et `objet` de module dans
**leur propre nœud texte** → ils se traduiront **sans toucher au rendu**.

**Deux endroits seulement résistent** (chaîne concaténée dans un nœud unique) :

1. `apprendre.html:998` — `'<div class="pf-critere">« ' + pfEsc(E.critere) + ' »</div>'`
   → les guillemets sont *dans* le nœud. **Correctif** : isoler le critère dans son
   propre `<span>` (les guillemets restent hors du nœud traduit).
2. `apprendre.html:949` et `:1048` — `pfStatus(fmTr('Chargé :') + ' ' + E.objet + …)`
   → **correctif** : `fmTr(E.objet)`. `fmTr` lit `window.__I18N` paresseusement,
   donc rien d'autre à changer. Les commentaires « E.objet reste en français (§4.2) »
   tombent avec M1.

## 4. Où vivent les traductions

**Un fichier de traduction par corpus**, à côté du corpus, qui **fusionne** dans
`window.__I18N` (jamais d'écrasement) :

- `corpus/i18n-socle-technique.js`
- `corpus/i18n-funk.js`

Chargés par `<script src>` dans `apprendre.html` **seule**, à côté des corpus (donc
après la définition en ligne de `window.__I18N`, avant le bloc de bascule en fin de
page). Sans build, conforme au dépôt.

*Pourquoi pas en ligne dans `apprendre.html` ?* La page passerait de 71 à ~130 Ko, et
**C6** (jazz, voix, son cubain, vents…) ajoutera un corpus par style : la traduction
doit suivre le même découpage que le corpus, sinon `apprendre.html` enfle à chaque style.

## 5. Politique de traduction

- **Source de vérité = FR**, clé = chaîne FR normalisée (patron R-5 inchangé).
- **Registre** : tutoiement, ton direct et court, comme le FR (« Pose ton grave
  exactement sur le 1 »). Pas de style scolaire.
- **Glossaire technique** — le corpus est déjà largement anglophone :
  `The One` (6), `backbeat` (26), `ghost` (28), `slap` (51), `clave` (8),
  `hocketing` (2), `laid-back` (4), `pushed` (3), `poche`/pocket (11),
  `cajón` (4), `djembé` (2), `cimbalette` (5), `3-contre-2` (8).
  → **Ces termes de métier restent tels quels en EN et en PT** (ils s'écrivent ainsi
  dans les deux langues chez les percussionnistes) ; seule la phrase autour est
  traduite. `poche` → `pocket` (EN) / `pocket` (PT). **Tranché par Jean le 18/07** :
  pas de traduction forcée, pas de glose entre parenthèses.
- **Suppression** de `#pfLangNote` (l'avis « leçons en français ») et de ses 2 entrées
  de dictionnaire EN/PT dans `apprendre.html`.

## 6. Recettes

- **Nouvelle** `recette-corpus-i18n.js` : charge les 2 corpus + les 2 fichiers de
  traduction et assert **couverture 100 %** — toute chaîne rendue (`objet` de module,
  `objet`/`consigne`/`critere` d'exercice, `meta.description`, labels d'instrument) a
  une entrée **EN et PT** ; aucune entrée orpheline ; aucune valeur identique à la
  source FR (garde-fou anti-copier-coller), hors termes du glossaire §5.
- **`recette-apprendre.js`** : F1.7 / F1.8 (avis « leçons en FR ») **retirées** et
  remplacées par « le critère et la ligne de statut se traduisent en EN et PT ».
- **Bump 0.25.0** : `moteur/fm-etat.js` (BUILD + DATE) + les 5 recettes qui assertent
  le build. ⚠️ piège connu : les regex à points échappés `0\.24\.0`.
- **Moteur intact** : `recette-extraction.js` doit rester verte (md5 == 0.10.0, seule
  la ligne BUILD bouge). `apprendre.html` est de la coquille, libre.
- **Vérif navigateur** : `apprendre.html` en FR / EN / PT, une leçon ouverte,
  objectif + consigne + critère + ligne de statut traduits, `?i18ndebug=1` sans
  marquage résiduel sur le bloc leçon, console sans erreur.

## 7. Ce que M1 ne fait pas

Pas de nouvelle mécanique, pas de sélecteur de langue supplémentaire, pas de
retouche du parcours ni du moteur. Les **démos audio** et les **noms de patterns**
(`theOne`, `vamp1`…) sont des identifiants, pas du texte : non traduits.

# Métronome FM — R-1 : spec de cadrage de la refonte modulaire multi-styles

> **Statut : VALIDÉE — GO GLOBAL de Jean le 2026-07-16.** La refonte B+ par étapes est lancée ;
> les 9 points §9 sont tous tranchés (points 1, 3, 4, 5, 6 et 9 : recommandations adoptées telles
> quelles par le go global ; points 2, 7, 8 : tranchés explicitement en séance, voir §9).
> v1.0 le 2026-07-16 ; v1.1 le même jour : point 2 tranché (PR #20 mergée, **main = 0.8.0**,
> `5152ef0`) et cible §3 recadrée sur les **quatre scénarios d'usage** exprimés par Jean
> (novice-boum / apprendre / pratique libre / équipe, Archet en option du mode simple).
> Base examinée : main = build 0.8.0 (md5 `25117ea841c2ce342c5fe2222e56204f`, 11 199 lignes).
> **Prochaine étape : chantier R-2** — spec dédiée `metronome-refonte-R2-extraction-corpus-spec.md`.
> Chantier **R-1** de la série refonte (R-1 cadrage, R-2…) — distinct des chantiers funk P-6/P-7/P-8
> et des passes moteur (closes le 10/07, ne pas rouvrir).

---

## 1. Préalable — sort du build 0.8.0 (point ouvert n°2 du brief)

Le 0.8.0 (P-6 Débutant : 40 exercices, 10 modules, sélecteur multi-niveaux, 746/746 vertes)
n'existe **que sur un disque local**, dans un dossier qui n'est pas un clone git. Deux options :

| | **(a) Merger d'abord** (recommandé) | (b) Geler et réinjecter dans la refonte |
|---|---|---|
| Sécurité du travail | Le contenu P-6 est sur main, sauvegardé, historisé | Reste sur un seul disque, sans historique — risque de perte réel |
| Base de la refonte | L'extraction du corpus se fait depuis main (source unique, auditable) | Depuis un fichier local, contraire à la règle « ne jamais se fier au dossier local » |
| Si la refonte est no-go ou retardée | 0.8.0 vit sa vie (P-7/P-8 peuvent suivre en 0.8.x) | Le travail P-6 reste en suspens |
| Constat panel C6 (tiroir Personnaliser) | Corrigible dès 0.8.1, indépendamment de la refonte | Attend la refonte |
| Coût | La relecture Jean des 6 points §9 de la spec P-6 (déjà due) + une PR | Aucun à court terme, dette ensuite |
| Travail perdu si refonte ensuite | **Aucun** : le contenu Débutant migre tel quel (il devient le corpus `socle-technique`) | — |

**Recommandation : (a), merger d'abord.** Rien de ce merge n'est invalidé par la refonte : le
contenu est précisément ce que la refonte migrera. Séquence : relecture Jean §9 → corrections
éventuelles → PR → main = 0.8.0 → la refonte part de là.

## 2. Diagnostic (rappel + vérifications de ce fil)

Constats du fil précédent, re-vérifiés aujourd'hui sur le build 0.8.0 :

1. **Deux publics, une page.** Apprenants (parcours) et pratiquants experts (outil) partagent la
   même page mono-fichier ; le parcours Débutant est enterré dans la section repliée « Cours funk »
   (`secCours`, l. 2378) — constat panel C2 confirmé dans le code.
2. **Le funk est du code.** `PF_EX`/`PF_MOD`/`PF_NIV_ORDER` sont des constantes inline (l. 10105+) ;
   les patterns d'accompagnement `BASS_PATTERNS`/`BASS_PROGS` sont des **tables de données logées
   dans le moteur** (l. 3321 et 3363) ; le contenu « cours » (principes, gestes) est du **HTML en
   dur** dans `secCours`. Ajouter le jazz aujourd'hui = rééditer le fichier de 11 000 lignes partout.
3. **i18n fragile.** `window.__I18N` (EN/PT) est indexé par **chaîne française normalisée**
   (`fmTr(fr)`, l. 1781) : toute retouche de texte français casse silencieusement sa traduction.
4. **Recettes au plafond.** 3 suites lourdes frôlent la limite mémoire jsdom au boot parce qu'elles
   chargent la page entière (contournement actuel : `--max-old-space-size=4096`).

Point favorable décisif, confirmé : **la séparation moteur/données existe déjà dans le code.**
Les presets d'exercices référencent les patterns **par identifiant** (`pattern:'theOne'`,
`prog:'vamp1'`) et le moteur les résout par table (`BASS_PATTERNS[S.bass.pattern]`, l. 3424).
Le contrat implicite est déjà là ; la refonte le rend explicite, elle ne l'invente pas.

## 3. Cible proposée — « des scénarios, un moteur, des corpus » (option B+, v1.1)

> v1.1 du 2026-07-16 : intègre la vision par scénarios exprimée par Jean (remplace le découpage
> abstrait « accueil / apprendre / pratiquer » de la v1.0 par quatre scénarios d'usage).

Quatre scénarios, chacun sa porte d'entrée :

1. **« Novice : je veux un métronome — boum. »** Arriver sur l'app = un métronome qui marche,
   immédiatement, zéro friction. **Le mode Archet devient une option de ce mode simple** (il quitte
   le premier niveau). Les trois autres scénarios sont des portes discrètes depuis cet écran.
2. **« Je veux apprendre. »** L'apprenant vit **au milieu de ses leçons (presets) et n'a besoin que
   de ça** : aucun tiroir de réglages, aucun jargon d'outil. Chaque leçon se répète en deux temps :
   **mode écoute** (l'app fait entendre) puis **mode pratique** (l'accompagnement actuel, l'élève
   joue). C'est la généralisation de la règle C6 : le preset détermine TOUT ce qui est visible.
3. **« Pratique libre. »** L'outil complet pour le pratiquant : **choix d'instruments —
   authentiques ou cajón/djembé — et de styles musicaux**. Les styles = les corpus ; les
   instruments = les voix du moteur (`PERC_INSTR`, à étendre au fil des besoins). Deux exigences
   d'ergonomie actées (Jean, 2026-07-16) : **un seul endroit pour choisir l'instrument** — fin du
   « double panneau » actuel où le djembé se choisit tantôt dans un panneau, tantôt dans les
   grooves — et **un mute de la backing track évident**. Attention (précision Jean) : la backing
   track n'est **pas que la basse** — les autres instruments traditionnels (clave, couches
   percussives) continuent parfois de jouer. Le mute est donc un **mute maître de
   l'accompagnement** (tout ce qui n'est pas le clic), d'un geste, avec le détail par couche
   (basse / clave / percussions) en second niveau.
4. **« En équipe. »** La **décomposition d'un pattern par paires de mains** : le groove est réparti
   entre les participants (chacun sa partie), l'app affiche et fait entendre chaque partie puis le
   tutti. Un seul appareil, aucune dépendance réseau (§9, point 8 — tranché).

```
index.html            ← Scénario 1 : le métronome immédiat (+ option Archet) + portes vers 2/3/4
apprendre.html        ← Scénario 2 : les leçons, pilotées par presets, modes écoute/pratique
pratiquer.html        ← Scénario 3 : pratique libre (instruments × styles, exports)
equipe.html           ← Scénario 4 : à cadrer (chantier dédié, après les trois premiers)
moteur/
  fm-audio.js         ← synthèse, scheduling          ┐ transplantés VERBATIM
  fm-accomp.js        ← basse générative, gap, drop   ┘ (contrainte dure, §4.3)
  fm-etat.js          ← état partagé, persistance
corpus/
  socle-technique.js  ← le Débutant P-6, style-neutre (déjà écrit — décision P-5)
  funk.js             ← P-2→P-8 : niveaux Intermédiaire/Avancé/Artiste
  jazz.js, …          ← futurs styles : un fichier chacun, zéro code
```

Le modèle par scénarios **renforce** l'architecture plutôt qu'il ne la change : le scénario 3 est
la vitrine directe du couple moteur × corpus ; le scénario 2 consomme les mêmes corpus à travers
les presets ; le scénario 1 répond au constat C2 plus radicalement que l'« accueil orienteur » de
la v1.0 (le novice n'a même plus à choisir : il atterrit sur le métronome). Deux capacités
nouvelles apparaissent : le **mode écoute** (§9, point 7) et le **mode équipe** (§9, point 8).

- Toujours **GitHub Pages, sans étape de build** : des fichiers statiques chargés par balises
  `<script src>`, pas de bundler, pas de `fetch` (donc pas de problème CORS en `file://`).
- La règle de livraison « fichier complet, jamais un patch » se réinterprète : **des fichiers
  complets** — chaque livraison remplace intégralement les fichiers touchés, jamais de diff.
- Le « fichier unique » historique disparaît en tant que contrainte, conformément au mandat du
  cadrage ; le « sans build » est conservé (il n'a besoin d'être challengé que pour l'option C, §5).

## 4. Le schéma de corpus (cœur de la spec)

### 4.1 Contrat

Un style = **un fichier JS** déclarant un objet global `FM_CORPUS['<id>']`. Champs :

```js
FM_CORPUS['funk'] = {
  meta: { id:'funk', label:'Funk', version:'1.0', couleur:'#…', description:'…' },

  // Parcours instrumentaux proposés par ce style (aujourd'hui PF_PARC)
  instruments: { cajon:{label:'Cajón'}, djembe:{label:'Djembé'} },

  // Contenu « cours » : principes et gestes, aujourd'hui en HTML dur → devient des données
  principes: [ { id:'PR-01', titre:'…', corps:'…' }, … ],

  // Ordre des modules par niveau (aujourd'hui PF_NIV_ORDER)
  niveaux: { intermediaire:['T1','T2','B1','B2','D1','I2'], avance:[…], artiste:[…] },

  // Modules et exercices : formats ACTUELS de PF_MOD / PF_EX, repris tels quels
  // + champ `demo` (mode écoute, §9 pt 7) : pattern percussif de démonstration, format moteur
  modules:   { 'MOD-CJ-I-T1': { parcours:'cajon', niveau:'intermediaire', objet:'…', exercices:[…] }, … },
  exercices: { 'EX-SOCLE-T1-01': { kind:'atome', objet:'…', consigne:'…', critere:'…', preset:{…}, demo:{…} }, … },

  // Patterns d'accompagnement : format moteur ACTUEL ({steps, hits[]}), sortis du moteur
  // + champ optionnel `roles` (mode équipe, §9 pt 8) : découpage forcé par participant ;
  //   à défaut, la décomposition se déduit des voix des hits
  patterns: { theOne:{steps:16, hits:[…], roles:{…}}, syncopeGrave:{…}, ghostPendule:{…} },
  progressions: { vamp1:{bars:[…]}, vamp2:{…} },

  // Traductions par IDENTIFIANT structuré (jamais par chaîne française)
  i18n: { en: { 'EX-SOCLE-T1-01.consigne':'…', 'MOD-CJ-I-T1.objet':'…' }, pt: {…} }
};
```

Points de contrat :

- **Vocabulaire de presets fermé**, défini par le moteur, versionné dans la spec du schéma :
  `metro`/`tempo`/`subdiv`/`gap` (clic seul) et `pattern`/`prog`/`drop` (accompagnement). Un corpus
  ne peut référencer que des capacités que le moteur offre. Une capacité inédite (nouvelle métrique,
  nouvelle voix) = un petit chantier moteur ponctuel, au profit de tous les styles.
- **Règle C6 intégrée au contrat** : la coquille déduit les panneaux de réglage affichés du preset
  de l'exercice. Preset sans `pattern` (clic seul) → les réglages de basse (Densité/Drop-outs/
  Tonalité) sont masqués. L'incohérence relevée par le panel devient structurellement impossible.
- **`socle-technique` est un corpus comme les autres** : c'est le Débutant P-6 (style-neutre par
  construction, décision P-5). Les styles le déclarent comme prérequis (`meta.socle:true` chez lui,
  référence chez eux) ; il n'est écrit qu'une fois.
- **i18n par ID** : les corpus embarquent leurs traductions indexées par identifiant stable
  (`'EX-….consigne'`), ce qui corrige la fragilité du dictionnaire par chaîne. Le mécanisme
  `fmTr`/`__I18N` actuel est conservé pour les textes de la coquille (UI) — pas de big-bang i18n.

### 4.2 Validateur de corpus

Une recette jsdom générique `recette-corpus.js <fichier>` fait respecter le contrat : IDs uniques,
tout exercice référencé par un module existe, presets au vocabulaire fermé, patterns au format
moteur, i18n complet pour chaque langue déclarée, prérequis résolus. **C'est elle qui garantit
« ajouter un style = zéro code »** : un nouveau corpus est recevable si le validateur passe,
sans toucher ni coquille ni moteur.

### 4.3 Frontière moteur — le seul point de contact avec la contrainte verbatim

La transplantation du moteur est **verbatim** (validation à l'oreille du 10/07, non rejouable en
headless). Un seul aménagement est nécessaire : `BASS_PATTERNS`/`BASS_PROGS` cessent d'être des
constantes locales du moteur et deviennent un **registre alimenté par les corpus**. Critère de
conformité proposé, vérifiable par recette :

1. Le diff moteur se limite à l'indirection de lecture des deux tables (aucune ligne de synthèse,
   de scheduling ou d'humanisation modifiée) ;
2. Une recette dédiée compare, valeur par valeur, les tables injectées par `corpus/funk.js` aux
   tables historiques du build de référence : égalité stricte exigée.

C'est un déplacement de **données**, pas une réécriture de code — mais c'est à Jean de confirmer
que cet aménagement est compatible avec la contrainte (§9, point 3).

## 5. Options comparées

| | **A — corpus seuls** | **B+ — des scénarios, un moteur, des corpus** | C — refonte avec build |
|---|---|---|---|
| Contenu | Extraction des corpus en fichiers de données ; la page actuelle devient la coquille qui les charge | A + moteur en fichiers partagés + une page par scénario (§3) | B+ + bundler/framework, modules ES, minification |
| « Ajouter un style = données » | ✅ | ✅ | ✅ |
| Deux publics servis (C2) | ❌ page unique inchangée | ✅ | ✅ |
| Contrainte « sans build » / Pages | Respectée | Respectée | **Violée** (outillage, workflow de livraison changé) |
| Recettes (19 suites) | Harnais de chargement à adapter (§6.1), suites inchangées | Idem A + répartition par page | Migration lourde (runner, transpilation) |
| Ampleur | ≈ 2 chantiers | ≈ 4-6 chantiers | Plusieurs semaines |
| Risque | Faible | Modéré, **étagé** (voir ci-dessous) | Élevé, big-bang |

**L'argument décisif : A n'est pas une alternative à B+, c'est son premier étage.** L'extraction
des corpus (A) est exactement le chantier R-2 de B+ (§8). On peut donc lancer B+ et s'arrêter
après R-2 en ayant déjà encaissé le bénéfice principal (« un style = un fichier de données »),
sans rien jeter. Le go/no-go n'engage réellement que chantier par chantier.

**C est écarté** : aucun besoin identifié ne l'exige (pas de dépendances externes, pas de
composants à compiler), et il casse deux invariants du projet (sans build, livraison de fichiers
complets lisibles). À ne rouvrir que si un besoin futur l'impose.

## 6. Impacts chiffrés (option B+)

### 6.1 Les 19 suites de recette (746 assertions)

- Les recettes chargent aujourd'hui `./index.html` monolithique. En cible, le harnais jsdom charge
  la page avec `resources:'usable'` pour résoudre les `<script src>` locaux (moteur + corpus) —
  **un chantier transversal unique** sur le harnais de chargement, puis les assertions existantes
  restent valables sur le fond.
- Répartition : suites moteur/audio → `pratiquer.html` ; suites parcours (P-2/P-4/P-6) →
  `apprendre.html` ; + le validateur de corpus (§4.2), nouvelle suite par corpus.
- **Gain attendu** : chaque page étant nettement plus légère que les 11 199 lignes actuelles, les
  3 suites qui frôlent la limite mémoire jsdom respirent (le contournement
  `--max-old-space-size=4096` devrait devenir inutile — à vérifier en R-3).
- Règle inchangée : non-régression complète avant tout merge ; la barre des 746 est reprise telle
  quelle puis ventilée par page.

### 6.2 Workflow de livraison

- Pages sert un dossier statique multi-fichiers sans build : rien à changer côté hébergement.
- « Fichier complet, jamais un patch » → « fichiers complets » : une livraison remplace
  intégralement chaque fichier touché. Une PR type ne touche qu'un périmètre (un corpus, ou une
  page, ou le moteur — jamais les trois).
- Bénéfice de revue : une PR « nouveau style » = un fichier de données + son rapport de
  validateur. Une PR « UX » ne touche plus jamais au contenu pédagogique, et réciproquement.

### 6.3 Planning P-7 (Avancé) / P-8 (Artiste)

**Recommandation : peupler après R-2.** Écrits avant, les modules Avancé/Artiste seraient rédigés
au format inline puis migrés (double travail) ; écrits après R-2, ils naissent directement au
format corpus dans `funk.js`, validateur à l'appui. La cartographie P-5 validée reste la source ;
`PF_NIV_ORDER.avance/artiste` (prêts, vides dans 0.8.0) deviennent `niveaux.avance/artiste` du
corpus. Si no-go de la refonte : P-7/P-8 se font en 0.8.x au format actuel, rien n'est bloqué.

## 7. Constats du panel UX intégrés au cadrage

| Constat (panel 0.8.0, note 7,0/10) | Traitement |
|---|---|
| **C1** — jargon anglo-funk (2 testeurs échouent) | Chantier de contenu dans les corpus (lexique/glossaire par style au schéma : champ optionnel `lexique`) — R-5, rejouable au panel |
| **C2** — Débutant enterré dans « Cours funk » replié | Résolu structurellement par la scission : `apprendre.html` + accueil orienteur — R-4 |
| **C3** — lisibilité 56+ (13 px, 9,6 px, opacités 0,4–0,6) | Salve UX sur les nouvelles pages — R-5 ; les correctifs évidents peuvent partir dès 0.8.x si merge d'abord |
| **C6** — réglages basse affichés sur exercices clic-seul | Corrigible dès 0.8.1 (si §1 = merge d'abord) **et** rendu impossible par le contrat de presets (§4.1) |
| **J1** (Jean, 16/07) — « double panneau » : le choix djembé/cajón existe à deux endroits (panneau vs grooves), ambigu | Résolu par le découpage en scénarios : l'instrument se choisit **une fois**, dans la pratique libre (le parcours d'apprentissage a le sien propre, choisi à l'entrée du parcours) — R-3 |
| **J2** (Jean, 16/07) — couper la backing track pas assez évident en pratique libre ; la backing track ≠ la basse seule (clave et percussions traditionnelles continuent parfois) | **Mute maître de l'accompagnement** (tout sauf le clic) au premier niveau de `pratiquer.html`, un geste, visible en permanence ; détail par couche (basse/clave/percussions) en second niveau — R-3 |

Pas de nouveau panel pour cadrer : le panel fixe de 30 personas se rejouera à l'identique sur la
première version deux-pages (fin R-4/R-5) pour mesurer l'écart vs 7,0/10.

## 8. Découpage en chantiers (si go)

| Chantier | Contenu | Porte de sortie |
|---|---|---|
| **R-0** | ~~Relecture Jean §9 spec P-6 → PR 0.8.0 → main~~ **FAIT le 2026-07-16** : PR #20 mergée par Jean, main = 0.8.0 (`5152ef0`), Pages vérifié | ✅ clos |
| **R-1** | Ce cadrage (v1.1 : cible par scénarios) | Go/no-go Jean |
| **R-2** (= option A) | Spec du schéma de corpus + extraction `socle-technique.js` et `funk.js` depuis main + registre patterns (§4.3) + validateur + harnais de recette adapté. **Aucun changement visuel.** | Non-régression totale ; **point d'arrêt honorable** si on ne va pas plus loin |
| **R-3** | Moteur en fichiers (`fm-audio`/`fm-accomp`/`fm-etat`, verbatim) + `pratiquer.html` (scénario 3 : pratique libre, instruments × styles) | Recettes moteur vertes ; validation à l'oreille par Jean |
| **R-4** | `index.html` métronome immédiat (+ option Archet) + `apprendre.html` (scénario 2 : leçons, mode écoute / mode pratique) | Recettes parcours vertes ; C2 traité à la racine |
| **R-5** | Salve UX (C1 lexique, C3 lisibilité) + **rejeu du panel 30** | Score panel vs 7,0/10 |
| **R-6** | Scénario 4 « en équipe » — après cadrage de son périmètre (§9, point 8) | Spec dédiée puis exécution |

Une étape par session, spec avant code, proposition avant exécution, non-régression avant merge —
le workflow actuel s'applique à chaque chantier. P-7/P-8 s'intercalent après R-2 (§6.3).

## 9. Recommandation et points à trancher par Jean

**Recommandation : GO pour B+ par étapes**, précédé du merge 0.8.0. Le jeu en vaut la chandelle
parce que (i) l'exigence multi-styles est structurante et actée, (ii) la séparation moteur/données
existe déjà implicitement dans le code — on la formalise, on ne réinvente rien, (iii) le risque
est étagé : chaque chantier a une porte de sortie, et R-2 seul rapporte déjà l'essentiel.

Points à trancher :

1. **Go/no-go** de la refonte B+ par étapes (§5) — ou repli sur A seul (= s'arrêter à R-2), ou no-go.
2. ~~**Sort du 0.8.0**~~ — **TRANCHÉ le 2026-07-16** : merge d'abord, PR #20 mergée, main = 0.8.0.
3. **Frontière moteur** : l'indirection des tables `BASS_PATTERNS`/`BASS_PROGS` (§4.3) est-elle
   compatible avec la contrainte verbatim, au critère proposé (diff limité à l'indirection +
   recette d'égalité des tables) ?
4. **Réinterprétation des invariants** : « fichier unique » abandonné, « des fichiers complets,
   jamais un patch » et « Pages sans build » conservés (§3, §6.2) — confirmer.
5. **Séquencement P-7/P-8** : après R-2, directement au format corpus (§6.3) — confirmer.
6. **i18n** : corpus traduits par ID (nouveau contrat) + `fmTr` conservé pour l'UI de la coquille
   (§4.1) — confirmer qu'on ne lance pas de big-bang i18n dans cette refonte.
7. ~~**Mode écoute (scénario 2)**~~ — **TRANCHÉ le 2026-07-16** : champ `demo` confirmé par Jean.
   L'app joue la partie de l'exercice (voix percussives du moteur) par-dessus l'accompagnement ;
   l'élève écoute le modèle puis bascule en mode pratique. Chaque exercice du corpus porte un
   champ `demo` (pattern percussif de démonstration, format moteur).
8. ~~**Mode équipe (scénario 4)**~~ — **TRANCHÉ le 2026-07-16** : c'est la **décomposition d'un
   pattern par paires de mains (participants)** — un seul appareil, pas de session multi-appareils.
   Le groove est réparti en parties (ex. : participant 1 les graves, 2 le backbeat, 3 la nappe de
   ghosts) ; l'app affiche et fait entendre la partie de chacun, puis le tutti. Impact corpus :
   la décomposition se déduit des voix des hits du pattern, avec un champ optionnel `roles` pour
   forcer un découpage particulier. Impact moteur : aucun (les voix existent) — c'est de la
   coquille + des données.
9. **Instruments authentiques (scénario 3)** — l'extension de la palette (`PERC_INSTR` : congas,
   timbales, etc.) est un chantier moteur **ponctuel et additif** (nouvelles voix, pas de retouche
   de l'existant validé à l'oreille). À prioriser au fil des styles ajoutés (le jazz appellera ride
   /balais, l'afro-cubain congas/clave…), pas en bloc dans la refonte.

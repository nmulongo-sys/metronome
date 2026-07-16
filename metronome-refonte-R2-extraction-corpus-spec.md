# Métronome FM — R-2 : extraction des corpus en fichiers de données

> **Statut : VALIDÉE (GO Jean) et EXÉCUTÉE le 2026-07-16 — build 0.9.0.**
> Rédigée le 2026-07-16, dans le cadre de la refonte B+ validée (GO global Jean, spec R-1).
> Correctif à l'exécution : les comptes réels sont **82 exercices (40 Débutant + 42 funk) et
> 22 modules (10 + 12)** — le §7.4 initial disait 70/16 par erreur ; corrigé ci-dessous.
> Base : **main = 0.8.0** (`5152ef0`, index.html md5 `25117ea841c2ce342c5fe2222e56204f`).
> R-2 = l'« option A » du cadrage : premier étage de la refonte, **point d'arrêt honorable**.

---

## 1. Objet et périmètre

Sortir les **données** de la page : les contenus pédagogiques et les patterns d'accompagnement
deviennent des fichiers de corpus au schéma R-1 §4.1 ; la page actuelle devient la coquille qui
les charge. **Iso-fonctionnel strict : aucun changement visuel ni sonore.** Un utilisateur ne doit
pas pouvoir distinguer 0.9.0 de 0.8.0.

Hors périmètre R-2 (assumé, pour garder l'étape courte et sûre) :
- la scission en pages par scénario (R-3/R-4) ;
- la migration du contenu « cours » HTML (`secCours`) en données `principes` — il **reste dans la
  page** et migrera en R-4 avec `apprendre.html` ;
- toute migration i18n : les chaînes françaises étant reprises **à l'identique**, les dictionnaires
  EN/PT par chaîne (`fmTr`) continuent de fonctionner tels quels ;
- le peuplement des champs `demo` (mode écoute) et `roles` (mode équipe) : prévus au schéma,
  laissés vides — remplis en R-4/R-6.

## 2. Livrables

```
index.html                      ← coquille + moteur (mêmes 11 199 lignes, moins les données extraites)
corpus/
  socle-technique.js            ← FM_CORPUS['socle-technique'] : le Débutant P-6
  funk.js                       ← FM_CORPUS['funk'] : l'Intermédiaire + patterns/progressions
recette-harnais.js              ← helper de chargement partagé des suites (§6)
recette-corpus.js               ← validateur générique du contrat de corpus (§5)
recette-registre.js             ← égalité stricte tables injectées vs tables historiques (§4)
+ les 19 suites existantes      ← adaptation mécanique du bloc de chargement (§6)
rapport-nonregression-0.9.0.md
```

Build proposé : **0.9.0** (dernier build de l'ère mono-fichier… devenue multi-fichiers par les
données ; 1.0.0 restera pour la fin de la refonte, quand les scénarios seront en place).

## 3. Répartition des données

**`corpus/socle-technique.js`** — le Débutant P-6, style-neutre (décision P-5) :
- les 40 exercices `EX-*-POS/SON/PLS/SUB/DYN-*` et les 10 modules `MOD-*-D-*` ;
- `niveaux: { debutant: ['POS','SON','PLS','SUB','DYN'] }` ;
- presets pré-funk (`metro`/`tempo`/`subdiv`/`gap`) — aucun pattern (clic seul, par définition).

**`corpus/funk.js`** — le style funk :
- les exercices et modules Intermédiaire (`T1`,`T2`,`B1`,`B2`,`D1`,`I2`) ;
- `niveaux: { intermediaire:[…], avance:[], artiste:[] }` (P-7/P-8 rempliront ici, format corpus) ;
- `patterns: { theOne, syncopeGrave, ghostPendule }` et `progressions: { vamp1, vamp2 }` —
  copiés **valeur pour valeur** depuis `BASS_PATTERNS`/`BASS_PROGS` du moteur (l. 3321/3363) ;
- `instruments: { cajon, djembe }` (l'actuel `PF_PARC`).

**Reste dans la coquille** : la liste générique des niveaux (`PF_NIVEAUX`, infixes, libellés),
le contenu HTML de `secCours`, l'i18n UI, tout le moteur.

## 4. Registre et frontière moteur

- Chargement par balises, ordre garanti par le HTML :
  `<script src="corpus/socle-technique.js">` puis `<script src="corpus/funk.js">` puis le script
  principal. Scripts classiques (pas de modules ES) → **fonctionne en `file://` comme sur Pages,
  sans build**.
- Au boot, la coquille **assemble** `PF_EX`/`PF_MOD`/`PF_NIV_ORDER` depuis tous les corpus
  déclarés dans `FM_CORPUS` (fusion par niveau : le Débutant vient de `socle-technique`,
  l'Intermédiaire de `funk`). Collision d'ID entre corpus = erreur bloquante à l'assemblage.
- **Frontière moteur (critère R-1 §4.3, acté au go global)** : le moteur lit les patterns via le
  registre au lieu de ses constantes locales. Diff moteur strictement limité à cette indirection —
  aucune ligne de synthèse, de scheduling ou d'humanisation modifiée. `recette-registre.js`
  vérifie l'**égalité stricte, valeur par valeur**, des tables injectées avec les tables du build
  0.8.0 de référence (copie des valeurs historiques figée dans la recette elle-même).

## 5. Validateur de corpus (`recette-corpus.js`)

Suite générique exécutée sur chaque fichier de corpus (2 passages en R-2) :
IDs uniques (exercices, modules, patterns) ; tout exercice référencé par un module existe ; tout
`preset.pattern`/`prog` référence un pattern/une progression du corpus ou du registre ; presets au
vocabulaire fermé (`metro`,`tempo`,`subdiv`,`gap`,`pattern`,`prog`,`drop`) ; patterns au format
moteur (`steps`, `hits[]`) ; `kind` ∈ {atome, synthese} ; niveaux cohérents avec les modules ;
champs `demo`/`roles` optionnels et, si présents, au format moteur. C'est la garantie
« ajouter un style = zéro code » : un futur `jazz.js` est recevable si cette suite passe.

## 6. Harnais de recette

Constat (vérifié) : les 19 suites font `readFileSync('./index.html')` + `new JSDOM(html)` —
les `<script src>` externes ne se chargeraient pas. Solution **sans serveur ni build** :

- `recette-harnais.js` expose `chargeHtml()` : lit `index.html`, **inline à la volée** chaque
  `<script src="corpus/….js">` local (remplacement par le contenu du fichier), renvoie le HTML
  aplati — le reste des options JSDOM de chaque suite est inchangé.
- Adaptation **mécanique** des 19 suites : seul le bloc de lecture du fichier change (2-3 lignes),
  aucune assertion touchée. Preuve : les comptes par suite restent exactement
  21/20/23/15/28/38/21/40/42/44/56/54/85/32/52/22/56/49/48 = **746**.
- La convention `process.argv[2]` (fichier alternatif) et `--max-old-space-size=4096` pour les
  suites lourdes sont conservées.

## 7. Recette et non-régression

1. **746/746** sur les 19 suites adaptées, contre le build R-2 (clean-room, Node 24).
2. `recette-corpus.js` verte sur `socle-technique.js` et `funk.js`.
3. `recette-registre.js` verte (tables identiques au 0.8.0).
4. Vérification d'assemblage : mêmes comptes qu'en 0.8.0 — **82 exercices** (40 Débutant + 42
   funk), **22 modules** (10 + 12), niveaux/ordres identiques, chaque entrée égale valeur pour
   valeur (recette-registre).

## 8. Livraison

PR unique « R-2 : extraction des corpus — build 0.9.0 » : fichiers complets (index.html allégé,
2 corpus, 3 recettes nouvelles, 19 suites adaptées, rapport). Merge par Jean après relecture,
comme pour la PR #20. Pages sert ensuite `index.html` + `corpus/` tels quels.

## 9. Points à trancher par Jean (porte de qualité)

1. **Numéro de build 0.9.0** — OK ?
2. **Périmètre assumé** : cours HTML et i18n intacts jusqu'à R-4, `demo`/`roles` vides — OK ?
3. **Nommage** : global `FM_CORPUS`, dossier `corpus/`, ids `socle-technique` / `funk` — OK ?
4. **Adaptation mécanique des 19 suites** via `recette-harnais.js` (seul le chargement change,
   comptes d'assertions inchangés comme preuve) — OK ?
5. **Exécution** : d'un bloc en une session (précédent P-6) ou en deux temps (extraction + corpus
   d'abord, harnais + non-régression ensuite) ? Reco : **un bloc**, l'étape est indivisible de
   toute façon (rien n'est mergeable sans la non-régression).

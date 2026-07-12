# Métronome — Spécification P-4 : « UI parcours funk » (premier code du parcours)

**Statut : PROPOSITION — à valider avant tout code.**
**Rattachement : cours funk, spec mère `metronome-parcours-funk-spec.md` (rév. 1) + spec P-3
(`pf_vote` / `pf_promotion` / RLS, appliquée au live). Base : `index.html` `metronomefunk-0.6.3`
(2026-07-11), passe 5 complète (basse funk + legato + réverb + drop-outs).**

Décisions amont reprises telles quelles (non rediscutées) : deux parcours parallèles cajón/djembé ;
quatre niveaux ; funk = intermédiaire ; état **et** vote **par position** `(parcours, exerciseId)` ;
`N_min = 8` ; seuil promotion `part('difficile') ≥ 0,40 ⇒ +1 niveau` ; vote sur la synthèse = oui ;
préfixe DB `pf_` ; projet Supabase `hifqtzxhmboxbruraiab`.

---

## 0. Constats live intégrés (rectification du brief P-3)

La 0.6.3 déployée **contredit** trois hypothèses du brief P-3. Rectifié ici, acté par Jean :

1. **Le SDK Supabase est déjà chargé** (`@supabase/supabase-js@2`, CDN) : « zéro dépendance JS »
   est **de facto amendé**. P-4 n'ajoute **aucune** dépendance nouvelle — il réutilise l'existant.
2. **Une auth par lien magique existe déjà** : `window.fmSupabase()` (client mémoïsé),
   `sb.auth.signInWithOtp`, table `profils`, `window.fmCurrentUser` / `window.fmCurrentProfil`,
   événement `document` `fm-auth`. Le plan « fetch pur + jeton `pf_auth` » du brief est **abandonné** :
   redondant avec le SDK, qui persiste déjà la session.
3. **Anonymous sign-ins = DÉSACTIVÉS** au moment de la rédaction (test live
   `POST /auth/v1/signup` → `422 anonymous_provider_disabled`). **Prérequis runtime** : Jean bascule
   *Auth → Providers → Anonymous* dans le dashboard. Sans ça, seuls les comptes lien-magique votent.

**Choix d'identité du vote acté : B (anonyme + compte).** `pf_vote.client_id = auth.uid()` de la
session courante : compte lien-magique si connecté, sinon session anonyme obtenue à la volée. Un
anonyme signé-in porte le rôle `authenticated` (+ `is_anonymous:true`) : il passe la RLS et la RPC
`pf_promotion` de P-3 sans modification côté DB.

---

## 1. Objet

Premier **code** du parcours funk. P-4 livre l'**écran « Parcours funk »**, une **surcouche pure** :
hors de son écran, fm-metro (passes 1–5, rang de registre, compte, bibliothèque) est **strictement
inchangé** (non-régression). Contenu de cette étape = **le module 6 seul**, des **deux** côtés
(`MOD-CJ-I-I2`, `MOD-DJ-I-I2`), comme tranche verticale complète. Le modèle de données reste général
pour absorber P-2 (les 5 autres modules) et P-5 (autres niveaux) **sans refonte**.

Ce que P-4 met en place, de bout en bout, sur ce seul module :
chargement d'un **preset d'un bloc** + tempo + tiroir `perso` ; **acquis local** par position ;
**double code couleur** + marqueur « déjà rencontré » pour les exercices partagés ;
**vote de fin** (3 crans, synthèse incluse) branché sur `pf_vote` / `pf_promotion` via le SDK, avec
**file offline** ; hook diagnostic ; recette headless + non-régression.

---

## 2. Modèle de données front (figé pour le module 6, général par construction)

Trois tables front en **données statiques dans le code** (aucune en DB — cf. spec mère §2 : le
niveau de base vit dans le code). IDs littéraux **repris tels quels de la spec mère §6**.

### 2.1 `EXERCISES` — contenu, indexé par ID stable

```js
// EXERCISES['EX-SOCLE-I2-01'] = { … }
{
  id: 'EX-SOCLE-I2-01',
  kind: 'atome',                 // 'atome' | 'synthese'
  objectif, consigne, critereReussite,   // texte, cf. §6 spec mère (auto-déclaratif)
  principesFunk: ['FUNK-T1','FUNK-I2'],
  gestes: { cajon: ['CJ-S1'], djembe: ['DJ-S1'] },  // par parcours (le contenu socle est agnostique)
  preset: { … },                 // cf. §3 — sous-ensemble de S, chargeable d'un bloc
  perso:  { … }                  // cf. §4 — bornes du tiroir <details>
}
```

`critereReussite` reste **descriptif, jamais mesuré**.

### 2.2 `MODULES` — regroupement pédagogique

```js
{
  id: 'MOD-CJ-I-I2', parcours: 'cajon', niveau: 'intermediaire',
  objet: 'Verrouiller sur la basse funk',
  couleur: PARC.cajon.couleur,
  exercices: ['EX-SOCLE-I2-01','EX-CJ-I2-02','EX-SOCLE-I2-03','EX-SOCLE-I2-04','EX-CJ-I2-05']
}
```

Deux modules figés : `MOD-CJ-I-I2` et `MOD-DJ-I-I2` (djembé : `…-01/-03/-04` partagés, `EX-DJ-I2-02`
et `EX-DJ-I2-05` propres).

### 2.3 `PARC` — identité de parcours (couleur, libellé)

```js
PARC = {
  cajon:  { label: 'Cajón',  couleur: 'var(--pf-cajon)'  /* défaut bois : #C8722E */ },
  djembe: { label: 'Djembé', couleur: 'var(--pf-djembe)' /* défaut : #2E86C8 */ }
}
```

Un `exerciseId` référencé par **les deux** modules ⇒ **partagé** : rendu **double couleur** +
marqueur « déjà rencontré dans l'autre parcours ». Dérivé automatiquement (l'ID apparaît dans les
deux listes `exercices`), pas déclaré à la main.

### 2.4 État — 100 % local, par position

- **Acquis** : `localStorage['fm-metro-parcours']`, clé `"<parcours>|<exerciseId>"` →
  `{ acquis:true, ts }`. **Jamais synchronisé.** Réussir côté djembé **ne coche pas** le jumeau cajón.
- **Cache promotion** (affichage du niveau) : `localStorage['fm-metro-parcours-promo']`,
  clé `"<parcours>|<exerciseId>|<cible>"` → `{ promu, part, n_votes, dormant, ts }` (rafraîchi par la
  RPC, cf. §5). Cache d'affichage seulement ; la vérité reste `niveau_base(code) + promu`.

Réussite module = tous atomes **et** synthèse `acquis` (au couple parcours×ex). Réussite niveau =
tous les modules du niveau (hors périmètre P-4 : un seul module rendu).

---

## 3. `preset` — chargement d'un bloc (mappé sur le `S` réel)

Le preset est un **sous-ensemble littéral de `S`** appliqué d'un bloc, puis le chemin de
reconstruction existant est rejoué (`setFamily` / `buildPercGrids` / `bassResetCycle` / rafraîchi
tempo). Module 6 = exercices de **verrouillage sur la basse** : on charge **basse + clic**, la grille
percussion reste **off** (l'élève joue son instrument en vrai).

Gabarit commun du module 6 (les cinq exercices ne diffèrent que par `bass.prog` et `bass.drop`) :

```js
preset = {
  tempo: 90,
  family: 'bin',                 // la basse n'existe qu'en binaire
  swing: 50,
  perc:  { on: false },          // l'élève joue ; pas de grille imposée
  bass:  { on: true, key: 'E', density: 2, vel: 'mixte', vary: false,
           pattern: <selon exercice>, prog: <selon exercice>,
           drop: <selon exercice> }
}
```

| Exercice | `bass.pattern` | `bass.prog` | `bass.drop` |
|---|---|---|---|
| `EX-SOCLE-I2-01` (grave sur The One) | `theOne` | `vamp1` | `{on:false}` |
| `EX-CJ-I2-02` / `EX-DJ-I2-02` (se loger dans le trou) | `syncopeGrave` | `vamp1` | `{on:false}` |
| `EX-SOCLE-I2-03` (nappe de ghosts) | `ghostPendule` | `vamp1` | `{on:false}` |
| `EX-SOCLE-I2-04` (drop-out, tenir le time) | `theOne` | `vamp1` | `{on:true, everyN:4, lenBeats:2}` |
| `EX-CJ-I2-05` / `EX-DJ-I2-05` (synthèse) | `theOne` | `vamp2` | `{on:false}` |

*(Note : la spec mère §6 laisse `pattern` implicite pour les atomes 2 et 3 ; je propose
`syncopeGrave` et `ghostPendule` pour coller à l'intention — trou de basse / nappe de ghosts. À
confirmer §7.)*

L'**applicateur** `pfLoadPreset(exId)` : fusionne le preset dans `S` (deep-merge borné aux champs
listés), rejoue le chemin de reconstruction existant, laisse fm-metro **à l'arrêt** (l'élève lance).
Il n'invente aucune fonction audio : il réutilise les points d'ancrage déjà présents (liste exacte
figée au code, revue en relecture).

---

## 4. `perso` — tiroir `<details>` (motif `secBass`)

Exposé sous chaque exercice, **replié par défaut**, bornes pédagogiques :

- **Tempo** : slider borné (module 6 : 70–110, défaut 90).
- **Densité basse** : 1/2/3 (défaut du preset).
- **Drop-outs** : on/off (préchargé selon l'exercice ; l'élève peut forcer).
- **Tonalité** : sélecteur 12 (transposition d'oreille ; défaut E).

Modifier `perso` re-applique le sous-ensemble concerné sans recharger tout le preset.

---

## 5. Identité & vote (client) — réutilisation du SDK

### 5.1 Acquisition de session (au moment de voter, pas au chargement)

```
si window.fmCurrentUser (lien magique)      → uid = fmCurrentUser.id
sinon sb.auth.getSession() a une session     → uid = session.user.id
sinon sb.auth.signInAnonymously()            → uid = nouvelle session anonyme
        └─ échec (toggle off / offline)      → vote laissé EN FILE, acquis quand même enregistré
```

Aucun jeton `pf_auth` maison : le SDK persiste la session (`sb-<ref>-auth-token`).

### 5.2 Vote de fin d'exercice

À la fin d'un exercice, invite **optionnelle** à 3 crans : **facile · ok · difficile**. `cible` =
`'atome'` ou `'synthese'` selon `kind`. Un vote =

```js
{ parcours, exercise_id, cible, verdict }   // verdict ∈ {'facile','ok','difficile'}
```

Chemin :

1. **Empiler** dans `localStorage['pf_vote_queue']` (offline-first ; un item par position,
   last-write-wins local).
2. **Vider la file** (`pfFlushVotes`) dès qu'une session est disponible (déclencheurs :
   `fm-auth`, retour `online`, ouverture de l'écran) : pour chaque item,
   `sb.from('pf_vote').upsert({ client_id: uid, parcours, exercise_id, cible, verdict },
   { onConflict: 'client_id,parcours,exercise_id,cible' })`.
3. **Relire la promotion** : `sb.rpc('pf_promotion', { parcours, exercise_id, cible })` →
   `{ n_votes, n_difficile, part, dormant, promu }`. Écrire dans le cache promo (§2.4).
   Appliquer `niveau_effectif = niveau_base(code) + (promu ? 1 : 0)` à l'affichage **de cette
   position, ce parcours seulement**.

### 5.3 Dégradation propre

- **Offline** : le script SDK (CDN) n'est pas chargé → `fmSupabase()` renvoie `null`. L'acquis local
  et tout l'écran restent **pleinement fonctionnels** ; les votes s'empilent et partent au retour réseau.
- **Toggle anonyme off** : un non-connecté ne peut pas flush ; son vote reste en file (repartira s'il
  se connecte ou si le toggle est activé). L'UI ne bloque jamais, ne réclame pas de compte.
- **`dormant:true`** (`< N_min`) : aucun changement de niveau, mécanisme **dormant, pas cassé**.

---

## 6. UI — écran « Parcours funk »

- **Accès** : entrée dédiée (bouton/onglet), surcouche masquant fm-metro le temps de l'écran ;
  retour = fm-metro strictement dans l'état laissé. Style aligné sur les `<details>`/modales existants.
- **Rendu** : deux colonnes/sections (un module par parcours), chacune 5 cartes ordonnées
  (4 atomes + synthèse). Carte = objet + consigne + critère + bouton **« Charger »** + tiroir
  `perso` + case **« acquis »** + invite **vote** de fin.
- **Partage visuel** : atomes `EX-SOCLE-…` (1/3/4) affichés en **double liseré couleur** +
  puce « déjà rencontré dans l'autre parcours » ; `EX-CJ-…`/`EX-DJ-…` (atome 2, synthèse) en couleur
  unique du parcours.
- **Niveau effectif** : si `promu`, badge « monté d'un niveau » sur la position concernée.

---

## 7. Hook diagnostic — `window.fmMetroParcours()` (lecture seule)

Calque de `fmMetroBass` : lecture + helpers **purs**, aucune mutation de l'audio en cours.

```js
window.fmMetroParcours = function () {
  return {
    data:      { PARC, MODULES, EXERCISES },       // contenu figé
    shared:    ['EX-SOCLE-I2-01','EX-SOCLE-I2-03','EX-SOCLE-I2-04'],  // dérivé
    progress:  () => ({...acquis local}),          // fm-metro-parcours
    promoCache:() => ({...cache promo}),            // fm-metro-parcours-promo
    voteQueue: () => ([...pf_vote_queue]),          // file en attente
    presetFor: (exId) => (sous-ensemble S, sans l'appliquer),
    buildVote: (parcours, exId, cible, verdict) => (item de vote normalisé),
    niveauEffectif: (parcours, exId, cible) => (base + promu?1:0)
  };
};
```

La recette injecte un **SDK mocké** (`window.supabase.createClient` stub) et un `fetch` mocké ; le
hook expose de quoi piloter/inspecter le DOM sans réseau réel.

---

## 8. Recette `recette-P4.js` (jsdom, DOM-driven, Supabase mocké)

Cas (numérotés, verts requis) :

1. **Rendu** : 2 modules × 5 cartes = 10 exercices ; ordre 4 atomes + synthèse ; libellés/critères
   conformes à `EXERCISES`.
2. **Partage** : `-01/-03/-04` marqués partagés (double couleur + « déjà rencontré ») ; `-02/-05`
   propres (couleur unique). `shared` du hook = exactement ces trois IDs.
3. **Preset** : « Charger » `EX-SOCLE-I2-04` ⇒ `S.bass.prog='vamp1'`, `S.bass.drop.on===true`
   (`everyN:4,lenBeats:2`), `S.tempo===90`, `S.family==='bin'`, `S.perc.on===false`, arrêt.
   `EX-CJ-I2-05` ⇒ `S.bass.prog==='vamp2'`. Aucune régression de `S.bass` hors champs du preset.
4. **`perso`** : tiroir `<details>` présent par exercice ; tempo borné (70–110) ; changer tonalité
   → `S.bass.key` mis à jour, reste des champs intacts.
5. **Acquis** : cocher acquis `(cajon, EX-SOCLE-I2-04)` écrit `fm-metro-parcours` à cette clé et
   **pas** `(djembe, …)`. Persistance relue.
6. **Vote empilé** : voter `difficile` sur `(djembe, EX-DJ-I2-05, synthese)` ⇒ item correct dans
   `pf_vote_queue` (verdict, cible='synthese', clé de position).
7. **Flush + promotion** : SDK mocké **signed-in** ⇒ `upsert` appelé avec
   `onConflict:'client_id,parcours,exercise_id,cible'` et les bons champs ; `pf_promotion` mocké
   `{promu:true,dormant:false}` ⇒ `niveauEffectif` = base+1 **pour cette position**, cache promo écrit.
8. **Portée du vote** : un vote/promotion **djembé** ne modifie ni l'acquis ni le niveau **cajón**
   (même `exerciseId` socle).
9. **Anonyme off / offline** : `signInAnonymously` mocké en échec (ou `fmSupabase()===null`) ⇒ vote
   **reste en file**, acquis **quand même** enregistré, **aucune** exception, UI non bloquée.
10. **Non-régression** : les 11 suites antérieures passent inchangées ; hors écran parcours, aucun
    champ de `S` ni comportement fm-metro modifié (surcouche no-op au repos).

---

## 9. Hors périmètre P-4

Les 5 autres modules de l'Intermédiaire (P-2) ; niveaux Débutant/Avancé/Artiste (P-5) ; vocalisation
syllabique (champ prévu, non câblé) ; rétrogradation `facile` (réserve) ; schéma Supabase (déjà posé
en P-3, non retouché) ; cimbalette (tier avancé).

---

## 10. Questions à trancher (avant code)

1. **`pattern` des atomes 2 et 3** : je propose `syncopeGrave` (trou) et `ghostPendule` (nappe) là où
   la spec mère laisse implicite. OK, ou tu imposes `theOne` partout ?
2. **Point d'accès à l'écran** : onglet dans l'en-tête à côté de « Jouer / Configurer », ou entrée
   dans une section « Cours funk » ? (défaut proposé : entrée dédiée en en-tête, discrète).
3. **Couleurs `PARC`** : bois `#C8722E` (cajón) / bleu `#2E86C8` (djembé) comme défauts — ou tu
   fournis les tokens ?
4. **Toggle anonyme** : à activer avant que je re-teste au câblage (sinon je livre le code, mais le
   circuit de vote restera dormant pour les non-connectés jusqu'au flip).

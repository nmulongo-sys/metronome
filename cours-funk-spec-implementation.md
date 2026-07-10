# Cours Funk — spec d'implémentation : mapping `pattern` → fm-metro & forme de livraison

**Statut : PROPOSITION — à valider avant tout code.**
Date : 2026-07-10. Références : `cours-funk-grille-spec.md` (§3 schéma de données, §3 bis animation, §4 promotion, §5 points ouverts), `cours-funk-exercices-debutant.json` (lot 1, 16 exercices), `index.html` build `metronomefunk-0.5.4` (l'état de base du chantier).

Cette spec ferme les deux points laissés ouverts au §5 de la grille : **(A)** le mapping du champ `pattern` vers le moteur fm-metro, **(B)** la forme de livraison (page HTML autonome vs section de `index.html`). Elle propose aussi le découpage en étapes de réalisation (§6).

---

## 1. Forme de livraison : section de `index.html` (recommandation)

### 1.1 Décision proposée

Le cours funk vit **dans `index.html`**, comme tout ce qui précède : une section `<details class="section" id="secCours">` (navigation parcours → niveau → exercice) et un **écran d'exercice** (fiche de travail : animation du geste, grille, transport, critère, vote). Pas de page autonome.

### 1.2 Pourquoi

- **Le moteur est la valeur.** Un exercice, c'est le scheduler, `percGrids`/`percOffsets`/`percMeta`, la machine gap, le rendu de grille (`buildPercRowsInto`, ligne de briques, curseur), le plein écran, l'export audio et — plus tard — la basse générative (E15/F15). Tout est déjà dans `index.html`. Une page autonome devrait soit **dupliquer ~400 Ko de moteur** (divergence garantie à la première retouche moteur), soit extraire un JS partagé — ce qui contredit la doctrine **fichier unique, offline, zéro dépendance** établie depuis l'origine et rappelée dans tous les briefs.
- **Les précédents existent déjà.** Le corpus `GROOVES` (passe 3, étape 3) est un référentiel embarqué en `const` dans le fichier ; le mode team spirit (étape 4) montre exactement comment une fonctionnalité charge des voix dans le moteur **sans le toucher** (namespace `ts.`, hooks gardés, non-régression par construction). Le cours reprend ces deux patrons à l'identique (§2).
- **L'infrastructure annexe est déjà là** : client Supabase (`window.fmSupabase`, présent dans 0.5.4), persistance `store` (localStorage), thèmes clair/sombre, mobile-first.

### 1.3 Le JSON du dépôt reste la source de vérité éditoriale

`cours-funk-exercices-debutant.json` (et les lots suivants) restent **les fichiers de référence** — c'est là qu'on écrit, relit et valide le contenu, lot par lot. À chaque livraison, leur contenu est **embarqué** dans `index.html` en `const FUNK_EXOS = [...]` (même statut que `GROOVES`), avec un en-tête de commentaire rappelant le fichier source et la date. L'app ne fait **aucun fetch** : offline strict. La copie est mécanique (concaténation des tableaux `exercices` des lots) et vérifiée par la recette (comptage d'IDs, cohérence avec les fichiers sources).

### 1.4 Écrans

- **`secCours`** (section repliable, strate `couche` comme `secPerc`/`secTeam`) : choix du parcours (cajón / djembé), niveau (1–4, seuls les niveaux pourvus en contenu sont actifs), liste des exercices du niveau avec pastille d'état (réussi ✓ / en cours / nouveau) et rappel des prérequis.
- **Fiche d'exercice** (même carte, contenu remplacé — pas de navigation de page) : titre, objectif, **animation du geste** (§4), ligne de vocalisation, grille des voix (rendu existant), transport + tempo (conseillé/min/max), critère de réussite, boutons « Réussi » (auto-évaluation, progression locale) et « Trop difficile pour ce niveau » (vote, §5).
- **Prérequis = recommandation, jamais verrou.** L'élève peut ouvrir n'importe quel exercice ; les prérequis non réussis s'affichent en rappel (« conseillé avant : Slap sur 2 et 4 »). Cohérent avec l'esprit de l'app (aucun mode ne verrouille rien) et avec la promotion : un exercice promu ne doit pas verrouiller rétroactivement ses dépendants.

---

## 2. Mapping `pattern` → moteur fm-metro

### 2.1 Principe : le patron team spirit, namespace `fk.`

Charger un exercice = écrire ses voix dans l'état moteur sous un préfixe dédié, exactement comme `tsSyncGrids()` :

```
const FK_PREFIX = 'fk.';
// une voix par geste : percGrids['fk.CJ-G1'], percOffsets[...], percMeta[...]
```

- `fkSyncGrids()` écrit/retire les voix `fk.*` dans `percGrids`/`percOffsets`/`percMeta` ; appelé au chargement, au déchargement, et ré-injecté après toute reconstruction focale (même point d'accroche que `tsSyncGrids` en fin de `buildPercGrids`).
- `rebuildPercMeta` **préserve déjà** les voix hors instrument focal (branche `prev`) — aucun changement.
- Sourdine du focal : hook `fkMuted(voice, brk)` appelé par `percLayerMuted` (une ligne gardée, même patron que `tsMuted`) — exercice chargé ⇒ voix focales et clave d'instrument en sourdine, voix `fk.*` audibles.
- **Exclusion mutuelle** : charger un exercice décharge le répertoire team spirit (`tsUnload()` existant) et réciproquement ; un seul « propriétaire » des voix invitées à la fois.
- Décharger l'exercice (`fkUnload`) restaure l'état antérieur : voix `fk.*` retirées, réglages utilisateur (tempo, gap) restitués (§2.6, §2.7).

### 2.2 Grilles et dynamiques

`grille16` (chaîne de 16 caractères `0`/`1`) → tableau de pas du moteur (valeurs 0/1/2), la valeur portée par la **dynamique de la voix** :

| `dyn` | valeur de pas | vélocité `playPerc` | `percMeta.gain` (nouveau) | résultat |
|---|---|---|---|---|
| `F` | `2` (accent) | 0,90 | 1 | accent plein |
| `mf` | `1` | 0,72 | 1 | médium |
| `ghost` | `1` | 0,72 | **0,35** | effleurement |

Le moteur n'a que deux niveaux (accent/normal). Plutôt que d'introduire une troisième valeur de grille (qui impacterait l'éditeur de pas, le rendu, les exports), le niveau **ghost** est porté par la **voix** : un champ optionnel `gain` dans `percMeta`, consommé par `playPerc` en une ligne (`v *= meta.gain || 1`). C'est cohérent avec le schéma §3 où `dyn` est une propriété de voix (jamais de pas), et strictement additif : `gain` absent ⇒ comportement actuel à l'octet près. Le lot 1 le confirme : aucune voix n'y mélange deux dynamiques.

Valeur 0,35 = point de départ à **valider à l'oreille** — le critère des exercices E3/F3 (« le métronome reste audible par-dessus ») est le juge.

### 2.3 Table de routage geste → timbre (`FK_GESTES`)

Une table embarquée unique sert **le son** (routage `playPerc`) et **l'animation** (§4 : zone, main). Seuls les gestes-voix y figurent ; les gestes « qualité » (CJ-M4 dynamique, DJ-G5 rebond open, TR-*) apparaissent dans `gestes` à titre pédagogique mais ne produisent pas de voix — la table les ignore.

Gestes requis par le lot 1 :

| Geste | Routage timbre | `gain` | Zone (anim) | Notes |
|---|---|---|---|---|
| CJ-G1 grave | `cajon.grave` | 1 | centre-loin de la tapa | existant |
| CJ-G2 tone | **`cajon.tone`** (nouveau cas) | 1 | bord supérieur, doigts joints | §2.4 |
| CJ-G3 slap catapulte | `cajon.aigu` | 1 | arête supérieure | le claqué existant |
| CJ-M1 ghost | **`cajon.tone`** | 0,35 | bord, effleurement | timbre doux, pas le snap |
| DJ-G1 bass | `djembe.basse` | 1 | centre de la peau | existant |
| DJ-G2 tone | `djembe.tone` | 1 | bord, doigts joints | existant |
| DJ-G3 slap | `djembe.slap` | 1 | bord, doigts ouverts | existant |
| DJ-M1 ghost/touche | `djembe.tone` | 0,35 | bord, effleurement | existant + gain |

Les lots suivants étendront la table (press tone, mute, cimbalette…) — **la table s'étend, le schéma §3 ne bouge pas**.

### 2.4 Seule extension de timbre : `cajon.tone`

Le cajón du moteur n'a que deux timbres (`grave`, `aigu` = claqué). Le parcours distingue dès le lot 1 le **tone** (CJ-G2, son médium discret) du **slap** (CJ-G3, claquant) — deux voix d'un même exercice (CAJ-1-E4-02). Mapper les deux sur `cajon.aigu` détruirait le contraste que le critère demande. Proposition : **un cas de plus** dans le `switch` de `playPerc` :

```
case 'cajon.tone': percDrum(t, 190, 130, 0.10, v * 0.8); break;
```

(fût médium court, entre `djembe.tone` 230/165 et `cajon.grave` 115/68 — paramètres à valider à l'oreille). Additif pur : aucune clé existante ne change, `TS_VALID` gagne l'entrée correspondante pour le répertoire libre. C'est la **totalité** des modifications moteur demandées par cette spec : `meta.gain` (1 ligne), `cajon.tone` (1 ligne), hook `fkMuted` (1 ligne gardée).

### 2.5 `swing` — via `percOffsets`, zéro modification moteur

- Lot 1 (Débutant) : `swing: null` ⇒ offsets à 0, binaire strict.
- Niveau 3+ : `pattern.swing` (50–62) ⇒ pas **impairs** de chaque voix décalés par `percOffsets[vid][i] = (2 · sw/100 − 1)` (en fraction de pas). C'est exactement la formule basse 5.4 `(i−1+2·sw)/16` exprimée dans le mécanisme d'offsets que `computeCycle` consomme déjà ; 62 % ⇒ +0,24 pas, dans la plage ±0,45 de l'éditeur. `sw = 50` ⇒ identité stricte. Le swing du **clic** (S.swing, subdivisions) reste un réglage utilisateur indépendant — l'exercice n'y touche pas.

### 2.6 `gap` — recopie dans la machine existante

- `gap: null` (tout le lot 1) : la machine gap reste **la propriété de l'utilisateur** — l'exercice n'y touche pas, l'élève peut l'ajouter lui-même.
- Schémas E9/F9 (niveau 2, « groove dans le trou ») : `pattern.gap = { mode, playN, muteM, target }` recopié dans `S.gap` au chargement, réglages utilisateur **sauvegardés puis restaurés** au déchargement. Aucune modification de la machine (leçon 5.4 : on ne rouvre pas le gap).

### 2.7 `tempo`, `mesures`, famille, métronome

- **Tempo** : au chargement, `S.tempo = tempo.conseille`. Les bornes min/max sont **affichées** (et un bouton « tempo conseillé » recale) mais ne bornent pas le slider : indication pédagogique, pas contrainte — l'élève reste libre, conforme à l'esprit de l'app. Réglage utilisateur restauré au déchargement.
- **Famille** : tout le cours est binaire ⇒ `setFamily('bin')` si nécessaire au chargement (le groove impose sa famille, précédent team spirit).
- **Métronome** : `beats = 4`, accent du 1er temps actif (c'est le One — FUNK-T1), subdivision au choix de l'élève (défaut noires). « Clic muet » disponible tel quel.
- **`mesures`** : le moteur boucle sur une mesure de 16 pas ; `mesures` (=2 partout au lot 1, grille identique répétée) sert au **comptage des cycles** du critère (« cycle 3/8 »), incrémenté dans `percOnNewMeasure` (hook cold-path existant, précédent `tsProgressBump`). Si un lot futur exige deux mesures **différentes**, on étendra `pattern` (`grille16` devient tableau par mesure) et le chargeur (grille dépliée sur 32 pas ou alternance par mesure) — à trancher à ce moment-là, conformément au §3 (« on étend `pattern`, pas le moteur »).

### 2.8 Vocalisation

- Rendu : ligne de syllabes sous la grille de l'exercice (convention du lot 1 : une syllabe par temps ou par subdivision, `–` = temps muet, MAJUSCULES = accentué), **surbrillance au fil de la lecture** par la boucle rAF du curseur existante (aucun événement audio nouveau).
- Personnalisation : réglage « éditer les syllabes / masquer », stocké `localStorage` clé **`fm-funk-vocal`** (objet `{ [idExercice]: chaîne }`), jamais côté serveur (grille §1.2). La vocalisation par défaut reste dans les données.

### 2.9 Persistance locale (nouvelles clés)

| Clé | Contenu |
|---|---|
| `fm-funk-progress` | `{ [idExercice]: { fait: bool, date } }` + dernier exercice ouvert par parcours |
| `fm-funk-vocal` | personnalisations de vocalisation (§2.8) |
| `fm-funk-vote-{id}` | garde anti-double-vote (grille §4) |
| `fm-funk-vote-queue` | file d'envoi offline des votes/vues (§5) |
| `fm-funk-client` | identifiant anonyme local (`client_hash`) |

Toutes via le wrapper `store` existant (try/catch silencieux).

---

## 3. Ce que le chargeur d'exercice fait, dans l'ordre

```
fkLoad(id) :
  1. tsUnload() si répertoire chargé ; fkUnload() si exercice déjà chargé
  2. sauvegarde réglages utilisateur { tempo, gap } (restaurés par fkUnload)
  3. setFamily('bin') si besoin ; S.perc.on = true
  4. pour chaque voix du pattern :
       vid = 'fk.' + geste
       percGrids[vid]   = grille16 → [0|1|2] selon dyn (§2.2)
       percOffsets[vid] = swing → offsets pas impairs (§2.5), sinon zéros
       percMeta[vid]    = { instr, voiceKind, gain } depuis FK_GESTES (§2.3)
  5. S.tempo = tempo.conseille ; pattern.gap → S.gap si non null (§2.6)
  6. computeCycle() ; rendu fiche (grille, vocalisation, animation §4)
  7. pn_funk_vues : +1 présentation travaillée à la première lecture lancée (§5)
```

`fkSyncGrids()` (ré-injection après reconstruction focale) et `fkMuted()` complètent le trio de hooks — c'est le même contrat que team spirit, dont la non-régression est déjà éprouvée : **tant qu'aucun exercice n'est chargé, tous les chemins nouveaux sont des no-op.**

---

## 4. Animation du geste (§3 bis) — implémentation

- **Module Canvas 2D autonome** (~quelques Ko de JS, aucune donnée par exercice) : décor (instrument en fil de fer, vue subjective, style hologramme — cajón ambre / djembé cyan), mains silhouettes translucides, frappes pilotées par `pattern` + `FK_GESTES` (zone, main, type de son).
- **Horloge propre** à l'animation (échelle ×0,15 à ×1, réglable), **découplée du séquenceur** (décision §3 bis actée) ; mini-rendu sonore des frappes en appelant directement `percDrum`/`percSnap`/`playPerc` hors scheduler.
- **Syllabe allumée à la frappe** : la ligne de vocalisation (§2.8) est partagée entre l'animation (horloge lente) et la lecture réelle (curseur rAF) — même rendu, deux sources d'index.
- **Cycle de vie** : un seul canvas, démarré à l'ouverture de la fiche, arrêté à sa fermeture (une seule boucle rAF, jamais en tâche de fond).
- **Mains** : la répartition D/G vient de `FK_GESTES` + règle d'alternance pour les nappes (`percHandsFor` existant en repli) ; le champ optionnel `anim` du schéma §3 bis couvrira les cas ambigus quand ils arriveront (cimbalette…).

---

## 5. Votes « trop difficile » & compteur de vues (grille §4)

- **Client** : `window.fmSupabase()` existant (0.5.4 l'embarque déjà). Tables `pn_funk_votes` (`exercice_id`, `client_hash`, `created_at`, unicité sur le couple) et `pn_funk_vues` (même granularité, une ligne = un client a *travaillé* l'exercice : première lecture lancée, pas simple ouverture de fiche).
- **Offline d'abord** : vote/vue → écrits en local (`fm-funk-vote-queue`) puis envoyés à la connexion suivante (événement `online` + tentative au chargement). L'app reste 100 % fonctionnelle sans réseau.
- **RLS** : insertion anonyme autorisée (comme le vote est par appareil, pas par compte) ; lecture des lignes individuelles fermée ; l'agrégat (votes/travaillés par exercice) exposé via une **vue ou RPC agrégée** en lecture publique. Préfixe `pn_` à confirmer (point ouvert reconduit).
- **Exploitation v1 = éditoriale.** Les niveaux affichés viennent du **contenu embarqué** (champ `niveau` des lots). La règle des 40 % (≥ 25 travaillés) est **appliquée à la main** à chaque lot : lecture de l'agrégat, réédition du champ `niveau` dans le JSON, ré-embarquement. Pas de promotion dynamique côté client en v1 — conforme au §4 (« les niveaux affichés viennent du dernier état embarqué/synchronisé »), et ça évite d'embarquer la logique de seuil avant d'avoir des données réelles.

---

## 6. Découpage en étapes de réalisation (une étape = une session, recette à chaque étape)

| Étape | Contenu | Recette |
|---|---|---|
| **C1 — chargeur & fiche** | `FUNK_EXOS` (lot 1 embarqué), `FK_GESTES`, `fkLoad`/`fkUnload`/`fkSyncGrids`/`fkMuted`, extensions moteur §2.2/§2.4 (gain + `cajon.tone`), navigation `secCours`, fiche minimale (grille, transport, tempo, critère, vocalisation statique), progression locale | `recette-cours-1.js` : chargement des 16 exercices (voix, valeurs de pas, meta/gain, tempo), mute focal, décharge/restauration, non-régression complète (8 recettes existantes vertes) |
| **C2 — animation & vocalisation vivante** | module Canvas §4, surbrillance syllabique (anim + lecture), réglage vocalisation (`fm-funk-vocal`) | `recette-cours-2.js` : présence/cycle de vie du canvas, table geste→zone couvrante, édition/masquage vocalisation, 0 rAF résiduel après fermeture |
| **C3 — votes & vues** | tables Supabase + RLS, file offline, boutons vote/« réussi », compteur de vues | `recette-cours-3.js` : file locale (offline simulé), unicité par appareil, envoi au retour réseau (client simulé, précédent PR #7/#8) |

Hors périmètre (assumé) : i18n de la section cours (précédent basse — lot i18n dédié) ; exercices niveaux 2–4 (lots de contenu suivants — C1 doit néanmoins charger tout exercice conforme au §3, pas seulement le lot 1) ; promotion dynamique côté client (§5) ; synchronisation animation/séquenceur (décision §3 bis, ne pas rouvrir).

---

## 7. Points ouverts / risques

- **À l'oreille** : gain ghost 0,35, paramètres `cajon.tone` (190/130/0,10), équilibre des trois couches du groove socle — le headless prouve la mécanique, pas le goût (constante du projet).
- **Poids** : ~17 Ko de données lot 1 + ~25–35 Ko estimés de code C1–C2 sur un fichier de ~400 Ko — acceptable ; à surveiller quand les ~80–100 exercices seront là (les lots 2+ pourraient imposer une forme compacte de `FUNK_EXOS`, champ `grille16` déjà compact).
- **Lignée de branches** : le chantier cours vit sur la lignée `metronomefunk-0.5.4`, alors que `main` (version servie) a reçu entre-temps login/bibliothèque/export/i18n. La **réconciliation 0.5.4 ↔ main est un chantier séparé et préalable au déploiement du cours** — rien dans cette spec ne la complique (tout est additif), mais elle doit être nommée : le cours ne sera visible en ligne qu'après.
- **Préfixe Supabase** `pn_` et politique RLS exacte — à confirmer au moment de C3.

## 8. Prochaine étape proposée

Validation de cette spec → **étape C1** (chargeur + fiche + recette), sur la base du lot 1 tel que livré.

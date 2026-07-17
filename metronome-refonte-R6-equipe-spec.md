# Métronome FM — R-6 · `equipe.html` (spec courte) — build 0.20.0

> **Statut : GO de Jean reçu le 17/07 — en exécution.**
> **D1 tranché : les DEUX modes** (hors-ligne **et** online, au choix de l'utilisateur).
> **D2–D6 : défauts** (D6 = build **0.20.0**). Rédigée le 2026-07-17. Base d'exécution :
> `main` = `cc624c4` (merge #35, build 0.19.0). Chantier arbitré par Jean (R-6 plutôt que
> le corpus), validé par le panel R5-4 (Camille, Fatou, Henri).

---

## 0. Cadre et invariants (rappel, non renégociés)

- **Français ; fichiers complets, jamais un patch ; Pages sans étape de build.**
- **Zéro moteur** : `moteur/*.js` verbatim, md5 == 0.10.0 asserté (recette-extraction) ;
  la seule ligne tolérée dans `moteur/*.js` = `BUILD` → `metronomefunk-0.20.0`.
- `equipe.html` est une **page neuve** : elle charge le moteur et fournit donc **tout ce
  que le moteur référence** (contrat de coquille R-3a) — vrais contrôles quand elle s'en
  sert, **stubs inertes** sinon (§4). Aucune retouche du moteur.
- Batterie clean-room complète + navigateur réel deux modes (http:// **et** file://)
  avant PR ; `rapport-nonregression-0.20.0.md` joint ; **Jean merge la PR lui-même**.

---

## 1. Objet — « la salle de concert »

`pratiquer.html` est la salle des machines : on y **fabrique** une répartition (section
**Team Spirit** : assistant priorités → N joueurs → `Répartir auto`, cartes par
participant, export JSON/pupitre). `equipe.html` est la salle de concert : on y **joue**
cette répartition **en groupe, chacun sur son appareil**, avec un **chef** commun pour
partir et tenir ensemble. La porte « En équipe » de l'accueil (aujourd'hui inactive,
`#porteEquipe`) devient active et pointe ici.

Ce que le panel R5-4 a mis noir sur blanc :

- **Camille & Fatou** (les deux « collectives ») butent sur la même limite depuis deux
  pages : Team Spirit vit sur **un seul appareil**, pas de travail « en pupitre » que
  chacune ouvre **chez elle / sur son téléphone**.
- **Henri** (80 ans, ancien chef) veut un **« chef d'harmonie automatique »** : de quoi
  faire **partir le groupe ensemble** et donner le tempo sans battre la mesure à la main.

---

## 2. Les DEUX modes (D1 tranché par Jean)

La répartition Team Spirit est **déterministe** (« même répartition sur chaque appareil ») :
à groove + priorités + N identiques, chaque appareil reconstruit **la même** distribution.
`equipe.html` propose donc **un choix à l'entrée** :

- **Mode hors-ligne (off)** — la voie sans réseau : on **partage une config** (lien/JSON) ;
  chacun l'ouvre, choisit **son numéro**, et **tout le monde part sur le décompte du chef**.
  Même tempo, même grille, départ commun → calé pour la durée d'une répétition. Aucune
  dépendance réseau. C'est le mode **socle**, entièrement vérifiable.
- **Mode online** — la voie « en direct » (Henri) : une **salle** (code court) où le **chef**
  diffuse le transport (config + départ programmé + tempo) à tous les appareils via
  **Supabase Realtime broadcast**, réutilisant `window.fmSupabase()` (supabase-js@2 déjà
  chargé pour le compte/les routines). **Sans login, sans table DB, sans nouvelle
  dépendance** : un canal `broadcast` anonyme suffit. Le décompte du chef absorbe la gigue
  réseau (départ commun sur « 4·3·2·1 », tolérance humaine d'une répétition).

Bascule off↔online dans la page ; **off est le défaut** (marche partout, tout de suite).

### 2bis. Caveat de vérification (honnêteté)

L'egress réseau de l'env de session est **bloqué (proxy 403)** vers Supabase **et** le CDN
— comme github.io. Toute la couche Supabase de l'app est **déjà mockée dans les recettes**
(`w.supabase = { createClient: … }`) et n'a jamais été testée en réseau réel ici. Le mode
**online** suit ce régime : **câblage vérifié par mock** (chef `channel().send`, suiveur
`.on('broadcast')` applique le transport), **synchro live à 2 appareils = vérif prod de
Jean**. Le mode **hors-ligne** est, lui, **entièrement vérifiable** ici (batterie +
navigateur réel).

---

## 3. Périmètre v1 (ce qui est DANS)

1. **Choix du mode** à l'entrée (off / online), off par défaut.
2. **Charger une config d'équipe** (les deux modes) — 3 sources, sans backend nouveau
   (D2 défaut) : (a) **passerelle depuis Team Spirit** — bouton `▶ Jouer en équipe` dans
   `#secTeam` ouvrant `equipe.html` avec la config dans le **hash d'URL** ; (b) **lien
   partageable** (hash) ; (c) **import du JSON** de `↓ Exporter tout` (`#tsExportAll`).
   La config = `{grille/groove, tempo, N, assignation par joueur, backing}` — pas de perso.
3. **« Mon pupitre ».** Choisir son numéro (1…N) → **sa ligne en avant** (ligne de
   réduction, `--fm-voice-*`), les autres en **backing/muet** (`tsMuted`), le métronome
   lance. `equipe` **applique** une assignation (elle ne recalcule pas la répartition —
   la fabrique reste Team Spirit).
4. **Le chef (D4 défaut).** **Décompte de départ grand** (« 4·3·2·1 ») + **clic de
   préparation** d'un cycle, puis le métronome tient le tempo. Pas de synthèse vocale.
   En online : le chef déclenche le décompte pour toute la salle.
5. **Partage / pupitre imprimable.** **Copier le lien** (hash) ; **fiche de pupitre**
   imprimable « ma ligne » (`window.print` + feuille `@media print`). L'export **PNG** est
   repoussé à v1.1 (borne le périmètre).
6. **Passerelles & porte.** `#porteEquipe` → **active** (`<a href="equipe.html">` + note
   située traduite) ; volume + sourdine (5e cellule R5-1) et continuité tempo (`fm-tempo`)
   comme les 3 pages.

## 3bis. Ce que R-6 v1 ne touche PAS

- **Le moteur** (md5 réasserté). **Team Spirit sur pratiquer** : inchangé, +1 bouton
  passerelle (i18n). **`apprendre` en pupitre** (D3 = v1.1, demande notée). **Bibliothèque
  en ligne comme 4e source** (D2 = v1.1). **Le contenu corpus** (M1 au fond).

---

## 4. Contrat de coquille (R-3a) — ce que la page neuve fournit

Ordre : `corpus/*.js` → `moteur/fm-etat.js` → `fm-audio.js` → `fm-accomp.js` →
`coquille/fm-compte.js` (compte + `window.fmSupabase`, pour le online) →
`coquille/fm-equipe.js` (briques partagées, D5-a) → script de page.

- **IDs réels** utilisés : `startBtn`, `statusLine` (transport) ; volume
  (`volSlider`/`volVal`/`volMuteBtn`) ; tempo. `tsMuted` est **réel** (cœur du pupitre).
- **Stubs inertes** (`#fmStubs`, `display:none`) pour les hooks non utilisés : `percFsPlay`
  et les **21 IDs basse** de `fm-accomp.js` ; hooks fonctions de start/stop/scheduler
  (`bowReset`, `draw`, `drawStatic`, `percBreakEvents`, `percOnNewMeasure`,
  `percResetBreakState`, `scriptOnNewMeasure`, `wakeLockUpdate`, `atelierRender`) → stubs
  vides (règle §Règle d'usage R-3a).
- **État de coquille** lu par le moteur (`percGrids`, `percMeta`, `percMuted`,
  `percOffsets`, `percMeasures`, `claveData`, `CLAVE_VOICES`, `atelierOpen`, …) : peuplé
  depuis la config chargée (via `fm-equipe.js`, comme pratiquer au chargement d'un groove).

Aucun stub n'est une retouche moteur : lignes de page après les balises moteur.

---

## 5. Réutilisation (D5-a acté) — `coquille/fm-equipe.js`

La brique qui doit **vraiment ne pas diverger** entre pratiquer et equipe est le **contrat
de config** : pratiquer l'**encode**, equipe la **décode**. Elle vit donc dans un fichier de
**coquille** (hors md5 moteur), chargé par les **deux** pages — une seule copie, zéro dérive :
`window.fmEquipe = { encode, decode, href, audibleForPlayer, voicesOfPlayer }` (base64url,
format v1 documenté en tête de fichier).

La **logique Team Spirit** (assistant → attribution) **reste sur pratiquer** : equipe
**consomme** l'assignation portée par la config, elle ne la recalcule pas. Le **rendu de la
grille du pupitre** est **local à equipe** (patron R-4d, une ligne par voix + curseur) : c'est
une vue, pas un contrat partagé — pratiquer/apprendre gardent leurs propres vues, **aucune
extraction destructive** de leur code (donc aucun risque de régression : 66/70 recettes
vertes). Résultat : D5-a tenu là où il compte (le codec partagé), sans retoucher les vues
existantes.

---

## 6. i18n (strict)

Toute chaîne visible + `title`/`aria-label` d'`equipe.html` a sa clé **EN et PT**
(`window.__I18N = {en:{…}, pt:{…}}`, symétrie EN↔PT auditée). Vocabulaire repris des pages
sœurs. Langue partagée `localStorage['fm-lang']`. Sur `index.html`, les clés de la porte
« En équipe » passent de « bientôt … » à l'annonce active (EN/PT mis à jour, ancienne clé
retirée des deux dicts).

---

## 7. Décisions (tranchées au GO)

| # | Question | Tranché |
|---|---|---|
| **D1** | Ambition réseau | **Les deux modes** : hors-ligne (défaut) **et** online (salle broadcast Supabase) |
| **D2** | Sources de config v1 | Passerelle Team Spirit + lien hash + import JSON ; bibliothèque en ligne = v1.1 |
| **D3** | `apprendre` en pupitre dès v1 | Non — v1.1 (demande notée) |
| **D4** | Forme du « chef » | Décompte visuel grand + clic de préparation (pas de synthèse vocale) |
| **D5** | Anti-duplication | **D5-a** : `coquille/fm-equipe.js` partagé |
| **D6** | Build | **0.20.0** |

---

## 8. Recette (porte de sortie code)

- Nouvelle suite **`recette-equipe.js`** (jsdom) : transport + volume + décompte présents ;
  parse d'une config (hash/JSON) → `percGrids` peuplé ; choix du numéro → `tsMuted` isole
  « ma » voix (autres backing/muet) ; chef → décompte puis `start()` ; lien de partage
  reproduit la config ; **mode online mocké** (`window.supabase` factice : le chef appelle
  `channel().send` avec le bon payload, le suiveur applique via `.on('broadcast')`) ;
  **audit i18n** (EN+PT, symétrie). Extensions : **`recette-accueil.js`** (porte
  `#porteEquipe` **active**, `a[href="equipe.html"]`, note traduite) ;
  **`recette-pratiquer.js`** (bouton `▶ Jouer en équipe`, ouvre `equipe.html#…` ;
  non-régression après extraction `fm-equipe.js`). **`recette-extraction.js`** : md5 moteur
  == 0.10.0 **inchangé** ; BUILD 0.20.0.
- **Navigateur réel** (Chromium, http:// + file://) : **cœur hors-ligne** — générer un lien
  depuis Team Spirit → l'ouvrir dans equipe → choisir un numéro → décompte → le clic
  tourne, ma ligne sonne, les autres backing/muet (`window.fmMetroAudio()`). Le **online
  live** n'est pas testable ici (proxy 403) → vérif prod de Jean.
- `rapport-nonregression-0.20.0.md` joint ; **PR unique** (#36) base `main`.

---

## 9. Livrables

- **`equipe.html`** (page neuve) ; **`coquille/fm-equipe.js`** (neuf, D5-a) ;
  **`index.html`** (porte active + i18n) ; **`pratiquer.html`** (bouton passerelle +
  balise `fm-equipe.js` + i18n) — fichiers complets.
- **`recette-equipe.js`** (neuve) ; `recette-accueil.js`, `recette-pratiquer.js`,
  `recette-extraction.js` étendues.
- **`moteur/fm-etat.js`** : `BUILD = 'metronomefunk-0.20.0'` (seule ligne tolérée).
- `metronome-refonte-R6-equipe-spec.md` (ce fichier) ; `rapport-nonregression-0.20.0.md`.

# Métronome FM — R-6 · `equipe.html` (spec courte) — build 0.20.0

> **Statut : brouillon — en attente du GO de Jean.**
> Rédigée le 2026-07-17. Base d'exécution : `main` = `cc624c4` (merge #35, build
> 0.19.0, prod à constater). R-6 est le chantier suivant, validé par le panel R5-4
> (Camille, Fatou, Henri) et arbitré par Jean (R-6 plutôt que le corpus).

---

## 0. Cadre et invariants (rappel, non renégociés)

- **Français ; fichiers complets, jamais un patch ; Pages sans étape de build.**
- **Zéro moteur** : `moteur/*.js` verbatim, md5 == 0.10.0 asserté (recette-extraction) ;
  la seule ligne tolérée dans `moteur/*.js` = `BUILD` → `metronomefunk-0.20.0`.
- `equipe.html` est une **page neuve** : elle charge le moteur et fournit donc **tout ce
  que le moteur référence** (contrat de coquille R-3a) — via les vrais contrôles quand
  elle s'en sert, via des **stubs inertes** sinon (§4). Aucune retouche du moteur.
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

Ce que le panel R5-4 a mis noir sur blanc (à moitié écrit par le terrain) :

- **Camille & Fatou** (les deux « collectives ») butent sur la même limite depuis deux
  pages : Team Spirit vit sur **un seul appareil**, et il n'y a pas de travail « en
  pupitre » que chaque joueuse ouvre **chez elle / sur son téléphone**.
- **Henri** (80 ans, ancien chef) veut un **« chef d'harmonie automatique »** : de quoi
  faire **partir le groupe ensemble** et donner le tempo sans qu'un humain batte la mesure.

---

## 2. Pourquoi le déterministe hors-ligne (et pas la synchro réseau) en v1

Team Spirit annonce déjà sa promesse : « chacun sa ligne — même groove, même classement,
**même répartition sur chaque appareil** ». La répartition est **déterministe** : à groove
+ priorités + N joueurs identiques, chaque appareil reconstruit **la même** distribution.

Donc, **sans backend temps réel** (l'app est statique, Pages sans build), il suffit de
partager **une config d'équipe** (groove + priorités + N + backing) ; chaque joueur
l'ouvre sur son appareil, choisit **son numéro**, et **tout le monde part sur le même
décompte du chef**. Même tempo, même grille, départ commun → on reste calé pour la durée
d'une répétition. C'est exactement le modèle sur lequel Team Spirit repose déjà.

La **synchro réseau multi-appareils en direct** (le chef d'un téléphone qui pilote
start/stop/tempo des autres en temps réel via Supabase Realtime) est un **chantier séparé**
(backend, latence, salles) — **hors périmètre v1**. Notée en §7 D1, réversible au GO.

---

## 3. Périmètre v1 (ce qui est DANS)

1. **Charger une config d'équipe.** Trois sources, sans backend nouveau :
   (a) **passerelle depuis Team Spirit** — un bouton `▶ Jouer en équipe` dans `#secTeam`
   ouvre `equipe.html` avec la config courante encodée dans le **hash d'URL** ;
   (b) **lien partageable** — l'URL (hash) contient la config ; la coller/scanner suffit ;
   (c) **import du JSON** déjà exporté par `↓ Exporter tout (JSON)` (`#tsExportAll`).
   La config = `{groove|grille, priorités, N, backing, tempo}` — pas de données perso.
2. **« Mon pupitre ».** Le joueur choisit son numéro (1…N) → la page **met sa ligne en
   avant** (ligne de réduction colorée par voix, mêmes `--fm-voice-*`), joue les autres en
   **backing track** (ou muet), et lance le métronome. Réutilise le mécanisme d'inaudition
   par voix (`tsMuted`) et le rendu de la ligne de réduction — voir §5 réutilisation.
3. **Le chef.** Un **décompte de départ** proéminent — grand visuel « 4 · 3 · 2 · 1 » +
   **clic accentué** de préparation d'un cycle — pour que le groupe démarre ensemble ;
   puis le métronome tient le tempo (« chef automatique »). Pas de synthèse vocale (hors
   moteur) : décompte **visuel grand** + clic de préparation via le moteur existant.
4. **Partage / pupitre imprimable.** Bouton **copier le lien** (hash) ; **fiche de pupitre
   par joueur** imprimable / PNG (patron des exports existants `#tsPrintBtn`/`#tsPngBtn`),
   « ma ligne » seule, pour travailler chez soi.
5. **Passerelles & porte.** `#porteEquipe` sur l'accueil devient **active** (`<a href>` +
   note située traduite) ; le lien profond `Pratiquer › Team Spirit` reste valable ;
   volume + sourdine (5e cellule R5-1) et continuité tempo (`fm-tempo`) comme les 3 pages.

## 3bis. Ce que R-6 v1 ne touche PAS

- **Le moteur** (md5 réasserté). **Team Spirit sur pratiquer** : inchangé, on y **ajoute
  seulement** le bouton passerelle (1 élément, i18n). **La synchro réseau** (§7 D1).
- **`apprendre.html` en pupitre** : la demande de Camille (mettre une **fiche de leçon** en
  pupitre) est **notée** ; proposée en **v1.1**, hors v1 pour borner (§7 D3).
- **Le contenu corpus** (M1 au fond) : le grand chantier i18n reste à part.

---

## 4. Contrat de coquille (R-3a) — ce que la page neuve doit fournir

`equipe.html` charge `corpus/*.js` → `moteur/fm-etat.js` → `fm-audio.js` → `fm-accomp.js`
→ script de page. Elle fournit :

- **IDs réels** quand elle s'en sert : `startBtn`, `statusLine` (transport), volume
  (`volSlider`/`volVal`/`volMuteBtn`), tempo.
- **Stubs inertes** (`#fmStubs`, `display:none`) pour tout hook non utilisé au premier
  niveau : `percFsPlay` et les **21 IDs basse** de `fm-accomp.js` (`bassOn`…`gapCrossed`),
  et les hooks fonctions attendus par start/stop/scheduler (`bowReset`, `draw`,
  `drawStatic`, `percBreakEvents`, `percOnNewMeasure`, `percResetBreakState`,
  `scriptOnNewMeasure`, `wakeLockUpdate`, `atelierRender`) — stubs vides, exactement comme
  la règle §Règle d'usage de R-3a. `tsMuted` est **réel** ici (c'est le cœur du pupitre).
- **État de coquille** lu par le moteur (`percGrids`, `percMeta`, `percMuted`, `percOffsets`,
  `percMeasures`, `claveData`, `CLAVE_VOICES`, `atelierOpen`, …) : peuplé depuis la config
  chargée, comme le fait pratiquer au chargement d'un groove.

Aucun stub n'est une retouche moteur : ce sont des lignes de page après les balises moteur.

---

## 5. Réutilisation (anti-duplication) — décision à acter

`equipe.html` **consomme** une répartition ; elle n'a **pas** besoin de toute la surface
d'édition de pratiquer. Mais deux briques existent déjà sur pratiquer et ne doivent pas
diverger : (i) le **chargement d'un groove → `percGrids`/état moteur**, (ii) le **rendu de
la ligne de réduction** colorée par voix, (iii) la **logique de répartition Team Spirit**
(assistant → attribution déterministe → `tsMuted`).

Deux stratégies (§7 D5) :
- **D5-a (défaut proposé)** : extraire ces briques partagées dans un **`coquille/fm-equipe.js`**
  (coquille, pas moteur — hors md5) chargé par **pratiquer ET equipe** ; pratiquer garde son
  comportement (non-régression prouvée par ses recettes). Une seule copie, zéro dérive.
- **D5-b** : copier le sous-ensemble minimal dans le script d'`equipe.html` (page complète,
  autonome) — plus simple à livrer, risque de dérive à surveiller.

---

## 6. i18n (strict)

Toute chaîne visible + `title`/`aria-label` d'`equipe.html` a sa clé **EN et PT**
(`window.__I18N = {en:{…}, pt:{…}}`, symétrie EN↔PT auditée par la recette). Vocabulaire
repris des pages sœurs (« Volume », « muet », « Se connecter », décompte, etc.). La langue
vit dans `localStorage['fm-lang']` **partagé** : une bascule sur l'accueil suit ici. Sur
`index.html`, les clés de la porte « En équipe » passent de « bientôt … » à l'annonce
active (EN/PT mis à jour ; l'ancienne clé « bientôt … » retirée des deux dicts).

---

## 7. Points à trancher au GO (Jean)

| # | Question | Défaut proposé |
|---|---|---|
| D1 | Ambition réseau : v1 **déterministe hors-ligne** (config partagée, départ au chef commun) — ou viser la **synchro temps réel** (Supabase Realtime) ? | **Hors-ligne** en v1 ; le temps réel = chantier séparé ultérieur |
| D2 | Sources de config en v1 | **a + b + c** (passerelle Team Spirit + lien hash + import JSON) ; publier/charger depuis la **bibliothèque en ligne** = v1.1 |
| D3 | `apprendre.html` en pupitre (fiche de leçon → équipe) dès v1 ? | **Non** (v1.1) — borne le périmètre ; demande notée |
| D4 | Forme du « chef » | **Décompte visuel grand + clic de préparation** (pas de synthèse vocale, hors moteur) |
| D5 | Réutilisation des briques groove/réduction/Team Spirit | **D5-a** : `coquille/fm-equipe.js` partagé (une copie, zéro dérive) |
| D6 | Numéro de build | **0.20.0** |

---

## 8. Recette (porte de sortie code)

- Nouvelle suite **`recette-equipe.js`** (jsdom) : présence transport + volume + décompte ;
  parse d'une config depuis le hash → `percGrids` peuplé ; choix du numéro → `tsMuted`
  isole « ma » voix (les autres en backing/muet) ; chef → décompte puis `start()` ;
  lien de partage reproduit la config ; **audit i18n** (chaque chaîne/`title`/`aria` a EN+PT,
  symétrie). Extensions : **`recette-accueil.js`** (porte `#porteEquipe` **active**,
  `a[href="equipe.html"]`, note traduite) ; **`recette-pratiquer.js`** (bouton
  `▶ Jouer en équipe` présent, ouvre `equipe.html#…`). **`recette-extraction.js`** :
  md5 moteur == 0.10.0 **inchangé** ; BUILD 0.20.0.
- **Navigateur réel** (Chromium, http:// + file://) : générer un lien depuis Team Spirit →
  l'ouvrir dans equipe → choisir un numéro → décompte → le clic tourne, ma ligne sonne,
  les autres en backing/muet (lecture `window.fmMetroAudio()` : `master.gain`, `playing`).
- `rapport-nonregression-0.20.0.md` joint ; **PR unique** base `main`.

---

## 9. Livrables

- **`equipe.html`** (page neuve) ; **`index.html`** (porte active + clés i18n) ;
  **`pratiquer.html`** (bouton passerelle + i18n) ; si D5-a : **`coquille/fm-equipe.js`**
  (+ balise dans pratiquer et equipe) — fichiers complets.
- **`recette-equipe.js`** (neuve) ; `recette-accueil.js`, `recette-pratiquer.js`,
  `recette-extraction.js` étendues.
- **`moteur/fm-etat.js`** : `BUILD = 'metronomefunk-0.20.0'` (seule ligne tolérée).
- `metronome-refonte-R6-equipe-spec.md` (ce fichier) ; `rapport-nonregression-0.20.0.md`.

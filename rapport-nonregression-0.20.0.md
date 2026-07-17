# Rapport de non-régression — build 0.20.0 (R-6 · `equipe.html`)

Base : `main` = 0.19.0 (`cc624c4`, salve P2 en prod). Objet : **R-6 — la page « En équipe »**
(spec `metronome-refonte-R6-equipe-spec.md`), la « salle de concert » : jouer en groupe une
répartition Team Spirit, chacun sa ligne, le chef donne le départ — **deux modes** (hors-ligne
et en ligne, D1 tranché par Jean). **Zéro moteur** (BUILD seule ligne), livraison fichiers complets.

## 1. Ce qui change

| Fichier | Changement |
|---|---|
| `equipe.html` | **Page neuve**. Transport + volume ; charge une config d'équipe (hash d'URL, import JSON, passerelle Team Spirit) ; « mon pupitre » (choix du joueur → `tsMuted` isole ma ligne, grille vivante) ; le chef (décompte + départ) ; partage (lien) + impression ; mode **online** (salle broadcast Supabase, réutilise `window.fmSupabase()`). Contrat de coquille R-3a par stubs (`percFsPlay` + `gapTarget`). i18n EN+PT. |
| `coquille/fm-equipe.js` | **Neuf** (coquille partagée, hors md5 moteur). Codec de config d'équipe : `encode`/`decode` (base64url), `audibleForPlayer`, `voicesOfPlayer`. Chargé par pratiquer ET equipe. |
| `index.html` | Porte « En équipe » **activée** (`<a href="equipe.html">` + sous-titre + note située) ; anciennes clés i18n « bientôt … »/« Pratiquer › Team Spirit » **purgées**, 2 nouvelles clés EN+PT. |
| `pratiquer.html` | Bouton **`▶ Jouer en équipe`** dans Team Spirit (`tsEquipeConfig()` → `equipe.html#c=…`) ; include `coquille/fm-equipe.js` ; 2 clés i18n EN+PT. |
| `moteur/fm-etat.js` | `BUILD` → `metronomefunk-0.20.0` (**seule** ligne moteur ; dans la tolérance). |
| `recette-equipe.js` | **Neuve** — 46 assertions (voir §2). |
| `recette-extraction.js` | Contrat d'ordre : `fm-equipe.js` après compte (pratiquer + equipe) ; page `equipe.html` ajoutée ; BUILD 0.19.0 → 0.20.0. |
| `recette-accueil.js` | Porte « En équipe » ACTIVE (D1.4/D1.5 réécrits) ; 3e note située (P2.5) ; clés i18n des portes mises à jour + purge (H1.3/H1.3bis) ; BUILD. |
| `recette-pratiquer.js` | +3 assertions R-6 (bouton présent, codec chargé, config décodable) ; BUILD. |
| `recette-apprendre.js` | BUILD 0.19.0 → 0.20.0 (seul changement). |

**Aucune retouche moteur** hors BUILD : `moteur/*.js` reste **identique à 0.10.0 à l'octet
près** modulo la ligne BUILD (recette-extraction : moteur md5 == 0.10.0, tolérances = BUILD +
`accompMuted` ×1 + `feelMs` ×2, inchangées).

## 2. Batterie canonique — 29 suites, 1077 assertions, 0 rouge

Node 22, jsdom, `--max-old-space-size=4096`. Comptes par suite :

- **Neuve** : `recette-equipe.js` **46** — chargement propre + BUILD ; contrat moteur (hooks +
  globals neutres, le moteur démarre) ; codec (aller-retour, lecture de hash, robustesse au
  charabia, audibilité par joueur) ; charge de config → `percGrids` peuplé ; **pupitre**
  (`tsMuted` isole ma ligne, backing on/off, chef = tout audible) ; le chef (décompte → start) ;
  partage (le lien reproduit la config) ; **mode online MOCKÉ** (le chef diffuse la config à la
  connexion, diffuse « start » ; le suiveur applique une réception « config »/« stop ») ; audit
  i18n strict (symétrie EN↔PT, 0 manque texte/attribut) ; **2e DOM booté par le hash**.
- **Extraction** : 26 → **28** (moteur md5 == 0.10.0 inchangé ; +2 : `equipe.html` dans le
  contrat d'ordre ; BUILD 0.20.0).
- **Touchées** : accueil **61** (porte active, comptes constants — D1.4/D1.5/P2.5/H1.3 réécrits) ·
  pratiquer **63 → 66** (+3 R-6) · apprendre **70** (BUILD seul).
- **24 autres suites** : comptes **strictement inchangés** (P-2 42, P-4 44, P-6 56, P-7 34,
  P-8 32, corpus 30, registre 9, grooves 29, demo 27, a11y-i18n 53, atelier-exports 73,
  mobile 56, onboarding 35, UX 43, chantier-B 26, cajon-cymbalette 19, 5-1 20, 5-1-bis 21,
  5-2 23, 5-3 38, 5-3-bis 15, 5-3-ter 28, 5-3c 21, 5-4 32).

Total : 1026 (0.19.0) **− 0 + 51** (equipe 46 + extraction 2 + pratiquer 3) = **1077**, **0 rouge**.

Symétrie i18n conservée : chaque chaîne visible + `title`/`aria-label` d'equipe est traduit **EN
et PT** (audit I4/I5, 0 manque) ; les clés purgées de l'accueil le sont dans les **deux** dicts.

## 3. Navigateur réel (Chromium `playwright-core`) — cœur HORS-LIGNE : 24/24, 2 modes, 0 erreur

http:// (serveur statique) **et** file://. Erreurs applicatives = 0 (échecs réseau CDN Supabase/
polices **filtrés** : le cœur hors-ligne s'en passe — dégradation propre confirmée).

- **Config par le hash** : `equipe.html#c=…` → état chargé, `percGrids` peuplé (2 voix), résumé
  du groove affiché (« Test funk · 100 BPM »).
- **Pupitre** : joueur 1 + backing OFF → ma voix (`eq.0`) **audible**, l'autre (`eq.1`) **muette**.
- **Lecture réelle** : `▶ Démarrer` → `window.fmMetroAudio()` = `ctx running`, `playing=true`,
  **gain maître ≈ 0,8**. Sourdine → **gain 0** ; ré-appui → **0,8** (agit sur le son, pas qu'un état).
- **Le chef** : clic « ▶ Départ » → overlay de décompte affiché.
- **Continuité tempo** : `fm-tempo` persisté = tempo de la config (100).

## 4. Mode ONLINE — vérifié au câblage (mock), à valider en prod (Jean)

L'egress réseau de l'environnement de développement est **bloqué (proxy 403)** vers Supabase et
le CDN — comme github.io. Toute la couche Supabase de l'app est **déjà mockée** dans les recettes
(régime historique : compte/routines jamais testés en réseau réel ici). Le mode online suit ce
régime : **câblage prouvé par mock** (le chef `channel().send` avec le bon payload ; le suiveur
`.on('broadcast')` applique le transport — assertions H1–H7). La **synchro live à 2 appareils**
n'est pas testable ici → **vérif prod de Jean** (créer une salle sur un appareil, la rejoindre sur
un second, le chef donne le départ).

## 5. À l'œil / à l'oreille après merge (Jean)

Pages 0.20.0 servies (4 pages en 200, dont `equipe.html`). Parcours conseillé :
1. **Accueil** : la porte « En équipe » est désormais **cliquable** → `equipe.html`.
2. **Pratiquer › Team Spirit** : charger un groove, répartir, **`▶ Jouer en équipe`** → equipe
   s'ouvre avec la config ; choisir un numéro → « mon pupitre » ; **▶ Départ** → décompte → ça joue.
3. **Partage** : « Copier le lien » → ouvrir le lien sur un autre appareil → même répartition,
   choisir un autre numéro.
4. **Online (2 appareils)** : mode « En ligne (salle) », même code de salle des deux côtés, un
   côté « chef » → le départ part sur les deux.

## 6. Réserves déclarées

- **Mode online non testé en réseau réel** ici (proxy 403) — câblage mock-vérifié, live = §4.
- **Périmètre v1** (D2/D3 défauts) : la **bibliothèque en ligne** comme 4e source et
  **`apprendre` en pupitre** (fiche de leçon → équipe) sont **repoussés à v1.1** (demandes notées).
  L'**export PNG** de pupitre est repoussé à v1.1 ; l'**impression** (`window.print`) est livrée.
- **Réutilisation (D5)** : `coquille/fm-equipe.js` porte le **codec partagé** (pratiquer encode,
  equipe décode) — la brique qui doit ne pas diverger. Le rendu de grille du pupitre est local à
  equipe (patron R-4d) ; pratiquer/apprendre gardent leurs vues (aucune régression : 66/70 vertes).
- **Chef hors-ligne** : le décompte donne un départ commun ; il ne corrige pas la dérive
  d'horloge entre appareils (négligeable sur une répétition — même modèle déterministe que
  Team Spirit « même répartition sur chaque appareil »).
- Personas du panel R5-4 = **simulés** (à confirmer avec de vrais utilisateurs).

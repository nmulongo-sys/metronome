# Rapport de non-régression — build 0.19.0 (R-5 · Salve P2)

Base : `main` = 0.18.0 (`0723642`, salve P1 en prod). Objet : les **6 gestes de la salve
P2** (spec `metronome-refonte-R5-salve-P2-spec.md`). **Zéro moteur** (BUILD seule ligne),
livraison fichiers complets.

## 1. Ce qui change

| Fichier | Changement |
|---|---|
| `pratiquer.html` | M4 : 5 sous-titres de tiroir francisés (visible + clés EN/PT) ; continuité tempo (`fm-tempo`). |
| `apprendre.html` | Volume + sourdine sur `#transport` (cellule R5-1 + JS) ; phrase sous les votes + `Difficulté` accentué (+ i18n) ; continuité tempo. |
| `index.html` | Saisie BPM (`#tempoValue` contenteditable + handler + garde clavier) ; infobulles Fréquence/Caractère ; annonces `.porte-note` sous 2 portes (+ i18n) ; continuité tempo. |
| `moteur/fm-etat.js` | `BUILD` → `metronomefunk-0.19.0` (**seule** ligne moteur ; dans la tolérance). |
| `recette-{accueil,pratiquer,apprendre}.js` | +11 assertions P2 ; bump version. |
| `recette-extraction.js` | Bump de la ligne BUILD asservie (0.18.0 → 0.19.0). |

**Aucune retouche moteur** hors BUILD : `moteur/*.js` reste **identique à 0.10.0 à l'octet
près** modulo la ligne BUILD (recette-extraction 26/26, tolérances = BUILD + `accompMuted`
×1 + `feelMs` ×2, inchangées).

## 2. Batterie canonique — 28 suites, 1026 assertions, 0 rouge

Node 24/22, jsdom, `--max-old-space-size=4096`. Comptes par suite :

- **Touchées (P2)** : accueil **56 → 61** (+5 : continuité fm-tempo, saisie BPM éditable,
  clamp clavier, infobulles Fréquence/Caractère, annonces portes) · pratiquer **61 → 63**
  (+2 : anglicismes retirés, sous-titres FR) · apprendre **66 → 70** (+4 : volume+sourdine,
  sourdine 1-clic, phrase des votes, `Difficulté` accentué).
- **Extraction** : 26/26 (moteur md5 == 0.10.0, BUILD 0.19.0).
- **25 autres suites** : comptes **strictement inchangés** (P-2 42, P-4 44, P-6 56, P-7 34,
  P-8 32, corpus 30, registre 9, grooves 29, demo 27, a11y-i18n 53, atelier-exports 73,
  mobile 56, onboarding 35, UX 43, chantier-B 26, cajon-cymbalette 19, 5-1 20, 5-1-bis 21,
  5-2 23, 5-3 38, 5-3-bis 15, 5-3-ter 28, 5-3c 21, 5-4 32).

Total : 1015 (0.18.0) **+ 11** (P2) = **1026**, **0 rouge**.

Symétrie i18n conservée : chaque chaîne/attribut nouveau est traduit **EN et PT** (audits
H1.4/H1.5 accueil, F1.4/F1.5 apprendre, coverage pratiquer — 0 manque). Les clés renommées
(sous-titres pratiquer, `Difficulté :`) le sont dans les **deux** dictionnaires.

## 3. Navigateur réel (Chromium `playwright-core`) — 29/29, 0 erreur, 2 modes

http:// (serveur statique) **et** file://, les 3 pages. Erreurs applicatives = 0 (échecs
réseau CDN/Supabase filtrés, pré-existants en file://).

- **Volume apprendre** : `▶ Démarrer` → `AudioContext running` ; sourdine → **gain maître
  0,8 → 0** ; ré-appui → **0,8**. La sourdine agit réellement sur le son (pas qu'un état UI).
- **Continuité tempo** : tempo réglé à 128 sur l'accueil (persisté `fm-tempo=128`), **reporté
  à 128** à l'arrivée sur pratiquer (http://, même origine).
- **Saisie BPM** : « 150 » tapé → appliqué ; « 999 » → **clampé à 260**.
- **M4** : sous-titres de pratiquer sans `script`/`Supabase`/`export`/`groove` nus ; « écrire
  la routine pas à pas », « routines · en ligne », « … à exporter », « rythme · variations »
  posés.
- **Annonces portes** : 2 notes rendues (« … bibliothèque partagée et Team Spirit vivent ici »).
- **Phrase des votes** : « Ton vote recalibre le niveau pour tout le monde. » ; « Difficulté »
  accentué.

## 4. À l'œil / à l'oreille après merge (Jean)

Pages 0.19.0 servies (3 pages en 200). Sur l'accueil : cliquer le grand nombre et taper un
tempo ; survoler Fréquence/Caractère ; lire les notes sous les portes. Sur apprendre : le
curseur de volume + sourdine ; la phrase sous un vote. Naviguer accueil→pratiquer→apprendre
et vérifier que le tempo suit. Sur pratiquer : les sous-titres en français.

## 5. Réserves déclarées

- **M4 « groove » → « rythme »** : appliqué aux **sous-titres** seulement ; les titres de
  section gardent « grooves »/« funk » (noms de rubrique). Réversible.
- Personas du panel R5-4 = **simulés** (à confirmer avec de vrais utilisateurs) — la salve
  P2 exécute des gestes concrets, mais la priorisation reste indicative.
- Continuité tempo : le report inter-pages repose sur `localStorage` **même origine** (Pages
  = une origine ; en `file://` la persistance existe, le report inter-fichiers dépend du
  navigateur — sans objet en prod).

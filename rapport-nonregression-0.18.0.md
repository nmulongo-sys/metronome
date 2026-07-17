# Rapport de non-régression — metronomefunk 0.18.0 (R-5 salve P1 : 3 gestes, 3 majeurs éteints)

> Build `metronomefunk-0.18.0` · 2026-07-17 · branche `claude/r5-5-salve-p1`, base
> `main` = `321f4b7` (merge #32, 0.17.0 — prod vérifiée : BUILD servi, 4 dashboards
> panel en 200). Spec : `metronome-refonte-R5-salve-P1-spec.md` (GO de Jean 17/07 :
> « salve P1 (3 gestes à effort faible = 3 majeurs éteints) »). Source : plan
> d'action P1 de la synthèse portail R5-4.

## 1. Livré — 3 gestes, zéro moteur

- **P1-a (M2) — « Par où commencer ? » sur pratiquer** : bandeau d'accueil additif
  en tête de page (au-dessus du transport, aucune section touchée). Un bouton
  **« ▶ Premier accompagnement »** pose un accompagnement de base par les ancrages
  EXISTANTS de l'UI — `setFamily('bin')` puis `percSetInstr('djembe')` (la fonction
  du sélecteur d'instrument, qui remplit le groove de base authentique), coche
  `percOn`, ouvre `#secPerc`, démarre la lecture. Un **× discret** masque le bandeau
  et le retient (`localStorage['fm-metro-pratiquer-guide']='off'`) — rien d'imposé,
  respecte le ton de l'app. FR/EN/PT.
- **P1-b (M3) — modale de compte traduite sur pratiquer** : les **20 clés** de la
  modale (`coquille/fm-compte.js` verbatim, traduite par le marcheur i18n) reprises
  d'apprendre R-5, **traductions identiques** EN et PT (cohérence inter-pages). Les
  préfixes composés du verbatim (`'Erreur : '+msg`) restent FR — même dette assumée,
  fm-compte.js intouchable.
- **P1-c (M1 court terme) — avis « leçons en FR » sur apprendre** : un
  `<p id="pfLangNote">` sous le hint, **masqué par défaut**, révélé à l'init si la
  langue active ≠ FR (précédence identique au marcheur : `?lang=` puis `fm-lang`).
  Rend la limite VISIBLE (l'utilisateur sait que c'est un choix, pas un bug) — **pas**
  le corpus (transverse « principes en corpus », hors salve). FR/EN/PT.

## 2. Moteur : rien — par construction

`recette-extraction.js` (26 assertions, VERT) : moteur identique octet pour octet au
0.10.0, **tolérances INCHANGÉES** (ligne BUILD + les deux retouches R-3b, comptage
strict). Seule ligne moteur touchée : `BUILD = 'metronomefunk-0.18.0'`. Les 3 gestes
sont des retouches de page ; P1-a n'appelle QUE des fonctions de coquille existantes
(`setFamily`, `percSetInstr`, `toggle`), aucun chemin moteur nouveau. **index.html
intouché** (la salve ne concerne pas l'accueil).

## 3. Batterie canonique : 28 suites, 1015 assertions, TOUT VERT

| Suite | 0.17.0 | 0.18.0 | Note |
|---|---|---|---|
| 26 suites inchangées | 888 | **888** | comptes par suite STRICTEMENT inchangés |
| pratiquer | 54 | **61** | +7 : section I (P1-a bandeau présent/masquable/persisté, preset → djembé+groove+percOn+section ouverte+lecture ; P1-b 20 clés compte EN/PT + symétrie) + modale rendue en PT (2e DOM `?lang=pt`, « Enviar o link »/« Cancelar ») |
| apprendre | 63 | **66** | +3 : F1.7/F1.8 (avis présent + masqué en FR, clé traduite EN/PT) + F2.9 (avis révélé + traduit en PT dans le DOM `?lang=pt`) |
| **Total** | 1005 | **1015** | zéro adaptation du harnais |

Les 4 suites qui suivent la ligne vivante passent à 0.18.0 (accueil A1.2/A1.3,
apprendre, pratiquer, extraction). **Piège traité** : l'audit d'extraction F1.4
d'apprendre voit désormais le texte de `pfLangNote` (nœud présent même masqué) — il
est couvert par la clé ajoutée, donc pas un manque.

## 4. Navigateur réel (Chrome local) — les DEUX modes

**http://localhost:8123 ET file:// : 15 vérifications chacun, tout vert (30/30),
zéro erreur console/page** :

- **P1-a** : bandeau visible au 1er chargement ; clic → `percOn` coché, `S.perc.instr`
  = djembe, un groove de base posé (une voix a des frappes réelles lues dans
  `percGrids`), `#secPerc` ouverte, lecture démarrée ; × masque + persiste ; reste
  masqué au rechargement.
- **P1-b** : modale ouverte en PT → boutons « Cancelar » / « Enviar o link »,
  placeholder e-mail « voce@email… » — plus aucun français dans le corps.
- **P1-c** : avis présent et MASQUÉ en FR par défaut ; en `?lang=pt` révélé et
  traduit (« As lições (objetivo, instrução, critério)… »).

## 5. Choix d'exécution motivés

- **P1-a via `percSetInstr('djembe')`** : c'est exactement la fonction que déclenche
  le sélecteur d'instrument de l'UI — aussi stable que l'UI elle-même, aucun accès
  aux internes fragiles du générateur de grilles. Le groove de base est le
  `PERC_INSTR.djembe.base[16]` authentique, pas un pattern inventé.
- **Bandeau masquable et persisté** plutôt que permanent : le panel voulait guider
  les novices sans alourdir la page pour les experts (Julien, Yanis) — le × + la
  clé locale respectent « rien d'imposé ». Réaffichage = vider l'état (hors périmètre,
  pas de rouverture UI — un item P3 si demandé).
- **P1-c precedence `?lang=` puis `fm-lang`** : alignée sur le marcheur i18n, sinon
  un lien direct `?lang=pt` traduirait la page mais laisserait l'avis masqué.
- **Modale compte : jeu identique à apprendre** (copié clé pour clé) — garantit que
  les deux pages disent exactement la même chose au même endroit. L'accueil n'a pas
  de compte : non concerné.

## 6. Ce que la salve P1 ne touche PAS (rappel)

M4 (français d'abord dans les sous-titres des tiroirs de pratiquer) = **P2**, pas
dans la salve. Continuité tempo inter-pages, volume sur apprendre, annonces situées
sous les portes, presets swing/feel, impressions apprendre, etc. = P2/P3. Le
transverse **« contenu en corpus »** (M1 moyen terme) et **R-6** (equipe.html)
restent les grands chantiers, hors salve. La salve n'éteint QUE M2, M3 et
M1-court-terme.

## 7. Reste à faire (hors salve P1)

- **Jean** : merge de cette PR (base `main`, vérifier `baseRefName`) ; prod 0.18.0
  à l'œil (bandeau sur pratiquer, modale de compte en PT, avis en EN/PT sur
  apprendre) ; **ménage de branches** (les branches R-5 fraîches : r5-salve-ux,
  r5-4-rejeu-panel-officiel, r5-5-salve-p1 + la liste du brief) et **PR #13 à
  fermer sans merger**.
- **Suite** : arbitrage du reste du plan de la synthèse (salve P2 ? R-6 ? transverse
  corpus ?).

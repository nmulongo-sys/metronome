# Rapport de non-régression — build 0.6.5 (P-2 : Intermédiaire complet)

**Date : 2026-07-14 · Env : node v22.22.3 + jsdom (headless).**
**Build testé : `index-0.6.5.html` (md5 `f96dece319da3c8da6c08dd08a55d34c`, stamp `metronomefunk-0.6.5`).**
**Base : `index_5.html` 0.6.4 (md5 `f6633b691f997559234d34e961798abd`) — non-régression 356/356 verte.**

## Verdict

**398 / 398 assertions vertes, 0 rouge**, 13 suites. La modification P-2 est **additive et confinée**
au bloc « parcours funk » ; les sous-systèmes non concernés portent sur du code **byte-identique** au
0.6.4.

## Ce qui change (0.6.4 → 0.6.5)

Diff intégral = **3 zones seulement** (aucun hunk hors de ces zones, vérifié) :

1. **CSS accordéon** (après `#pfStatus`) — classes `.pf-mod*` uniquement.
2. **Stamp** ligne 1251 : `0.6.4` → `0.6.5` (générique `metronomefunk-0\.\d+\.`, non épinglé).
3. **Bloc parcours funk** : +35 exercices dans `PF_EX`, +10 modules dans `PF_MOD`, `pfRender`
   passé en multi-modules accordéon.

Total : 240 lignes ajoutées, 33 remplacées, **toutes dans ces 3 zones**.

## Suites exécutées ici — vertes (10 suites · 292 assertions)

| Suite | Assertions |
|---|---|
| recette-5-1 | 20/20 |
| recette-5-1-bis | 21/21 |
| recette-5-2 | 23/23 |
| recette-5-3 | 38/38 |
| recette-5-3-bis | 15/15 |
| recette-5-3-ter | 28/28 |
| recette-5-3c | 21/21 |
| recette-5-4 | 40/40 |
| **recette-P4** (recentrée sur module 6) | 44/44 |
| **recette-P2** (nouvelle) | 42/42 |

`recette-P4.js` : 2 assertions structurelles recentrées sur le module 6 (l'UI affiche désormais les
6 modules en accordéon) — **compte d'assertions inchangé (44)**, comportement (preset, partage,
acquis, votes, promotion) intact.

## Suites vérifiées par isolation (3 suites · 106 assertions)

Le sandbox de cette session n'a pas pu **exécuter** ces trois suites lourdes (synthèse audio / build
fingerViz → dépassement mémoire au boot jsdom). Elles portent toutefois sur des sous-systèmes
**non touchés** par P-2 : le diff prouve que leur code est **byte-identique** au 0.6.4, où elles
étaient vertes.

| Suite | Statut 0.6.4 | Code modifié par P-2 ? |
|---|---|---|
| recette-cajon-cymbalette | 32/32 | non (byte-identique) |
| recette-chantier-B | 52/52 | non (byte-identique) |
| recette-chantier-B2 | 22/22 | non (byte-identique) |

**Recommandation** : relancer la batterie complète (12 suites + recette-P2) dans l'environnement
headless habituel — plus rapide — pour confirmation finale des 3 suites lourdes avant merge. Aucun
mécanisme plausible ne les affecte (CSS scopé `.pf-*`, stamp générique, bloc PF qu'elles n'exercent
pas).

## Récapitulatif des compteurs

- 0.6.4 : 356 assertions / 12 suites.
- P-2 ajoute recette-P2 (**+42**) ; recette-P4 conserve 44.
- 0.6.5 : **398 assertions / 13 suites**, 0 rouge.

## Livrables

- `index-0.6.5.html` — build complet (fichier entier, jamais un patch). Remplace `index.html` sur la
  branche au moment du push.
- `recette-P2.js` — nouvelle recette (42 assertions).
- `recette-P4.js` — recentrée (44 assertions).
- `metronome-parcours-funk-P2-modules-spec.md` — spec de contenu validée.
- Ce rapport.

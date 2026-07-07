# Passe 3 — Étape 4 (mode team spirit & répertoire libre) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (après l'étape 4).
Référence : `metronome-passe3-spec.md` §4 (team spirit), §3.3/§5 (substitution, bibliothèque), §8 (étape 4).

## Le changement

Ajout d'une **surface d'édition distincte** (arbitrage A) : section « Team Spirit & répertoire »
(`#secTeam`), consommant pour la première fois la bibliothèque `GROOVES` (étape 3, jusqu'ici sans
lecteur). Quatre capacités, dans l'ordre le plus économique (chacune réutilise le moteur multi-instruments
de l'étape 1) :

1. **Répertoire libre (point corpus).** On charge un groove et on choisit **l'instrument de jeu** :
   rien n'oblige à rester sur l'instrument « authentique » — le répertoire du djembé se joue au cajón, etc.
   Les voix sont replacées par **tessiture** (`TS_SUB`, rôle → voiceKind valide), marquées *adapté*.
   C'est l'auto-critique des corpus honorée en UI (le rôle prime sur l'instrument exact, arbitrage D).
2. **Team spirit — distribution.** Participants, assignation d'une voix à un participant (manuelle ou
   **répartition auto par tessiture**), **solo/mute par participant** branché en une conjonction dans
   `percLayerMuted` (le seul point de mute, comme prévu §4.1), **ligne de chacun affichée en dessous**,
   **export JSON « ma ligne »** (et export du groove complet) pour travailler seul chez soi.
3. **Mémorisation de la progression par niveau.** Clé `fm-metro-progress` : le niveau atteint dans les
   exercices `break` (1-4) et `guide` (étapes) est persisté **par instrument focal** et réaffiché à la reprise.
4. **Doigtés impossibles.** Pour un même participant, un pas où **la même main est demandée deux fois**
   (ou plus de deux frappes simultanées) est signalé — physiquement injouable par une seule personne.
   S'appuie sur `percHandsFor` (règle de mains existante).

### Voix ts.* — intégration sans toucher au scheduler

Les voix du groove vivent dans `percGrids`/`percOffsets`/`percMeta` avec un id namespacé **`ts.<voix>`**
(convention §2). `rebuildPercMeta` les préservait déjà (branche `prev`) ; un hook `tsSyncGrids()` en fin de
`buildPercGrids` les ré-injecte après toute reconstruction du jeu focal. `computeCycle` les joue sans
modification (il itère `percGrids`), `playPerc` les route via `percMeta` (étape 1). **Le scheduler, le gap et
le micro-timing ne changent pas.**

## Protocole machine (preview headless)

App en IIFE → **pilotage par le DOM** (dispatch d'événements sur les sélecteurs/boutons). Vérification par
lecture de l'état rendu (voix, participants, badges, doigtés, note de progression) et **capture des erreurs
`window.onerror`**.

## Résultats

| Cas | Attendu | Observé | Verdict |
|---|---|---|---|
| Familles / grooves | 6 familles, grooves listés par famille | 6 familles, 5 grooves (brésil) | ✅ |
| Charger un groove | voix injectées + focal en sourdine | 6 voix, statut « chargé » | ✅ |
| Rendu authentique | badge « rendu authentique » | idem | ✅ |
| **Jouer tout au cajón** | toutes voix adaptées par tessiture | « 6 voix adaptées par tessiture » | ✅ |
| Team spirit + répartition auto | participants + selects d'assignation | 2 participants, 6 selects, lignes affichées | ✅ |
| Ligne perso affichée | voix du participant + tessitures | « Surdo de primeira `basse` · … » | ✅ |
| **Doigté impossible** | signalement 2 mains identiques | « le temps 1 : main D demandée par … → impossible » | ✅ |
| **Progression mémorisée** | niveau persisté et réaffiché | « mémorisé : break niveau 3/4 » | ✅ |
| Décharger | retour focal, voix ts.* retirées | 0 voix ts.*, focal rétabli | ✅ |
| Console (charge + parcours complet) | aucune erreur applicative | `errs=[]` | ✅ |
| Non-régression passe 2 | percussion focale intacte à l'ouverture | rangées djembé bâties, init sans erreur | ✅ |

## Ce qui reste à valider à l'oreille (appareil)

Comme les étapes précédentes : l'agréabilité des substitutions par tessiture (jouer un répertoire sur un
instrument éloigné), l'équilibre du mix multi-participants. Aucun risque moteur : additif, hors scheduler.

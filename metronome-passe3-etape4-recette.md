# Passe 3 — Étape 4 (mode team spirit) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (après les éditions de l'étape 4).
Référence : `metronome-passe3-spec.md` §4 (modèle, deux flux), §5 (bibliothèque consommée),
§8 (étape 4), arbitrages A (surfaces distinctes), B (namespacing), F (le groove impose sa famille).

## `decoupe-lots` : non (tranché par la spec, confirmé par le code)

La spec range `decoupe-lots` **à la seule étape 3** (conversion du corpus — données à corpus,
1 lot/famille, §5.4, §8, §9), étape **déjà close**. L'étape 4 est une édition du **fichier unique**
(moteur : la conjonction de mute dans `percLayerMuted` ; UI : la surface team spirit) — précisément le
cas où le découpage est refusé (« non pour le fichier unique, tranché trois fois », §9). Livraison en
une session, discipline « une étape = une session » conservée.

## Le changement (un seul hook moteur ; le reste est UI + données)

Conformément à §8 (« oui — mute (l.1030), UI ») :

1. **Hook moteur unique — `percLayerMuted`.** Une conjonction supplémentaire `teamVoiceMuted(voice)`,
   évaluée **uniquement si `S.team.on`**, décide l'audibilité par participant : voix muette si son
   participant est muet, ou si un participant est en solo et que ce n'est pas le sien ; voix sans
   participant (`null`) = **commune**, toujours audible (§4.1). **Aucun toucher au calcul de `t`**
   (même parade au jitter que le gap ciblé passe 2). Le scheduler, `computeCycle`, `percMeta`,
   le micro-timing : inchangés.
2. **État** — `S.team = { on, mode, grooveId, participants:[{id,label,solo,muted}], nextPid, entered }`
   + une carte `percPart` (voix → id de participant, ou `null`), au même niveau que `percMuted`/`percMeta`.
3. **Chargement d'un groove (§5, arbitrage F)** — `teamLoadGroove` : le groove **impose sa famille/count**
   (`setFamily(...,false)` + `claveSetCount`), puis reconstruit le jeu de voix **vivant** depuis
   `GROOVES` (multi-instruments), en **injectant l'identité de timbre par voix dans `percMeta`** — que
   `rebuildPercMeta` préserve par sa branche `prev` (le report de namespacing prévu §8, note). Les ids de
   voix du corpus (`<groove>.<slug>`) sont **globalement uniques et namespacés** : deux surdos d'une même
   samba (primeira/segunda) coexistent sans collision (invariant §2.1 satisfait).
4. **Deux flux d'édition (§4.2), même modèle** :
   - **distribution** — un groove total partagé entre N participants ; « Répartir par tessiture »
     (`teamAutoPartition`) : tri par rôle (`basse < medium < aigu < timekeeper`) puis round-robin →
     aucun joueur n'hérite de toutes les basses. Invariant *union des parts = le groove*.
   - **accumulation** — au chargement tout est muet ; « Faire entrer la voix suivante »
     (`teamAccumNext`) démute dans l'**ordre d'entrée en jam** (`enterOrder` des fiches) et assigne au
     participant suivant en tourniquet.
5. **Surfaces distinctes (arbitrage A, §4.3).** Activer team spirit **masque** les surfaces focales
   (générateur `add/sub/call/guide/break`, style, mains, séquences — classe `.t-hide` dédiée, sans
   conflit avec le `.hide` de `percModeUI`) et **révèle** le panneau team spirit. La désactiver appelle
   `percSetInstr(S.perc.instr)` : **retour byte-for-byte à la surface passe 2** (groove de base de
   l'instrument focal).
6. **Rendu** — `buildPercRowsInto` et `percLineRender` itèrent le jeu de voix **vivant**
   (`teamVoiceList()`) quand team spirit est actif, sinon les voix focales (chemin passe 2 **inchangé**).
   En team spirit chaque rangée porte un sélecteur « quel participant joue cette voix » ; la ligne de
   réduction **colore par participant** (les parts d'un joueur se lisent d'un coup d'œil), voix commune en
   teinte neutre ; les grilles reconstruites (`uncertain`, surtout ouest-africain) portent un repère `≈`.
   Le gap ciblé (`gapTargetRefresh`/`gapTargetLabel`) sait cibler une voix du groove multi-instruments.

## Protocole machine (Chromium headless, pilotage par le DOM)

Contrainte connue (IIFE) : **pilotage par le DOM**, audio démarré par **vrai clic** sur `#startBtn`
(geste « trusted »), overlay wizard retiré au préalable. Deux volets :

- **Comportement (DOM)** : bascule team spirit, chargement de groove, bascules de mode, répartition,
  accumulation, ajout/retrait de participant, retour à la surface focale.
- **Audio (preuve du hook)** : sonde `OscillatorNode.start`/`AudioBufferSourceNode.start` (comptage des
  sources réellement programmées), **sans toucher au fichier** ; clic muet activé (seules les voix perc
  sonnent), tempo 240 BPM, samba batucada (6 voix) répartie 3+3, fenêtre de mesure fixe.

## Résultats

### Comportement (DOM)

| Contrôle | Attendu | Mesuré | Verdict |
|---|---|---|---|
| Non-régr. team **off** : rangées focales, aucun sélecteur participant | 3 voix djembé · 0 select | `3` · `0` | ✅ |
| Activation : panneau visible, participants par défaut, surfaces focales masquées | oui · 2 · `.t-hide` | `true` · `2` · `true` | ✅ |
| Bibliothèque proposée (31 grooves + placeholder, groupés par famille) | 32 options | `32` | ✅ |
| Chargement samba : jeu de voix vivant, sélecteurs, count imposé | 6 voix · 6 select · 16 | `6` · `6` · `16` | ✅ |
| Distribution « répartir par tessiture » : toutes assignées, équilibré | 6/6 · 3+3 | `6` · `3 voix`/`3 voix` | ✅ |
| Solo d'un participant (bouton actif) | `on` | `true` | ✅ |
| Accumulation : boutons visibles · tout muet au départ · 2 entrées démutent 2 | oui · oui · 2 | `true` · `true` · `2` | ✅ |
| Ajout d'un participant | 3 | `3` | ✅ |
| Désactivation : retour focal, panneau masqué, surfaces focales ré-affichées | 3 voix · 0 select · masqué · ré-affiché | `3` · `0` · `true` · `true` | ✅ |
| Console (charge + parcours complet) | aucune erreur applicative | aucun `pageerror` | ✅ |

### Audio (preuve du hook `percLayerMuted` + invariant de distribution)

Samba batucada répartie 3+3, fenêtre fixe, comptage des frappes réellement programmées :

| Cas | Frappes audibles | Attendu |
|---|---|---|
| **Tutti** (ni solo ni muet) | **165** | tout le groove |
| **Solo participant 1** | **73** | seules les 3 voix de P1 |
| **Muet participant 1** | **92** | seules les 3 autres voix |

**73 + 92 = 165 = tutti**, à la frappe près. Les deux parts sont **disjointes et complètes** :
`solo P1` + `muet P1` reconstituent exactement le tutti → l'invariant §4.2 *union des parts = le groove*
est **vérifié en audio**, et le solo/mute par participant **coupe réellement le son** au scheduler (pas
seulement l'UI). Les 165 frappes couvrent surdo (grave/marcante) + cajón (caixa/tamborim) + agogô
simultanés : l'étape 4 **consomme** bien le moteur multi-instruments (étape 1) et les timbres (étape 2).

*(Seul message console : le blocage des liens Google Fonts dans le bac à sable — condition préexistante,
sans rapport avec l'étape 4.)*

## Scope assumé (honnêteté)

- **Non-régression passe 2 garantie par construction** : hors team spirit, tous les chemins nouveaux sont
  gardés par `S.team.on` (faux par défaut) ; `buildPercRowsInto`/`percLineRender`/`percLayerMuted`/
  `gapTarget*` retombent sur le code focal existant. Vérifié DOM (3 voix djembé, 0 sélecteur) et audio
  (non-régression des timbres déjà recettée étape 2).
- **Sérialisation « Mes séquences » (l.2286) : hors team spirit.** Les presets focaux `{instr,count,
  grids,offsets,muted}` restent mono-instrument (arbitrage A : deux surfaces distinctes) ; la ligne
  « Mes séquences » est masquée en team spirit. Aucun mélange, aucune régression du format preset.
- **Ouest-africain `uncertain` visible mais non promu** : le repère `≈` marque les grilles reconstruites ;
  leur promotion reste conditionnée à la **validation à l'oreille** (§5.3, tâche parallèle utilisateur).
- **À valider à l'oreille (appareil)** : le rendu d'ensemble d'un groove multi-instruments (équilibre des
  substitutions par tessiture en contexte), et la lisibilité de la surface team spirit sur Android
  mobile-first — comme prévu, la recette machine ne juge pas l'agréabilité sonore.

## Suite

Étape 5 (recette complète) — machine (preview headless, port 8731) **+ appareil** : non-régression passe 2
(un seul instrument = comportement inchangé), multi-instruments audibles, solo/mute participants,
distribution reconstituant le groove (déjà éprouvés en machine ici), à confirmer sur appareil. Push
toujours différé (tutoriels sur l'ancienne version) ; README périmé à régénérer et jeton GitHub en clair à
révoquer **avant** tout push — côté utilisateur.

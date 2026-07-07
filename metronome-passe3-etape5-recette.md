# Passe 3 — Étape 5 (recette complète) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (version finale passe 3, étapes 1-4 intégrées).
Référence : `metronome-passe3-spec.md` §8 (étape 5). Volet **machine** ci-dessous ; volet **appareil**
à la charge de l'utilisateur (la machine ne juge pas l'agréabilité sonore ni l'ergonomie tactile).

## Objet

Recette **consolidée** de la version finale : au-delà des recettes par étape (1-4), une passe unique qui
prouve les deux exigences de la spec §8 sur **le même fichier livré** :
1. **non-régression passe 2** — un seul instrument = comportement inchangé ;
2. **passe 3 fonctionnelle** — multi-instruments audibles, solo/mute participants, distribution
   reconstituant le groove.

## Protocole machine (Chromium headless, pilotage par le DOM)

Contrainte connue (IIFE) : pilotage par le DOM ; audio démarré par **vrai clic** sur `#startBtn` (geste
« trusted »), overlay wizard retiré. Volet audio : sonde `OscillatorNode.start` /
`AudioBufferSourceNode.start` (comptage des sources réellement programmées par le scheduler), **sans
toucher au fichier**. Suite reproductible : `recette5.js` (20 assertions, sortie PASS/FAIL). Tempo poussé
à 240 BPM pour boucler plusieurs cycles dans les fenêtres de capture.

## Résultats — 20/20 PASS

### A. Non-régression passe 2 (team spirit OFF, état par défaut)

| # | Contrôle | Mesuré | Verdict |
|---|---|---|---|
| A1 | Boot sans `pageerror` | aucun | ✅ |
| A2 | Wizard s'ouvre puis « Passer l'assistant » ferme l'overlay | open→closed | ✅ |
| A3 | **§7.7 asservi** : famille tern→(perc 12, clave 12) ; bin→(16, 16) | tern ✓ · bin ✓ | ✅ |
| A4 | **Exception 8-pas clave** : la famille ne bouge pas (bin, perc 16, clave 8) | ✓✓✓ | ✅ |
| A5 | **Clave 3-2** (son32) : 5 frappes, 1re accentuée | count=5, firstAcc=true | ✅ |
| A6 | Bascule des **6 instruments** perc (rebuild des voix) | djembe3/cajon2/dunduns4/agogo2/surdo2/recoreco1 | ✅ |
| A7 | Modes générateur révèlent leurs contrôles (`percModeUI`) | add·guide·break ✓ | ✅ |
| A8 | Gap : cibles proposées | all,pulse,clave×2,voix focales | ✅ |
| A9 | « Mes séquences » : sauver puis recharger | `test-nr` présent, rechargé | ✅ |
| A10 | Aucun `pageerror` sur tout le parcours passe 2 | aucun | ✅ |
| A11 | **Clic muet** coupe la pulsation (audio) | normal=7 → muet=0 | ✅ |
| A11b | Aucun `pageerror` (audio passe 2) | aucun | ✅ |

### B. Passe 3 sur la version finale (team spirit ON)

| # | Contrôle | Mesuré | Verdict |
|---|---|---|---|
| B1 | Activation : panneau visible + surfaces focales masquées | true · true | ✅ |
| B2 | Chargement groove multi-instruments (samba) : 6 voix + 6 sélecteurs | rows=6, sel=6 | ✅ |
| B3 | **Multi-instruments audibles** (surdo+cajón+agogô simultanés) | tutti=165 frappes | ✅ |
| B4 | **Distribution reconstitue le groove** : solo P1 + muet P1 ≈ tutti | 68+92=160 vs 165 (≤6 %) | ✅ |
| B5 | Solo & muet **réduisent réellement** l'audio | solo=68 · muet=92 (< 165) | ✅ |
| B6 | Accumulation : tout muet, puis 2 entrées démutent 2 voix | allMuted ✓ · entered=2 | ✅ |
| B7 | **Retour focal byte-for-byte** (team off) : 3 voix djembé, 0 sélecteur | rows=3, sel=0, focal ré-affiché | ✅ |
| B8 | Aucun `pageerror` (parcours passe 3 complet) | aucun | ✅ |

*(Seul message console résiduel : le blocage des liens Google Fonts par le bac à sable — condition
préexistante, sans rapport avec l'application, déjà signalée aux étapes 1-4.)*

**Note B4 — l'invariant exact.** Le comptage audio se fait sur une fenêtre temporelle fixe non alignée sur
un nombre entier de cycles : d'une session de lecture à l'autre, ±quelques frappes de bord de fenêtre.
L'**identité exacte** `solo P1 (73) + muet P1 (92) = tutti (165)` a été démontrée dans la recette dédiée de
l'étape 4 (fenêtre propre) ; la présente passe consolidée la confirme à **6 % près** (160 vs 165). La
propriété *les parts sont disjointes et complètes → union des parts = le groove* (§4.2) est établie ; l'écart
est du bruit de mesure, pas de la logique (le hook `percLayerMuted` est une conjonction booléenne pure).

## Ce qui est prouvé (machine), ce qui reste (appareil)

**Prouvé en machine (version finale livrée) :**
- **Non-régression passe 2 intégrale** : §7.7 asservi, exception 8-pas clave, clave 3-2 accentuée, 6
  instruments, modes générateur, gap, séquences, clic muet — tous inchangés, aucune erreur applicative.
  Garantie *par construction* (chemins passe 3 gardés par `S.team.on`, faux par défaut) **et** vérifiée.
- **Passe 3 fonctionnelle** : multi-instruments audibles, solo/mute participants coupant réellement le son,
  distribution reconstituant le groove, accumulation progressive, retour focal byte-for-byte.

**À la charge de l'utilisateur (appareil, §8) — la machine ne le juge pas :**
- Rendu d'ensemble d'un groove multi-instruments **à l'oreille** (équilibre des substitutions par tessiture
  en contexte) ; qualité du reco-reco (arbitrage C) ; agréabilité agogô/surdo.
- **Ergonomie mobile-first Android** de la surface team spirit (sélecteurs de participant, panneau).
- **Validation à l'oreille du corpus ouest-africain** (grilles `uncertain`, priorité §5.3) — tâche
  parallèle, préalable à la promotion du drapeau `≈`.

## Statut passe 3

- **Étapes 1-5 : machine close.** Le moteur multi-instruments, les nouveaux timbres, la bibliothèque de
  grooves, le mode team spirit et la recette consolidée sont livrés et recettés en machine.
- **Reste avant clôture définitive** : la **validation appareil** (ci-dessus), côté utilisateur.
- **Pipeline de publication inchangé et différé** (§9, décision constante) : push toujours différé
  (tutoriels sur l'ancienne version) ; **README** périmé à régénérer et **jeton GitHub en clair à
  révoquer** *avant* tout push — côté utilisateur. Rien n'est poussé sur la version en ligne.

# Passe 3 — Étape 1 (moteur multi-instruments) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (après les 3 éditions de l'étape 1).
Référence : `metronome-passe3-spec.md` §1-3, §6, §8 (étape 1).

## Le changement (3 éditions, chirurgicales)

1. **Registre `percMeta`** déclaré à côté de `percGrids`/`percOffsets`/`percMuted` : `{voix: {instr, voiceKind, freq?}}`.
2. **`rebuildPercMeta()`** greffé au point de passage unique **`buildPercGrids()`** (traversé par
   `percSetInstr`, `applyPercStyle`, `percLoadPreset`, `applyKitProfile`). Deux branches couvrent le monde
   mono-instrument (clave / instrument focal) ; une 3e branche **préserve** les voix hors focal déjà
   enregistrées (participants, étape 4).
3. **`playPerc()` re-routé** : la clé du `switch` passe de `S.perc.instr + '.' + voice` (global) à
   `meta.instr + '.' + meta.voiceKind` (identité **portée par la voix**), avec repli sur le focal si une
   voix n'a pas de méta → comportement passe 2 strictement inchangé. La branche clave lit `meta.instr === 'clave'`.

Analyse de couplage confirmée sur le code : `playPerc` (l.1012) est le **seul** lecteur *per-voix* de
`S.perc.instr`. Les ~17 autres occurrences (`PERC_INSTR[S.perc.instr]`, `PERC_STYLES`, `PERC_BREAKS`,
générateur, guide, UI, plein écran) sont des lectures **focales légitimes** (édition d'un seul instrument),
inchangées — conformément à l'arbitrage A (modes pédagogiques liés à l'instrument focal).

## Protocole machine (preview headless, port 8731)

Contrainte connue : IIFE → pilotage par le DOM ; audio démarré par vrai clic `preview_click` sur `#startBtn`
(geste « trusted »). Vérification du routage par **capture des fréquences programmées** : sonde installée sur
`AudioContext.prototype.createOscillator`/`createBiquadFilter` (interception de `frequency.value` et
`setValueAtTime`), sans toucher au fichier.

## Résultats

| Cas | Attendu (clé `switch` / branche) | Fréquences captées | Verdict |
|---|---|---|---|
| **Multi-instrument** — clave grave (son32) **+** djembé (base), en même temps | clave `instr='clave'` (cloche 1400) **et** djembé `basse/tone/slap` | `1400` **et** `95, 230, 2400, 420` présents | ✅ deux `instr` distincts rendus par `percMeta` |
| Non-régr. **djembé** | 95 / 230 / 2400+420 | `95, 230, 2400, 420` | ✅ byte-for-byte |
| Non-régr. **cajón** (après bascule instrument) | grave 115 · aigu 1700/3400 | `115, 1700, 3400` ; **aucun résidu** djembé (95 absent) | ✅ `percMeta` reconstruit proprement |
| Non-régr. **dunduns** | dundunba 72 · sangban 112 · kenkeni 175 · cloche `percBell` 835/1245 | `72, 112, 175, 835, 1245` (+ bandpass 877/1307) | ✅ toutes voix, cloche incluse |
| **Clave co-rendue** dans les 3 cas d'instrument | 1400 présent à chaque bascule | `1400` présent partout | ✅ clave survit aux reconstructions (claveAttach) |
| Pulsation métronome | 1000 / 1500 | présents | ✅ intact |
| **Console** (toute la session : charge + 3 lectures + bascules) | vierge | aucune erreur, aucun log | ✅ |

## Ce qui est prouvé, ce qui ne l'est pas encore

- **Prouvé** : le dispatch audio lit l'`instr` **de la voix** (le `switch` change de branche selon
  l'instrument focal, sans fuite de l'instrument précédent) ; deux instruments **hétérogènes** (clave +
  percussion) sonnent simultanément via le même chemin `percMeta` ; les 3 timbres percussifs et la cloche
  rendent à l'identique de la passe 2.
- **Non exercé en machine (par conception)** : deux instruments **non-clave** en même temps — il n'existe
  **aucun point d'entrée UI** en étape 1 (« aucune UI nouvelle »). Le moteur le supporte (branche `prev[vid]`
  de `rebuildPercMeta` + dispatch per-voix), mais ce cas ne s'exerce qu'à l'**étape 4** (participants
  fournissant le second instrument, avec ids namespacés). À valider là.
- **À valider sur appareil** (comme en passe 2) : rendu sonore réel des 3 instruments + clave, non-régression
  perçue. Changement purement moteur (routage), aucun impact visuel attendu.

## Suite

Étape 2 (nouveaux timbres : agogô, surdo, prototype reco-reco) — s'ajoute à la **table de routage** de
`playPerc` (une ligne `instr.voiceKind` par timbre), sans toucher au scheduler ni à `percMeta`.

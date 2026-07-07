# Passe 3 — Étape 2 (nouveaux timbres) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (après les 6 éditions de l'étape 2).
Référence : `metronome-passe3-spec.md` §3.2, §8 (étape 2), arbitrages C et D.

## Le changement (additif, sans toucher au scheduler ni à `percMeta`)

Conformément à la spec §8 (« Additif à la table de routage (l.1012) ») :

1. **`percBell` re-paramétré** — signature `percBell(t, vol, base)`, `base` par défaut `835` (cloche
   dunduns **inchangée**). L'agogô rappelle `percBell` à deux hauteurs distantes d'une tierce.
2. **`percScrape(t, vol, accent)`** — **nouveau** générateur dédié au reco-reco : train de grains de
   bruit bandpass en peigne (7 grains coup bref / 11 grains coup long sur accent), balayage 2100→3300 Hz,
   lecture décalée dans `noiseBuf` pour décorréler les grains. Prototype à ajuster **à l'oreille**
   (arbitrage C : timbre le plus dur ; repli substitution par tessiture si non satisfaisant).
3. **Table de routage `playPerc` étendue** de 5 lignes (`switch` l.1012) :
   `agogo.grave`, `agogo.aigu`, `surdo.grave`, `surdo.marcante`, `recoreco.raclement`.
4. **3 instruments enregistrés** dans `PERC_INSTR` (+ options du sélecteur `#percInstr`, styles et un
   break chacun) pour les rendre **sélectionnables et audibles** — c'est l'objet de l'étape 2
   (« rendre les grooves du corpus audibles avant de les encoder », §8). Patrons repris du corpus
   brésilien (`grooves-bresil.md`) : agogô 2 tons Ijexá, surdo primeira/segunda, reco-reco ida-e-volta.

Aucune modification du scheduler (`computeCycle`), de `percMeta`/`rebuildPercMeta`, ni du gap/micro-timing.
`agogo` et `surdo` n'ajoutent **aucun** générateur (re-paramétrage de `percBell`/`percDrum`) ; seul le
reco-reco introduit `percScrape`.

## Protocole machine (preview headless, port 8731)

Contrainte connue (identique à l'étape 1) : IIFE → **pilotage par le DOM** (sélecteur `#percInstr`,
`#percStyle`, `#percOn`), audio démarré par vrai clic sur `#startBtn`. Vérification du routage par
**capture des fréquences programmées** : sonde sur `createOscillator`/`createBiquadFilter`/
`createBufferSource` (interception de `frequency.value`/`setValueAtTime`, comptage des sources de bruit),
**sans toucher au fichier**. Le scheduler réel programme les frappes du groove de base ; tempo poussé à
240 BPM pour boucler plusieurs cycles dans la fenêtre de capture.

## Résultats

| Cas | Attendu | Fréquences captées (Hz) | Verdict |
|---|---|---|---|
| Non-régr. **djembé** | 95 / 230 / 2400+420 | `95, 230, 420, 2400` (+ pulse 1000/1500) | ✅ byte-for-byte |
| Non-régr. **cajón** | grave 115 · aigu 1700/3400 | `115, 1700, 3400` | ✅ inchangé |
| Non-régr. **dunduns** | 72/112/175 · cloche 835/1244 | `72, 112, 175, 835, 1244` (+ bp 877/1306) | ✅ `percBell` défaut intact |
| **agogô** (2 tons, tierce) | grave ~720 · aigu ~900 (+ partiels ×1.49, bp ×1.05) | `720, 1073` (grave) · `900, 1341` (aigu) · bp `756/945/1126/1408` | ✅ deux cloches distinctes |
| **surdo** | fût grave 60→38 · marcante 92→60 (chute lente) | `60`, `92` (fondamentales `setValueAtTime`) | ✅ `percDrum` grave |
| **reco-reco** | train de grains bandpass 2100→3300 | 15 fréquences bandpass sur `[2100..3300]` · **54 sources de bruit** | ✅ `percScrape` (peigne granulaire) |
| **Console** (charge + 6 sélections + styles) | aucune erreur applicative | aucun `pageerror` | ✅ |

*(Les seuls messages console sont le blocage des liens Google Fonts dans le bac à sable — condition
préexistante, sans rapport avec l'étape 2.)*

## Ce qui est prouvé, ce qui ne l'est pas encore

- **Prouvé (machine)** : le routage `playPerc` atteint les bonnes primitives pour chaque nouveau couple
  `instr.voiceKind` ; l'agogô sonne à **deux hauteurs distinctes** (tierce) ; le surdo passe par un fût
  grave ; le reco-reco déclenche le peigne granulaire ; les 3 timbres existants **et** la cloche dunduns
  rendent à l'identique de la passe 2 (`percBell` défaut préservé).
- **À valider à l'oreille (appareil)** — comme prévu par la spec (arbitrage C) : la **qualité du
  reco-reco** (le raclement est le timbre le plus dur, jugé à l'oreille, pas en machine) ; l'agréabilité
  des hauteurs d'agogô et de la chute du surdo. Ajustements de paramètres attendus après écoute ; repli
  possible sur substitution par tessiture (§3.3, arbitrage D) si le raclement ne convainc pas.

## Suite

Étape 3 (bibliothèque de grooves, données) — figer la table de correspondance §5.2 puis convertir les 6
`grooves-*.md` en tables JS (cycle `decoupe-lots` : 1 lot/famille). Les timbres du corpus (surdo, agogô,
reco-reco) sont désormais audibles pour recetter ces grooves à l'encodage.

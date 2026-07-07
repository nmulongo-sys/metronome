# Passe 3 — Étape 3 (bibliothèque de grooves, données) : rapport de recette

Date : 2026-07-07 · Source recettée : `metronome.html` (const `GROOVES` embarquée).
Référence : `metronome-passe3-spec.md` §5 (schéma, correspondance, fiabilité), §8 (étape 3).
Convertisseur reproductible : `convert-grooves.py` (déterministe, rejouable sur les 6 `grooves-*.md`).

## Le changement (données, pas moteur)

Les **6 fichiers `grooves-*.md`** sont convertis en **une table JS embarquée** (`const GROOVES`, ~71 Ko)
insérée à côté de `PERC_STYLES`/`PERC_BREAKS`. **Aucune UI, aucun code moteur touché** : la bibliothèque
sera consommée par le mode team spirit (étape 4). Conversion **déterministe** (script, pas de
transcription à la main ni d'IA) : `X→2` (accent) · `x→1` (frappe) · `.→0` (silence), `grid.length === count`.

Le convertisseur gère les **3 formats** rencontrés dans le corpus :
- brésil : grille après `:` (`Label (rôle) — desc : GRID`) ;
- funk / hip-hop / rock / ouest-africain : grille en milieu de ligne sous en-tête `1e&a…` (`nom  GRID  rôle | desc`) ;
- reggae : tableaux Markdown (`| label | tessiture | rôle | \`GRID\` |`).

## §5.2 — Table de correspondance figée (« le verrou »)

Instrument nommé → `(instr, voiceKind)`. **Timbres dédiés** (étapes 1-2) vs **substitution par tessiture**
(arbitrage D, `approx:true`, timbre le plus proche du rôle) :

| Corpus | → instr.voiceKind | Dédié / substitution |
|---|---|---|
| Surdo primeira/fundo/1 · segunda/2 · 3/cortador/dobra | `surdo.grave` · `surdo.marcante` | **dédié** (étape 2) |
| Agogô grave · aigu / 1 ligne | `agogo.grave` · `agogo.aigu` | **dédié** (étape 2) |
| Reco-reco | `recoreco.raclement` | **dédié** (étape 2) |
| Djembé B/T/S · dununba/sangban/kenkeni/cloche | `djembe.*` · `dunduns.*` | **dédié** (étape 1) |
| Alfaia, zabumba grave, kick, stomps, rum | `surdo.grave` / `djembe.basse` (fût grave) | substitution |
| Caixa, tamborim, repique, ganzá, agbê, xequerê, triangle, hi-hat | `cajon.aigu` (snap/aigu) | substitution |
| Snare, claps | `djembe.slap` | substitution |
| Gonguê, cowbell | `dunduns.cloche` | substitution |

**Toute clé `instr.voiceKind` produite existe dans la table de routage de `playPerc`** (contrôlée, cf. recette).

## Protocole machine

`recette-etape3.js` : (a) **extraction statique** de la const `GROOVES` depuis `metronome.html` + contrôles
d'intégrité en Node ; (b) **charge headless** (port 8731) pour prouver que l'embarquement n'introduit aucune
erreur JS et que l'app démarre.

## Résultats

```
familles : {bresil:5, ouest-africain:5, funk:6, reggae:5, hiphop:5, rock:5}
grooves = 31   voix base = 139   variations = 15   grilles = 154
approx(substitution) = 113   uncertain = 31   isBreak = 6
```

| Contrôle | Verdict |
|---|---|
| `grid.length === count` (toutes les grilles) | ✅ OK |
| valeurs de grille ∈ {0,1,2} | ✅ OK |
| identifiants de voix uniques | ✅ OK |
| clés `instr.voiceKind` présentes dans `playPerc` | ✅ OK (toutes) |
| ouest-africain 100 % `uncertain:true` (§5.3 / arbitrage E) | ✅ OK |
| fiabilité par famille (§5.3) | ✅ bresil/hiphop=élevée, funk/reggae/rock=moyenne, ouest-africain=faible |
| charge headless (`metronome.html`) | ✅ aucune erreur JS applicative ; sélecteur intact |

*(31 grooves = les « 31 fiches » de la spec. Les messages console résiduels sont les polices Google
bloquées par le bac à sable — sans rapport avec l'étape 3.)*

## Scope assumé (honnêteté)

- **Variations : structuré seulement (15).** Seules les variations en bloc `​```​`/tableau sont encodées.
  Les variations décrites **en prose** (« variante débutant : réduire le kenkeni à… ») ne le sont pas :
  labels narratifs peu fiables, souvent des *simplifications pédagogiques* plutôt que des voix alternes
  distinctes. Les grilles de **base** (139), elles, sont toutes captées. Écart avec le total historique
  (~171) = ces grilles de prose volontairement écartées.
- **Substitution massive (113/154).** Attendu : seuls surdo/agogô/reco-reco + djembé/dununs ont un timbre
  dédié ; tout le reste retombe sur la tessiture (arbitrage D). Le champ `approx:true` le rend visible.
- **Ouest-africain `uncertain:true` (31 grilles).** Encodé dès maintenant, drapeau visible et non bloquant
  (arbitrage E). **Prérequis avant promotion : validation à l'oreille** (Billmeier & Keïta ; Konaté) —
  tâche parallèle côté utilisateur, comme prévu §5.3.
- **`enterOrder` : 103/139 voix.** Attaché par recouvrement de tokens avec l'« ordre d'entrée en jam » ;
  les voix non nommées dans cet ordre restent `null` (métadonnée secondaire).

## Suite

Étape 4 (mode team spirit) — consomme `GROOVES` : chargement d'un groove, dimension `participant`,
solo/mute par participant, flux accumulation (`enterOrder`) + distribution. C'est là que la bibliothèque
devient audible et jouable (et que les timbres substitués / grilles `uncertain` s'entendent en contexte).

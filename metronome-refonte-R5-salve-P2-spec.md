# Métronome FM — R-5 · Salve P2 (spec courte) — build 0.19.0

**Origine.** Plan P1/P2/P3 de la synthèse panel R5-4. La salve P1 (0.18.0) a éteint 3
des 4 majeurs croisés (M1 court terme, M2, M3). **P2 ferme le 4e majeur (M4)** et
ramasse les transverses « faible effort » validés en 2-3 runs. GO de Jean du 17/07
(« Salve P2 », les 6 gestes ; « franciser aussi *groove* »).

**Invariants.** Français ; fichiers complets ; Pages sans build. **Zéro moteur** (la
seule ligne touchée dans `moteur/*.js` = `BUILD`, dans la tolérance déclarée) ;
md5 des `moteur/*.js` == 0.10.0 (recette-extraction). Périmètre borné : les items P3
(tiroirs qui sautent, polices auto-hébergées, état muet plus voyant, porte cliquable
en entier) **restent dehors**.

## Les 6 gestes

| # | Geste | Constat panel | Pages | Exécution |
|---|---|---|---|---|
| 1 | **M4 — français d'abord dans les sous-titres de pratiquer** | « les anglicismes des tiroirs bloquent les 66 ans et + » | pratiquer | Sous-titres (`sec-sub`) seulement. `script` → **écrire la routine pas à pas** ; `routines · Supabase` → **routines · en ligne** ; `… · export` → **… · à exporter** ; `groove` → **rythme** (2 sous-titres). Clés EN/PT re-saisies (symétrie conservée). Les **titres** de section (dont « Répertoire de grooves ») gardent le vocabulaire du domaine — voir §Décisions. |
| 2 | **Volume + sourdine sur apprendre** | « le volume R5-1 manque désormais sur apprendre (seule page sans) » | apprendre | 5e cellule R5-1 **à l'identique** (`volSlider`/`volVal`/`volMuteBtn`) dans `#transport` ; `S.volume`/`volMuted`/`masterGain` = globals moteur ; sourdine 1-clic, le curseur la lève ; session seule (non persisté), aligné index/pratiquer. |
| 3 | **Continuité du tempo entre pages** | validé 3/3 runs (« repart à 92 partout ») | index · pratiquer · apprendre | `setTempo()` persiste dans **`fm-tempo`** ; chaque page restaure au chargement (`setTempo(+store.get('fm-tempo') \|\| 92)`). Clé **hors préfixe `fm-metro-`** → persistance **silencieuse** (pas de toast, comme `fm-theme`). Zéro moteur. Charger une leçon/un groove applique toujours son tempo conseillé (pas de régression). |
| 4 | **Annonces situées sous les portes** | « dire sous chaque porte ce qui vit ailleurs (patron du lien Team Spirit) » | index | Une note discrète (`.porte-note`) sous les portes Apprendre (« Ton parcours et ta progression sont sauvegardés ici. ») et Pratiquer (« Ton compte, la bibliothèque partagée et Team Spirit vivent ici. »). Traduites EN/PT. |
| 5 | **Phrase située sous les votes** | 6 testeurs | apprendre | Sous les boutons de vote, une phrase (`.pf-vote-note`) rendue par `pfRender` : « Ton vote recalibre le niveau pour tout le monde. » Traduite EN/PT. Bonus : `Difficulte :` → **`Difficulté :`** (accent ; clés i18n renommées). |
| 6 | **Saisie BPM + infobulles accueil** | reliquats 0.14.0, pré-arbitrés « option A » | index | (a) `#tempoValue` devient **saisissable** (`contenteditable`, `role=textbox`, Entrée/blur → `setTempo` clampe 30–260 ; Échap annule) ; le garde global de raccourcis ignore désormais `isContentEditable`. (b) Infobulles `title=` FR sur **Fréquence** et **Caractère** du « Son du clic » (via `.term`, patron Temps/cycle & Subdivision). |

## Décisions d'exécution (motivées)

- **M4 « groove »** : francisé en **« rythme »** dans les 2 sous-titres concernés. Les
  **titres** de section restent inchangés (« Répertoire de grooves », « Basse funk ») :
  ce sont des noms de rubrique, et « funk » est un genre, pas un anglicisme ; franciser
  le titre « grooves » rejaillirait sur le vocabulaire `FM_GROOVES` (hors périmètre M4 =
  *sous-titres*). Réversible si Jean préfère.
- **Clé de tempo `fm-tempo`** (et non `fm-metro-tempo`) : le préfixe `fm-metro-` déclenche
  le toast « Réglages enregistrés automatiquement » du moteur — inadapté à une écriture
  à chaque changement de tempo (et au chargement). `fm-tempo` persiste en silence, comme
  `fm-theme`.
- **Saisie BPM = `contenteditable`** plutôt qu'un `<input number>` : garde le grand nombre
  tel quel visuellement, `setTempo` inchangé (écrit `textContent`), aucun ripple CSS.

## Vérification (porte de sortie)

- **Batterie clean-room** : 28 suites, **1026 assertions, 0 rouge** (accueil 56→61,
  pratiquer 61→63, apprendre 66→70 ; 25 suites à compte constant). Moteur **md5 == 0.10.0**,
  tolérances inchangées (recette-extraction 26/26, BUILD 0.19.0).
- **Navigateur réel (Chromium), 2 modes** (http:// + file://) : **29/29, 0 erreur
  applicative** — dont sourdine réelle sur apprendre (gain maître 0,8→0→0,8, `ctx running`),
  continuité tempo index→pratiquer, saisie BPM clampée, sous-titres FR, annonces, phrase
  des votes.

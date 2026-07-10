# Métronome — passe 5 TERMINÉE (après 5.4) — brief de reprise

> À coller en tête du nouveau fil pour resynchroniser le contexte.

## Le projet

Métronome pédagogique du Portail Formation Musicale : application HTML **fichier unique** (`index.html`), offline, zéro dépendance JS, français, mobile-first. La passe 5 (basse funk générative, synthèse Web Audio maison) est **terminée** : 5.4 était sa dernière étape. Dépôt `nmulongo-sys/metronome`, une branche par étape, livraison toujours en fichier complet — jamais de patch. Prochain objectif : **validation à l'oreille** de 5.3c/5.4, puis passe suivante (ou retouches `5.3d`/`5.4b` si l'écoute le demande).

## Décisions actées

- **5.4 est LIVRÉE et POUSSÉE** le 2026-07-10 (spec `metronome-passe5-5-4-spec.md`, VALIDÉE « go validé », IMPLÉMENTÉE). Build `metronomefunk-0.5.4 · 2026-07-10`. Branche `metronomefunk-0.5.4` créée depuis `metronomefunk-0.5.3c` (`32a69d4`), 9 commits (8 fichiers + reprise de ce brief) — la tête est le commit du brief. Ne pas recoder.
- **Drop-outs (design tranché, §2.1 de la spec 5.4)** : écart assumé avec la lettre du §4.4 de la spec de passe — le drop est une **fonction pure de `measureCount`** dans `bassRealize` (zéro machine à états nouvelle, machine gap intouchée d'un octet, gap utilisateur cumulable). Trou = `lenBeats` derniers temps de chaque période de `everyN` mesures, **re-entrée sur The One** (FUNK-T1). Queues legato **raccourcies au bord** du trou (plancher 20 ms). À l'arrêt (`measureCount = 0`), jamais de trou. L'alternative « cible `bass` dans le gap unifié » a été **écartée**.
- **Swing des 16es** : `S.bass.swingFollow` (case « La basse suit le swing », cochée par défaut) — pas impairs à `(i−1+2·sw)/16`, même formule par paires que `subPositions`, appliquée **avant** le test de drop (le trou s'évalue sur la position sonnée). `sw = 50 %` ⇒ identité stricte.
- **Écran de jeu** : ligne `#playBassGroup` « Basse : activer · densité · drop-outs · ♪ accord », synchro **bidirectionnelle** avec `secBass` (`bassPlayRefresh`). La pastille d'accord = **témoin d'activité** (§5 de la spec de passe, dernier morceau livré) : pulse via la boucle rAF du curseur (`bassPulseCheck`), pas au scheduling. Groupe grisé/désactivé en famille ternaire.
- **Persistance** : champs `drop`/`swingFollow` (dormants depuis 5.0) actifs, clé `fm-metro-bass` inchangée, **aucune migration**, garde-fous dans `bassRestore` (everyN 1–32, lenBeats 1–8).
- **i18n** : la section basse entière reste hors dictionnaires EN/PT — précédent établi depuis 5.1, **assumé** (à traiter en lot dans une passe dédiée, pas au fil des étapes).
- **Retouche recette documentée (5.4)** : estampilles génériquées **passe 5** (`0\.5\.`) dans `recette-5-3-bis/-ter/-c` — le build avance à chaque étape, le motif exact `0\.5\.3x` ne matchait plus. Fin de la valse des estampilles.
- **Nomenclature** : lettres depuis 5.3c (bis/ter → b/c) ; une éventuelle retouche d'écoute = `5.3d` ou `5.4b`.

## Faits & contraintes

- **Établi / vérifié** : `recette-5-4.js` **40/40** ; non-régression complète verte en local le 2026-07-10 — 5-1 (20), 5-1-bis (21), 5-2 (23), 5-3 (38), 5-3-bis (15), 5-3-ter (28), 5-3c (21), seule la ligne d'estampille retouchée dans les trois dernières. Vérification navigateur réelle (preview mobile 375×812) : aucun débordement horizontal, synchro bidirectionnelle OK, grisage ternaire (opacité 0,45), animation `bassPulse` définie. Diags `fmMetroBass` ajoutés : `setMeasure(n)`, `cycleEvents()`.
- **Établi — environnement local** : Node n'est **pas installé** (Windows 11). Node 22 portable retéléchargé dans le scratchpad de session (éphémère — à refaire : zip `nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip`, aucune installation système). `jsdom` déjà dans le dossier projet (`node_modules/`, jamais poussé). Un `.claude/launch.json` local (serveur de preview) a été créé — **outillage local, ne jamais pousser**.
- **Estimé / à confirmer (à l'oreille)** : les drop-outs 5.4 (netteté du trou, re-entrée) et le swing basse en situation ; toujours ouvert depuis 5.3c : le défaut legato L=1,25 et le haut de course (L→2). Le headless prouve la mécanique, pas le goût.

## Questions à ne pas reposer (déjà tranchées)

- **Où est la base de travail ?** → Dossier local `metronomefunk/` (dossier `claude`) = état 5.4 complet (code + recettes + README + specs).
- **Où sont les specs ?** → `metronome-passe5-basse-spec.md` (passe 5, VALIDÉE rév. 2), `metronome-passe5-5-4-spec.md` (étape 5.4, VALIDÉE + IMPLÉMENTÉE), `metronome-passe5-5-3c-spec.md` (5.3c) — toutes en local.
- **Quel workflow ?** → Spec avant code ; proposition avant exécution ; une étape = une session ; fichier HTML complet, jamais de patch ; recette headless par étape + non-régression complète ; fin d'étape : README (entrée datée, sans écraser l'historique) + brief de reprise combiné (consigne §9, reconduite) + push via le skill github-push (clef demandée au moment du push, rappel d'effacer le jeton ensuite).
- **Comment tester ?** → `node recette-5-4.js` (et les 7 autres) depuis le dossier projet ; jsdom en place ; Node portable à retélécharger si absent. Les stubs -ter/-c/-4 enregistrent l'automation et fournissent compressor/convolver.
- **Le curseur legato peut-il redescendre sous L=1 ? Les ghosts suivent-ils le legato/le drop ? Sidechain ? Saturation ?** → Non — tranchés définitivement (les ghosts suivent en revanche le swing, comme tout pas impair : décalage temporel, pas dosage).
- **Le drop passe-t-il par la machine gap ?** → Non — design tranché à la validation de la spec 5.4 (fonction pure de `measureCount`). Ne pas rouvrir.
- **La basse joue-t-elle en ternaire ?** → Non (v1, spec de passe) ; l'UI de l'écran de jeu se grise en ternaire.
- **Jetons GitHub ?** → Tous les jetons ayant circulé sont à révoquer s'ils ne le sont pas déjà. En demander un nouveau au moment du prochain push.
- **Anciens briefs ?** → `metronome-5-3-ter-brief-reprise.md` supprimé ; `metronome-5-3c-brief-reprise.md` obsolète (remplacé par celui-ci), peut être supprimé.

## Points ouverts

- **Validation à l'oreille** (HP de bureau) : legato 5.3c (défaut L=1,25, haut de course) + drop-outs/swing 5.4. Verdict → retouche `5.3d`/`5.4b` éventuelle, ou clôture définitive de la passe 5.
- **Après la passe 5** : à définir avec Jean (merge vers la branche principale du portail ? passe 6 ?). Rien d'acté.
- Limites latentes reconduites : `DEG_SEMI['3']` = tierce majeure fixe (sans effet, aucun gabarit n'utilise le degré `3`) ; section basse hors i18n EN/PT (lot à part).

## Fichiers / livrables produits

Dossier `metronomefunk/` (dossier `claude`), état 5.4 (+ artefacts locaux non poussés) :

- `index.html` — l'app complète, build `metronomefunk-0.5.4 · 2026-07-10`.
- `recette-5-4.js` — 40/40 (défauts/no-op, drop, bord du trou, couches intactes, swing, drop×swing, persistance, écran de jeu, estampille).
- `recette-5-3-bis.js` (15), `recette-5-3-ter.js` (28), `recette-5-3c.js` (21) — retouche estampille générique passe 5 uniquement.
- `recette-5-1.js`, `recette-5-1-bis.js`, `recette-5-2.js`, `recette-5-3.js` — inchangées, vertes.
- `README.md` — journal à jour (entrée 2026-07-10, 5.4, fin de passe) + tableau de persistance complété (`fm-metro-bass`).
- `metronome-passe5-5-4-spec.md` — spec 5.4, VALIDÉE + IMPLÉMENTÉE.
- `metronome-passe5-basse-spec.md`, `metronome-passe5-5-3c-spec.md` — inchangées.
- `node_modules/`, `package.json`, `package-lock.json`, `.claude/launch.json` — local uniquement, ne jamais pousser.
- `metronome-5-4-brief-reprise.md` — ce document.

## Reprise

- **Titre suggéré du nouveau fil** : « Métronome — après la passe 5 : push 5.4 (si en attente), écoute 5.3c/5.4, suite »
- **Action** : ouvrir un nouveau fil, coller ce brief en premier message.

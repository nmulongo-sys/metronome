# Métronome — Portail Formation Musicale

Métronome pédagogique **autonome** : un seul fichier HTML, **hors-ligne**, sans dépendance JS,
français, mobile-first Android, thèmes clair/sombre du portail. Déployé sur GitHub Pages.

## Fonctions

### Pulsation & sensation
- Tempo (curseur, ±1, tap-tempo), chiffrage variable, subdivisions, **swing** asymétrique.
- Accent du premier temps, **clic muet** (la pulsation se tait, les couches à grille continuent),
  clic décalé (entraînement au placement), pulsation grave/aiguë.
- Familles **binaire (16 pas)** et **ternaire (12 pas)** : un réglage global qui **asservit ensemble**
  la clave et la percussion (impossible de désynchroniser binaire/ternaire).

### Claves & cellules rythmiques
- Séquenceur deux voix (cloche grave / aiguë). Presets : son 3-2 / 2-3, rumba, bossa, partido alto,
  **tresillo** et **cinquillo** (cellules courtes 8 pas propres à la clave).
- Grille éditable (silence → frappe → accent), cercle de résolution sur le 1 du cycle suivant.

### Percussion & indépendance
- Grooves de plusieurs instruments avec grille par voix, accents et **micro-timing** (glisser une frappe
  en avance / en retard pour visualiser et entendre le swing).
- **Instruments** : djembé, cajón, dunduns & cloche, **agogô**, **surdo**, **reco-reco**.
- Modes d'exercice : **ajout progressif**, **soustraction**, **appel-réponse**, **progression guidée**
  (mains D/G expliquées), **break programmé** (phrase qui s'étoffe par niveaux).
- **Gap clicks (horloge interne)** unifiés : couper tout, la pulsation seule, ou **une seule voix**
  ciblée, sur un motif jouer/muet programmable.
- **Ligne de réduction** (solfège) : le groove qui sonne, sur une ligne, une brique colorée par voix.
- Mode **plein écran** et mémoire de séquences (grilles, accents, micro-décalages).

### Mode « team spirit » (jouer à plusieurs)
- Charge un **groove de la bibliothèque** (31 grooves : Brésil, Ouest-africain, Funk, Reggae, Hip-hop,
  Rock) et joue-le à plusieurs voix hétérogènes assignées à des **participants**.
- **Distribution** : un groove complet partagé entre N participants (répartition équilibrée par
  tessiture) — l'union des parts reconstitue le groove.
- **Accumulation** : les voix entrent une à une, dans l'ordre d'entrée en jam.
- **Solo / muet par participant** : n'entendre qu'une part, en faire taire une, ou jouer l'ensemble.
- Les grilles reconstruites non encore validées à l'oreille sont marquées d'un repère `≈`.

### Archet (cordes frottées)
- Visualiseur tirer / pousser / dérive pour violon, alto, violoncelle, contrebasse (archet français
  ou allemand), techniques détaché / legato / martelé / spiccato, plein écran.

### Assistant & routines
- Assistant de réglage (3 contextes) qui pré-règle le métronome, routines programmables
  (segments de tempo, gaps, directives), modes simple / expert.

## Utilisation

Application autonome : ouvrir le fichier HTML de l'app dans un navigateur (aucune installation, aucun
réseau requis). Paramètres d'URL de thème : `?theme=clair` ou `?theme=sombre`.

## Structure du dépôt

- Application : fichier HTML unique (offline, sans dépendance).
- `grooves-*.md` : corpus de recherche des 6 familles de grooves (sources, grilles, auto-critique).
- `metronome-passe*-spec.md` / `*-recette.md` : spécifications et rapports de recette par passe et par étape.
- `convert-grooves.py` : convertisseur déterministe corpus `.md` → table de grooves embarquée.

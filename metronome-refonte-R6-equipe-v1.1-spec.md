# R-6 · `equipe.html` v1.1 — entrée « à froid » guidée + dé-jargon (build 0.21.0)

**Statut :** exécutée. Spec courte (défauts pris, sans nouveau GO — le brief avait tranché
« P1 = equipe v1.1 » et « spec courte avant code »). Base : `main` = 0.20.0 (`e7f6a41`,
#36 mergée). **Zéro moteur** (BUILD seule ligne), fichiers complets, Pages sans build.

## Objet

Éteindre le **seul critique du portail** relevé par le rejeu panel sur 0.20.0 — l'entrée
**« à froid »** d'`equipe.html` — et le **jargon** de la page.

**Le problème (constaté sur le code).** Qui clique la porte « En équipe » depuis l'accueil
arrive **sans config** : page vide, transport qui ne « joue » qu'un clic nu, et un vocabulaire
de musicien (*pupitre, chef, backing, répartition, salle de concert, JSON*). Il ne sait ni ce
que fait la page ni par où commencer — cul-de-sac.

## Ce que v1.1 livre

### 1. Accueil « à froid » guidé (`#eqEmpty`)
- **Dire ce que c'est, en clair** : « Jouer à plusieurs, chacun sur son téléphone : une
  personne prépare qui joue quoi, partage un lien, puis lance tout le monde en même temps. »
- **Les 3 temps** (liste ordonnée) : préparer la répartition → partager le lien → chacun
  choisit sa ligne et part au signal commun.
- **« Essayer avec un exemple »** — charge une **répartition démo embarquée** (`EQ_EXAMPLE`,
  déterministe, **sans backend** : 3 joueurs sur un djembé). La page vide devient explorable —
  on voit le pupitre, les joueurs, le départ — **sans devoir d'abord fabriquer** une
  répartition. C'est le plus gros levier anti-froid.
- **Séparateur** « J'ai déjà une répartition » : l'entrée aux vraies configs (import `.json`,
  passerelle Team Spirit, lien collé) passe en second, pour qui sait déjà.
- **Transport masqué tant qu'aucune équipe n'est chargée** — un « ▶ Démarrer » qui ne joue
  qu'un clic nu déroute à froid. `eqApplyConfig` le révèle dès qu'une répartition est en place
  (choke point unique : import / lien / hash / exemple / broadcast online passent tous par là).

### 2. Passe dé-jargon (libellés seulement — IDs et mécanique **inchangés**)
- « tu accompagnes **(backing)** » → « tu accompagnes **les autres** » (fin du mot anglais).
- Résumé : « **Groove :** » → « **Rythme :** » (cohérent R-5 P2).
- « Importer un fichier d'équipe **(JSON)** » → « … **(fichier .json)** ».
- « → **Aller à** Team Spirit » → « → **La préparer dans** Team Spirit ».
- **Glose en place** (les mots musicaux restent, l'identité de la page aussi) :
  « Mon pupitre » gagne « — ma ligne à jouer » ; le hint du départ glose « le chef »
  (« Le chef, c'est la personne qui lance le groupe … »).
- **Porte « En équipe » (index)** : la note perd « pupitre » → « chacun sa ligne, une
  personne lance tout le monde ».

## Cadre & non-régression

- **Aucune retouche moteur** : `moteur/*.js` == 0.10.0 à l'octet près modulo la ligne BUILD
  (md5 inchangé) ; BUILD `0.20.0` → **`0.21.0`**.
- **i18n EN + PT** symétrique pour chaque chaîne neuve/changée (clés obsolètes de l'ancien
  intro purgées ; audit d'extraction strict vert).
- **Batterie : 29 suites, 1084 assertions, 0 rouge** (equipe 46 → **53** : +K1–K4 entrée à
  froid, +L1–L3 exemple embarqué ; accueil/apprendre/pratiquer/extraction : BUILD + clé de
  note mise à jour, comptes constants).
- **Navigateur réel (Chromium, http:// + file://) : 32/32, 0 erreur applicative** — transport
  masqué à froid puis révélé ; 3 étapes + exemple ; l'exemple charge (3 joueurs, pupitre gréé,
  « Rythme : Exemple funk ») ; **lecture réelle** au départ du chef (`isPlaying`, `audioCtx`
  running) ; dé-jargon à l'écran ; boot depuis lien partagé intact. (Échecs réseau polices/
  Supabase CDN = régime proxy connu, hors app.)

## Hors périmètre (déclaré)
- Le mode **online à 2 appareils** reste **mock-vérifié** (egress Supabase 403 en env) — vérif
  prod de Jean, inchangée depuis R-6.
- Reste du plan : **M1** (corpus i18n — traduire les leçons) et **C6** (expansion styles).

# Métronome FM — R-6 · equipe **v1.2** (spec courte)

> Portail Formation Musicale · `equipe.html` = « la salle de concert ».
> Livraison : fichiers complets · GitHub Pages sans build · moteur `moteur/*.js`
> **verbatim (md5 == 0.10.0)** · une PR = un minor. Build **0.21.0 → 0.22.0**.

## Point de départ (établi)
- PR #37 **mergée** → `main` = 0.21.0 (prod à jour : entrée « à froid » + dé-jargon).
- Baseline batterie rejouée sur le clone : **recette-equipe 53/53 vertes**.
- Le mode « En ligne (salle) » **existe déjà** (canal Supabase broadcast `equipe-<code>`,
  case « Je suis le chef », diffusion config/start/stop) mais reste **nu** : rien ne dit
  ce qu'est un code, on **ne voit pas qui est dans la salle ni qui est chef**, et le
  bouton « Départ » est cliquable par n'importe qui. C'est le **seul critique** du panel.

## Objet (les 3 volets du brief)

### Volet 1 — Guider le mode « En ligne » *(le cœur)*
1. **Dire ce qu'est un code de salle** (copy « à froid », même patron que v1.1) :
   « Invente un mot simple (ex. `funk-42`), dis-le au groupe à voix haute ; tout le monde
   tape le **même** mot et se retrouve dans la même salle. » + 2 pas courts.
2. **Présence « qui est là / qui est chef »** — Supabase **Realtime Presence** sur le canal
   déjà créé : à la connexion `channel.track({ nom, chef, joueur })` ; on écoute
   `presence: sync/join/leave` → **roster vivant** :
   - liste des membres (nom), badge **★ chef**, la ligne choisie (« Joueur 2 ») ;
   - compteur « N dans la salle » ;
   - garde-fous doux : **aucun chef** → « Personne n'est encore chef — quelqu'un coche
     “Je suis le chef” » ; **2 chefs** → note discrète.
   - Identité : pseudo du compte si connecté (`fmCurrentProfil.pseudo`), sinon champ
     « Mon nom dans la salle » (défaut « Invité »). Re-`track()` quand je change de
     rôle/joueur.
3. **« Le chef lance »** : en ligne, si je **ne suis pas** chef → bouton « ▶ Départ »
   **désactivé**, remplacé par « En attente du chef… (Nom) » ; seul le chef lance/arrête
   la salle (déjà le cas côté broadcast, on le rend **lisible et exclusif** côté UI).

### Volet 2 — Préparer une répartition **sans quitter la page**
Éditeur **léger** de répartition sur la config **déjà chargée** (exemple / import / lien) :
- pas de **nombre de joueurs** (1..6) → `cfg.joueurs` ;
- par voix, un `<select>` **Joueur 1..N / personne (accompagnement)** → `cfg.voix[i].j` ;
- re-render live (résumé + « Je suis… » + pupitre) ; **le lien de partage et le broadcast
  reflètent l'édition**.
- **Hors périmètre** (reste dans « Rythme à plusieurs » côté pratiquer) : créer un groove de zéro
  (choix d'instruments, dessin des grilles). Ici on **répartit** un groove existant ;
  l'exemple embarqué fournit un groove prêt à répartir. Le renvoi vers pratiquer demeure.

### Volet 3 — Franciser « Team Spirit » *(anglicisme transverse)*
Renommer le **libellé visible** « Team Spirit » → **« Rythme à plusieurs »** (nom **retenu par
Jean**, remplace le défaut initial « Répartition »). Portée :
- `pratiquer.html` : titre de section + chip du sommaire + renvois texte ;
- `index.html` : la phrase « … et Team Spirit vivent ici » ;
- `equipe.html` : bouton « → La préparer dans … » + clé de dico « Pratiquer › … » ;
- dicos i18n FR/EN/PT des 3 pages (EN « Group rhythm » / PT « Ritmo em grupo »).
- **Ne PAS toucher** l'`id="secTeam"` ni les ancres `pratiquer.html#secTeam` (liens
  profonds R-5 + `eqGoTeam`) : on change le **texte**, pas les identifiants.

## Contraintes de non-régression
- **Moteur intact** : md5 `moteur/*.js` == 0.10.0 (seule la ligne `BUILD` bouge → 0.22.0).
- Zéro dépendance nouvelle : Presence = API du client Supabase déjà chargé.
- Fonctionne **sans réseau / sans compte** (présence = bonus du mode en ligne ; hors-ligne
  inchangé).
- i18n symétrique FR/EN/PT pour chaque chaîne visible ajoutée.

## Recettes (extension `recette-equipe.js`)
- Étendre le **mock Realtime** : `track` / `presenceState` / `on('presence', …)` + aide
  `_presence()` pour simuler sync/join/leave.
- **M. présence** : join en chef → je figure au roster avec ★ ; arrivée d'un 2ᵉ membre →
  compteur +1 ; non-chef → bouton Départ désactivé + « En attente du chef ».
- **N. répartition en page** : +1 joueur → chips « Je suis… » re-rendues ; réaffecter une
  voix → `cfg.voix[i].j` changé + pupitre re-rendu + lien de partage à jour.
- **Francisation** : plus aucun libellé visible « Team Spirit » sur equipe.html ; suites
  `recette-pratiquer` / `recette-accueil` re-vertes (extraction i18n garde-fou).
- Rejeu **batterie complète** + vérif **navigateur** (Playwright, `http://` + `file://`).

## Livrables
- `equipe.html` (v1.2) · `pratiquer.html` · `index.html` · `moteur/fm-etat.js` (BUILD
  0.22.0) · `recette-equipe.js` (étendue) · cette spec · `rapport-nonregression-0.22.0.md`.
- Une **PR** prête à relire ; Jean merge et fait le ménage de branches.

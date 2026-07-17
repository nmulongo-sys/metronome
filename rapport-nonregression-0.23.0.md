# Rapport de non-régression — build 0.23.0 (renommage « Rythme à plusieurs »)

Base : `main` = 0.22.0 (`c1e56a0`, #38 mergée). **Correctif de libellé** : #38 a été mergée avec
le **nom par défaut « Répartition »** avant que le choix de Jean n'arrive ; ce build applique
**« Team Spirit » → « Rythme à plusieurs »** (le nom retenu). **Zéro moteur** (BUILD seule ligne).

## 1. Ce qui change

| Fichier | Changement |
|---|---|
| `pratiquer.html` | Nom de section **« Répartition » → « Rythme à plusieurs »** : titre, chip du sommaire, renvoi texte du répertoire, dicos EN (`Group rhythm`) / PT (`Ritmo em grupo`). **`id="secTeam"` et ancres inchangés.** |
| `index.html` | Porte « Pratiquer » : « … et **Rythme à plusieurs** vivent ici. » + 2 clés i18n (EN `Group rhythm` / PT `Ritmo em grupo`). |
| `equipe.html` | Renvoi `eqGoTeam` : `title` « Ouvre la section **« Rythme à plusieurs »** … » + 2 clés i18n + commentaire. Le mot **générique** « répartition » (éditeur en page « Ajuster la répartition », exemple) est **conservé** (ce n'est pas le nom de section). |
| `moteur/fm-etat.js` | `BUILD` → `metronomefunk-0.23.0` (**seule** ligne moteur ; md5 == 0.10.0, tolérance). |
| `recette-accueil.js` | `P2.5` alignée sur « … et Rythme à plusieurs » ; BUILD 0.23.0. |
| `recette-onboarding-0.6.7.js` | `3.16` renvoi répertoire → « Rythme à plusieurs ». |
| `recette-{equipe,apprendre,pratiquer,extraction}.js` | BUILD 0.22.0 → 0.23.0 (assertions + tampons). |
| `metronome-refonte-R6-equipe-v1.2-spec.md` | Volet 3 mis à jour : nom retenu « Rythme à plusieurs ». |

## 2. Batterie canonique — 29 suites, 1098 assertions, 0 rouge

Node 24 (jsdom), working tree normalisé LF. Compte **inchangé** vs 0.22.0 (1098) : le renommage
est un remplacement de libellé (aucune assertion ajoutée/retirée), seuls les libellés et le numéro
de build changent. **0 rouge** (exit 0 sur les 29). Moteur : `recette-extraction` md5 == 0.10.0.

## 3. Navigateur réel (Chromium, serveur local)

- `pratiquer.html` : **chip + titre = « Rythme à plusieurs »**, ancre `secTeam` intacte, **0
  « Team Spirit » / 0 « Répartition »** (nom de section) visible.
- `index.html` : porte « … et **Rythme à plusieurs** vivent ici. » ; clés EN/PT présentes.
- `pratiquer.html#secTeam` : la section s'ouvre toujours (`open`, titre « Rythme à plusieurs »).

## 4. Note de contexte

#38 (0.22.0) est **déjà en prod avec « Répartition »**. Ce build 0.23.0 corrige le nom : après
merge, Pages sert **0.23.0** avec **« Rythme à plusieurs »** partout, et le tampon de build permet
de distinguer les deux états en prod.

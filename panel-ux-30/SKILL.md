---
name: panel-ux-30
description: >
  Fait tester une page web (HTML fourni) par un panel FIXE de 30 personas simulés —
  9 à 80 ans, intéressés par la musique, compétences numériques de novice à expert —
  et génère un dashboard HTML interactif de retours UX (personas filtrables, constats
  consolidés priorisés, synthèse et plan d'action). Déclencher ce skill dès que
  l'utilisateur dit « panel », « fais tester par le panel », « les 30 testeurs »,
  « contrôle qualité UI », « test utilisateurs », « retours UX », « fais passer le
  panel sur cette page », ou colle/fournit un HTML en demandant des retours sur son
  interface — même sans le mot « skill ». Si aucun HTML n'est fourni, le skill DEMANDE
  d'abord à l'utilisateur de coller le HTML ou d'indiquer le fichier/l'URL. Ne PAS
  déclencher pour créer de nouveaux personas, recruter de vrais utilisateurs, ou pour
  un audit d'accessibilité formel seul (WCAG).
---

# Panel UX 30 — tests utilisateurs simulés sur un HTML fourni

Ce skill rejoue toujours le même panel de 30 testeurs (identités figées dans
`references/personas.md`) sur la page web que l'utilisateur veut évaluer, puis produit un
dashboard interactif au format maison (`assets/dashboard-template.html`). La valeur du skill
tient à deux choses : la **stabilité du panel** (comparer deux versions d'un site avec les
mêmes testeurs) et l'**ancrage des retours dans le code réel** (jamais de constat inventé
qu'on ne peut pas pointer dans le HTML).

## Étape 0 — Obtenir le HTML à tester

Si l'utilisateur n'a pas encore fourni la page, demander avant toute chose (via
AskUserQuestion ou en une phrase) : de coller le code HTML dans la conversation, ou d'indiquer
le fichier (glisser-déposer / chemin dans un dossier connecté), ou de donner l'URL (à
récupérer alors via fetch). Demander aussi, si ce n'est pas évident : le nom de l'app/page et
sa version (pour le titre du dashboard et le nom du fichier de sortie). Ne pas lancer l'analyse
tant que le HTML n'est pas en main.

## Étape 1 — Analyser réellement le HTML

Lire le code fourni et relever des faits vérifiables — ce sont eux qui nourriront les constats :
structure (sections, navigation, longueur, repliables, modales, wizard) ; libellés visibles
(jargon, anglicismes, icônes sans texte) ; responsive (breakpoints `@media`, layouts serrés,
cibles tactiles) ; lisibilité/accessibilité (polices < 13 px, opacités < 0.7, contrastes,
attributs `aria-*` vs nombre de contrôles, alternatives aux `<canvas>`, focus) ; parcours
(premier chargement, porte d'entrée débutant, reset, feedback de sauvegarde) ; fonctionnalités
(audio, export, comptes, multilingue, dépendances CDN, persistance). Un fichier volumineux se
scanne par grep (ids, labels, `@media`, aria, font-size) puis lecture ciblée.

## Étape 2 — Faire passer le panel

Lire `references/personas.md` (les 30 identités figées, sensibilités, barème, thèmes). Pour
chacun des 30 : `note` (/10, une décimale — respecter le barème, éviter l'uniformité), `duree`,
`quote` (à la 1re personne, dans la voix du persona — Maria peut glisser du portugais, Diego de
l'espagnol), `scenario` (la tâche concrète tentée sur CE site), `constats` (2 à 4, chacun
`{t, sev, th}` avec `sev` ∈ critique/majeur/mineur et `th` pris dans la liste des thèmes),
`aime` (1 à 2 points positifs sincères). Règles : les novices (IT 1–2) et les 66 ans et +
portent l'essentiel des constats de prise en main/lisibilité ; les experts (IT 4–5) portent les
manques fonctionnels et techniques ; les spécialistes valident/invalident le contenu de leur
spécialité. Un même problème réel doit être vu par plusieurs personas. Réserver `critique` aux
cas où un testeur échoue à sa tâche de base ou abandonne.

## Étape 3 — Consolider les constats

Regrouper en 10 à 16 constats `{id:"C1"…, sev, titre, desc, reco, effort, who}` : `sev` =
sévérité globale (critique si au moins un testeur a échoué à cause de lui) ; `desc` factuelle,
appuyée sur le code ; `reco` concrète et actionnable ; `effort` ∈ faible/moyen/eleve ; `who` =
liste des `id` concernés (chaque id existe ; chaque constat individuel majeur se retrouve dans
un consolidé).

## Étape 4 — Générer le dashboard

Prendre `assets/dashboard-template.html` et remplacer les 8 marqueurs :

| Marqueur | Contenu |
|---|---|
| `__APP_TITLE__` | Nom de l'app/page testée (3 occurrences) |
| `__APP_VERSION__` | Version, ou vide |
| `__APP_SOURCE__` | Nom du fichier/URL testé (2 occurrences) |
| `__DATA_P__` | Le tableau JS des 30 personas (littéral `[{...},...]`) |
| `__DATA_ISSUES__` | Le tableau JS des constats consolidés |
| `__STRENGTHS_LIS__` | Des `<li>` de points forts unanimes (6 max, avec `<b>`) |
| `__ROADMAP_LIS__` | Des `<li>` de plan d'action priorisé P1/P2/P3 (`<span class="prio-tag p1">P1 · Titre</span> — détail. <i>Impact, effort.</i>`) |
| `__DATE__` | Date du jour (JJ/MM/AAAA) |

Ne pas toucher au reste du gabarit (CSS, filtres, rendu) : il attend exactement les champs
décrits ci-dessus et les libellés de thèmes de `personas.md`.

## Étape 5 — Vérifier puis livrer

Extraire le `<script>` du fichier généré et vérifier la syntaxe (`node --check`). Vérifier avec
un stub DOM minimal : 30 personas, ids uniques 1–30, aucune référence `who` invalide, rendu des
trois vues non vide. Sauvegarder dans le dossier de travail sous
`panel-tests-ui-<nom>-<version>.html` et le présenter. Conclure par 3–4 phrases : note moyenne,
les 2 constats critiques, le point fort dominant — et rappeler que ce sont des personas
simulés, utiles pour prioriser, à confirmer avec de vrais utilisateurs. Le dashboard comporte
déjà l'avertissement méthodologique ; ne pas le retirer.

## Cas particuliers

- **Nouvelle version d'un site déjà testé** : garder les mêmes scénarios par persona autant que
  possible et mentionner dans la conclusion les constats résolus depuis la version précédente
  (si l'ancien dashboard est disponible, le lire pour comparer).
- **Page sans audio ni temps réel** : omettre les thèmes « Audio & son » et « Performance » ;
  les personas concernés reportent leur attention sur leurs autres sensibilités.
- **HTML partiel ou minifié** : le signaler dans la conclusion ; les constats restent limités à
  ce qui est observable.

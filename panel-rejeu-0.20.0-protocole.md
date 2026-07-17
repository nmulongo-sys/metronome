# Rejeu du panel — 0.20.0 (R-6) · protocole & kit

> **But** : préparer le rejeu du **panel fixe de 30 personas** sur la prod **0.20.0** —
> longitudinal (mêmes identités que v0.6.5 / 0.14.0 / 0.17.0), pour **re-pondérer le backlog**
> après R-5 (P1+P2) et R-6. **Personas simulés** : constats ancrés dans le code réel des pages,
> utiles pour PRIORISER — **à confirmer avec de vrais utilisateurs**.
>
> **Nota d'exécution** : le skill `panel-ux-30` n'est pas chargé dans la session courante ; ce
> document rend le rejeu exécutable soit par le skill (quand il sera dispo), soit à la main sur
> cette grille. Base : `main` 0.20.0 (PR #36) — le rejeu se lance **après merge + prod servie**.

---

## 1. Ce que 0.20.0 change (ce que le rejeu doit évaluer en neuf)

| Surface | Delta depuis le run 0.17.0 | Attente du rejeu |
|---|---|---|
| **`equipe.html`** | **PAGE NEUVE** (la 4e) — « salle de concert » : charger une répartition, « mon pupitre », le chef, modes hors-ligne/online | **Premier run officiel** — pas de ligne de base ; signal fort attendu des personas « collectifs » |
| **`index.html`** | Porte « En équipe » **activée** (delta) | Le constat C2 (résolu en R-5) est-il **clos** ? La 4e voie est-elle lisible ? |
| **`pratiquer.html`** | Bouton **`▶ Jouer en équipe`** dans Team Spirit (delta) | La passerelle fabrique→joue est-elle trouvée ? |
| **`apprendre.html`** | **Inchangé** fonctionnellement (contenu FR = M1, hors périmètre) | Contrôle : notes stables ; M1 (leçons FR) toujours le majeur restant |

Entre 0.17.0 et 0.20.0, ont aussi atterri (P1+P2, déjà en prod, à re-constater comme **résolus**) :
volume+sourdine accueil/apprendre, continuité tempo inter-pages, saisie BPM + infobulles accueil,
sous-titres FR de pratiquer (M4), modale compte traduite (M3), avis « leçons en FR » (M1-court),
annonces situées sous les portes, phrase sous les votes.

---

## 2. Le roster fixe des 30 (+ lignes de base 0.17.0 par page)

`it` = compétence numérique (1 = novice … 5 = expert). Moyennes 0.17.0 : **accueil 8,61 · pratiquer
8,10 · apprendre 8,37**. La colonne **equipe** est vide (premier run).

| # | Persona | Âge | Rôle | it | Device | acc | pra | app | **equipe** |
|--:|---|--:|---|:--:|---|:--:|:--:|:--:|:--:|
| 1 | Léa | 9 | Élève éveil musical (perc.) | 1 | tablette | 7.7 | 6.9 | 7.4 | — |
| 2 | Tom | 12 | Collégien, batterie 1re année | 3 | mobile | 8.3 | 8.4 | 8.5 | — |
| 3 | Inès | 14 | Flûtiste, conservatoire 2e cycle | 3 | mobile | 8.4 | 8.0 | 8.6 | — |
| 4 | Hugo | 16 | Bassiste autodidacte (YouTube) | 4 | ordi | 8.7 | 9.0 | 8.8 | — |
| 5 | Emma | 17 | Chanteuse de chorale lycéenne | 2 | mobile | 8.6 | 7.4 | 7.8 | — |
| 6 | Nathan | 19 | Étudiant STAPS, djembé en assoc. | 3 | mobile | 8.8 | 8.6 | 9.3 | — |
| 7 | Chloé | 22 | Étudiante en musicologie | 3 | ordi | 9.2 | 8.8 | 9.0 | — |
| 8 | Yanis | 24 | DJ amateur, production MAO | 5 | ordi | 8.7 | 8.9 | 8.0 | — |
| 9 | Maria | 26 | Prof de capoeira, brésilienne | 2 | mobile | 9.0 | 8.2 | 8.4 | — |
| 10 | Julien | 28 | Développeur web, guitariste | 5 | ordi | 9.3 | 9.1 | 9.0 | — |
| 11 | Sofia | 31 | Violoniste semi-professionnelle | 3 | tablette | 9.3 | 7.8 | 7.6 | — |
| 12 | Marc | 33 | Batteur de groupe rock | 4 | mobile | 9.0 | 8.7 | 8.6 | — |
| 13 | Aïcha | 35 | Professeure des écoles (chorale de classe) | 2 | ordi | 8.5 | 7.6 | 8.3 | — |
| 14 | Diego | 38 | Percussionniste cubain (son, timba) | 3 | mobile | 8.8 | 9.1 | 8.9 | — |
| 15 | **Camille** | 40 | **Cheffe de chœur et d'ensemble percus** | 3 | ordi | 8.8 | 8.9 | 8.4 | — |
| 16 | Olivier | 42 | Ingénieur, trompettiste d'harmonie | 5 | ordi | 8.9 | 8.9 | 8.5 | — |
| 17 | Nadia | 45 | Pianiste amatrice (reprise) | 2 | tablette | 8.6 | 7.2 | 8.8 | — |
| 18 | Pierre | 47 | Luthier, violoncelliste amateur | 2 | ordi | 8.6 | 8.0 | 8.2 | — |
| 19 | **Fatou** | 50 | **Animatrice d'ateliers djembé** | 2 | mobile | 8.6 | 8.4 | 8.9 | — |
| 20 | Laurent | 52 | Bassiste funk semi-pro | 3 | ordi | 9.0 | 9.5 | 9.2 | — |
| 21 | Anne | 55 | Documentaliste, choriste | 1 | ordi | 8.2 | 7.3 | 8.1 | — |
| 22 | Bernard | 58 | Batteur jazz amateur | 2 | tablette | 8.2 | 8.8 | 8.0 | — |
| 23 | Rosa | 61 | Prof de formation musicale retraitée | 2 | ordi | 9.0 | 8.3 | 9.4 | — |
| 24 | Michel | 63 | Accordéoniste de bal musette | 1 | mobile | 7.9 | 6.8 | 7.5 | — |
| 25 | Denise | 66 | Choriste paroissiale | 1 | tablette | 8.7 | 7.0 | 7.8 | — |
| 26 | Georges | 68 | Violoniste amateur (50 ans de pratique) | 2 | ordi | 8.7 | 7.8 | 8.0 | — |
| 27 | Malika | 71 | Pianiste retraitée, ex-professeure | 2 | tablette | 8.3 | 8.0 | 8.4 | — |
| 28 | Jean-Paul | 74 | Clarinettiste d'harmonie municipale | 1 | ordi | 8.0 | 7.2 | 7.7 | — |
| 29 | Suzanne | 77 | Organiste liturgique | 1 | tablette | 8.5 | 6.9 | 7.9 | — |
| 30 | **Henri** | 80 | **Ancien chef d'harmonie** | 1 | ordi | 8.1 | 7.4 | 8.2 | — |

**Personas à signal fort pour `equipe.html`** (le cahier des charges R-6 vient d'eux) :
**Camille (15)**, **Fatou (19)**, **Henri (30)** en tête ; puis les collectifs/pédagogues —
Aïcha (13, chorale de classe), Maria (9, groupe), Nathan (6, assoc.), Diego (14, ensemble),
Rosa (23), Anne (21), Denise (25), Jean-Paul (28), Suzanne (29, harmonie/liturgie) ; et pour le
**mode online** + robustesse technique : Yanis (8), Julien (10), Olivier (16). Extrêmes
d'ergonomie : Léa (9 ans, 1) et Henri (80 ans, 30).

---

## 3. Grille d'évaluation par page (tâches jouées par chaque persona)

**Commune (contrôle de non-régression P1/P2)** : régler le tempo (clavier + curseur), volume +
sourdine, bascule de langue, continuité du tempo en changeant de page.

**`equipe.html` (scénario R-6, le neuf)** :
1. Arriver via la porte « En équipe » de l'accueil → comprend-on ce qu'est la page ?
2. **Charger une config** : ouvrir depuis Team Spirit (`▶ Jouer en équipe`) OU un lien collé OU
   un import JSON — la voie est-elle trouvée sans aide ?
3. **Choisir son numéro** → « mon pupitre » : la ligne mise en avant est-elle lisible (grille +
   curseur) ? le backing on/off est-il compris ?
4. **Le chef** : lancer le décompte → départ. Rassure-t-il (Henri : « chef automatique ») ?
5. **Partage** : copier le lien, l'ouvrir « sur un 2e appareil », prendre un autre numéro.
6. **Mode online** : créer/rejoindre une salle, rôle chef/suiveur (Yanis/Julien/Olivier).

**Constats à re-tester (backlog ouvert = ce que le rejeu doit re-pondérer)** :
- **M1 (au fond)** : le contenu des leçons reste FR — toujours le majeur sur apprendre en EN/PT.
- **R-6 v1.1** : source « bibliothèque en ligne », `apprendre` en pupitre, export PNG, durcir l'online.
- **P3 finitions** : impressions apprendre, « ma session » locale, stats/export de progression,
  grille en grand (classe), filtre-favoris répertoire, presets swing/feel, tiroirs qui sautent,
  **auto-hébergement des polices**, état muet plus voyant, **lisibilité des extrêmes** (9 / 66+).

---

## 4. Livrables attendus du rejeu (format 0.17.0, bumpé 0.20.0)

- **4 dashboards** `panel-tests-ui-metronomefunk-<page>-0.20.0.html` — dont **`equipe`
  (neuf, premier run)** ; index/pratiquer/apprendre en **delta longitudinal** vs 0.17.0.
- **1 synthèse** `panel-ux-0.20.0-synthese-portail.html` (patron de `panel-ux-0.17.0-…`) :
  KPI par page + notes moyennes, constats croisés, **plan d'action re-priorisé** (les lots du §3),
  et le verdict sur R-6 (equipe tient-elle sa promesse pour Camille/Fatou/Henri ?).
- Committés au dépôt + servis par Pages (comme les dashboards 0.14.0/0.17.0).
- Avertissement « personas simulés » sur chaque dashboard (invariant méthodo).

---

## 5. Comment lancer (deux voies)

- **Voie skill** : dans une session où `panel-ux-30` est chargé — lui passer ce protocole
  (roster §2 + grille §3 + format §4). Le skill produit les 5 HTML.
- **Voie manuelle** : re-scorer chaque persona du §2 contre le code 0.20.0 réel (les 4 pages),
  en repartant des notes de base 0.17.0 (deltas motivés), puis générer les 5 HTML sur le patron
  des fichiers 0.17.0 (données `personas[]` + `issues[]` + rendu). L'`equipe` part sans base.

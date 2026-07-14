# Spec 0.6.7 — Salve UX « onboarding » (C1, C9 du panel v0.6.5)

Branche : `claude/new-session-ata3dd` (rôle : « 0.6.7 »), créée depuis `main` après merge de la
PR #15 (build 0.6.6). Base de travail : `metronomefunk-0.6.6`. Livraison : `index.html` complet,
build `metronomefunk-0.6.7`.

## 1. Objet

Deuxième salve issue du panel UX simulé v0.6.5, conformément à la roadmap committée
(`panel-ux-0.6.5-synthese-roadmap.html`) : les deux constats « onboarding » —

- **C1 (critique)** : surcharge cognitive en mode Configurer, aucun parcours progressif —
  rien ne conduit les novices vers l'Assistant au premier lancement.
- **C9 (majeur)** : aides pédagogiques en pavés de 10+ lignes, non hiérarchisées — les jeunes
  les sautent, les seniors renoncent.

## 2. C1 — parcours progressif au premier contact

### 2.1 Point à trancher — écart assumé avec la lettre de la reco du panel

La reco C1 dit « ouvrir l'Assistant automatiquement à la première visite ». Or la passe 4.1 a
**décidé l'inverse** : l'écran « Je joue » est la porte d'entrée, l'assistant ne s'ouvre plus
automatiquement. On ne revient pas sur cette décision ; on la complète :

> **Proposition** : à la première visite (aucun état `fm-metro-play` sauvegardé **et**
> `fm-metro-wizard-done` absent), un **bandeau d'invitation** apparaît en tête de l'écran
> « Je joue » : « **Débutant ? Laisse-toi guider** — l'assistant règle le métronome pour toi
> en trois questions. [✦ Guide-moi] [Plus tard] ».

- « ✦ Guide-moi » ouvre le wizard existant (`openWizard()`), rien d'autre ne change au wizard.
- « Plus tard » masque le bandeau et pose `fm-metro-onboard-dismissed`.
- Le bandeau disparaît définitivement dès que `fm-metro-wizard-done` **ou**
  `fm-metro-onboard-dismissed` existe (donc jamais revu par les utilisateurs actuels).
- « ⟲ Tout réinitialiser » (C8, purge `fm-metro-*`) refait naturellement apparaître le bandeau —
  comportement voulu (retour à l'état « première visite »).

### 2.2 Mode focus en Configurer — « une section à la fois »

- Case à cocher « Une section à la fois » en tête du mode Configurer (près du sommaire sticky C6).
- Cochée : ouvrir une `details.section` ferme les autres (accordéon), et le sommaire C6 continue
  de fonctionner (il ouvre la section visée, les autres se ferment).
- Persistance : `fm-metro-focus-mode` (`'1'`/absent). Décochée par défaut (comportement actuel
  inchangé pour les habitués).
- Implémentation : un écouteur `toggle` délégué sur les `details.section` ; aucune refonte.

## 3. C9 — hiérarchiser les aides pédagogiques

### 3.1 Principe « 1 phrase clé + En savoir plus »

Pour chaque hint « pavé » (~≥ 300 caractères), on garde **la première phrase clé visible** et on
replie le reste dans un `<details class="hint-more"><summary>En savoir plus</summary>…</details>`
inline. Aucun contenu supprimé ni réécrit : uniquement redécoupé (phrase clé conservée telle
quelle pour limiter la casse i18n — voir 3.3).

Cibles recensées sur le build 0.6.6 (longueur du texte utile) :

| Ligne (0.6.6) | Section | Taille |
|---|---|---|
| L857 | Percussion (pas, micro-timing, mains…) | 1508 c |
| L1072 | Basse funk | 1088 c |
| L934 | Team Spirit (assignation des voix) | 523 c |
| L921 | Team Spirit (priorité des lignes) | 462 c |
| L895 | Répertoire de grooves | 360 c |
| L1129 | Coupures de clic (gap) | 339 c |
| L752 | Claves | 331 c |
| L989 | Archet (syntaxe) | 293 c |

Les hints < 300 c (ex. swing L698, parcours L1093, routines L1194) restent tels quels — ils
tiennent en 2–3 lignes à l'écran.

### 3.2 Listes au lieu d'énumérations

Dans les blocs repliés « En savoir plus », les énumérations à « · » (ex. syntaxe archet,
syntaxe routines) deviennent des `<ul>` compactes. Pas de mini-schémas dans cette salve
(reporté : effort disproportionné pour du fichier unique, à réévaluer en 0.7.0 atelier/exports).

### 3.3 i18n

- Chaque chaîne FR découpée doit être **déplacée à l'identique** dans les dictionnaires EN et PT
  (correspondance exacte des chaînes — contrainte verrouillée par la recette 0.6.6, bloc 7.x).
- Nouvelles clés : « Débutant ? Laisse-toi guider », « Plus tard », « Une section à la fois »,
  « En savoir plus » (+ les phrases clés/reste des 8 hints découpés).
- La recette 0.6.7 reprend le verrou de parité (pas de clé orpheline, pas de clé manquante).

## 4. Recette headless (`recette-onboarding-0.6.7.js`)

Suite jsdom dédiée, sur le modèle de `recette-ux-0.6.6.js` :

1. **Amorçage** : build = 0.6.7, aucune erreur au chargement.
2. **C1 bandeau** : présent quand localStorage vierge ; « Plus tard » → masqué +
   `fm-metro-onboard-dismissed` ; absent si `fm-metro-play` existe ; absent si
   `fm-metro-wizard-done` ; « ✦ Guide-moi » du bandeau ouvre le wizard ; terminer le wizard
   masque le bandeau ; reset C8 → le bandeau réapparaît.
3. **C1 mode focus** : décoché par défaut ; coché → ouvrir une section ferme les autres ;
   clic sommaire C6 en mode focus → une seule section ouverte ; persistance
   `fm-metro-focus-mode` ; décocher rétablit l'indépendance des sections.
4. **C9** : les 8 hints cibles ont une phrase clé visible + un `details.hint-more` ;
   le contenu total (phrase + replié) couvre l'intégralité du texte 0.6.6 (aucune perte) ;
   les `<ul>` attendues existent.
5. **i18n** : parité FR/EN/PT des nouvelles clés, zéro orpheline (reprise du bloc 7.x).

Non-régression : **les 14 suites existantes** (398 + 48) doivent rester vertes contre le
build 0.6.7 avant merge.

## 5. Hors périmètre (reconduit)

- Mini-schémas illustratifs (C9, reporté).
- Réouverture automatique du wizard (contredit la passe 4.1).
- C3 mobile/tactile (salve 0.6.8), C4/C10 accessibilité+i18n (0.6.9), C11–C14 (0.7.0).
- Limites i18n 0.6.6 (`confirm()` + « · muet ») : inchangées, à résorber en 0.6.9.
- Congas/bongos/shaker : toujours hors périmètre.

## 6. Livraison

- `index.html` build `metronomefunk-0.6.7` (fichier complet, jamais un patch).
- `recette-onboarding-0.6.7.js` ajoutée au dépôt.
- README : entrée journal + build courant.
- PR vers `main` après batterie complète verte (14 suites + la nouvelle).

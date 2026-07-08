# Métronome — Spécification passe 4 : « Je joue »

**Statut : VALIDÉE le 2026-07-08 (toutes questions tranchées).**
**Principe : l'interface s'organise par l'usage, plus par les modules.**

---

## 1. Le renversement

Aujourd'hui l'écran empile des modules (focal, répertoire, team spirit, exercices) ; l'utilisateur
navigue entre eux. Après la passe 4, l'écran répond à deux questions puis montre **une seule
chose** : ce que je dois jouer, séquentiellement.

**Setup — écran d'accueil (2 choix) :**
1. On joue : **seul** / **à plusieurs** (N joueurs)
2. **Apprentissage** : oui / non

Affiché au premier lancement (aucun état sauvegardé) puis mémorisé ; rouvrable à tout moment
par un bouton **⟲ Setup** de l'écran de jeu.

**Écran de jeu (le mode simple, recomposé) :** mes briques défilantes en grand, le reste sonne
en accompagnement. Tout l'existant reste accessible derrière un bouton **Configurer** (l'actuel
mode expert, inchangé).

---

## 2. État

```
S.play = {
  who:   'solo' | <participantId> | 'tous',   // qui je suis
  learn: false,                                // mode apprentissage
  learnPaused: false                           // pause de l'ajout (mémorisation)
}
```
Persisté dans `localStorage` (`fm-metro-play`), restauré au chargement.

---

## 3. Écran de jeu

### 3.1 En-tête minimal
Tempo, start/stop, tap tempo, sélecteur **« Je suis : [Solo | Participant 1…N | Tous] »**,
**⟲ Setup** (rouvre l'écran d'accueil), **Configurer**. Le choix seul/à plusieurs et
l'apprentissage vivent dans l'écran d'accueil, pas dans la barre.

### 3.2 Briques en grand (mode « player » de `percLineRender`)
- **Mes voix** : briques pleine couleur, hauteur double, **main D/G inscrite dans la brique**
  (si sa largeur le permet ; sinon au-dessus). Doigté = `tsHandsMerged` de mes voix (fusionné,
  passe 3 rév. 07-08).
- **Backing** (tout le reste, y compris lignes écartées) : briques atténuées (opacité ~0.25),
  togglables par une case « voir l'accompagnement ». L'audio du backing joue toujours.
- Curseur temps réel existant, légende réduite à mes voix.
- Sans groove du répertoire chargé, « ma ligne » = les voix du focal (comportement actuel
  conservé : l'écran de jeu fonctionne aussi pour un groove édité à la main).

### 3.3 Seul / à plusieurs
- **Seul** : `who='solo'` — mes voix = tout ce qui est jouable par un joueur ; au premier
  passage, l'app propose « Répartir selon priorités » à 1 joueur (questionnaire existant) ;
  le reste part en backing.
- **À plusieurs, chacun son téléphone** : chaque appareil ouvre la même page (GitHub Pages),
  charge le **même groove**, indique le **même nombre de joueurs** et le **même classement** —
  la répartition (`tsWizDistribute`) est **déterministe**, donc identique partout. Chacun
  choisit ensuite « Je suis Participant X ». Pas de synchronisation réseau (hors périmètre,
  fichier autonome) : départ au décompte, humain.
- **À plusieurs, un seul appareil** : le sélecteur « Je suis » commute à la volée ;
  « Tous » affiche toutes les lignes en pleine couleur (vue chef d'ensemble).

### 3.4 Ce qui ne change pas
Moteur audio, répertoire, questionnaire, éditeur focal, micro-timing, séquences, exports,
vérificateur de doigtés : intacts, dans Configurer.

---

## 4. Apprentissage (sur MA ligne)

Généralisation de l'**ajout progressif** existant, du focal vers la phrase fusionnée du joueur.

- **Cible** : la fusion de mes voix, doigtée par `tsHandsMerged`.
- **Règle d'ajout** : celle du module actuel (une frappe à la fois, ancres d'abord), appliquée
  à la ligne fusionnée ; cadence « toutes les N mesures » + boutons ← → conservés.
- **⏸ Pause de mémorisation** (nouveau, demandé) : un bouton fige l'ajout — le groove continue
  de tourner à l'état courant pendant que je mémorise ; « reprendre » relance l'ajout. État
  `learnPaused`, visible (bouton enfoncé + libellé « ajout figé »).
- **Audio** : ma ligne sonne selon son état construit + backing complet (contexte). Case
  « couper ma ligne (je la joue) » pour s'exercer en vrai.
- Appel-réponse sur ma ligne : **passe ultérieure** (noté, pas dans le périmètre 4).

---

## 5. Découpe en étapes (une étape = une session)

| Étape | Contenu | Recette |
|---|---|---|
| **4.1** | Setup 2 choix, écran de jeu, briques mode player (mes voix en grand + mains dans les briques, backing atténué togglable), sélecteur « Je suis », persistance `S.play` | headless : légende/briques filtrées selon `who` ; mains inscrites = `tsHandsMerged` ; bascule backing ; restauration localStorage |
| **4.2** | Apprentissage : ajout progressif sur ligne fusionnée + pause de mémorisation + « couper ma ligne » | headless : la ligne croît d'une frappe par période ; pause fige ; reprise relance ; ordre d'ajout conforme à la règle existante |
| **4.3** | Multi-appareils : vérification du déterminisme de la répartition (test : même entrée → mêmes lignes), encart d'aide « jouer à plusieurs », polissage mobile (césure 8+8 des grilles) | test de déterminisme sur les 28 grooves ; revue visuelle Android |

Livraison : fichier complet à chaque étape, entrée datée au journal, jamais de patch.

---

## 6. Points tranchés

**Session du 08-07 :**
- Vue séquentielle : **briques défilantes en grand** (pas la grille).
- À plusieurs : **les deux** modes d'appareil (chacun le sien / un seul).
- Apprentissage : **ajout progressif d'abord**, avec **pause de mémorisation** ; appel-réponse plus tard.
- Répartition et doigté : réutilisation stricte de l'existant (`tsWizDistribute`, `tsHandsMerged`), aucune nouvelle logique musicale.

**Sur maquette (passe4-questions.html), même session :**
- Setup : **écran d'accueil** au premier lancement, mémorisé, rouvrable via ⟲ Setup (option A).
- Vue « Tous » : **mains D/G inscrites dans les briques** de chaque joueur (option A).

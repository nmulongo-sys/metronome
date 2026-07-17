# Métronome — R-5 salve P1 : les 3 gestes qui éteignent 3 majeurs — spécification courte

> **Statut : GO de Jean (17/07) — « salve P1 (3 gestes à effort faible = 3 majeurs éteints) ».**
> Base : `main` = `321f4b7` (merge #32, 0.17.0, prod vérifiée). Build cible : **0.18.0**.
> Source : plan d'action de la synthèse portail R5-4
> (`panel-ux-0.17.0-synthese-portail.html`), ligne **P1**.

## Cadre invariant (rappel)
- Moteur `moteur/*.js` **verbatim** (md5 == 0.10.0) ; salve **zéro moteur** (seule
  ligne tolérée : `BUILD`). Tolérances de comparaison inchangées.
- Livraison **fichiers complets** ; pas de build ; batterie clean-room + navigateur
  réel deux modes avant PR ; **Jean merge lui-même** ; rapport joint.

## Les 3 gestes

### P1-a (M2) — « Par où commencer ? » sur pratiquer.html
Bandeau discret en tête de page (après le `<header>`, avant `.top`) :
- une ligne « Nouveau ici ? Un accompagnement en un clic, puis appuie sur ▶. » ;
- un bouton **« ▶ Premier accompagnement »** qui, via les points d'ancrage
  EXISTANTS de l'UI : `setFamily('bin')` ; `percSetInstr('djembe')` (remplit le
  groove de base authentique — la fonction du sélecteur d'instrument) ;
  `S.perc.on = true` + case `percOn` cochée + `percInstr` synchronisé ; ouvre et
  fait défiler jusqu'à `#secPerc` ; démarre la lecture si à l'arrêt ;
- un **× discret** qui masque le bandeau et le retient
  (`localStorage['fm-metro-pratiquer-guide']='off'`) — respecte le ton « rien
  d'imposé » ; réaffichable seulement en vidant l'état (pas de rouverture UI, hors
  périmètre). Le bandeau ne se montre pas si l'état est `'off'`.
- **Zéro architecture touchée** : aucune section modifiée, le bandeau est additif.
- i18n : clés FR→EN→PT ajoutées aux dictionnaires de pratiquer.

### P1-b (M3) — modale de compte traduite sur pratiquer.html
Reprendre les **20 clés compte** posées sur apprendre en R-5, EN et PT, dans les
dictionnaires de pratiquer (la modale vient de `coquille/fm-compte.js` verbatim,
traduite par le marcheur i18n — il ne manque que les clés). Traductions
**identiques** à apprendre (cohérence inter-pages). Les préfixes composés du
verbatim (`'Erreur : '+msg`, `'Échec : '+…`) restent FR — même dette assumée que
partout, `fm-compte.js` est intouchable.

### P1-c (M1 court terme) — avis « leçons en FR » sur apprendre.html
Une ligne discrète sous le `.hint` du parcours, **visible seulement quand la langue
active ≠ FR** : « Les leçons (objectif, consigne, critère) sont pour l'instant en
français ; le reste de la page suit ta langue. » (EN/PT). Un `<p id="pfLangNote">`
masqué par défaut (`hidden`), révélé au chargement si `localStorage['fm-lang']`
∈ {en, pt}. Traite la CAUSE VISIBLE (l'utilisateur sait que c'est un choix, pas un
bug) — **pas** le corpus (transverse « principes en corpus », hors salve).

## Recette
- `recette-pratiquer.js` : bandeau présent + masquable (persistance) ; le bouton
  pose djembé + groove de base (`percGrids.basse` non vide), coche `percOn`, ouvre
  `#secPerc` ; **20 clés compte** présentes EN et PT (symétrie) + une bascule PT
  vérifiant qu'une chaîne de la modale est traduite.
- `recette-apprendre.js` : `#pfLangNote` présent, `hidden` en FR, révélé + traduit
  en `?lang=pt` ; clés de l'avis dans les dictionnaires.
- BUILD 0.18.0 asserté (accueil/apprendre/pratiquer/extraction suivent la ligne
  vivante).

## Hors salve (rappel, non fait ici)
M4 (français d'abord dans les sous-titres des tiroirs) = P2 ; continuité tempo,
volume sur apprendre, annonces situées, etc. = P2/P3 ; corpus traduit + R-6 =
chantiers propres. La salve P1 ne touche QUE M2, M3 et M1-court-terme.

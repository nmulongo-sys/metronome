# Cours Funk — brief de reprise (après grille + maquette animation + lot 1)

> À coller en tête du nouveau fil pour resynchroniser le contexte.
> Corpus et sources dans Drive → dossier « cours funk » :
> - corpus-gestes.md : https://drive.google.com/file/d/1hNsUZxpNf3SYm1_iocRvH7rSZPf3pXGw/view
> - corpus-musicalite-funk.md : https://drive.google.com/file/d/1fkyq7W4T1SOdiXtPt8lEVD5jvefN1w2G/view
> - sources.md : https://drive.google.com/file/d/1Y37L8I7PAaxtl9jMn7w4pjFAqda7C2Wm/view
>
> Dépôt : `nmulongo-sys/metronome`, branche `claude/funk-percussion-course-tceiu8` (base `metronomefunk-0.5.4`), **PR #12 ouvert** : https://github.com/nmulongo-sys/metronome/pull/12

## Le projet

Outil pédagogique de percussion cajón + djembé : deux parcours funk à 4 niveaux, exercices générés par fm-metro. Livraison : HTML autonome, offline, mobile-first, FR, GitHub Pages. Langue de travail : français. État : **spec de la grille rédigée, direction visuelle de l'animation validée sur maquette, lot 1 d'exercices livré** — le tout en PROPOSITION sur le PR #12, en attente de validation humaine.

## Décisions actées (cette session, en plus des acquis antérieurs)

- **Grille des parcours** : `cours-funk-grille-spec.md` — pour chaque parcours × niveau : gestes introduits / consolidés, principes FUNK-*, 18 schémas d'exercice par parcours (E1–E18 cajón, F1–F18 djembé). Symétrie niveaux 1–2, divergence 3–4 (DJ-X* mandingues vs cimbalette/étendues). Volumétrie : 1–3 instances par schéma, ~80–100 exercices au total.
- **Cimbalette = montée sur la tapa** (type Pearl Jingle Cajon, on/off mécanique) : CJ-G5 = frappe zonée dans la région des jingles ; indépendance cimbalette = niveau Avancé. TRANCHÉ.
- **Vocalisation = par défaut, personnalisable** : chaque exercice N1–N2 porte une vocalisation classique (syllabique cajón / Gun-Go-Pa djembé) ; personnalisation dans les réglages, stockée en localStorage (`fm-funk-vocal`), jamais côté serveur. TRANCHÉ.
- **Schéma de données d'exercice** (spec §3) : `id` stable à vie, `niveauOrigine` ≠ `niveau` courant (la promotion ne touche que `niveau`), `pattern` = grilles 16 pas par voix (une voix = un geste, dyn F/mf/ghost, swing, gap), critère observable jamais chiffré en ms, `feel` réservé au tier Artiste (direction, jamais cible).
- **Promotion « trop difficile »** (spec §4, proposé) : ratio ≥ 40 % avec dénominateur = utilisateurs ayant travaillé l'exercice, échantillon min 25, plafond Artiste, compteurs remis à zéro après promotion, pas de rétrogradation auto, file offline. Supabase : `pn_funk_votes` / `pn_funk_vues`.
- **Animation du geste** (spec §3 bis, validée sur maquette interactive) : boucle au ralenti **générative** (Canvas 2D, pilotée par `pattern` — aucune vidéo, aucun asset par exercice). Style hologramme fil de fer : cajón ambre, djembé cyan, halo shadowBlur, maillage estompé vers le loin. **Vue subjective du joueur pour les DEUX instruments** : tapa en plongée (arête proche en bas de l'image), peau du djembé vue de dessus ; zones épousant le plan (perspective). Mains = silhouettes fines translucides (contour lumineux, remplissage ~14 %), doigts suggérés, cassure du poignet, **pouces toujours côté interne**. Main levée = plus grande + doigts ramenés. Syllabe qui s'allume à la frappe. Ralenti ×0,15–×1, mini-synthèse Web Audio. **Pas de synchro fine avec le séquenceur** (boucle autonome).
- **Lot 1 livré** : `cours-funk-exercices-debutant.json` — 16 exercices Débutant (2 par schéma, E1–E4 / F1–F4), chaînes de prérequis closes, swing/gap/feel à null (binaire strict au N1), validation mécanique Node OK (IDs, grilles, corpus, prérequis, non-superposition).

## Faits & contraintes

- **Établi** : PR #12 = 3 commits de contenu (spec grille, section animation, lot 1) sur la base 0.5.4 intacte. Aucun code applicatif touché.
- **Établi** : maquette d'animation (jetable, HORS dépôt) publiée en artifact : https://claude.ai/code/artifact/1287c08c-2d4d-4a8c-b9c6-6066bd8869a7 — v4 : deux scènes (sélecteur Cajón/Djembé), vue subjective, mains hologrammes, vocalisation, son, ralenti réglable. Vérifiée par captures headless (Playwright/Chromium), zéro erreur JS.
- **Établi** : les critiques visuelles de Jean ont été traitées : rupture de perspective (zones plaquées) corrigée par la vue subjective + transformation perspective ; mains « gants de caoutchouc, pouces extérieurs » corrigées (silhouette fluide, pouces internes) ; néon plat corrigé (hiérarchie d'alpha, contours lumineux).
- **Estimé / à confirmer** : la grâce du rendu v4 reste à confirmer par Jean sur appareil réel ; les valeurs fines (proportions mains, ×0,30 par défaut, densité du maillage) se verrouilleront au portage dans l'app.

## Questions à ne pas reposer (déjà tranchées)

- Un ou deux parcours ? → Deux, parallèles. Quatre niveaux : Débutant/Intermédiaire/Avancé/Artiste.
- Cimbalette réelle ? → **Montée sur la tapa** (tranché ce jour).
- Vocalisation ? → **Par défaut + personnalisable dans les réglages** (tranché ce jour).
- Point de vue de l'animation ? → **Vue subjective du joueur pour les deux instruments** (djembé vu de dessus, cajón tapa en plongée). Pouces côté interne, toujours.
- Synchroniser l'animation au séquenceur ? → **Non** : boucle visuelle autonome, échelle de temps simple.
- Vidéos ou assets par exercice ? → Non : rendu génératif depuis `pattern`.
- Seuil de difficulté ? → ≥ 40 % « trop difficile » ⇒ +1 niveau (détails spec §4).
- Langue / livraison ? → FR ; HTML autonome, offline, mobile-first, GitHub Pages.
- Workflow ? → Spec avant code ; proposition avant exécution ; une étape par session ; fichier complet jamais des patches ; corpus gestes figé ; congas/bongos/shaker hors périmètre ; moteur fm-metro.

## Points ouverts

- **Validation du PR #12** par Jean (spec + §3 bis + lot 1) : merger ou retoucher. Rien n'est mergé.
- **PROCHAINE ÉTAPE (annoncée)** : spec d'implémentation — mapping `pattern` → moteur fm-metro (percGrids, métronome, animation du geste) et **forme de livraison** (page HTML autonome du cours vs section de `index.html`). Non commencée.
- Lots suivants : exercices N2–N4 (E5–E18, F5–F18), 1–3 instances par schéma.
- Implémentation de la promotion 40 % : tables Supabase `pn_funk_votes`/`pn_funk_vues`, RLS, identifiant anonyme local, file offline.
- Champ optionnel `anim` du schéma : à spécifier seulement si des cas ambigus apparaissent (cimbalette, mains non standard).
- Danielsen, *Presence and Pleasure* : à dépouiller si l'écriture des exercices Artiste (FUNK-P1–P4) le réclame.

## Fichiers / livrables produits

Sur la branche `claude/funk-percussion-course-tceiu8` (PR #12) :

- `cours-funk-grille-spec.md` — grille des deux parcours, schéma de données (§3), animation du geste (§3 bis), promotion 40 % (§4). Statut PROPOSITION.
- `cours-funk-exercices-debutant.json` — lot 1 : 16 exercices Débutant, conventions documentées dans `meta`.
- `cours-funk-brief-reprise.md` — ce document.

Hors dépôt : maquette d'animation (artifact, lien plus haut) ; corpus et sources sur Drive (liens en tête).

## Reprise

- **Titre suggéré du nouveau fil** : « Cours Funk — spec d'implémentation : moteur d'exercices fm-metro + animation du geste »
- **Action** : ouvrir un nouveau fil, coller ce brief en premier message. Première décision à prendre : page HTML autonome dédiée au cours, ou section dans `index.html`.

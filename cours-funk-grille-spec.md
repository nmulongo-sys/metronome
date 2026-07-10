# Cours Funk — grille des parcours & schéma d'exercice (spec)

**Statut : PROPOSITION — à valider avant tout code.**
Date : 2026-07-10. Corpus de référence : `corpus-gestes.md` (v0.1, IDs CJ-/DJ-/TR-) et `corpus-musicalite-funk.md` (IDs FUNK-*), Drive → « cours funk ».

## 0. Rappel du cadre (acté, ne pas rouvrir)

- Deux parcours parallèles : **cajón funk** et **djembé funk** (le djembé n'est pas un décalque du cajón — réf. Weedie Braimah, FUNK-I4).
- Quatre niveaux : **Débutant / Intermédiaire / Avancé / Artiste** (tiering McCallum + tier Artiste).
- Funk = intermédiaire chez McCallum ⇒ notre niveau Débutant *du parcours funk* sert à acquérir les prérequis (ghosts, dynamique, backbeat) sur matière funk simple.
- Chiffres micro-timing (ms, %) = direction/plage de feel, jamais cible à quantifier (FUNK-P4).
- Moteur : fm-metro (grilles de pas, swing des 16es, machine gap, drop-outs, basse funk générative passe 5).
- Feedback : un exercice jugé « trop difficile » par ≥ 40 % monte d'un niveau (§4).

## 1. Décisions intégrées dans cette spec (tranchées ce jour)

1. **Cimbalette = montée sur la tapa** (type Pearl Jingle Cajon : jingles fixés, levier on/off mécanique). Conséquences :
   - CJ-G5 = **frappe zonée** dans la région des jingles (accent qui « allume » le métal) — pas un geste de main libre ni de pied.
   - CJ-M5 = étouffement des jingles par la main non dominante.
   - L'indépendance cimbalette (choisir quelles frappes activent le métal, dans le flux) reste **niveau Avancé** ; la découverte on/off et l'accent zoné entrent dès l'Intermédiaire.
2. **Vocalisation : proposée par défaut, personnalisable.** Chaque exercice Débutant/Intermédiaire embarque une vocalisation « classique » par défaut — **syllabique** côté cajón (mot de 4 syllabes = groove, méthode Guia de Ritmos BR), **phonétique Gun-Go-Pa** côté djembé. Un réglage utilisateur permet de la personnaliser (éditer les syllabes) ou de la masquer ; la personnalisation est stockée **localement** (localStorage), jamais côté serveur. Aux niveaux Avancé/Artiste la vocalisation devient facultative (présente si pertinente, jamais requise).

## 2. La grille — parcours × niveau = {gestes} × {principes} → schémas d'exercice

Principe de construction : à chaque niveau, une colonne **gestes introduits** (nouveaux), une colonne **gestes consolidés** (acquis avant, réutilisés sous contrainte nouvelle), une colonne **principes funk travaillés**, et les **schémas d'exercice** (gabarits que fm-metro instancie en exercices ad hoc). Les transversaux TR-1/TR-2 (posture, relâchement) et TR-5 (échauffement) courent sur tous les niveaux et ne sont pas répétés.

### 2.1 Parcours CAJÓN FUNK

| Niveau | Gestes introduits | Gestes consolidés | Principes funk | Schémas d'exercice |
|---|---|---|---|---|
| **1 Débutant** | CJ-G1 (grave), CJ-G2 (aigu), CJ-G3 (slap catapulte), CJ-M1 (ghost), CJ-M4 (dynamique) | — | FUNK-T1 (The One), FUNK-B1 (backbeat 2&4), FUNK-T2 (grille de 16es, tempo lent, en 8es puis 16es) | E1 Ancrage sur le One · E2 Backbeat 2&4 · E3 Nappe de ghosts · E4 Groove socle (kick/snare transposé) |
| **2 Intermédiaire** | CJ-M2 (press tone), CJ-M3 (mute), CJ-G4 (bass discret), CJ-O5 (ghost grave), CJ-G5 (accent cimbalette zoné, on/off) | G1–G3, M1, M4 en contexte 16es continu | FUNK-T2 (nappe « sans repos »), FUNK-B3 (syncope du grave), FUNK-D1 (placements types « a » avant 2, « e » de chaque temps), FUNK-D2 (jeu linéaire), FUNK-B4 (non-interférence) | E5 Grave syncopé autour du One · E6 Ghosts aux placements types · E7 Linéaire sans superposition · E8 4e voix métal (accents cimbalette sur 2&4) · E9 Groove dans le trou (machine gap : tenir la nappe pendant le silence du clic) |
| **3 Avancé** | CJ-O1 (flam), CJ-O2 (drag), CJ-O3 (finger roll), CJ-O4 (rumble), CJ-E1 (heel-toe), CJ-E4 (combined strike), CJ-M5 + indépendance cimbalette | tout le socle, aux tempos funk réels | FUNK-T3 (swing des 16es ~54–60 %, feel), FUNK-B2 (backbeat déplacé), FUNK-D3 (fills/ponctuation), FUNK-D4 (flam densité), FUNK-R1 (3-contre-2), FUNK-R2 (ombre de la clave : tenir la clave d'une main, varier de l'autre) | E10 Swing calé sur la basse (swingFollow 5.4) · E11 Backbeat migré · E12 Fills de liaison (roll/rumble) · E13 Clave tenue main faible · E14 Indépendance métal (mêmes frappes, cimbalette sélective) |
| **4 Artiste** | CJ-E2 (foot slide), CJ-E3 (rods/brushes), TR-3 (laid-back/pushed), TR-4 (swing feel) | tout, sous contrainte de feel | FUNK-P1–P4 (pocket, tolérance perceptive), FUNK-I1 (hocketing chicken scratch), FUNK-I2 (verrouillage basse — la basse générative 5.x est le partenaire), FUNK-R3 (syncope perpétuelle), FUNK-I4 (voix conversationnelle) | E15 Poche contre basse générative (grave laid-back sur basse pushed) · E16 Hocketing (répondre sur « a » quand l'ostinato accentue « e ») · E17 Drop-out expressif (re-entrée sur le One, moteur 5.4) · E18 Conversation (question/réponse improvisée sur cycle) |

### 2.2 Parcours DJEMBÉ FUNK

| Niveau | Gestes introduits | Gestes consolidés | Principes funk | Schémas d'exercice |
|---|---|---|---|---|
| **1 Débutant** | DJ-G1 (bass), DJ-G2 (tone), DJ-G3 (slap), DJ-G5 (rebond « open », fondateur), DJ-M1 (ghost) | — | FUNK-T1 (The One = bass), FUNK-B1 (backbeat tone/slap 2&4), FUNK-T2 (grille 16es, progressif) | F1 Ancrage bass sur le One · F2 Backbeat tone-slap · F3 Nappe touches/ghost · F4 Groove socle Gun-Go-Pa |
| **2 Intermédiaire** | DJ-M2 (muffled slap), DJ-M3 (muffled par slip), DJ-M4 (tone/bass pressé), DJ-O3 (down-up), DJ-O5 (roulade alternée R/L) | G1–G3, G5, M1 en 16es continues | FUNK-T2, FUNK-B3 (bass syncopé), FUNK-D1, FUNK-D2 (linéaire sur trame O5), FUNK-B4 | F5 Bass syncopé autour du One · F6 Ghosts placements types · F7 Trame alternée sans superposition · F8 Palette étouffée (muffled = ghost timbré) · F9 Groove dans le trou (machine gap) |
| **3 Avancé** | DJ-O1 (flam), DJ-O2 (roll tonnerre/ronronnement/feu), DJ-O4 (doubles, 3-/4-stroke), DJ-G4 (3e slap/tonpalo), DJ-X1 (accompagnement stable), DJ-X2 (appel/call) | tout le socle aux tempos réels | FUNK-T3 (swing 16es), FUNK-B2, FUNK-D3, FUNK-D4, FUNK-R1 (3-contre-2), FUNK-R2 (clave d'une main), FUNK-I3 (call-and-response, natif djembé) | F10 Accompagnement sans dérive (X1 long) · F11 Appel funk (X2 comme pickup vers le One) · F12 Fills roll · F13 Clave tenue main faible · F14 3-contre-2 convergence alignée |
| **4 Artiste** | DJ-X3 (chauffe), DJ-X4 (morphing solo), DJ-X5 (dynamique du solo), TR-3/TR-4 | tout, sous contrainte de feel | FUNK-P1–P4, FUNK-I2 (verrouillage basse générative), FUNK-I4 (tambour = voix de lead, Braimah — sortir du rôle kick/snare imité), FUNK-R3 | F15 Poche contre basse générative · F16 Chauffe funk (montée codifiée sur groove) · F17 Morphing solo depuis l'ancre (X4 : écart progressif, retour) · F18 Le djembé qui parle (conversation lead, appel/réponse improvisé) |

**Notes de grille**
- Les schémas E9/F9 et E17 réutilisent des acquis moteur existants (machine gap, drop-outs 5.4) ; E15/F15 la basse générative de la passe 5. Aucun développement moteur supposé à ce stade — c'est un mapping, à confirmer à l'étape d'implémentation.
- Symétrie assumée niveaux 1–2 (mêmes principes, gestes propres à chaque instrument) ; divergence croissante aux niveaux 3–4 (X* mandingues côté djembé, cimbalette/extended côté cajón) — c'est là que le djembé cesse d'être un décalque.
- Volumétrie cible : **1 à 3 instances par schéma**, soit ~8–14 exercices par niveau et par parcours, ~80–100 exercices au total. Ajustable après premier montage.

## 3. Schéma de données d'un exercice

```json
{
  "id": "CAJ-2-E6-01",
  "parcours": "cajon",
  "niveauOrigine": 2,
  "niveau": 2,
  "schema": "E6",
  "titre": "Ghosts sur le « a » avant 2",
  "objectif": "Placer des ghosts aux positions types sans casser le backbeat.",
  "gestes": ["CJ-M1", "CJ-G3", "CJ-G1"],
  "principes": ["FUNK-D1", "FUNK-B1"],
  "prerequis": ["CAJ-1-E2-01"],
  "pattern": {
    "voix": [
      { "geste": "CJ-G1", "grille16": "1000000000000000", "dyn": "F" },
      { "geste": "CJ-G3", "grille16": "0000100000001000", "dyn": "F" },
      { "geste": "CJ-M1", "grille16": "0001000100010001", "dyn": "ghost" }
    ],
    "mesures": 2,
    "swing": null,
    "gap": null
  },
  "tempo": { "min": 60, "conseille": 84, "max": 104 },
  "critere": "4 cycles consécutifs : backbeat net, ghosts audibles mais jamais confondus avec les accents.",
  "vocalisation": { "systeme": "syllabique", "defaut": "fun-ky-drum-mer" },
  "feel": null
}
```

Contraintes de champ :
- `id` = `{PARCOURS}-{niveauOrigine}-{schéma}-{nn}` — stable à vie, **ne change pas quand l'exercice est promu** (la promotion modifie `niveau`, jamais `id` ni `niveauOrigine`).
- `gestes` / `principes` : IDs des deux corpus, seuls référentiels admis. Un exercice référence 1–4 gestes et 1–2 principes (au-delà, le découper).
- `pattern` : abstraction cible pour fm-metro — grilles de 16 pas par voix (une voix = un geste), dynamique par voix (`F`/`mf`/`ghost`), `swing` (nombre 50–62 ou `null` = binaire strict), `gap` (objet options machine gap ou `null`). Le mapping exact vers `percGrids`/`percMeta` se fait à l'étape d'implémentation ; si un schéma ne se laisse pas exprimer (ex. E14 indépendance cimbalette), on étend `pattern`, pas le moteur, tant que possible.
- `critere` : observable et auto-évaluable par l'élève, jamais chiffré en ms.
- `feel` : `null` sauf tier Artiste — `{ "direction": "laid-back" | "pushed", "note": "…" }`. Direction, jamais cible (FUNK-P4).
- `vocalisation` : `systeme` = `"syllabique"` (cajón) ou `"gun-go-pa"` (djembé) ; `defaut` = la vocalisation classique livrée. La personnalisation utilisateur vit dans `localStorage` (`fm-funk-vocal`, clé = `id` d'exercice) et n'est **pas** dans ce schéma. `null` autorisé aux niveaux 3–4.

## 3 bis. Animation du geste (boucle au ralenti) — direction validée sur maquette

Décisions du 2026-07-10, validées sur maquette interactive (maquette jetable, hors dépôt) :

- Chaque exercice affiche une **boucle du geste au ralenti**, en **rendu vectoriel génératif** (Canvas 2D) piloté par le champ `pattern` — aucune vidéo, aucun asset par exercice. Poids : quelques Ko de code une fois pour toutes ; compatible fichier unique, offline, mobile.
- **Style « hologramme fil de fer »** (réf. vidéo fournie par Jean) : cajón ambre, djembé cyan, fond sombre à motifs de circuits, halo `shadowBlur` sur les arêtes et le cerclage, **maillage estompé vers le loin** (hiérarchie d'alpha = profondeur), halo chaud au point d'impact + onde.
- **Point de vue : toujours la vue subjective du joueur assis sur l'instrument** (décision pédagogique). Cajón : tapa en plongée — arête supérieure proche du corps en bas de l'image, compression perspective vers le bas de la tapa ; slap/tone près de l'arête, grave au centre-loin. Djembé : peau vue de dessus, grave au centre, tone/ghost et slap au bord proche. Les zones de frappe **épousent le plan de l'instrument** (transformation perspective, jamais plaquées à plat).
- **Mains : silhouettes fines translucides** — contour lumineux, remplissage quasi transparent (l'instrument reste visible au travers), doigts suggérés par des séparations intérieures (pas de phalanges dessinées), cassure du poignet marquée, **pouces toujours côté interne** (contrainte anatomique explicite). Main levée = légèrement plus grande (plus proche de l'œil) et doigts ramenés ; frappe = extension complète.
- **Vocalisation synchronisée à la boucle** : la syllabe du champ `vocalisation.defaut` s'allume au moment de la frappe (syllabique cajón, Gun-Go-Pa djembé). La ligne de lecture affiche le geste en cours (ID corpus + nom + main + zone).
- **Ralenti** : simple échelle de temps (~×0,15 à ×1) sur une horloge propre à l'animation, avec un mini-rendu sonore des frappes (Web Audio). **Pas de synchronisation fine avec le séquenceur fm-metro** (décision) — la boucle est un support de visualisation du geste, pas un play-along.
- **Données** : une table embarquée geste → {zone, main, type de son}, dérivée du corpus, suffit ; **aucun champ nouveau obligatoire** dans le schéma §3. Un champ optionnel `anim` pourra préciser les cas ambigus (main non standard, zone particulière, cimbalette).

## 4. Logique de promotion « trop difficile » (proposition)

- **Vote** : sur l'écran d'exercice, un seul geste — « Trop difficile pour ce niveau ». Un vote par exercice et par appareil (garde `localStorage` `fm-funk-vote-{id}` ; pas de compte utilisateur).
- **Stockage** : Supabase, table `pn_funk_votes` (`exercice_id text`, `client_hash text`, `created_at timestamptz`), unicité `(exercice_id, client_hash)`. `client_hash` = identifiant anonyme généré localement. En face, `pn_funk_vues` compte les présentations de l'exercice (même granularité), car un ratio exige un dénominateur : **dénominateur = utilisateurs distincts ayant travaillé l'exercice** (au moins une session avec lecture lancée), pas les votants seuls.
- **Règle** : si `votes / travaillés ≥ 40 %` **et** `travaillés ≥ 25`, l'exercice monte d'un niveau (`niveau + 1`, plafond 4 = Artiste). Sous 25 utilisateurs, aucune promotion (échantillon insuffisant).
- **Après promotion** : compteurs remis à zéro (nouveau cycle au nouveau niveau) ; `niveauOrigine` intact ; l'exercice affiche un badge « promu ». Pas de rétrogradation automatique en v1 (une descente = décision éditoriale).
- **Offline** : l'app reste 100 % fonctionnelle sans réseau — votes mis en file locale et envoyés à la prochaine connexion ; les niveaux affichés viennent du dernier état embarqué/synchronisé.

## 5. Points restant ouverts (après cette spec)

- Volumétrie fine par schéma (combien d'instances de chaque E*/F*) — au montage du contenu.
- Mapping `pattern` → moteur fm-metro (réutilisation `percGrids`/gap/basse) et forme de livraison (nouvelle page HTML autonome vs section de `index.html`) — spec d'implémentation dédiée.
- Danielsen, *Presence and Pleasure* : à dépouiller si l'écriture des exercices Artiste (P1–P4) réclame plus de fond.
- Préfixe Supabase définitif (`pn_` supposé ici) et politique RLS des deux tables.

## 6. Prochaine étape proposée

Validation de cette grille → rédaction du **premier lot de contenu** : les exercices Débutant des deux parcours (E1–E4, F1–F4) instanciés au format §3, avec vocalisations par défaut. Puis spec d'implémentation (mapping fm-metro + page de livraison).

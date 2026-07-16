# Métronome — Parcours funk · P-7 + P-8 : peuplement Avancé & Artiste

> **Statut : VALIDÉE — les 6 points §9 tranchés par Jean le 2026-07-16, exécution d'un bloc.**
> Rédigée le 2026-07-16. Base : **main = 0.9.0** (`f22afe1`, architecture corpus R-2).
> Sources : **cartographie P-5 VALIDÉE** (`metronome-parcours-funk-P5-cartographie.md`, 5 points
> §7 ratifiés) ; gabarit P-2/P-6 (4 atomes + 1 synthèse par module) ; corpus gestes/musicalité.
> **Premier chantier de contenu au format corpus** : tout le peuplement vit dans
> `corpus/funk.js` — zéro ligne de coquille ou de moteur (seul le n° de build change).

---

## 1. Objet et périmètre

Peupler les deux niveaux hauts du parcours funk, conformément à la carte P-5 :

- **Avancé** (`niveau: avance`, infixe `Av`) — 5 modules par parcours : syncope du grave (B3),
  hocketing (I1), ombre de la clave & 3-contre-2 intro (R2), fills & ornements (D3, propre),
  module idiomatique propre (cimbalette `CYM` côté cajón, appel manding `CALL` côté djembé).
- **Artiste** (`niveau: artiste`, infixe `Ar`) — 6 modules par parcours : laid-back (P1),
  pushed (P2), la poche (P3), le tambour-voix (I4, **vocalisation fondue ici**, décision P-5
  §7.2), 3-contre-2 maîtrise (R1, module autonome, décision P-5 §7.1), idiomatique propre
  (couleur cajón `COL`, solo manding `SOLO`).

**Comptes** : 35 exercices + 10 modules (Avancé) ; 35 exercices + 12 modules (Artiste) ;
soit **70 exercices / 22 modules** ajoutés → corpus funk : 112 exercices, 34 modules ;
app entière : **152 exercices, 44 modules**.

**Ce qui change** : `corpus/funk.js` (exercices, modules, `niveaux.avance`/`artiste`) ;
`index.html` : uniquement `BUILD = 'metronomefunk-0.10.0'`. **Ce qui ne change pas** : coquille,
moteur, socle-technique, i18n (nouvelles chaînes FR affichées telles quelles pour EN/PT tant que
la traduction P-2→P-8 n'est pas faite — même statut que le Débutant P-6).

## 2. Conventions d'identifiants

- Socle (consigne agnostique du geste) : `EX-SOCLE-<code>-NN` — les codes `B3 I1 R2 P1 P2 P3 I4 R1`
  sont uniques à travers les niveaux, pas d'infixe de niveau nécessaire (même règle que
  l'Intermédiaire ; le `D-` du Débutant levait une ambiguïté qui n'existe pas ici).
- Propres : `EX-CJ-<code>-NN` / `EX-DJ-<code>-NN` (`D3`, `CYM`, `CALL`, `COL`, `SOLO`).
- Modules : `MOD-<CJ|DJ>-<Av|Ar>-<code>` (infixes figés P-5 §7.4).
- **Ordres de niveaux avec codes asymétriques** :
  `avance: ['B3','I1','R2','D3','CYM','CALL']` et
  `artiste: ['P1','P2','P3','I4','R1','COL','SOLO']` — le rendu ignore un code sans module pour
  le parcours affiché (vérifié : `pfRender`, `if (!M) return`), chaque colonne montre donc bien
  ses 5 (resp. 6) modules, l'idiomatique en dernier.

## 3. Presets — vocabulaire fermé, aucun chantier moteur

Tous les presets restent dans le vocabulaire R-2 (`metro`/`tempo`/`subdiv`/`gap` ·
`pattern`/`prog`/`drop`). Deux choix éditoriaux à noter :

- **Laid-back / pushed (P1/P2)** : le moteur n'a pas de paramètre de « feel » — c'est le
  **choix du pattern** qui crée le contraste (la pompe `octaves` pousse naturellement, `theOne`
  pose), et la **consigne** porte le placement. Aucun réglage chiffré (conforme FUNK-P4 :
  principe, jamais réglage). Un **paramètre de feel moteur** (décaler la basse de quelques ms,
  additif) est jouable plus tard au profit de tous les styles — inscrit au §8, hors périmètre ici
  (décision Jean : « ok si ça marche et plus simple », capacité moteur notée pour la suite).
- **Premier emploi du pattern `octaves`** (présent au moteur depuis la passe 5, jamais utilisé
  par un exercice).
- **Progressions ouvertes sur les synthèses Artiste** (décision Jean, §9 pt 4) : `blues` (P1-05,
  R1-05), `mixo` (P2-05), `dorien` (P3-05 — la poche « Chameleon »), `jazzfunk` (I4-05, SOLO-05).
  Les atomes et tout l'Avancé restent sur `vamp1`/`vamp2` (la couleur harmonique est une richesse
  de synthèse, pas une difficulté d'atome).

### 3.1 Tempos — documentation (décision Jean, §9 pt 5)

Ordres de grandeur du funk joué (à l'oreille, repères usuels) : la **zone de croisière est
90–110 BPM** — Cissy Strut ≈ 90, Chameleon ≈ 94, Superstition ≈ 96–100, Funky Drummer ≈ 100,
Sex Machine ≈ 104–108, Cold Sweat ≈ 110 ; au-delà, le funk « uptempo » vit vers 112–118
(Get Up Offa That Thing, What Is Hip?). Les presets `metro` de cette spec (**69–84**) sont des
**tempos d'apprentissage**, volontairement sous la zone de jeu : on installe le geste lentement,
et le tempo est réglable à la main à tout moment (le preset ne verrouille rien). Les presets
`pattern` (basse) ne fixent pas de tempo — comme à l'Intermédiaire, ils respectent le tempo
courant de l'utilisateur. Repère pratique à retenir : **travailler à −20/−30 % du tempo cible,
puis remonter vers 90–110**.

---

## 4. P-7 — AVANCÉ (35 exercices, 10 modules)

### 4.1 `MOD-CJ-Av-B3` / `MOD-DJ-Av-B3` · Syncope du grave *(socle, `EX-SOCLE-B3-*`)*

1. **B3-01** *(atome)* · L'ancrage d'abord — « La basse joue un grave qui bouge autour du 1.
   Toi, pose ton grave exactement sur le 1, imperturbable. » *Critère :* quand le grave mobile de
   la basse ne déplace jamais le tien. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} }`
2. **B3-02** *(atome)* · Le grave anticipé — « Déplace ton grave sur le « et » juste avant le 1,
   et laisse le 1 sonner vide. » *Critère :* quand ton anticipation retombe au même endroit à
   chaque mesure, sans précipiter la suite. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
3. **B3-03** *(atome)* · Le grave retardé — « Retiens ton grave jusqu'au « e » juste après le 1 :
   le temps passe, puis ton grave répond. » *Critère :* quand le retard est un choix audible, pas
   un raté. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **B3-04** *(atome)* · Bouger sans se perdre — « Alterne : une mesure anticipé, une mesure
   retardé. Quand la basse disparaît, garde le cap. » *Critère :* quand la basse revient et que
   ton grave mobile est toujours à sa place. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:2} }`
5. **B3-05** *(synthèse)* · Le grave libéré — « Sur deux accords, promène ton grave autour du 1 —
   anticipé, posé, retardé — sans jamais lâcher l'ancrage. » *Critère :* quand on entend un choix
   à chaque mesure et le même time du début à la fin. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} }`

### 4.2 `MOD-CJ-Av-I1` / `MOD-DJ-Av-I1` · Hocketing / dialogue *(socle, `EX-SOCLE-I1-*`)*

1. **I1-01** *(atome)* · L'espace négatif — « Interdiction de jouer en même temps que la basse :
   ne joue QUE dans ses silences. » *Critère :* quand tes notes et les siennes ne se marchent
   jamais dessus. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
2. **I1-02** *(atome)* · Répondre sur le « a » — « Chaque fois que la basse accentue, réponds sur
   la double-croche juste après, légère et précise. » *Critère :* quand ta réponse tombe si près
   qu'elle semble faire partie de la basse. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} }`
3. **I1-03** *(atome)* · L'ostinato scratch — « Installe un petit motif répété, sec et léger, qui
   se faufile entre les notes de la basse sans jamais grossir. » *Critère :* quand ton motif
   tourne en boucle identique et que la basse reste la voix principale. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **I1-04** *(atome)* · Dialogue sous drop-out — « Continue le dialogue même quand la basse se
   tait : laisse ses espaces vides à leur place. » *Critère :* quand, au retour de la basse, vos
   deux voix s'emboîtent comme si elle n'était jamais partie. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:4} }`
5. **I1-05** *(synthèse)* · La conversation — « Sur deux accords : réponses, ostinato, silences
   assumés. Deux voix qui parlent, jamais en même temps. » *Critère :* quand un auditeur entend
   une seule musique faite de deux voix distinctes. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp2', drop:{on:false} }`

### 4.3 `MOD-CJ-Av-R2` / `MOD-DJ-Av-R2` · Ombre de la clave & 3-contre-2 (intro) *(socle, `EX-SOCLE-R2-*`)*

1. **R2-01** *(atome)* · La cellule 3+3+2 — « Frappe le cycle 3+3+2 en boucle sur le clic : deux
   appuis longs, un court. C'est la clave qui se cache dans le funk. » *Critère :* quand le cycle
   tourne sans que tu comptes. *Preset :* `{ metro:true, tempo:76 }`
2. **R2-02** *(atome)* · La clave d'une main — « Une main tient la cellule 3+3+2, l'autre pose la
   pulsation. Deux étages, un seul joueur. » *Critère :* quand chaque main garde son rôle sans se
   laisser aspirer par l'autre. *Preset :* `{ metro:true, tempo:72 }`
3. **R2-03** *(atome)* · La clave sous la basse — « Tiens la cellule 3+3+2 pendant que la basse
   joue son groove : la structure sous la chanson. » *Critère :* quand la clave reste ton squelette
   même quand la basse syncope. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **R2-04** *(atome)* · 3-contre-2, premiers pas — « Sur deux temps, frappe trois coups égaux.
   Repère le point où tout retombe ensemble, et retrouve-le à chaque fois. » *Critère :* quand le
   point de convergence retombe pile, cycle après cycle. *Preset :* `{ metro:true, tempo:69 }`
5. **R2-05** *(synthèse)* · L'indépendance — « Une main garde la clave, l'autre varie librement
   par-dessus, sur deux accords. » *Critère :* quand la main libre invente sans que la clave
   tremble. *Preset :* `{ pattern:'theOne', prog:'vamp2', drop:{on:false} }`

### 4.4 `MOD-CJ-Av-D3` · Fills & ornements *(propre cajón, `EX-CJ-D3-*`)*

1. **D3-01** *(atome)* · Le flam — « Deux mains presque ensemble, une seule intention : épaissis
   ton accent d'un flam, sans le retarder. » *Critère :* quand le flam sonne comme un seul coup
   plus large, jamais comme deux coups. *Preset :* `{ metro:true, tempo:80 }`
2. **D3-02** *(atome)* · Le finger roll — « Égrène tes doigts sur la tapa, du petit doigt à
   l'index : une rafale courte, régulière, qui coule. » *Critère :* quand la rafale est égale et
   se termine exactement où tu l'as décidé. *Preset :* `{ metro:true, tempo:76 }`
3. **D3-03** *(atome)* · Le rumble — « Fais gronder la caisse : un roulement continu qui enfle et
   s'éteint sur commande. » *Critère :* quand le grondement respire avec toi, sans trou ni
   à-coup. *Preset :* `{ metro:true, tempo:76 }`
4. **D3-04** *(atome)* · Le fill qui annonce — « Fin de mesure : une rafale courte qui vise le 1
   suivant et le fait briller. » *Critère :* quand le fill atterrit pile sur le 1, jamais
   par-dessus. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
5. **D3-05** *(synthèse)* · Orner sans charger — « Groove entier : flams sur les accents, un fill
   toutes les quatre mesures, rien de plus. » *Critère :* quand les ornements soulignent le groove
   au lieu de le recouvrir. *Preset :* `{ pattern:'ghostPendule', prog:'vamp2', drop:{on:false} }`

### 4.5 `MOD-DJ-Av-D3` · Fills & ornements *(propre djembé, `EX-DJ-D3-*`)*

1. **D3-01** *(atome)* · Le flam — « Deux mains presque ensemble sur la peau : épaissis ton accent
   d'un flam, main faible d'abord, sans le retarder. » *Critère :* quand le flam sonne comme un
   seul coup plus large, jamais comme deux coups. *Preset :* `{ metro:true, tempo:80 }`
2. **D3-02** *(atome)* · Doubles & 3-stroke — « Enchaîne les doubles main à main, puis le
   3-stroke : la fin de la cellule doit sonner aussi nette que le début. » *Critère :* quand
   droite et gauche sont indiscernables à l'oreille. *Preset :* `{ metro:true, tempo:76 }`
3. **D3-03** *(atome)* · Les rolls : du tonnerre au feu — « Fais rouler la peau : ronronnement
   doux, tonnerre plein, feu brûlant — trois intensités du même roulement. » *Critère :* quand tu
   passes d'une intensité à l'autre sans casser le roulement. *Preset :* `{ metro:true, tempo:76 }`
4. **D3-04** *(atome)* · Le fill qui annonce — « Fin de mesure : une rafale courte qui vise le 1
   suivant et le fait briller. » *Critère :* quand le fill atterrit pile sur le 1, jamais
   par-dessus. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
5. **D3-05** *(synthèse)* · Orner sans charger — « Groove entier : flams sur les accents, un roll
   toutes les quatre mesures, rien de plus. » *Critère :* quand les ornements soulignent le groove
   au lieu de le recouvrir. *Preset :* `{ pattern:'ghostPendule', prog:'vamp2', drop:{on:false} }`

### 4.6 `MOD-CJ-Av-CYM` · Le 4ᵉ son : la cimbalette *(propre cajón, `EX-CJ-CYM-*`)*

> Cimbalette **montée sur la tapa** (décision corpus confirmée) : les jingles sonnent quand la
> frappe tombe dans leur zone (haut de tapa). Objet du module : **choisir** quand ils parlent.

1. **CYM-01** *(atome)* · Réveiller les jingles — « Frappe dans la zone haute de la tapa : écoute
   la cimbalette s'ajouter à ta frappe, comme une ombre brillante. » *Critère :* quand tu sais,
   avant de frapper, si les jingles vont sonner. *Preset :* `{ metro:true, tempo:80 }`
2. **CYM-02** *(atome)* · Le son propre — « Joue tes tones et slaps à l'écart de la zone : le son
   reste sec, les jingles muets. » *Critère :* quand plus aucun coup ne réveille la cimbalette par
   accident. *Preset :* `{ metro:true, tempo:80 }`
3. **CYM-03** *(atome)* · Choisir — « Alterne à volonté : un slap qui fait chanter les jingles, un
   tone propre juste à côté. Le choix, pas le hasard. » *Critère :* quand chaque coup sonne
   exactement comme tu l'avais décidé. *Preset :* `{ metro:true, tempo:84 }`
4. **CYM-04** *(atome)* · Étouffer de la main libre — « Pose la main libre sur les jingles pour
   les couper au vol : la cimbalette parle, puis se tait sur ordre. » *Critère :* quand
   l'étouffement tombe au moment précis où tu le veux. *Preset :* `{ metro:true, tempo:76 }`
5. **CYM-05** *(synthèse)* · Le backbeat brillant — « Sur le groove, seuls tes slaps du 2 et du 4
   font parler la cimbalette ; tout le reste est sec. » *Critère :* quand la brillance dessine
   exactement le backbeat, rien d'autre. *Preset :* `{ pattern:'theOne', prog:'vamp2', drop:{on:false} }`

### 4.7 `MOD-DJ-Av-CALL` · Appel & call-and-response *(propre djembé, `EX-DJ-CALL-*`)*

1. **CALL-01** *(atome)* · L'appel — « Depuis le silence, lance la phrase d'appel : nette, franche,
   reconnaissable entre mille. » *Critère :* quand ton appel sonne identique à chaque fois, prêt à
   être suivi. *Preset :* `{ metro:true, tempo:80 }`
2. **CALL-02** *(atome)* · L'accompagnement stable — « Tiens le motif d'accompagnement sans le
   varier : c'est le sol sur lequel les autres marchent. » *Critère :* quand ton motif tourne si
   régulier qu'on pourrait l'oublier. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
3. **CALL-03** *(atome)* · Lancer le cycle — « Appel, puis enchaîne l'accompagnement sans trou :
   la phrase ouvre, le motif embraye. » *Critère :* quand la couture entre l'appel et le motif est
   invisible. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **CALL-04** *(atome)* · Répondre — « La basse se tait : c'est son appel. Réponds dans son
   silence, puis rends-lui la parole. » *Critère :* quand ta réponse remplit le vide sans déborder
   sur son retour. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:4} }`
5. **CALL-05** *(synthèse)* · Le cycle complet — « Appel → accompagnement → réponse → appel de
   fin : conduis tout le cycle, sur deux accords. » *Critère :* quand on entend clairement qui
   parle, qui répond, et quand ça se termine. *Preset :* `{ pattern:'theOne', prog:'vamp2', drop:{on:true, everyN:8, lenBeats:4} }`

---

## 5. P-8 — ARTISTE (35 exercices, 12 modules)

### 5.1 `MOD-CJ-Ar-P1` / `MOD-DJ-Ar-P1` · Laid-back *(socle, `EX-SOCLE-P1-*`)*

1. **P1-01** *(atome)* · L'arrière du temps — « Joue ta frappe un cheveu derrière le clic, à
   chaque temps, régulière comme une ombre. » *Critère :* quand le retard est constant — ni
   rattrapé, ni aggravé. *Preset :* `{ metro:true, tempo:84 }`
2. **P1-02** *(atome)* · Derrière sans traîner — « Reste derrière pendant que le clic disparaît
   par moments : à son retour, tu es toujours un cheveu derrière, jamais plus. » *Critère :* quand
   le trou du clic ne t'a pas fait dériver. *Preset :* `{ metro:true, tempo:84, gap:{playN:4, muteM:2} }`
3. **P1-03** *(atome)* · Laid-back sur groove — « Pose ton backbeat derrière la basse : elle
   avance, tu la laisses venir. » *Critère :* quand ton retard donne du poids sans donner du
   retard au morceau. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **P1-04** *(atome)* · Le contraste — « La basse pompe et pousse ; toi, reste assis derrière.
   Deux placements, un seul time. » *Critère :* quand on entend deux feels superposés sans que le
   tempo bouge. *Preset :* `{ pattern:'octaves', prog:'vamp1', drop:{on:false} }`
5. **P1-05** *(synthèse)* · Le poids — « Groove entier laid-back sur deux accords : lourd,
   paresseux en apparence, exact en réalité. » *Critère :* quand ça sonne détendu ET que la fin
   arrive exactement à l'heure. *Preset :* `{ pattern:'octaves', prog:'blues', drop:{on:false} }`

### 5.2 `MOD-CJ-Ar-P2` / `MOD-DJ-Ar-P2` · Pushed *(socle, `EX-SOCLE-P2-*`)*

1. **P2-01** *(atome)* · L'avant du temps — « Joue un cheveu devant le clic, à chaque temps, sans
   jamais accélérer. » *Critère :* quand l'avance est constante et que le clic reste ton maître.
   *Preset :* `{ metro:true, tempo:84 }`
2. **P2-02** *(atome)* · Devant sans courir — « Garde l'avance pendant les trous du clic : à son
   retour, toujours un cheveu devant, jamais deux. » *Critère :* quand le trou du clic ne t'a pas
   fait accélérer. *Preset :* `{ metro:true, tempo:84, gap:{playN:4, muteM:2} }`
3. **P2-03** *(atome)* · L'attaque incisive — « Raccourcis tes sons, durcis l'attaque : chaque
   coup mord le temps par l'avant. » *Critère :* quand l'urgence vient de l'attaque, pas du
   tempo. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **P2-04** *(atome)* · Pousser une basse posée — « La basse est tranquille ; toi, tu presses.
   C'est toi qui crées la tension, elle qui la retient. » *Critère :* quand la tension monte sans
   qu'aucun des deux ne cède sur le tempo. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
5. **P2-05** *(synthèse)* · L'urgence maîtrisée — « Groove entier pushed sur deux accords :
   nerveux, pressant, jamais pressé. » *Critère :* quand ça sonne urgent ET que la fin arrive
   exactement à l'heure. *Preset :* `{ pattern:'syncopeGrave', prog:'mixo', drop:{on:false} }`

### 5.3 `MOD-CJ-Ar-P3` / `MOD-DJ-Ar-P3` · La poche & la tolérance *(socle, `EX-SOCLE-P3-*`)*

1. **P3-01** *(atome)* · La nappe immobile — « Sous la basse, tisse une nappe de ghosts si
   régulière qu'on l'oublie : c'est le plancher de la poche. » *Critère :* quand ta nappe ne
   bouge plus, même quand la basse vit. *Preset :* `{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} }`
2. **P3-02** *(atome)* · Creuser la poche — « Sur la nappe, fais saillir le 2 et le 4 ; tout le
   reste s'efface en dessous. » *Critère :* quand le contraste fort/doux dessine la poche sans
   casser la nappe. *Preset :* `{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} }`
3. **P3-03** *(atome)* · La tolérance — « Explore : glisse légèrement derrière (l'oreille
   pardonne), légèrement devant (elle pardonne moins), puis reviens au centre — attaques douces. »
   *Critère :* quand tu sens la frontière entre « vivant » et « faux » des deux côtés. *Preset :* `{ pattern:'ghostPendule', prog:'vamp1', drop:{on:false} }`
4. **P3-04** *(atome)* · La poche sans témoin — « La basse s'absente : la poche continue, aussi
   creuse, jusqu'à son retour. » *Critère :* quand la basse revient dans TA poche, pas
   l'inverse. *Preset :* `{ pattern:'ghostPendule', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:4} }`
5. **P3-05** *(synthèse)* · Habiter la poche — « Deux accords, nappe vivante, accents qui
   respirent : installe-toi dans la poche et restes-y. » *Critère :* quand on a envie que ça ne
   s'arrête pas. *Preset :* `{ pattern:'ghostPendule', prog:'dorien', drop:{on:false} }`

### 5.4 `MOD-CJ-Ar-I4` / `MOD-DJ-Ar-I4` · Le tambour comme voix *(socle, `EX-SOCLE-I4-*`)* — **vocalisation P-5 §7.2**

1. **I4-01** *(atome)* · Chanter puis jouer — « Chante une courte phrase de deux temps — puis
   rejoue-la sur le tambour, telle quelle, avec ses appuis et ses respirations. » *Critère :*
   quand quelqu'un qui t'a entendu chanter reconnaît la phrase jouée. *Preset :* `{ metro:true, tempo:80 }`
2. **I4-02** *(atome)* · Question, réponse — « Pose une question sur une mesure, réponds-toi sur
   la suivante : deux phrases, deux intonations. » *Critère :* quand on entend la différence entre
   celle qui demande et celle qui répond. *Preset :* `{ metro:true, tempo:80 }`
3. **I4-03** *(atome)* · Parler par-dessus la basse — « Énonce tes phrases dans les espaces de la
   basse : tu ne joues plus un rôle de batterie, tu prends la parole. » *Critère :* quand tes
   interventions sonnent comme une voix, plus comme un kick/snare imité. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
4. **I4-04** *(atome)* · Conduire — « C'est toi qui mènes : élargis la phrase, monte l'intensité,
   puis ramène tout au calme. La basse te suit. » *Critère :* quand la dynamique du morceau
   raconte l'histoire que tu as choisie. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} }`
5. **I4-05** *(synthèse)* · Le chorus parlé — « Un chorus entier : appelle, réponds, conduis,
   conclus — sur deux accords. Le tambour a la parole du début à la fin. » *Critère :* quand on
   pourrait mettre des mots sur ce que tu viens de dire. *Preset :* `{ pattern:'theOne', prog:'jazzfunk', drop:{on:false} }`

### 5.5 `MOD-CJ-Ar-R1` / `MOD-DJ-Ar-R1` · 3-contre-2 & syncope perpétuelle, maîtrise *(socle, `EX-SOCLE-R1-*`)*

1. **R1-01** *(atome)* · Le 3 retrouvé — « Reprends le 3-contre-2 posé à l'Avancé : une main en 3,
   l'autre en 2, jusqu'à l'aisance. » *Critère :* quand tu peux sourire en le faisant. *Preset :* `{ metro:true, tempo:72 }`
2. **R1-02** *(atome)* · Le 3 sous le groove — « Tiens le 3 pendant que la basse groove en 2 :
   deux mondes superposés, un seul 1. » *Critère :* quand les points de convergence retombent
   pile, cycle après cycle, sans que tu les guettes. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
3. **R1-03** *(atome)* · La syncope perpétuelle — « Accentue systématiquement les temps faibles :
   le 1 existe, mais c'est le contretemps qui parle. » *Critère :* quand la syncope tourne sans
   que le 1 se perde. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} }`
4. **R1-04** *(atome)* · La bascule — « Toutes les quatre mesures, bascule : binaire → 3-contre-2 →
   binaire. La couture doit être invisible. » *Critère :* quand la bascule ne coûte ni un temps ni
   un accent. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:2} }`
5. **R1-05** *(synthèse)* · La polyrythmie habitée — « Deux accords : groove binaire, îlots de
   3-contre-2, syncope perpétuelle — et des retombées propres à chaque fois. » *Critère :* quand
   la complexité sonne évidente. *Preset :* `{ pattern:'syncopeGrave', prog:'blues', drop:{on:false} }`

### 5.6 `MOD-CJ-Ar-COL` · Couleur cajón *(propre cajón, `EX-CJ-COL-*`)*

1. **COL-01** *(atome)* · Heel-toe — « Talon puis pointe de la même main : deux hauteurs, un seul
   geste qui roule. » *Critère :* quand le talon et la pointe sonnent comme deux notes voulues,
   pas comme un rebond. *Preset :* `{ metro:true, tempo:76 }`
2. **COL-02** *(atome)* · Le pied qui glisse — « Pose le pied sur la tapa et glisse-le pendant que
   la main frappe le grave : la note plie. » *Critère :* quand la hauteur bouge exactement où tu
   glisses. *Preset :* `{ metro:true, tempo:69 }`
3. **COL-03** *(atome)* · La frappe combinée — « Grave et aigu ensemble, un seul geste, deux
   étages : l'accord du cajón. » *Critère :* quand les deux étages sonnent ensemble sans flam.
   *Preset :* `{ metro:true, tempo:76 }`
4. **COL-04** *(atome)* · Le rumble continu — « Fais lever la vague : un grondement qui enfle,
   plane, s'éteint — au service d'un crescendo choisi. » *Critère :* quand la vague obéit à ta
   dynamique, pas à ta fatigue. *Preset :* `{ metro:true, tempo:72 }`
5. **COL-05** *(synthèse)* · La plage de couleurs — « Une plage solo : heel-toe, pitch bend,
   frappes combinées, rumble — enchaînés avec de l'espace, comme une palette qu'on déploie. »
   *Critère :* quand chaque couleur arrive à son moment et que le silence en fait partie.
   *Preset :* `{ metro:true, tempo:72 }`

### 5.7 `MOD-DJ-Ar-SOLO` · Le solo manding *(propre djembé, `EX-DJ-SOLO-*`)*

1. **SOLO-01** *(atome)* · L'ancre — « Installe ta phrase d'ancrage sur l'accompagnement : c'est
   la maison d'où partent et où reviennent toutes les phrases. » *Critère :* quand ton ancre est
   assez solide pour qu'on la reconnaisse au retour. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
2. **SOLO-02** *(atome)* · Le morphing — « Écarte-toi de l'ancre par petites touches — une note
   déplacée, un accent — et reviens toujours. » *Critère :* quand chaque écart s'entend comme une
   variation, jamais comme une perte. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:false} }`
3. **SOLO-03** *(atome)* · La chauffe — « Monte l'intensité par paliers nets — densité, hauteur,
   volume — sans accélérer d'un cheveu. » *Critère :* quand la fièvre monte et que le tempo ne
   bouge pas. *Preset :* `{ pattern:'syncopeGrave', prog:'vamp1', drop:{on:false} }`
4. **SOLO-04** *(atome)* · Jouer les espaces — « Place tes phrases dans les silences de
   l'accompagnement ; laisse respirer entre deux. Le solo est aussi fait de vides. » *Critère :*
   quand tes silences sont aussi habités que tes notes. *Preset :* `{ pattern:'theOne', prog:'vamp1', drop:{on:true, everyN:4, lenBeats:2} }`
5. **SOLO-05** *(synthèse)* · Le solo construit — « Un solo entier : ancre → morphing → chauffe →
   chute, sur deux accords. Une histoire avec un début et une fin. » *Critère :* quand on peut
   raconter ton solo après l'avoir entendu. *Preset :* `{ pattern:'syncopeGrave', prog:'jazzfunk', drop:{on:false} }`

---

## 6. Recette

- **`recette-P7.js`** (nouvelle) : Avancé — présence et complétude des 35 exercices / 10 modules,
  ordre `['B3','I1','R2','D3','CYM','CALL']`, asymétrie idiomatique rendue (colonne cajón : 5
  modules dont CYM sans CALL ; colonne djembé : 5 dont CALL sans CYM), onglet « Avancé » apparu,
  presets appliqués (chargement d'un exercice → état basse/métronome conforme), partage socle
  (marqueur `pf-shared` sur `EX-SOCLE-*`), premier emploi d'`octaves` fonctionnel.
- **`recette-P8.js`** (nouvelle) : Artiste — mêmes vérifications (35/12, ordre à 7 codes, onglet
  « Artiste », asymétrie COL/SOLO), plus : gap machine des P1-02/P2-02 appliquée, vocalisation
  présente dans les consignes I4 (mention chant/voix).
- **`recette-corpus.js`** et **`recette-registre.js`** : re-passage — le validateur couvre les
  nouveaux exercices (vocabulaire de presets, références) ; le registre vérifie que les tables
  0.8.0 historiques restent identiques (le peuplement n'ajoute pas de pattern).
- **Non-régression complète avant merge** : les 19 suites historiques (746) + corpus + registre +
  P7 + P8, sur le build final.

## 7. Livraison

Build **0.10.0** : `corpus/funk.js` (complet), `index.html` (numéro de build seul), 2 recettes
nouvelles, rapport de non-régression. PR unique, merge par Jean. Après P-8 : le parcours funk est
**complet** (4 niveaux, 2 parcours) — la carte P-5 est intégralement réalisée.

## 8. Ce qui reste volontairement dehors

- **Traduction EN/PT** des nouvelles chaînes (même statut que P-6 : chantier i18n global à part).
- **Champ `demo`** (mode écoute) : sera rempli pour tous les niveaux au chantier R-4 — le schéma
  l'accepte déjà, inutile de bloquer le contenu dessus.
- **Panel UX** : à rejouer après R-4/R-5 (décision cadrage), pas après un chantier de contenu.
- **Paramètre de « feel » moteur** (basse jouée un peu devant/derrière la grille, quelques ms,
  additif) : demandé par Jean « pour la versatilité » — inscrit au backlog moteur, à chiffrer
  au plus tôt en R-3 (quand le moteur passe en fichiers). Le jour où il existe, les presets
  P1-04/P2-04 pourront le référencer sans réécrire le contenu (champ de preset additif).

## 9. Points à trancher par Jean (porte de qualité)

1. ~~**Exécution d'un bloc**~~ — **TRANCHÉ (Jean, 16/07) : oui**, P-7 + P-8 en une session.
2. ~~**Ordres avec codes asymétriques ou code commun `IDIO`**~~ — **TRANCHÉ (Jean, 16/07) :
   option A**, codes asymétriques (`CYM`/`CALL`, `COL`/`SOLO`), IDs parlants conformes à la
   carte P-5.
3. ~~**Laid-back/pushed sans paramètre moteur**~~ — **TRANCHÉ (Jean, 16/07)** : OK pour ce
   chantier (« si ça marche et que c'est plus simple ») ; le **feel moteur** est jouable et
   inscrit au backlog (§8) pour la versatilité, à chiffrer au plus tôt en R-3.
4. ~~**Progressions**~~ — **TRANCHÉ (Jean, 16/07) : ouvrir.** Synthèses Artiste colorées :
   `blues` (P1-05, R1-05), `mixo` (P2-05), `dorien` (P3-05), `jazzfunk` (I4-05, SOLO-05).
5. ~~**Tempos**~~ — **TRANCHÉ (Jean, 16/07) : documenter les tempos usuels funk** — fait, §3.1
   (zone de croisière 90–110 BPM, presets 69–84 = tempos d'apprentissage, repère −20/−30 %).
6. ~~**Vocalisation dans I4**~~ — **TRANCHÉ (Jean, 16/07) : confirmé**, ancrages I4-01
   (chanter puis jouer) et I4-02 (question-réponse), conformes P-5 §7.2.

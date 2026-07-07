# Note de correction — Grooves brésiliens (sortie Gemini vs prompt)

> Archivée le 2026-07-07 depuis la conversation (correctif produit par Opus). Sert d'intrant à l'agent
> de réécriture-vérification de la famille brésilienne. La sortie Gemini originale n'a pas été déposée
> dans le dossier ; les grilles citées ici sont les fragments repris dans le correctif.

Comparaison du prompt « recherche de grooves jammables » avec le dossier produit par Gemini (Samba
Batucada, Maracatu, Baião, Ijexá/Afoxé, Samba-Reggae). Les grilles rythmiques sont, dans l'ensemble,
défendables — Gemini n'a pas inventé n'importe quoi côté patterns. Les vrais ratés sont ailleurs :
discipline de format, affirmations non sourcées présentées comme des faits, et une grille d'Ijexá non
idiomatique. Classement du plus grave au plus mineur.

## 1. Discipline de format non respectée (raté majeur)
Le prompt impose : Contexte en « 2-3 phrases », rôle de voix en « 3-4 mots », « pas de préambule ni de
conclusion », fiches sèches et jammables. Gemini a livré l'inverse : des paragraphes-fleuves de 6-10
phrases par instrument, saturés de prose lyrique (« effet de fermeture éclair », « ancre
gravitationnelle », « mur de son blanc »). Correction : réduire chaque Contexte à 2-3 phrases, chaque
rôle de voix à 3-4 mots, supprimer les envolées.

## 2. Détails techniques inventés, présentés comme établis (viole « NE RIEN INVENTER »)
Affirmations catégoriques sans source vérifiable : biomécanique précise (« prise allemande »,
« bandoulière à 45 degrés », « technique du virado… seule méthode viable au-dessus de 120 BPM »),
accordages exacts (surdo 3 « à une quarte ou une quinte parfaite au-dessus du Surdo 1 »), chiffres
psycho-acoustiques (« swing ≈ 55-60 % » sans mesure citée). Ces éléments devraient être sourcés
nommément ou préfixés « INCERTAIN : ».

## 3. Sources gonflées / potentiellement fabriquées
- « Cross-Cultural Learning and the Groove Meter Matrix de J. Henderson » — invérifiable, suspect.
- Numéros de citation (1, 3, 5, 11, 17…) sans liste correspondante.
- Sources solides et réelles à CONSERVER : Larry Crook *Zabumba Music from Caruaru*, Ed Uribe,
  Duduka Da Fonseca, article ISMIR sur le micro-timing du maracatu.

## 4. Grille d'Ijexá non idiomatique (raté de contenu réel)
Trois voix portaient exactement le même rythme (`..X...X...X...X.` pour agogô haute, xequerê et
rumpi/lê). Or l'identité de l'Ijexá/Afoxé est la cloche-timeline (agogô/gã) à DEUX TONS en clave
syncopée qui dirige l'ensemble. Correction proposée (à VÉRIFIER à la source — Kalango « Pandeiro
Guide: Ijexá », Pulsewave « Rhythm Tip – Afoxé », à caler contre un enregistrement de Filhos de Gandhy) :

```
INCERTAIN — Agogô grave (basse) : X...X.......X...
INCERTAIN — Agogô aigu (haute)  : ..X...X.X.....X.
Xequerê (accent)                : ..X...X...X...X.
```

## 5. « Variations » non idiomatiques ou hors-sujet
- Baião → « Paradiddle Drumset » : rudiment générique, pas une variation traditionnelle — à retirer.
- Samba-Reggae → « Timbau Djembe Slap » : le timbau se joue aux mains, pas au djembé — à nettoyer.

## 6. Incohérences d'étiquetage de tonalité
« Agogô grave (Aigu) » dans la Samba mais « (Médium) » dans le Baião ; xequerê étiqueté « (Aigu) »
alors qu'il occupe le médium-texture. Fixer une convention unique par instrument sur tout le document.

## 7. Instruments nommés dans le prompt et absents
Le reco-reco n'apparaît nulle part ; le ganzá n'existe que fondu dans le mineiro. Sur une batucada,
le chocalho/ganzá est une voix structurante — à ajouter comme 6ᵉ voix.

## Ce que Gemini a bien fait (à conserver)
- Couverture : batucada, baião, maracatu + 2 bonus pertinents (Ijexá, Samba-Reggae).
- « Une voix = un ton » respecté (zabumba/triangle décomposés).
- Voix omises listées à chaque groove.
- Section AUTO-CRITIQUE pertinente (substitution instrumentale, micro-timing, volume en salle,
  clave comme béquille eurocentrique).

## Fiche modèle corrigée (format strict, VALIDÉE) — Samba Batucada

Samba Batucada — Rio de Janeiro, Brésil
- Contexte : moteur polyrythmique des escolas de samba au Carnaval de Rio. Dense superposition
  d'ostinatos conçue pour projeter du son en extérieur et porter les danseurs. Accent ressenti sur le
  temps 2 (surdo de primeira) — signature du samba.
- Tempo : 120-145 BPM ; jam conseillé 105-110 BPM.
- Cycle : 16 pas, binaire, 1 mesure (4/4) = 2 mesures de 2/4. Swing léger, doubles poussées vers le
  temps suivant (INCERTAIN : ≈ 55 %, à caler à l'oreille).

```
Surdo de primeira (grave)  — fondation, temps 2    : ....X.......X...
Surdo de segunda  (grave)  — réponse, temps 1      : X.......X.......
Caixa             (médium) — tapis double-croches  : x.xXx.xXx.xXx.xX
Tamborim          (aigu)   — timeline (teleco-teco): X..X..X...X..X..
Agogô             (aigu)   — appui métallique      : X...X...X...X...
Ganzá/chocalho    (aigu)   — flux continu          : xxxxxxxxxxxxxxxx
```

Ordre d'entrée en jam : 1. Surdo de segunda (facile) · 2. Surdo de primeira (facile) ·
3. Ganzá/chocalho (facile) · 4. Caixa (moyen) · 5. Agogô (facile) · 6. Tamborim (difficile)

Variations (courantes) :
```
Tamborim « carreteiro » (aigu)      : x.x.x.x.x.x.x.x.   (débutant, flux simple)
Caixa « em cima » Mocidade (médium) : X..x..X...x.X...
Surdo 3 / cortador (médium)         : ..X...X...X...X.   (coupe le pouls binaire)
```

Sources : Ed Uribe *The Essence of Brazilian Percussion & Drum Set* ; Duduka Da Fonseca *Brazilian
Rhythms for Drumset* ; Kalango « Sambapedia ». Rôles des surdos très standardisés ; motifs de
caixa/tamborim variables selon les écoles (Portela, Mocidade, Vila Isabel).

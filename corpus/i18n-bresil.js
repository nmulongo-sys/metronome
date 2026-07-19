/* ============================================================================
   Traductions EN/PT du corpus « bresil » (C6).
   Source de vérité = le FRANÇAIS du corpus : la clé est la chaîne française
   normalisée (mêmes espaces repliés que le marcheur i18n de R-5). Ce fichier
   FUSIONNE dans window.__I18N sans jamais écraser une clé déjà définie.
   Glossaire (arbitrage Jean du 18/07) : les termes de métier et les noms de
   rythmes — ciranda, arrasta-pé, xote, bossa nova, coco, partido alto, baião,
   samba, palmas, tamborim, tapa, cajón, djembé, tone, slap, backbeat — restent
   TELS QUELS en EN et en PT ; seule la phrase autour est traduite. Aucun de ces
   termes n'est glosé entre parenthèses.
   Les CLÉS sont recopiées du corpus, jamais retapées : si une leçon change en
   français, sa clé doit changer ici aussi — recette-corpus-i18n.js le vérifie.
   ============================================================================ */
(function () {
  'use strict';
  var I = window.__I18N = window.__I18N || {};
  var EN = I.en = I.en || {}, PT = I.pt = I.pt || {};
  /* clé = chaîne FR du corpus ; valeur = [anglais, portugais] */
  var T = {
    /* ---- identité du style (label rendu par le sélecteur C6, description) ---- */
    "Brésil": ["Brazil", "Brasil"],
    "Six rythmes brésiliens en réduction à deux joueurs : la ronde lente de la ciranda, la marche de l'arrasta-pé, le balancement du xote, la retenue de la bossa nova, le claqué du coco, et le 3-3-2 du partido alto.": ["Six Brazilian rhythms reduced to two players: the slow round of the ciranda, the march of the arrasta-pé, the sway of the xote, the restraint of the bossa nova, the clack of the coco, and the 3-3-2 of the partido alto.", "Seis ritmos brasileiros reduzidos a dois tocadores: a roda lenta da ciranda, a marcha do arrasta-pé, o balanço do xote, a contenção da bossa nova, o estalo do coco, e o 3-3-2 do partido alto."],

    /* ---- objets de module ---- */
    "Ciranda — le temps qui domine": ["Ciranda — the beat that dominates", "Ciranda — o tempo que domina"],
    "Arrasta-pé — la marche sautillée": ["Arrasta-pé — the skipping march", "Arrasta-pé — a marcha saltitante"],
    "Xote — l'anticipation douce": ["Xote — the gentle anticipation", "Xote — a antecipação suave"],
    "Bossa nova — jouer piano": ["Bossa nova — playing soft", "Bossa nova — tocar suave"],
    "Coco — le claqué qui marque la cadence": ["Coco — the clack that sets the pace", "Coco — o estalo que marca a cadência"],
    "Partido alto — la frappe qui freine": ["Partido alto — the stroke that brakes", "Partido alto — a batida que freia"],
    "Le tapis — tenir sans peser": ["The carpet — holding without weighing down", "O tapete — sustentar sem pesar"],
    "Les palmas en trois-trois-deux": ["Palmas in three-three-two", "As palmas em três-três-dois"],
    "L'indépendance — tenir pendant que ça syncope": ["Independence — holding while it syncopates", "A independência — sustentar enquanto sincopa"],

    /* ---- ciranda ---- */
    "Le grave ouvert sur le 1": ["The open bass tone on the 1", "O grave aberto no 1"],
    "Ne joue que le 1 : un seul grave, ouvert, que tu laisses sonner — les trois autres temps restent vides.": ["Play only the 1: a single open bass tone that you let ring — the other three beats stay empty.", "Toque só o 1: um único grave aberto, que você deixa soar — os outros três tempos ficam vazios."],
    "quand le 1 sonne encore au moment où tu arrives sur le 2.": ["when the 1 is still ringing by the time you reach the 2.", "quando o 1 ainda soa no momento em que você chega no 2."],
    "Les trois étouffés": ["The three muted strokes", "Os três abafados"],
    "Pose la paume à plat sur la tapa et joue 2, 3 et 4 en frappes sourdes, sans laisser vibrer.": ["Lay your palm flat on the tapa and play 2, 3 and 4 as dull strokes, with no ring.", "Apoie a palma da mão na tapa e toque 2, 3 e 4 em batidas surdas, sem deixar vibrar."],
    "quand les trois frappes sortent mates et courtes, et se ressemblent entre elles.": ["when the three strokes come out dull and short, and sound alike.", "quando as três batidas saem foscas e curtas, e se parecem entre si."],
    "Fort, doux, doux, doux": ["Loud, soft, soft, soft", "Forte, fraco, fraco, fraco"],
    "Enchaîne le grave ouvert et les trois étouffés en boucle, en marchant les quatre pas de la ronde — départ du pied gauche sur le fort.": ["Loop the open bass tone and the three muted strokes, walking the four steps of the round — left foot starting on the loud one.", "Encadeie o grave aberto e os três abafados em loop, caminhando os quatro passos da roda — saída do pé esquerdo no forte."],
    "quand quelqu'un qui entre dans la pièce trouve le 1 sans avoir à compter.": ["when someone walking into the room finds the 1 without having to count.", "quando alguém que entra na sala acha o 1 sem precisar contar."],
    "Le tapis d'en face": ["The carpet on the other side", "O tapete do outro lado"],
    "Écoute le tapis de croches que tient l'autre, puis pose ta ronde dedans sans le pousser.": ["Listen to the eighth-note carpet the other player is holding, then set your round inside it without pushing it.", "Escute o tapete de colcheias que o outro sustenta, e coloque a sua roda dentro dele sem empurrar."],
    "quand ton 1 tombe dans le tapis sans le bousculer.": ["when your 1 lands in the carpet without jostling it.", "quando o seu 1 cai no tapete sem sacudi-lo."],
    "Synthèse — garder l'écart quand le clic s'absente": ["Synthesis — keeping the gap when the click drops out", "Síntese — manter a diferença quando o clique some"],
    "Tiens la ronde pendant que le clic disparaît une mesure sur quatre, en surveillant l'écart entre le 1 et les trois autres.": ["Hold the round while the click drops out one bar in four, watching the gap between the 1 and the other three.", "Sustente a roda enquanto o clique some um compasso a cada quatro, vigiando a diferença entre o 1 e os outros três."],
    "quand le clic revient sur ton 1 et que les étouffés ne sont pas montés à son niveau.": ["when the click comes back on your 1 and the muted strokes have not risen to its level.", "quando o clique volta no seu 1 e os abafados não subiram ao nível dele."],

    /* ---- arrasta-pé ---- */
    "Un grave sur chaque temps": ["A bass tone on every beat", "Um grave em cada tempo"],
    "Pose un grave sur chacun des quatre temps, tous du même poids — aucun ne doit dépasser.": ["Put a bass tone on each of the four beats, all of the same weight — none should stick out.", "Coloque um grave em cada um dos quatro tempos, todos com o mesmo peso — nenhum deve sobressair."],
    "quand aucun des quatre graves ne ressort si tu fermes les yeux.": ["when none of the four bass tones stands out with your eyes closed.", "quando nenhum dos quatro graves se destaca de olhos fechados."],
    "Le contretemps sec": ["The dry offbeat", "O contratempo seco"],
    "Laisse le grave et place une frappe sèche et aiguë juste entre deux temps, franchement plus légère.": ["Drop the bass tone and place a dry, high stroke right between two beats, clearly lighter.", "Deixe o grave e coloque uma batida seca e aguda bem entre dois tempos, bem mais leve."],
    "quand le contretemps claque net et reste nettement sous le grave.": ["when the offbeat cracks cleanly and stays clearly under the bass tone.", "quando o contratempo estala nítido e fica bem abaixo do grave."],
    "La marche complète": ["The full march", "A marcha completa"],
    "Superpose les deux mains : grave sur les temps, aigu entre les temps, en boucle.": ["Layer the two hands: bass tone on the beats, high stroke between them, on a loop.", "Sobreponha as duas mãos: grave nos tempos, agudo entre os tempos, em loop."],
    "quand ça sautille au lieu de marcher au pas.": ["when it skips instead of marching in step.", "quando aquilo saltita em vez de marchar em passo."],
    "Sautillé, pas militaire": ["Skipping, not military", "Saltitante, não militar"],
    "Rejoue la même grille en allégeant tout le bras : l'appui doit rebondir au lieu de s'écraser.": ["Play the same grid again with the whole arm lighter: the stroke should bounce instead of crushing.", "Toque a mesma grade aliviando todo o braço: o apoio deve quicar em vez de esmagar."],
    "quand la marche donne envie de sauter, pas de défiler.": ["when the march makes you want to jump, not to parade.", "quando a marcha dá vontade de pular, não de desfilar."],
    "Synthèse — tenir la marche sans accélérer": ["Synthesis — holding the march without speeding up", "Síntese — sustentar a marcha sem acelerar"],
    "Enchaîne la marche complète pendant que le clic s'absente une mesure sur quatre : c'est le contretemps qui tire vers l'avant, pas toi.": ["Loop the full march while the click drops out one bar in four: it is the offbeat that pulls forward, not you.", "Encadeie a marcha completa enquanto o clique some um compasso a cada quatro: é o contratempo que puxa para a frente, não você."],
    "quand le clic revient exactement là où tu l'attendais, et pas avant.": ["when the click comes back exactly where you expected it, and not before.", "quando o clique volta exatamente onde você esperava, e não antes."],

    /* ---- xote ---- */
    "Le squelette, sans anticipation": ["The skeleton, without the anticipation", "O esqueleto, sem antecipação"],
    "Grave sur le 1 et sur le 3, claquement aigu sur le 2 et sur le 4 — rien d'autre pour l'instant.": ["Bass tone on the 1 and the 3, high crack on the 2 and the 4 — nothing else for now.", "Grave no 1 e no 3, estalo agudo no 2 e no 4 — nada mais por enquanto."],
    "quand le va-et-vient grave-aigu tourne tout seul, sans que tu comptes.": ["when the bass-to-high back-and-forth turns on its own, without you counting.", "quando o vaivém grave-agudo gira sozinho, sem você contar."],
    "Les deux claquements secs": ["The two dry cracks", "Os dois estalos secos"],
    "Ne garde que les deux frappes aiguës, sur le 2 et sur le 4, poignet souple et bras lourd.": ["Keep only the two high strokes, on the 2 and the 4, loose wrist and heavy arm.", "Fique só com as duas batidas agudas, no 2 e no 4, pulso solto e braço pesado."],
    "quand les deux claquements sortent identiques, secs et courts.": ["when the two cracks come out identical, dry and short.", "quando os dois estalos saem idênticos, secos e curtos."],
    "L'anticipation, plus douce que le 1": ["The anticipation, softer than the 1", "A antecipação, mais suave que o 1"],
    "Ajoute un grave juste après le 2, plus doux que celui du 1 : il annonce le 3, il ne le remplace pas.": ["Add a bass tone just after the 2, softer than the one on the 1: it announces the 3, it does not replace it.", "Acrescente um grave logo depois do 2, mais suave que o do 1: ele anuncia o 3, não o substitui."],
    "quand l'anticipation se glisse sans voler la vedette au 1.": ["when the anticipation slips in without stealing the show from the 1.", "quando a antecipação entra sem roubar a cena do 1."],
    "Le balancement n'est pas dans la grille": ["The sway is not in the grid", "O balanço não está na grade"],
    "Rejoue la cellule entière en laissant les subdivisions respirer, un peu inégales — le xote ne se joue pas droit.": ["Play the whole cell again letting the subdivisions breathe, slightly uneven — the xote is not played straight.", "Toque a célula inteira deixando as subdivisões respirarem, um pouco desiguais — o xote não se toca reto."],
    "quand ça balance au lieu de défiler, sans que tu saches dire où tu triches.": ["when it sways instead of marching past, without your being able to say where you are cheating.", "quando aquilo balança em vez de desfilar, sem que você saiba dizer onde está trapaceando."],
    "Synthèse — ne pas durcir en baião": ["Synthesis — not hardening into a baião", "Síntese — não endurecer virando baião"],
    "Enchaîne le xote complet au clic : si l'anticipation durcit et que le tempo monte, tu es en train de basculer dans le baião.": ["Loop the full xote against the click: if the anticipation hardens and the tempo climbs, you are tipping over into the baião.", "Encadeie o xote completo no clique: se a antecipação endurece e o andamento sobe, você está caindo no baião."],
    "quand l'anticipation reste plus douce que le 1 d'un bout à l'autre.": ["when the anticipation stays softer than the 1 from end to end.", "quando a antecipação permanece mais suave que o 1 de ponta a ponta."],

    /* ---- bossa nova ---- */
    "Le grave et ses deux anticipations": ["The bass tone and its two anticipations", "O grave e suas duas antecipações"],
    "Le clic bat la pulsation lente, la bossa se comptant en deux : pose le grave sur le 1, juste après le 2, sur le 3, juste après le 4.": ["The click beats the slow pulse, since the bossa is counted in two: put the bass tone on the 1, just after the 2, on the 3, just after the 4.", "O clique bate a pulsação lenta, já que a bossa se conta em dois: coloque o grave no 1, logo depois do 2, no 3, logo depois do 4."],
    "quand les deux anticipations tombent d'elles-mêmes, sans que tu les cherches.": ["when both anticipations fall into place by themselves, without your looking for them.", "quando as duas antecipações caem sozinhas, sem você procurar por elas."],
    "Le motif sec de la main droite": ["The dry right-hand motif", "O motivo seco da mão direita"],
    "Laisse le grave et joue le seul motif sec et aigu — c'est le tamborim que João Gilberto disait avoir choisi dans tout le samba.": ["Drop the bass tone and play the dry high motif alone — this is the tamborim João Gilberto said he had picked out of the whole samba.", "Deixe o grave e toque só o motivo seco e agudo — é o tamborim que João Gilberto dizia ter escolhido dentro de todo o samba."],
    "quand le motif revient à sa place tout seul à chaque tour.": ["when the motif comes back to its place on its own each time round.", "quando o motivo volta ao seu lugar sozinho a cada volta."],
    "Superposer sans forcer": ["Layering without forcing", "Sobrepor sem forçar"],
    "Superpose les deux mains, et surtout n'accentue pas le motif aigu : ce n'est pas un backbeat.": ["Layer the two hands, and above all do not accent the high motif: it is not a backbeat.", "Sobreponha as duas mãos, e sobretudo não acentue o motivo agudo: não é um backbeat."],
    "quand l'aigu reste au niveau du reste, sans jamais claquer.": ["when the high stroke stays level with the rest, never cracking.", "quando o agudo fica no nível do resto, sem nunca estalar."],
    "Le tapis d'en face, très doux": ["The carpet on the other side, very soft", "O tapete do outro lado, bem suave"],
    "Écoute le tapis régulier que tient l'autre : il doit rester sous le niveau d'une mélodie sifflée.": ["Listen to the steady carpet the other player is holding: it must stay below the level of a whistled melody.", "Escute o tapete regular que o outro sustenta: ele deve ficar abaixo do nível de uma melodia assobiada."],
    "quand tu peux siffler par-dessus sans forcer la voix.": ["when you can whistle over it without straining your voice.", "quando você consegue assobiar por cima sem forçar a voz."],
    "Synthèse — le motif ne se retourne pas": ["Synthesis — the motif does not flip", "Síntese — o motivo não se inverte"],
    "Tiens la bossa entière ; le clic s'absente puis revient, et ton premier accent aigu doit retomber au même endroit qu'au départ.": ["Hold the whole bossa; the click drops out then comes back, and your first high accent must land in the same place as at the start.", "Sustente a bossa inteira; o clique some e volta, e o seu primeiro acento agudo deve cair no mesmo lugar do começo."],
    "quand le motif est encore à l'endroit après le retour du clic.": ["when the motif is still the right way round after the click returns.", "quando o motivo ainda está na posição certa depois que o clique volta."],

    /* ---- coco ---- */
    "Le grave et sa relance": ["The bass tone and its pickup", "O grave e sua retomada"],
    "Appuie le grave sur le 1, puis pose une relance plus légère juste avant le retour du 1 suivant.": ["Press the bass tone on the 1, then place a lighter pickup just before the next 1 comes round.", "Apoie o grave no 1, e coloque uma retomada mais leve logo antes da volta do 1 seguinte."],
    "quand la relance pousse vers le 1 sans jamais le doubler.": ["when the pickup pushes towards the 1 without ever doubling it.", "quando a retomada empurra para o 1 sem nunca dobrá-lo."],
    "Le claqué du sabot de bois": ["The clack of the wooden clog", "O estalo do tamanco de madeira"],
    "Sur le 2, une frappe aiguë très sèche : c'est le sabot qui claque au sol, et c'est lui qui marque vraiment la cadence.": ["On the 2, a very dry high stroke: this is the clog clacking on the ground, and it is what really sets the pace.", "No 2, uma batida aguda bem seca: é o tamanco estalando no chão, e é ele que marca de verdade a cadência."],
    "quand le claqué est le son le plus net de toute la boucle.": ["when the clack is the sharpest sound in the whole loop.", "quando o estalo é o som mais nítido de todo o loop."],
    "Le coco complet": ["The full coco", "O coco completo"],
    "Superpose : grave et relance en dessous, claqué sur le 2 au-dessus.": ["Layer them: bass tone and pickup underneath, clack on the 2 on top.", "Sobreponha: grave e retomada embaixo, estalo no 2 em cima."],
    "quand le claqué reste collé au 2 sans glisser vers le temps.": ["when the clack stays glued to the 2 without sliding onto the beat.", "quando o estalo fica colado no 2 sem escorregar para o tempo."],
    "Le tapis et les piqûres d'en face": ["The carpet and the jabs on the other side", "O tapete e as picadas do outro lado"],
    "Écoute ce que tient l'autre : un tapis serré, et des contretemps qui piquent — ton claqué doit trouver sa place entre les deux.": ["Listen to what the other player is holding: a tight carpet, and offbeats that jab — your clack has to find its place between the two.", "Escute o que o outro sustenta: um tapete cerrado, e contratempos que picam — o seu estalo tem que achar lugar entre os dois."],
    "quand ton claqué ne se confond avec aucun des deux.": ["when your clack cannot be mistaken for either of them.", "quando o seu estalo não se confunde com nenhum dos dois."],
    "Synthèse — parler vite par-dessus": ["Synthesis — talking fast over the top", "Síntese — falar rápido por cima"],
    "Tiens le coco et récite un texte rapide en même temps : n'importe quel texte, débité aussi vite que tu peux.": ["Hold the coco and recite a fast text at the same time: any text at all, rattled off as fast as you can.", "Sustente o coco e recite um texto rápido ao mesmo tempo: qualquer texto, despejado o mais rápido que você conseguir."],
    "quand ta bouche part vite et que tes mains, elles, ne bougent pas d'un poil.": ["when your mouth races off and your hands do not budge an inch.", "quando a sua boca dispara e as suas mãos não saem do lugar."],

    /* ---- partido alto ---- */
    "Les appuis de pouce": ["The thumb strokes", "Os apoios de polegar"],
    "Marque les quatre appuis graves, réguliers et discrets — c'est le socle sur lequel tout le reste va freiner.": ["Mark the four low strokes, steady and discreet — this is the floor everything else will brake against.", "Marque os quatro apoios graves, regulares e discretos — é a base sobre a qual todo o resto vai frear."],
    "quand les quatre appuis passent inaperçus tellement ils sont réguliers.": ["when the four strokes go unnoticed, so steady are they.", "quando os quatro apoios passam despercebidos de tão regulares."],
    "Les palmas d'en face": ["The palmas on the other side", "As palmas do outro lado"],
    "Écoute le trois-trois-deux frappé dans les mains ; compte-le une fois à voix haute, puis laisse-le tourner sans compter.": ["Listen to the three-three-two clapped in the hands; count it out loud once, then let it turn without counting.", "Escute o três-três-dois batido nas mãos; conte uma vez em voz alta, depois deixe girar sem contar."],
    "quand tu entends les trois groupes sans avoir à les compter.": ["when you hear the three groupings without having to count them.", "quando você ouve os três grupos sem precisar contá-los."],
    "La frappe qui freine": ["The stroke that brakes", "A batida que freia"],
    "Ajoute une frappe sèche de la paume dans la seconde moitié du cycle, et cherche l'endroit où elle donne l'impression de retenir le rythme : il n'y a pas de place obligée, c'est l'oreille qui tranche.": ["Add a dry palm stroke in the second half of the cycle, and hunt for the spot where it feels as though it holds the rhythm back: there is no set place, the ear decides.", "Acrescente uma batida seca de palma na segunda metade do ciclo, e procure o ponto em que ela dá a impressão de segurar o ritmo: não há lugar obrigatório, quem decide é o ouvido."],
    "quand ta frappe donne l'impression de retenir la boucle au lieu de la pousser.": ["when your stroke feels as though it holds the loop back instead of pushing it.", "quando a sua batida dá a impressão de segurar o loop em vez de empurrá-lo."],
    "Plus posé que le samba": ["More settled than the samba", "Mais contido que o samba"],
    "Rejoue les appuis en cherchant l'allure : le partido va moins vite que le samba, pour laisser passer le chant.": ["Play the strokes again looking for the pace: the partido runs slower than the samba, to let the singing through.", "Toque os apoios de novo buscando o andamento: o partido anda menos que o samba, para deixar o canto passar."],
    "quand tu sens qu'il reste de la place pour une voix au-dessus.": ["when you can feel there is still room for a voice on top.", "quando você sente que ainda sobra espaço para uma voz por cima."],
    "Synthèse — chanter un refrain par-dessus": ["Synthesis — singing a refrain over the top", "Síntese — cantar um refrão por cima"],
    "Tiens tes appuis et ta frappe de retenue, et chante un refrain simple par-dessus — deux phrases suffisent.": ["Hold your strokes and your braking stroke, and sing a simple refrain over them — two lines are enough.", "Sustente os seus apoios e a sua batida de retenção, e cante um refrão simples por cima — duas frases bastam."],
    "quand le refrain sort sans que la boucle bronche.": ["when the refrain comes out without the loop flinching.", "quando o refrão sai sem que o loop vacile."],

    /* ---- djembé : le tapis ---- */
    "Le tapis en croches": ["The eighth-note carpet", "O tapete em colcheias"],
    "Joue des tones réguliers, un temps sur deux, sans aucun accent — c'est un tapis, pas un rythme.": ["Play steady tones, every other beat, with no accent at all — this is a carpet, not a rhythm.", "Toque tones regulares, um tempo sim outro não, sem nenhum acento — é um tapete, não um ritmo."],
    "quand tu n'entends plus aucune frappe ressortir des autres.": ["when you can no longer hear any stroke standing out from the rest.", "quando você não ouve mais nenhuma batida se destacar das outras."],
    "Le tapis serré": ["The tight carpet", "O tapete cerrado"],
    "Resserre : un tone sur chaque pas, toujours sans accent. C'est le tapis du coco et de la bossa.": ["Tighten it up: one tone on every step, still with no accent. This is the carpet of the coco and of the bossa.", "Aperte: um tone em cada passo, ainda sem acento. É o tapete do coco e da bossa."],
    "quand la nappe est si égale qu'on finit par l'oublier.": ["when the layer is so even that you end up forgetting it.", "quando a camada é tão igual que você acaba esquecendo dela."],
    "Le contretemps léger": ["The light offbeat", "O contratempo leve"],
    "Garde le tapis en croches et ajoute un slap très léger sur le 2 et sur le 4, sans casser la nappe.": ["Keep the eighth-note carpet and add a very light slap on the 2 and the 4, without breaking the layer.", "Mantenha o tapete em colcheias e acrescente um slap bem leve no 2 e no 4, sem quebrar a camada."],
    "quand les deux slaps se posent sans que le tapis change de vitesse.": ["when the two slaps land without the carpet changing speed.", "quando os dois slaps caem sem que o tapete mude de velocidade."],
    "La ronde d'en face": ["The round on the other side", "A roda do outro lado"],
    "Écoute la ronde du cajón — un temps fort, trois étouffés : ton tapis doit passer dessous sans le couvrir.": ["Listen to the cajón's round — one strong beat, three muted ones: your carpet has to pass underneath without covering it.", "Escute a roda do cajón — um tempo forte, três abafados: o seu tapete deve passar por baixo sem cobri-la."],
    "quand tu entends encore nettement le temps fort de l'autre tout en jouant.": ["when you can still clearly hear the other player's strong beat while playing.", "quando você ainda ouve nitidamente o tempo forte do outro enquanto toca."],
    "Synthèse — tenir sans peser": ["Synthesis — holding without weighing down", "Síntese — sustentar sem pesar"],
    "Tiens le tapis serré pendant que le clic s'absente une mesure sur quatre, sans accélérer ni appuyer.": ["Hold the tight carpet while the click drops out one bar in four, without speeding up or leaning in.", "Sustente o tapete cerrado enquanto o clique some um compasso a cada quatro, sem acelerar nem apertar."],
    "quand le clic revient pile sur ton tapis, au même volume qu'au départ.": ["when the click comes back right on your carpet, at the same volume as at the start.", "quando o clique volta bem em cima do seu tapete, no mesmo volume do começo."],

    /* ---- djembé : les palmas 3-3-2 ---- */
    "Trois, trois, deux — dans les mains": ["Three, three, two — in the hands", "Três, três, dois — nas mãos"],
    "Frappe dans tes mains : trois, trois, deux, en marchant la pulsation. Compte à voix haute au premier tour, puis lâche le comptage.": ["Clap your hands: three, three, two, walking the pulse. Count out loud the first time round, then drop the counting.", "Bata palmas: três, três, dois, caminhando a pulsação. Conte em voz alta na primeira volta, depois largue a contagem."],
    "quand les trois groupes reviennent sans que tu les comptes.": ["when the three groupings come back without your counting them.", "quando os três grupos voltam sem você contá-los."],
    "Ne pas égaliser en triolets": ["Not evening it out into triplets", "Não igualar em tercinas"],
    "Vérifie le piège : les trois frappes ne sont pas à distance égale — les deux premières sont espacées de trois pas, la dernière de deux seulement.": ["Check the trap: the three strokes are not evenly spaced — the first two are three steps apart, the last one only two.", "Confira a armadilha: as três batidas não estão à mesma distância — as duas primeiras estão a três passos, a última só a dois."],
    "quand tu sens la dernière arriver plus tôt que les autres, et que c'est voulu.": ["when you feel the last one arrive earlier than the others, and that is on purpose.", "quando você sente a última chegar mais cedo que as outras, e isso é proposital."],
    "La troisième frappe sur le contretemps": ["The third stroke on the offbeat", "A terceira batida no contratempo"],
    "Écoute les appuis réguliers du cajón, qui marquent les temps : ta troisième frappe doit tomber juste entre deux d'entre eux.": ["Listen to the cajón's steady strokes marking the beats: your third stroke must land right between two of them.", "Escute os apoios regulares do cajón, que marcam os tempos: a sua terceira batida deve cair bem entre dois deles."],
    "quand la troisième frappe se pose pile dans le trou entre deux appuis.": ["when the third stroke lands right in the hole between two strokes.", "quando a terceira batida cai bem no buraco entre dois apoios."],
    "Passer les palmas au djembé": ["Moving the palmas to the djembé", "Passar as palmas para o djembê"],
    "Reprends la cellule au djembé, en slaps francs : le son doit rester aussi claquant que ta main nue le faisait.": ["Take the cell over on the djembé, in clean slaps: the sound has to stay as sharp as your bare hand made it.", "Retome a célula no djembê, em slaps francos: o som deve continuar tão estalado quanto a sua mão nua fazia."],
    "quand le slap claque autant que ta paume claquait.": ["when the slap cracks as much as your palm used to.", "quando o slap estala tanto quanto a sua palma estalava."],
    "Synthèse — la cellule ne se retourne pas": ["Synthesis — the cell does not flip", "Síntese — a célula não se inverte"],
    "Tiens le trois-trois-deux pendant que le clic s'absente une mesure sur quatre, puis vérifie au retour que tu es toujours à l'endroit.": ["Hold the three-three-two while the click drops out one bar in four, then check on its return that you are still the right way round.", "Sustente o três-três-dois enquanto o clique some um compasso a cada quatro, e confira na volta que você ainda está na posição certa."],
    "quand la cellule tombe encore juste au retour du clic.": ["when the cell still falls right when the click returns.", "quando a célula ainda cai certo na volta do clique."],

    /* ---- djembé : l'indépendance ---- */
    "Deux mains, deux métiers": ["Two hands, two jobs", "Duas mãos, dois ofícios"],
    "Tapis de tones continu d'une main, slaps de contretemps de l'autre — chaque main garde son métier du début à la fin.": ["Continuous tone carpet with one hand, offbeat slaps with the other — each hand keeps its own job from start to finish.", "Tapete de tones contínuo com uma mão, slaps de contratempo com a outra — cada mão mantém o seu ofício do início ao fim."],
    "quand tes deux mains n'ont plus besoin l'une de l'autre pour avancer.": ["when your two hands no longer need each other to keep going.", "quando as suas duas mãos não precisam mais uma da outra para seguir."],
    "Le tapis ne sent rien": ["The carpet feels nothing", "O tapete não sente nada"],
    "Fais varier les slaps — plus fort, plus doux, un sur deux — et surveille le tapis, qui ne doit rien sentir passer.": ["Vary the slaps — louder, softer, every other one — and watch the carpet, which must not feel a thing go by.", "Varie os slaps — mais forte, mais suave, um sim outro não — e vigie o tapete, que não deve sentir nada passar."],
    "quand tu changes les slaps sans que le tapis bronche.": ["when you change the slaps without the carpet flinching.", "quando você muda os slaps sem que o tapete vacile."],
    "Tenir pendant que l'autre syncope": ["Holding while the other one syncopates", "Sustentar enquanto o outro sincopa"],
    "Écoute le coco du cajón et sa relance décalée : ton tapis doit rester droit pendant que lui syncope.": ["Listen to the cajón's coco and its offset pickup: your carpet must stay straight while it syncopates.", "Escute o coco do cajón e a sua retomada deslocada: o seu tapete deve ficar reto enquanto ele sincopa."],
    "quand la syncope d'en face ne déplace plus ton tapis.": ["when the syncopation on the other side no longer shifts your carpet.", "quando a síncope do outro lado não desloca mais o seu tapete."],
    "Basculer du tapis aux palmas": ["Switching from the carpet to the palmas", "Alternar do tapete para as palmas"],
    "Tiens le tapis quatre tours, bascule sur le trois-trois-deux, puis reviens — sans trou entre les deux.": ["Hold the carpet for four times round, switch to the three-three-two, then come back — with no gap in between.", "Sustente o tapete por quatro voltas, mude para o três-três-dois, e volte — sem buraco entre os dois."],
    "quand la bascule se fait sans que le tempo bouge d'un cheveu.": ["when the switch happens without the tempo moving a hair.", "quando a troca acontece sem o andamento mexer um fio."],
    "Synthèse — l'un droit, l'autre penché": ["Synthesis — one straight, the other leaning", "Síntese — um reto, o outro inclinado"],
    "Tiens le tapis pendant que le clic s'absente, et rajoute les slaps de contretemps dès que tu te sens stable.": ["Hold the carpet while the click drops out, and add the offbeat slaps as soon as you feel steady.", "Sustente o tapete enquanto o clique some, e acrescente os slaps de contratempo assim que se sentir estável."],
    "quand tu peux syncoper au-dessus sans que ta main de tapis bouge.": ["when you can syncopate on top without your carpet hand moving.", "quando você consegue sincopar por cima sem que a sua mão de tapete se mexa."]
  };
  for (var k in T) {
    if (!Object.prototype.hasOwnProperty.call(T, k)) continue;
    if (EN[k] === undefined) EN[k] = T[k][0];
    if (PT[k] === undefined) PT[k] = T[k][1];
  }
})();

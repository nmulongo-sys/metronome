/* ============================================================================
   Moteur — fm-accomp.js (R-3a). gap clicks (machine unifiée) et basse funk générative (drop-outs).
   TRANSPLANTATION VERBATIM du script principal du build 0.10.0 : sous cette
   bannière, AUCUNE ligne modifiée (preuve : recette-extraction.js ; seule la
   constante BUILD, dans fm-etat.js, suit le numéro de build courant).
   Portée : script classique, déclarations dans la portée globale partagée —
   chargé après corpus/*.js, avant le script principal (l'ordre compte).
   ============================================================================ */
'use strict';

  // ============ GAP (unifié, passe 2 étape 4) ============
  // Une seule machine à états (updateGapForNewMeasure → mutedThisCycle) ; le ciblage
  // est une décision booléenne prise dans playClick, sans toucher au calcul de t.
  function gapTargets(layer, voice) {
    const tgt = S.gap.target;
    if (tgt === 'all') return true;
    if (tgt === 'pulse') return layer === 'beat' || layer === 'sub';
    return layer === 'perc' && voice === tgt;
  }

  function gapTargetLabel() {
    if (S.gap.target === 'pulse') return 'pulsation';
    const cv = CLAVE_VOICES.find(v => v.id === S.gap.target);
    if (cv) return cv.label.toLowerCase();
    const iv = PERC_INSTR[S.perc.instr].voices.find(v => v.id === S.gap.target);
    return iv ? iv.label.toLowerCase() : S.gap.target;
  }

  // cibles proposées : tout / pulsation / chaque voix de la liste unique (clave + instrument).
  // Conserve la cible courante si elle existe encore, sinon retombe sur 'all'.
  function gapTargetRefresh() {
    const def = PERC_INSTR[S.perc.instr];
    $('gapTarget').innerHTML =
      '<option value="all">Tout (comportement classique)</option>' +
      '<option value="pulse">Pulsation (clic)</option>' +
      CLAVE_VOICES.map(v => '<option value="' + v.id + '">' + v.label + '</option>').join('') +
      def.voices.map(v => '<option value="' + v.id + '">' + v.label + '</option>').join('');
    if (S.gap.target !== 'all' && S.gap.target !== 'pulse' &&
        !claveData[S.gap.target] && !def.voices.some(v => v.id === S.gap.target)) {
      S.gap.target = 'all';
    }
    $('gapTarget').value = S.gap.target;
  }

  function resetGap() {
    gapProgSize = 1; gapRemainPlay = S.gap.playN; gapRemainMute = 0;
    gapMuteTotal = 0; gapMuteDone = 0; gapCrossed = 0; gapCrossedRender();   // 0.6.6 (C15)
  }

  // 0.6.6 (C15) : feedback gap — affiche le nombre de coupures traversées depuis le départ
  function gapCrossedRender() {
    const el = $('gapCrossed'); if (el) el.textContent = gapCrossed;
  }

  function updateGapForNewMeasure() {
    const g = S.gap;
    if (g.mode === 'off') { mutedThisCycle = false; return; }
    if (g.mode === 'rand') {
      mutedThisCycle = Math.random() * 100 < g.prob;
      // 0.6.6 (C15) : en aléatoire, chaque mesure coupée est une coupure d'une mesure
      if (mutedThisCycle) { gapMuteTotal = 1; gapMuteDone = 1; gapCrossed++; gapCrossedRender(); }
      return;
    }
    if (gapRemainPlay > 0) {
      mutedThisCycle = false; gapRemainPlay--;
    } else if (gapRemainMute > 0) {
      mutedThisCycle = true; gapRemainMute--;
      gapMuteDone++;                                                          // 0.6.6 (C15)
      if (gapRemainMute === 0) { gapRemainPlay = g.playN; gapCrossed++; gapCrossedRender(); }
    } else {
      const m = g.mode === 'prog' ? gapProgSize : g.muteM;
      if (g.mode === 'prog') gapProgSize = Math.min(16, gapProgSize * 2);
      gapRemainMute = m - 1;
      mutedThisCycle = true;
      gapMuteTotal = m; gapMuteDone = 1;                                      // 0.6.6 (C15)
      if (gapRemainMute === 0) { gapRemainPlay = g.playN; gapCrossed++; gapCrossedRender(); }
    }
  }

  // ============ BASSE FUNK (passe 5) ============
  // Accompagnement génératif (FUNK-I2). 5.1 : gabarit theOne sur vamp1, chemin DÉTERMINISTE
  // (piliers w=1 + pas w>=0.5, aucun RNG). Le tirage probabiliste, la densité, les profils
  // de vélocité et l'adaptation au tempo arrivent en 5.2 ; les autres progressions en 5.3.

  // Gabarits d'intentions sur grille de 16 pas (§2.1). Un pas = { i, deg, art, w, lvl } :
  //   deg : degré relatif à l'accord courant · art : articulation · w : proba (1 = pilier)
  //   lvl : densité minimale (exploité en 5.2). 5.1 ne définit que theOne (FUNK-T1).
  const BASS_PATTERNS = FM_ASM.patterns;

  // Progressions harmoniques (§2.4). 5.3 : les 6 progressions. Une barre = { deg, quality } ;
  // le degré fixe la fondamentale de l'accord (CHORD_ROOT_SEMI), la qualité n'est qu'un LIBELLÉ
  // d'affichage (aucun gabarit n'utilise le degré '3'/'b7' → les hauteurs jouées sont R/oct/5,
  // indépendantes de majeur/mineur ; cf. note tierce mineure sous DEG_SEMI). Gabarit ⊥ progression.
  const BASS_PROGS = FM_ASM.progressions;

  // Résolveur chromatique key + degré → fréquence. Fondamentale repliée dans la tessiture
  // de basse E1–D2 ; les degrés se déploient au-dessus (§2.4). Table générale (12 tonalités).
  const BASS_PC = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  const DEG_SEMI = { R: 0, oct: 12, '5': 7, '3': 4, b7: 10, appr: -1 };        // relatif à l'accord
  // ⚠ '3' = tierce MAJEURE fixe (4 demi-tons). Sur un accord mineur (dorien i7, jazzfunk ii7),
  //   un futur gabarit qui jouerait '3' sonnerait faux (il faudrait un 'b3'=3). Aucun des 4
  //   gabarits actuels n'utilise '3' → sans effet en 5.3 ; à traiter si un gabarit mineur arrive.
  const CHORD_ROOT_SEMI = { I: 0, i: 0, IV: 5, bVII: 10, V: 7, ii: 2 };        // accord relatif à key
  const BASS_ART_GAIN = { ghost: 0.25, finger: 0.7, slap: 1.0, pop: 0.85 };    // vélocités de base (§2.2 ; profils → 5.2)
  const PC_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];   // classe de hauteur → nom (5.3, affichage)
  const QUALITY_LABEL = { '7': '7', 'm7': 'm7', 'maj7': 'maj7', '': '' };      // suffixe d'accord (libellé seul)
  // Nom lisible de l'accord courant (5.3) : racine (key + degré) + qualité. Purement cosmétique.
  function bassChordName(key, chord) {
    if (!chord) return '';
    const pc = (((BASS_PC[key] || 0) + (CHORD_ROOT_SEMI[chord.deg] || 0)) % 12 + 12) % 12;
    const suf = QUALITY_LABEL[chord.quality] != null ? QUALITY_LABEL[chord.quality] : (chord.quality || '');
    return PC_NAME[pc] + suf;
  }

  function bassKeyRootFreq(key) {
    const E1 = 41.203;                                                          // mi grave, corde à vide
    const n = ((BASS_PC[key] - BASS_PC.E) % 12 + 12) % 12;                      // 0..11 demi-tons au-dessus de E1
    return E1 * Math.pow(2, n / 12);                                            // E1..~D#2
  }
  function bassNoteFreq(key, chordDeg, deg) {
    const semi = (CHORD_ROOT_SEMI[chordDeg] || 0) + (DEG_SEMI[deg] || 0);
    return bassKeyRootFreq(key) * Math.pow(2, semi / 12);
  }

  // Profil de vélocité (§2.2) : écart des gains autour de l'ancre « normal » (finger ≈ 0.7).
  //   plat = comprimé vers normal (lisible débutant) · mixte = identité · contraste = écart maximal.
  function bassVelShape(gain, prof) {
    const A = 0.7;                                                             // ancre 'normal'
    if (prof === 'plat')      return A + (gain - A) * 0.35;
    if (prof === 'contraste') return A + (gain - A) * 1.4;
    return gain;                                                              // mixte
  }

  // Réalise les notes de la mesure courante dans bassRealized ([{frac, note}]).
  // vary=false : chemin DÉTERMINISTE (piliers + w>=0.5), rejouable à l'identique (recette 5.1).
  // vary=true  : tirage probabiliste par w (bassRng) ; les piliers (w=1) sont toujours joués.
  // Densité : un pas n'existe qu'à S.bass.density >= lvl (1 ⊂ 2 ⊂ 3, piliers lvl 1 constants).
  // Adaptation continue au tempo (§2.3) : gain des ghosts, durée des notes et proba des pas
  // non-piliers respirent avec le BPM ; les piliers ne bougent jamais.
  function bassRealize() {
    bassRealized = [];
    const pat = BASS_PATTERNS[S.bass.pattern], prog = BASS_PROGS[S.bass.prog];
    if (!pat || !prog) return;
    const bar = prog.bars[bassBarIdx % prog.bars.length];
    const stepDur = (S.beats * 60 / S.tempo) / pat.steps;
    // 5.3-bis : durée = fraction du PAS (plus de plafond absolu qui tronquait la note à ~15 ms
    // → staccato). finger/slap/pop TIENNENT la note (≈ 0.80–0.90 du pas, léger détaché) ; le
    // ghost reste piqué (0.35). L'adaptation tempo (§2.3) resserre encore à tempo rapide.
    // 5.3-ter : le curseur legato (S.bass.legato, fraction 0–1) interpole la part du pas
    // occupée par chaque note structurante ; la queue déborde sur l'attaque suivante — le
    // liant. 5.3c : fenêtre recalibrée d'après l'écoute (92 BPM) — l'ancien max devient le
    // plancher : Lg = 1 + fraction ∈ [1, 2]. Ghost JAMAIS affecté (reste piqué).
    const Lg = 1 + Math.max(0, Math.min(1, S.bass.legato != null ? S.bass.legato : 0.25));
    const durFill = {
      finger: 0.90 + 0.40 * Lg,    // 1,30 (plancher = ancien max -ter) → 1,40 (défaut) → 1,70
      slap:   0.82 + 0.46 * Lg,    // 1,28 → 1,395 → 1,74
      pop:    0.80 + 0.50 * Lg,    // 1,30 → 1,425 → 1,80
      ghost:  0.35                 // hors legato — toujours piqué
    };
    const dens = S.bass.density, prof = S.bass.vel, vary = !!S.bass.vary;
    // k borné : 0 (lent, 70 BPM) → 1 (rapide, 150 BPM). Interpolations linéaires (§2.3).
    const k = Math.max(0, Math.min(1, (S.tempo - 70) / 80));
    const durTempo   = 1.15 + (0.70 - 1.15) * k;                              // legato lent → sec rapide
    const ghostGainT = 1.20 + (0.64 - 1.20) * k;                              // ghost ≈ 0.30 → 0.16 (base mixte 0.25)
    const wGhostsT   = 1.20 + (0.65 - 1.20) * k;                              // proba des pas non-piliers (la ligne se dépouille)
    // 5.4 : swing des 16es (FUNK-T3) — pas impairs décalés par la formule par paires de
    // subPositions ; sw = 50 % ⇒ identité stricte (non-régression par construction).
    const sw = S.swing / 100, swingOn = !!S.bass.swingFollow;
    // 5.4 : drop-outs — fonction PURE du compteur de mesures global (measureCount), aucune
    // seconde machine à états (spec 5.4 §2.1). Le trou couvre les lenBeats derniers temps de
    // chaque période de everyN mesures ; re-entrée sur The One (FUNK-T1). À l'arrêt
    // (measureCount = 0), jamais de trou. E = période en temps ; g = position globale en temps.
    const dp = S.bass.drop || {};
    const dropE = Math.max(1, (dp.everyN > 0 ? dp.everyN : 4) * S.beats);
    const dropLen = Math.max(1, Math.min(dropE - 1, dp.lenBeats > 0 ? dp.lenBeats : 2));
    const dropOn = !!dp.on && measureCount > 0;
    const beat0 = (measureCount - 1) * S.beats;                               // temps global du 1 de la mesure
    const beatDur = 60 / S.tempo;
    for (const h of pat.hits) {
      if (h.lvl > dens) continue;                                             // densité : le pas n'existe pas
      const pilier = h.w >= 1;
      if (!vary) {
        if (!pilier && !(h.w >= 0.5)) continue;                              // déterministe : piliers + w>=0.5
      } else if (!pilier) {
        const wEff = Math.min(1, h.w * wGhostsT);                            // ornements : respirent avec le tempo
        if (bassRng() >= wEff) continue;                                     // (piliers jamais tirés → immuables)
      }
      const fill = durFill[h.art] != null ? durFill[h.art] : 0.85;
      let gain = BASS_ART_GAIN[h.art] != null ? BASS_ART_GAIN[h.art] : 0.7;
      gain = bassVelShape(gain, prof);                                        // profil de vélocité (§2.2)
      if (h.art === 'ghost') gain *= ghostGainT;                             // adaptation tempo des ghosts (§2.3)
      gain = Math.max(0.02, Math.min(1, gain));
      // 5.4 : position swinguée AVANT le test de drop — le trou s'évalue sur ce qui sonne.
      const frac = (swingOn && h.i % 2 === 1) ? (h.i - 1 + 2 * sw) / pat.steps : h.i / pat.steps;
      let dur = Math.max(stepDur * fill * durTempo, 0.02);                    // plancher audible 20 ms
      if (dropOn) {
        const gm = (beat0 + frac * S.beats) % dropE;                          // position dans la période (temps)
        if (gm >= dropE - dropLen) continue;                                  // dans le trou : note supprimée
        // bord du trou : la queue legato s'éteint au bord — le silence reste net
        dur = Math.max(0.02, Math.min(dur, (dropE - dropLen - gm) * beatDur));
      }
      bassRealized.push({
        frac: frac,
        note: {
          freq: bassNoteFreq(S.bass.key, bar.deg, h.deg),
          art: h.art,
          gain: gain,
          dur: dur
        }
      });
    }
  }

  // Une réalisation par mesure, appelée depuis startNewCycle (indépendante de S.perc.on).
  function bassOnNewMeasure() {
    if (!S.bass.on) { bassRealized = []; return; }
    const prog = BASS_PROGS[S.bass.prog];
    bassBarIdx = (bassBarIdx + 1) % (prog ? prog.bars.length : 1);              // avance dans la progression
    bassRealize();
    bassUpdateChordLabel();                                                     // 5.3 : accord courant
  }

  // Réinitialise la progression au démarrage (mesure 1 = 1re barre).
  function bassResetCycle() { bassBarIdx = 0; if (S.bass.on) bassRealize(); else bassRealized = []; bassUpdateChordLabel(); }

  // Affiche l'accord courant (5.3, §7). En lecture avec basse active : l'accord de la mesure
  // en cours (bassBarIdx). Sinon (à l'arrêt ou basse coupée) : le 1er accord de la progression
  // sélectionnée dans la tonalité choisie — l'élève voit d'avance ce qu'il obtiendra.
  function bassUpdateChordLabel() {
    const prog = BASS_PROGS[S.bass.prog];
    const idx = (prog && S.bass.on && isPlaying) ? (bassBarIdx % prog.bars.length) : 0;
    const name = prog ? (bassChordName(S.bass.key, prog.bars[idx]) || '—') : '—';
    const el = $('bassChord'); if (el) el.textContent = name;
    const pl = $('playBassChord'); if (pl) pl.textContent = '♪ ' + name;   // 5.4 : écran de jeu
  }

  // 5.4 : miroir des commandes basse de l'écran de jeu — mêmes champs d'état que secBass,
  // synchro bidirectionnelle (les handlers de l'un rafraîchissent l'autre). En famille
  // ternaire, le groupe est désactivé : la basse est binaire en v1 (spec de passe §2.1).
  function bassPlayRefresh() {
    if (!$('playBassOn')) return;
    $('playBassOn').checked = !!S.bass.on;
    $('playBassDensity').value = String(S.bass.density);
    $('playBassDrop').checked = !!(S.bass.drop && S.bass.drop.on);
    const tern = S.family !== 'bin';
    const grp = $('playBassGroup');
    if (grp) {
      grp.classList.toggle('bass-tern', tern);
      grp.title = tern ? 'Basse funk : famille binaire uniquement (v1)' : '';
    }
    ['playBassOn', 'playBassDensity', 'playBassDrop'].forEach(id => { $(id).disabled = tern; });
    bassUpdateChordLabel();
  }

  // 5.4 : témoin d'activité de l'écran de jeu — la pastille d'accord pulse quand le curseur
  // franchit une frappe réalisée (position sonnée : pas au scheduling, qui est en avance de
  // lookahead). Relance l'animation CSS à chaque franchissement ; gère le retour de cycle.
  let bassPulsePhase = 0;
  function bassPulseCheck(phase) {
    const el = $('playBassChord');
    const a = bassPulsePhase; bassPulsePhase = phase;
    if (!el || !S.bass.on || S.family !== 'bin' || !bassRealized.length) return;
    const hit = bassRealized.some(n => a <= phase ? (n.frac > a && n.frac <= phase)
                                                  : (n.frac > a || n.frac <= phase));
    if (hit) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
  }

  // Seuil de diagnostic (même esprit que window.fmMetroAudio) : lecture + recalculs
  // idempotents (réalisation par mesure, computeCycle) déjà effectués en boucle pendant le
  // jeu — n'introduit aucune mutation nouvelle. Sert à la recette headless (recette-5-1.js).
  window.fmMetroBass = function () {
    return {
      state: S.bass,
      realize: function () { bassResetCycle(); return bassRealized.map(b => ({ frac: b.frac, note: b.note })); },
      bassEvents: function () { computeCycle(); return events.filter(e => e.layer === 'bass'); },
      noteFreq: bassNoteFreq,
      keyRootFreq: bassKeyRootFreq,
      // 5.3 : lecture de la barre courante (aucune mutation) — { barIdx, chord, name, rootFreq }.
      currentBar: function () {
        const prog = BASS_PROGS[S.bass.prog];
        const bar = prog ? prog.bars[bassBarIdx % prog.bars.length] : null;
        return bar ? { barIdx: bassBarIdx, chord: bar, name: bassChordName(S.bass.key, bar),
                       rootFreq: bassNoteFreq(S.bass.key, bar.deg, 'R') } : null;
      },
      // 5.3 : avance d'une mesure (diagnostic headless des progressions). Même mutation que le
      // scheduler via bassOnNewMeasure — pas d'un type nouveau. Renvoie la barre atteinte.
      newMeasure: function () {
        bassOnNewMeasure();
        const prog = BASS_PROGS[S.bass.prog];
        const bar = prog ? prog.bars[bassBarIdx % prog.bars.length] : null;
        return bar ? { barIdx: bassBarIdx, chord: bar, name: bassChordName(S.bass.key, bar),
                       rootFreq: bassNoteFreq(S.bass.key, bar.deg, 'R'),
                       notes: bassRealized.map(b => ({ frac: b.frac, note: b.note })) } : null;
      },
      // 5.3 : nom de l'accord de tête de la progression courante (key + degré + qualité).
      chordName: function () {
        const prog = BASS_PROGS[S.bass.prog];
        return prog ? bassChordName(S.bass.key, prog.bars[0]) : '';
      },
      // 5.2 : injection d'un RNG déterministe pour la recette headless du tirage probabiliste.
      // En prod, bassRng reste Math.random ; setRng(null) restaure ce défaut.
      setRng: function (fn) { bassRng = (typeof fn === 'function') ? fn : Math.random; return true; },
      // 5.4 : diagnostic headless des drop-outs — pose le compteur de mesures global (même
      // esprit que setRng ; en prod, seul le scheduler l'avance). Renvoie la valeur posée.
      setMeasure: function (n) { measureCount = Math.max(0, n | 0); return measureCount; },
      // 5.4 : recompute du cycle complet, comptes d'événements par couche — la recette
      // vérifie que percussion et pulsation restent intactes pendant un trou de basse.
      cycleEvents: function () {
        computeCycle();
        const by = {};
        for (const e of events) by[e.layer] = (by[e.layer] || 0) + 1;
        return by;
      },
      // 5.3-ter : lecture des nœuds de bus (diagnostic headless — limiteur, HP 35 Hz, réverb).
      bus: function () {
        return { limiter: masterLimiter, bassBus: bassBus, bassHP: bassHP, bassWet: bassWet, wetLevel: BASS_WET };
      },
      // 5.1-bis : sonde de synthèse. Construit le graphe d'une articulation via playBass
      // (self-contained : ensureCtx idempotent, aucune mutation d'état). Sert au smoke-test
      // headless (recette-5-1-bis.js) ; en prod, joue une note de contrôle à t=now.
      probeVoice: function (art, t) {
        ensureCtx();
        playBass(t != null ? t : audioCtx.currentTime,
          { freq: bassKeyRootFreq(S.bass.key), art: art || 'finger', gain: 0.7, dur: 0.18 });
        return true;
      }
    };
  };

  // Persistance localStorage (même mécanique que fm-metro-play).
  function bassPersist() { store.set('fm-metro-bass', JSON.stringify(S.bass)); }
  function bassRestore() {
    let saved = null;
    try { saved = JSON.parse(store.get('fm-metro-bass') || 'null'); } catch (e) {}
    if (saved && typeof saved === 'object') Object.assign(S.bass, saved);
    // garde-fous contre un état stocké par une étape ultérieure ou corrompu
    if (!BASS_PATTERNS[S.bass.pattern]) S.bass.pattern = 'theOne';
    if (!BASS_PROGS[S.bass.prog]) S.bass.prog = 'vamp1';
    if (BASS_PC[S.bass.key] == null) S.bass.key = 'E';
    if ([1, 2, 3].indexOf(S.bass.density) === -1) S.bass.density = 2;         // 5.2
    if (['plat', 'mixte', 'contraste'].indexOf(S.bass.vel) === -1) S.bass.vel = 'mixte';
    S.bass.vary = !!S.bass.vary;
    if (typeof S.bass.legato !== 'number' || !isFinite(S.bass.legato)) S.bass.legato = 0.25;  // 5.3c : défaut curseur 25 (L=1,25)
    S.bass.legato = Math.max(0, Math.min(1, S.bass.legato));
    S.bass.space = S.bass.space !== false;                                                    // 5.3-ter
    // 5.4 : drop-outs + suivi du swing — champs présents dans l'état depuis 5.0, AUCUNE
    // migration ; seuls des garde-fous de bornes/types sur un stockage hérité ou corrompu.
    if (!S.bass.drop || typeof S.bass.drop !== 'object') S.bass.drop = { on: false, everyN: 4, lenBeats: 2 };
    S.bass.drop.on = !!S.bass.drop.on;
    S.bass.drop.everyN = Math.max(1, Math.min(32, Math.round(+S.bass.drop.everyN) || 4));
    S.bass.drop.lenBeats = Math.max(1, Math.min(8, Math.round(+S.bass.drop.lenBeats) || 2));
    S.bass.swingFollow = S.bass.swingFollow !== false;
    $('bassOn').checked = !!S.bass.on;
    $('bassPattern').value = S.bass.pattern;
    $('bassProg').value = S.bass.prog;
    $('bassKey').value = S.bass.key;
    $('bassDensity').value = String(S.bass.density);
    $('bassVel').value = S.bass.vel;
    $('bassVary').checked = !!S.bass.vary;
    $('bassLegato').value = String(Math.round(S.bass.legato * 100));                          // 5.3-ter
    $('bassSpace').checked = !!S.bass.space;                                                  // 5.3-ter
    $('bassDropOn').checked = !!S.bass.drop.on;                                               // 5.4
    $('bassDropEvery').value = String(S.bass.drop.everyN);
    $('bassDropLen').value = String(S.bass.drop.lenBeats);
    $('bassSwingFollow').checked = !!S.bass.swingFollow;
    bassPlayRefresh();                                          // 5.4 : miroir écran de jeu + accord de tête
  }


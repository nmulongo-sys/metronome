/* ============================================================================
   Moteur — fm-audio.js (R-3a). synthèse (bus, timbres, playClick), calcul du cycle, ordonnanceur.
   TRANSPLANTATION VERBATIM du script principal du build 0.10.0 : sous cette
   bannière, AUCUNE ligne modifiée (preuve : recette-extraction.js ; seule la
   constante BUILD, dans fm-etat.js, suit le numéro de build courant).
   Portée : script classique, déclarations dans la portée globale partagée —
   chargé après corpus/*.js, avant le script principal (l'ordre compte).
   ============================================================================ */
'use strict';

  // ============ AUDIO ============
  function ensureCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = volMuted ? 0 : S.volume;
      // 5.3-ter : limiteur quasi-brickwall avant destination. Chevauchement legato + release
      // long + réverb s'additionnent → sans garde-fou, écrêtage garanti (+3 dBFS mesuré à
      // 82 BPM). Pas de sidechain : la basse doit rester une référence rythmique stable.
      // Défensif : les stubs headless des recettes 5-1 → 5-3-bis n'ont pas ce nœud.
      masterLimiter = null;
      if (typeof audioCtx.createDynamicsCompressor === 'function') {
        masterLimiter = audioCtx.createDynamicsCompressor();
        try {
          masterLimiter.threshold.value = -1.5;   // seuil (dBFS)
          masterLimiter.knee.value = 0;
          masterLimiter.ratio.value = 20;         // quasi-brickwall
          masterLimiter.attack.value = 0.003;
          masterLimiter.release.value = 0.12;
        } catch (e) {}
        masterGain.connect(masterLimiter);
        masterLimiter.connect(audioCtx.destination);
      } else {
        masterGain.connect(audioCtx.destination);
      }
      /* hook pour l'export audio (module externe) : lecture live via closure */
      window.fmMetroAudio = function(){ return { ctx: audioCtx, master: masterGain, playing: isPlaying }; };
      const len = audioCtx.sampleRate * 0.05;
      noiseBuf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(t, freq, vol, dur) {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(masterGain);
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.01);
  }

  function playNoise(t, freq, vol) {
    const src = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 4;
    src.connect(f); f.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(vol * 1.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    src.start(t); src.stop(t + 0.05);
  }

  /* ---- timbres percussifs ---- */
  // fût : sinus à chute de hauteur (basse de djembé, dunduns, grave de cajón)
  function percDrum(t, f0, f1, dur, vol) {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7);
    o.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // claqué : bruit filtré très bref (slap, aigu de cajón)
  function percSnap(t, freq, q, vol) {
    const src = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    src.connect(f); f.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(vol * 1.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    src.start(t); src.stop(t + 0.05);
  }
  // cloche : deux partiels carrés inharmoniques, décroissance rapide.
  // base = fondamentale (défaut 835 = cloche dunduns) ; l'agogô rappelle percBell
  // à deux hauteurs distantes d'une tierce pour ses deux tons (spec passe 3 §3.2).
  function percBell(t, vol, base) {
    const b = base || 835;
    for (const [f, v] of [[b, vol], [b * 1.49, vol * 0.55]]) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain(), bp = audioCtx.createBiquadFilter();
      o.type = 'square'; o.frequency.value = f;
      bp.type = 'bandpass'; bp.frequency.value = f * 1.05; bp.Q.value = 3;
      o.connect(bp); bp.connect(g); g.connect(masterGain);
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      o.start(t); o.stop(t + 0.13);
    }
  }
  // raclement (reco-reco) : train de grains de bruit filtrés en peigne — le racle
  // métallique. Timbre le plus dur du corpus (spec passe 3 §3.2, arbitrage C) : prototype
  // à ajuster à l'oreille. Un accent = coup long (aller-retour ample) ; sinon coup bref.
  function percScrape(t, vol, accent) {
    const grains = accent ? 11 : 7;        // densité du peigne = longueur perçue du raclement
    const span = accent ? 0.13 : 0.075;    // durée totale de la racle
    const f0 = 2100, f1 = 3300;            // le grain monte légèrement le long de la course
    const step = span / grains;
    for (let i = 0; i < grains; i++) {
      const frac = grains > 1 ? i / (grains - 1) : 0;
      const gt = t + frac * span;
      const src = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
      src.buffer = noiseBuf;
      f.type = 'bandpass'; f.frequency.value = f0 + (f1 - f0) * frac; f.Q.value = 6;
      src.connect(f); f.connect(g); g.connect(masterGain);
      const gv = vol * (0.42 + 0.22 * (i % 2));   // dents/creux alternés → grain de raclement
      g.gain.setValueAtTime(0.0001, gt);
      g.gain.linearRampToValueAtTime(gv, gt + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, gt + step * 0.9);
      src.start(gt, (i * 0.006) % 0.04);          // lecture décalée dans le buffer → grains décorrélés
      src.stop(gt + step + 0.005);
    }
  }

  // cimbalette (0.6.2) : jingles métalliques d'un tambourin monté sur la tapa — souffle
  // de bruit passe-haut (le « chh » des rondelles) + grappe de partiels aigus inharmoniques
  // (l'éclat). Zéro dépendance (réutilise noiseBuf). Timbre à régler à l'oreille, comme
  // percScrape et la basse : la recette headless n'en juge pas le son, seulement le routage.
  function percJingle(t, vol, accent) {
    // souffle métallique bref
    const src = audioCtx.createBufferSource(), ng = audioCtx.createGain(), hp = audioCtx.createBiquadFilter();
    src.buffer = noiseBuf;
    hp.type = 'highpass'; hp.frequency.value = 5000; hp.Q.value = 0.7;
    src.connect(hp); hp.connect(ng); ng.connect(masterGain);
    ng.gain.setValueAtTime(vol * 0.7, t);
    ng.gain.exponentialRampToValueAtTime(0.0008, t + (accent ? 0.15 : 0.09));
    src.start(t); src.stop(t + 0.22);
    // partiels aigus inharmoniques (rondelles qui tintent) — profil « tintant » (V1, réglé à
    // l'oreille sur Trust GXT) : 6 partiels triangle plus hauts et plus étalés, décroissance
    // longue → shimmer métallique, moins de buzz que les carrés.
    const parts = [5400, 7300, 9100, 11300, 13200, 15100];
    for (let i = 0; i < parts.length; i++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'triangle'; o.frequency.value = parts[i] * (1 + 0.02 * i);
      o.connect(g); g.connect(masterGain);
      g.gain.setValueAtTime(Math.max(0.015, vol * (0.13 - i * 0.018)), t);
      g.gain.exponentialRampToValueAtTime(0.0006, t + (accent ? 0.22 : 0.14));
      o.start(t); o.stop(t + 0.28);
    }
  }

  /* ---- basse funk (passe 5 §3 ; refonte 5.1-bis : audibilité HP Android) --------
     Le grave (~41 Hz en E) est INAUDIBLE sur un petit haut-parleur. On s'appuie sur
     la FONDAMENTALE VIRTUELLE : un exciteur harmonique (WaveShaper) génère 2f/3f/4f…
     dans la bande ~150–800 Hz que le HP restitue, et l'oreille reconstruit la hauteur.
     Ce même « growl » porte le caractère funk (doigté/slap). Corps en SAWTOOTH (toutes
     harmoniques, 1/n) ≫ triangle (impaires seules, 1/n²) : c'est ce qui rendait la voix
     muette. Le passe-bas de l'exciteur ne redescend plus sous ~600–900 Hz (il tombait à
     120 Hz et étranglait les 3f–8f porteuses). Voix UNIQUE paramétrée par `opt` ; les opt
     sont FIXES ici — 5.2 les modulera par vel/tempo (la brillance = le même levier). */

  // Courbes de saturation du WaveShaper, en cache par niveau de drive. tanh légèrement
  // asymétrique : sature un peu plus les alternances positives → ajoute la 2f (octave),
  // qui renforce la hauteur perçue en plus des impaires du growl.
  const _bassCurves = {};
  function bassShaperCurve(drive) {
    const key = drive.toFixed(2);
    if (_bassCurves[key]) return _bassCurves[key];
    const n = 2048, curve = new Float32Array(n), norm = Math.tanh(drive) || 1;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;               // -1..1
      const a = x >= 0 ? 1 : 0.7;                     // asymétrie douce → harmoniques paires
      curve[i] = Math.tanh(drive * a * x) / norm;    // borné sur ±1
    }
    return (_bassCurves[key] = curve);
  }

  // Réglages par articulation (opt fixes en 5.1-bis ; 5.2 modulera drive/cutoff par vel/tempo).
  // Gains body+exciter tenus ≤ ~1.1 avant enveloppe pour éviter l'écrêtage sur slaps forts.
  const BASS_ART_OPT = {
    finger: { drive: 2.2, cutoffCeil: 1800, cutoffFloor: 700, attack: 0.008, bodyGain: 0.38, exciterGain: 0.70 },
    slap:   { drive: 3.4, cutoffCeil: 2600, cutoffFloor: 800, attack: 0.004, bodyGain: 0.38, exciterGain: 0.80, transient: true },
    pop:    { drive: 2.8, cutoffCeil: 3200, cutoffFloor: 900, attack: 0.003, bodyGain: 0.38, exciterGain: 0.75 },
    ghost:  { drive: 1.6, cutoffCeil: 1200, cutoffFloor: 600, attack: 0.006, bodyGain: 0.28, exciterGain: 0.50 }
  };

  // 5.3-ter : bus de la couche basse (créé au premier bassVoice — no-op strict si la basse
  // reste coupée). Chaîne : voix → bassBus → high-pass 35 Hz → [sec + réverb courte] → master.
  // High-pass : E1 = 41,2 Hz est la note la plus basse possible (résolveur replié 41–~78 Hz),
  // la fondamentale n'est jamais touchée — seule la « boue » sub-sonique part. Réverb :
  // impulsion générée à la volée (bruit × décroissance expo, ~0,35 s, 2 canaux décorrélés),
  // mix bas — la traîne d'espace sans flouter l'attaque ni le time. Percussions : jamais
  // routées ici (netteté du métronome). Défensif si createConvolver absent (stubs headless).
  const BASS_WET = 0.12;                                        // mix réverb « discret »
  function bassReverbImpulse() {
    const sr = audioCtx.sampleRate, len = Math.max(1, Math.floor(sr * 0.35));
    const buf = audioCtx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    return buf;
  }
  function ensureBassBus() {
    if (bassBus) return;
    bassBus = audioCtx.createGain(); bassBus.gain.value = 1;
    bassHP = audioCtx.createBiquadFilter();
    bassHP.type = 'highpass'; bassHP.frequency.value = 35; bassHP.Q.value = 0.7;
    bassBus.connect(bassHP);
    bassHP.connect(masterGain);                                 // chemin sec (toujours présent)
    bassWet = null;
    if (typeof audioCtx.createConvolver === 'function') {
      const conv = audioCtx.createConvolver();
      conv.buffer = bassReverbImpulse();
      bassWet = audioCtx.createGain();
      bassWet.gain.value = S.bass.space ? BASS_WET : 0;
      bassHP.connect(conv); conv.connect(bassWet); bassWet.connect(masterGain);
    }
  }

  // Voix de basse unique. Chaîne : osc saw → [corps propre LP doux] + [exciteur : shaper → LP
  // à plancher haut] → gain d'enveloppe → bus basse → master. `opt` = BASS_ART_OPT[art].
  function bassVoice(t, freq, vol, dur, opt) {
    const o = opt || {};
    const drive       = o.drive       != null ? o.drive       : 2.2;
    const cutoffCeil  = o.cutoffCeil  != null ? o.cutoffCeil  : 1800;
    const cutoffFloor = o.cutoffFloor != null ? o.cutoffFloor : 700;   // plancher relevé (était 120)
    const attack      = o.attack      != null ? o.attack      : 0.008;
    const bodyGain    = o.bodyGain    != null ? o.bodyGain    : 0.38;  // vraie fondamentale (bons HP/casque)
    const exciterGain = o.exciterGain != null ? o.exciterGain : 0.70;  // harmoniques (portent le grave sur petit HP)

    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = freq;

    // Enveloppe d'amplitude (5.3-bis) : attaque → petite décroissance vers un niveau de TENUE
    // (le corps de la note) → maintien à ce niveau → release bref. Remplace le pluck-vers-zéro
    // (attaque puis mort immédiate) qui rendait toute note staccato et sans corps. Le caractère
    // piqué, quand on le veut (ghost court), vient désormais de la DURÉE, pas de la forme.
    const g = audioCtx.createGain();
    const pk  = Math.max(vol, 0.0002);                        // pic d'attaque
    const sus = Math.max(vol * 0.78, 0.0002);                 // niveau de tenue (corps)
    // 5.3-ter : release piloté par le curseur — la note s'éteint au lieu de se couper.
    // 5.3c : fenêtre recalibrée d'après l'écoute (92 BPM) — l'ancien max (L=1) devient le
    // plancher : L = 1 + fraction ∈ [1, 2], de 180 ms/×0,50 à 300 ms/×0,70 (210 ms/×0,55
    // au défaut). Le ghost, court, est borné mécaniquement par sa durée — il reste piqué.
    const L = 1 + Math.max(0, Math.min(1, S.bass.legato != null ? S.bass.legato : 0.25));
    const rel = Math.min(0.06 + 0.12 * L, dur * (0.30 + 0.20 * L));
    const dEnd = t + attack + Math.min(0.03, dur * 0.18);     // fin de la décroissance vers le sustain
    const hEnd = Math.max(dEnd + 0.005, t + dur - rel);       // fin de tenue (début du release)
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pk, t + attack);      // attaque : douce (finger) → vive (slap/pop)
    g.gain.exponentialRampToValueAtTime(sus, dEnd);           // → niveau de tenue
    g.gain.setValueAtTime(sus, hEnd);                         // MAINTIEN du corps jusqu'ici
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);     // release
    ensureBassBus();
    g.connect(bassBus);                                        // 5.3-ter : → bus basse (HP 35 Hz + réverb)

    // Branche 1 — corps propre : LP doux, conserve la vraie fondamentale.
    const bodyF = audioCtx.createBiquadFilter();
    bodyF.type = 'lowpass'; bodyF.Q.value = 0.7;
    bodyF.frequency.value = Math.max(freq * 4, 220);
    const bodyG = audioCtx.createGain(); bodyG.gain.value = bodyGain;
    osc.connect(bodyF); bodyF.connect(bodyG); bodyG.connect(g);

    // Branche 2 — exciteur harmonique : shaper (growl + 2f/3f…) → LP à plancher haut.
    const shaper = audioCtx.createWaveShaper();
    shaper.curve = bassShaperCurve(drive);
    if ('oversample' in shaper) shaper.oversample = '4x';               // anti-alias
    const exF = audioCtx.createBiquadFilter();
    exF.type = 'lowpass'; exF.Q.value = 3;
    // 5.3-ter : le sweep ne se referme plus pendant la tenue — descente vers un PALIER
    // (l'exciteur reste ouvert, le corps porte au lieu de filer), maintien, puis fermeture
    // vers le plancher pendant le release seulement. L'écart attaque→corps mesuré (~6 dB)
    // venait pour moitié de cette fermeture précoce.
    const cutHold = cutoffFloor + 0.35 * (cutoffCeil - cutoffFloor);
    const tHold = t + Math.max(dur * 0.5, 0.04);
    exF.frequency.setValueAtTime(cutoffCeil, t);
    exF.frequency.exponentialRampToValueAtTime(cutHold, tHold);
    exF.frequency.setValueAtTime(cutHold, Math.max(t + dur - rel, tHold));
    exF.frequency.exponentialRampToValueAtTime(cutoffFloor, t + dur);
    const exG = audioCtx.createGain(); exG.gain.value = exciterGain;
    osc.connect(shaper); shaper.connect(exF); exF.connect(exG); exG.connect(g);

    osc.start(t); osc.stop(t + dur + 0.02);

    // Transitoire optionnel (slap : claquement de pouce, bruit passe-haut bref).
    if (o.transient) {
      const src = audioCtx.createBufferSource(), ng = audioCtx.createGain(), nf = audioCtx.createBiquadFilter();
      src.buffer = noiseBuf; nf.type = 'highpass'; nf.frequency.value = 2200; nf.Q.value = 0.7;
      src.connect(nf); nf.connect(ng); ng.connect(bassBus);   // 5.3-ter : via le bus basse
      ng.gain.setValueAtTime(vol * 0.5, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      src.start(t); src.stop(t + 0.04);
    }
  }

  // routeur : une note {freq, art, gain, dur} → la voix paramétrée. ghost = voix courte/basse/mate.
  function playBass(t, note) {
    if (!note) return;
    const dur = note.dur || 0.18, freq = note.freq || 82, vol = note.gain != null ? note.gain : 0.7;
    const art = note.art || 'finger';
    if (art === 'ghost') { bassVoice(t, freq, vol, Math.min(dur, 0.08), BASS_ART_OPT.ghost); return; }
    bassVoice(t, freq, vol, dur, BASS_ART_OPT[art] || BASS_ART_OPT.finger);
  }

  function playPerc(t, voice, accent) {
    // passe 3 étape 1 : l'identité de timbre est portée par la VOIX (percMeta), plus par le
    // global S.perc.instr — plusieurs instruments peuvent sonner en même temps. Repli sur le
    // focal si une voix n'a pas (encore) de méta → comportement passe 2 strictement inchangé.
    const meta = percMeta[voice];
    const instr = meta ? meta.instr : S.perc.instr;
    // voix clave : timbre cloche — rendu identique à l'ancienne couche clave,
    // la hauteur (grave/aiguë) est portée par la voix (spec passe 2 §4)
    if (instr === 'clave') {
      const freq = meta ? meta.freq : ((CLAVE_VOICES.find(x => x.id === voice) || {}).freq || 1800);
      const vc = accent === 2 ? 0.95 : 0.6;
      playNoise(t, freq, vc);
      playTone(t, freq, vc * 0.5, 0.03);
      return;
    }
    const kind = meta ? meta.voiceKind : voice;
    const v = (accent === 2 ? 1.0 : 0.8) * 0.9;
    switch (instr + '.' + kind) {
      case 'djembe.basse':     percDrum(t, 95, 52, 0.30, v); break;
      case 'djembe.tone':      percDrum(t, 230, 165, 0.13, v * 0.85); break;
      case 'djembe.slap':      percSnap(t, 2400, 1.2, v); percDrum(t, 420, 300, 0.05, v * 0.25); break;
      case 'cajon.grave':      percDrum(t, 115, 68, 0.17, v); break;
      case 'cajon.aigu':       percSnap(t, 1700, 0.9, v); percSnap(t, 3400, 2, v * 0.5); break;
      // variante cajón + cimbalette (0.6.2) : grave/aigu = timbres cajón ; cimbalette = jingles métalliques
      case 'cajoncym.grave':      percDrum(t, 115, 68, 0.17, v); break;
      case 'cajoncym.aigu':       percSnap(t, 1700, 0.9, v); percSnap(t, 3400, 2, v * 0.5); break;
      case 'cajoncym.cimbalette': percJingle(t, v * 0.8, accent === 2); break;
      case 'dunduns.dundunba': percDrum(t, 72, 48, 0.42, v * 1.1); break;
      case 'dunduns.sangban':  percDrum(t, 112, 78, 0.30, v); break;
      case 'dunduns.kenkeni':  percDrum(t, 175, 132, 0.20, v * 0.8); break;
      case 'dunduns.cloche':   percBell(t, v * 0.6); break;
      // passe 3 étape 2 — nouveaux timbres (§3.2) : agogô/surdo re-paramètrent
      // percBell/percDrum ; reco-reco appelle le prototype granulaire dédié.
      case 'agogo.grave':      percBell(t, v * 0.7, 720); break;   // les deux tons de l'agogô
      case 'agogo.aigu':       percBell(t, v * 0.7, 900); break;   // sont distants d'une tierce
      case 'surdo.grave':      percDrum(t, 60, 38, 0.55, v * 1.15); break;   // fût grave à chute lente
      case 'surdo.marcante':   percDrum(t, 92, 60, 0.38, v); break;         // surdo aigu (marcante)
      case 'recoreco.raclement': percScrape(t, v, accent === 2); break;
    }
  }

  // mutes métier hors-gap : mutes de voix (checkbox) et appel-réponse.
  // Le gap — global ou ciblé — vit dans updateGapForNewMeasure/gapTargets (étape 4).
  // brk : les frappes de break traversent les mutes de voix (le break = tout le kit)
  // Les voix clave vivent dans la même liste : leur mute vaut même percussion désactivée ;
  // l'appel-réponse ne concerne que les voix d'instrument.
  function percLayerMuted(layer, voice, brk) {
    if (layer !== 'perc') return false;
    if (!brk && percMuted[voice]) return true;
    if (S.perc.on && percCallSilent && !claveData[voice] &&
        (percWork === 'all' || voice === percWork)) return true;
    // team spirit (passe 3 étape 4) : focal en sourdine + solo/mute par participant
    if (typeof tsMuted === 'function' && tsMuted(voice, brk)) return true;
    return false;
  }

  function playClick(t, layer, accent, voice, brk, note) {
    if (mutedThisCycle && gapTargets(layer, voice)) return;
    // clic muet : le métronome se tait (pulsation, subdivisions, clic décalé),
    // les couches à grille (clave, percussion) et la polyrythmie continuent
    if (S.sound.pulseMuted && (layer === 'beat' || layer === 'sub' || layer === 'shift')) return;
    if (accompMuted && (layer === 'perc' || layer === 'bass')) return;
    if (percLayerMuted(layer, voice, brk)) return;
    if (layer === 'perc') { playPerc(t, voice, accent); return; }
    // passe 5 : basse funk (accompagnement) — la note porte freq/art/gain/dur (§4.3)
    if (layer === 'bass') { playBass(t, note); return; }
    const st = S.sound;
    switch (layer) {
      case 'beat': {
        const f = accent ? st.pulseFreq * 1.5 : st.pulseFreq;
        const v = accent ? 1.0 : 0.75;
        st.type === 'sec' ? playNoise(t, f, v) : playTone(t, f, v, 0.05);
        break;
      }
      case 'sub':
        st.type === 'sec' ? playNoise(t, st.pulseFreq * 0.7, 0.3) : playTone(t, st.pulseFreq * 0.7, 0.3, 0.04);
        break;
      case 'poly':
        playTone(t, 480, 0.55, 0.06);
        break;
      case 'shift':
        playTone(t, S.shift.freq, 0.85, 0.08);
        break;
    }
  }

  // ============ CALCUL DU CYCLE ============
  function subPositions() {
    const n = S.subdiv, sw = S.swing / 100;
    if (n === 1) return [0];
    if (n === 3) return [0, 1/3, 2/3];
    const pos = [];
    const pairDur = 2 / n;
    for (let p = 0; p < n / 2; p++) {
      pos.push(p * pairDur);
      pos.push(p * pairDur + pairDur * sw);
    }
    return pos;
  }

  function computeCycle() {
    cycleDur = S.beats * 60 / S.tempo;
    events = [];
    const subs = subPositions();
    for (let b = 0; b < S.beats; b++) {
      for (let s = 0; s < subs.length; s++) {
        const frac = (b + subs[s]) / S.beats;
        if (s === 0) {
          events.push({ frac, layer: 'beat', accent: (b === 0 && S.accentFirst) ? 1 : 0 });
          if (S.shift.on) events.push({ frac, layer: 'shift', offMs: S.shift.ms });
        } else {
          events.push({ frac, layer: 'sub' });
        }
      }
    }
    for (let k = 0; k < S.poly; k++) {
      events.push({ frac: k / S.poly, layer: 'poly' });
    }
    // couches à grille — UN SEUL chemin de génération pour un seul concept
    // « voix rythmique à grille et accent » (spec passe 2 §4). Les voix clave
    // sont toujours actives ; les voix d'instrument exigent S.perc.on et
    // s'effacent pendant le break (remplacées) ou la mesure de réponse (silence).
    for (const vid in percGrids) {
      const isClave = !!claveData[vid];
      if (!isClave && (!S.perc.on || percBreakActive || percBreakEchoNow)) continue;
      const g = percGrids[vid];
      const n = g.length;
      for (let i = 0; i < n; i++) {
        if (g[i] > 0) {
          const off = (percOffsets[vid] && percOffsets[vid][i]) || 0;
          events.push({ frac: (((i + off) / n) % 1 + 1) % 1, layer: 'perc', voice: vid, accent: g[i] });
        }
      }
    }
    if (S.perc.on && percBreakActive) {
      for (const e of percBreakEvents()) events.push(e);
    }
    // couche basse funk (passe 5) — accompagnement hors percGrids ; famille binaire (v1).
    // Les notes sont réalisées par mesure (bassOnNewMeasure/bassResetCycle) → simple recopie.
    if (S.bass.on && S.family === 'bin') {
      for (const b of bassRealized) events.push({ frac: b.frac, layer: 'bass', note: b.note, offMs: S.bass.feelMs || 0 });
    }
    events.sort((a, b) => a.frac - b.frac);
    evIdx = 0;
  }

  // ============ ORDONNANCEUR ============
  function startNewCycle(t) {
    measureCount++;
    totalBeats += S.beats;
    scriptOnNewMeasure();
    updateGapForNewMeasure();
    percOnNewMeasure();
    bassOnNewMeasure();
    computeCycle();
    cycleStart = t;
  }

  function scheduler() {
    if (PERF_HUD) {
      const nowMs = performance.now();
      if (perfStats.lastTick) {
        const j = Math.abs(nowMs - perfStats.lastTick - LOOKAHEAD_MS);
        if (j > perfStats.jitterMax) perfStats.jitterMax = j;
      }
      perfStats.lastTick = nowMs;
    }
    const now = audioCtx.currentTime;
    while (true) {
      if (evIdx < events.length) {
        const ev = events[evIdx];
        const t = cycleStart + ev.frac * cycleDur + (ev.offMs ? ev.offMs / 1000 : 0);
        if (t < now + AHEAD) {
          if (PERF_HUD && t - now < perfStats.minMargin) perfStats.minMargin = Math.max(0, t - now);
          playClick(Math.max(t, now + 0.005), ev.layer, ev.accent || 0, ev.voice, ev.brk, ev.note);
          evIdx++;
          continue;
        }
      } else {
        const nextStart = cycleStart + cycleDur;
        if (nextStart < now + AHEAD) { startNewCycle(nextStart); continue; }
      }
      break;
    }
  }

  function start() {
    ensureCtx();
    isPlaying = true;
    measureCount = 0;
    totalBeats = 0;
    bowReset();
    resetGap();
    percResetBreakState();
    percMeasures = 0; percCallSilent = false;
    mutedThisCycle = false;
    bassResetCycle();
    computeCycle();
    cycleStart = audioCtx.currentTime + 0.1;
    schedulerTimer = setInterval(scheduler, LOOKAHEAD_MS);
    $('startBtn').textContent = '■ Arrêter';
    $('startBtn').classList.add('playing');
    wakeLockUpdate();
    if (atelierOpen) atelierRender();
    requestAnimationFrame(draw);
  }

  function stop() {
    isPlaying = false;
    clearInterval(schedulerTimer);
    if (PERF_HUD) perfStats.lastTick = 0;
    $('startBtn').textContent = '▶ Démarrer';
    $('startBtn').classList.remove('playing');
    $('percFsPlay').textContent = '▶';
    statusLineLast = null;
    $('statusLine').textContent = 'Arrêté';
    wakeLockUpdate();
    if (atelierOpen) atelierRender();
    drawStatic();
  }

  function toggle() { isPlaying ? stop() : start(); }


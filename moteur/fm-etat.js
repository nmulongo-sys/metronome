/* ============================================================================
   Moteur — fm-etat.js (R-3a). assemblage des corpus (FM_ASM), état partagé (S), build, persistance (store).
   TRANSPLANTATION VERBATIM du script principal du build 0.10.0 : sous cette
   bannière, AUCUNE ligne modifiée (preuve : recette-extraction.js ; seule la
   constante BUILD, dans fm-etat.js, suit le numéro de build courant).
   Portée : script classique, déclarations dans la portée globale partagée —
   chargé après corpus/*.js, avant le script principal (l'ordre compte).
   ============================================================================ */
'use strict';

  // ============ CORPUS (R-2) ============
  // Les contenus pédagogiques (exercices, modules, niveaux) et les tables
  // d'accompagnement (patterns, progressions, instruments) vivent dans
  // corpus/*.js (window.FM_CORPUS, schéma spec R-1 §4.1). La coquille les
  // assemble ici ; toute collision d'identifiant entre corpus est bloquante.
  const FM_ASM = (() => {
    const C = window.FM_CORPUS || {};
    const out = { exercices: {}, modules: {}, patterns: {}, progressions: {}, instruments: {},
                  niveaux: { debutant: [], intermediaire: [], avance: [], artiste: [] } };
    const fond = (dst, src, quoi, cid) => {
      for (const k of Object.keys(src || {})) {
        if (Object.prototype.hasOwnProperty.call(dst, k))
          throw new Error('FM_CORPUS : collision ' + quoi + ' \u00ab ' + k + ' \u00bb (corpus ' + cid + ')');
        dst[k] = src[k];
      }
    };
    for (const cid of Object.keys(C)) {
      const c = C[cid];
      fond(out.exercices, c.exercices, 'exercice', cid);
      fond(out.modules, c.modules, 'module', cid);
      fond(out.patterns, c.patterns, 'pattern', cid);
      fond(out.progressions, c.progressions, 'progression', cid);
      fond(out.instruments, c.instruments, 'instrument', cid);
      for (const niv of Object.keys(c.niveaux || {})) {
        if (!(c.niveaux[niv] || []).length) continue;
        if (out.niveaux[niv] && out.niveaux[niv].length)
          throw new Error('FM_CORPUS : collision niveau \u00ab ' + niv + ' \u00bb (corpus ' + cid + ')');
        out.niveaux[niv] = c.niveaux[niv].slice();
      }
    }
    return out;
  })();


  // ============ ÉTAT ============
  const S = {
    tempo: 92,
    beats: 4,
    subdiv: 1,
    accentFirst: true,
    family: 'bin',   // 'bin' (16) | 'tern' (12) — grille commune clave + perc
    swing: 50,
    shift: { on: false, ms: 25, freq: 220 },
    /* passe 2 (étape 3) : plus de racine clave — la clave = deux voix de la liste
       unique (CLAVE_VOICES/claveData), grilles dans percGrids comme toute voix */
    poly: 0,
    /* passe 2 (étape 4) : gap unifié — une seule machine à états, un ciblage.
       target : 'all' (tout, comportement classique) | 'pulse' (clic seul) | <voiceId> */
    gap: { mode: 'off', target: 'all', playN: 4, muteM: 1, prob: 25 },
    sound: { pulseFreq: 1000, type: 'ton', pulseMuted: false },
    perc: { on: false, instr: 'djembe', count: 16, mode: 'off', period: 2,
            breakId: '', breakLevel: 4, breakAuto: false, breakEcho: false,
            handRule: 'alt', lefty: false },
    /* passe 4 (étape 4.1) : écran de jeu — qui je suis ; learn/learnPaused posés
       dès 4.1 (mémorisés à l'accueil), exploités par l'apprentissage en 4.2.
       n = nombre de joueurs choisi à l'accueil ; showBacking = affichage (pas l'audio). */
    play: { who: 'solo', learn: false, learnPaused: false, n: 1, showBacking: true },
    /* passe 5 (étape 5.1) : basse funk générative (accompagnement, FUNK-I2).
       Forme complète de la spec §2 posée dès 5.1 ; seuls on/pattern/prog/key sont
       exploités ici (chemin DÉTERMINISTE : piliers + pas w>=0.5). density/vel/vary
       (probabiliste, §2.2-2.3) → 5.2 ; progressions supplémentaires → 5.3 ;
       drop-outs → 5.4. La basse est hors percGrids : indépendante de S.perc.on. */
    bass: {
      on: false,
      pattern: 'theOne',   // gabarit d'intentions (BASS_PATTERNS) — 5.1 : theOne seul
      prog: 'vamp1',       // progression harmonique (BASS_PROGS) — 5.1 : vamp1 seul
      key: 'E',            // tonalité chromatique (12) — défaut E (mi, standard basse)
      density: 2,          // 1 allégé · 2 normal · 3 chargé (exploité en 5.2)
      vel: 'mixte',        // 'plat' | 'mixte' | 'contraste' (exploité en 5.2)
      vary: false,         // variations probabilistes (5.2) ; 5.1 reste déterministe
      legato: 0.25,        // 5.3c : curseur « lié ↔ très lié » (fraction 0–1 → L = 1+f) — durées + release
      space: true,         // 5.3-ter : réverb courte sur la basse seule (off/discret)
      swingFollow: true,   // 5.4 : les 16es de la basse suivent S.swing (pas impairs, FUNK-T3)
      feelMs: 0,           // R-3b : feel — décalage ms de la couche basse (posé < 0 < poussé, −25…+25) ; 0 = grille stricte, chemin identique
      drop: { on: false, everyN: 4, lenBeats: 2 }   // 5.4 : trou de lenBeats temps en fin de période de everyN mesures
    },
    volume: 0.8
  };

  // Identité du build affichée dans l'en-tête (5.3-bis). Bumper à chaque passe : elle sert à
  // savoir de quel build vient un enregistrement de validation.
  const BUILD = 'metronomefunk-0.18.0', BUILD_DATE = '2026-07-17';

  let audioCtx = null, masterGain = null, noiseBuf = null;
  let masterLimiter = null;                                   // 5.3-ter : limiteur de bus master
  let bassBus = null, bassHP = null, bassWet = null;          // 5.3-ter : bus de la couche basse
  let isPlaying = false;
  let schedulerTimer = null;
  // P3 0.7.0 (C12) : fenêtre de pré-planification élargie 0.12 → 0.20 s — plus de
  // résilience quand le fil principal est occupé (rendu, GC) sur mobile modeste.
  const LOOKAHEAD_MS = 25, AHEAD = 0.20;
  // P1 0.7.0 (C12) : HUD de mesure sous flag URL uniquement — aucun effet sans ?perfhud=1.
  const PERF_HUD = /[?&]perfhud=1/.test(location.search);
  const perfStats = { lastTick: 0, jitterMax: 0, minMargin: Infinity, frames: 0, fps: 0, lastFpsT: 0 };
  let perfHudEl = null;
  function perfHudRender() {
    if (!perfHudEl) return;
    perfHudEl.textContent =
      'gigue ordonnanceur max : ' + perfStats.jitterMax.toFixed(1) + ' ms\n' +
      'marge audio min : ' + (perfStats.minMargin === Infinity ? '—' : (perfStats.minMargin * 1000).toFixed(0) + ' ms') + '\n' +
      'fps : ' + perfStats.fps;
    perfStats.jitterMax = 0; perfStats.minMargin = Infinity;
  }
  if (PERF_HUD) {
    document.addEventListener('DOMContentLoaded', () => {
      perfHudEl = document.createElement('div');
      perfHudEl.id = 'perfHud';
      perfHudEl.setAttribute('aria-hidden', 'true');
      const st = perfHudEl.style;
      st.position = 'fixed'; st.bottom = '8px'; st.left = '8px'; st.zIndex = '99';
      st.background = 'rgba(10,8,4,.78)'; st.color = '#b6e3a8';
      st.fontFamily = 'Consolas,Menlo,monospace'; st.fontSize = '12px'; st.lineHeight = '1.5';
      st.padding = '6px 9px'; st.borderRadius = '6px';
      st.pointerEvents = 'none'; st.whiteSpace = 'pre';
      document.body.appendChild(perfHudEl);
      setInterval(perfHudRender, 1000);
    });
  }

  let cycleStart = 0, cycleDur = 1, events = [], evIdx = 0, totalBeats = 0;
  let measureCount = 0, mutedThisCycle = false;
  let gapRemainPlay = 0, gapRemainMute = 0, gapProgSize = 1;
  let gapMuteTotal = 0, gapMuteDone = 0, gapCrossed = 0;      // 0.6.6 (C15) : position dans la coupure + coupures traversées
  let volMuted = false;                                       // 0.6.6 (C15) : sourdine générale 1-clic
  let bassBarIdx = 0, bassRealized = [];   // passe 5 : position dans la progression + notes réalisées de la mesure
  let bassRng = Math.random;               // 5.2 : RNG du tirage probabiliste. Prod = Math.random ;
                                           // la recette headless injecte un générateur déterministe via fmMetroBass().setRng.
  let script = null;
  let tapTimes = [];

  const $ = id => document.getElementById(id);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
        // 0.6.6 (C8) : premier enregistrement d'un réglage après l'init → toast unique de la session
        if (!store._toasted && window.__fmReady && String(k).indexOf('fm-metro-') === 0) {
          store._toasted = true; fmToast('✓ Réglages enregistrés automatiquement');
        }
      } catch (e) {}
    }
  };

  // 0.6.6 (C8) : toast discret non bloquant (aria-live, disparaît seul)
  let toastTimer = null;
  function fmToast(msg) {
    let el = document.getElementById('fmToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fmToast'; el.className = 'fm-toast'; el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }


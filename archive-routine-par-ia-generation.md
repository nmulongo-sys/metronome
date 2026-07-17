# Archive — Génération de routine par IA (langage naturel → script)

> **But de ce document.** Préserver, avant suppression de la branche
> `claude/free-ai-api-integration-4nh0o0`, les **2 seuls commits** de cette branche
> qui n'ont jamais été fusionnés dans `main` ni portés par aucune PR ouverte/close
> — le reste de la branche n'étant que des docs `passe3` déjà conservées sur
> `passe3`/`deploy-passe3`. Le code ci-dessous est reproduit **verbatim** : cette
> archive suffit à reconstruire la fonctionnalité sans la branche.

## Provenance

| | |
|---|---|
| Branche source | `claude/free-ai-api-integration-4nh0o0` (à supprimer au ménage) |
| Commit 1 | `6d541ac` — « feat(routine): génération de routine par IA (langage naturel → script) » — 8 juil. 2026 |
| Commit 2 | `1c40b6b` — « feat(routine): brancher le proxy déployé par défaut » — 9 juil. 2026 |
| Fichiers touchés | `index.html` (bloc HTML + JS), `README.md` (section) |
| Écrite sur | l'**ancien** `index.html` monolithique (ère ~0.5.x, **pré-refonte R**) |
| Statut | jamais mergée ; non reprise par la refonte multi-pages (0.8.0 → 0.18.0) |

**Pourquoi elle n'est pas en prod** : la refonte modulaire (R-0…R-5) a reconstruit
`index.html` et déplacé la « Routine programmée » ; cette fonctionnalité n'a pas été
transplantée. Elle reste **ré-intégrable** aujourd'hui : ses dépendances
(`parseScript`, la section `#secScript`, la zone `#scriptArea`, les utilitaires
`store` et `$`) **existent toujours** dans `index.html` et `pratiquer.html` en 0.18.0.

## Ce que fait la fonctionnalité

Dans la section **« Routine programmée »** (mode expert), au lieu d'écrire le script
de routine à la main, l'utilisateur **décrit sa séance en langage naturel** (« montée
de 70 à 130 BPM sur 20 min, coupures vers la fin, finir en swing léger »). Le bouton
**« ✨ Générer la routine »** appelle un proxy Gemini, nettoie la réponse (retrait
d'éventuelles clôtures markdown), remplit `#scriptArea` et **valide via `parseScript`**
(compte des instructions, ou message d'erreur à corriger). Le script généré reste
**éditable avant « Lancer »**.

### Contrat du proxy (Cloudflare Worker, hors de ce dépôt)

- **Requête** : `POST <url>`, corps JSON `{ prompt: string, temperature: number }`.
- **Réponse OK** : JSON `{ text: string }` (le script généré, éventuellement en bloc ```).
- **Réponse KO** : statut non-2xx et/ou `{ error: string }`.
- Le Worker cache une **clé Google Gemini partagée** : aucune clé n'est embarquée
  dans la page statique publique. C'est **le même Worker que Magic Drums** ; recette
  de déploiement dans le dossier `proxy/` du dépôt
  [`nmulongo-sys/magic-drums`](https://github.com/nmulongo-sys/magic-drums).
- **Défaut** : `https://gemini-proxy.nmulongo.workers.dev` (constante `IA_PROXY_DEFAULT`).
- **Surcharge** : champ « Réglages IA », mémorisé en `localStorage`
  (`metro_ia_proxy_v1`), pour pointer un autre proxy.

> ⚠️ Note de comportement du 2ᵉ commit : depuis `1c40b6b`, `getProxyUrl()` renvoie
> toujours au moins `IA_PROXY_DEFAULT`, donc la branche « URL non configurée » de
> `generateRoutine()` est de fait inatteignable, et le champ « Réglages IA » se
> pré-remplit avec l'URL par défaut.

---

## Code verbatim (état final, après les 2 commits)

### 1) Bloc HTML — dans `#secScript > .section-body`, **avant** `<textarea id="scriptArea">`

```html
<div class="ia-gen" style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--fm-border,rgba(128,128,128,.25))">
  <label style="display:block;font-weight:600;margin-bottom:6px">Générer par IA</label>
  <textarea id="iaRoutineWish" spellcheck="false" placeholder="Décrivez la séance : ex. « échauffement 20 min, montée progressive de 70 à 130 BPM, puis coupures 1 mesure sur 8, finir en swing léger »"></textarea>
  <div class="row" style="margin-top:8px">
    <button class="btn-sm primary" id="btnGenRoutine">✨ Générer la routine</button>
    <span class="script-status" id="iaRoutineFb"></span>
  </div>
  <details id="iaRoutineSettings" style="margin-top:8px">
    <summary style="cursor:pointer">Réglages IA</summary>
    <p class="hint" style="margin-top:6px">Proxy IA (Cloudflare Worker qui cache la clé Gemini) <b>déjà configuré</b> — rien à faire. Ce champ ne sert qu'à pointer un autre proxy ; il est mémorisé dans ce navigateur. Détails : dossier <code>proxy/</code> du dépôt magic-drums.</p>
    <input id="iaProxyUrl" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://gemini-proxy.votre-sous-domaine.workers.dev" style="width:100%;box-sizing:border-box;font-family:ui-monospace,monospace;font-size:12.5px">
    <div class="row" style="margin-top:8px">
      <button class="btn-sm" id="btnSaveProxy">Enregistrer</button>
      <span class="script-status" id="iaCfgFb"></span>
    </div>
  </details>
</div>
```

### 2) JavaScript — dans le bloc d'init, **juste avant** le handler `$('scriptRun')`

```js
// ============ GÉNÉRATION IA (proxy Gemini) ============
const IA_PROXY_KEY = 'metro_ia_proxy_v1';
// Proxy partagé déployé (cache la clé Gemini) : défaut pour marcher sans manip.
const IA_PROXY_DEFAULT = 'https://gemini-proxy.nmulongo.workers.dev';
const getProxyUrl = () => ((store.get(IA_PROXY_KEY) || '').trim()) || IA_PROXY_DEFAULT;
const setProxyUrl = (u) => store.set(IA_PROXY_KEY, (u || '').trim());

function buildRoutinePrompt(wish) {
  const w = (wish || '').trim() || 'un échauffement progressif de 15 minutes';
  return `Tu es un professeur de musique qui écrit une routine de métronome.
Traduis cette demande en un SCRIPT de routine : ${w}

Réponds UNIQUEMENT avec le script (une instruction par ligne), sans texte autour ni balises markdown.
Grammaire acceptée, une instruction par ligne :
  <bpm>bpm <durée><unité>        tempo constant. Ex. : 80bpm 5min
  <a>-><b>bpm <durée><unité>     rampe de tempo (accelerando/rallentando). Ex. : 80->120bpm 10min
  gap <n>/<total>                coupe (mute) n mesures sur chaque bloc de <total>. Ex. : gap 2/16
  gap off                        désactive les coupures
  swing <p>                      swing en pourcent (50 = droit, 66 = ternaire). Ex. : swing 62
  # ...                          ligne de commentaire (ignorée)
Unités de durée : min (minutes), s ou sec (secondes), mes (mesures). La durée peut être décimale (ex. 2.5min).
Contraintes : bpm entre 30 et 260 ; swing entre 50 et 85 ; gap n < total.
Écris une progression musicale et réaliste ; ajoute de courts commentaires # pour repérer les phases.`;
}

function stripFences(text) {
  let s = String(text || '').trim();
  const fence = s.match(/```(?:[a-z]*)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  return s;
}

async function generateRoutine() {
  const url = getProxyUrl();
  const fb = $('iaRoutineFb');
  if (!url) {
    fb.textContent = '⚙ Configurez d’abord l’URL du proxy dans « Réglages IA ».';
    const s = $('iaRoutineSettings'); if (s) s.open = true;
    return;
  }
  const btn = $('btnGenRoutine');
  const oldLabel = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; }
  fb.textContent = 'Génération en cours…';
  try {
    const resp = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildRoutinePrompt($('iaRoutineWish').value), temperature: 0.7 })
    });
    let data = {};
    try { data = await resp.json(); } catch (e) {}
    if (!resp.ok) throw new Error(data.error || ('Erreur ' + resp.status));
    if (!data.text) throw new Error('Réponse vide du proxy.');
    const scriptText = stripFences(data.text);
    $('scriptArea').value = scriptText;
    const res = parseScript(scriptText);
    if (res.error) {
      fb.textContent = '⚠ Routine générée mais à corriger : ' + res.error;
    } else {
      fb.textContent = '✔ Routine générée (' + res.segs.length + ' instruction·s) — relisez puis « Lancer ».';
    }
  } catch (e) {
    fb.textContent = '✖ Échec : ' + e.message;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldLabel; }
  }
}

$('btnGenRoutine').addEventListener('click', generateRoutine);
{
  const proxyInput = $('iaProxyUrl');
  if (proxyInput) {
    proxyInput.value = getProxyUrl();
    $('btnSaveProxy').addEventListener('click', () => {
      setProxyUrl(proxyInput.value);
      $('iaCfgFb').textContent = proxyInput.value.trim() ? '✔ URL enregistrée' : 'URL effacée.';
    });
  }
}
```

### 3) Section README — ajoutée sous la description de l'app

```markdown
## Routine par IA (optionnel)

En mode expert, la section **Routine programmée** peut générer le script à partir
d'une description en langage naturel (ex. « échauffement 20 min, montée de 70 à
130 BPM, coupures vers la fin »). Le bouton **✨ Générer la routine** remplit la
zone de script (éditable avant lancement).

Comme l'app est une page statique publique, aucune clé API n'est embarquée :
l'appel passe par un petit **proxy** (Cloudflare Worker) qui cache une clé Google
Gemini partagée. Le proxy déployé (`https://gemini-proxy.nmulongo.workers.dev`)
est **pré-configuré par défaut** — rien à coller. Le champ **Réglages IA**
(`localStorage` `metro_ia_proxy_v1`) ne sert qu'à pointer un autre proxy. C'est
le même Worker que Magic Drums — détails et maintenance dans le dossier `proxy/`
du dépôt [magic-drums](https://github.com/nmulongo-sys/magic-drums). La routine
peut toujours s'écrire à la main.
```

---

## Notes de ré-intégration (architecture 0.18.0)

Si cette fonctionnalité est un jour reprise dans la refonte :

1. **Où** — la « Routine programmée » (`#secScript`, `#scriptArea`, `parseScript`)
   vit désormais dans `index.html` **et** `pratiquer.html`. Cibler la page qui
   expose l'atelier/routine à l'utilisateur avancé (probablement `pratiquer.html`,
   « la salle des machines »).
2. **Dépendances** — `parseScript(text) → { error, segs }`, `store.get/set`, `$(id)`
   sont toujours présents ; le bloc JS se colle tel quel près du handler
   `scriptRun`. Vérifier que `parseScript` renvoie bien `segs` (compte affiché).
3. **i18n** — tout le texte (label, placeholder, feedbacks, prompt) est **en dur en
   français**. Depuis R-5, le chrome est trilingue (`fmTr`) : passer les chaînes
   d'UI par le marcheur i18n (le *contenu* du prompt peut rester FR).
4. **Réseau / hors-ligne** — appel `fetch` externe : prévoir le cas `file://` et
   hors-ligne (la batterie de recettes tourne en jsdom sans réseau — garder l'appel
   derrière l'action utilisateur, ne rien déclencher au boot).
5. **Confidentialité** — le proxy masque la clé Gemini ; le souhait utilisateur est
   envoyé au Worker. Rien n'est stocké côté serveur par l'app ; seule l'URL du proxy
   est en `localStorage`. À rappeler si la fonctionnalité revient en prod.
6. **Proxy** — le Worker n'est pas dans ce dépôt ; sa source/maintenance est dans
   `magic-drums/proxy/`. Confirmer que `https://gemini-proxy.nmulongo.workers.dev`
   est toujours déployé avant de réactiver le défaut.

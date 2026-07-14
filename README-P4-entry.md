# Journal — entrée à ajouter au README

> À insérer en tête du journal de développement (ne pas écraser l'historique).
> Si tu me joins le `README.md` courant, je régénère le fichier complet avec les sections d'état
> rafraîchies via le skill `readme-dev`. En attendant, voici l'entrée datée.

## 2026-07-12 · `metronomefunk-0.6.4` — P-4 : UI parcours funk (premier code du parcours)

**Étape P-4 du parcours funk** (surcouche additive ; passes 1–5 fm-metro inchangées derrière).
Livré : l'écran **« Cours funk »** (section `#secCours` en mode Configurer), rendu du **module 6 seul**
des deux côtés — `MOD-CJ-I-I2` et `MOD-DJ-I-I2` (4 atomes + 1 synthèse chacun), contenu figé d'après
la spec mère §6.

Fonctionnel de bout en bout sur ce module :
- **Preset d'un bloc** par exercice (`Charger`) → installe la basse funk (`pattern`/`prog`/`drop`),
  tempo 90, famille binaire, grille percussion off (l'élève joue). Les cinq presets ne diffèrent que
  par `bass.prog` et `bass.drop` (tableau : `theOne/vamp1`, `syncopeGrave/vamp1`, `ghostPendule/vamp1`,
  `theOne/vamp1 + drop 4/2`, `theOne/vamp2`). Réutilise les points d'ancrage existants
  (`setTempo`/`setFamily`/`buildPercGrids`/`bassResetCycle`).
- **Tiroir `perso`** (`<details>`) : tempo (70–110), densité, drop-outs, tonalité (12).
- **Acquis 100 % local** (`localStorage['fm-metro-parcours']`), clé `(parcours|exerciseId)`,
  jamais synchronisé ; réussir un côté ne coche pas le jumeau.
- **Double code couleur** + marqueur « déjà rencontré » pour les `EX-SOCLE-…` partagés (atomes 1/3/4),
  dérivés automatiquement (présence de l'ID dans les deux modules).
- **Vote de fin** (3 crans `facile`/`ok`/`difficile`, synthèse incluse) → **file offline**
  `localStorage['pf_vote_queue']` → upsert `pf_vote` → RPC `pf_promotion` → `niveau_effectif =
  base + promu`. **Identité = session Supabase existante réutilisée** (client `window.fmSupabase()`
  déjà chargé) : compte lien-magique si connecté, sinon `signInAnonymously()`.

**Rectification d'architecture (vs brief P-3).** La 0.6.3 embarquait déjà le SDK Supabase + une auth
lien-magique : « zéro dépendance / fetch pur / jeton `pf_auth` » abandonné au profit de la réutilisation
du client existant. `pf_vote`/`pf_promotion`/RLS de P-3 inchangés (un anonyme signé-in porte le rôle
`authenticated`, passe la RLS et la RPC).

**Hook diagnostic** : `window.fmMetroParcours()` (lecture seule + helpers purs `presetFor`/`buildVote`/
`niveauEffectif`), calque de `fmMetroBass`.

**Recette** : `recette-P4.js` (jsdom, Web Audio/canvas stubs, client Supabase mocké) — **44/44 verts**
(rendu, partage, presets, perso, acquis par position, file de votes, flush+promotion, portée du vote,
dégradation offline/anon-off, pureté de la surcouche). Non-régression : script principal exécuté sans
erreur, hooks `fmMetroBass`/`fmMetroReg` intacts. *(Les 11 suites antérieures n'étaient pas jointes à
la session ; à relancer côté dépôt avec la nouvelle 0.6.4.)*

**Prérequis runtime non satisfait** : les *anonymous sign-ins* Supabase sont **désactivés**
(testé live : `422 anonymous_provider_disabled`). Tant que le toggle *Auth → Providers → Anonymous*
n'est pas basculé, les votes des utilisateurs **non connectés** restent **en file** (mécanisme
dormant, pas cassé) ; ceux des comptes lien-magique partent normalement.

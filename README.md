# Métronome — Portail Formation Musicale

Métronome pédagogique autonome (un seul fichier HTML, hors-ligne) : groove et swing asymétrique, claves et polyrythmies, gap clicks (horloge interne), visualiseur d'archet pour cordes frottées, routines programmables. Modes simple/expert, thèmes clair/sombre du portail.

App : ouvrir `index.html` (paramètres `?theme=clair` ou `?theme=sombre`).

## Routine par IA (optionnel)

En mode expert, la section **Routine programmée** peut générer le script à partir
d'une description en langage naturel (ex. « échauffement 20 min, montée de 70 à
130 BPM, coupures vers la fin »). Le bouton **✨ Générer la routine** remplit la
zone de script (éditable avant lancement).

Comme l'app est une page statique publique, aucune clé API n'est embarquée :
l'appel passe par un petit **proxy** (Cloudflare Worker) qui cache une clé Google
Gemini partagée. Colle l'URL du proxy dans **Réglages IA** (mémorisée par
navigateur, `localStorage` `metro_ia_proxy_v1`). Le même proxy que Magic Drums
convient — recette de déploiement dans le dossier `proxy/` du dépôt
[magic-drums](https://github.com/nmulongo-sys/magic-drums). Sans proxy, la
routine s'écrit à la main comme avant.

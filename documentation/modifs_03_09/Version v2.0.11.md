# 📦 Release v2.0.11 — Sprint 2 Ergonomie (Portfolio)

**Date :** 21 Septembre 2026  
**Branche :** `ergonomie`  
**Tag Git :** `v2.0.11`

---

## 🚀 Résumé des nouveautés

Cette version implémente le **Sprint 2 (Portfolio)** issu du plan d'amélioration ergonomique unifié pour l'application **Portfolio** (`apps/portfolio`).

---

### 1. Visionneuse Tactile & Ruban de Miniatures (_Filmstrip_) (`Lightbox.tsx`)

- **Gestes tactiles & Navigation fluide (Mobile & Tablette)** :
  - Détection du **Swipe gauche** (photo suivante) et **Swipe droite** (photo précédente) sur écran tactile sans obligation d'utiliser les boutons fléchés.
  - **Double-tap / Double-clic** pour zoomer instantanément (x2.2) et dézoomer.
- **Ruban horizontal de miniatures (_Filmstrip_)** :
  - Bandeau rétractable de vignettes avec effet de verre dépoli (*Backdrop-blur*) en bas de visionneuse.
  - **Mise en surbrillance dorée** et défilement automatique (*Auto-scroll*) centré sur la photo active lors de la navigation.
  - Clic direct sur n'importe quelle vignette pour changer de photo sans délai.
  - Bouton d'action et raccourci clavier `T` pour afficher/masquer le ruban.
- **Raccourcis clavier enrichis** :
  - Flèches `←` / `→` ou `Espace` : photo précédente / suivante.
  - `Home` / `End` : première / dernière photo.
  - `F` : bascule plein écran.
  - `I` : bascule description & informations techniques.
  - `T` : bascule ruban de miniatures.
  - `Échap` : fermeture de la visionneuse.

---

### 2. Fil d'Ariane Hiérarchique (_Breadcrumbs_) (`PageView.tsx`, `AlbumView.tsx`)

- **Navigation arborescente élégante** :
  - **Pages & Séries parentes/enfants** : `Accueil / [Série Parente] / [Série Enfant]` avec liens cliquables pour remonter d'un niveau instantanément.
  - **Albums & Galeries** : `Accueil / Galeries / [Nom de l'Album]`.
- **Compteur de photographies contextuel** :
  - Badge discret `X photos` à côté du titre de l'album.

---

### 3. Recherche Instantanée & Compteur de Galeries (`GalleriesView.tsx`, `Header.tsx`)

- **Barre de recherche en temps réel** :
  - Filtrage instantané des albums photographiques par mot-clé dans le titre ou la description.
  - Bouton d'effacement rapide `✕`.
  - Compteur dynamique : ex. `2 sur 37 galeries` ou `37 galeries photographiques`.
  - **État vide interactif** : Illustration, message d'aide et bouton « Réinitialiser la recherche ».
- **Entrée de menu « Galeries »** intégrée dans la barre de navigation latérale.

---

### 4. Bouton Flottant « Retour en haut » (_Back to Top_) (`App.tsx`)

- Apparition animée lors du défilement au-delà de 350px.
- Remontée fluide d'un simple clic sur les longues pages et galeries d'exposition.

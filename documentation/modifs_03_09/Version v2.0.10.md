# 📦 Release v2.0.10 — Sprint 1 Ergonomie (Blog)

**Date :** 21 Septembre 2026  
**Branche :** `ergonomie`  
**Tag Git :** `v2.0.10`

---

## 🚀 Résumé des nouveautés

Cette version implémente le **Sprint 1 (Blog)** issu du plan d'amélioration ergonomique unifié pour l'application **Blog** (`apps/blog`).

### 1. Menu Hamburger & Tiroir Mobile Réactif (`Navbar.tsx`)

- **Adaptabilité mobile complète** : Sur smartphone et petits écrans (`< 768px`), la barre de navigation se compacte avec un bouton menu hamburger moderne.
- **Tiroir de navigation en verre dépoli (_Backdrop-blur_)** :
  - Accès direct à l'ensemble des rubriques : _📝 Articles_, _⭐ Nouveautés_, _🗂️ Galeries_, _🎞️ Carnet de route_, _🌍 Portfolio_, _✉️ Contact_.
  - Bascule du thème sombre intégrée.
  - Fermeture automatique du menu lors d'un clic sur un lien de navigation.

### 2. Recherche Instantanée & Filtres par Tags (`PostList.tsx`)

- **Barre de recherche interactive** : Filtrage en direct par titre, lieu, mot-clé ou extrait avec bouton d'effacement rapide `✕`.
- **Nuage de filtres par tags cliquables** : Extraction dynamique des tags et hashtags des récits photographiques pour isoler les articles en 1 clic.
- **Indicateur de temps de lecture** : Calcul automatique et affichage d'un badge `⏱️ X min de lecture` sur la une et chaque carte d'article.
- **État vide soigné (_Empty State_)** : Message explicatif et bouton direct « Réinitialiser les filtres » lorsque aucune correspondance n'est trouvée.

### 3. Continuité de Lecture & Partage Rapide (`PostDetail.tsx`)

- **Navigation contextuelle « Précédent / Suivant »** : En bas de chaque article, deux cartouches cliquables permettent au lecteur de poursuivre facilement sa navigation vers les publications adjacentes.
- **Bouton de partage direct** : Action « Copier le lien » avec animation et confirmation visuelle temporaire (_Lien copié !_).
- **Bouton flottant « Retour en haut »** : Apparition fluide lors du défilement pour remonter en tête de page sans effort.

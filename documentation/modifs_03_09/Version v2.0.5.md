# Version v2.0.5 — Gestion de la Séquence et Ordre de Tri (Galeries Virtuelles & Albums)

## Objectif & Contexte

Dans **LuminaView**, les galeries virtuelles regroupent des photos dynamiquement en fonction de tags et filtres. Auparavant, l'ordre des photos retournées par le serveur était figé sur la date de création la plus récente (`createdAt: -1`), et les albums physiques disposaient d'un tri restreint sans persistance complète à la création.

La version **v2.0.5** introduit la gestion complète et la persistance du mode de tri (`sortOrder`) pour l'ensemble des galeries virtuelles et albums classiques.

---

## Fonctionnalités & Options de Tri

Cinq modes de séquence d'images sont pris en charge :

1. **Date décroissante** (`date_desc`) : Photos les plus récentes en premier (*Comportement par défaut*).
2. **Chronologique** (`date_asc`) : Photos les plus anciennes en premier (idéal pour le storytelling, voyages).
3. **Alphabétique A → Z** (`title_asc`) : Tri par titre croissant.
4. **Alphabétique Z → A** (`title_desc`) : Tri par titre décroissant.
5. **Manuel / Index** (`manual`) : Tri selon le champ `index` défini sur les photos.

---

## Modifications Réalisées

### 1. Modèles & Types Partagés
- **[`packages/types/src/index.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/packages/types/src/index.ts)** : Ajout du champ `sortOrder?: 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'manual'` et des propriétés de filtres virtuels à l'interface `Album`.
- **[`backend/src/models/Album.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/models/Album.ts)** : Extension de l'enum `sortOrder` pour intégrer `title_asc` et `title_desc`.

### 2. Backend API
- **[`backend/src/routes/albumRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/routes/albumRoutes.ts)** :
  - Création (`POST /api/albums`) et mise à jour (`PUT /api/albums/:id`) supportent le champ `sortOrder`.
  - Récupération des photos (`GET /api/albums/photos/:id`) applique le tri sélectionné tant pour les galeries virtuelles que pour les albums standards.
- **[`backend/src/controllers/AlbumController.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/controllers/AlbumController.ts)** : Application dynamique du tri `sortCriteria` pour toutes les méthodes de requêtes de photos.
- **[`backend/src/routes/userPagesRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/routes/userPagesRoutes.ts)** : Intégration de `sortOrder` lors de l'hydratation des sections d'albums et galeries dans les pages personnalisées.

### 3. Studio Manager
- **[`apps/manager/src/pages/CreateAlbum.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/pages/CreateAlbum.tsx)** : Ajout d'un sélecteur dédié pour choisir l'ordre d'affichage dès la création d'une galerie ou d'un album.
- **[`apps/manager/src/components/EditAlbumModal.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/components/EditAlbumModal.tsx)** : Ajout de la sélection et modification du `sortOrder` dans le formulaire d'édition.
- **[`apps/manager/src/pages/AlbumView.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/pages/AlbumView.tsx)** : Synchronisation automatique de la barre d'outils de tri avec le `sortOrder` configuré sur l'album à l'ouverture.

---

## Fichiers Modifiés

- **[`package.json`](file:///Users/jac/docker/hi3/luminaview-Monorepo/package.json)** (Montée en version 2.0.5)
- **[`packages/types/src/index.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/packages/types/src/index.ts)**
- **[`backend/src/models/Album.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/models/Album.ts)**
- **[`backend/src/routes/albumRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/routes/albumRoutes.ts)**
- **[`backend/src/controllers/AlbumController.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/controllers/AlbumController.ts)**
- **[`backend/src/routes/userPagesRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/backend/src/routes/userPagesRoutes.ts)**
- **[`apps/manager/src/pages/CreateAlbum.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/pages/CreateAlbum.tsx)**
- **[`apps/manager/src/components/EditAlbumModal.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/components/EditAlbumModal.tsx)**
- **[`apps/manager/src/pages/AlbumView.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/apps/manager/src/pages/AlbumView.tsx)**
- **[`documentation/modifs_03_09/Version v2.0.5.md`](file:///Users/jac/docker/hi3/luminaview-Monorepo/documentation/modifs_03_09/Version%20v2.0.5.md)**

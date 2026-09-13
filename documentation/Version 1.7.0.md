# Documentation de version — v1.7.0 (Archivage et gestion des pellicules)

Cette version introduit le système complet d'archivage des pellicules (rouleaux et châssis), le filtrage intelligent entre pellicules actives/vierges et pellicules archivées, ainsi que le regroupement ergonomique dans le sélecteur de photos.

---

## 🎯 Objectif et Fonctionnalités

Dans le Carnet de route et le laboratoire argentique, les photographes ont besoin de :
1. Conserver l'historique complet de leurs pellicules développées et utilisées sans encombrer la liste de travail active.
2. Voir en un coup d'œil les pellicules disponibles / vierges prêtes pour les prises de vue.
3. Pouvoir consulter les pellicules archivées à la demande avec le nombre de photos qui y sont associées.
4. Archiver ou désarchiver une pellicule manuellement ou automatiquement dès qu'elle est utilisée.

---

## 🛠️ Modifications apportées

### 1. Modèle de données & API Backend (`Film.ts`, `filmRoutes.ts`)
- **Nouveau champ `isArchived`** (booléen, défaut `false`) sur le modèle `Film`.
- **Agrégation dynamique des photos** : L'API `GET /api/films` calcule automatiquement pour chaque pellicule le nombre de photos associées (`photosCount`) et le statut d'utilisation (`isUsed`).
- **Route d'archivage rapide** : `PATCH /api/films/:id/archive` pour basculer facilement le statut sans réécrire toutes les propriétés.
- Prise en compte du paramètre `isArchived` à la création (`POST`) et à la modification (`PUT`).

### 2. Interface Manager (`CarnetRoutesManager.tsx`)
- **Filtres d'affichage par statut** :
  - **🟡 En cours / Vierges** (*sélectionné par défaut*) : affiche uniquement les pellicules non archivées et sans photo liée, avec compteur dynamique.
  - **📦 Archivées** : affiche les pellicules archivées ou avec des photos associées, avec compteur dynamique.
  - **🗂️ Toutes** : vue d'ensemble exhaustive de l'inventaire.
- **Badges d'état visuels** :
  - `🟡 Vierge` pour une pellicule neuve disponible.
  - `📦 Archivée (N photos)` pour un rouleau archivé/utilisé.
- **Bouton d'action rapide** : Bouton `📦 Archiver` / `🟡 Désarchiver` sur chaque carte de pellicule.
- **Formulaire de création & modification** : Ajout d'une case à cocher *« 📦 Archiver cette pellicule »*.

### 3. Sélecteur de pellicule dans l'édition de photo (`EditPhotoModal.tsx`)
- Regroupement des options de sélection en groupes distincts :
  - `<optgroup label="🟡 Pellicules en cours / vierges">`
  - `<optgroup label="📦 Pellicules archivées / utilisées">`
- Affichage du nombre de photos déjà présentes sur chaque pellicule.

---

## 🚀 Déploiement

Tag Git associé : **`v1.7.0`**

Commandes de mise à jour en production :
```bash
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

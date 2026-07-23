# Documentation Technique - Architecture LuminaView (Monorepo)

## 1. Vue d'ensemble

Le projet **LuminaView** a été restructuré sous la forme d'un **Monorepo** afin d'unifier les différentes applications (Blog, Portfolio, Chambre Noire, Manager) qui étaient auparavant isolées.

Cette unification permet :
- **Une seule base de données centrale** pour tous les utilisateurs, photos, articles, et pellicules.
- **Un seul point d'entrée API** (Backend).
- **Une gestion simplifiée des assets** (un seul dossier d'uploads partagé).
- **Une maintenance facilitée** via Docker Compose.

---

## 2. Architecture des Composants

L'infrastructure est orchestrée par **Docker Compose** (`docker-compose.yml`) et se compose des services suivants :

### 2.1. Base de données
- **Service** : `mongo`
- **Image** : `mongo:4.4` (Maintenu en 4.4 pour la compatibilité avec le matériel sans support AVX).
- **Port interne** : `27017`
- **Volume persistant** : `./data/mongo:/data/db` (Héberge la base `luminaview_core`).

### 2.2. Backend (API Centrale)
- **Service** : `backend`
- **Technologie** : Node.js / Express / TypeScript / Mongoose
- **Port interne** : `3000`
- **Volume partagé** : `./data/uploads:/app/uploads` (Toutes les images uploadées y sont stockées).
- **Rôle** : Sert les données JSON pour l'ensemble des applications frontends.

### 2.3. Applications Frontend (React)
Toutes les interfaces utilisateur sont écrites en React et packagées avec Nginx (Alpine).

| Application | Service Docker | Port Exposé (Local) | URL Locale | Description |
|---|---|---|---|---|
| **Studio** | `studio` | `8080` | `http://localhost:8080` | Espace de création connecté (fusion Manager + Chambre Noire). |
| **Portfolio** | `portfolio` | `8090` | `http://localhost:8090` | Vitrine portfolio publique (`(user).portfolio.helioscope.fr`). |
| **Blog** | `blog` | `8081` | `http://localhost:8081` | Vitrine blog publique (`(user).blog.helioscope.fr`). |
| **Carnet** | `carnet` | `8082` | `http://localhost:8082` | Vitrine carnet-de-route publique (`(user).carnet.helioscope.fr`). |

---

## 3. Gestion des Données et Stockage

### Modèles Mongoose Unifiés
Les schémas de données ont été consolidés dans `backend/src/models/` :
- `User`, `Album`, `Photo`, `Post`, `PostComment`, `Film`, `Gear`, `Project`, etc.
- Une relation inter-schémas robuste (ex: Un `Film` appartient à un `User`).

### Volumes Physiques (Dossier `/data`)
Pour éviter la perte de données et faciliter les sauvegardes, les données ne sont plus stockées dans des volumes Docker opaques, mais directement sur l'hôte :
- **`/data/mongo`** : Fichiers bruts de MongoDB.
- **`/data/uploads`** : Images, avatars, et médias.

---

## 4. Maintenance et Commandes Utiles

Toutes les commandes doivent être lancées depuis la racine du Monorepo (`/Users/jac/docker/hi3/luminaview-Monorepo`).

### Démarrage et Arrêt
```bash
# Démarrer tous les services en arrière-plan
docker compose up -d

# Arrêter tous les services
docker compose down

# Voir les logs en temps réel (ex: pour le backend)
docker compose logs -f backend
```

### Recompilation
Si vous modifiez le code source d'une application (ex: Portfolio), il faut la recompiler :
```bash
docker compose build portfolio
docker compose up -d portfolio
```
*(Remplacez `portfolio` par `blog`, `manager`, ou `chambrenoire` selon les besoins).*

### Sauvegarde
Pour sauvegarder l'intégralité de l'application, il suffit de copier le dossier `luminaview-Monorepo`. Assurez-vous d'arrêter les conteneurs avant de copier le dossier `data/mongo` pour éviter toute corruption.

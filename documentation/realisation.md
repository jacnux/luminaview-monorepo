# Bilan de la Migration - Backend Unifié (Core API)

J'ai terminé la première grande étape de l'unification des deux applications selon la stratégie Monorepo que nous avons validée.

## Ce qui a été accompli :

1. **Création du Monorepo :**
   - Le dossier `/Users/jac/docker/hi3/luminaview/` a été créé pour servir de base vierge.
   - Le backend principal (LuminaView) y a été copié comme fondation (`/backend`).

2. **Fusion des Modèles (Base de données commune) :**
   - Importation des modèles spécifiques à Chambre Noire : `Film.ts`, `Gear.ts`, `Project.ts`.
   - Mise à jour du modèle `Photo.ts` : Il contient désormais toutes les métadonnées (EXIF, informations argentiques) et le champ `appContext` pour filtrer l'affichage (LuminaView vs Chambre Noire).
   - Mise à jour du modèle `Album.ts` : Ajout du champ `appContext`.
   - Mise à jour du modèle `User.ts` : Ajout du champ `carnetIntro` de Chambre Noire.

3. **Mutualisation des Routes :**
   - Les routes spécifiques `filmRoutes.ts`, `gearRoutes.ts` et `projectRoutes.ts` ont été migrées.
   - Le `server.ts` a été mis à jour pour exposer toutes ces routes de manière centralisée.
   - Le `package.json` a été renommé en `luminaview-core-api`.

## Prochaines étapes suggérées :

- Déplacer ou lier les frontends (`blog-frontend`, `frontend`) dans ce nouveau dossier monorepo (ex: `hi3/luminaview/front-blog`, `hi3/luminaview/front-chambrenoire`).
- Mettre à jour les URLs de l'API dans les deux frontends pour pointer vers ce nouveau serveur unifié.
- Tester le fonctionnement global (login, upload, affichage).

> [!NOTE]
> Le nouveau backend est prêt dans `hi3/luminaview/backend`. Vous pouvez l'examiner et le tester à votre rythme !

# Bilan : Intégration des Frontends & Dockerisation

Toutes les tâches de rassemblement et de configuration sont terminées pour intégrer vos frontends au nouveau backend unifié.

## Réalisations :

1. **Rapatriement du Code :**
   - Le dossier `apps/` a été créé dans `/Users/jac/docker/hi3/luminaview-Monorepo/`.
   - Tous les frontends y ont été copiés (`luminaview-manager`, `luminaview-blog`, `chambre-noire`).

2. **Configuration Réseau (Nginx) :**
   - La configuration proxy de `chambre-noire` redirigeait déjà vers un hôte `backend:3000`, ce qui fonctionnera nativement avec le nouveau monorepo !
   - La configuration Nginx du `luminaview-manager` a été nettoyée : la redirection obsolète vers `blog-backend:3001` a été re-routée vers notre nouveau `backend:3000`.
   - Toutes les applications pointent désormais vers l'API Unifiée (Core API).

3. **Dockerisation Globale :**
   - Un nouveau fichier `docker-compose.yml` a été créé à la racine (`/Users/jac/docker/hi3/luminaview-Monorepo/docker-compose.yml`).
   - Il contient 5 services interconnectés :
     - `mongo` : Base de données.
     - `backend` : L'API unifiée (exposée sur le port `3000`).
     - `manager` : Le frontend de gestion LuminaView (exposé sur `8080`).
     - `blog` : Le frontend public LuminaView (exposé sur `8081`).
     - `chambrenoire` : Le frontend Chambre Noire (exposé sur `8082`).

## Comment tester ?

Placez-vous dans le dossier `/Users/jac/docker/hi3/luminaview-Monorepo/` et lancez :

```bash
docker compose up --build -d
```

Vous pourrez ensuite accéder à :

- **LuminaView Manager** : `http://localhost:8080`
- **LuminaView Blog** : `http://localhost:8081`
- **Chambre Noire** : `http://localhost:8082`
- **API** : `http://localhost:3000/api/...`

Tout est prêt et consolidé dans un seul dépôt !

# Bilan : Intégration des Frontends & Dockerisation

Toutes les tâches de rassemblement et de configuration sont terminées pour intégrer vos frontends au nouveau backend unifié.

## Réalisations :

1. **Rapatriement du Code :**
   - Le dossier `apps/` a été créé dans `/Users/jac/docker/hi3/luminaview-Monorepo/`.
   - Tous les frontends y ont été copiés (`luminaview-manager`, `luminaview-blog`, `chambre-noire`).

2. **Configuration Réseau (Nginx) :**
   - La configuration proxy de `chambre-noire` redirigeait déjà vers un hôte `backend:3000`, ce qui fonctionnera nativement avec le nouveau monorepo !
   - La configuration Nginx du `luminaview-manager` a été nettoyée : la redirection obsolète vers `blog-backend:3001` a été re-routée vers notre nouveau `backend:3000`.
   - Toutes les applications pointent désormais vers l'API Unifiée (Core API).

3. **Dockerisation Globale :**
   - Un nouveau fichier `docker-compose.yml` a été créé à la racine (`/Users/jac/docker/hi3/luminaview-Monorepo/docker-compose.yml`).
   - Il contient 5 services interconnectés : `mongo`, `backend`, `manager`, `blog`, `chambrenoire`.

4. **Fusion du Blog Backend (NOUVEAU) :**
   - Toutes les fonctionnalités de l'ancien `blog-backend` (Articles, Abonnés Newsletter, Commentaires de blog, Envoi d'email SMTP) ont été recodées et intégrées dans le `luminaview-core-api`.
   - Les articles (`Posts`) et les abonnés (`NewsletterSubscribers`) sont désormais rattachés directement par `_id` aux utilisateurs (`Users`), garantissant une architecture de données extrêmement robuste.
   - Les appels réseau entre le frontend du Blog et l'API sont centralisés sous la route unifiée `/api/blog/`. Vous n'avez plus besoin du service "blog-backend" dans Docker, tout passe désormais par l'unique `backend:3000` !

## Comment tester ?

Placez-vous dans le dossier `/Users/jac/docker/hi3/luminaview-Monorepo/` et lancez :

```bash
docker compose up --build -d
```

Vous pourrez ensuite accéder à :

- **LuminaView Manager** : `http://localhost:8080`
- **LuminaView Blog** : `http://localhost:8081`
- **Chambre Noire** : `http://localhost:8082`
- **API** : `http://localhost:3000/api/...`

Tout est prêt et consolidé dans un seul dépôt !

# Bilan : Intégration des Frontends & Dockerisation

Toutes les tâches de rassemblement et de configuration sont terminées pour intégrer vos frontends au nouveau backend unifié.

## Réalisations :

1. **Rapatriement du Code :**
   - Le dossier `apps/` a été créé dans `/Users/jac/docker/hi3/luminaview-Monorepo/`.
   - Tous les frontends y ont été copiés (`luminaview-manager`, `luminaview-blog`, `chambre-noire`).

2. **Configuration Réseau (Nginx) :**
   - La configuration proxy de `chambre-noire` redirigeait déjà vers un hôte `backend:3000`, ce qui fonctionnera nativement avec le nouveau monorepo !
   - La configuration Nginx du `luminaview-manager` a été nettoyée : la redirection obsolète vers `blog-backend:3001` a été re-routée vers notre nouveau `backend:3000`.
   - Toutes les applications pointent désormais vers l'API Unifiée (Core API).

3. **Dockerisation Globale :**
   - Un nouveau fichier `docker-compose.yml` a été créé à la racine (`/Users/jac/docker/hi3/luminaview-Monorepo/docker-compose.yml`).
   - Il contient 5 services interconnectés : `mongo`, `backend`, `manager`, `blog`, `chambrenoire`.

4. **Fusion du Blog Backend (NOUVEAU) :**
   - Toutes les fonctionnalités de l'ancien `blog-backend` (Articles, Abonnés Newsletter, Commentaires de blog, Envoi d'email SMTP) ont été recodées et intégrées dans le `luminaview-core-api`.
   - Les articles (`Posts`) et les abonnés (`NewsletterSubscribers`) sont désormais rattachés directement par `_id` aux utilisateurs (`Users`), garantissant une architecture de données extrêmement robuste.
   - Les appels réseau entre le frontend du Blog et l'API sont centralisés sous la route unifiée `/api/blog/`. Vous n'avez plus besoin du service "blog-backend" dans Docker, tout passe désormais par l'unique `backend:3000` !

## Phase 6 : Migration des Données

Pour récupérer vos données depuis l'ancienne architecture, un script automatique a été mis en place.

### Comment lancer la migration ?

1. **Lancer les anciennes bases de données** (en mode temporaire) pour accéder aux données sources :

   ```bash
   docker compose -f docker-compose.migration.yml up -d
   ```

   _(Assurez-vous que votre docker compose principal est aussi lancé pour que la base cible soit accessible)._

2. **Exécuter le script de migration** depuis le conteneur du nouveau backend :

   ```bash
   docker compose exec backend npx ts-node scripts/migrateData.ts
   ```

   _Ce script va :_
   - Vider proprement la nouvelle base pour éviter les doublons.
   - Migrer vos utilisateurs et vos pages.
   - Importer vos photos et albums LuminaView (en ajoutant le flag `appContext: LUMINAVIEW`).
   - Importer vos pellicules, appareils et photos Chambre Noire (flag `CHAMBRE_NOIRE`).
   - Rapatrier vos articles de blogs et abonnés en les liant au véritable ID utilisateur.

3. **Nettoyage**
   Une fois le message "🎉 MIGRATION TERMINÉE AVEC SUCCÈS !" affiché, vous pouvez éteindre et supprimer les bases temporaires :
   ```bash
   docker compose -f docker-compose.migration.yml down
   ```

## Comment tester ?

Placez-vous dans le dossier `/Users/jac/docker/hi3/luminaview-Monorepo/` et lancez :

```bash
docker compose up --build -d
```

Vous pourrez ensuite accéder à :

- **LuminaView Manager** : `http://localhost:8080`
- **LuminaView Blog** : `http://localhost:8081`
- **Chambre Noire** : `http://localhost:8082`
- **API** : `http://localhost:3000/api/...`

Tout est prêt et consolidé dans un seul dépôt !

# Stratégie de Mise en Production (Monorepo)

## 1. Architecture des Sous-domaines (SSL Compatible)

L'architecture multi-utilisateurs a été mise en place avec succès, en utilisant des sous-domaines compatibles avec vos certificats wildcard (`*.helioscope.fr` et `*.blog-helioscope.fr`).

| Application       | Domaine Local                     | Domaine Production (Exemple)          |
| ----------------- | --------------------------------- | ------------------------------------- |
| **Manager**       | `http://localhost:8080`           | `https://www.helioscope.fr`           |
| **Blog**          | `http://localhost:8081/?user=jac` | `https://jac-blog.helioscope.fr`      |
| **Portfolio**     | `http://localhost:8090/?user=jac` | `https://jac-portfolio.helioscope.fr` |
| **Chambre Noire** | `http://localhost:8082/?user=jac` | `https://jac-carnet.helioscope.fr`    |

## 2. Modifications réalisées

1. **Portfolio (`getPortfolioSlug`)** : Mise à jour du code source pour extraire automatiquement le nom de l'utilisateur à partir du préfixe `-portfolio`.
2. **Chambre Noire (`CarnetDeRoutes`)** :
   - Modification de la fonction `getSubdomain` pour gérer le préfixe `-carnet`.
   - Injection du nom d'utilisateur dans les requêtes de l'API publique (`/api/projects/public/all?user=...`) pour que chaque carnet de routes n'affiche que les projets de son propriétaire.
3. **Backend API (`projectRoutes` / `photoRoutes`)** : L'API publique filtre désormais les résultats dynamiquement en fonction du paramètre `?user=` reçu.
4. **Manager (`Layout`, `PortfolioPage`, `BlogManager`)** : Création d'un utilitaire centralisé (`utils/urls.ts`) pour que tous les boutons "Voir" génèrent automatiquement les liens locaux en développement (`localhost`) et les liens de sous-domaines en production (`jac-blog.helioscope.fr`).
5. **Docker Compose de Production** : Génération d'un fichier `docker-compose.prod.yml` contenant la configuration `nginx-proxy` via `VIRTUAL_HOST`.

## 3. Comment déployer en production ?

Sur votre serveur de production :

1. Déplacez le fichier `.env.prod.example` en le renommant `.env` et complétez les mots de passe.
2. Lancez la compilation et le déploiement avec le fichier de production :
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

Toutes les applications Frontend seront connectées à votre Proxy Nginx (`webproxy`) et sécurisées par Let's Encrypt de manière 100% automatisée !

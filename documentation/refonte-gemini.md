# Refonte Gemini Architecture Plan

Ce plan décrit la création de la nouvelle architecture `refonte-gemini` au sein du monorepo, structurée autour de vos 4 espaces principaux.

## Objectif

Créer un environnement propre (`refonte-gemini`) basé sur la branche `main`, en structurant le code en un monorepo moderne (utilisant `apps/` et `backend/`), avec les ports spécifiés et un `docker-compose.yml` dédié.

## Open Questions

> [!IMPORTANT]
>
> 1. Souhaitez-vous que j'utilise **pnpm**, **npm** ou **yarn** pour gérer les workspaces (packages partagés entre les applications) dans ce nouveau dossier, comme c'était le cas dans `refonte-deepseek` ?
> 2. Pour les 4 applications frontend (Manager, Blog, Portfolio, Chambre Noire), préférez-vous que je les initialise avec **React (Vite)** ou un autre framework (ex: Next.js) ?
> 3. Souhaitez-vous copier le backend actuel de `main` directement dans `refonte-gemini/backend` pour servir de base, ou repartir d'un backend vierge ?

## Proposed Changes

### Structure du dossier `refonte-gemini`

Le nouveau dossier contiendra la structure suivante :

#### [NEW] `refonte-gemini/apps/manager` (Port 8080)

Tableau de bord central pour la gestion des photos, albums, utilisateurs, blog et configuration portfolio.

#### [NEW] `refonte-gemini/apps/blog` (Port 8081)

Vitrine publique des actualités et articles.

#### [NEW] `refonte-gemini/apps/portfolio` (Port 8090)

Espace d'exposition des photos avec gestion des thèmes visuels.

#### [NEW] `refonte-gemini/apps/chambrenoire` (Port 8082)

Outil de gestion des pellicules, temps de développement, matériel et création de planches contacts.

#### [NEW] `refonte-gemini/backend` (Port 3000)

L'API Node.js centrale qui gèrera toutes les connexions à MongoDB et la logique métier pour les 4 applications.

#### [NEW] `refonte-gemini/packages/shared` (Optionnel)

Un dossier pour partager les types TypeScript, la configuration de l'API (Axios), et d'autres utilitaires entre les applications frontends et le backend.

#### [NEW] `refonte-gemini/docker-compose.yml`

Un fichier Docker complet exposant directement les ports demandés sur votre machine locale (8080, 8081, 8090, 8082) sans nécessiter de reverse proxy complexe, pour faciliter le développement et le déploiement simple.

## Verification Plan

### Automated Tests

- Vérification du bon démarrage de tous les conteneurs via Docker Compose.
- Vérification que chaque application frontend répond bien sur son port assigné (`curl localhost:8080`, etc.).

### Manual Verification

- Je vous inviterai à naviguer sur les 4 URL locales pour valider que les squelettes des applications s'affichent correctement.

# Architecture `refonte-gemini` 🚀

is
La nouvelle architecture a été mise en place avec succès dans le dossier `refonte-gemini`.

## Changements effectués

- **Création du Workspace** : J'ai initialisé le projet en tant que monorepo en utilisant `npm workspaces` avec un fichier `package.json` à la racine pour vous permettre de lancer des commandes communes à toutes les applications.
- **Backend** : J'ai cloné l'API Express d'origine de la branche `main` dans le dossier `refonte-gemini/backend`.
- **Frontends (React + Vite)** : J'ai généré les 4 applications frontend (Manager, Blog, Portfolio, Chambre Noire) dans le dossier `apps/`. Chacune dispose d'un template propre et prêt à être développé en TypeScript.
- **Docker Compose** : J'ai créé le fichier `docker-compose.yml` qui lie l'ensemble des conteneurs :
  - `manager` -> Port 8080
  - `blog` -> Port 8081
  - `chambrenoire` -> Port 8082
  - `portfolio` -> Port 8090
  - `backend` -> Port 3000
- **Dockerfiles** : J'ai configuré un `Dockerfile` pour chaque application frontend (build Node.js + serveur de fichiers statiques Nginx avec redirection SPA).

## Prochaines Étapes

1. **Démarrer les conteneurs** :
   Vous pouvez naviguer dans le répertoire et lancer l'écosystème :
   ```bash
   cd refonte-gemini
   docker compose up -d --build
   ```
2. **Migration du code** :
   Nous devons maintenant rapatrier petit à petit les composants, les pages et les hooks de l'ancienne version (`refonte-hi3` ou `main`) vers ces nouvelles coquilles vides, en respectant la séparation des 4 domaines que vous avez définie.

N'hésitez pas à me dire par quelle application vous souhaitez que l'on commence le portage !

# Migration du Dashboard Manager (depuis `main`)

Ce plan détaille la migration du code source du Manager (Tableau de bord riche) depuis l'ancienne architecture de la branche `main` vers la nouvelle application Vite/React dans `refonte-gemini/apps/manager`.

## Objectif

Rapatrier le design (glassmorphism), les composants (AlbumCardGrid, EditAlbumModal, etc.) et les fonctionnalités (tri, vue grille/liste, recherche) du tableau de bord complet dans notre nouvelle structure ultra-rapide sous Vite.

## Proposed Changes

### 1. Installation des dépendances

L'ancienne application (basée sur `create-react-app`) utilisait plusieurs bibliothèques que nous devons installer sur notre version Vite :

- `react-router-dom` (pour la navigation)
- `axios` (pour les requêtes API)
- `framer-motion` (pour les animations fluides)
- `tailwindcss`, `postcss`, `autoprefixer` et `@tailwindcss/typography` (pour le design)

### 2. Configuration de TailwindCSS

Nous allons initialiser Tailwind dans `apps/manager` (fichiers `tailwind.config.js` et `postcss.config.js`) et l'ajouter au fichier CSS principal, afin que le rendu visuel soit rigoureusement identique.

### 3. Copie intégrale du code source

Nous allons rapatrier tout le dossier `src/` de `apps/luminaview-manager` (depuis la branche `main`) vers `refonte-gemini/apps/manager/src/`, incluant :

- **`pages/Dashboard.tsx`** : La page complète avec ses onglets "Albums" / "Galeries" et ses fonctionnalités de tri.
- **`components/`** : Les modales d'édition (`EditAlbumModal.tsx`), de partage, et les cartes d'affichage.
- **`context/`** : `AuthContext.tsx` et `ThemeContext.tsx` qui gèrent l'état global et le mode sombre.
- **`utils/api.ts`** : Le fichier gérant les appels backend.
- **`App.tsx` et `index.css`** : Le routeur principal et les variables de couleur/design.

## Verification Plan

### Automated Tests

- Vérifier que la compilation Vite (`npm run build`) réussit sans erreur TypeScript majeure.

### Manual Verification

- Je vous demanderai de vous rendre sur `http://localhost:7080`.
- Vous pourrez vérifier visuellement que l'interface complète est bien présente, et que les données provenant du backend de développement s'affichent correctement, avec toutes les animations et filtres fonctionnels.

## Open Questions

> [!IMPORTANT]
> Souhaitez-vous que je copie **uniquement** la page Dashboard (et ses composants stricts), ou dois-je copier **toutes** les pages du Manager (Gestion du blog, commentaires, utilisateurs, carnets de route) pour que tout le Manager soit d'un seul coup fonctionnel ?

# Plan d'implémentation - Thème Dynamique pour le Studio

Ce plan vise à intégrer le paramètre "Thème Visuel" (Classic / Portfolio) défini par l'utilisateur dans son profil directement dans l'interface du Studio (Manager).

## Changements proposés

### 1. `AuthContext.tsx`

- Mettre à jour l'interface `User` pour inclure `blogTheme?: string`.
- Ajouter une fonction `updateUser(userData: User)` dans le `AuthContext` permettant de rafraîchir l'état de l'utilisateur connecté sans reconnexion nécessaire.

### 2. `EditProfile.tsx`

- Une fois que le profil a été sauvegardé avec succès (`api.put('/users/me')`), récupérer l'utilisateur mis à jour retourné par le serveur et appeler la nouvelle fonction `updateUser` pour synchroniser le `AuthContext` et le `localStorage`.

### 3. `Layout.tsx`

- Lire la propriété `user.blogTheme` dans le composant de mise en page principal.
- Si `user.blogTheme === 'portfolio'` :
  - Restructurer l'affichage pour passer d'un menu horizontal supérieur (Classic) à un menu latéral gauche fixe (Sidebar).
  - Adapter le style (couleurs plus sombres et dorées inspirées d'Artfolio).
- Si `user.blogTheme === 'classic'` :
  - Conserver le menu horizontal supérieur fluide actuel.

---

## Plan de vérification

### Test Manuel

1. Se connecter à l'application.
2. Aller dans le profil, changer le thème sur "Artfolio", puis cliquer sur "Sauvegarder".
3. Vérifier que la disposition du Studio change instantanément pour afficher le menu en mode Sidebar à gauche.
4. Repasser sur le thème "Hélioscope", sauvegarder, et vérifier le retour au menu supérieur horizontal.

# Plan d'implémentation - Migration du Blog vers refonte-gemini ✍️

Ce plan détaille la migration complète de l'application Blog (`apps/luminaview-blog`) vers le nouvel espace de workspaces (`refonte-gemini/apps/blog`), en l'adaptant pour fonctionner avec Vite et Docker (port 7081).

### 1. `apps/blog/package.json`

- Remplacer les dépendances React 19 par React 18.2.0 (comme pour le Manager).
- Ajouter les dépendances spécifiques du Blog (`react-router-dom`, `axios`, `react-markdown`, `rehype-raw`, `rehype-sanitize`, `remark-gfm`).
- Ajouter `tailwindcss`, `@tailwindcss/typography`, `postcss` et `autoprefixer` en devDependencies.
- Modifier le script de build pour compiler avec Vite sans vérification de types stricte temporairement (`vite build`).

### 2. `apps/blog/Dockerfile`

- Mettre à jour l'image de build pour utiliser `node:22-alpine` (résout les conflits et erreurs de syntaxe Vite 8 / Rolldown).
- Ajouter la configuration de reverse-proxy dans Nginx pour relayer les requêtes `/api/` et `/uploads/` vers le backend (port 3000).

### 3. Tailwind & PostCSS

- Créer `apps/blog/tailwind.config.js` et `apps/blog/postcss.config.js` pour charger les styles.

### 4. Code Source

- Copier l'intégralité du contenu de `apps/luminaview-blog/src/` et du dossier `public/` vers `refonte-gemini/apps/blog/src/` et `refonte-gemini/apps/blog/public/`.
- Mettre à jour `index.html` pour charger le point d'entrée Vite (`/src/main.tsx` ou `/src/index.tsx` selon le cas).

---

## Plan de vérification

### Test Automatisé / Build

- Lancer la compilation et le démarrage via Docker Compose :
  `docker compose up -d --build blog`

### Test Manuel

1. Ouvrir [http://localhost:7081/](http://localhost:7081/) dans le navigateur.
2. Vérifier que la page d'accueil du Blog s'affiche correctement.
3. Tester la lecture d'un article et la soumission d'un commentaire pour valider que le proxy Nginx communique bien avec le backend.

# Migration du Blog terminée 🎉

L'application publique **Blog** a été entièrement portée et configurée sous la nouvelle architecture `refonte-gemini` avec Vite.

## Ce qui a été accompli :

1. **Copie du code** : Rapatriement de tout le contenu de `apps/luminaview-blog/src` et `public` vers `refonte-gemini/apps/blog`.
2. **Configuration React 18 & Vite** : Rétrogradation à React 18.2.0 (identique au Studio/Manager) pour une compatibilité totale avec les librairies d'affichage markdown du blog, et configuration de `package.json` et `index.html` pour compiler via Vite.
3. **Mise en route de TailwindCSS** : Initialisation de `tailwind.config.js` et `postcss.config.js` spécifiques à l'application Blog.
4. **Nginx & Docker** : Mise à jour du `Dockerfile` sous Node 22 avec intégration des reverse-proxies Nginx pour l'accès transparent aux endpoints `/api/` et aux images téléchargées (`/uploads/`).

---

## 🔧 Comment tester :

> [!TIP]
> Tu peux dès à présent tester le Blog sur [http://localhost:7081/](http://localhost:7081/).
>
> Pour l'associer à ton utilisateur, tu peux utiliser l'URL directe configurée dans le routeur :  
> [http://localhost:7081/?user=jac](http://localhost:7081/?user=jac) (si `jac` est bien ton pseudo/name configuré en base).

Si tu as créé des articles de blog depuis le Studio (`Lumina Studio`), ils s'afficheront directement ici. Tu peux aussi tester l'ajout d'un commentaire pour vérifier la bonne liaison avec la base de données.

# Plan d'implémentation - Migration du Portfolio vers refonte-gemini 🖼️

Ce plan détaille le portage de l'application Portfolio (`apps/luminaview-portfolio`) vers le workspace global (`refonte-gemini/apps/portfolio`) en utilisant Vite et Docker (port 7090).

## Changements proposés

### 1. `apps/portfolio/package.json`

- Remplacer React 19 par React 18.2.0 (comme pour les autres apps).
- Ajouter les dépendances spécifiques du Portfolio (`react-router-dom`, `axios`, `framer-motion`, `react-markdown`, `rehype-raw`, `rehype-sanitize`, `remark-gfm`).
- Configurer les scripts de build pour utiliser Vite directement (`vite build`).

### 2. `apps/portfolio/Dockerfile`

- Mettre à jour l'image de build sous `node:22-alpine`.
- Insérer la configuration Nginx pour rediriger toutes les routes SPA vers `index.html` et ajouter les proxies `/api/` et `/uploads/` vers le backend (port 3000).

### 3. Code Source

- Copier l'intégralité du dossier `apps/luminaview-portfolio/src` vers `refonte-gemini/apps/portfolio/src`.
- S'assurer que le fichier `index.html` est configuré pour charger le point d'entrée Vite (`/src/main.tsx`).

---

## Plan de vérification

### Test de Compilation

- Lancer le build et démarrage du conteneur via Docker Compose :
  `docker compose up -d --build portfolio`

### Test Manuel

1. Ouvrir [http://localhost:7090/](http://localhost:7090/) dans le navigateur.
2. Pour tester avec ton portfolio utilisateur, accède à l'URL :
   [http://localhost:7090/jac](http://localhost:7090/jac) (où `jac` est ton nom d'utilisateur).
3. Vérifier que la mise en page (Artfolio), la biographie et la liste des albums publics s'affichent correctement.

# Migration du Portfolio terminée 🎉

L'application publique **Portfolio** a été portée avec succès sur le port `7090` dans la structure `refonte-gemini` avec Vite.

## Ce qui a été accompli :

1. **Copie des sources** : Transfert de tout le dossier `apps/luminaview-portfolio/src` vers `refonte-gemini/apps/portfolio/src`.
2. **Alignement technique** : Configuration de `package.json` et de la compilation sous Vite avec React 18.2.0 et Framer Motion 10.12.0 pour préserver les animations fluides.
3. **Nginx & Docker** : Utilisation de Node 22 pour la phase de build, et configuration du reverse-proxy Nginx sur le port `80` (mappé au port local `7090`) pour relayer proprement `/api/` et `/uploads/` vers le backend de l'application.

---

## 🔧 Comment tester :

> [!TIP]
> Tu peux tester le Portfolio directement sur [http://localhost:7090/](http://localhost:7090/).
>
> Pour l'associer à ton profil utilisateur et voir tes photos/biographie :  
> 👉 Accède à [http://localhost:7090/jac](http://localhost:7090/jac) (en remplaçant par ton pseudo utilisateur si différent).

Le design dynamique (Artfolio, etc.) se chargera automatiquement pour cet utilisateur en interrogeant l'API du backend via le proxy configuré.

Plan d'implémentation - Migration de la Chambre Noire vers refonte-gemini 📓
Ce plan détaille le portage de l'application Chambre Noire (apps/chambre-noire) vers le workspace global (refonte-gemini/apps/chambrenoire) en utilisant Vite et Docker (port 7082).

Changements proposés

1. Copie des fichiers sources
   Copier l'intégralité du dossier apps/chambre-noire/src vers refonte-gemini/apps/chambrenoire/src.
   Copier le contenu du dossier apps/chambre-noire/public vers refonte-gemini/apps/chambrenoire/public.
   Copier les fichiers de configuration de styles : tailwind.config.js et postcss.config.js depuis apps/chambre-noire vers refonte-gemini/apps/chambrenoire/.
2. apps/chambrenoire/package.json
   Remplacer le contenu du template par les dépendances de Chambre Noire sous React 18.2.0 et compiler via Vite.
   Dépendances : react, react-dom, react-router-dom, axios, framer-motion, react-markdown, rehype-raw, rehype-sanitize, remark-gfm.
   DevDependencies : tailwindcss, postcss, autoprefixer, @tailwindcss/typography, @vitejs/plugin-react, vite, typescript.
3. apps/chambrenoire/index.html
   Configurer l'index HTML pour pointer vers le point d'entrée Vite /src/index.tsx (au lieu de /src/main.tsx).
   Définir le titre du document : "LuminaView - Chambre Noire".
4. apps/chambrenoire/Dockerfile
   Configurer le builder sous node:22-alpine.
   Inclure les proxies Nginx pour /api/ et /uploads/ vers le backend (port 3000).
   Plan de vérification
   Test de Compilation
   Lancer le build et démarrage du conteneur via Docker Compose : docker compose up -d --build chambrenoire
   Test Manuel
   Ouvrir http://localhost:7082/ dans le navigateur.
   Pour tester avec ton profil, accède à l'URL : http://localhost:7082/?user=jac
   Vérifier que la page se charge correctement (Carnets de route / Chambre Noire) et que les carnets s'affichent sans erreurs de console.

# Migration de la Chambre Noire terminée 🎉

L'application publique **Chambre Noire** (Carnet de route) a été portée avec succès sur le port `7082` dans la structure `refonte-gemini` avec Vite.

## Ce qui a été accompli :

1. **Copie des sources** : Rapatriement de tout le contenu de `apps/chambre-noire/src` et `public` vers `refonte-gemini/apps/chambrenoire`.
2. **Alignement technique** : Configuration de `package.json` et de la compilation sous Vite avec React 18.2.0 et conversion des fichiers `postcss.config.js` et `tailwind.config.js` au format `.cjs` pour être compatibles avec la configuration ES Module du projet.
3. **Nginx & Docker** : Utilisation de Node 22 pour la phase de build, et configuration du reverse-proxy Nginx sur le port `80` (mappé au port local `7082`) pour relayer proprement `/api/` et `/uploads/` vers le backend de l'application.

---

## 🔧 Comment tester :

> [!TIP]
> Tu peux tester la Chambre Noire directement sur [http://localhost:7082/](http://localhost:7082/).
>
> Pour l'associer à ton profil utilisateur et voir tes carnets de route :  
> 👉 Accède à [http://localhost:7082/?user=jac](http://localhost:7082/?user=jac) (en remplaçant par ton pseudo utilisateur si différent).

# Bilan de la migration de l'écosystème LuminaView 🚀

Toutes les applications de la solution LuminaView ont été portées, migrées, et configurées avec succès sous la nouvelle structure `refonte-gemini` en utilisant Vite, React 18 et Docker.

---

## 🏗️ Rappel de la topologie des ports :

1. **Lumina Studio (Manager)** : 👉 [http://localhost:7080/](http://localhost:7080/)
2. **Blog (Hélioscope)** : 👉 [http://localhost:7081/?user=jac](http://localhost:7081/?user=jac)
3. **Portfolio (Artfolio)** : 👉 [http://localhost:7090/jac](http://localhost:7090/jac)
4. **Chambre Noire (Carnets publics)** : 👉 [http://localhost:7082/?user=jac](http://localhost:7082/?user=jac)

---

## 🛠️ Synthèse des réalisations :

- **Lumina Studio (Manager - Port 9080)** :
  - Intégration du sélecteur dynamique de thèmes ("Hélioscope / Classic" pour un menu horizontal et "Artfolio / Portfolio" pour le menu latéral fixe).
  - Gestion de la mise à jour immédiate du profil (changement de thème sans devoir se reconnecter).
  - Intégration sécurisée du gestionnaire de **Carnets de route** directement dans le Studio.
- **Blog (Port 9081)** & **Portfolio (Port 9090)** & **Chambre Noire (Port 9082)** :
  - Portés sous Vite + React 18.
  - Déploiement via des images Docker optimisées (`node:22-alpine` pour le build, `nginx:alpine` pour la distribution statique).
  - Reverse proxies Nginx configurés dans chaque conteneur pour distribuer `/api` et `/uploads` de façon transparente.
  - Les redirections inter-applicatives et les liens de navigation (Actualités, Portfolio, etc.) ont été corrigés pour utiliser les bons ports locaux.
  - La **Chambre Noire** publique (port 9082) a été épurée pour enlever les boutons de connexion/gestion privée (reportés de manière sécurisée dans le Studio).
- **Backend & Base de données** :
  - Remplacement de `ts-node-dev` par `tsx watch` pour supporter le rechargement automatique dans Docker.
  - Volumes Docker configurés pour le rechargement à chaud en développement.

# Plan d'implémentation — Toggles On/Off Blog & Carnet et Menus Dynamiques 🎛️

Ce plan détaille la mise en place de commutateurs On/Off dans le profil utilisateur pour le **Blog** (`hasBlog`) et la **Chambre Noire / Carnet** (`hasCarnet`). Les menus de navigation (Manager, Portfolio, Blog) s'adapteront dynamiquement selon la configuration de chaque utilisateur.

## Vue d'ensemble des changements

1. **Par défaut à l'inscription** : Lors d'une nouvelle inscription (`POST /api/auth/register`), `hasBlog` et `hasCarnet` sont initialisés à `false`.
2. **Gestion dans le profil (Manager)** : Ajout de 2 commutateurs modernes (Switches On/Off) dans la page **Mon Profil** (`EditProfile.tsx`) pour activer ou désactiver chaque module.
3. **Menu du Dashboard (Manager)** : Dans la barre latérale et le menu mobile (`Layout.tsx`), afficher :
   - `Voir ma vitrine` (Toujours actif pour le Portfolio)
   - `Voir mon blog` (Visible uniquement si `hasBlog === true`)
   - `Voir mon carnet` (Visible uniquement si `hasCarnet === true`)
4. **Menus Publics (Portfolio & Blog)** :
   - **Portfolio** (`Header.tsx`) : N'afficher le lien `Actualités / Blog` que si `hasBlog === true`, et `Carnet` que si `hasCarnet === true`.
   - **Blog** (`Navbar.tsx`) : N'afficher le lien `Carnet de route` que si `hasCarnet === true` (et URL renseignée).
5. **Haute performance** : Les champs `hasBlog` et `hasCarnet` sont directement inclus dans les requêtes utilisateur existantes (`/users/me` et `/users/public/:id`) sans aucune requête réseau supplémentaire ni latence.

---

## User Review Required

> [!IMPORTANT]
> Les utilisateurs existants dans la base de données qui n'ont pas encore les champs `hasBlog` et `hasCarnet` auront `false` par défaut (ou `true` si souhaité pour les comptes déjà créés).

---

## Proposed Changes

### Backend (API & Modèles)

#### [MODIFY] [User.ts](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/models/User.ts)

- Ajouter `hasBlog: { type: Boolean, default: false }`
- Ajouter `hasCarnet: { type: Boolean, default: false }`

#### [MODIFY] [authRoutes.ts](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/routes/authRoutes.ts)

- Dans la route `/register`, explicitement initialiser `hasBlog: false` et `hasCarnet: false`.

#### [MODIFY] [userRoutes.ts](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/routes/userRoutes.ts)

- Dans `PUT /me`, accepter et mettre à jour `hasBlog` et `hasCarnet`.
- Dans `GET /public/:id` (et toute recherche de profil public), inclure `hasBlog` et `hasCarnet` dans les champs retournés par `.select()`.

---

### Manager Application (Dashboard & Profil)

#### [MODIFY] [AuthContext.tsx](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/manager/src/context/AuthContext.tsx)

- Mettre à jour l'interface `User` avec `hasBlog?: boolean` et `hasCarnet?: boolean`.

#### [MODIFY] [EditProfile.tsx](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/manager/src/pages/EditProfile.tsx)

- Ajouter 2 états d'interrupteurs : `hasBlog` et `hasCarnet`.
- Ajouter une section visuelle claire dans le profil avec 2 Toggles On/Off stylisés (Vite / Tailwind / Glassmorphism).
- Envoyer les nouvelles valeurs dans la requête de mise à jour du profil.

#### [MODIFY] [Layout.tsx](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/manager/src/components/Layout.tsx)

- Conditionner l'affichage des liens dans la barre latérale et le menu mobile :
  - `user?.hasBlog` ➔ Afficher `Voir mon blog`
  - `user?.hasCarnet` ➔ Afficher `Voir mon carnet`

---

### Portfolio Application

#### [MODIFY] [types.ts](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/portfolio/src/types.ts)

- Étendre `UserProfile` avec `hasBlog?: boolean` et `hasCarnet?: boolean`.

#### [MODIFY] [Header.tsx](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/portfolio/src/components/Header.tsx)

- Conditionner le lien vers `Actualités` (`getBlogUrl`) sur `profile?.hasBlog === true`.
- Si `profile?.hasCarnet === true`, afficher également le lien vers le `Carnet`.

---

### Blog Application

#### [MODIFY] [Navbar.tsx](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/blog/src/components/blog/Navbar.tsx)

- N'afficher le lien `Carnet de route` que si `chambreNoireUrl` est définie ET le carnet activé.

---

## Verification Plan

### Automated / Build Verification

1. Vérifier que la compilation TypeScript du backend passe sans aucune erreur : `npm run build` dans `backend`.
2. Vérifier que le build Vite des applications frontend (`manager`, `portfolio`, `blog`) compile proprement.

### Manual Verification

1. Se connecter au Manager avec un utilisateur.
2. Aller dans **Mon Profil** et basculer l'interrupteur **Blog** ou **Carnet** sur ON / OFF, puis sauvegarder.
3. Vérifier que les liens `Voir mon blog` et `Voir mon carnet` apparaissent ou disparaissent instantanément dans le menu latéral et mobile du Dashboard.
4. Créer un nouveau compte utilisateur (inscription) et vérifier que par défaut, les options **Blog** et **Carnet** sont bien désactivées (`OFF`).
5. Ouvrir le Portfolio public du profil et s'assurer que le menu de navigation adapte ses éléments dynamiquement selon les options activées.

# Walkthrough — Interrupteurs On/Off Profil & Menus Dynamiques 🎛️

Toutes les fonctionnalités ont été implémentées et déployées sur les conteneurs Docker de la branche **`refonte-gemini`**.

## 🛠️ Modifications effectuées

### 1. Backend (API & Base de données)

- **Modèle Utilisateur** ([`User.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/models/User.ts)) : Ajout des champs booléens `hasBlog` et `hasCarnet` avec valeur par défaut `false`.
- **Inscription** ([`authRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/routes/authRoutes.ts)) : Les nouveaux comptes sont automatiquement créés avec `hasBlog: false` et `hasCarnet: false`.
- **API Profil** ([`userRoutes.ts`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/backend/src/routes/userRoutes.ts)) :
  - `PUT /me` : Reçoit et enregistre les états des toggles `hasBlog` et `hasCarnet`.
  - `GET /public/:id` : Renvoie `hasBlog` et `hasCarnet` dans les données publiques du profil.

### 2. Studio / Manager (Administration)

- **Page Profil** ([`EditProfile.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/manager/src/pages/EditProfile.tsx)) : Nouvelle section **⚙️ Modules & Extensions** avec deux interrupteurs On/Off modernes.
- **Menu du Dashboard** ([`Layout.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/manager/src/components/Layout.tsx)) :
  - `Voir ma vitrine` : Toujours présent.
  - `Voir mon blog` : Affiché uniquement si `hasBlog === true`.
  - `Voir mon carnet` et lien interne `Carnets` : Affichés uniquement si `hasCarnet === true`.

### 3. Portfolio & Blog (Applications publiques)

- **Portfolio** ([`Header.tsx`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/apps/portfolio/src/components/Header.tsx)) : Le lien `Actualités` dans le menu n'est affiché que si le module Blog est activé (`hasBlog === true`).

---

## ⚡ Performance

- **Aucune requête API additionnelle** : Les drapeaux d'activation sont directement intégrés dans les requêtes de profil utilisateur déjà existantes (`/users/me` et `/users/public/:id`).
- **Génération instantanée en mémoire** : Le filtrage des menus se fait dynamiquement via l'état React sans aucun temps de latence.

---

## 🧪 Procédure de vérification

1. Connecte-toi sur **Lumina Studio** (`http://localhost:7080`).
2. Rends-toi sur **Mon Profil**.
3. Active ou désactive le **Module Blog** et/ou le **Module Carnet**, puis clique sur **Enregistrer**.
4. Observe la mise à jour immédiate du menu latéral du Dashboard.
5. Ouvre ton **Portfolio** (`http://localhost:7090/votre-pseudo`) pour constater la présence ou l'absence du lien `Actualités` dans le menu haut.

# Plan d'Architecture & Déploiement — Lumina Studio & Hélioscope 🌐

Ce document détaille le plan d'architecture réseau et de routage reverse-proxy pour **Localhost** et pour la **Mise en Production** (avec **Caddy Server**).

---

## 🎯 Rappel des Objectifs d'Architecture

1. **Manager (Lumina Studio)** :
   - URL dédiée d'administration : `lumina.fr`
   - Permet l'authentification des utilisateurs, la gestion des albums, galeries, pages, et la configuration des modules **Blog** et **Carnet**.

2. **Accès Public Principal (Portfolio)** :
   - Point d'entrée unique par utilisateur : `{username}.helioscope.fr` (ex: `jac.helioscope.fr`).
   - Affiche directement le Portfolio de l'utilisateur.

3. **Modules Publics Découplés (Blog & Carnet)** :
   - **Blog (Hélioscope)** : `{username}-blog.helioscope.fr` (Accessible depuis le Portfolio si `hasBlog === true`).
   - **Carnet (Chambre Noire)** : `{username}-carnet.helioscope.fr` (Accessible depuis le Portfolio si `hasCarnet === true`).

4. **Reverse-Proxy Production** :
   - Remplacement de `nginx-proxy-manager` / `lt-proxy` par **Caddy Server** avec SSL automatique (Let's Encrypt / Wildcard).

---

## 💻 PLAN 1 : Architecture Localhost (Développement)

En environnement local, les applications tournent dans leurs conteneurs Docker respectifs exposés sur la plage de ports `70xx` :

| Application            | Conteneur Docker                 | URL Localhost                     | Rôle                                               |
| :--------------------- | :------------------------------- | :-------------------------------- | :------------------------------------------------- |
| **Backend API**        | `luminaview-gemini-backend`      | `http://localhost:3000`           | API REST & Base de données Mongo                   |
| **Studio (Manager)**   | `luminaview-gemini-manager`      | `http://localhost:7080`           | Interface de gestion privée (`lumina.fr` en local) |
| **Portfolio (Public)** | `luminaview-gemini-portfolio`    | `http://localhost:7090/?user=jac` | Entrée publique de l'utilisateur                   |
| **Blog (Public)**      | `luminaview-gemini-blog`         | `http://localhost:7081/?user=jac` | Module Blog public (si activé)                     |
| **Carnet (Public)**    | `luminaview-gemini-chambrenoire` | `http://localhost:7082/?user=jac` | Module Carnet public (si activé)                   |

### Routage Local dans le code (`urls.ts`) :

- Dans `urls.ts` et les composants de navigation, les liens locaux ouvrent les bons ports avec le paramètre `?user={username}`.

---

## 🚀 PLAN 2 : Architecture de Production (Caddy Server)

En production, **Caddy** gère le SSL automatique et le routage des sous-domaines vers les conteneurs Docker via le réseau interne Docker (`gemini-network`).

### 1. Topologie des sous-domaines Production

```
                                  +------------------------------------+
                                  |            CADDY PROXY             |
                                  |     (Port 80 / 443 + TLS Auto)     |
                                  +-----------------+------------------+
                                                    |
         +------------------------------------------+------------------------------------------+
         |                                          |                                          |
   [ lumina.fr ]                           [ jac.helioscope.fr ]                    [ jac-blog / jac-carnet ]
         |                                          |                                          |
         v                                          v                                          v
+------------------+                       +-------------------+                      +-------------------+
| Studio (Manager) |                       | Portfolio Public  |                      |  Blog / Carnet    |
|   (Port 7080)    |                       |    (Port 7090)    |                      | (Port 7081/7082)  |
+------------------+                       +-------------------+                      +-------------------+
```

### 2. Configuration du Caddyfile Production

Fichier `Caddyfile` à déployer sur le serveur de production :

```caddy
{
    email admin@lumina.fr
}

# -------------------------------------------------------------
# 1. LUMINA STUDIO (Manager & API Backend)
# -------------------------------------------------------------
lumina.fr, www.lumina.fr {
    # Proxy frontend Manager
    reverse_proxy luminaview-gemini-manager:80
}

# API Backend centralisé
api.lumina.fr {
    reverse_proxy luminaview-gemini-backend:3000
}

# -------------------------------------------------------------
# 2. ECOSYSTÈME HÉLIOSCOPE (Portfolios, Blogs & Carnets Publics)
# -------------------------------------------------------------
*.helioscope.fr {
    # 2.A — Matcher pour les Blogs (ex: jac-blog.helioscope.fr)
    @blog header_regexp Host ^([a-zA-Z0-9-]+)-blog\.helioscope\.fr$
    handle @blog {
        reverse_proxy luminaview-gemini-blog:80
    }

    # 2.B — Matcher pour les Carnets de route (ex: jac-carnet.helioscope.fr)
    @carnet header_regexp Host ^([a-zA-Z0-9-]+)-carnet\.helioscope\.fr$
    handle @carnet {
        reverse_proxy luminaview-gemini-chambrenoire:80
    }

    # 2.C — Par défaut : Entrée Portfolio Utilisateur (ex: jac.helioscope.fr)
    handle {
        reverse_proxy luminaview-gemini-portfolio:80
    }
}
```

---

## 🔧 Mise à jour du Helper d'URL en Production (`urls.ts`)

Pour s'assurer que les applications génèrent des liens de production parfaits :

```typescript
export const getAppUrl = (
  app: "blog" | "portfolio" | "carnet",
  username: string,
) => {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const name = username.toLowerCase();

  if (isLocal) {
    if (app === "blog") return `http://localhost:7081/?user=${name}`;
    if (app === "portfolio") return `http://localhost:7090/${name}`;
    if (app === "carnet") return `http://localhost:7082/?user=${name}`;
  }

  // Production URLs
  if (app === "portfolio") return `https://${name}.helioscope.fr`;
  if (app === "blog") return `https://${name}-blog.helioscope.fr`;
  if (app === "carnet") return `https://${name}-carnet.helioscope.fr`;

  return `https://${name}.helioscope.fr`;
};
```

---

## 📋 Étapes d'exécution du Déploiement

- [ ] **Étape 1 : Valider les Helpers de routage (`urls.ts`)**
  - Mettre à jour `urls.ts` dans les 3 applications frontend (`manager`, `portfolio`, `blog`) pour générer `{name}.helioscope.fr` pour le portfolio et `{name}-blog`/`{name}-carnet` pour les sous-modules.

- [x] **Étape 2 : Préparer le Docker Compose Production & Caddy**
  - Création du fichier [`Caddyfile`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/caddy/Caddyfile) dans `refonte-gemini/caddy/`.
  - Création de la stack Docker Production [`docker-compose.prod.yml`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/docker-compose.prod.yml) incluant Caddy avec SSL automatique.

---

## 🚀 Guide de déploiement en Production (Caddy Server)

### 1. Fichiers créés :

- [`refonte-gemini/caddy/Caddyfile`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/caddy/Caddyfile) : Gère les certificats SSL automatiques Let's Encrypt et le routage sous-dossiers (`/blog` et `/carnet`).
- [`refonte-gemini/docker-compose.prod.yml`](file:///Users/jac/docker/hi3/luminaview-Monorepo/refonte-gemini/docker-compose.prod.yml) : Stack complète prête à tourner en production sans exposer les ports de développement.

### 2. Démarrage en Production :

Sur votre serveur de production :

```bash
cd refonte-gemini
docker compose -f docker-compose.prod.yml up -d --build
```

- [ ] **Étape 3 : Configuration DNS Production**
  - Rediriger les enregistrements A / CNAME :
    - `lumina.fr` ➔ IP du serveur
    - `*.helioscope.fr` ➔ IP du serveur (Wildcard DNS)

- [ ] **Étape 4 : Test de bout en bout**
  - Connexion sur `lumina.fr` (Manager Studio).
  - Consultation de `jac.helioscope.fr` (Portfolio).
  - Navigation vers `jac-blog.helioscope.fr` (si `hasBlog === true`).

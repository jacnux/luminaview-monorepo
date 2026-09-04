# LuminaView Monorepo

Écosystème photographique et éditorial complet pour la gestion, la présentation et le partage de portfolios, carnets de route argentiques/numériques, blogs et grimoires.

---

## 🏛️ Architecture du Monorepo

```
luminaview-monorepo/
├── apps/
│   ├── manager/       # Studio d'administration & gestion des albums (Port 7080)
│   ├── portfolio/     # Portfolio public photographe (Port 7090)
│   ├── blog/          # Blog éditorial et articles (Port 7081)
│   ├── chambrenoire/  # Carnet de route & labo argentique/numérique (Port 7082)
│   └── grimoire/      # Bibliothèque & récits visuels (Port 7091)
├── packages/
│   ├── types/         # Types TypeScript partagés (@luminaview/types)
│   └── ui/            # Composants React partagés (@luminaview/ui - Lightbox, Modales)
├── backend/           # API REST Express + MongoDB + Sharp + Exifr (Port 7099 / 3000)
├── caddy/             # Configuration Reverse Proxy Caddy SSL automatique
├── data/              # Volumes persistants MongoDB et uploads images
└── documentation/     # Guides, architecture et documentation technique
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v20+) et `npm`

### 1. Lancement de la Stack Complète en Local (Docker Compose)
```bash
# Construction des images
docker compose build

# Lancement des conteneurs
docker compose up -d

# Vérification du statut
docker compose ps
```

### 2. Accès aux Applications Locales
- **Studio Manager** : [http://localhost:7080](http://localhost:7080)
- **Chambre Noire** : [http://localhost:7082](http://localhost:7082)
- **Portfolio** : [http://localhost:7090](http://localhost:7090)
- **Blog** : [http://localhost:7081](http://localhost:7081)
- **Grimoire** : [http://localhost:7091](http://localhost:7091)
- **API Backend** : [http://localhost:7099/api](http://localhost:7099/api)
- **MailHog (Webmail dev)** : [http://localhost:8025](http://localhost:8025)

---

## 🧪 Tests & Qualité de Code

```bash
# Installer les dépendances du monorepo
npm install

# Exécuter l'ensemble des tests automatisés
npm run test

# Vérifier les types TypeScript
npm run typecheck

# Construire l'ensemble des workspaces
npm run build
```

---

## 📦 Déploiement en Production

Le déploiement en production utilise `docker-compose.prod.yml` avec **Caddy** en reverse proxy automatique (gestion des certificats Let's Encrypt SSL pour tous les sous-domaines).

```bash
# Sur le serveur de production :
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

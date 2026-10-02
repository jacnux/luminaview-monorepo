# ==============================================================================
# Étape 1 — Build : compilation TypeScript → JavaScript
# ==============================================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Outils natifs nécessaires à Sharp
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Installation de toutes les dépendances (y compris devDeps pour tsc)
COPY package*.json ./
RUN npm install && npm install --os=linux --cpu=x64 sharp

# Copie des sources et compilation
COPY . .
RUN npm run build

# ==============================================================================
# Étape 2 — Production : image légère sans devDependencies ni code source TS
# ==============================================================================
FROM node:22-bookworm-slim AS production

WORKDIR /app

# Outils natifs pour Sharp + polices pour le filigrane
RUN apt-get update && apt-get install -y python3 make g++ fontconfig fonts-dejavu && rm -rf /var/lib/apt/lists/*

# Uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev && npm install --os=linux --cpu=x64 sharp

# Copie du build compilé depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Copie des éventuels assets statiques (uploads, etc.) si nécessaire
# COPY --from=builder /app/uploads ./uploads

EXPOSE 3000

# Démarrage en mode production : node sur le JS compilé
CMD ["node", "dist/server.js"]

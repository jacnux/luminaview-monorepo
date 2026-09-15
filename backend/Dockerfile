# ==============================================================================
# Étape 1 — Build : compilation TypeScript → JavaScript
# ==============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Outils natifs nécessaires à Sharp
RUN apk add --no-cache python3 make g++

# Installation de toutes les dépendances (y compris devDeps pour tsc)
COPY package*.json ./
RUN npm install

# Copie des sources et compilation
COPY . .
RUN npm run build

# ==============================================================================
# Étape 2 — Production : image légère sans devDependencies ni code source TS
# ==============================================================================
FROM node:18-alpine AS production

WORKDIR /app

# Outils natifs pour Sharp + polices pour le filigrane
RUN apk add --no-cache python3 make g++ fontconfig ttf-dejavu

# Uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copie du build compilé depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Copie des éventuels assets statiques (uploads, etc.) si nécessaire
# COPY --from=builder /app/uploads ./uploads

EXPOSE 3000

# Démarrage en mode production : node sur le JS compilé
CMD ["node", "dist/server.js"]

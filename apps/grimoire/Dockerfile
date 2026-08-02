# Étape 1 : Build de l'application Grimoire
FROM node:20-alpine AS build

WORKDIR /app

# On copie le package.json racine et les packages partagés
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/grimoire/ ./apps/grimoire/

WORKDIR /app/apps/grimoire
RUN npm install
RUN npm run build

# Étape 2 : Serveur Nginx pour distribuer les fichiers statiques
FROM nginx:alpine

# Copie des fichiers générés vers le dossier Nginx
COPY --from=build /app/apps/grimoire/dist /usr/share/nginx/html

# Configuration pour SPA et proxy /api
RUN rm /etc/nginx/conf.d/default.conf
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:3000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
    location /uploads/ { \
        proxy_pass http://backend:3000/uploads/; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

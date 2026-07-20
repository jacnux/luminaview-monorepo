# Étape 1 : Build de l'application
FROM node:22-alpine AS build

WORKDIR /app

# On copie les package.json (on utilise npm standard pour le build)
COPY package*.json ./
RUN npm install

# On copie le code source
COPY . .

# On construit le build de production
RUN npm run build

# Étape 2 : Serveur Nginx pour distribuer les fichiers statiques
FROM nginx:alpine

# Copie des fichiers générés vers le dossier de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration pour rediriger toutes les routes vers index.html (SPA) et proxy /api
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

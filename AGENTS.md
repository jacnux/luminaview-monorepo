# Règles de développement

## Stack
- Frontend : React + TypeScript.
- Backend : Node.js + Express + TypeScript.
- Infrastructure : Docker Compose, Nginx, MongoDB et MinIO.
- Ollama est installé sur macOS ; ne pas l’ajouter à Docker Compose.

## Méthode
- Faire une analyse et proposer un plan avant toute modification multi-fichiers.
- Préférer le changement minimal et réversible.
- Ne jamais supprimer de fichier, de route, de composant ou de dépendance sans accord explicite.
- Ne modifier ni docker-compose.yml, ni Dockerfile, ni nginx.conf, ni les variables d’environnement sans l’annoncer clairement.
- Ne pas réécrire une architecture fonctionnelle.
- Avant de conclure, fournir les fichiers modifiés, le diff et les commandes de validation.

## Validation
- Vérifier TypeScript après une modification concernée.
- Ne pas annoncer qu’un correctif est terminé si les commandes de validation échouent.

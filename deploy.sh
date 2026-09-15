#!/bin/bash
# ==============================================================================
# LuminaView — Script de Déploiement en Production
# Usage:
#   ./deploy.sh            (déploie la dernière version de la branche main)
#   ./deploy.sh v1.7.2     (déploie un tag spécifique, ex: v1.7.2)
# ==============================================================================

set -e # Arrêt immédiat en cas d'erreur

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.prod.yml"
TARGET="${1:-main}"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🚀 LuminaView — Démarrage du déploiement en production${NC}"
echo -e "${BLUE}Cible : ${YELLOW}${TARGET}${NC}"
echo -e "${BLUE}Date  : $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Vérification des prérequis
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Erreur : Docker n'est pas installé ou non accessible.${NC}"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Erreur : Fichier $COMPOSE_FILE introuvable dans le répertoire courant.$(pwd)${NC}"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Attention : Fichier .env introuvable. Assurez-vous que les variables d'environnement de production sont définies.${NC}"
fi

# 2. Sauvegarde de sécurité préalable (si backup.sh est disponible)
if [ -f "./backup.sh" ]; then
    echo -e "\n${YELLOW}📦 Étape 1/5 : Sauvegarde préalable des données...${NC}"
    chmod +x ./backup.sh
    ./backup.sh || echo -e "${YELLOW}⚠️ Avertissement : La sauvegarde a échoué ou a émis un avertissement, poursuite du déploiement...${NC}"
else
    echo -e "\n${YELLOW}ℹ️ Pas de script backup.sh détecté, passage à l'étape suivante.${NC}"
fi

# 3. Mise à jour du code source Git
echo -e "\n${YELLOW}📥 Étape 2/5 : Récupération des dernières sources depuis Git...${NC}"
git fetch --all --tags --prune

if [[ "$TARGET" =~ ^v[0-9]+\.[0-9]+ ]]; then
    echo -e "Basculement sur le tag : ${GREEN}$TARGET${NC}"
    git checkout "$TARGET"
else
    echo -e "Mise à jour sur la branche : ${GREEN}$TARGET${NC}"
    git checkout "$TARGET"
    git pull origin "$TARGET"
fi

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "Commit actif : ${GREEN}${CURRENT_COMMIT}${NC}"

# 4. Reconstruction des images Docker
echo -e "\n${YELLOW}🔨 Étape 3/5 : Construction des images Docker de production...${NC}"
docker compose -f "$COMPOSE_FILE" build --pull

# 5. Redémarrage des services en production
echo -e "\n${YELLOW}🔄 Étape 4/5 : Déploiement et redémarrage des conteneurs...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# 6. Vérification de santé et nettoyage
echo -e "\n${YELLOW}🧹 Étape 5/5 : Vérification de santé & nettoyage des images orphelines...${NC}"
sleep 5

docker compose -f "$COMPOSE_FILE" ps

# Nettoyage des anciennes images Docker non étiquetées
docker image prune -f

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}Version déployée : ${YELLOW}${TARGET}${GREEN} (${CURRENT_COMMIT})${NC}"
echo -e "${GREEN}Services disponibles via Caddy HTTPS : https://luminaview.fr${NC}"
echo -e "${GREEN}======================================================${NC}"

#!/bin/bash

# Configuration
BACKUP_DIR="/home/jac/backups" # Dossier où stocker les sauvegardes sur ton VPS
PROJECT_DIR="/home/jac/luminaview-monorepo"
DATE=$(date +%Y-%m-%d_%Hh%M)
BACKUP_NAME="luminaview_backup_$DATE"

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "=== Début de la sauvegarde ($DATE) ==="

# 1. Sauvegarde de la base de données MongoDB (à chaud depuis le conteneur)
echo "Sauvegarde de MongoDB..."
docker exec luminaview-mongo mongodump --archive="/tmp/mongo_dump.archive"
docker cp luminaview-mongo:/tmp/mongo_dump.archive "/tmp/mongo_dump.archive"
docker exec luminaview-mongo rm "/tmp/mongo_dump.archive"

# 2. Création de l'archive finale (Dump Mongo + Images)
echo "Création de l'archive compressée (tar.gz)..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    -C /tmp mongo_dump.archive \
    -C "$PROJECT_DIR" data/uploads

# Nettoyage du fichier temporaire
rm -f "/tmp/mongo_dump.archive"

# 3. Nettoyage des anciennes sauvegardes (conserver uniquement les 7 derniers jours)
echo "Nettoyage des sauvegardes de plus de 7 jours..."
find "$BACKUP_DIR" -name "luminaview_backup_*.tar.gz" -mtime +7 -delete

echo "=== Sauvegarde terminée avec succès ! ==="

#!/bin/bash

echo "Arrêt des conteneurs pour libérer la base de données..."
docker compose down

echo "Suppression de l'éventuel dossier data existant (vide) dans le monorepo..."
rm -rf /Users/jac/docker/hi3/luminaview-Monorepo/data

echo "Copie du dossier data complet depuis l'ancien projet..."
cp -R /Users/jac/docker/luminaview/blog-luminaview/data /Users/jac/docker/hi3/luminaview-Monorepo/

echo "Redémarrage des conteneurs..."
docker compose up -d

echo "La copie est terminée ! Les conteneurs redémarrent."

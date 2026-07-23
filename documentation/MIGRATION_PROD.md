# Guide de Migration vers la Production

Ce guide explique comment migrer vos données (LuminaView, Helioscope Blogs, et Chambre Noire) depuis votre ancienne architecture de production vers le nouveau Monorepo, directement sur votre VPS.

---

## Étape 1 : Préparation sur le Serveur VPS

Connectez-vous à votre serveur VPS (en SSH) et récupérez la dernière version du code (Monorepo) depuis GitHub :

```bash
cd /chemin/vers/votre/dossier/projets
git clone https://github.com/VOTRE_PSEUDO/luminaview-monorepo.git
cd luminaview-monorepo
```

Créez ensuite les dossiers qui accueilleront vos données unifiées :

```bash
mkdir -p data/mongo
mkdir -p data/uploads
```

---

## Étape 2 : Rapatrier les données de la Chambre Noire (Autre Serveur)

Puisque la Chambre Noire est hébergée sur un autre serveur, vous devez d'abord copier physiquement ses données (base de données et images) vers le serveur principal (celui où se trouvera le Monorepo).

**Sur le serveur principal (où vous venez de cloner le Monorepo) :**
Créez un dossier temporaire pour accueillir les données importées :

```bash
mkdir -p ./data/import_chambrenoire/mongo
mkdir -p ./data/import_chambrenoire/uploads
```

**Pour transférer les données (depuis votre Mac ou le serveur Chambre Noire) :**
Vous pouvez utiliser `rsync` ou `scp` pour copier les dossiers. Exemple avec `scp` (à adapter selon vos accès SSH) :

```bash
# Copie de la base Mongo
scp -r root@IP_SERVEUR_CHAMBRE_NOIRE:/chemin/vers/chambre-noire/data/mongo/* ./data/import_chambrenoire/mongo/

# Copie des images (uploads)
scp -r root@IP_SERVEUR_CHAMBRE_NOIRE:/chemin/vers/chambre-noire/data/uploads/* ./data/import_chambrenoire/uploads/

tar -czvf mongo_backup.tar.gz mongo/
tar -czvf uploads_backup.tar.gz uploads/
chown jac:jac mongo_backup.tar.gz uploads_backup.tar.gz



scp jac@195.154.112.225:/home/jac/Chambre-Noire/data/mongo_backup.tar.gz ./data/import_chambrenoire/
scp jac@195.154.112.225:/home/jac/Chambre-Noire/data/uploads_backup.tar.gz ./data/import_chambrenoire/





```

_(Si vous préférez, vous pouvez aussi passer par un logiciel FTP classique comme FileZilla pour télécharger les dossiers de l'ancien serveur et les uploader sur le nouveau)._

---

## Étape 3 : Lier les anciennes bases de données dans Docker

Sur le serveur principal, vous avez maintenant les données de LuminaView (locales) et les données rapatriées de la Chambre Noire.

1. Repérez le chemin absolu de votre **ancien dossier `data/mongo` LuminaView** (ex: `/home/jac/luminaview/blog-luminaview/data/mongo`).
2. Ouvrez le fichier `docker-compose.migration.yml` présent dans le Monorepo.
3. Remplacez les chemins de `volumes` :
   - Pour `mongo-old-luminaview` : Mettez le chemin de votre ancien LuminaView.
   - Pour `mongo-old-chambrenoire` : Mettez le chemin de votre nouveau dossier de rapatriement (ex: `/chemin/vers/luminaview-monorepo/data/import_chambrenoire/mongo`).

---

## Étape 4 : Lancer la migration des données

Assurez-vous que les **anciens conteneurs LuminaView** en production sont arrêtés pour éviter les conflits de port :

```bash
# Arrêter les anciennes applications
# cd /chemin/ancienne/app && docker compose down
```

Lancez la nouvelle base de données (vide) et les anciennes bases (en lecture) :

```bash
# Dans le dossier luminaview-monorepo
docker compose -f docker-compose.yml up -d mongo
docker compose -f docker-compose.migration.yml up -d
```

Exécutez le script de migration :

```bash
docker compose run --rm backend npx ts-node scripts/migrateData.ts
```

_Le script va tout lire et tout copier proprement dans `luminaview_core`. Attendez le message "✅ Migration terminée avec succès"._

Une fois terminé, vous pouvez éteindre les vieilles bases :

```bash
docker compose -f docker-compose.migration.yml down
```

---

## Étape 5 : Fusionner les Images (Uploads)

La base de données est migrée, mais il manque les fichiers physiques ! Copiez le contenu de vos anciens dossiers d'uploads vers le nouveau dossier central du monorepo.

```bash
# Copie des images de LuminaView / Blog (sur le même serveur)
cp -r /chemin/vers/ancienne/app/luminaview/data/uploads/* ./data/uploads/

# Copie des images rapatriées de la Chambre Noire (depuis notre dossier d'import)
cp -r ./data/import_chambrenoire/uploads/* ./data/uploads/
```

---

## Étape 6 : Lancement en Production

1. Renommez le fichier `.env.prod.example` en `.env` :
   ```bash
   cp .env.prod.example .env
   ```
2. Modifiez le `.env` pour y insérer vos vrais mots de passe (JWT_SECRET, SMTP, etc.).
3. Démarrez l'application finale !
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

**Félicitations**, le Monorepo est en ligne, multi-utilisateurs et unifié !

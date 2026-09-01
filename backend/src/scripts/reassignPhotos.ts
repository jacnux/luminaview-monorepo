import mongoose from 'mongoose';
import Photo from '../models/Photo';
import Album from '../models/Album';
import Project from '../models/Project';
import User from '../models/User';

async function reassignPhotos() {
  const isDryRun = process.argv.includes('--dry-run');
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/luminaview_core';

  console.log(`🔌 Connexion à MongoDB (${mongoUri})...`);
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // 1. Lister les utilisateurs
    const users = await User.find({}).select('_id name email').lean();
    console.log(`👥 Utilisateurs enregistrés (${users.length}) :`);
    users.forEach(u => console.log(`   - ${u.name} (id: ${u._id}, email: ${u.email})`));

    // 2. Vérification des incohérences Photo <-> Album parent
    console.log('\n🔍 1. Vérification des incohérences Photo <-> Album parent...');
    const albums = await Album.find({}).lean();
    const albumUserMap = new Map(albums.map(a => [a._id.toString(), a.userId ? a.userId.toString() : null]));

    const allPhotos = await Photo.find({}).select('_id albumId projectId userId title filename').lean();
    let reassignAlbumCount = 0;

    for (const photo of allPhotos) {
      if (photo.albumId) {
        const albumOwnerId = albumUserMap.get(photo.albumId.toString());
        if (albumOwnerId && photo.userId && photo.userId.toString() !== albumOwnerId) {
          reassignAlbumCount++;
          console.log(`   📸 [Photo ${photo._id}] "${photo.filename || photo.title}"`);
          console.log(`      Actuel userId: ${photo.userId} ➔ Nouveau (Propriétaire Album): ${albumOwnerId}`);
          
          if (!isDryRun) {
            await Photo.updateOne({ _id: photo._id }, { $set: { userId: new mongoose.Types.ObjectId(albumOwnerId) } });
          }
        }
      }
    }

    // 3. Vérification des incohérences Photo <-> Projet parent (Carnet)
    console.log('\n🔍 2. Vérification des incohérences Photo <-> Projet parent (Carnet)...');
    const projects = await Project.find({}).lean();
    const projectUserMap = new Map(projects.map(p => [p._id.toString(), p.userId ? p.userId.toString() : null]));
    let reassignProjectCount = 0;

    for (const photo of allPhotos) {
      if (photo.projectId) {
        const projectOwnerId = projectUserMap.get(photo.projectId.toString());
        if (projectOwnerId && photo.userId && photo.userId.toString() !== projectOwnerId) {
          reassignProjectCount++;
          console.log(`   📔 [Photo Carnet ${photo._id}] "${photo.filename || photo.title}"`);
          console.log(`      Actuel userId: ${photo.userId} ➔ Nouveau (Propriétaire Projet): ${projectOwnerId}`);

          if (!isDryRun) {
            await Photo.updateOne({ _id: photo._id }, { $set: { userId: new mongoose.Types.ObjectId(projectOwnerId) } });
          }
        }
      }
    }

    // 4. Bilan
    console.log('\n==================================================');
    console.log('📊 BILAN DE LA VÉRIFICATION :');
    console.log(`   - Photos à réassigner via leur Album : ${reassignAlbumCount}`);
    console.log(`   - Photos à réassigner via leur Projet : ${reassignProjectCount}`);
    console.log('==================================================');

    if (isDryRun) {
      console.log('\n⚠️ MODE SIMULATION (--dry-run) : Aucune écriture effectuée en base.');
      console.log('💡 Pour appliquer les modifications, relancez sans le flag --dry-run.');
    } else {
      console.log('\n✅ Modifications appliquées avec succès dans MongoDB !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la réattribution des photos :', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB.');
    process.exit(0);
  }
}

reassignPhotos();

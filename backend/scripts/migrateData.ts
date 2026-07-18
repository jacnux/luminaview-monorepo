import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

import User from '../src/models/User';
import UserPage from '../src/models/UserPage';
import Album from '../src/models/Album';
import Photo from '../src/models/Photo';
import Comment from '../src/models/Comment';
import Film from '../src/models/Film';
import Gear from '../src/models/Gear';
import Project from '../src/models/Project';
import Post from '../src/models/Post';
import PostComment from '../src/models/PostComment';
import NewsletterSubscriber from '../src/models/NewsletterSubscriber';

const MIGRATION_CONFIG = {
  OLD_LUMINAVIEW: 'mongodb://mongo-old-luminaview:27017/luminaview',
  OLD_BLOG: 'mongodb://mongo-old-luminaview:27017/helioscope_blogs',
  OLD_CHAMBRENOIRE: 'mongodb://mongo-old-chambrenoire:27017/chambrenoire',
  NEW_CORE: 'mongodb://mongo:27017/luminaview_core'
};

const runMigration = async () => {
  console.log('🚀 Démarrage de la migration des données...');

  try {
    // 1. Connexion à la NOUVELLE base (Cible)
    console.log('🔌 Connexion à la nouvelle base (Cible)...');
    await mongoose.connect(MIGRATION_CONFIG.NEW_CORE);
    console.log('✅ Connecté à luminaview_core');

    // Nettoyage de la base cible
    console.log('🧹 Nettoyage de la base cible...');
    const collections = Object.values(mongoose.connection.collections);
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log('✅ Base cible vidée.');

    // 2. Connexion aux ANCIENNES bases avec MongoClient
    console.log('🔌 Connexion aux anciennes bases...');
    const clientLumina = new MongoClient(MIGRATION_CONFIG.OLD_LUMINAVIEW);
    const clientBlog = new MongoClient(MIGRATION_CONFIG.OLD_BLOG);
    const clientChambre = new MongoClient(MIGRATION_CONFIG.OLD_CHAMBRENOIRE);

    await Promise.all([
      clientLumina.connect(),
      clientBlog.connect(),
      clientChambre.connect()
    ]);
    console.log('✅ Connecté aux anciennes bases.');

    const dbLumina = clientLumina.db('luminaview');
    const dbBlog = clientBlog.db('helioscope_blogs');
    const dbChambre = clientChambre.db('chambrenoire');

    // --- A. MIGRATION UTILISATEURS ---
    console.log('\n--- 📂 Migration des Utilisateurs ---');
    const oldUsers = await dbLumina.collection('users').find({}).toArray();
    for (const u of oldUsers) {
      await new User(u).save();
    }
    console.log('✅ ' + oldUsers.length + ' utilisateurs migrés.');

    const oldPages = await dbLumina.collection('userpages').find({}).toArray();
    for (const p of oldPages) {
      await new UserPage(p).save();
    }
    console.log('✅ ' + oldPages.length + ' pages utilisateur migrées.');

    // --- B. MIGRATION LUMINAVIEW ---
    console.log('\n--- 📂 Migration LuminaView (Albums, Photos) ---');
    const luminaAlbums = await dbLumina.collection('albums').find({}).toArray();
    for (const a of luminaAlbums) {
      a.appContext = 'LUMINAVIEW';
      await new Album(a).save();
    }
    console.log('✅ ' + luminaAlbums.length + ' albums LuminaView migrés.');

    const luminaPhotos = await dbLumina.collection('photos').find({}).toArray();
    for (const p of luminaPhotos) {
      p.appContext = 'LUMINAVIEW';
      await new Photo(p).save();
    }
    console.log('✅ ' + luminaPhotos.length + ' photos LuminaView migrées.');

    const luminaComments = await dbLumina.collection('comments').find({}).toArray();
    for (const c of luminaComments) {
      await new Comment(c).save();
    }
    console.log('✅ ' + luminaComments.length + ' commentaires de photos migrés.');

    // --- C. MIGRATION CHAMBRE NOIRE ---
    console.log('\n--- 📂 Migration Chambre Noire ---');
    const cnAlbums = await dbChambre.collection('albums').find({}).toArray();
    for (const a of cnAlbums) {
      a.appContext = 'CHAMBRE_NOIRE';
      const existing = await Album.findById(a._id);
      if (!existing) await new Album(a).save();
    }
    console.log('✅ ' + cnAlbums.length + ' albums Chambre Noire migrés (ou fusionnés).');

    const cnPhotos = await dbChambre.collection('photos').find({}).toArray();
    for (const p of cnPhotos) {
      p.appContext = 'CHAMBRE_NOIRE';
      const existing = await Photo.findById(p._id);
      if (!existing) await new Photo(p).save();
    }
    console.log('✅ ' + cnPhotos.length + ' photos Chambre Noire migrées (ou fusionnées).');

    const cnFilms = await dbChambre.collection('films').find({}).toArray();
    for (const f of cnFilms) {
      await new Film(f).save();
    }
    console.log('✅ ' + cnFilms.length + ' films migrés.');

    const cnGear = await dbChambre.collection('gears').find({}).toArray();
    for (const g of cnGear) {
      await new Gear(g).save();
    }
    console.log('✅ ' + cnGear.length + ' équipements migrés.');

    const cnProjects = await dbChambre.collection('projects').find({}).toArray();
    for (const p of cnProjects) {
      await new Project(p).save();
    }
    console.log('✅ ' + cnProjects.length + ' projets migrés.');

    // --- D. MIGRATION BLOGS ---
    console.log('\n--- 📂 Migration du Blog ---');
    const blogPosts = await dbBlog.collection('posts').find({}).toArray();
    for (const p of blogPosts) {
      await new Post(p).save();
    }
    console.log('✅ ' + blogPosts.length + ' articles migrés.');

    const blogSubs = await dbBlog.collection('newslettersubscribers').find({}).toArray();
    for (const s of blogSubs) {
      await new NewsletterSubscriber(s).save();
    }
    console.log('✅ ' + blogSubs.length + ' abonnés newsletter migrés.');

    const postComments = await dbBlog.collection('postcomments').find({}).toArray();
    for (const c of postComments) {
      await new PostComment(c).save();
    }
    console.log('✅ ' + postComments.length + ' commentaires d\'articles migrés.');

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR FATALE PENDANT LA MIGRATION :', error);
    process.exit(1);
  }
};

runMigration();

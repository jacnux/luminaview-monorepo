import mongoose from 'mongoose';

// Import de nos nouveaux modèles
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
    console.log(`🔌 Connexion à la nouvelle base (Cible)...`);
    await mongoose.connect(MIGRATION_CONFIG.NEW_CORE);
    console.log('✅ Connecté à luminaview_core');

    // Optionnel : Vider la base cible (ATTENTION !)
    console.log('🧹 Nettoyage de la base cible...');
    const collections = Object.values(mongoose.connection.collections);
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log('✅ Base cible vidée.');

    // 2. Connexion aux ANCIENNES bases (Sources)
    console.log(`🔌 Connexion aux anciennes bases...`);
    const dbLumina = mongoose.createConnection(MIGRATION_CONFIG.OLD_LUMINAVIEW);
    const dbBlog = mongoose.createConnection(MIGRATION_CONFIG.OLD_BLOG);
    const dbChambre = mongoose.createConnection(MIGRATION_CONFIG.OLD_CHAMBRENOIRE);

    // Attendre que les connexions soient établies
    await Promise.all([
      new Promise(r => dbLumina.once('open', r)),
      new Promise(r => dbBlog.once('open', r)),
      new Promise(r => dbChambre.once('open', r))
    ]);
    console.log('✅ Connecté aux anciennes bases.');

    // --- A. MIGRATION UTILISATEURS (Depuis LuminaView) ---
    console.log('\n--- 📂 Migration des Utilisateurs ---');
    const oldUsers = await dbLumina.db.collection('users').find({}).toArray();
    for (const u of oldUsers) {
      await new User(u).save();
    }
    console.log(`✅ ${oldUsers.length} utilisateurs migrés.`);

    const oldPages = await dbLumina.db.collection('userpages').find({}).toArray();
    for (const p of oldPages) {
      await new UserPage(p).save();
    }
    console.log(`✅ ${oldPages.length} pages utilisateur migrées.`);

    // --- B. MIGRATION LUMINAVIEW (Albums, Photos, Commentaires) ---
    console.log('\n--- 📂 Migration LuminaView (Albums, Photos) ---');
    const luminaAlbums = await dbLumina.db.collection('albums').find({}).toArray();
    for (const a of luminaAlbums) {
      a.appContext = 'LUMINAVIEW';
      await new Album(a).save();
    }
    console.log(`✅ ${luminaAlbums.length} albums LuminaView migrés.`);

    const luminaPhotos = await dbLumina.db.collection('photos').find({}).toArray();
    for (const p of luminaPhotos) {
      p.appContext = 'LUMINAVIEW';
      await new Photo(p).save();
    }
    console.log(`✅ ${luminaPhotos.length} photos LuminaView migrées.`);

    const luminaComments = await dbLumina.db.collection('comments').find({}).toArray();
    for (const c of luminaComments) {
      await new Comment(c).save();
    }
    console.log(`✅ ${luminaComments.length} commentaires de photos migrés.`);

    // --- C. MIGRATION CHAMBRE NOIRE ---
    console.log('\n--- 📂 Migration Chambre Noire ---');
    const chAlbums = await dbChambre.db.collection('albums').find({}).toArray();
    for (const a of chAlbums) {
      a.appContext = 'CHAMBRE_NOIRE';
      try {
        await new Album(a).save();
      } catch (err: any) {
        if (err.code === 11000) {
          await Album.findByIdAndUpdate(a._id, { appContext: 'BOTH' });
        } else throw err;
      }
    }
    console.log(`✅ ${chAlbums.length} albums Chambre Noire migrés (ou fusionnés).`);

    const chPhotos = await dbChambre.db.collection('photos').find({}).toArray();
    for (const p of chPhotos) {
      p.appContext = 'CHAMBRE_NOIRE';
      try {
        await new Photo(p).save();
      } catch (err: any) {
        if (err.code === 11000) {
          await Photo.findByIdAndUpdate(p._id, { appContext: 'BOTH' });
        } else throw err;
      }
    }
    console.log(`✅ ${chPhotos.length} photos Chambre Noire migrées (ou fusionnées).`);

    const films = await dbChambre.db.collection('films').find({}).toArray();
    for (const f of films) await new Film(f).save();
    console.log(`✅ ${films.length} films migrés.`);

    const gears = await dbChambre.db.collection('gears').find({}).toArray();
    for (const g of gears) await new Gear(g).save();
    console.log(`✅ ${gears.length} équipements migrés.`);

    const projects = await dbChambre.db.collection('projects').find({}).toArray();
    for (const p of projects) await new Project(p).save();
    console.log(`✅ ${projects.length} projets migrés.`);

    // --- D. MIGRATION BLOG ---
    console.log('\n--- 📂 Migration du Blog ---');
    
    // Récupérer tous les utilisateurs de la nouvelle base pour faire le lien avec blogSlug
    const allNewUsers = await User.find({});
    const userMapBySlug: Record<string, mongoose.Types.ObjectId> = {};
    for (const u of allNewUsers) {
      userMapBySlug[u.name.toLowerCase()] = u._id;
    }

    const posts = await dbBlog.db.collection('posts').find({}).toArray();
    let postCount = 0;
    for (const p of posts) {
      const slug = p.blogSlug ? p.blogSlug.toLowerCase() : '';
      const userId = userMapBySlug[slug];
      
      if (userId) {
        p.userId = userId;
        delete p.blogSlug; // On supprime l'ancien champ
        await new Post(p).save();
        postCount++;
      } else {
        console.warn(`⚠️ Article ignoré : Utilisateur ${slug} introuvable pour l'article ${p.title}`);
      }
    }
    console.log(`✅ ${postCount} articles migrés.`);

    const subscribers = await dbBlog.db.collection('newslettersubscribers').find({}).toArray();
    let subCount = 0;
    for (const s of subscribers) {
      const slug = s.blogSlug ? s.blogSlug.toLowerCase() : '';
      const userId = userMapBySlug[slug];
      
      if (userId) {
        s.userId = userId;
        delete s.blogSlug;
        
        // Anti-doublons manuel (car unique index)
        const exists = await NewsletterSubscriber.findOne({ email: s.email, userId: userId });
        if (!exists) {
          await new NewsletterSubscriber(s).save();
          subCount++;
        }
      }
    }
    console.log(`✅ ${subCount} abonnés newsletter migrés.`);

    const postComments = await dbBlog.db.collection('comments').find({}).toArray();
    for (const c of postComments) {
      // Les IDs de posts n'ont pas changé car on garde les mêmes _id Mongo
      await new PostComment(c).save();
    }
    console.log(`✅ ${postComments.length} commentaires d'articles migrés.`);


    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR FATALE PENDANT LA MIGRATION :', error);
    process.exit(1);
  }
};

runMigration();

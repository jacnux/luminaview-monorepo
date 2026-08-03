import mongoose from 'mongoose';r 
import User from '../models/User';
import Project from '../models/Project';
import Post from '../models/Post';
import UserPage from '../models/UserPage';

const SYSTEM_PREFIXES = ['hero', 'monfond', 'avatar', 'banner', 'luminaview', 'menu', 'favicon', 'logo', 'brand', 'presentation'];

function extractFilename(val: string | null | undefined): string | null {
  if (!val) return null;
  // Extraire le nom de fichier si c'est un chemin /uploads/nom.jpg ou URL
  const match = val.match(/([^\/\?#]+\.(?:jpg|jpeg|png|webp|svg|gif))/i);
  return match ? match[1] : val;
}

function getBaseName(filename: string): string {
  let name = filename.replace(/^thumb-/, '');
  const parsed = path.parse(name);
  return parsed.name;
}

async function findOrphanPhotos() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/luminaview';
  console.log(`🔌 Connexion à MongoDB (${mongoUri})...`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    const referencedFiles = new Set<string>();

    // 1. Récupérer les photos
    const photos = await Photo.find({}).select('filename').lean();
    photos.forEach(p => {
      if (p.filename) referencedFiles.add(getBaseName(p.filename));
    });
    console.log(`📸 Photos référencées dans la base: ${photos.length}`);

    // 2. Couvertures d'albums
    const albums = await Album.find({}).select('coverImage').lean();
    albums.forEach(a => {
      const fn = extractFilename(a.coverImage);
      if (fn) referencedFiles.add(getBaseName(fn));
    });

    // 3. Avatars, Bannières, Hero d'utilisateurs
    const users = await User.find({}).select('avatar bannerImage heroImage').lean();
    users.forEach(u => {
      [u.avatar, u.bannerImage, (u as any).heroImage].forEach(img => {
        const fn = extractFilename(img);
        if (fn) referencedFiles.add(getBaseName(fn));
      });
    });

    // 4. Projets & MakingOf
    const projects = await Project.find({}).select('coverImage makingOf').lean();
    projects.forEach(pr => {
      const fn = extractFilename(pr.coverImage);
      if (fn) referencedFiles.add(getBaseName(fn));
      if (pr.makingOf) {
        const matches = pr.makingOf.match(/([^\/\?#"'()\s]+\.(?:jpg|jpeg|png|webp))/gi) || [];
        matches.forEach(m => referencedFiles.add(getBaseName(m)));
      }
    });

    // 5. Articles du Blog & Contenu Markdown
    const posts = await Post.find({}).select('coverImage content').lean();
    posts.forEach(po => {
      const fn = extractFilename(po.coverImage);
      if (fn) referencedFiles.add(getBaseName(fn));
      if (po.content) {
        const matches = po.content.match(/([^\/\?#"'()\s]+\.(?:jpg|jpeg|png|webp))/gi) || [];
        matches.forEach(m => referencedFiles.add(getBaseName(m)));
      }
    });

    // 6. Pages utilisateurs
    const userPages = await UserPage.find({}).lean();
    userPages.forEach(up => {
      const str = JSON.stringify(up);
      const matches = str.match(/([^\/\?#"'()\s]+\.(?:jpg|jpeg|png|webp))/gi) || [];
      matches.forEach(m => referencedFiles.add(getBaseName(m)));
    });

    console.log(`🔍 Total des noms de fichiers uniques référencés: ${referencedFiles.size}`);

    // Scan du dossier uploads
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.error(`❌ Le répertoire ${uploadsDir} n'existe pas.`);
      process.exit(1);
    }

    const allFiles = fs.readdirSync(uploadsDir);
    console.log(`📁 Fichiers dans le dossier uploads (${uploadsDir}): ${allFiles.length}`);

    const orphanFiles: { filename: string; size: number }[] = [];

    for (const file of allFiles) {
      if (fs.statSync(path.join(uploadsDir, file)).isDirectory()) continue;

      const lowerFile = file.toLowerCase();
      const base = getBaseName(file);
      const baseLower = base.toLowerCase();
      
      // Exclure les fichiers système explicites (hero*, monfond*, avatar*, banner*, etc.)
      const isSystem = SYSTEM_PREFIXES.some(prefix => lowerFile.startsWith(prefix) || baseLower.startsWith(prefix));
      if (isSystem) continue;

      // Si le nom de base n'est pas dans la liste des fichiers référencés => ORPHELIN
      if (!referencedFiles.has(base)) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        orphanFiles.push({ filename: file, size: stats.size });
      }
    }

    console.log(`\n⚠️ Fichiers orphelins trouvés : ${orphanFiles.length}`);
    let totalSize = 0;
    orphanFiles.forEach(o => {
      totalSize += o.size;
      console.log(`  - ${o.filename} (${(o.size / 1024).toFixed(1)} KiB)`);
    });
    console.log(`💾 Espace total pouvant être libéré : ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

    // Génération du script d'exécution cleanup_orphans.sh
    const scriptPath = path.join(__dirname, '../../cleanup_orphans.sh');
    const scriptLines = [
      '#!/bin/sh',
      '# Script de nettoyage des photos orphelines (généré automatiquement)',
      'echo "🧹 Nettoyage des photos orphelines dans les uploads..."',
      ...orphanFiles.map(o => `rm -f uploads/${o.filename}`),
      'echo "✅ Nettoyage terminé !"',
      ''
    ];

    fs.writeFileSync(scriptPath, scriptLines.join('\n'), { mode: 0o755 });
    console.log(`\n📄 Script exécutable créé avec succès : ${scriptPath}`);

  } catch (err) {
    console.error('❌ Erreur lors de l\'analyse des orphelins:', err);
  } finally {
    await mongoose.disconnect();
  }
}

findOrphanPhotos();

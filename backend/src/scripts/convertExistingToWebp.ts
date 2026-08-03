import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function convertExistingImages() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Répertoire uploads introuvable:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`🔍 Analyse de ${files.length} fichiers dans ${uploadsDir}...`);

  let convertedCount = 0;
  let thumbCount = 0;

  for (const file of files) {
    if (file.startsWith('thumb-')) continue;
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const baseName = path.parse(file).name;
    const inputPath = path.join(uploadsDir, file);
    const webpPath = path.join(uploadsDir, `${baseName}.webp`);
    const thumbPath = path.join(uploadsDir, `thumb-${baseName}.webp`);

    // 1. Conversion WebP principal si inexistant
    if (!fs.existsSync(webpPath)) {
      try {
        await sharp(inputPath)
          .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(webpPath);
        convertedCount++;
        console.log(`✅ Converti en WebP: ${file} -> ${baseName}.webp`);
      } catch (err) {
        console.error(`❌ Erreur conversion WebP pour ${file}:`, err);
      }
    }

    // 2. Génération miniature WebP 800px si inexistante
    if (!fs.existsSync(thumbPath)) {
      try {
        const sourceForThumb = fs.existsSync(webpPath) ? webpPath : inputPath;
        await sharp(sourceForThumb)
          .resize(800, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(thumbPath);
        thumbCount++;
        console.log(`🖼️ Miniature créée: thumb-${baseName}.webp`);
      } catch (err) {
        console.error(`❌ Erreur création miniature pour ${file}:`, err);
      }
    }
  }

  console.log(`\n🎉 Bilan de la migration :`);
  console.log(`  - Images converties en WebP : ${convertedCount}`);
  console.log(`  - Miniatures WebP créées : ${thumbCount}`);
}

convertExistingImages();

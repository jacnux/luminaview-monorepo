import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function convertExistingImages() {
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Répertoire uploads introuvable:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`🔍 Analyse de ${files.length} fichiers dans ${uploadsDir}...`);

  let convertedCount = 0;
  let thumbCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const baseName = path.parse(file).name;
    const inputPath = path.join(uploadsDir, file);

    // Cas 0 : Fichier déjà en .webp mais sans miniature thumb-*
    if (ext === '.webp') {
      if (!file.startsWith('thumb-')) {
        const thumbPath = path.join(uploadsDir, `thumb-${file}`);
        if (!fs.existsSync(thumbPath)) {
          try {
            await sharp(inputPath)
              .resize(800, null, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 78, effort: 4 })
              .toFile(thumbPath);
            thumbCount++;
            console.log(`🖼️ Miniature WebP créée pour WebP existant: thumb-${file}`);
          } catch (err) {
            console.error(`❌ Erreur création miniature pour ${file}:`, err);
          }
        }
      }
      continue;
    }

    // Cas 1 : Vignettes existantes thumb-*.jpg / thumb-*.png
    if (file.startsWith('thumb-')) {
      const thumbWebpPath = path.join(uploadsDir, `${baseName}.webp`);
      if (!fs.existsSync(thumbWebpPath)) {
        try {
          await sharp(inputPath)
            .resize(800, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 78, effort: 4 })
            .toFile(thumbWebpPath);
          thumbCount++;
          console.log(`🖼️ Miniature WebP optimisée: ${file} -> ${baseName}.webp`);
        } catch (err) {
          console.error(`❌ Erreur miniature WebP pour ${file}:`, err);
        }
      }
      continue;
    }

    // Cas 2 : Bannières banner-*.png / banner-*.jpg
    if (file.startsWith('banner-')) {
      const bannerWebpPath = path.join(uploadsDir, `${baseName}.webp`);
      if (!fs.existsSync(bannerWebpPath)) {
        try {
          await sharp(inputPath)
            .resize(1600, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toFile(bannerWebpPath);
          convertedCount++;
          console.log(`🎨 Bannière WebP optimisée: ${file} -> ${baseName}.webp`);
        } catch (err) {
          console.error(`❌ Erreur conversion bannière pour ${file}:`, err);
        }
      }
      continue;
    }

    // Cas 3 : Photos normales
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
          .webp({ quality: 78, effort: 4 })
          .toFile(thumbPath);
        thumbCount++;
        console.log(`🖼️ Miniature créée: thumb-${baseName}.webp`);
      } catch (err) {
        console.error(`❌ Erreur création miniature pour ${file}:`, err);
      }
    }
  }

  console.log(`\n🎉 Bilan de la migration WebP :`);
  console.log(`  - Images/bannières converties en WebP : ${convertedCount}`);
  console.log(`  - Miniatures WebP générées : ${thumbCount}`);
}

convertExistingImages();

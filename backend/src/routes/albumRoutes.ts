// ======================================================
//  albumRoutes.ts
//   v2.4.0   blocage suppression galerie si page existante
//
// ====================================================

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Album from '../models/Album';
import Photo from '../models/Photo';
import User from '../models/User';
import UserPage from '../models/UserPage';
import { authenticateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, isPublic, virtualFilter } = req.body;
    const isVirtual = req.body.isVirtual === true;
    let { filterValue } = req.body;

    if (filterValue && typeof filterValue === 'string') {
      filterValue = filterValue
        .split(',')
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 0)
        .join(',');
    } else {
      filterValue = null;
    }

    const newAlbum = new Album({
      userId: req.user.userId,
      title,
      description,
      isPublic,
      isVirtual,
      virtualFilter: isVirtual ? (virtualFilter || 'tag') : null,
      filterValue: isVirtual ? filterValue : null
    });

    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur création album' });
  }
});

router.get('/my/albums', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { appContext } = req.query;
    const query: any = { userId: req.user.userId };
    if (appContext === 'CHAMBRE_NOIRE') {
      query.appContext = { $in: ['CHAMBRE_NOIRE', 'BOTH'] };
    } else if (appContext === 'LUMINAVIEW') {
      query.appContext = { $in: ['LUMINAVIEW', 'BOTH'] };
    }
    
    let albums = await Album.find(query).sort({ createdAt: -1 }).lean();

    const updatedAlbums = await Promise.all(albums.map(async (album) => {
      if ((album.isVirtual || album.filterValue) && !album.coverImage && album.virtualFilter === 'tag' && album.filterValue) {
        const rawTags = album.filterValue.split(',').map(t => t.trim()).filter(t => t);
        const positiveTags = rawTags.filter(t => !t.startsWith('-'));
        const negativeTags = rawTags.filter(t => t.startsWith('-')).map(t => t.substring(1));

        if (positiveTags.length > 0) {
          const query: any = { tags: { $all: positiveTags } };
          query.userId = req.user.userId;
          if (negativeTags.length > 0) query.tags.$nin = negativeTags;

          const photo = await Photo.findOne(query).sort({ createdAt: -1 }).select('filename');
          if (photo) {
            album.coverImage = photo.filename;
            await Album.updateOne({ _id: album._id }, { coverImage: photo.filename });
          }
        }
      }
      return album;
    }));

    res.json(updatedAlbums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération albums' });
  }
});

router.get('/photos/:id', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    if (!album.isPublic) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Accès non autorisé (token requis)' });
      try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as any;
        const isAdmin = decoded.isAdmin === true;
        const isOwner = decoded.userId === album.userId.toString();
        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Accès interdit' });
      } catch (err) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
      }
    }

    let photos;

    if (album.virtualFilter === 'tag' && album.filterValue) {
      const rawTags = album.filterValue.split(',').map(t => t.trim()).filter(t => t);
      const positiveTags = rawTags.filter(t => !t.startsWith('-'));
      const negativeTags = rawTags.filter(t => t.startsWith('-')).map(t => t.substring(1));

      const query: any = { userId: album.userId };
      const tagsCondition: any = {};

      if (positiveTags.length > 0) tagsCondition.$all = positiveTags;
      if (negativeTags.length > 0) tagsCondition.$nin = negativeTags;
      if (Object.keys(tagsCondition).length > 0) query.tags = tagsCondition;

      const validAlbums = await Album.find({ userId: album.userId }).select('_id').lean();
      query.albumId = { $in: validAlbums.map(a => a._id) };

      photos = await Photo.find(query).sort({ createdAt: -1 });
    } else {
      photos = await Photo.find({ albumId: req.params.id }).sort({ createdAt: -1 });
    }

    res.json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération photos' });
  }
});

router.get('/portfolio/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${req.params.username}$`, 'i') }
    }).select('name email avatar bio bannerImage portfolioIntro servicesDescription tagline blogTheme hasBlog hasCarnet chambreNoireUrl carnetIntro');

    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const referer = req.headers.referer || '';
    const isGrimoireReq =
      req.query.theme === 'grimoire' ||
      req.query.app === 'grimoire' ||
      referer.includes('grimoire') ||
      referer.includes(':7091');

    const filterQuery: any = {
      userId: user._id,
      isPublic: true,
      isVirtual: true
    };

    if (isGrimoireReq) {
      filterQuery.isGrimoire = true;
    } else {
      filterQuery.isFeatured = true;
    }

    const albums = await Album.find(filterQuery).sort({ createdAt: -1 });

    res.json({ user, albums });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id/share', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album || !album.isPublic) {
      return res.status(404).send('Album non trouvé ou privé');
    }

    const forwardedHost = req.headers['x-forwarded-host'] as string;
    const rawHost = forwardedHost || req.headers.host || req.hostname;
    const cleanHost = rawHost.split(',')[0].trim().replace(/:[0-9]+$/, '');
    const host = (cleanHost.includes('localhost') || cleanHost.includes('backend')) ? 'luminaview.fr' : cleanHost;

    const forwardedProto = req.headers['x-forwarded-proto'] as string;
    const protocol = (forwardedProto || (req.secure ? 'https' : 'https')).split(',')[0].trim();
    const baseUrl = `${protocol}://${host}`;

    let coverUrl = '';
    if (album.coverImage) {
      const webpCover = album.coverImage.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      coverUrl = `${baseUrl}/uploads/${webpCover}`;
    }

    const viewerUrl = `${baseUrl}/album/${album._id}?mode=viewer`;
    const title = album.title || 'Album photo LuminaView';
    const description = album.description || 'Découvrez cet album photo sur LuminaView';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${coverUrl ? `<meta property="og:image" content="${coverUrl}">
  <meta property="og:image:secure_url" content="${coverUrl}">
  <meta property="og:image:type" content="image/webp">
  <meta name="twitter:image" content="${coverUrl}">` : ''}
  <meta property="og:url" content="${viewerUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta http-equiv="refresh" content="0;url=${viewerUrl}">
</head>
<body>
  <p>Redirection vers <a href="${viewerUrl}">${title}</a>...</p>
  <script>window.location.href = "${viewerUrl}";</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).send('Erreur lors de la génération du lien de partage');
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    if (!album.isPublic) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Accès non autorisé' });
      try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as any;
        const isAdmin = decoded.isAdmin === true;
        const isOwner = decoded.userId === album.userId.toString();
        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Accès interdit' });
      } catch (err) {
        return res.status(403).json({ error: 'Token invalide' });
      }
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, isPublic, coverImage, virtualFilter, filterValue, isVirtual } = req.body;
    const updateData: any = { title, description, isPublic, coverImage, isVirtual };

    if (virtualFilter !== undefined) updateData.virtualFilter = virtualFilter;
    if (filterValue !== undefined) updateData.filterValue = filterValue;

    const updated = await Album.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Album non trouvé ou non autorisé' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

router.patch('/:id/toggle-visibility', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    album.isPublic = !album.isPublic;
    await album.save();
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur changement visibilité' });
  }
});

router.patch('/:id/toggle-featured', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    album.isFeatured = !album.isFeatured;
    await album.save();
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

router.patch('/:id/toggle-grimoire', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    album.isGrimoire = !album.isGrimoire;
    await album.save();
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour Grimoire' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    // ── Blocage si l'album est utilisé dans une ou plusieurs pages ──
    const usedInPages = await UserPage.find({
      'sections.albumIds': album._id
    }).select('title').lean();

    if (usedInPages.length > 0) {
      const titles = usedInPages.map(p => `"${p.title}"`).join(', ');
      return res.status(409).json({
        error: `Impossible de supprimer : cet album est utilisé dans ${usedInPages.length > 1 ? 'les pages' : 'la page'} ${titles}. Retirez-le de ${usedInPages.length > 1 ? 'ces pages' : 'cette page'} avant de le supprimer.`
      });
    }
    // ────────────────────────────────────────────────────────────────

    const photos = await Photo.find({ albumId: album._id, userId: req.user.userId });
    let totalFreed = 0;

    for (const photo of photos) {
      const baseName = path.parse(photo.filename).name;
      const extensions = ['.webp', '.jpg', '.jpeg', '.png'];
      let fileSize = photo.size || 0;

      for (const ext of extensions) {
        const p = path.join(__dirname, '../../uploads', baseName + ext);
        const thumbP = path.join(__dirname, '../../uploads', `thumb-${baseName}${ext}`);
        if (!fileSize && fs.existsSync(p)) {
          fileSize = fs.statSync(p).size;
        }
        try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
        try { if (fs.existsSync(thumbP)) fs.unlinkSync(thumbP); } catch {}
      }

      totalFreed += fileSize;
    }

    await Photo.deleteMany({ albumId: album._id, userId: req.user.userId });
    await album.deleteOne();

    if (totalFreed > 0) {
      await User.findByIdAndUpdate(req.user.userId, { $inc: { quotaUsed: -totalFreed } });
    }

    res.json({
      message: 'Album supprimé',
      deletedPhotos: photos.length,
      freedBytes: totalFreed
    });
  } catch (error) {
    console.error('Erreur suppression album :', error);
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;

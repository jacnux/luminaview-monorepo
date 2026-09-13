import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Film from '../models/Film';
import Photo from '../models/Photo';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 1. GET ALL FILMS FOR USER (with photo count and archive status)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const films = await Film.find({ userId })
      .populate('gearCameraId')
      .populate('gearLensId')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate photo counts by filmId for this user
    const photoCounts = await Photo.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          filmId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$filmId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = new Map<string, number>();
    photoCounts.forEach((pc: { _id: any; count: number }) => {
      if (pc._id) {
        countMap.set(pc._id.toString(), pc.count);
      }
    });

    const enrichedFilms = films.map(f => {
      const count = countMap.get(f._id.toString()) || 0;
      return {
        ...f,
        photosCount: count,
        isUsed: count > 0,
        isArchived: f.isArchived !== undefined ? f.isArchived : count > 0
      };
    });

    res.json(enrichedFilms);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des pellicules' });
  }
});

// 2. CREATE NEW FILM ROLL
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, brand, filmType, iso, isoUsed, format, maxViews, type, gearCameraId, gearLensId, defaultExposureSettings, developmentSettings, notes, isArchived } = req.body;
    if (!name || !brand || !filmType || !iso || !format || !type) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const film = new Film({
      userId: req.user.userId,
      name,
      brand,
      filmType,
      iso: Number(iso),
      isoUsed: isoUsed !== undefined && isoUsed !== null && isoUsed !== '' ? Number(isoUsed) : null,
      format,
      maxViews: Number(maxViews || 36),
      type,
      gearCameraId: gearCameraId || null,
      gearLensId: gearLensId || null,
      defaultExposureSettings: defaultExposureSettings || {},
      developmentSettings: developmentSettings || {},
      notes: notes || '',
      isArchived: Boolean(isArchived || false)
    });

    await film.save();
    res.status(201).json(film);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Une pellicule avec ce nom existe déjà dans votre inventaire.' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de la pellicule' });
  }
});

// 3. UPDATE FILM ROLL
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Pellicule introuvable' });
    if (film.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const { name, brand, filmType, iso, isoUsed, format, maxViews, type, gearCameraId, gearLensId, defaultExposureSettings, developmentSettings, notes, isArchived } = req.body;

    film.name = name ?? film.name;
    film.brand = brand ?? film.brand;
    film.filmType = filmType ?? film.filmType;
    film.iso = iso !== undefined ? Number(iso) : film.iso;
    film.isoUsed = isoUsed !== undefined ? (isoUsed !== null && isoUsed !== '' ? Number(isoUsed) : undefined) : film.isoUsed;
    film.format = format ?? film.format;
    film.maxViews = maxViews !== undefined ? Number(maxViews) : film.maxViews;
    film.type = type ?? film.type;
    film.gearCameraId = gearCameraId !== undefined ? (gearCameraId || null) : film.gearCameraId;
    film.gearLensId = gearLensId !== undefined ? (gearLensId || null) : film.gearLensId;
    film.defaultExposureSettings = defaultExposureSettings ?? film.defaultExposureSettings;
    film.developmentSettings = developmentSettings ?? film.developmentSettings;
    film.notes = notes !== undefined ? notes : film.notes;
    if (isArchived !== undefined) {
      film.isArchived = Boolean(isArchived);
    }

    await film.save();
    res.json(film);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Une pellicule avec ce nom existe déjà dans votre inventaire.' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la pellicule' });
  }
});

// 4. TOGGLE / SET ARCHIVE STATUS
router.patch('/:id/archive', authenticateToken, async (req: Request, res: Response) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Pellicule introuvable' });
    if (film.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const { isArchived } = req.body;
    film.isArchived = isArchived !== undefined ? Boolean(isArchived) : !film.isArchived;

    await film.save();
    res.json(film);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'archivage de la pellicule' });
  }
});

// 5. DELETE FILM ROLL
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Pellicule introuvable' });
    if (film.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    await Film.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pellicule supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la pellicule' });
  }
});

export default router;

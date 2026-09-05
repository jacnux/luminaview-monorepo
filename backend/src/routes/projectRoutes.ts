import express, { Request, Response } from 'express';
import Project from '../models/Project';
import Photo from '../models/Photo';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper to generate a slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)/g, '');        // trim leading/trailing hyphens
};

// --- Routes publiques (sans authentification) ---

// Lister tous les projets publics
router.get('/public/all', async (req: Request, res: Response) => {
  try {
    const userParam = req.query.user as string;
    const statusParam = req.query.status as string;
    const mediumParam = req.query.medium as string;

    let query: any = { isPublished: true };

    if (statusParam) {
      query.status = statusParam;
    } else {
      // Par défaut pour la chambre noire / public, afficher les projets actifs ou terminés
      query.status = { $in: ['IN_PROGRESS', 'COMPLETED'] };
    }

    if (mediumParam && mediumParam !== 'ALL') {
      query.medium = mediumParam;
    }

    if (userParam) {
      const user = await User.findOne({ name: new RegExp('^' + userParam.trim() + '$', 'i') });
      if (!user) {
        return res.json([]);
      }
      query.userId = user._id;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des projets publics' });
  }
});

// Détail d'un projet public avec ses photos (jointures matériels/pellicules)
router.get('/public/project/:slug', async (req: Request, res: Response) => {
  try {
    const userParam = req.query.user as string;
    let query: any = { slug: req.params.slug, isPublished: true };
    if (userParam) {
      const user = await User.findOne({ name: new RegExp('^' + userParam.trim() + '$', 'i') });
      if (user) {
        query.userId = user._id;
      }
    }

    const project = await Project.findOne(query);
    if (!project) return res.status(404).json({ error: 'Projet introuvable ou privé' });

    const photos = await Photo.find({ projectId: project._id })
      .populate('gearCameraId')
      .populate('gearLensId')
      .populate('filmId')
      .sort({ index: 1, createdAt: 1 });

    res.json({ project, photos });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du détail du projet public' });
  }
});

// 1. GET ALL PROJECTS FOR USER (AVEC FILTRES STATUS, MEDIUM, TAG)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, medium, tag } = req.query;
    const query: any = { userId: req.user.userId };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (medium && medium !== 'ALL') {
      query.medium = medium;
    }
    if (tag) {
      query.tags = tag;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// 2. GET SINGLE PROJECT DETAILS (AND ITS PHOTOS)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projet introuvable' });
    if (project.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const photos = await Photo.find({ projectId: project._id })
      .populate('gearCameraId')
      .populate('gearLensId')
      .populate('filmId')
      .sort({ index: 1, createdAt: 1 });
    res.json({ project, photos });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du détail du projet' });
  }
});

// 3. CREATE NEW PROJECT / IDEA
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      status,
      medium,
      tags,
      notesMarkdown,
      targetDate,
      isPublished,
      coverImage,
      makingOf
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom du projet ou de l\'idée est obligatoire' });
    }

    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // S'assurer de l'unicité du slug pour cet utilisateur
    while (await Project.findOne({ userId: req.user.userId, slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = new Project({
      userId: req.user.userId,
      name,
      description: description || '',
      slug,
      status: status || 'IN_PROGRESS',
      medium: medium || (status === 'IDEA' ? 'UNDECIDED' : 'ANALOG'),
      tags: Array.isArray(tags) ? tags : [],
      notesMarkdown: notesMarkdown || '',
      targetDate: targetDate ? new Date(targetDate) : undefined,
      isPublished: isPublished ?? false,
      coverImage,
      makingOf: makingOf || ''
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
});

// 4. CONCRETIZE AN IDEA INTO AN ACTIVE PROJECT
router.post('/:id/concretize', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Idée introuvable' });
    if (project.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const { medium, status, targetDate } = req.body;
    if (!medium || medium === 'UNDECIDED') {
      return res.status(400).json({ error: 'Veuillez sélectionner un médium valide (Numérique, Argentique ou Hybride)' });
    }

    project.medium = medium;
    project.status = status || 'IN_PROGRESS';
    if (targetDate) project.targetDate = new Date(targetDate);

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la concrétisation du projet' });
  }
});

// 5. UPDATE PROJECT / IDEA
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projet introuvable' });
    if (project.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const {
      name,
      description,
      status,
      medium,
      tags,
      notesMarkdown,
      targetDate,
      isPublished,
      coverImage,
      makingOf
    } = req.body;

    if (name && name !== project.name) {
      const baseSlug = generateSlug(name);
      let slug = baseSlug;
      let counter = 1;

      while (await Project.findOne({ userId: req.user.userId, slug, _id: { $ne: project._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      project.name = name;
      project.slug = slug;
    }

    project.description = description ?? project.description;
    if (status !== undefined) project.status = status;
    if (medium !== undefined) project.medium = medium;
    if (tags !== undefined) project.tags = Array.isArray(tags) ? tags : [];
    if (notesMarkdown !== undefined) project.notesMarkdown = notesMarkdown;
    if (targetDate !== undefined) project.targetDate = targetDate ? new Date(targetDate) : undefined;
    project.isPublished = isPublished ?? project.isPublished;
    project.coverImage = coverImage !== undefined ? coverImage : project.coverImage;
    if (makingOf !== undefined) project.makingOf = makingOf;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
});

// 6. DELETE PROJECT / IDEA
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projet introuvable' });
    if (project.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    // Supprimer la référence de projet dans toutes les photos associées
    await Photo.updateMany({ projectId: project._id }, { $set: { projectId: null } });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
});

export default router;


import express, { Request, Response } from 'express';
import Gear from '../models/Gear';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    let gearList = await Gear.find({ userId: req.user.userId })
      .populate('compatibleCameras', 'brand model format')
      .sort({ brand: 1, model: 1 });
    
    // Auto-create Sténopé if not present
    const hasStenope = gearList.some(g => g.type === 'camera' && g.brand.toLowerCase() === 'sténopé');
    if (!hasStenope) {
      try {
        const newStenope = new Gear({
          userId: req.user.userId,
          type: 'camera',
          brand: 'Sténopé',
          model: 'Sténopé',
          format: 'Autre'
        });
        await newStenope.save();
        gearList.push(newStenope);
        gearList.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
      } catch (err) {
        console.error('Error auto-creating Stenope camera:', err);
      }
    }
    
    res.json(gearList);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du matériel' });
  }
});

// 2. CREATE NEW GEAR
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type, subType, brand, model, format, compatibleCameras, maxPowerWatts, serialNumber, notes } = req.body;
    if (!type || !brand || !model) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (type, marque, modèle)' });
    }
    if (type !== 'eclairage' && !format) {
      return res.status(400).json({ error: 'Le format est obligatoire pour les boîtiers et objectifs' });
    }
    if (type === 'eclairage' && !subType) {
      return res.status(400).json({ error: "Le type d'éclairage (Lumière continue ou Flash) est obligatoire" });
    }

    const gear = new Gear({
      userId: req.user.userId,
      type,
      subType: type === 'eclairage' ? subType : undefined,
      brand,
      model,
      format: type === 'eclairage' ? (format || 'N/A') : format,
      compatibleCameras: type === 'lens' && Array.isArray(compatibleCameras) ? compatibleCameras : [],
      maxPowerWatts: type === 'eclairage' && maxPowerWatts !== undefined && maxPowerWatts !== '' ? Number(maxPowerWatts) : undefined,
      serialNumber,
      notes
    });

    await gear.save();
    await gear.populate('compatibleCameras', 'brand model format');
    res.status(201).json(gear);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ce matériel existe déjà dans votre inventaire' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du matériel' });
  }
});

// 3. UPDATE GEAR
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const gear = await Gear.findById(req.params.id);
    if (!gear) return res.status(404).json({ error: 'Matériel introuvable' });
    if (gear.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    const { type, subType, brand, model, format, compatibleCameras, maxPowerWatts, serialNumber, notes } = req.body;
    
    gear.type = type ?? gear.type;
    gear.subType = subType !== undefined ? subType : gear.subType;
    gear.brand = brand ?? gear.brand;
    gear.model = model ?? gear.model;
    gear.format = format ?? gear.format;
    if (gear.type === 'lens') {
      gear.compatibleCameras = Array.isArray(compatibleCameras) ? compatibleCameras : [];
    } else {
      gear.compatibleCameras = [];
    }
    gear.maxPowerWatts = maxPowerWatts !== undefined ? (maxPowerWatts === '' ? undefined : Number(maxPowerWatts)) : gear.maxPowerWatts;
    gear.serialNumber = serialNumber !== undefined ? serialNumber : gear.serialNumber;
    gear.notes = notes !== undefined ? notes : gear.notes;

    await gear.save();
    await gear.populate('compatibleCameras', 'brand model format');
    res.json(gear);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du matériel :', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ce matériel (marque & modèle) existe déjà dans votre inventaire.' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour du matériel' });
  }
});

// 4. DELETE GEAR
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const gear = await Gear.findById(req.params.id);
    if (!gear) return res.status(404).json({ error: 'Matériel introuvable' });
    if (gear.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Action non autorisée' });
    }

    await Gear.findByIdAndDelete(req.params.id);
    res.json({ message: 'Matériel supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du matériel' });
  }
});

export default router;

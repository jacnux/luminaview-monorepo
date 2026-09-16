import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Cache en mémoire pour limiter les écritures en base (throttling 2 minutes par utilisateur)
const lastActivityCache = new Map<string, number>();
const ACTIVITY_THROTTLE_MS = 2 * 60 * 1000;

// Nettoyage régulier du cache pour libérer la mémoire (toutes les 30 min)
setInterval(() => {
  const now = Date.now();
  for (const [userId, lastTime] of lastActivityCache.entries()) {
    if (now - lastTime > 60 * 60 * 1000) {
      lastActivityCache.delete(userId);
    }
  }
}, 30 * 60 * 1000).unref();

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Récupérer le token (Header Authorization: Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Accès refusé. Token manquant.' });

  // 2. Vérifier le token
  // IMPORTANT : Utiliser la meme clé secrète que dans authRoutes
  const secret = process.env.JWT_SECRET || 'default_secret';

  jwt.verify(token, secret, (err, user: any) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }

    req.user = user;

    // Mise à jour de la dernière activité (lastActiveAt) avec throttling
    if (user && user.userId) {
      const now = Date.now();
      const lastUpdate = lastActivityCache.get(user.userId) || 0;
      if (now - lastUpdate > ACTIVITY_THROTTLE_MS) {
        lastActivityCache.set(user.userId, now);
        User.updateOne({ _id: user.userId }, { $set: { lastActiveAt: new Date(now) } }).catch((updateErr) => {
          console.error('Erreur mise à jour lastActiveAt:', updateErr);
        });
      }
    }

    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès admin requis.' });
  }
  next();
};

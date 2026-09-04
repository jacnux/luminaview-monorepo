// ============================================================
// LUMINAVIEW API — app.ts
// Configuration Express exportée pour le serveur et les tests
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import albumRoutes from './routes/albumRoutes';
import photoRoutes from './routes/photoRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import reportRoutes from './routes/reportRoutes';
import userPagesRoutes from './routes/userPagesRoutes';
import commentRoutes from './routes/commentRoutes';
import filmRoutes from './routes/filmRoutes';
import gearRoutes from './routes/gearRoutes';
import projectRoutes from './routes/projectRoutes';
import blogRoutes from './routes/blogRoutes';

const app = express();

app.set('trust proxy', 1);

// ============================================================
// SÉCURITÉ
// ============================================================

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: false
}));
app.use(hpp());
app.use(mongoSanitize());

// ── Rate limiter AUTH : anti brute-force login uniquement ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skip: () => process.env.NODE_ENV === 'test',
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.'
});
app.use('/api/auth/', authLimiter);

// ── Rate limiter Commentaires & Signalements : Anti-Spam ──
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Trop de commentaires envoyés depuis cette adresse IP. Veuillez réessayez dans 15 minutes.' }
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Trop de signalements envoyés depuis cette adresse IP. Veuillez réessayez dans 15 minutes.' }
});

// ── Rate limiter API général : photos, albums, pages... ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Trop de requêtes depuis cette IP, réessayez plus tard.' }
});

app.use('/api/comments',   commentLimiter);
app.use('/api/reports',    reportLimiter);
app.use('/api/albums',     apiLimiter);
app.use('/api/photos',     apiLimiter);
app.use('/api/admin',      apiLimiter);
app.use('/api/users',      apiLimiter);
app.use('/api/user-pages', apiLimiter);

// ============================================================
// MIDDLEWARE GÉNÉRAL
// ============================================================

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const uploadsDir = path.resolve(__dirname, '../uploads');

app.use('/uploads', (req, res, next) => {
  // 1. Fallback transparent si une miniature thumb-* n'existe pas -> renvoyer l'original
  if (req.path.startsWith('/thumb-')) {
    const thumbPath = path.join(uploadsDir, req.path);
    if (!fs.existsSync(thumbPath)) {
      const origWebpPath = path.join(uploadsDir, req.path.replace(/^\/thumb-/, '/'));
      if (fs.existsSync(origWebpPath)) {
        return res.sendFile(origWebpPath, { maxAge: '7d' });
      }
      const origJpgPath = origWebpPath.replace(/\.webp$/i, '.jpg');
      if (fs.existsSync(origJpgPath)) {
        return res.sendFile(origJpgPath, { maxAge: '7d' });
      }
    }
  }

  // 2. Si requête pour .jpg/.png, servir la version .webp si disponible
  if (/\.(jpg|jpeg|png)$/i.test(req.path)) {
    const webpPath = path.join(uploadsDir, req.path.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    if (fs.existsSync(webpPath)) {
      return res.sendFile(webpPath, { maxAge: '7d' });
    }
  }
  next();
});

app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth',       authRoutes);
app.use('/api/albums',     albumRoutes);
app.use('/api/photos',     photoRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/user-pages', userPagesRoutes);
app.use('/api/comments',   commentRoutes);
app.use('/api/films',      filmRoutes);
app.use('/api/gears',      gearRoutes);
app.use('/api/projects',   projectRoutes);
app.use('/api/blog',       blogRoutes);

export default app;

// ============================================================
// LUMINAVIEW API — server.ts
// v4.2 — Mai 2026
// ============================================================

import express    from 'express';
import mongoose   from 'mongoose';
import cors       from 'cors';
import helmet     from 'helmet';
import rateLimit  from 'express-rate-limit';
import hpp        from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes      from './routes/authRoutes';
import albumRoutes     from './routes/albumRoutes';
import photoRoutes     from './routes/photoRoutes';
import adminRoutes     from './routes/adminRoutes';
import userRoutes      from './routes/userRoutes';
import reportRoutes    from './routes/reportRoutes';
import userPagesRoutes from './routes/userPagesRoutes';
import commentRoutes from './routes/commentRoutes';
import filmRoutes from './routes/filmRoutes';
import gearRoutes from './routes/gearRoutes';
import projectRoutes from './routes/projectRoutes';
import blogRoutes from './routes/blogRoutes';



// ============================================================
// INITIALISATION
// ============================================================

const app  = express();
const PORT = process.env.PORT || 3000;

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
// 20 tentatives max par 15 minutes, indépendant du reste
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.'
});
app.use('/api/auth/', authLimiter);

// ── Rate limiter Commentaires & Signalements : Anti-Spam ──
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Trop de commentaires envoyés depuis cette adresse IP. Veuillez réessayez dans 15 minutes.' }
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de signalements envoyés depuis cette adresse IP. Veuillez réessayez dans 15 minutes.' }
});

// ── Rate limiter API général : photos, albums, pages... ──
// 200 req/15min — suffisant pour les opérations en masse (déplacements)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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

import path from 'path';
import fs from 'fs';

app.use('/uploads', (req, res, next) => {
  // 1. Fallback transparent si une miniature thumb-* n'existe pas (anciens uploads) -> renvoyer l'original
  if (req.path.startsWith('/thumb-')) {
    const thumbPath = path.join('/app/uploads', req.path);
    if (!fs.existsSync(thumbPath)) {
      const origWebpPath = path.join('/app/uploads', req.path.replace(/^\/thumb-/, '/'));
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
    const webpPath = path.join('/app/uploads', req.path.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    if (fs.existsSync(webpPath)) {
      return res.sendFile(webpPath, { maxAge: '7d' });
    }
  }
  next();
});

app.use('/uploads', express.static('/app/uploads', {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));


// ============================================================
// BASE DE DONNÉES
// ============================================================

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://mongo:27017/luminaview')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ MongoDB erreur:', err);
    process.exit(1); // Force le redémarrage du conteneur via Docker restart: always
  });


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
app.use('/api/comments', commentRoutes);

// Nouvelles routes Chambre Noire mutualisées
app.use('/api/films',      filmRoutes);
app.use('/api/gears',      gearRoutes);
app.use('/api/projects',   projectRoutes);
app.use('/api/blog',       blogRoutes);


// ============================================================
// DÉMARRAGE
// ============================================================

app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 LuminaView API running on port ${PORT}`)
);

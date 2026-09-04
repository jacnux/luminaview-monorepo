// ============================================================
// LUMINAVIEW API — server.ts
// v4.2 — Démarrage du serveur et connexion MongoDB
// ============================================================

import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 3000;

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
// DÉMARRAGE
// ============================================================

app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 LuminaView API running on port ${PORT}`)
);

// ============================================================
// migrate-mongo-config.js
// Configuration pour les migrations de base de données MongoDB
// ============================================================

const config = {
  mongodb: {
    url: process.env.MONGO_URI || "mongodb://localhost:27017/luminaview",
    databaseName: process.env.MONGO_DB_NAME || "luminaview",
    options: {}
  },
  migrationsDir: "src/migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;

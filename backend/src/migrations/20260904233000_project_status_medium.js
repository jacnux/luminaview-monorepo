module.exports = {
  async up(db) {
    // 1. Mise à jour rétrocompatible des projets existants n'ayant pas de status ou medium
    await db.collection('projects').updateMany(
      { status: { $exists: false } },
      {
        $set: {
          status: 'IN_PROGRESS',
          medium: 'ANALOG',
          tags: [],
          notesMarkdown: ''
        }
      }
    );

    await db.collection('projects').updateMany(
      { medium: { $exists: false } },
      {
        $set: {
          medium: 'ANALOG'
        }
      }
    );

    // 2. Création des index pour accélérer les requêtes filtrées
    await db.collection('projects').createIndex({ userId: 1, status: 1 });
    await db.collection('projects').createIndex({ userId: 1, medium: 1 });
  },

  async down(db) {
    await db.collection('projects').dropIndex({ userId: 1, medium: 1 });
    await db.collection('projects').dropIndex({ userId: 1, status: 1 });
  }
};

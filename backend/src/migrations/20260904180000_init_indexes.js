module.exports = {
  async up(db) {
    // Indexation des utilisateurs
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Indexation des albums
    await db.collection('albums').createIndex({ userId: 1 });
    await db.collection('albums').createIndex({ isPublic: 1 });

    // Indexation des photos
    await db.collection('photos').createIndex({ albumId: 1 });
    await db.collection('photos').createIndex({ userId: 1 });
    await db.collection('photos').createIndex({ isAnalog: 1 });
    await db.collection('photos').createIndex({ filmId: 1 });
    await db.collection('photos').createIndex({ showOnBlog: 1 });
  },

  async down(db) {
    await db.collection('photos').dropIndex({ showOnBlog: 1 });
    await db.collection('photos').dropIndex({ filmId: 1 });
    await db.collection('photos').dropIndex({ isAnalog: 1 });
    await db.collection('photos').dropIndex({ userId: 1 });
    await db.collection('photos').dropIndex({ albumId: 1 });
    await db.collection('albums').dropIndex({ isPublic: 1 });
    await db.collection('albums').dropIndex({ userId: 1 });
    await db.collection('users').dropIndex({ email: 1 });
  }
};

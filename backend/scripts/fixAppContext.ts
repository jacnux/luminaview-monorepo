import { MongoClient, ObjectId } from 'mongodb';

async function run() {
  const uri = "mongodb://mongo:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const dbCore = client.db('luminaview_core');
    const dbChambre = client.db('helioscope_chambrenoire');

    console.log("Fixing Albums...");
    const cnAlbums = await dbChambre.collection('albums').find({}).toArray();
    for (const a of cnAlbums) {
      const coreAlbum = await dbCore.collection('albums').findOne({ _id: a._id });
      if (coreAlbum) {
        if (coreAlbum.appContext === 'LUMINAVIEW') {
          await dbCore.collection('albums').updateOne({ _id: a._id }, { $set: { appContext: 'BOTH' } });
          console.log(`Updated album ${a._id} to BOTH`);
        }
      } else {
        await dbCore.collection('albums').updateOne({ _id: a._id }, { $set: { appContext: 'CHAMBRE_NOIRE' } });
      }
    }

    console.log("Fixing Photos...");
    const cnPhotos = await dbChambre.collection('photos').find({}).toArray();
    for (const p of cnPhotos) {
      const corePhoto = await dbCore.collection('photos').findOne({ _id: p._id });
      if (corePhoto) {
        if (corePhoto.appContext === 'LUMINAVIEW') {
          await dbCore.collection('photos').updateOne({ _id: p._id }, { $set: { appContext: 'BOTH' } });
          console.log(`Updated photo ${p._id} to BOTH`);
        }
      } else {
        await dbCore.collection('photos').updateOne({ _id: p._id }, { $set: { appContext: 'CHAMBRE_NOIRE' } });
      }
    }

    console.log("Done!");
  } finally {
    await client.close();
  }
}

run().catch(console.error);

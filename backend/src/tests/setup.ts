import { beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

process.env.JWT_SECRET = 'test_jwt_secret_key_123456789!';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  let uri = process.env.TEST_MONGO_URI;

  // 1. Si MONGO_URI est défini (ex: conteneur Docker backend avec service 'mongo')
  if (!uri && process.env.MONGO_URI) {
    uri = process.env.MONGO_URI.replace(/\/[^/]+$/, '/luminaview_test');
  }

  // 2. Sinon essayer de démarrer MongoMemoryServer (macOS / Ubuntu GitHub Actions)
  if (!uri) {
    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    } catch (err) {
      // Fallback sur MongoDB local standard
      uri = 'mongodb://127.0.0.1:27017/luminaview_test';
    }
  }

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

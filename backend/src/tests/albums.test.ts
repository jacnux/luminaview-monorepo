import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Album from '../models/Album';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Albums API (/api/albums)', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId().toString();
    const user = await User.create({
      _id: userId,
      name: 'Tester',
      email: `test-${Date.now()}@example.com`,
      password: 'hashedPassword',
      isVerified: true
    });

    token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, isAdmin: false },
      process.env.JWT_SECRET || 'test_jwt_secret_key_123456789!',
      { expiresIn: '1h' }
    );
  });

  it('should create a new album when authenticated', async () => {
    const res = await request(app)
      .post('/api/albums')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Mon Premier Album',
        description: 'Description de test',
        isPublic: true
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Mon Premier Album');
    expect(res.body.userId).toBe(userId);
  });

  it('should list my albums', async () => {
    await Album.create([
      { title: 'Album 1', userId, isPublic: true },
      { title: 'Album 2', userId, isPublic: false }
    ]);

    const res = await request(app)
      .get('/api/albums/my/albums')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('should reject creation if unauthenticated', async () => {
    const res = await request(app)
      .post('/api/albums')
      .send({
        title: 'Album Sans Auth'
      });

    expect(res.status).toBe(401);
  });
});

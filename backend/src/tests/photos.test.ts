import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Album from '../models/Album';
import Photo from '../models/Photo';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Photos API (/api/photos)', () => {
  let token: string;
  let userId: string;
  let albumId: string;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId().toString();
    const user = await User.create({
      _id: userId,
      name: 'Photographer',
      email: `photographer-${Date.now()}@example.com`,
      password: 'hashedPassword',
      isVerified: true
    });

    token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, isAdmin: false },
      process.env.JWT_SECRET || 'test_jwt_secret_key_123456789!',
      { expiresIn: '1h' }
    );

    const album = await Album.create({
      title: 'Album Photos Test',
      userId,
      isPublic: true
    });
    albumId = album._id.toString();
  });

  it('should update photo metadata and toggle isAnalog to false with null filmId', async () => {
    const photo = await Photo.create({
      albumId,
      userId,
      filename: 'photo-1.webp',
      title: 'Ancienne Photo Argentique',
      isAnalog: true,
      filmFrameNumber: 12
    });

    const res = await request(app)
      .put(`/api/photos/${photo._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Photo Modifiée en Numérique',
        isAnalog: false,
        filmId: null,
        filmFrameNumber: null,
        developmentSettings: null
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Photo Modifiée en Numérique');
    expect(res.body.isAnalog).toBe(false);
    expect(res.body.filmId).toBeNull();
    expect(res.body.filmFrameNumber).toBeNull();
    expect(res.body.developmentSettings).toBeNull();
  });

  it('should list user photos via /my/photos', async () => {
    await Photo.create([
      { albumId, userId, filename: 'p1.webp', title: 'P1' },
      { albumId, userId, filename: 'p2.webp', title: 'P2' }
    ]);

    const res = await request(app)
      .get('/api/photos/my/photos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

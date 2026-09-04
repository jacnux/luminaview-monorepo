import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Mock du service email pour ne pas dépendre du serveur SMTP en test
vi.mock('../utils/emailService', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  sendBroadcastEmail: vi.fn().mockResolvedValue(true)
}));

describe('Authentication API (/api/auth)', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Inscription réussie');

    const createdUser = await User.findOne({ email: 'alice@example.com' });
    expect(createdUser).not.toBeNull();
    expect(createdUser?.name).toBe('Alice');
    expect(createdUser?.isAdmin).toBe(true); // Premier utilisateur devient admin
  });

  it('should reject registration with already used email', async () => {
    await User.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: await bcrypt.hash('Secret123!', 10),
      isVerified: true
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Clone',
        email: 'bob@example.com',
        password: 'AnotherPassword!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email déjà utilisé');
  });

  it('should login an existing verified user and return JWT token', async () => {
    const password = 'StrongPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: hashedPassword,
      isVerified: true
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'charlie@example.com',
        password: password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'charlie@example.com');
  });

  it('should reject login with wrong password', async () => {
    await User.create({
      name: 'David',
      email: 'david@example.com',
      password: await bcrypt.hash('CorrectPassword!', 10),
      isVerified: true
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'david@example.com',
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Identifiants incorrects');
  });
});

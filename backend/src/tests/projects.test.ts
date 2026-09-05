import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import Project from '../models/Project';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Projects & Ideas API (/api/projects)', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId().toString();
    const user = await User.create({
      _id: userId,
      name: 'PhotographerProject',
      email: `photographer-proj-${Date.now()}@example.com`,
      password: 'hashedPassword',
      isVerified: true
    });

    token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, isAdmin: false },
      process.env.JWT_SECRET || 'test_jwt_secret_key_123456789!',
      { expiresIn: '1h' }
    );
  });

  it('should create an idea with default status IDEA and medium UNDECIDED', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Série Nocturne en Ville',
        description: 'Exploration des lumières urbaines',
        status: 'IDEA',
        tags: ['urbain', 'nuit', 'moodboard'],
        notesMarkdown: '# Idées de cadrage\n- Lumières au néon\n- Reflets de pluie'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Série Nocturne en Ville');
    expect(res.body.status).toBe('IDEA');
    expect(res.body.medium).toBe('UNDECIDED');
    expect(res.body.tags).toEqual(['urbain', 'nuit', 'moodboard']);
    expect(res.body.notesMarkdown).toContain('# Idées de cadrage');
    expect(res.body.slug).toBe('serie-nocturne-en-ville');
  });

  it('should create a digital project with status IN_PROGRESS and medium DIGITAL', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Portraits Studio 2026',
        description: 'Séance photo studio lumière continue',
        status: 'IN_PROGRESS',
        medium: 'DIGITAL',
        isPublished: true
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('IN_PROGRESS');
    expect(res.body.medium).toBe('DIGITAL');
    expect(res.body.isPublished).toBe(true);
  });

  it('should filter projects by status and medium', async () => {
    await Project.create([
      {
        userId,
        name: 'Idée 1',
        slug: 'idee-1',
        status: 'IDEA',
        medium: 'UNDECIDED'
      },
      {
        userId,
        name: 'Projet Argentique',
        slug: 'projet-argentique',
        status: 'IN_PROGRESS',
        medium: 'ANALOG'
      },
      {
        userId,
        name: 'Projet Numérique',
        slug: 'projet-numerique',
        status: 'COMPLETED',
        medium: 'DIGITAL'
      }
    ]);

    // Test filter status=IDEA
    const ideasRes = await request(app)
      .get('/api/projects?status=IDEA')
      .set('Authorization', `Bearer ${token}`);
    expect(ideasRes.status).toBe(200);
    expect(ideasRes.body.length).toBe(1);
    expect(ideasRes.body[0].name).toBe('Idée 1');

    // Test filter medium=DIGITAL
    const digitalRes = await request(app)
      .get('/api/projects?medium=DIGITAL')
      .set('Authorization', `Bearer ${token}`);
    expect(digitalRes.status).toBe(200);
    expect(digitalRes.body.length).toBe(1);
    expect(digitalRes.body[0].name).toBe('Projet Numérique');
  });

  it('should concretize an idea into an active analog project', async () => {
    const idea = await Project.create({
      userId,
      name: 'Paysages d\'Islande',
      slug: 'paysages-d-islande',
      status: 'IDEA',
      medium: 'UNDECIDED',
      notesMarkdown: 'Prendre film Tri-X et Portra 400'
    });

    const res = await request(app)
      .post(`/api/projects/${idea._id}/concretize`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        medium: 'ANALOG',
        status: 'PREPARATION',
        targetDate: '2026-10-15'
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PREPARATION');
    expect(res.body.medium).toBe('ANALOG');
    expect(res.body.targetDate).toBeDefined();

    const updated = await Project.findById(idea._id);
    expect(updated?.status).toBe('PREPARATION');
    expect(updated?.medium).toBe('ANALOG');
  });

  it('should update project details and handle slug uniqueness', async () => {
    const p1 = await Project.create({
      userId,
      name: 'Voyage Sud',
      slug: 'voyage-sud',
      status: 'IN_PROGRESS',
      medium: 'HYBRID'
    });

    const p2 = await Project.create({
      userId,
      name: 'Autre Projet',
      slug: 'autre-projet',
      status: 'IN_PROGRESS',
      medium: 'DIGITAL'
    });

    // Rename p2 to 'Voyage Sud' -> should get unique slug 'voyage-sud-1'
    const res = await request(app)
      .put(`/api/projects/${p2._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Voyage Sud',
        status: 'COMPLETED'
      });

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('voyage-sud-1');
    expect(res.body.status).toBe('COMPLETED');
  });
});

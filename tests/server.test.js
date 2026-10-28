/**
 * CareBridge — Express Backend Integration Test Suite
 * File: tests/server.test.js
 * 
 * Uses Node.js native test runner (node:test) and supertest.
 * Reference: PDF Page 11.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

describe('1. System Health & Runtime Diagnostics', () => {
  it('GET /api returns 200 and API endpoint index', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'CareBridge Clinical Portal API');
    assert.ok(Array.isArray(res.body.endpoints));
  });

  it('GET /api/health returns 200, status UP, and Node.js v26 runtime metrics', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.ok(res.body.runtime.nodeVersion.startsWith('v'));
    assert.ok(typeof res.body.runtime.uptimeSeconds === 'number');
    assert.ok(res.body.runtime.memoryUsageMB.heapUsed);
  });
});

describe('2. Patient Triage API & Validations', () => {
  let createdPatientId = null;

  it('GET /api/patients returns 200 and array of active patients', async () => {
    const res = await request(app).get('/api/patients');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.count > 0);
  });

  it('GET /api/patients?priority=urgent filters only urgent tier patients', async () => {
    const res = await request(app).get('/api/patients?priority=urgent');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((p) => p.priority === 'urgent'));
  });

  it('GET /api/patients/:id returns 200 for existing patient P-101', async () => {
    const res = await request(app).get('/api/patients/P-101');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'P-101');
    assert.equal(res.body.data.name, 'Vikram Malhotra');
  });

  it('GET /api/patients/nonexistent-id returns 404 PatientNotFoundError', async () => {
    const res = await request(app).get('/api/patients/P-99999');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'PatientNotFoundError');
  });

  it('POST /api/patients creates new triage record with status 201', async () => {
    const payload = {
      name: 'Rohan Deshmukh',
      mrn: 'MRN-88123',
      age: 34,
      tel: '+91 98330 99887',
      stream: 'Cardiology',
      painLevel: 9,
      symptoms: ['Chest Tightness / Dyspnea'],
      accommodations: ['Audio Prescription'],
      notes: 'Test intake record.'
    };

    const res = await request(app).post('/api/patients').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Rohan Deshmukh');
    assert.equal(res.body.data.priority, 'urgent'); // Auto-classified due to chest symptoms + pain 9
    createdPatientId = res.body.data.id;
  });

  it('POST /api/patients rejects invalid name with status 400', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'A',
      mrn: 'MRN-12345',
      age: 30,
      painLevel: 5
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ValidationError');
    assert.equal(res.body.field, 'name');
  });

  it('POST /api/patients rejects invalid MRN with status 400', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'Valid Name',
      mrn: 'BAD-MRN-FORMAT',
      age: 30,
      painLevel: 5
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ValidationError');
    assert.equal(res.body.field, 'mrn');
  });

  it('POST /api/patients rejects out-of-range pain score (> 10) with status 400', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'Valid Name',
      mrn: 'MRN-12345',
      age: 30,
      painLevel: 15
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ValidationError');
    assert.equal(res.body.field, 'painLevel');
  });

  it('DELETE /api/patients/:id discharges created patient and returns 200', async () => {
    assert.ok(createdPatientId, 'createdPatientId should exist');
    const res = await request(app).delete(`/api/patients/${createdPatientId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.dischargedPatient.id, createdPatientId);
  });
});

describe('3. Core fs Streaming & Audit Export', () => {
  it('GET /api/patients/export/stream streams audit log with text/plain', async () => {
    const res = await request(app).get('/api/patients/export/stream');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/plain'));
    assert.ok(res.text.includes('[AUDIT]'));
  });
});

describe('4. Multilingual Prescription API', () => {
  it('GET /api/prescriptions returns 200 with multilingual translations', async () => {
    const res = await request(app).get('/api/prescriptions');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const firstMed = res.body.data[0];
    assert.ok(firstMed.instructions.en);
    assert.ok(firstMed.instructions.hi);
    assert.ok(firstMed.instructions.mr);
  });

  it('PATCH /api/prescriptions/:id/toggle toggles adherence taken status', async () => {
    const res = await request(app).patch('/api/prescriptions/rx-3/toggle');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.data.taken, 'boolean');

    // Toggle back to preserve initial fixture state
    await request(app).patch('/api/prescriptions/rx-3/toggle');
  });

  it('POST /api/prescriptions creates a new prescription with status 201', async () => {
    const res = await request(app).post('/api/prescriptions').send({
      name: 'Ibuprofen',
      dosage: '400 mg',
      time: '04:00 PM',
      mealTiming: 'after',
      doctor: 'Dr. S. K. Rao'
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Ibuprofen');
  });

  it('POST /api/prescriptions rejects missing medication name with 400', async () => {
    const res = await request(app).post('/api/prescriptions').send({
      dosage: '400 mg',
      time: '04:00 PM'
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ValidationError');
    assert.equal(res.body.field, 'name');
  });
});

describe('5. Clinical Analytics & Derived Calculations', () => {
  it('GET /api/analytics returns 200 and real-time triage & rx metrics', async () => {
    const res = await request(app).get('/api/analytics');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.analytics.priorityCounts.urgent !== undefined);
    assert.ok(typeof res.body.analytics.averagePainScore === 'number');
    assert.ok(typeof res.body.analytics.prescriptions.adherenceRatePercent === 'number');
  });
});

describe('6. Error Handling & 404 Fallback', () => {
  it('GET /api/unknown-endpoint returns 404 with structured JSON', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'NotFoundError');
    assert.equal(res.body.statusCode, 404);
  });
});

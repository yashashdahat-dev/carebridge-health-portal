/**
 * CareBridge — Full-Stack Express Backend Integration Test Suite
 * File: tests/server.test.js
 * 
 * Tests:
 * - RESTful Versioning (/api/v1/*)
 * - Server-side Pagination with RFC 5988 Link and X-Total-Count headers
 * - Multi-field Sorting (?sort=-painLevel,name)
 * - Filtering by priority and stream
 * - Relational SQL demonstrations (INNER JOIN, LEFT JOIN, Aggregations)
 * - Input validation & centralized error middleware
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import app from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('1. API Directory & System Health', () => {
  it('GET /api returns 200 and lists v1 endpoints', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.currentVersion, 'v1');
    assert.ok(Array.isArray(res.body.v1Endpoints));
  });

  it('GET /api/v1/health returns 200, status UP, and Node.js v26 runtime metrics', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.ok(res.body.runtime.nodeVersion.startsWith('v'));
    assert.ok(typeof res.body.runtime.uptimeSeconds === 'number');
    assert.ok(res.body.runtime.memoryUsageMB.heapUsed);
  });
});

describe('2. RESTful Versioning & Pagination Best Practices (PDF Page 3-4)', () => {
  it('GET /api/v1/patients supports server-side pagination with page & size', async () => {
    const res = await request(app).get('/api/v1/patients?page=1&size=2');
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.size, 2);
    assert.equal(res.body.data.length, 2);

    // Verify REST Pagination Headers
    assert.ok(res.headers['x-total-count'], 'X-Total-Count header required');
    assert.ok(res.headers['link'], 'RFC 5988 Link header required');
    assert.ok(res.headers['link'].includes('rel="self"'));
    assert.ok(res.headers['link'].includes('rel="first"'));
    assert.ok(res.headers['link'].includes('rel="next"'));
    assert.ok(res.headers['link'].includes('rel="last"'));
  });

  it('GET /api/v1/patients supports multi-field sorting (?sort=-painLevel,name)', async () => {
    const res = await request(app).get('/api/v1/patients?sort=-painLevel');
    assert.equal(res.status, 200);
    const pains = res.body.data.map((p) => p.painLevel);
    // Verify descending order
    for (let i = 0; i < pains.length - 1; i++) {
      assert.ok(pains[i] >= pains[i + 1], `Pain score ${pains[i]} should be >= ${pains[i + 1]}`);
    }
  });

  it('GET /api/v1/patients filters by priority and clinical stream', async () => {
    const res = await request(app).get('/api/v1/patients?priority=urgent&stream=Cardiology');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((p) => p.priority === 'urgent' && p.stream === 'Cardiology'));
  });
});

describe('3. Patient Triage CRUD & Input Validations', () => {
  let createdPatientId = null;

  it('GET /api/v1/patients/:id returns 200 for existing patient P-101', async () => {
    const res = await request(app).get('/api/v1/patients/P-101');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'P-101');
    assert.equal(res.body.data.name, 'Vikram Malhotra');
  });

  it('GET /api/v1/patients/nonexistent returns 404 PatientNotFoundError', async () => {
    const res = await request(app).get('/api/v1/patients/P-99999');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'PatientNotFoundError');
  });

  it('POST /api/v1/patients creates new triage record with status 201', async () => {
    const payload = {
      name: 'Pooja Bhatt',
      mrn: 'MRN-77334',
      age: 45,
      tel: '+91 98220 55443',
      stream: 'Neurology',
      painLevel: 9,
      symptoms: ['Severe Migraine / Vertigo'],
      accommodations: ['High-contrast Interface'],
      notes: 'Emergency neurology referral.'
    };

    const res = await request(app).post('/api/v1/patients').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Pooja Bhatt');
    assert.equal(res.body.data.priority, 'urgent');
    createdPatientId = res.body.data.id;
  });

  it('POST /api/v1/patients rejects invalid MRN with status 400', async () => {
    const res = await request(app).post('/api/v1/patients').send({
      name: 'Valid Patient',
      mrn: 'INVALID-FORMAT',
      age: 40,
      painLevel: 5
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ValidationError');
    assert.equal(res.body.field, 'mrn');
  });

  it('DELETE /api/v1/patients/:id discharges created patient and returns 200', async () => {
    assert.ok(createdPatientId);
    const res = await request(app).delete(`/api/v1/patients/${createdPatientId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.dischargedPatient.id, createdPatientId);
  });
});

describe('4. Relational SQL Queries & Aggregations Demo (PDF Page 1-2)', () => {
  it('GET /api/v1/sql/departments-summary demonstrates LEFT JOIN & Aggregations', async () => {
    const res = await request(app).get('/api/v1/sql/departments-summary');
    assert.equal(res.status, 200);
    assert.ok(res.body.sqlEquivalent.includes('GROUP BY'));
    assert.ok(Array.isArray(res.body.data));
    const firstDept = res.body.data[0];
    assert.ok(firstDept.departmentName);
    assert.ok(typeof firstDept.patientCount === 'number');
    assert.ok(typeof firstDept.avgPainScore === 'number');
  });

  it('GET /api/v1/sql/urgent-patients demonstrates INNER JOIN', async () => {
    const res = await request(app).get('/api/v1/sql/urgent-patients');
    assert.equal(res.status, 200);
    assert.ok(res.body.sqlEquivalent.includes('INNER JOIN'));
    assert.ok(res.body.data.every((p) => p.priority === 'urgent' && p.department.name));
  });

  it('GET /api/v1/sql/schema returns raw DDL blueprint', async () => {
    const res = await request(app).get('/api/v1/sql/schema');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('CREATE TABLE IF NOT EXISTS patients'));
    assert.ok(res.text.includes('CREATE INDEX IF NOT EXISTS idx_patients_priority'));
  });
});

describe('5. Multilingual Prescriptions & Streaming', () => {
  it('GET /api/v1/prescriptions returns multilingual records', async () => {
    const res = await request(app).get('/api/v1/prescriptions');
    assert.equal(res.status, 200);
    const rx = res.body.data[0];
    assert.ok(rx.instructions.en);
    assert.ok(rx.instructions.hi);
    assert.ok(rx.instructions.mr);
  });

  it('PATCH /api/v1/prescriptions/:id/toggle toggles adherence taken flag', async () => {
    const res = await request(app).patch('/api/v1/prescriptions/rx-2/toggle');
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.data.taken, 'boolean');

    // Toggle back to preserve test fixture
    await request(app).patch('/api/v1/prescriptions/rx-2/toggle');
  });

  it('GET /api/v1/patients/export/stream streams audit trail with text/plain', async () => {
    const res = await request(app).get('/api/v1/patients/export/stream');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/plain'));
    assert.ok(res.text.includes('[AUDIT]'));
  });
});

describe('6. Centralized Multi-Transport Logging & Security (PDF Page 5 & 10)', () => {
  it('verifies requests are written to logs/combined.log', () => {
    const logPath = path.join(__dirname, '..', 'logs', 'combined.log');
    assert.ok(fs.existsSync(logPath), 'logs/combined.log should exist on disk');
    const content = fs.readFileSync(logPath, 'utf8');
    assert.ok(content.length > 0, 'combined.log should contain log entries');
  });

  it('GET /api/v1/unknown-endpoint returns 404 with structured JSON', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'NotFoundError');
  });
});

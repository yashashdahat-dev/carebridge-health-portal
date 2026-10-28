/**
 * CareBridge — Express Application Definition
 * File: app.js
 * 
 * Separates app definition from server port listening (for automated testing with supertest).
 * Implements RESTful API Best Practices (URI Versioning v1, Pagination, Filtering, Sorting).
 * Reference: PDF Page 3-5, 8-10, 12.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import patientRouter from './routes/patients.js';
import prescriptionRouter from './routes/prescriptions.js';
import analyticsRouter from './routes/analytics.js';
import healthRouter from './routes/health.js';
import sqlRouter from './routes/sqlDemo.js';

import clinicalLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security Headers Middleware (Helmet) (PDF Page 10)
app.use(
  helmet({
    contentSecurityPolicy: false // Disabled for dev flexibility with fonts and audio
  })
);

// 2. Cross-Origin Resource Sharing (CORS) (PDF Page 10)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Total-Pages', 'X-Current-Page', 'X-Page-Size', 'Link']
  })
);

// 3. Body Parsing Middleware (PDF Page 8-9)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Centralized Request Logging Middleware with PHI Redaction (PDF Page 5)
app.use(clinicalLogger);

// 5. Static File Serving (PDF Page 9, 12)
app.use(express.static(path.join(__dirname, 'dist')));

// 6. RESTful Versioned API Routes (v1) (PDF Page 3)
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/sql', sqlRouter);

// Backward Compatibility Aliases (/api/* maps to v1)
app.use('/api/patients', patientRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/health', healthRouter);

// 7. Base API Directory
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'CareBridge Clinical Portal API',
    currentVersion: 'v1',
    documentation: '/DEVELOPER.md',
    standards: [
      'RESTful URI Versioning (/api/v1)',
      'Server-side Pagination with RFC 5988 Link headers',
      'Multi-field Sorting (?sort=-painLevel,name)',
      'Relational Joins & SQL Aggregations (/api/v1/sql)',
      'Centralized Multi-Transport Logging (logs/combined.log)'
    ],
    v1Endpoints: [
      { method: 'GET', path: '/api/v1/health', description: 'Node runtime info and system health' },
      { method: 'GET', path: '/api/v1/patients', description: 'Patient queue (page, size, sort, priority, search)' },
      { method: 'POST', path: '/api/v1/patients', description: 'Triage intake registration' },
      { method: 'GET', path: '/api/v1/patients/:id', description: 'Patient details by ID' },
      { method: 'DELETE', path: '/api/v1/patients/:id', description: 'Discharge patient from active queue' },
      { method: 'GET', path: '/api/v1/patients/export/stream', description: 'Streaming audit log (fs.createReadStream)' },
      { method: 'GET', path: '/api/v1/prescriptions', description: 'Multilingual medication schedule' },
      { method: 'POST', path: '/api/v1/prescriptions', description: 'Register new medication prescription' },
      { method: 'PATCH', path: '/api/v1/prescriptions/:id/toggle', description: 'Toggle adherence taken status' },
      { method: 'GET', path: '/api/v1/analytics', description: 'Real-time triage and medication adherence metrics' },
      { method: 'GET', path: '/api/v1/sql/departments-summary', description: 'Relational LEFT JOIN & SQL Aggregations demo' },
      { method: 'GET', path: '/api/v1/sql/urgent-patients', description: 'Relational INNER JOIN demo' },
      { method: 'GET', path: '/api/v1/sql/schema', description: 'PostgreSQL / MySQL DDL blueprint' }
    ]
  });
});

// Also provide /api/v1 root
app.get('/api/v1', (req, res) => {
  res.redirect(301, '/api');
});

// 8. 404 Route Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
    statusCode: 404
  });
});

// 9. Centralized Error Handling Middleware (4 arguments) (PDF Page 4-5)
app.use(errorHandler);

export default app;

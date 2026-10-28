/**
 * CareBridge — Express Application Definition
 * File: app.js
 * 
 * Separates app definition from server port listening (for automated testing with supertest).
 * Reference: PDF Page 8-10, 12.
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

import clinicalLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security Headers Middleware (Helmet)
// PDF Page 10: Mitigates common web vulnerabilities
app.use(
  helmet({
    contentSecurityPolicy: false // Disabled for dev flexibility with inline scripts/fonts
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
// PDF Page 10: Allows frontend at http://localhost:3000 to call the API
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body Parsing Middleware
// PDF Page 8-9: Parses incoming JSON and URL-encoded bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Request Logging Middleware
app.use(clinicalLogger);

// 5. Static File Serving
// PDF Page 9, 12: Serves pre-built frontend assets from dist/ if present
app.use(express.static(path.join(__dirname, 'dist')));

// 6. Clinical API Routes
app.use('/api/patients', patientRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/health', healthRouter);

// 7. Base API Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'CareBridge Clinical Portal API',
    version: '1.0.0',
    documentation: '/DEVELOPER.md',
    endpoints: [
      { method: 'GET', path: '/api/health', description: 'System health and Node runtime metrics' },
      { method: 'GET', path: '/api/patients', description: 'Patient triage queue with filters' },
      { method: 'POST', path: '/api/patients', description: 'Intake triage registration' },
      { method: 'GET', path: '/api/patients/:id', description: 'Fetch patient by ID' },
      { method: 'DELETE', path: '/api/patients/:id', description: 'Discharge patient from queue' },
      { method: 'GET', path: '/api/patients/export/stream', description: 'Stream clinical audit log (fs.createReadStream)' },
      { method: 'GET', path: '/api/prescriptions', description: 'Multilingual prescription schedule' },
      { method: 'POST', path: '/api/prescriptions', description: 'Register new prescription' },
      { method: 'PATCH', path: '/api/prescriptions/:id/toggle', description: 'Toggle medication adherence status' },
      { method: 'GET', path: '/api/analytics', description: 'Real-time triage and medication metrics' }
    ]
  });
});

// 8. 404 Route Not Found Handler (JSON for /api, fallback for other paths)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
    statusCode: 404
  });
});

// 9. Centralized Error Handling Middleware (4 arguments: err, req, res, next)
// PDF Page 9
app.use(errorHandler);

export default app;

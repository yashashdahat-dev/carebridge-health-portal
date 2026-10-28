/**
 * CareBridge — System Health & Runtime Diagnostics Router
 * File: routes/health.js
 * 
 * Demonstrates:
 * - process.uptime() (system uptime in seconds)
 * - process.memoryUsage() (heap used, heap total, rss)
 * - process.version & process.versions (Node.js engine & dependencies)
 * - process.pid (OS process ID)
 * - process.env.NODE_ENV
 */

import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const memory = process.memoryUsage();

  res.status(200).json({
    status: 'UP',
    service: 'CareBridge Clinical Backend API',
    timestamp: new Date().toISOString(),
    runtime: {
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      libuvVersion: process.versions.uv,
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      memoryUsageMB: {
        rss: (memory.rss / 1024 / 1024).toFixed(2),
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2),
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2),
        external: (memory.external / 1024 / 1024).toFixed(2)
      }
    },
    capabilities: [
      'ESI Patient Triage Engine',
      'Multilingual Prescription Reader (EN, HI, MR)',
      'Audit Log Streamer',
      'WCAG 2.1 AAA Accessibility Coordinator'
    ]
  });
});

export default router;


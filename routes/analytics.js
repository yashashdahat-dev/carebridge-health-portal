/**
 * CareBridge — Clinical Analytics Router
 * File: routes/analytics.js
 * 
 * Demonstrates:
 * - Aggregation and derived state calculations on backend
 * - Core fs/promises reading
 */

import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATIENTS_FILE = path.join(__dirname, '..', 'data', 'patients.json');
const RX_FILE = path.join(__dirname, '..', 'data', 'prescriptions.json');

router.get('/', async (req, res, next) => {
  try {
    const [patientsData, rxData] = await Promise.all([
      readFile(PATIENTS_FILE, 'utf8'),
      readFile(RX_FILE, 'utf8')
    ]);

    const patients = JSON.parse(patientsData);
    const prescriptions = JSON.parse(rxData);

    // 1. Triage Priority Counts
    const priorityCounts = patients.reduce(
      (acc, p) => {
        const tier = (p.priority || 'routine').toLowerCase();
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      },
      { urgent: 0, priority: 0, routine: 0 }
    );

    // 2. Average Pain Score
    const totalPain = patients.reduce((acc, p) => acc + (Number(p.painLevel) || 0), 0);
    const averagePain = patients.length ? (totalPain / patients.length).toFixed(1) : '0.0';

    // 3. Medication Adherence Statistics
    const takenCount = prescriptions.filter((rx) => rx.taken).length;
    const totalRx = prescriptions.length;
    const adherencePercent = totalRx ? Math.round((takenCount / totalRx) * 100) : 0;

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      analytics: {
        totalQueue: patients.length,
        priorityCounts,
        hasUrgent: priorityCounts.urgent > 0,
        averagePainScore: Number(averagePain),
        prescriptions: {
          total: totalRx,
          taken: takenCount,
          pending: totalRx - takenCount,
          adherenceRatePercent: adherencePercent,
          allCompleted: totalRx > 0 && takenCount === totalRx
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;


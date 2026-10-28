/**
 * CareBridge — Multilingual Prescription Router
 * File: routes/prescriptions.js
 * 
 * Demonstrates:
 * - Express Router
 * - Core fs/promises for data persistence
 * - Async handlers with try/catch and next(err)
 * - Multilingual JSON response payload (en, hi, mr)
 */

import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RX_FILE = path.join(__dirname, '..', 'data', 'prescriptions.json');

async function loadPrescriptions() {
  const data = await readFile(RX_FILE, 'utf8');
  return JSON.parse(data);
}

async function savePrescriptions(prescriptions) {
  await writeFile(RX_FILE, JSON.stringify(prescriptions, null, 2), 'utf8');
}

/**
 * GET /api/prescriptions
 * Returns all active prescriptions with adherence status and multilingual instructions
 */
router.get('/', async (req, res, next) => {
  try {
    const prescriptions = await loadPrescriptions();
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/prescriptions
 * Registers a new medication regimen with validation
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, dosage, time, mealTiming, doctor, instructions, translatedNames } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'name',
        message: 'Medication trade/generic name is mandatory.'
      });
    }

    if (!dosage || !dosage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'dosage',
        message: 'Medication strength/dosage is mandatory (e.g., 5 mg, 500 mg).'
      });
    }

    if (!time || !time.trim()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'time',
        message: 'Administration schedule time is mandatory (e.g., 08:00 AM).'
      });
    }

    const newRx = {
      id: `rx-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      dosage: dosage.trim(),
      time: time.trim(),
      mealTiming: mealTiming || 'after',
      doctor: doctor || 'On-Duty Attending Physician',
      taken: false,
      lastTakenTime: null,
      instructions: instructions || {
        en: `Take ${dosage.trim()} as prescribed.`,
        hi: `निर्देशानुसार ${dosage.trim()} लें।`,
        mr: `निर्देशांनुसार ${dosage.trim()} घ्या.`
      },
      translatedNames: translatedNames || {
        en: name.trim(),
        hi: name.trim(),
        mr: name.trim()
      }
    };

    const prescriptions = await loadPrescriptions();
    prescriptions.push(newRx);
    await savePrescriptions(prescriptions);

    res.status(201).json({
      success: true,
      message: `Prescription ${newRx.name} created successfully.`,
      data: newRx
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/prescriptions/:id/toggle
 * Toggles adherence taken status and records timestamp
 */
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const prescriptions = await loadPrescriptions();
    const rx = prescriptions.find((p) => p.id === req.params.id);

    if (!rx) {
      return res.status(404).json({
        success: false,
        error: 'PrescriptionNotFoundError',
        message: `Prescription with ID ${req.params.id} was not found.`
      });
    }

    rx.taken = !rx.taken;
    rx.lastTakenTime = rx.taken
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    await savePrescriptions(prescriptions);

    res.status(200).json({
      success: true,
      message: `Prescription ${rx.name} marked as ${rx.taken ? 'TAKEN' : 'PENDING'}.`,
      data: rx
    });
  } catch (err) {
    next(err);
  }
});

export default router;

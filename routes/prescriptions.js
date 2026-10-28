/**
 * CareBridge — Multilingual Prescription Router (RESTful API Best Practices)
 * File: routes/prescriptions.js
 * 
 * Demonstrates:
 * - RESTful URI Versioning (/api/v1/prescriptions)
 * - Server-side pagination & sorting
 * - Multilingual schema response
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
 * GET /api/v1/prescriptions
 * Supports ?taken=true/false and ?sort=name,-time
 */
router.get('/', async (req, res, next) => {
  try {
    const prescriptions = await loadPrescriptions();
    let { taken, sort, page, size } = req.query;

    let filtered = prescriptions;

    if (taken !== undefined) {
      const isTaken = taken === 'true';
      filtered = filtered.filter((rx) => rx.taken === isTaken);
    }

    if (sort) {
      const sortFields = sort.split(',').map((s) => s.trim());
      filtered = [...filtered].sort((a, b) => {
        for (const field of sortFields) {
          const isDesc = field.startsWith('-');
          const prop = isDesc ? field.slice(1) : field;
          let valA = a[prop];
          let valB = b[prop];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
        }
        return 0;
      });
    }

    const totalItems = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(size, 10) || 10;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const validPage = Math.min(Math.max(pageNum, 1), totalPages);

    const startIndex = (validPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    res.setHeader('X-Total-Count', totalItems);

    res.status(200).json({
      success: true,
      pagination: {
        page: validPage,
        size: pageSize,
        totalItems,
        totalPages
      },
      count: paginated.length,
      data: paginated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/prescriptions
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
 * PATCH /api/v1/prescriptions/:id/toggle
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

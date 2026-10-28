/**
 * CareBridge — Patient Triage Router
 * File: routes/patients.js
 * 
 * Demonstrates:
 * - Express Router (express.Router())
 * - Core fs/promises (readFile, writeFile)
 * - Core path module (path.join)
 * - Core fs streaming (fs.createReadStream().pipe(res))
 * - Route params (req.params.id) and query parameters (req.query)
 * - HTTP Status codes (200, 201, 400, 404, 500)
 */

import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATIENTS_FILE = path.join(__dirname, '..', 'data', 'patients.json');
const AUDIT_LOG_FILE = path.join(__dirname, '..', 'data', 'audit.log');

/**
 * Helper to read patients from disk
 */
async function loadPatients() {
  const data = await readFile(PATIENTS_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Helper to save patients to disk
 */
async function savePatients(patients) {
  await writeFile(PATIENTS_FILE, JSON.stringify(patients, null, 2), 'utf8');
}

/**
 * GET /api/patients/export/stream
 * Streams the audit log directly to response using fs.createReadStream()
 * Memory efficient for large clinical export files (PDF Page 2 & 6).
 */
router.get('/export/stream', (req, res, next) => {
  if (!existsSync(AUDIT_LOG_FILE)) {
    return res.status(404).json({ error: 'Audit log file not found' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Disposition': 'inline; filename="carebridge-clinical-audit.log"'
  });

  const readStream = createReadStream(AUDIT_LOG_FILE);
  readStream.pipe(res);

  readStream.on('error', (err) => {
    next(err);
  });
});

/**
 * GET /api/patients
 * Supports query parameters: ?priority=urgent and ?search=vikram
 */
router.get('/', async (req, res, next) => {
  try {
    const patients = await loadPatients();
    const { priority, search } = req.query;

    let filtered = patients;

    if (priority && priority !== 'all') {
      filtered = filtered.filter((p) => p.priority.toLowerCase() === priority.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.stream.toLowerCase().includes(q) ||
          p.symptoms?.some((s) => s.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      total: patients.length,
      data: filtered
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patients/:id
 * Route parameter example (req.params.id)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const patients = await loadPatients();
    const patient = patients.find((p) => p.id === req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PatientNotFoundError',
        message: `Patient with ID ${req.params.id} does not exist in active triage queue.`
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/patients
 * Clinical triage intake with validation (HTTP 201 Created / 400 Bad Request)
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, mrn, age, tel, stream, painLevel, symptoms = [], accommodations = [], notes = '' } = req.body;

    // Clinical Input Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'name',
        message: 'Patient full legal name must contain at least 2 alphabetic characters.'
      });
    }

    if (!mrn || !/^MRN-\d{4,6}$/i.test(mrn.trim())) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'mrn',
        message: 'Invalid Medical Record Number (MRN). Expected format: MRN-XXXXX.'
      });
    }

    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge) || numericAge < 0 || numericAge > 125) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'age',
        message: 'Patient age must be an integer between 0 and 125 years.'
      });
    }

    const numericPain = parseInt(painLevel, 10);
    if (isNaN(numericPain) || numericPain < 1 || numericPain > 10) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        field: 'painLevel',
        message: 'Pain score must be an integer on the 1–10 Numeric Rating Scale (NRS).'
      });
    }

    // Determine ESI Priority Tier
    const criticalSymptoms = [
      'Chest Tightness / Dyspnea',
      'Severe Migraine / Vertigo',
      'Musculoskeletal Trauma'
    ];
    const isCritical = symptoms.some((s) => criticalSymptoms.includes(s));
    let priority = 'routine';
    if (isCritical || numericPain >= 8) {
      priority = 'urgent';
    } else if (numericPain >= 5) {
      priority = 'priority';
    }

    const newPatient = {
      id: `P-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      mrn: mrn.trim().toUpperCase(),
      age: numericAge,
      tel: tel ? tel.trim() : '',
      stream: stream || 'General Medicine',
      painLevel: numericPain,
      symptoms,
      accommodations,
      priority,
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim()
    };

    const patients = await loadPatients();
    patients.unshift(newPatient);
    await savePatients(patients);

    res.status(201).json({
      success: true,
      message: `Patient ${newPatient.name} triaged successfully as ${newPatient.priority.toUpperCase()}`,
      data: newPatient
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/patients/:id
 * Discharge or complete patient treatment from active triage queue
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const patients = await loadPatients();
    const index = patients.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'PatientNotFoundError',
        message: `Cannot discharge: Patient ID ${req.params.id} not found.`
      });
    }

    const [discharged] = patients.splice(index, 1);
    await savePatients(patients);

    res.status(200).json({
      success: true,
      message: `Patient ${discharged.name} (${discharged.mrn}) successfully discharged from triage queue.`,
      dischargedPatient: discharged
    });
  } catch (err) {
    next(err);
  }
});

export default router;

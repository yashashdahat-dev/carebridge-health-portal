/**
 * CareBridge — Patient Triage Router (RESTful API Best Practices)
 * File: routes/patients.js
 * 
 * Demonstrates:
 * - RESTful URI Versioning (/api/v1/patients) (PDF Page 3)
 * - Server-side Pagination with metadata, X-Total-Count, and RFC 5988 Link headers (PDF Page 4)
 * - Filtering by fields (?priority=urgent, ?stream=Cardiology, ?search=query)
 * - Multi-field Sorting with '-' for descending (?sort=-painLevel,name) (PDF Page 4)
 * - fs/promises async persistence and streaming
 * - Clean HTTP Status codes (200, 201, 400, 404, 500)
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

async function loadPatients() {
  const data = await readFile(PATIENTS_FILE, 'utf8');
  return JSON.parse(data);
}

async function savePatients(patients) {
  await writeFile(PATIENTS_FILE, JSON.stringify(patients, null, 2), 'utf8');
}

/**
 * Builds RFC 5988 Link Header for paginated APIs (PDF Page 4)
 */
function buildLinkHeader(baseUrl, page, size, totalPages) {
  const links = [];
  links.push(`<${baseUrl}?page=${page}&size=${size}>; rel="self"`);
  links.push(`<${baseUrl}?page=1&size=${size}>; rel="first"`);
  if (page > 1) {
    links.push(`<${baseUrl}?page=${page - 1}&size=${size}>; rel="prev"`);
  }
  if (page < totalPages) {
    links.push(`<${baseUrl}?page=${page + 1}&size=${size}>; rel="next"`);
  }
  links.push(`<${baseUrl}?page=${totalPages}&size=${size}>; rel="last"`);
  return links.join(', ');
}

/**
 * Applies multi-field sorting based on sort query (?sort=-painLevel,name)
 */
function applySorting(records, sortQuery) {
  if (!sortQuery) return records;
  const sortFields = sortQuery.split(',').map((s) => s.trim());

  return [...records].sort((a, b) => {
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

/**
 * GET /api/v1/patients/export/stream
 * Streams clinical audit log using fs.createReadStream()
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
 * GET /api/v1/patients
 * Supports:
 * - Filtering: ?priority=urgent, ?stream=Cardiology, ?search=vikram
 * - Sorting: ?sort=-painLevel,name
 * - Pagination: ?page=1&size=10
 */
router.get('/', async (req, res, next) => {
  try {
    const patients = await loadPatients();
    let { priority, stream, search, sort, page, size } = req.query;

    let filtered = patients;

    // 1. Filtering by Priority
    if (priority && priority !== 'all') {
      filtered = filtered.filter((p) => p.priority.toLowerCase() === priority.toLowerCase());
    }

    // 2. Filtering by Clinical Stream / Department
    if (stream && stream !== 'all') {
      filtered = filtered.filter((p) => p.stream.toLowerCase() === stream.toLowerCase());
    }

    // 3. Free-text search
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

    // 4. Multi-Field Sorting (PDF Page 4)
    if (sort) {
      filtered = applySorting(filtered, sort);
    }

    // 5. Server-Side Pagination (PDF Page 4)
    const totalItems = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(size, 10) || 10;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const validPage = Math.min(Math.max(pageNum, 1), totalPages);

    const startIndex = (validPage - 1) * pageSize;
    const paginatedRecords = filtered.slice(startIndex, startIndex + pageSize);

    // Set standard REST Pagination Headers (PDF Page 4)
    res.setHeader('X-Total-Count', totalItems);
    res.setHeader('X-Total-Pages', totalPages);
    res.setHeader('X-Current-Page', validPage);
    res.setHeader('X-Page-Size', pageSize);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    res.setHeader('Link', buildLinkHeader(baseUrl, validPage, pageSize, totalPages));

    res.status(200).json({
      success: true,
      pagination: {
        page: validPage,
        size: pageSize,
        totalItems,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      },
      count: paginatedRecords.length,
      data: paginatedRecords
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/patients/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const patients = await loadPatients();
    const patient = patients.find((p) => p.id === req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PatientNotFoundError',
        message: `Patient with ID ${req.params.id} does not exist in active triage queue.`,
        statusCode: 404
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
 * POST /api/v1/patients
 * Clinical triage intake with validation (HTTP 201 Created / 400 Bad Request)
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, mrn, age, tel, stream, painLevel, symptoms = [], accommodations = [], notes = '' } = req.body;

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
 * DELETE /api/v1/patients/:id
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

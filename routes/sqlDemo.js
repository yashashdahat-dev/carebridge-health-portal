/**
 * CareBridge — Relational SQL Query Demonstration Router
 * File: routes/sqlDemo.js
 * 
 * Demonstrates:
 * - Relational SQL Joins (INNER JOIN, LEFT JOIN) (PDF Page 1-2)
 * - SQL Aggregations (COUNT, AVG, MIN, MAX, GROUP BY) (PDF Page 2)
 * - Exposing SQL schema metadata and queries for clinical analytics
 */

import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_FILE = path.join(__dirname, '..', 'db', 'schema.sql');
const PATIENTS_FILE = path.join(__dirname, '..', 'data', 'patients.json');

// Mock relational departments table
const DEPARTMENTS = [
  { id: 1, code: 'CARD', name: 'Cardiology', floor: 2, emergencyCapable: true },
  { id: 2, code: 'ORTH', name: 'Orthopedic Trauma', floor: 1, emergencyCapable: true },
  { id: 3, code: 'NEUR', name: 'Neurology', floor: 3, emergencyCapable: true },
  { id: 4, code: 'GENM', name: 'General Medicine', floor: 1, emergencyCapable: false },
  { id: 5, code: 'PED', name: 'Pediatrics', floor: 2, emergencyCapable: false }
];

/**
 * GET /api/v1/sql/departments-summary
 * Emulates:
 * SELECT d.name, COUNT(p.id) AS patient_count, AVG(p.pain_level) AS avg_pain
 * FROM departments d
 * LEFT JOIN patients p ON d.name = p.stream
 * GROUP BY d.id, d.name;
 */
router.get('/departments-summary', async (req, res, next) => {
  try {
    const patientsRaw = await readFile(PATIENTS_FILE, 'utf8');
    const patients = JSON.parse(patientsRaw);

    const summary = DEPARTMENTS.map((dept) => {
      const deptPatients = patients.filter((p) => p.stream === dept.name);
      const totalPain = deptPatients.reduce((sum, p) => sum + (Number(p.painLevel) || 0), 0);
      const avgPain = deptPatients.length ? Number((totalPain / deptPatients.length).toFixed(1)) : 0;
      const minPain = deptPatients.length ? Math.min(...deptPatients.map((p) => p.painLevel)) : 0;
      const maxPain = deptPatients.length ? Math.max(...deptPatients.map((p) => p.painLevel)) : 0;

      return {
        departmentId: dept.id,
        code: dept.code,
        departmentName: dept.name,
        floor: dept.floor,
        patientCount: deptPatients.length,
        avgPainScore: avgPain,
        minPain,
        maxPain
      };
    });

    res.status(200).json({
      success: true,
      sqlEquivalent: `SELECT d.name, COUNT(p.id) AS patient_count, AVG(p.pain_level) AS avg_pain FROM departments d LEFT JOIN patients p ON d.name = p.stream GROUP BY d.id, d.name ORDER BY patient_count DESC;`,
      rowCount: summary.length,
      data: summary.sort((a, b) => b.patientCount - a.patientCount)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/sql/urgent-patients
 * Emulates:
 * SELECT p.id, p.mrn, p.name, p.priority, d.name AS department, d.floor
 * FROM patients p
 * INNER JOIN departments d ON p.stream = d.name
 * WHERE p.priority = 'urgent';
 */
router.get('/urgent-patients', async (req, res, next) => {
  try {
    const patientsRaw = await readFile(PATIENTS_FILE, 'utf8');
    const patients = JSON.parse(patientsRaw);

    const urgentJoined = patients
      .filter((p) => p.priority === 'urgent')
      .map((p) => {
        const dept = DEPARTMENTS.find((d) => d.name === p.stream) || {
          id: null,
          floor: 1,
          emergencyCapable: true
        };
        return {
          patientId: p.id,
          mrn: p.mrn,
          patientName: p.name,
          age: p.age,
          painLevel: p.painLevel,
          priority: p.priority,
          department: {
            id: dept.id,
            name: p.stream,
            floor: dept.floor,
            emergencyCapable: dept.emergencyCapable
          },
          symptoms: p.symptoms,
          arrivalTime: p.arrivalTime
        };
      });

    res.status(200).json({
      success: true,
      sqlEquivalent: `SELECT p.id, p.mrn, p.name, p.priority, d.name, d.floor FROM patients p INNER JOIN departments d ON p.stream = d.name WHERE p.priority = 'urgent';`,
      rowCount: urgentJoined.length,
      data: urgentJoined
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/sql/schema
 * Returns the raw DDL schema definition
 */
router.get('/schema', async (req, res, next) => {
  try {
    const ddl = await readFile(SCHEMA_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(ddl);
  } catch (err) {
    next(err);
  }
});

export default router;

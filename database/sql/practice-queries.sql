-- =============================================================================
-- CareBridge — Canonical SQL Practice Queries
-- File: database/sql/practice-queries.sql
-- 
-- Covers:
-- 1. SELECT (Simple & Filtered)
-- 2. INSERT (New records)
-- 3. UPDATE (Modify fields)
-- 4. DELETE (Remove records)
-- 5. INNER JOIN (Merge related entities)
-- 6. LEFT JOIN (Preserve left rows)
-- 7. Aggregations (COUNT, AVG, MIN, MAX with GROUP BY & HAVING)
-- =============================================================================

-- 1. SELECT: Retrieve all urgent priority triage patients
SELECT id, mrn, full_name, age, pain_level, priority
FROM patients
WHERE priority = 'urgent'
ORDER BY pain_level DESC;

-- 2. INSERT: Register a new walk-in triage patient
INSERT INTO patients (id, mrn, full_name, age, phone, department_id, pain_level, priority, arrival_time, notes)
VALUES ('P-105', 'MRN-55124', 'Anil Mehta', 54, '+91 98111 22334', 1, 9, 'urgent', '11:45:00', 'Chest pain radiating to left arm.');

-- 3. UPDATE: Record patient medication administration
UPDATE prescriptions
SET taken = TRUE, last_taken_at = CURRENT_TIMESTAMP
WHERE id = 'rx-3';

-- 4. DELETE: Remove completed record from active queue
DELETE FROM patients
WHERE id = 'P-105';

-- 5. INNER JOIN: Combine patients with their assigned department details
SELECT 
  p.id AS patient_id,
  p.mrn,
  p.full_name,
  p.pain_level,
  p.priority,
  d.name AS department_name,
  d.floor AS department_floor
FROM patients p
INNER JOIN departments d ON p.department_id = d.id
WHERE p.priority = 'urgent'
ORDER BY p.pain_level DESC;

-- 6. LEFT JOIN with Aggregations: Summary analytics per department
SELECT 
  d.name AS department_name,
  d.floor,
  COUNT(p.id) AS total_patients,
  ROUND(AVG(p.pain_level), 1) AS avg_pain_score,
  MIN(p.pain_level) AS min_pain,
  MAX(p.pain_level) AS max_pain
FROM departments d
LEFT JOIN patients p ON d.id = p.department_id
GROUP BY d.id, d.name, d.floor
ORDER BY total_patients DESC;

-- 7. HAVING Clause: Filter departments with average pain score > 5.0
SELECT 
  d.name AS department,
  COUNT(p.id) AS patient_count,
  ROUND(AVG(p.pain_level), 2) AS mean_pain
FROM departments d
INNER JOIN patients p ON d.id = p.department_id
GROUP BY d.id, d.name
HAVING AVG(p.pain_level) >= 5.0;

-- 8. Prisma / PostgreSQL Exact Schema Queries (PDF Page 17)
-- Count patients by priority:
SELECT priority, COUNT(*) FROM "Patient" GROUP BY priority;

-- Average age of patients:
SELECT AVG(age) FROM "Patient";

-- Join example: patient and their prescriptions
SELECT p.name AS patient, pr.name AS prescription
FROM "Patient" p
LEFT JOIN "Prescription" pr ON p.id = pr."patientId";



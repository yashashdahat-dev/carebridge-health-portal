-- =============================================================================
-- CareBridge Clinical Portal — Relational Database Schema (PostgreSQL / MySQL)
-- File: db/schema.sql
-- 
-- Demonstrates:
-- - Relational tables with defined data types
-- - Primary keys and Foreign keys (Referential Integrity)
-- - Indexes for performance acceleration (B-tree on mrn, priority, created_at)
-- - JOIN operations (INNER JOIN, LEFT JOIN)
-- - Aggregations (COUNT, AVG, MIN, MAX, GROUP BY, HAVING)
-- =============================================================================

-- 1. CLINICAL DEPARTMENTS / STREAMS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(16) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  emergency_capable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PATIENT TRIAGE RECORDS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(32) PRIMARY KEY,
  mrn VARCHAR(32) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  age INT NOT NULL CHECK (age >= 0 AND age <= 125),
  phone VARCHAR(32),
  department_id INT NOT NULL REFERENCES departments(id) ON UPDATE CASCADE,
  pain_level INT NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  priority VARCHAR(16) NOT NULL CHECK (priority IN ('urgent', 'priority', 'routine')),
  arrival_time TIME NOT NULL,
  notes TEXT,
  discharged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLINICAL SYMPTOMS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS symptoms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PATIENT-SYMPTOM JUNCTION TABLE (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS patient_symptoms (
  patient_id VARCHAR(32) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptom_id INT NOT NULL REFERENCES symptoms(id) ON DELETE RESTRICT,
  severity VARCHAR(20) DEFAULT 'moderate',
  PRIMARY KEY (patient_id, symptom_id)
);

-- 5. MULTILINGUAL PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) REFERENCES patients(id) ON DELETE SET NULL,
  drug_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(64) NOT NULL,
  scheduled_time VARCHAR(16) NOT NULL,
  meal_timing VARCHAR(16) NOT NULL CHECK (meal_timing IN ('before', 'with', 'after')),
  prescribing_doctor VARCHAR(150) NOT NULL,
  taken BOOLEAN DEFAULT FALSE,
  last_taken_at TIMESTAMP WITH TIME ZONE,
  instructions_en TEXT NOT NULL,
  instructions_hi TEXT,
  instructions_mr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SYSTEM AUDIT & ACCESS LOG TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  actor VARCHAR(64) DEFAULT 'system',
  entity VARCHAR(64) NOT NULL,
  entity_id VARCHAR(32),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PERFORMANCE INDEXES (PDF Page 1)
-- "Indexes allow the database server to find and retrieve specific rows much faster"
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_taken ON prescriptions(taken);

-- =============================================================================
-- SAMPLE DATA SEEDING
-- =============================================================================
INSERT INTO departments (code, name, floor, emergency_capable) VALUES
  ('CARD', 'Cardiology', 2, TRUE),
  ('ORTH', 'Orthopedic Trauma', 1, TRUE),
  ('NEUR', 'Neurology', 3, TRUE),
  ('GENM', 'General Medicine', 1, FALSE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO symptoms (name, is_critical) VALUES
  ('Chest Tightness / Dyspnea', TRUE),
  ('Severe Migraine / Vertigo', TRUE),
  ('Musculoskeletal Trauma', TRUE),
  ('Persistent Dry Cough', FALSE),
  ('Generalized Fatigue', FALSE)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- CANONICAL SQL QUERY EXAMPLES (PDF Page 1 & 2)
-- =============================================================================

-- Query 1: Basic SELECT with WHERE & ORDER BY
-- SELECT * FROM patients WHERE priority = 'urgent' ORDER BY pain_level DESC;

-- Query 2: INSERT
-- INSERT INTO patients (id, mrn, full_name, age, department_id, pain_level, priority, arrival_time)
-- VALUES ('P-105', 'MRN-90210', 'Anil Mehta', 50, 1, 9, 'urgent', '11:30:00');

-- Query 3: UPDATE
-- UPDATE prescriptions SET taken = TRUE, last_taken_at = CURRENT_TIMESTAMP WHERE id = 'rx-1';

-- Query 4: DELETE (Soft or Hard)
-- DELETE FROM patients WHERE id = 'P-105';

-- Query 5: INNER JOIN (Patients + Department Details)
-- SELECT 
--   p.id, 
--   p.mrn, 
--   p.full_name, 
--   p.priority, 
--   p.pain_level, 
--   d.name AS department_name, 
--   d.floor
-- FROM patients p
-- INNER JOIN departments d ON p.department_id = d.id
-- WHERE p.priority = 'urgent';

-- Query 6: Aggregations & GROUP BY (Summary Analytics)
-- SELECT 
--   d.name AS department, 
--   COUNT(p.id) AS patient_count, 
--   ROUND(AVG(p.pain_level), 1) AS avg_pain_score,
--   MIN(p.pain_level) AS min_pain,
--   MAX(p.pain_level) AS max_pain
-- FROM departments d
-- LEFT JOIN patients p ON d.id = p.department_id
-- GROUP BY d.id, d.name
-- ORDER BY patient_count DESC;

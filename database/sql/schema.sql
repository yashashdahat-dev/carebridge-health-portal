-- =============================================================================
-- CareBridge Clinical Portal — Relational Database Schema (PostgreSQL / MySQL)
-- File: database/sql/schema.sql
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

-- 4. PATIENT-SYMPTOM JUNCTION TABLE
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

-- PERFORMANCE INDEXES (PDF Page 1)
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_taken ON prescriptions(taken);


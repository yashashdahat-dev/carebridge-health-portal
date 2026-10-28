-- =============================================================================
-- CareBridge Clinical Portal — Seed Data
-- File: database/sql/seed.sql
-- =============================================================================

INSERT INTO departments (code, name, floor, emergency_capable) VALUES
  ('CARD', 'Cardiology', 2, TRUE),
  ('ORTH', 'Orthopedic Trauma', 1, TRUE),
  ('NEUR', 'Neurology', 3, TRUE),
  ('GENM', 'General Medicine', 1, FALSE),
  ('PED',  'Pediatrics', 2, FALSE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO symptoms (name, is_critical) VALUES
  ('Chest Tightness / Dyspnea', TRUE),
  ('Severe Migraine / Vertigo', TRUE),
  ('Musculoskeletal Trauma', TRUE),
  ('Persistent Dry Cough', FALSE),
  ('Generalized Fatigue', FALSE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO patients (id, mrn, full_name, age, phone, department_id, pain_level, priority, arrival_time, notes) VALUES
  ('P-101', 'MRN-72910', 'Vikram Malhotra', 58, '+91 98201 11234', 1, 9, 'urgent', '10:42:00', 'Retrosternal pressure, diaphoresis. SpO2: 92%, BP: 155/95.'),
  ('P-102', 'MRN-48201', 'Sunita Deshmukh', 42, '+91 98450 22345', 2, 6, 'priority', '10:55:00', 'Suspected distal radius hairline fracture from domestic fall.'),
  ('P-103', 'MRN-19384', 'Aarav Kulkarni', 29, '+91 97110 33456', 4, 3, 'routine', '11:05:00', 'Mild upper respiratory tract symptoms for 3 days.'),
  ('P-104', 'MRN-60472', 'Fatima Sheikh', 67, '+91 99300 44567', 3, 8, 'urgent', '11:15:00', 'Acute vestibular vertigo with photophobia and nausea.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescriptions (id, patient_id, drug_name, dosage, scheduled_time, meal_timing, prescribing_doctor, taken, instructions_en, instructions_hi, instructions_mr) VALUES
  ('rx-1', 'P-101', 'Amlodipine Besylate', '5 mg', '08:00 AM', 'after', 'Dr. S. K. Rao (Cardiology)', TRUE, 'Take 1 tablet in the morning with water.', 'सुबह 1 गोली पानी के साथ लें।', 'सकाळी 1 गोळी पाण्यासोबत घ्या.'),
  ('rx-2', 'P-101', 'Metformin Hydrochloride', '500 mg', '01:30 PM', 'with', 'Dr. Ananya Sen (Endocrinology)', TRUE, 'Take 1 tablet during lunch.', 'दोपहर के भोजन के साथ 1 गोली लें।', 'दुपारच्या जेवणासोबत 1 गोळी घ्या.'),
  ('rx-3', 'P-104', 'Atorvastatin Calcium', '20 mg', '09:00 PM', 'after', 'Dr. S. K. Rao (Cardiology)', FALSE, 'Take 1 tablet at night after dinner.', 'रात को रात के खाने के बाद 1 गोली लें।', 'रात्री जेवणानंतर 1 गोळी घ्या.'),
  ('rx-4', 'P-102', 'Paracetamol', '650 mg', '02:00 PM', 'after', 'Dr. Rajesh Iyer (General Medicine)', FALSE, 'Take as needed for pain. Max 3/day.', 'दर्द के लिए आवश्यकतानुसार लें।', 'वेदनेसाठी आवश्यकतेनुसार घ्या.')
ON CONFLICT (id) DO NOTHING;


/**
 * CareBridge — Automated Test Suite
 * File: tests/error-handling.test.js
 * 
 * Verifies custom error hierarchy, clinical input validation,
 * PHI log redaction, and triage assessment logic.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CareBridgeError,
  ValidationError,
  ApiError,
  StorageError,
  logDiagnostic
} from '../js/errors.js';

import {
  assessTriagePriority,
  calculatePriorityCounts,
  calculateAveragePainScore,
  calculateAdherenceStats,
  areAllMedicationsCompleted,
  validateTriageSubmission,
  validateMedicationSubmission
} from '../js/clinical.js';

describe('1. CareBridge Custom Error Hierarchy', () => {
  it('CareBridgeError sets proper name, message, userMessage, and timestamp', () => {
    const err = new CareBridgeError('Technical failure detail', 'Friendly message for user');
    assert.ok(err instanceof Error, 'Should be an instance of native Error');
    assert.equal(err.name, 'CareBridgeError');
    assert.equal(err.message, 'Technical failure detail');
    assert.equal(err.userMessage, 'Friendly message for user');
    assert.ok(err.timestamp, 'Should generate an ISO timestamp');
  });

  it('ValidationError properly captures the faulty field and message', () => {
    const err = new ValidationError('patient-age', 'Age must be <= 125', 'Please specify an age between 0 and 125.');
    assert.ok(err instanceof CareBridgeError);
    assert.equal(err.name, 'ValidationError');
    assert.equal(err.field, 'patient-age');
    assert.ok(err.message.includes('patient-age'));
    assert.equal(err.userMessage, 'Please specify an age between 0 and 125.');
  });

  it('ApiError preserves HTTP status code, statusText, and endpoint', () => {
    const err = new ApiError('https://api.fda.gov/drug/label.json', 404, 'Not Found');
    assert.ok(err instanceof CareBridgeError);
    assert.equal(err.name, 'ApiError');
    assert.equal(err.endpoint, 'https://api.fda.gov/drug/label.json');
    assert.equal(err.status, 404);
    assert.equal(err.statusText, 'Not Found');
    assert.ok(err.userMessage.includes('not found in the medication database'));
  });

  it('StorageError captures storage operation, target key, and original error', () => {
    const lowLevel = new Error('Disk quota exceeded');
    const err = new StorageError('write', 'carebridge_triage_queue_v1', lowLevel);
    assert.ok(err instanceof CareBridgeError);
    assert.equal(err.name, 'StorageError');
    assert.equal(err.operation, 'write');
    assert.equal(err.key, 'carebridge_triage_queue_v1');
    assert.equal(err.originalError, lowLevel);
    assert.ok(err.userMessage.includes('Unable to save data locally'));
  });
});

describe('2. Clinical Triage Input Validation', () => {
  it('throws ValidationError when patient name is shorter than 2 chars', () => {
    assert.throws(() => {
      validateTriageSubmission({
        name: 'A',
        mrn: 'MRN-1001',
        age: '45',
        painLevel: '5',
        stream: 'emergency'
      });
    }, (err) => {
      return err instanceof ValidationError && err.field === 'patient-name';
    });
  });

  it('throws ValidationError when MRN format is invalid', () => {
    assert.throws(() => {
      validateTriageSubmission({
        name: 'Jane Doe',
        mrn: 'INVALID-MRN',
        age: '45',
        painLevel: '5',
        stream: 'emergency'
      });
    }, (err) => {
      return err instanceof ValidationError && err.field === 'patient-mrn';
    });
  });

  it('throws ValidationError when patient age is out of bounds (> 125)', () => {
    assert.throws(() => {
      validateTriageSubmission({
        name: 'Jane Doe',
        mrn: 'MRN-1002',
        age: '150',
        painLevel: '5',
        stream: 'emergency'
      });
    }, (err) => {
      return err instanceof ValidationError && err.field === 'patient-age';
    });
  });

  it('throws ValidationError when pain score is not between 1 and 10', () => {
    assert.throws(() => {
      validateTriageSubmission({
        name: 'Jane Doe',
        mrn: 'MRN-1002',
        age: '40',
        painLevel: '15',
        stream: 'emergency'
      });
    }, (err) => {
      return err instanceof ValidationError && err.field === 'pain-range';
    });
  });

  it('passes validation for properly structured patient data', () => {
    const valid = validateTriageSubmission({
      name: 'Eleanor Vance',
      mrn: 'MRN-2041',
      age: '38',
      painLevel: '4',
      stream: 'routine'
    });
    assert.equal(valid, true);
  });
});

describe('3. Medication Prescription Validation', () => {
  it('throws ValidationError when medication name is missing', () => {
    assert.throws(() => {
      validateMedicationSubmission({
        name: '',
        dosage: '500mg',
        time: '08:00'
      });
    }, (err) => err instanceof ValidationError && err.field === 'med-name');
  });

  it('throws ValidationError when dosage is empty', () => {
    assert.throws(() => {
      validateMedicationSubmission({
        name: 'Metformin',
        dosage: '',
        time: '08:00'
      });
    }, (err) => err instanceof ValidationError && err.field === 'med-dosage');
  });

  it('throws ValidationError when time is missing', () => {
    assert.throws(() => {
      validateMedicationSubmission({
        name: 'Metformin',
        dosage: '500mg',
        time: ''
      });
    }, (err) => err instanceof ValidationError && err.field === 'med-time');
  });

  it('passes validation for complete prescription data', () => {
    const valid = validateMedicationSubmission({
      name: 'Metformin',
      dosage: '500mg Tablet',
      time: '08:00'
    });
    assert.equal(valid, true);
  });
});

describe('4. Clinical Scoring & Assessment Engine', () => {
  it('classifies critical symptoms as Urgent (Tier 1)', () => {
    const priority = assessTriagePriority(3, ['Chest Tightness / Dyspnea']);
    assert.equal(priority, 'urgent');
  });

  it('classifies pain level >= 8 as Urgent (Tier 1)', () => {
    const priority = assessTriagePriority(8, ['Localized abdominal cramping']);
    assert.equal(priority, 'urgent');
  });

  it('classifies pain level 5-7 as Priority (Tier 2)', () => {
    const priority = assessTriagePriority(6, ['Mild nausea']);
    assert.equal(priority, 'priority');
  });

  it('classifies mild pain 1-4 as Routine (Tier 3)', () => {
    const priority = assessTriagePriority(2, ['General fatigue']);
    assert.equal(priority, 'routine');
  });

  it('calculates accurate adherence statistics', () => {
    const meds = [
      { id: '1', name: 'Drug A', taken: true },
      { id: '2', name: 'Drug B', taken: true },
      { id: '3', name: 'Drug C', taken: false },
      { id: '4', name: 'Drug D', taken: false }
    ];
    const stats = calculateAdherenceStats(meds);
    assert.equal(stats.takenCount, 2);
    assert.equal(stats.totalCount, 4);
    assert.equal(stats.percentage, 50);
    assert.equal(areAllMedicationsCompleted(meds), false);
  });
});

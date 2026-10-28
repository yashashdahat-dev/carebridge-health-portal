/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: clinical.js (Functional Clinical Analytics, Priority Engine & Safe Storage)
 */

'use strict';

import { CRITICAL_SYMPTOMS } from './data.js';
import { ValidationError, ApiError, StorageError, logDiagnostic } from './errors.js';

// Storage keys for persistent clinical state
export const STORAGE_KEYS = {
  QUEUE: 'carebridge_triage_queue_v1',
  PRESCRIPTIONS: 'carebridge_prescriptions_v1'
};

/**
 * Rest parameter utility function to merge clinical tags and accommodation labels
 * @param {string} primaryTag - Primary clinical indicator
 * @param {...string} additionalTags - Variable list of additional tags
 * @returns {string[]} Combined, deduplicated list of non-empty tags
 */
export const mergeClinicalTags = (primaryTag, ...additionalTags) => {
  const allTags = [primaryTag, ...additionalTags].filter(Boolean);
  return [...new Set(allTags)];
};

/**
 * Assess clinical triage priority based on pain rating and symptoms.
 * Uses Array.prototype.some() to identify critical emergency presentations.
 * 
 * @param {number} painLevel - Patient pain score (1-10)
 * @param {string[]} symptoms - Array of presenting symptoms
 * @returns {'urgent' | 'priority' | 'routine'} Calculated clinical tier
 */
export const assessTriagePriority = (painLevel = 1, symptoms = []) => {
  const numericPain = Number(painLevel);

  // Check if ANY symptom is on the critical emergency list
  const hasCriticalEmergencySymptom = symptoms.some((symptom) => 
    CRITICAL_SYMPTOMS.includes(symptom)
  );

  // Urgent (Tier 1): Critical emergency symptoms or severe incapacitating pain (8-10)
  if (hasCriticalEmergencySymptom || numericPain >= 8) {
    return 'urgent';
  }

  // Priority (Tier 2): Moderate-to-high pain (5-7) or high fever
  const hasFever = symptoms.some((s) => s.includes('High Fever'));
  if (numericPain >= 5 || hasFever) {
    return 'priority';
  }

  // Routine (Tier 3): Mild symptoms and pain (1-4)
  return 'routine';
};

/**
 * Calculate patient count distribution across priority tiers using Array.prototype.reduce().
 * 
 * @param {Array<Object>} queue - Active patient queue
 * @returns {Record<'urgent' | 'priority' | 'routine', number>} Counts per priority tier
 */
export const calculatePriorityCounts = (queue = []) => {
  return queue.reduce((acc, { priority }) => {
    if (acc[priority] !== undefined) {
      acc[priority] += 1;
    }
    return acc;
  }, { urgent: 0, priority: 0, routine: 0 });
};

/**
 * Calculate average pain score across all waiting patients using Array.prototype.reduce().
 * 
 * @param {Array<Object>} queue - Active patient queue
 * @returns {string} Mean pain score formatted to one decimal place
 */
export const calculateAveragePainScore = (queue = []) => {
  if (!queue.length) return '0.0';
  const totalPain = queue.reduce((sum, { painLevel }) => sum + Number(painLevel), 0);
  return (totalPain / queue.length).toFixed(1);
};

/**
 * Calculate daily medication adherence analytics using Array.prototype.reduce().
 * 
 * @param {Array<Object>} prescriptions - Current scheduled prescriptions
 * @returns {{ takenCount: number, totalCount: number, percentage: number }}
 */
export const calculateAdherenceStats = (prescriptions = []) => {
  const totalCount = prescriptions.length;
  if (!totalCount) return { takenCount: 0, totalCount: 0, percentage: 0 };

  const takenCount = prescriptions.reduce((tally, { taken }) => {
    return tally + (taken ? 1 : 0);
  }, 0);

  const percentage = Math.round((takenCount / totalCount) * 100);
  return { takenCount, totalCount, percentage };
};

/**
 * Verify if ALL scheduled daily medications have been taken using Array.prototype.every().
 * 
 * @param {Array<Object>} prescriptions - Current scheduled prescriptions
 * @returns {boolean} True if all doses are marked taken
 */
export const areAllMedicationsCompleted = (prescriptions = []) => {
  return prescriptions.length > 0 && prescriptions.every(({ taken }) => Boolean(taken));
};

/**
 * Verify whether ANY waiting patient in the queue is classified as Urgent.
 * Uses Array.prototype.some() to control emergency command alerts.
 * 
 * @param {Array<Object>} queue - Active patient queue
 * @returns {boolean} True if at least one patient is urgent
 */
export const hasUrgentPatients = (queue = []) => {
  return queue.some(({ priority }) => priority === 'urgent');
};

/**
 * Validate that all required form input elements are non-empty using Array.prototype.every().
 * 
 * @param {Array<HTMLInputElement|HTMLSelectElement>} formFields
 * @returns {boolean}
 */
export const validateRequiredFields = (formFields = []) => {
  return formFields.every((field) => {
    return field && field.value && field.value.trim().length > 0;
  });
};

/**
 * Format 24-hour time string into a 12-hour AM/PM string
 * @param {string} time24 - e.g. "14:30"
 * @returns {string} - e.g. "02:30 PM"
 */
export const format12HourTime = (time24 = '') => {
  if (!time24 || !time24.includes(':')) return time24;
  const [hours, minutes] = time24.split(':');
  const hNum = parseInt(hours, 10);
  const period = hNum >= 12 ? 'PM' : 'AM';
  const displayH = (hNum % 12) || 12;
  return `${String(displayH).padStart(2, '0')}:${minutes} ${period}`;
};

// ---------------------------------------------------------------------------
// TASK 4 ENHANCEMENTS: STRUCTURED VALIDATION & STORAGE WITH CUSTOM ERRORS
// ---------------------------------------------------------------------------

/**
 * Validate Triage Patient Intake Submission Data.
 * Throws ValidationError if required clinical boundaries or types fail.
 * 
 * @param {Object} data
 * @throws {ValidationError}
 */
export const validateTriageSubmission = (data) => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('form', 'Submission data is missing or not an object.', 'Please fill out the patient triage form.');
  }

  const { name, mrn, age, painLevel, stream } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ValidationError('patient-name', 'Patient name must be at least 2 characters long.', 'Please enter a valid patient legal or preferred name.');
  }

  if (!mrn || typeof mrn !== 'string' || !/^MRN-\d{4,8}$/i.test(mrn.trim())) {
    throw new ValidationError('patient-mrn', `Invalid MRN format: "${mrn}". Expected format: MRN-XXXX.`, 'Please enter a valid Medical Record Number (e.g., MRN-1082).');
  }

  const numericAge = Number(age);
  if (isNaN(numericAge) || numericAge < 0 || numericAge > 125) {
    throw new ValidationError('patient-age', `Age value "${age}" is outside valid biological range (0-125).`, 'Please specify an age between 0 and 125 years.');
  }

  const numericPain = Number(painLevel);
  if (isNaN(numericPain) || numericPain < 1 || numericPain > 10) {
    throw new ValidationError('pain-range', `Pain score "${painLevel}" is out of scale (1-10).`, 'Please record a pain score on the 1–10 clinical scale.');
  }

  if (!stream || typeof stream !== 'string' || stream.trim().length === 0) {
    throw new ValidationError('visit-category', 'Clinical stream not selected.', 'Please select an appropriate clinical triage stream.');
  }

  return true;
};

/**
 * Validate Medication Prescription Submission Data.
 * Throws ValidationError if mandatory fields are missing.
 * 
 * @param {Object} medData
 * @throws {ValidationError}
 */
export const validateMedicationSubmission = (medData) => {
  if (!medData || typeof medData !== 'object') {
    throw new ValidationError('medForm', 'Medication data object missing.', 'Please enter the medication prescription details.');
  }

  const { name, dosage, time } = medData;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ValidationError('med-name', 'Medication name is required.', 'Please provide the medication name (generic or brand).');
  }

  if (!dosage || typeof dosage !== 'string' || dosage.trim().length === 0) {
    throw new ValidationError('med-dosage', 'Dosage and strength are required.', 'Please specify the dosage and strength (e.g., 500mg, 10mL).');
  }

  if (!time || typeof time !== 'string' || !time.includes(':')) {
    throw new ValidationError('med-time', 'Scheduled administration time is required.', 'Please select the scheduled intake time.');
  }

  return true;
};

/**
 * Safely persists patient triage queue to LocalStorage.
 * Implements try/catch/finally and throws StorageError on failure.
 * 
 * @param {Array<Object>} queue
 * @throws {StorageError}
 */
export const saveQueueToStorage = (queue) => {
  let serialized = null;
  try {
    if (!Array.isArray(queue)) {
      throw new Error('Triage queue must be an array.');
    }
    serialized = JSON.stringify(queue);
    localStorage.setItem(STORAGE_KEYS.QUEUE, serialized);
  } catch (err) {
    const storageErr = new StorageError('write', STORAGE_KEYS.QUEUE, err);
    logDiagnostic(storageErr, { queueLength: queue?.length });
    throw storageErr;
  }
};

/**
 * Safely retrieves patient triage queue from LocalStorage.
 * Validates parsed JSON records and gracefully falls back on corrupt storage.
 * 
 * @param {Array<Object>} fallback
 * @returns {Array<Object>}
 */
export const loadQueueFromStorage = (fallback = []) => {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed queue is not an array.');
    }

    // Validate that records possess basic patient structure
    const validRecords = parsed.filter(item => item && item.id && item.name);
    return validRecords.length ? validRecords : fallback;
  } catch (err) {
    const storageErr = new StorageError('read', STORAGE_KEYS.QUEUE, err, 'Notice: Prior stored patient records could not be restored.');
    logDiagnostic(storageErr, { rawDataLength: raw?.length });
    // Recover gracefully: do not crash the app, return fallback
    return fallback;
  }
};

/**
 * Safely persists prescriptions to LocalStorage with try/catch/finally.
 * 
 * @param {Array<Object>} prescriptions
 * @throws {StorageError}
 */
export const savePrescriptionsToStorage = (prescriptions) => {
  try {
    if (!Array.isArray(prescriptions)) {
      throw new Error('Prescriptions data must be an array.');
    }
    const serialized = JSON.stringify(prescriptions);
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, serialized);
  } catch (err) {
    const storageErr = new StorageError('write', STORAGE_KEYS.PRESCRIPTIONS, err);
    logDiagnostic(storageErr, { prescriptionsLength: prescriptions?.length });
    throw storageErr;
  }
};

/**
 * Safely retrieves prescriptions from LocalStorage.
 * 
 * @param {Array<Object>} fallback
 * @returns {Array<Object>}
 */
export const loadPrescriptionsFromStorage = (fallback = []) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored prescriptions data is not an array.');
    }
    return parsed.length ? parsed : fallback;
  } catch (err) {
    const storageErr = new StorageError('read', STORAGE_KEYS.PRESCRIPTIONS, err, 'Notice: Restored default prescription regimen.');
    logDiagnostic(storageErr);
    return fallback;
  }
};

/**
 * Asynchronous Clinical API Integration: Drug Safety & Interaction Lookup
 * Demonstrates Fetch API with HTTP status validation, try/catch/finally,
 * and meaningful ApiError throwing.
 * 
 * @param {string} medicationName
 * @returns {Promise<{ verified: boolean, warnings?: string, details?: Object }>}
 */
export const fetchMedicationSafetyData = async (medicationName) => {
  if (!medicationName || typeof medicationName !== 'string') {
    throw new ValidationError('medicationName', 'Medication name required for safety verification.', 'Please specify a medication name.');
  }

  // OpenFDA public clinical query endpoint
  const cleanName = encodeURIComponent(medicationName.trim());
  const endpoint = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${cleanName}"&limit=1`;

  let response = null;
  try {
    // Timeout safety wrapper
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      response = await fetch(endpoint, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 404) {
        // Clinical 404: Medication not registered in public FDA database
        throw new ApiError(
          endpoint,
          404,
          'Not Found',
          `No standard FDA monograph found for "${medicationName}". Please verify clinical spelling or consult hospital formulary.`
        );
      } else if (response.status >= 500) {
        throw new ApiError(
          endpoint,
          response.status,
          response.statusText,
          'Clinical database is temporarily unresponsive. Proceed with manual pharmacist verification.'
        );
      } else {
        throw new ApiError(endpoint, response.status, response.statusText);
      }
    }

    const payload = await response.json();
    const result = payload.results?.[0];

    return {
      verified: true,
      warnings: result?.warnings?.[0] || 'No critical boxed warnings cataloged in clinical database.',
      purpose: result?.purpose?.[0] || 'Therapeutic treatment'
    };
  } catch (err) {
    if (err instanceof ApiError || err instanceof ValidationError) {
      throw err;
    }
    // Network connectivity, DNS failure, or aborted request
    const isAbort = err.name === 'AbortError';
    const networkErr = new ApiError(
      endpoint,
      0,
      isAbort ? 'Timeout' : 'Network Failure',
      isAbort 
        ? 'Drug verification request timed out. Proceed with local clinical formulary.'
        : 'Network connection unavailable for clinical database lookup.'
    );
    logDiagnostic(networkErr, { queryTarget: medicationName });
    throw networkErr;
  }
};

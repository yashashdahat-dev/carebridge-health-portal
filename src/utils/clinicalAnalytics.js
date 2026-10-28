/**
 * CareBridge — Functional Clinical Analytics & Calculations
 * File: src/utils/clinicalAnalytics.js
 */

import { CRITICAL_SYMPTOMS } from '../data/initialData.js';
import { ValidationError, ApiError, logDiagnostic } from './errors.js';

export const mergeClinicalTags = (primaryTag, ...additionalTags) => {
  const allTags = [primaryTag, ...additionalTags].filter(Boolean);
  return [...new Set(allTags)];
};

export const assessTriagePriority = (painLevel = 1, symptoms = []) => {
  const numericPain = Number(painLevel);
  const hasCriticalEmergencySymptom = symptoms.some((symptom) => 
    CRITICAL_SYMPTOMS.includes(symptom)
  );

  if (hasCriticalEmergencySymptom || numericPain >= 8) {
    return 'urgent';
  }

  const hasFever = symptoms.some((s) => s.includes('High Fever'));
  if (numericPain >= 5 || hasFever) {
    return 'priority';
  }

  return 'routine';
};

export const calculatePriorityCounts = (queue = []) => {
  return queue.reduce((acc, { priority }) => {
    if (acc[priority] !== undefined) {
      acc[priority] += 1;
    }
    return acc;
  }, { urgent: 0, priority: 0, routine: 0 });
};

export const calculateAveragePainScore = (queue = []) => {
  if (!queue.length) return '0.0';
  const totalPain = queue.reduce((sum, { painLevel }) => sum + Number(painLevel), 0);
  return (totalPain / queue.length).toFixed(1);
};

export const calculateAdherenceStats = (prescriptions = []) => {
  const totalCount = prescriptions.length;
  if (!totalCount) return { takenCount: 0, totalCount: 0, percentage: 0 };

  const takenCount = prescriptions.reduce((tally, { taken }) => {
    return tally + (taken ? 1 : 0);
  }, 0);

  const percentage = Math.round((takenCount / totalCount) * 100);
  return { takenCount, totalCount, percentage };
};

export const areAllMedicationsCompleted = (prescriptions = []) => {
  return prescriptions.length > 0 && prescriptions.every(({ taken }) => Boolean(taken));
};

export const hasUrgentPatients = (queue = []) => {
  return queue.some(({ priority }) => priority === 'urgent');
};

export const format12HourTime = (time24 = '') => {
  if (!time24 || !time24.includes(':')) return time24;
  const [hours, minutes] = time24.split(':');
  const hNum = parseInt(hours, 10);
  const period = hNum >= 12 ? 'PM' : 'AM';
  const displayH = (hNum % 12) || 12;
  return `${String(displayH).padStart(2, '0')}:${minutes} ${period}`;
};

export const validateTriageSubmission = (data) => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('form', 'Submission data is missing or not an object.', 'Please fill out the patient triage form.');
  }

  const { name, mrn, age, painLevel, stream } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ValidationError('name', 'Patient name must be at least 2 characters long.', 'Please enter a valid patient legal or preferred name.');
  }

  if (!mrn || typeof mrn !== 'string' || !/^MRN-\d{4,8}$/i.test(mrn.trim())) {
    throw new ValidationError('mrn', `Invalid MRN format: "${mrn}". Expected format: MRN-XXXX.`, 'Please enter a valid Medical Record Number (e.g., MRN-1082).');
  }

  const numericAge = Number(age);
  if (isNaN(numericAge) || numericAge < 0 || numericAge > 125) {
    throw new ValidationError('age', `Age value "${age}" is outside valid biological range (0-125).`, 'Please specify an age between 0 and 125 years.');
  }

  const numericPain = Number(painLevel);
  if (isNaN(numericPain) || numericPain < 1 || numericPain > 10) {
    throw new ValidationError('pain', `Pain score "${painLevel}" is out of scale (1-10).`, 'Please record a pain score on the 1–10 clinical scale.');
  }

  if (!stream || typeof stream !== 'string' || stream.trim().length === 0) {
    throw new ValidationError('stream', 'Clinical stream not selected.', 'Please select an appropriate clinical triage stream.');
  }

  return true;
};

export const validateMedicationSubmission = (medData) => {
  if (!medData || typeof medData !== 'object') {
    throw new ValidationError('medForm', 'Medication data object missing.', 'Please enter the medication prescription details.');
  }

  const { name, dosage, time } = medData;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ValidationError('name', 'Medication name is required.', 'Please provide the medication name (generic or brand).');
  }

  if (!dosage || typeof dosage !== 'string' || dosage.trim().length === 0) {
    throw new ValidationError('dosage', 'Dosage and strength are required.', 'Please specify the dosage and strength (e.g., 500mg, 10mL).');
  }

  if (!time || typeof time !== 'string' || !time.includes(':')) {
    throw new ValidationError('time', 'Scheduled administration time is required.', 'Please select the scheduled intake time.');
  }

  return true;
};

export const fetchMedicationSafetyData = async (medicationName) => {
  if (!medicationName || typeof medicationName !== 'string') {
    throw new ValidationError('medicationName', 'Medication name required for safety verification.', 'Please specify a medication name.');
  }

  const cleanName = encodeURIComponent(medicationName.trim());
  const endpoint = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${cleanName}"&limit=1`;

  let response = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      response = await fetch(endpoint, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      if (response.status === 404) {
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

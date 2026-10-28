/**
 * CareBridge — Client API Service & Network Layer
 * File: src/services/api.js
 * 
 * Implements:
 * - Asynchronous fetch requests for patients, prescriptions, and clinical analytics (Task 03)
 * - Custom error classes for validation and network errors (Task 04)
 * - Safe base URL resolution with fallback for Vite proxy and direct Express port
 */

const API_BASE = (typeof window !== 'undefined' && window.__CAREBRIDGE_API_URL__) 
  || import.meta.env?.VITE_API_BASE 
  || '/api';

/**
 * Custom ValidationError class (PDF Page 10)
 */
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

/**
 * Custom ApiError class (Task 04)
 */
export class ApiError extends Error {
  constructor(message, status = 500, endpoint = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * Fetch patient triage queue (PDF Page 9)
 */
export async function fetchPatients(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/v1/patients${query ? `?${query}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(`Failed to fetch patients: ${res.statusText}`, res.status, url);
  }
  return res.json();
}

/**
 * Register a new triage patient
 */
export async function addPatientApi(patientData) {
  if (!patientData.name || patientData.name.trim().length < 2) {
    throw new ValidationError('name', 'Patient name must be at least 2 characters.');
  }

  const url = `${API_BASE}/v1/patients`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.message || `Error ${res.status}: Failed to register patient`, res.status, url);
  }

  return res.json();
}

/**
 * Discharge a patient from the queue
 */
export async function deletePatientApi(id) {
  const url = `${API_BASE}/v1/patients/${id}`;
  const res = await fetch(url, { method: 'DELETE' });

  if (!res.ok) {
    throw new ApiError(`Failed to discharge patient: ${res.statusText}`, res.status, url);
  }
  return res.json();
}

/**
 * Fetch prescription schedule
 */
export async function fetchPrescriptions() {
  const url = `${API_BASE}/v1/prescriptions`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new ApiError(`Failed to fetch prescriptions: ${res.statusText}`, res.status, url);
  }
  return res.json();
}

/**
 * Toggle medication adherence status
 */
export async function togglePrescriptionApi(id) {
  const url = `${API_BASE}/v1/prescriptions/${id}/toggle`;
  const res = await fetch(url, { method: 'PATCH' });

  if (!res.ok) {
    throw new ApiError(`Failed to toggle prescription: ${res.statusText}`, res.status, url);
  }
  return res.json();
}

/**
 * Fetch runtime system health
 */
export async function fetchHealth() {
  const url = `${API_BASE}/v1/health`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new ApiError(`Failed to fetch health metrics: ${res.statusText}`, res.status, url);
  }
  return res.json();
}

export default {
  fetchPatients,
  addPatientApi,
  deletePatientApi,
  fetchPrescriptions,
  togglePrescriptionApi,
  fetchHealth,
  ValidationError,
  ApiError
};

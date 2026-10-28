/**
 * CareBridge — Patient Triage & Multilingual Prescription Portal
 * Module: errors.js (Custom Clinical Error Hierarchy & PHI-Safe Logging)
 * 
 * Provides domain-specific error classes extending the built-in Error class:
 * - CareBridgeError: Base application error with timestamp and sanitized context
 * - ValidationError: Form input, demographic, and clinical boundary violations
 * - ApiError: HTTP and network communication failures with status codes
 * - StorageError: LocalStorage quota, persistence, and serialization errors
 */

'use strict';

/**
 * Base CareBridge Application Error
 * All custom application errors inherit from this class.
 */
export class CareBridgeError extends Error {
  /**
   * @param {string} technicalMessage - Detailed technical error message for debugging
   * @param {string} userMessage - Safe, polite user-facing message displayed in UI
   * @param {Object} [context={}] - Non-PHI metadata for diagnostic tracing
   */
  constructor(technicalMessage, userMessage = 'An unexpected clinical system event occurred.', context = {}) {
    super(technicalMessage);
    this.name = 'CareBridgeError';
    this.userMessage = userMessage;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error for Form Inputs and Clinical Boundaries
 * Thrown when required fields are missing, out-of-range, or malformed.
 */
export class ValidationError extends CareBridgeError {
  /**
   * @param {string} field - The form input or data key that failed validation
   * @param {string} technicalMessage - Why validation failed
   * @param {string} userMessage - Accessible instruction for the clinician
   */
  constructor(field, technicalMessage, userMessage) {
    const userDisplay = userMessage || `Please verify the ${field} field.`;
    super(`Validation failed for [${field}]: ${technicalMessage}`, userDisplay, { field });
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * API Error for Network Requests and Clinical Endpoints
 * Includes HTTP status codes, status text, and requested endpoint.
 */
export class ApiError extends CareBridgeError {
  /**
   * @param {string} endpoint - The requested URL or service name
   * @param {number} status - HTTP status code (e.g. 404, 500, or 0 for network drop)
   * @param {string} statusText - HTTP status description (e.g. 'Not Found', 'Internal Error')
   * @param {string} [userMessage] - User-friendly status message
   */
  constructor(endpoint, status = 0, statusText = 'Network Error', userMessage = '') {
    let defaultUserMsg = 'Clinical network service is currently unreachable. Please verify connection.';
    if (status === 404) {
      defaultUserMsg = 'Requested clinical record was not found in the medication database.';
    } else if (status === 429) {
      defaultUserMsg = 'Too many requests. Please wait a moment before trying again.';
    } else if (status >= 500) {
      defaultUserMsg = 'The clinical database server encountered an internal issue. Please try again shortly.';
    }

    super(
      `API failure at [${endpoint}] - Status: ${status} (${statusText})`,
      userMessage || defaultUserMsg,
      { endpoint, status, statusText }
    );
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Storage Error for LocalStorage, Cache, and State Serialization
 * Thrown on quota exhaustion, disabled storage, or corrupt JSON structures.
 */
export class StorageError extends CareBridgeError {
  /**
   * @param {'read' | 'write' | 'clear' | 'parse'} operation - Storage operation
   * @param {string} key - Storage key target
   * @param {Error|null} [originalError=null] - Low-level underlying exception
   * @param {string} [userMessage] - User-facing warning
   */
  constructor(operation, key, originalError = null, userMessage = '') {
    const defaultUserMsg = operation === 'write'
      ? 'Unable to save data locally. Device storage may be full or blocked.'
      : 'Unable to retrieve saved patient data from your browser storage.';
    super(
      `LocalStorage ${operation} failed on key "${key}": ${originalError?.message || 'Unknown error'}`,
      userMessage || defaultUserMsg,
      { operation, key, originalErrorName: originalError?.name }
    );
    this.name = 'StorageError';
    this.operation = operation;
    this.key = key;
    this.originalError = originalError;
  }
}

/**
 * Diagnostic Console Logger with Protected Health Information (PHI) Redaction
 * 
 * CRITICAL CLINICAL RULE: Never log patient identifiable information (Name, MRN,
 * phone numbers, raw notes, full symptom texts) to the browser developer console.
 * 
 * @param {Error} error - Error instance
 * @param {Object} [diagnosticContext={}] - Additional non-PHI metadata
 */
export const logDiagnostic = (error, diagnosticContext = {}) => {
  // Sanitize and redact sensitive clinical/patient keys
  const safeContext = { ...diagnosticContext };
  const SENSITIVE_PHI_KEYS = [
    'name', 'patientName', 'mrn', 'tel', 'phone', 'notes', 'symptoms',
    'dob', 'age', 'patient', 'doctor', 'allergies'
  ];

  SENSITIVE_PHI_KEYS.forEach((key) => {
    if (key in safeContext) {
      safeContext[key] = '[REDACTED_PHI]';
    }
  });

  console.groupCollapsed(
    `%c[CareBridge Diagnostics] ${error.name || 'Error'}: ${error.message || 'Unknown issue'}`,
    'color: #d9381e; font-weight: 700;'
  );
  console.info('Timestamp:', new Date().toISOString());
  console.info('Context:', safeContext);
  if (error.stack) {
    console.debug('Stack Trace:\n', error.stack);
  }
  console.groupEnd();
};

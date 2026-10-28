/**
 * CareBridge — Centralized Multi-Transport Application Logger
 * File: utils/logger.js
 * 
 * Demonstrates:
 * - Structured log levels (INFO, WARN, ERROR, DEBUG) (PDF Page 5)
 * - Multiple transports (Console + Persistent Log Files)
 * - HIPAA/PHI sanitization and redaction
 * - JSON and formatted line output
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const COMBINED_LOG = path.join(LOGS_DIR, 'combined.log');
const ERROR_LOG = path.join(LOGS_DIR, 'error.log');

/**
 * Redacts Protected Health Information (PHI) from log objects
 */
export function redactPHI(data) {
  if (!data || typeof data !== 'object') return data;
  const clone = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(clone)) {
    if (/^(tel|phone|mobile)$/i.test(key)) {
      clone[key] = '[REDACTED_PHONE]';
    } else if (/^(name|fullName|patientName)$/i.test(key)) {
      clone[key] = typeof clone[key] === 'string' ? `${clone[key].slice(0, 1)}***` : '[REDACTED]';
    } else if (/^(mrn)$/i.test(key)) {
      clone[key] = typeof clone[key] === 'string' ? `${clone[key].slice(0, 4)}****` : '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = redactPHI(clone[key]);
    }
  }

  return clone;
}

/**
 * Appends formatted entry to log file asynchronously
 */
function appendToFile(filePath, entry) {
  fs.appendFile(filePath, entry + '\n', 'utf8', (err) => {
    if (err) console.error('[LOGGER FILE WRITE ERROR]', err);
  });
}

class Logger {
  formatEntry(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = redactPHI(meta);
    const metaString = Object.keys(sanitizedMeta).length ? ` ${JSON.stringify(sanitizedMeta)}` : '';
    return {
      timestamp,
      level,
      message,
      meta: sanitizedMeta,
      formatted: `[${timestamp}] [${level}] ${message}${metaString}`
    };
  }

  info(message, meta = {}) {
    const entry = this.formatEntry('INFO', message, meta);
    console.log(`\x1b[32m[INFO]\x1b[0m ${entry.formatted}`);
    appendToFile(COMBINED_LOG, entry.formatted);
  }

  warn(message, meta = {}) {
    const entry = this.formatEntry('WARN', message, meta);
    console.warn(`\x1b[33m[WARN]\x1b[0m ${entry.formatted}`);
    appendToFile(COMBINED_LOG, entry.formatted);
  }

  error(message, meta = {}) {
    const entry = this.formatEntry('ERROR', message, meta);
    console.error(`\x1b[31m[ERROR]\x1b[0m ${entry.formatted}`);
    appendToFile(COMBINED_LOG, entry.formatted);
    appendToFile(ERROR_LOG, entry.formatted);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const entry = this.formatEntry('DEBUG', message, meta);
      console.log(`\x1b[36m[DEBUG]\x1b[0m ${entry.formatted}`);
      appendToFile(COMBINED_LOG, entry.formatted);
    }
  }
}

export const logger = new Logger();
export default logger;


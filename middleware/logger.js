/**
 * CareBridge — Clinical Request Logger Middleware
 * File: middleware/logger.js
 * 
 * Demonstrates:
 * - Custom Express middleware (req, res, next)
 * - Response time tracking
 * - Safe logging with HIPAA/PHI redaction
 */

export function clinicalLogger(req, res, next) {
  const start = Date.now();

  // Log on response completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // PHI redaction: sanitize sensitive query strings if present
    const sanitizedUrl = url.replace(/(tel|phone|mrn|name)=[^&]+/gi, '$1=[REDACTED]');

    // Status category coloring / logging
    const logMessage = `[${new Date().toISOString()}] ${method} ${sanitizedUrl} -> ${statusCode} (${duration}ms)`;
    
    if (statusCode >= 500) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${logMessage}`);
    } else if (statusCode >= 400) {
      console.warn(`\x1b[33m[WARN]\x1b[0m ${logMessage}`);
    } else {
      console.log(`\x1b[32m[INFO]\x1b[0m ${logMessage}`);
    }
  });

  next();
}

export default clinicalLogger;

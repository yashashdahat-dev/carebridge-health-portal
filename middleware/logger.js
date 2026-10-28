/**
 * CareBridge — Clinical Request Logger Middleware
 * File: middleware/logger.js
 * 
 * Demonstrates:
 * - Express request logger middleware (req, res, next)
 * - Integration with multi-transport centralized logger (PDF Page 5)
 * - Safe logging with HIPAA/PHI redaction
 */

import logger, { redactPHI } from '../utils/logger.js';

export function clinicalLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // PHI redaction: sanitize sensitive query strings if present
    const sanitizedUrl = url.replace(/(tel|phone|mrn|name)=[^&]+/gi, '$1=[REDACTED]');

    const meta = {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      durationMs: duration
    };

    const message = `${method} ${sanitizedUrl} -> ${statusCode} (${duration}ms)`;

    if (statusCode >= 500) {
      logger.error(message, meta);
    } else if (statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  });

  next();
}

export default clinicalLogger;

/**
 * CareBridge — Dedicated Request Logger Middleware
 * File: middleware/requestLogger.js
 * Reference: PDF Page 16
 */

export function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

export default requestLogger;

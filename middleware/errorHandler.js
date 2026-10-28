/**
 * CareBridge — Centralized Error Handling Middleware
 * File: middleware/errorHandler.js
 * 
 * Demonstrates:
 * - 4-argument Express error middleware (err, req, res, next)
 * - Safe error stack inspection based on process.env.NODE_ENV
 * - Standardized JSON error response
 */

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Redacted console diagnostic
  console.error(`[EXPRESS ERROR] ${err.name || 'Error'}: ${err.message}`);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected clinical server error occurred.',
    statusCode,
    timestamp: new Date().toISOString(),
    // Include stack trace only in development mode (PDF Page 11)
    ...(!isProduction && { stack: err.stack })
  });
}

export default errorHandler;

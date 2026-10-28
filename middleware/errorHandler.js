/**
 * CareBridge — Centralized Error Handling Middleware
 * File: middleware/errorHandler.js
 * 
 * Demonstrates:
 * - 4-argument Express error middleware (err, req, res, next) (PDF Page 4-5)
 * - Safe error stack inspection based on process.env.NODE_ENV
 * - Centralized logging via multi-transport logger (logs/error.log)
 * - Standardized JSON error response with appropriate HTTP status codes
 */

import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error with stack trace to centralized logger
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    statusCode,
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected clinical server error occurred.',
    statusCode,
    field: err.field,
    timestamp: new Date().toISOString(),
    // Include stack trace only in development mode (PDF Page 5 & 11)
    ...(!isProduction && { stack: err.stack })
  });
}

export default errorHandler;

/**
 * CareBridge — 404 Route Not Found Middleware
 * File: middleware/notFound.js
 * Reference: PDF Page 17
 */

export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Resource ${req.method} ${req.originalUrl} not found.`,
    statusCode: 404
  });
}

export default notFound;

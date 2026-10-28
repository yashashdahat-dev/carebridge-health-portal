/**
 * CareBridge — Server Entry Point
 * File: server.js
 * 
 * Demonstrates:
 * - process.env (PORT, NODE_ENV)
 * - process.argv (CLI argument parsing)
 * - app.listen(port, callback)
 * - Graceful shutdown handling (SIGINT, SIGTERM)
 * 
 * Reference: PDF Page 3, 4, 10, 11, 12.
 */

import app from './app.js';

// 1. Process Environment Variables and CLI Argument Parsing (PDF Page 3, 4)
function getPort() {
  // Check CLI arguments for --port <num> or -p <num>
  const args = process.argv.slice(2);
  const portIndex = args.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const parsed = parseInt(args[portIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }

  // Fallback to environment variable or default 5000
  return parseInt(process.env.PORT, 10) || 5000;
}

const PORT = getPort();
const NODE_ENV = process.env.NODE_ENV || 'development';

// 2. Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  CareBridge Clinical Portal — Express Server Started `);
  console.log(`======================================================`);
  console.log(`  Local URL:        http://localhost:${PORT}`);
  console.log(`  Health Check:     http://localhost:${PORT}/api/health`);
  console.log(`  API Directory:    http://localhost:${PORT}/api`);
  console.log(`  Runtime Engine:   Node.js ${process.version} (PID: ${process.pid})`);
  console.log(`  Environment:      ${NODE_ENV}`);
  console.log(`======================================================\n`);
});

// 3. Graceful Shutdown Signal Handling (PDF Page 3, 10, 11)
function handleShutdown(signal) {
  console.log(`\n[SIGNAL] Received ${signal}. Initiating graceful shutdown...`);
  
  // Stop accepting new incoming HTTP connections
  server.close((err) => {
    if (err) {
      console.error('[ERROR] Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('[SHUTDOWN] HTTP server connections closed successfully.');
    console.log('[SHUTDOWN] Cleaning up database and file handles...');
    process.exit(0);
  });

  // Force shutdown if cleanup hangs for more than 10 seconds
  setTimeout(() => {
    console.error('[SHUTDOWN TIMEOUT] Could not close connections in time, forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

// Listen for termination signals
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;


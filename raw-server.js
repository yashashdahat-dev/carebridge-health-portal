/**
 * CareBridge — Native Raw Node.js HTTP Server (node:http)
 * File: raw-server.js
 * 
 * Demonstrates:
 * - Native node:http module without Express (http.createServer)
 * - Request object inspection (req.method, req.url)
 * - Response object methods (res.writeHead, res.setHeader, res.write, res.end)
 * - Stream piping (fs.createReadStream().pipe(res))
 * - Error handling (server.on('clientError'))
 * - HTTP Status codes (200, 400, 404, 500)
 * 
 * Reference: PDF Page 5-7.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.RAW_PORT, 10) || 5050;
const AUDIT_LOG_FILE = path.join(__dirname, 'data', 'audit.log');

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  console.log(`[RAW HTTP] ${method} ${pathname}`);

  // 1. Root diagnostic endpoint
  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('CareBridge Raw Node.js HTTP Server — Operating without framework abstractions.');
  }

  // 2. File Streaming Endpoint (PDF Page 6: fs.createReadStream + pipe)
  else if (method === 'GET' && pathname === '/file') {
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Audit file not found on disk');
      return;
    }

    const fileStream = fs.createReadStream(AUDIT_LOG_FILE);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline; filename="audit.log"'
    });

    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('[RAW FS ERROR]', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      res.end('Internal Server File Error');
    });
  }

  // 3. Raw JSON Health endpoint
  else if (method === 'GET' && pathname === '/api/raw-health') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    const body = JSON.stringify({
      server: 'Node.js Raw HTTP',
      version: process.version,
      pid: process.pid,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    res.end(body);
  }

  // 4. Route Not Found (404)
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: Cannot ${method} ${pathname}`);
  }
});

// Handle socket client error (PDF Page 6)
server.on('clientError', (err, socket) => {
  console.warn('[RAW CLIENT ERROR]', err.message);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(`Raw HTTP server running at http://localhost:${PORT}/`);
  console.log(`Try: http://localhost:${PORT}/file or http://localhost:${PORT}/api/raw-health`);
});

export default server;


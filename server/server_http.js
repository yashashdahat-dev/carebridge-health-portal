/**
 * CareBridge — Raw Node.js HTTP Server Example
 * File: server/server_http.js
 * Reference: PDF Page 10-11 (Task 08 Native Runtime Example)
 */

import http from 'node:http';

const PORT = process.env.HTTP_PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('CareBridge HTTP Server — Native Node.js Runtime (Task 08)');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Raw HTTP Server] Listening on port ${PORT} (http://localhost:${PORT})`);
  });
}

export default server;

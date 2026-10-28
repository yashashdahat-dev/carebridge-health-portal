# Task 08 — Node.js Runtime, Modules & Express.js Backend

This directory documents the server-side architecture and raw HTTP vs. Express comparison:

## Key Features
- **Node.js Runtime**: V8 execution engine, libuv event loop, non-blocking asynchronous I/O.
- **Core Modules**: `node:fs` (promises + streaming), `node:path`, `node:process` (env, argv, signals).
- **Raw HTTP Server (`raw-server.js`)**: Pure `node:http` server demonstrating manual routing, headers, status codes, and file streams without third-party frameworks.
- **Express.js Application (`app.js` & `server.js`)**: Declarative routing, middleware chaining (`helmet`, `cors`, body parsers, clinical logger), and centralized error handling.


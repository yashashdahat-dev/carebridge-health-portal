# CareBridge — NPM Package Manager & CLI Reference

This guide explains project dependencies, script hooks, and package manifest management in CareBridge.

---

## 1. Project Manifest Configuration

- **`package.json`**: Defines application metadata, runtime dependencies, devDependencies, and custom scripts.
- **`package-lock.json`**: Exact version snapshot with sha512 integrity hashes ensuring reproducible builds across all development environments.
- **`"type": "module"`**: Configures Node.js to interpret `.js` files as ES Modules (ESM) by default.

---

## 2. Dependencies vs. DevDependencies

### Runtime Dependencies (`dependencies`)
Required for application execution in browser and on server:
- `react` & `react-dom` (v19): Component engine.
- `react-router-dom`: Route navigation, `<NavLink>`, `<Outlet>`, `useParams`.
- `express` (v5): Web server framework.
- `helmet`: Security HTTP headers.
- `cors`: Cross-origin resource sharing.
- `styled-components`: Isolated CSS-in-JS demonstration.

### Development Dependencies (`devDependencies`)
Required only during local development and testing:
- `vite` & `@vitejs/plugin-react`: Hot module reloading bundler.
- `supertest`: HTTP assertions for backend API testing.
- `serve`: Static server for legacy fallback testing.

---

## 3. CLI Scripts Reference

| Command | Script Target | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts Vite React development server on port 3000 with HMR |
| `npm start` | `vite` | Standard start command alias |
| `npm run build` | `vite build` | Compiles optimized production bundle into `dist/` |
| `npm run preview` | `vite preview` | Previews production build locally |
| `npm run server` | `node server.js` | Launches Express backend API server on port 5000 |
| `npm run server:dev` | `node --watch server.js` | Launches backend with native Node 26 file watching |
| `npm run server:raw` | `node raw-server.js` | Runs native Node raw HTTP server demonstration on port 5050 |
| `npm test` | All test suites | Runs 36 client and server automated unit & integration tests |
| `npm run test:server` | `node --test tests/server.test.js` | Runs backend integration tests only |
| `npm run test:client` | `node --test tests/error-handling.test.js` | Runs client error handling tests only |
| `npm run audit` | `npm audit` | Scans dependencies for security vulnerabilities |


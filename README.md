# CareBridge — Patient Triage & Multilingual Prescription Reader (Full-Stack Edition)

A high-performance, accessible, full-stack clinical healthcare web portal designed as an authentic medical facility system. Built with **React 19**, **Vite**, **Context API**, **CSS Modules**, and a resilient **Node.js (v26 LTS) & Express Backend** utilizing core APIs (`node:fs/promises`, `node:path`, `node:process`, `node:http`), Helmet, CORS, and native streaming.

---

## Workspace Directory & File Manifest

All project files are organized in the `Healthcare/` root directory:

```text
Healthcare/
├── server.js            # Node.js Express server entry point (process.env.PORT, CLI args, graceful shutdown)
├── app.js               # Express app definition (Helmet, CORS, body-parser, clinical logger, error middleware)
├── raw-server.js        # Native Node.js raw HTTP server (http.createServer, streams, status codes)
├── index.html           # React HTML5 mount shell with accessible fonts and landmarks
├── vite.config.js       # Vite React bundler with /api proxy to http://localhost:5000
├── package.json         # NPM manifest with scripts for Vite and Express (Node 26 LTS)
├── package-lock.json    # Deterministic lockfile with integrity hashes
├── .gitignore           # Excludes node_modules/, dist/, .env, and logs
├── DEVELOPER.md         # Full In-Depth Guide (Node.js runtime, modules, HTTP, Express, Git, Tests)
├── legacy-index.html    # Standalone static HTML5 portal (preserved for fallback reference)
├── legacy-app.js        # Standalone monolithic legacy client script (preserved for fallback)
├── styles.css           # Global design tokens, CSS variables, and typography scale
├── routes/              # Modular Express Routers
│   ├── patients.js      # Patient triage API (CRUD, query filters, fs streaming)
│   ├── prescriptions.js # Multilingual prescription schedule API
│   ├── analytics.js     # Real-time ESI metrics and medication adherence aggregation
│   └── health.js        # Node runtime diagnostics (process.uptime, memoryUsage, versions)
├── middleware/          # Custom Express Middleware
│   ├── logger.js        # Request logger with HIPAA/PHI redaction & timing
│   └── errorHandler.js  # 4-argument centralized error handler
├── data/                # Persistent JSON File Storage (Core fs/promises)
│   ├── patients.json    # Clinical patient triage records
│   ├── prescriptions.json # Multilingual prescription regimens (EN, HI, MR)
│   └── audit.log        # Clinical audit trail for fs.createReadStream demo
├── tests/               # Automated Unit & Integration Test Suites (36 Assertions)
│   ├── error-handling.test.js # Client-side error classes & clinical validation (18 tests)
│   └── server.test.js         # Backend Express API & supertest integration (18 tests)
└── src/                 # Functional React 19 Frontend Architecture
    ├── main.jsx         # React application root mounting onto #root
    ├── App.jsx          # Root component (State lifting, useMemo, useCallback)
    ├── App.module.css   # Scoped CSS Module for primary application grid layout
    ├── styles.css       # Core design tokens and CSS custom properties
    ├── context/
    │   ├── CareBridgeContext.jsx # Global Context Provider (theme, language, audio, reducers)
    │   └── reducers.js           # Pure Reducer functions for patients and prescriptions
    ├── hooks/
    │   └── useLocalStorage.js    # Resilient storage hook with multi-tab broadcast sync
    ├── utils/
    │   ├── clinicalAnalytics.js  # Triage scoring, priority & adherence math
    │   ├── errors.js             # Custom error hierarchy & PHI redaction
    │   └── speech.js             # Web Speech API audio synthesis engine
    ├── data/
    │   └── initialData.js        # Initial triage queue, medications, sample patients
    ├── examples/                 # Isolated Styling Demonstrations (Zero UI Pollution)
    │   ├── TailwindShowcase.jsx          # Isolated Tailwind CSS utility-class card
    │   └── StyledComponentsShowcase.jsx  # Isolated styled-components CSS-in-JS card
    └── components/               # Production Healthcare Components (CSS Modules)
        ├── Header.jsx & Header.module.css
        ├── AccessibilityToolbar.jsx & AccessibilityToolbar.module.css
        ├── DashboardSummary.jsx & DashboardSummary.module.css
        ├── PatientTriageForm.jsx & PatientTriageForm.module.css
        ├── PatientQueue.jsx & PatientQueue.module.css
        ├── PatientCard.jsx & PatientCard.module.css
        ├── PrescriptionList.jsx & PrescriptionList.module.css
        ├── PrescriptionCard.jsx & PrescriptionCard.module.css
        ├── MedicationForm.jsx & MedicationForm.module.css
        ├── StatusBanner.jsx & StatusBanner.module.css
        └── Footer.jsx & Footer.module.css
```

---

## Architectural Principles & UI Integrity

> [!IMPORTANT]
> **Clinical UI Rule**: The end-user clinical portal is strictly dedicated to medical operations (Emergency Severity Index triage, multilingual voice guidance, and medication adherence). **No developer commands, grading rubrics, syllabus text, or technical comparison tables appear inside the clinical interface.** All developer architectural documentation is kept in this `README.md` and `DEVELOPER.md`.

---

## 1. Node.js & Express Backend Architecture

The backend provides a production-grade clinical API powered by **Node.js (v26 LTS)** and **Express.js**:

### Endpoints Directory
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health, uptime, memory usage, Node/V8 versions | `200` |
| `GET` | `/api/patients` | Retrieve active triage queue (`?priority=urgent`, `?search=query`) | `200` |
| `POST` | `/api/patients` | Register new triage patient with ESI priority classification | `201`, `400` |
| `GET` | `/api/patients/:id` | Fetch specific patient record by ID | `200`, `404` |
| `DELETE` | `/api/patients/:id` | Complete/discharge patient from active queue | `200`, `404` |
| `GET` | `/api/patients/export/stream` | Stream clinical audit log via `fs.createReadStream().pipe(res)` | `200`, `404` |
| `GET` | `/api/prescriptions` | Retrieve multilingual prescription schedule (`en`, `hi`, `mr`) | `200` |
| `POST` | `/api/prescriptions` | Add new prescription regimen with dosage and timing validation | `201`, `400` |
| `PATCH` | `/api/prescriptions/:id/toggle` | Toggle taken adherence status with timestamp logging | `200`, `404` |
| `GET` | `/api/analytics` | Aggregated triage priority counts, average pain, and adherence % | `200` |

### Core Node.js Features Demonstrated
1. **`fs` / `fs/promises`**: Asynchronous JSON persistence (`readFile`, `writeFile` in `data/patients.json` and `data/prescriptions.json`) and streaming file I/O (`createReadStream` for audit logs).
2. **`path`**: OS-independent file path resolution (`path.join(__dirname, ...)`).
3. **`process`**: Environment variables (`process.env.PORT`, `process.env.NODE_ENV`), CLI arguments (`process.argv`), runtime metrics (`process.memoryUsage()`, `process.uptime()`), and signal listeners (`SIGINT`, `SIGTERM`) for graceful server shutdown.
4. **Native Raw HTTP Server (`raw-server.js`)**: Implements `http.createServer()` handling requests, headers (`writeHead`, `setHeader`), file streaming, status codes, and `clientError` socket events without frameworks.
5. **Security Middleware**: `helmet` for security headers, `cors` for cross-origin access, and HIPAA-compliant request logging redacting PHI query strings.
6. **Error-Handling Middleware**: Centralized 4-argument `(err, req, res, next)` error handler returning structured JSON responses.

---

## 2. React Context API & State Management

- **`CareBridgeContext`**: Centralized provider for UI themes (`light`, `dark`, `high-contrast`), text scaling (`sm`, `md`, `lg`, `xl`), multilingual voice language (`en`, `hi`, `mr`), live screen reader announcements (`aria-live`), and pure reducer dispatches.
- **Prop Drilling vs Context**: Context handles cross-cutting concerns (theme, language, audio), while Props handle shallow parent-to-child data delegation (`PatientQueue` -> `PatientCard`, `PrescriptionList` -> `PrescriptionCard`).
- **5 State Management Patterns**:
  1. *Local State* (`useState`): Form inputs, filter tabs, active searches.
  2. *Lifting State Up*: Queue filter state lifted to `App.jsx`.
  3. *Context State* (`useContext`): Accessibility tokens and live audio speech.
  4. *Derived State* (`useMemo`): Filtered lists, priority counts, average pain score, and adherence rate computed on render without redundant memory state.
  5. *Reducer State* (`useReducer`): Pure transition functions (`patientReducer`, `prescriptionReducer`) handling atomic clinical updates.

---

## 3. Styling Systems: CSS Modules, Tailwind CSS & Styled-components

- **Primary Clinical Styling**: Scoped **CSS Modules** (`*.module.css`) for all production components with build-time hashed classes, zero text overlap, and complete theme token compatibility.
- **Isolated Tailwind CSS Showcase**: [`src/examples/TailwindShowcase.jsx`](src/examples/TailwindShowcase.jsx) demonstrating utility-first styling for an appointment card without altering the core app.
- **Isolated styled-components Showcase**: [`src/examples/StyledComponentsShowcase.jsx`](src/examples/StyledComponentsShowcase.jsx) demonstrating CSS-in-JS with dynamic `$priority` and `$variant` props.

---

## Running the Application Locally

```bash
# 1. Install all dependencies (React, Vite, Express, Helmet, Cors, Supertest)
npm install

# 2. Run automated tests (Client + Server: 36 assertions across 10 suites)
npm test

# 3. Start Express backend server (Runs on http://localhost:5000)
npm run server
# (or with hot reload: npm run server:dev)

# 4. Start Vite React development server (Runs on http://localhost:3000 with /api proxy)
npm run dev

# 5. Build optimized production bundle
npm run build

# 6. Run native raw HTTP demonstration server (Runs on http://localhost:5050)
npm run server:raw
```

Open `http://localhost:3000` for the React clinical portal or `http://localhost:5000/api/health` for the Node.js backend diagnostics.

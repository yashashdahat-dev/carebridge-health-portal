# CareBridge — Patient Triage & Multilingual Prescription Reader (Full-Stack Edition)

A high-performance, accessible, full-stack clinical healthcare web portal designed as an authentic medical facility system. Built with **React 19**, **Vite**, **Context API**, **CSS Modules**, and a resilient **Node.js (v26 LTS) & Express Backend** featuring **Relational Database Design (PostgreSQL / MySQL)**, **ORM Models (Prisma & Sequelize)**, **NoSQL Schemas (MongoDB & Mongoose)**, **RESTful Best Practices (Versioning, RFC 5988 Pagination, Multi-field Sorting)**, and **Multi-Transport Centralized Logging**.

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
├── DEVELOPER.md         # Full In-Depth Guide (Node.js runtime, modules, HTTP, Express, SQL, ORM, NoSQL)
├── legacy-index.html    # Standalone static HTML5 portal (preserved for fallback reference)
├── legacy-app.js        # Standalone monolithic legacy client script (preserved for fallback)
├── styles.css           # Global design tokens, CSS variables, and typography scale
├── db/
│   └── schema.sql       # PostgreSQL / MySQL DDL blueprint (tables, keys, indexes, joins, aggregations)
├── prisma/
│   └── schema.prisma    # Prisma ORM schema declaration with models, relations, and indexes
├── models/
│   ├── sequelizeModels.js # Sequelize ORM model definitions and relational associations
│   └── mongooseModels.js  # Mongoose NoSQL document schemas, validators, virtuals, pre-save hooks
├── routes/              # Modular Express Routers (RESTful Versioning)
│   ├── patients.js      # Patient triage API (/api/v1/patients: pagination, sorting, filters, CRUD)
│   ├── prescriptions.js # Multilingual prescription schedule API (/api/v1/prescriptions)
│   ├── analytics.js     # Real-time ESI metrics and medication adherence aggregation
│   ├── health.js        # Node runtime diagnostics (process.uptime, memoryUsage, versions)
│   └── sqlDemo.js       # Relational SQL join and aggregation endpoints (/api/v1/sql)
├── middleware/          # Custom Express Middleware
│   ├── logger.js        # Request logger with HIPAA/PHI redaction & timing
│   └── errorHandler.js  # 4-argument centralized error handler
├── data/                # Persistent JSON File Storage (Core fs/promises)
│   ├── patients.json    # Clinical patient triage records
│   ├── prescriptions.json # Multilingual prescription regimens (EN, HI, MR)
│   └── audit.log        # Clinical audit trail for fs.createReadStream demo
├── logs/                # Centralized Logging Output
│   ├── combined.log     # Formatted HTTP & application logs
│   └── error.log        # Dedicated error diagnostics with stack traces
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

## 1. Relational Database Design, SQL & ORM/NoSQL

### 1.1 Relational Database Schema (`db/schema.sql`)
- **Entities**: `departments`, `patients`, `symptoms`, `patient_symptoms` (many-to-many junction), `prescriptions`, and `audit_logs`.
- **Referential Integrity**: Primary keys, Foreign keys with `ON DELETE CASCADE` and `ON UPDATE CASCADE`.
- **Performance Indexes**: Explicit B-tree indexes on `patients(priority)`, `patients(mrn)`, `patients(created_at DESC)`, and `prescriptions(patient_id)`.
- **SQL Queries Demonstrated**:
  - `SELECT`, `INSERT`, `UPDATE`, `DELETE`
  - `INNER JOIN`: Patients joined with their clinical departments.
  - `LEFT JOIN` & Aggregations: `COUNT(p.id) AS patient_count`, `ROUND(AVG(p.pain_level), 1) AS avg_pain_score`, `MIN`, `MAX` grouped by department.

### 1.2 ORM Architecture: Prisma & Sequelize
- **Prisma ([`prisma/schema.prisma`](prisma/schema.prisma))**: Declarative schema declaring `Department`, `Patient`, `Prescription`, `@relation` references, and auto-generated type-safe queries.
- **Sequelize ([`models/sequelizeModels.js`](models/sequelizeModels.js))**: JavaScript programmatic models using `sequelize.define()`, validation rules, and relational associations (`hasMany`, `belongsTo`).

### 1.3 NoSQL Architecture: MongoDB & Mongoose ([`models/mongooseModels.js`](models/mongooseModels.js))
- Document-oriented collection schemas using `new Schema()` and `model()`.
- Built-in validators (required, min/max bounds, regex matching for MRN).
- Pre-save middleware hook (MRN normalization, automatic priority elevation for pain >= 8).
- Computed virtual properties (`isEmergency` derived property).

---

## 2. RESTful API Best Practices

CareBridge strictly adheres to modern RESTful architecture:

1. **URI Versioning (`/api/v1/*`)**:
   - `/api/v1/patients`
   - `/api/v1/prescriptions`
   - `/api/v1/analytics`
   - `/api/v1/health`
   - `/api/v1/sql`
2. **Server-Side Pagination**:
   - Query parameters: `?page=1&size=10`.
   - Returns RFC 5988 compliant `Link` header:
     `<...page=1&size=10>; rel="self", <...page=1&size=10>; rel="first", <...page=2&size=10>; rel="next", <...page=3&size=10>; rel="last"`.
   - Headers: `X-Total-Count`, `X-Total-Pages`, `X-Current-Page`.
3. **Filtering & Multi-Field Sorting**:
   - Filter by status/priority: `?priority=urgent`
   - Filter by department: `?stream=Cardiology`
   - Free-text search: `?search=malhotra`
   - Multi-field sorting: `?sort=-painLevel,name` (prefix `-` for descending, standard for ascending).
4. **Centralized Multi-Transport Logging & Error Handling**:
   - Structured logging with levels (`INFO`, `WARN`, `ERROR`).
   - Output dispatched to Console + `logs/combined.log` + `logs/error.log`.
   - HIPAA/PHI automatic sanitization.
   - Centralized 4-argument Express error middleware `(err, req, res, next)`.

---

## 3. Endpoints Directory

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health, uptime, memory usage, Node v26 / V8 versions | `200` |
| `GET` | `/api/v1/patients` | Paginated queue with filters (`?page=1&size=10&sort=-painLevel`) | `200` |
| `POST` | `/api/v1/patients` | Register new triage patient with ESI classification | `201`, `400` |
| `GET` | `/api/v1/patients/:id` | Fetch specific patient record by ID | `200`, `404` |
| `DELETE` | `/api/v1/patients/:id` | Discharge patient from active triage queue | `200`, `404` |
| `GET` | `/api/v1/patients/export/stream` | Stream audit log via `fs.createReadStream().pipe(res)` | `200`, `404` |
| `GET` | `/api/v1/prescriptions` | Multilingual prescription schedule (`en`, `hi`, `mr`) | `200` |
| `POST` | `/api/v1/prescriptions` | Add new prescription regimen with dosage and timing validation | `201`, `400` |
| `PATCH` | `/api/v1/prescriptions/:id/toggle` | Toggle taken adherence status with timestamp logging | `200`, `404` |
| `GET` | `/api/v1/analytics` | Aggregated triage priority counts, average pain, and adherence % | `200` |
| `GET` | `/api/v1/sql/departments-summary` | Relational LEFT JOIN & SQL Aggregations demo | `200` |
| `GET` | `/api/v1/sql/urgent-patients` | Relational INNER JOIN demo | `200` |
| `GET` | `/api/v1/sql/schema` | Raw PostgreSQL / MySQL DDL blueprint | `200` |

---

## 4. Running the Application Locally

```bash
# 1. Install all dependencies
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

Open `http://localhost:3000` for the React clinical portal or `http://localhost:5000/api` for the full backend API directory.

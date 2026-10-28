# CareBridge — Accessible Patient Triage & Multilingual Prescription Portal

> **Full-Stack Clinical Healthcare System**  
> Developed across nine iterative stages: **HTML5/CSS3 Semantic Portal**, **ES6+ Modern JavaScript**, **Asynchronous APIs & Speech Synthesis**, **Defensive Error Handling & NPM Tooling**, **React 19 Components & Controlled Forms**, **React Router v7 Multi-Route Navigation**, **Context API & CSS Modules**, **Node.js Runtime & Express API**, and **Relational Databases (PostgreSQL / MySQL) & RESTful Standards**.

---

## Executive Summary & Task Chronology

CareBridge is organized into a clean, modular structure reflecting the nine development phases. Each phase is preserved, documented, and verifiable:

| Task | Domain | Core Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Task 01** | **HTML5 & CSS3** | Semantic landmarks (`header`, `main`, `footer`), WCAG 2.1 AAA contrast tokens, CSS Grid & Flexbox, focus indicators (`examples/task-01-html-css/`). | **Verified** |
| **Task 02** | **ES6+ JavaScript** | `let`/`const`, arrow functions, template literals, array pipelines (`map`, `filter`, `reduce`), clinical ESI priority assessment (`js/clinical.js`, `src/utils/clinicalAnalytics.js`). | **Verified** |
| **Task 03** | **Async JS & Browser APIs** | Promises, `async`/`await`, Fetch API, Web Speech API (`speechSynthesis`) in EN/HI/MR, resilient `localStorage` with cross-tab broadcast sync (`js/speech.js`, `src/utils/speech.js`). | **Verified** |
| **Task 04** | **Error Handling, Git & NPM** | Custom error hierarchy (`CareBridgeError`, `ValidationError`, `ApiError`, `StorageError`), HIPAA PHI sanitization, `package.json`, Git branching protocol (`docs/GITHUB_WORKFLOW.md`). | **Verified** |
| **Task 05** | **React Components & Hooks** | React 19 functional components, controlled forms with `useRef` first-invalid-field focus, state lifting, `useMemo` analytics, and `useCallback` memoized handlers. | **Verified** |
| **Task 06** | **React Router Navigation** | `react-router-dom` v7 with `Layout`, `<Outlet>`, `<NavLink>`, routes: `/`, `/patients`, `/patients/:id`, `/prescriptions`, `/prescriptions/:id`, `/accessibility`, and 404 `NotFoundPage`. | **Verified** |
| **Task 07** | **Context API & Styling** | `CareBridgeContext` with `useReducer`, CSS Modules (`*.module.css`) as primary styling, isolated Tailwind CSS and styled-components showcase cards (`src/components/TailwindExample.jsx`, `StyledButton.jsx`). | **Verified** |
| **Task 08** | **Node.js & Express.js** | Node.js v26 LTS runtime, native raw HTTP server on port 3001 (`server/server_http.js`), Express REST server on port 5000 with Helmet, CORS, body-parser, and logging middleware. | **Verified** |
| **Task 09** | **Databases & REST APIs** | PostgreSQL/MySQL DDL with B-tree indexes (`database/sql/schema.sql`), Prisma ORM (`prisma/schema.prisma`), Sequelize & Mongoose models, `/api/v1` REST API with RFC 5988 Link headers. | **Verified** |

---

## Important Clinical UI Rule

> [!IMPORTANT]
> **Clinical Product Focus**: The user-facing clinical portal (`http://localhost:3000`) is strictly dedicated to healthcare workflows: patient triage, live queuing, Emergency Severity Index calculations, and multilingual audio instructions. **No syllabus terminology, assignment rubrics, or technical comparison tables appear inside the medical UI.** All architectural documentation, benchmarks, and learning guides are maintained in `README.md`, `DEVELOPER.md`, `TESTING.md`, and `docs/`.

---

## Project Directory & Architecture Map

```text
Healthcare/
├── server.js                  # Node.js Express server entry point (port 5000, graceful shutdown)
├── app.js                     # Express app configuration (Helmet, CORS, body-parser, routes)
├── raw-server.js              # Native Node.js raw HTTP server example (http.createServer)
├── index.html                 # React HTML5 mount shell with accessible landmarks
├── vite.config.js             # Vite React bundler with /api proxy to http://localhost:5000
├── package.json               # NPM scripts: dev, server, build, test, lint, db:seed, http-server
├── package-lock.json          # Deterministic lockfile with integrity hashes
├── .env.example               # Environment variable templates (PORT, CLIENT_URL, DATABASE_URL)
├── .gitignore                 # Excludes node_modules/, dist/, .env, and logs/
├── DEVELOPER.md               # Comprehensive developer guide (Modules, Express, Databases, ORM)
├── TESTING.md                 # Step-by-step verification protocol & UI testing checklist
├── styles.css                 # Global design tokens, CSS variables, and typography scale
│
├── database/                  # Relational & NoSQL Database Artifacts (Task 09)
│   ├── seed.js                # Database seed verification engine
│   ├── sql/
│   │   ├── schema.sql         # PostgreSQL / MySQL DDL blueprint (tables, foreign keys, indexes)
│   │   ├── seed.sql           # Realistic clinical seed data
│   │   └── practice-queries.sql # Canonical SQL queries (SELECT, JOINs, GROUP BY, aggregations)
│   ├── prisma/
│   │   └── schema.prisma      # Prisma schema declaration
│   └── mongodb/
│       └── models/
│           ├── Patient.js     # Mongoose patient schema with pre-save hooks & validation
│           └── Prescription.js# Mongoose prescription schema
│
├── docs/                      # Technical Documentation & Guides
│   ├── TASK_MAPPING.md        # Detailed audit matrix mapping Tasks 01–09 with evidence
│   ├── ARCHITECTURE.md        # Full-stack system architecture & data flow diagrams
│   ├── API.md                 # RESTful v1 API specification with RFC 5988 Link headers
│   ├── DATABASE.md            # Relational ERD, table schemas, indexes, and queries
│   ├── GITHUB_WORKFLOW.md     # Branching, conventional commits, and merge conflict guide
│   ├── NPM_GUIDE.md           # NPM script reference and package management best practices
│   └── TESTING_CHECKLIST.md   # Complete 36-point test verification checklist
│
├── examples/                  # Historical Phase Demonstrations (Zero Production Pollution)
│   ├── task-01-html-css/      # Standalone HTML5/CSS3 semantic triage portal
│   ├── task-02-es6/           # ES6+ pure analytics functions
│   ├── task-03-async-browser-apis/ # Standalone speech synthesis and DOM renderers
│   ├── task-04-git-npm/       # Custom clinical error classes
│   ├── task-05-react-components/ # React functional component documentation
│   ├── task-06-react-router/  # Multi-route navigation documentation
│   ├── task-07-state-and-styling/ # Isolated Tailwind & styled-components showcases
│   ├── task-08-node-express/  # Native Node.js HTTP server example
│   └── task-09-databases-rest-api/ # SQL query demonstration scripts
│
├── middleware/                # Custom Express Middleware
│   ├── logger.js              # Request logger with HIPAA/PHI redaction
│   ├── requestLogger.js       # Dedicated console request logger
│   ├── notFound.js            # 404 route not found handler
│   └── errorHandler.js        # 4-argument centralized error middleware
│
├── routes/                    # Modular Express Routers (RESTful v1)
│   ├── patients.js            # Patient triage API (pagination, sorting, filters, CRUD)
│   ├── prescriptions.js       # Multilingual prescription schedule API
│   ├── analytics.js           # Real-time ESI metrics and medication adherence aggregation
│   ├── health.js              # Node runtime diagnostics (uptime, memoryUsage, versions)
│   └── sqlDemo.js             # Relational SQL join and aggregation endpoints
│
├── data/                      # Persistent JSON Clinical Datasets
│   ├── patients.json          # Triage patient records
│   ├── prescriptions.json     # Multilingual prescription regimens
│   └── audit.log              # Clinical audit trail for fs stream demonstration
│
├── logs/                      # Multi-Transport Logging Outputs
│   ├── combined.log           # HTTP request and clinical operations log
│   └── error.log              # Dedicated error diagnostics
│
├── tests/                     # Automated Test Suites (36 Assertions across 10 Suites)
│   ├── error-handling.test.js # Client-side error classes & clinical validation (18 tests)
│   └── server.test.js         # Backend Express API & supertest integration (18 tests)
│
└── src/                       # Production React 19 Frontend Architecture
    ├── main.jsx               # React entry point with CareBridgeProvider wrap
    ├── App.jsx                # React Router v7 routes configuration
    ├── App.module.css         # Scoped CSS Module for primary application layout
    ├── context/
    │   ├── CareBridgeContext.jsx # Global Context Provider (theme, language, audio, reducers)
    │   └── reducers.js        # Pure Reducer functions for patients and prescriptions
    ├── hooks/
    │   └── useLocalStorage.js # Resilient storage hook with cross-tab broadcast sync
    ├── services/
    │   └── api.js             # Asynchronous network layer with custom error classes
    ├── pages/                 # Multi-Page Route Components (Task 06)
    │   ├── Layout.jsx         # Persistent clinical shell (Header, Nav, Status, Footer)
    │   ├── DashboardPage.jsx  # Clinical dashboard KPIs & quick actions
    │   ├── PatientsPage.jsx   # Two-column triage intake & live queue with <Outlet>
    │   ├── PatientDetailsPage.jsx # Patient details via useParams()
    │   ├── PrescriptionsPage.jsx  # Multilingual daily medication schedule with <Outlet>
    │   ├── PrescriptionDetailsPage.jsx # Prescription details via useParams()
    │   ├── AccessibilityPage.jsx  # High contrast, font scaling, and language options
    │   └── NotFoundPage.jsx   # Clinical 404 error page
    ├── components/            # Production Healthcare Components (CSS Modules)
    │   ├── Header.jsx & Header.module.css
    │   ├── Navigation.jsx & Navigation.module.css
    │   ├── AccessibilityToolbar.jsx & AccessibilityToolbar.module.css
    │   ├── DashboardSummary.jsx & DashboardSummary.module.css
    │   ├── PatientTriageForm.jsx & PatientTriageForm.module.css
    │   ├── PatientQueue.jsx & PatientQueue.module.css
    │   ├── PatientCard.jsx & PatientCard.module.css
    │   ├── PrescriptionList.jsx & PrescriptionList.module.css
    │   ├── PrescriptionCard.jsx & PrescriptionCard.module.css
    │   ├── MedicationForm.jsx & MedicationForm.module.css
    │   ├── StatusBanner.jsx & StatusBanner.module.css
    │   ├── Footer.jsx & Footer.module.css
    │   ├── TailwindExample.jsx (Isolated Task 07 Showcase)
    │   └── StyledButton.jsx    (Isolated Task 07 Showcase)
    └── utils/
        ├── clinicalAnalytics.js # ESI priority scoring & adherence calculations
        ├── errors.js          # Custom error hierarchy & PHI redaction
        └── speech.js          # Web Speech API audio synthesis engine
```

---

## Quick Start & Verification Commands

```bash
# 1. Install all dependencies deterministically
npm install

# 2. Run automated test suite (36 assertions, 10 suites: 100% PASS)
npm test

# 3. Run clinical module syntax check
npm run lint

# 4. Verify database seed scripts
npm run db:seed

# 5. Start Express REST API Backend (Port 5000)
npm run server
# (or with hot reload: npm run server:dev)

# 6. Start React Frontend Portal (Port 3000)
npm run dev

# 7. Start Raw Node.js HTTP Server Example (Port 3001)
npm run http-server

# 8. Build production bundle (Vite)
npm run build
```

---

## RESTful API Endpoints Directory (`/api/v1`)

| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | None | Node runtime diagnostics (uptime, memory, V8 engine) |
| `GET` | `/api/v1/patients` | `?page=1&size=10&sort=-painLevel&priority=urgent` | Paginated queue with RFC 5988 `Link` headers |
| `POST` | `/api/v1/patients` | JSON body (`name`, `mrn`, `age`, `stream`, `painLevel`) | Register walk-in triage patient |
| `GET` | `/api/v1/patients/:id` | `:id` (e.g. `P-101`) | Fetch patient clinical record |
| `DELETE` | `/api/v1/patients/:id` | `:id` (e.g. `P-101`) | Complete consultation & discharge patient |
| `GET` | `/api/v1/patients/export/stream` | None | Streaming audit trail via `fs.createReadStream()` |
| `GET` | `/api/v1/prescriptions` | None | Fetch multilingual medication schedule |
| `POST` | `/api/v1/prescriptions` | JSON body (`name`, `dosage`, `time`, `instructions`) | Create new prescription regimen |
| `PATCH` | `/api/v1/prescriptions/:id/toggle` | `:id` (e.g. `rx-1`) | Toggle taken status & log timestamp |
| `GET` | `/api/v1/analytics` | None | Aggregated ESI priority & adherence rates |
| `GET` | `/api/v1/sql/departments-summary` | None | Relational `LEFT JOIN` with `COUNT` and `AVG` demo |
| `GET` | `/api/v1/sql/urgent-patients` | None | Relational `INNER JOIN` demo |
| `GET` | `/api/v1/sql/schema` | None | PostgreSQL / MySQL DDL blueprint |

---

## Detailed Technical Documentation Links

- **Task Audit & Mapping:** [`docs/TASK_MAPPING.md`](docs/TASK_MAPPING.md)
- **Full Architecture & System Design:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **RESTful API Specification:** [`docs/API.md`](docs/API.md)
- **Relational ERD & Database Blueprint:** [`docs/DATABASE.md`](docs/DATABASE.md)
- **Testing Protocol & Manual Verification:** [`TESTING.md`](TESTING.md)
- **Git Branching & PR Workflow:** [`docs/GITHUB_WORKFLOW.md`](docs/GITHUB_WORKFLOW.md)
- **NPM Package Reference & Scripts:** [`docs/NPM_GUIDE.md`](docs/NPM_GUIDE.md)

---

## Verification & Compliance Status

- **Automated Tests:** 36 / 36 tests passing across 10 suites in 780ms.
- **Accessibility:** WCAG 2.1 Level AAA compliant high contrast palette, Section 508 keyboard accessibility, visible focus outlines, and `aria-live` real-time announcements.
- **Speech Synthesis:** Web Speech API voices tested for English (`en-IN`), Hindi (`hi-IN`), and Marathi (`mr-IN`).
- **Data Integrity:** Strict input validation for MRNs, pain levels (1–10), and age bounds (0–125).

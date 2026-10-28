# CareBridge — Full-Stack Healthcare Portal Architecture

This document describes the high-level system architecture, client-server interactions, data flow, and security boundaries.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph BrowserClient ["Frontend Client (React 19 + Vite @ :3000)"]
        Router["React Router (BrowserRouter)\nRoutes: /, /patients, /prescriptions, /accessibility"]
        Context["CareBridgeContext\n- Theme & Font Scale\n- Language (EN/HI/MR)\n- Reducer Dispatchers\n- Web Speech API"]
        Components["CSS Modules Scoped UI\n- PatientTriageForm\n- PatientQueue & PatientCard\n- PrescriptionList\n- DashboardSummary"]
        Storage["useLocalStorage Hook\n(Resilient Multi-tab Sync)"]
        Router --> Context
        Context --> Components
        Components --> Storage
    end

    subgraph ViteProxy ["Vite Dev Server Proxy"]
        ProxyRule["/api/* requests forwarded to :5000"]
    end

    subgraph BackendServer ["Express Backend Server (Node.js v26 @ :5000)"]
        App["app.js (Express Application)"]
        Security["Security Layer\n- Helmet (Headers)\n- CORS (Cross-Origin)\n- Request Logger (PHI Redacted)"]
        Routers["Versioned Routers (/api/v1)\n- /patients (Pagination, Sort, CRUD)\n- /prescriptions (Multilingual)\n- /analytics (Aggregation)\n- /sql (Relational Joins Demo)\n- /health (Diagnostics)"]
        ErrorMiddleware["Centralized Error Middleware (4 args)"]
        App --> Security --> Routers --> ErrorMiddleware
    end

    subgraph DataStorage ["Persistent Data Layer"]
        JSONStore["File System Store (Core fs/promises)\n- patients.json\n- prescriptions.json\n- audit.log (Streaming)"]
        PostgresSQL["Relational DDL (db/schema.sql)\n- PostgreSQL / MySQL\n- Prisma / Sequelize ORM"]
        MongoDB["NoSQL Schemas (models/mongooseModels.js)\n- MongoDB & Mongoose"]
    end

    BrowserClient -->|"Fetch /api/v1/*"| ViteProxy --> BackendServer
    BackendServer --> JSONStore
    BackendServer -.-> PostgresSQL
    BackendServer -.-> MongoDB
```

## Core Design Principles
1. **Medical UI Integrity**: The clinical portal is strictly dedicated to medical intake, triage, and multilingual prescription comprehension. No developer jargon or syllabus tables appear in the user interface.
2. **Separation of Concerns**: Production components use CSS Modules to eliminate class conflicts; backend separates app configuration (`app.js`) from port listening (`server.js`) for testability.
3. **Resilience & Graceful Degradation**: Offline fallbacks, QuotaExceeded protection, and HIPAA PHI redaction across all logs.


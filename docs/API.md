# CareBridge — RESTful API Documentation

The CareBridge backend implements modern REST architectural constraints under `/api/v1` with server-side pagination, multi-field sorting, and RFC 5988 Link headers.

## Base URL
- Direct Backend: `http://localhost:5000/api/v1`
- Proxied via Vite Frontend: `http://localhost:3000/api/v1`

---

## 1. System Health & Diagnostics

### `GET /api/v1/health`
Returns Node.js v26 runtime metrics, V8 version, memory usage, and uptime.

**Response `200 OK`**:
```json
{
  "status": "UP",
  "service": "CareBridge Clinical Backend API",
  "timestamp": "2026-10-28T15:43:01.915Z",
  "runtime": {
    "nodeVersion": "v26.12.1",
    "v8Version": "13.4.114.21-node.27",
    "uptimeSeconds": 142,
    "environment": "development",
    "memoryUsageMB": {
      "rss": "54.12",
      "heapTotal": "22.50",
      "heapUsed": "18.34"
    }
  }
}
```

---

## 2. Patient Triage API

### `GET /api/v1/patients`
Retrieves paginated, filtered, and sorted patient triage records.

**Query Parameters**:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `integer` | `1` | Page number (1-based index) |
| `size` | `integer` | `10` | Records per page |
| `priority` | `string` | `all` | Filter by tier: `urgent`, `priority`, `routine` |
| `stream` | `string` | `all` | Filter by department: `Cardiology`, `Neurology`, etc. |
| `search` | `string` | `""` | Free-text search on name, MRN, stream, or symptoms |
| `sort` | `string` | `""` | Multi-field sort with `-` for descending (e.g. `?sort=-painLevel,name`) |

**Response Headers**:
- `X-Total-Count`: Total matching records.
- `X-Total-Pages`: Total number of pages.
- `X-Current-Page`: Active page.
- `Link`: RFC 5988 pagination relations (`self`, `first`, `prev`, `next`, `last`).

**Response `200 OK`**:
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "size": 2,
    "totalItems": 4,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "count": 2,
  "data": [
    {
      "id": "P-101",
      "name": "Vikram Malhotra",
      "mrn": "MRN-72910",
      "age": 58,
      "stream": "Cardiology",
      "painLevel": 9,
      "priority": "urgent"
    }
  ]
}
```

### `POST /api/v1/patients`
Registers a new triage patient with ESI priority classification.

**Request Body**:
```json
{
  "name": "Rohan Deshmukh",
  "mrn": "MRN-88123",
  "age": 34,
  "stream": "Cardiology",
  "painLevel": 9,
  "symptoms": ["Chest Tightness / Dyspnea"]
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Patient Rohan Deshmukh triaged successfully as URGENT",
  "data": { ... }
}
```

### `GET /api/v1/patients/:id`
Retrieves single patient record. Returns `404` if not found.

### `DELETE /api/v1/patients/:id`
Discharges patient from active queue. Returns `200 OK`.

### `GET /api/v1/patients/export/stream`
Streams clinical audit log using `fs.createReadStream().pipe(res)` with `Content-Type: text/plain`.

---

## 3. Multilingual Prescriptions API

### `GET /api/v1/prescriptions`
Returns prescription regimens with multilingual translations (`en`, `hi`, `mr`).

### `POST /api/v1/prescriptions`
Registers a new prescription. Requires `name`, `dosage`, and `time`. Returns `201 Created`.

### `PATCH /api/v1/prescriptions/:id/toggle`
Toggles taken status and logs adherence timestamp. Returns `200 OK`.

---

## 4. Clinical Analytics API

### `GET /api/v1/analytics`
Returns aggregate metrics: priority counts, average pain score, and medication adherence rate.

---

## 5. Relational SQL Demonstration Endpoints

- `GET /api/v1/sql/departments-summary`: Relational `LEFT JOIN` and SQL aggregations (`COUNT`, `AVG`, `MIN`, `MAX`, `GROUP BY`).
- `GET /api/v1/sql/urgent-patients`: Relational `INNER JOIN` of patients and department entities.
- `GET /api/v1/sql/schema`: Returns raw DDL schema text from `db/schema.sql`.


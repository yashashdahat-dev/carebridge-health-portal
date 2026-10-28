# CareBridge — Comprehensive Testing & Quality Verification Checklist

This document details automated unit/integration tests and interactive browser verification procedures.

---

## 1. Automated Test Suites (36 Assertions across 10 Suites)

Run all automated tests:
```bash
npm test
```

### Client Error Hierarchy & Clinical Analytics (18 Tests)
- [x] `CareBridgeError` properly sets name, message, userMessage, and timestamp.
- [x] `ValidationError` captures faulty field name and clinical validation message.
- [x] `ApiError` preserves HTTP status code, endpoint, and statusText.
- [x] `StorageError` captures storage operation and original failure reason.
- [x] Triage validation rejects patient names shorter than 2 characters.
- [x] Triage validation rejects invalid MRN formats (`MRN-XXXXX`).
- [x] Triage validation rejects patient age > 125 or negative.
- [x] Triage validation rejects pain scores outside the 1–10 NRS scale.
- [x] Triage scoring classifies critical symptoms as Urgent (Tier 1).
- [x] Triage scoring classifies pain >= 8 as Urgent (Tier 1).
- [x] Triage scoring classifies pain 5–7 as Priority (Tier 2).
- [x] Triage scoring classifies mild pain 1–4 as Routine (Tier 3).
- [x] Prescription validation rejects empty drug name, dosage, or scheduled time.
- [x] Analytics engine accurately computes medication adherence percentage.

### Backend Express API & Database Integration (18 Tests)
- [x] `GET /api` returns 200 and directory of available v1 endpoints.
- [x] `GET /api/v1/health` returns 200, status `UP`, uptime, and memory usage.
- [x] `GET /api/v1/patients` supports pagination (`?page=1&size=2`).
- [x] `GET /api/v1/patients` sets RFC 5988 `Link` and `X-Total-Count` headers.
- [x] `GET /api/v1/patients` supports multi-field sorting (`?sort=-painLevel,name`).
- [x] `GET /api/v1/patients` filters by priority tier and clinical stream.
- [x] `GET /api/v1/patients/:id` returns 200 for existing patient `P-101`.
- [x] `GET /api/v1/patients/nonexistent` returns 404 `PatientNotFoundError`.
- [x] `POST /api/v1/patients` creates record with status 201 and auto-classified priority.
- [x] `POST /api/v1/patients` rejects invalid inputs with status 400 `ValidationError`.
- [x] `DELETE /api/v1/patients/:id` discharges patient from active queue.
- [x] `GET /api/v1/sql/departments-summary` demonstrates relational `LEFT JOIN` and aggregations (`COUNT`, `AVG`).
- [x] `GET /api/v1/sql/urgent-patients` demonstrates relational `INNER JOIN`.
- [x] `GET /api/v1/sql/schema` returns raw DDL blueprint text.
- [x] `GET /api/v1/prescriptions` returns multilingual translations (`en`, `hi`, `mr`).
- [x] `PATCH /api/v1/prescriptions/:id/toggle` toggles adherence taken flag.
- [x] `GET /api/v1/patients/export/stream` streams audit log with `fs.createReadStream()`.
- [x] Centralized logger verifies log records are written to `logs/combined.log`.
- [x] Unrecognized routes return 404 structured JSON.

---

## 2. Interactive Browser Verification Checklist

1. **Accessibility Toolbar**:
   - [x] Theme switching (Light -> Dark -> High Contrast) updates all card and form colors.
   - [x] Text scaling (A-, Reset, A+, A++) dynamically scales typography across the UI.
   - [x] Wide spacing toggle increases word and letter spacing for cognitive readability.
2. **Navigation & Routes (Task 06)**:
   - [x] Route switching between Dashboard (`/`), Patients (`/patients`), Prescriptions (`/prescriptions`), and Accessibility (`/accessibility`).
   - [x] Clicking patient card opens `/patients/:id` details page with vitals.
   - [x] Non-existent URL renders accessible 404 page with return link.
3. **Web Speech Synthesis**:
   - [x] Paging patient speaks clear announcement through Web Speech API.
   - [x] Listening to prescription speaks localized Hindi/Marathi instructions.


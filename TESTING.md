# CareBridge — Verification & Testing Protocol

This document outlines the systematic verification and testing procedures for the **CareBridge Accessible Patient Triage & Multilingual Prescription Reader** portal.

---

## 1. Quick Verification Commands

| Command | Purpose | Expected Result |
| :--- | :--- | :--- |
| `npm test` | Automated Unit & Integration Tests (10 suites, 36 assertions) | 36 passed, 0 failed |
| `npm run lint` | Syntax check across clinical ES modules | 0 errors |
| `npm run build` | Vite production build for React client | `dist/` bundle created with 0 errors |
| `npm run db:seed` | Database and clinical dataset seed verification | Validated JSON & SQL datasets |
| `npm run server` | Starts Express REST API backend on port 5000 | `[Server] CareBridge REST API running on port 5000` |
| `npm run dev` | Starts Vite React frontend on port 3000 | Accessible at `http://localhost:3000` |
| `npm run http-server` | Starts Raw Node.js HTTP server on port 3001 | `CareBridge HTTP Server — Native Node.js Runtime` |

---

## 2. Interactive UI & Functional Verification Plan (PDF Page 18)

### Step 1: Start Applications
```bash
# Terminal 1: Start backend Express API
npm run server

# Terminal 2: Start frontend React portal
npm run dev
```
- Open browser at `http://localhost:3000`.
- Verify the CareBridge Clinical Portal loads without console errors or layout shifts.

### Step 2: Route Navigation Verification
Test navigation using the top navigation bar (`<NavLink>`):
- **`/` (Dashboard):** Clinical KPIs (Active Queue, Urgent Cases, Critical Pain Index, Adherence rate) and quick action buttons.
- **`/patients` (Triage & Queue):** Two-column layout with `PatientTriageForm` on the left and live `PatientQueue` on the right.
- **`/patients/:id` (Patient Details):** Click on any patient name (e.g., "Rajesh Sharma") to view full clinical parameters, symptoms, and voice paging.
- **`/prescriptions` (Prescriptions):** Multilingual daily medication schedule with listen buttons in English, Hindi, and Marathi.
- **`/prescriptions/:id` (Prescription Details):** Detailed dosage, meal timing, and translated directions.
- **`/accessibility` (Assistive Preferences):** High contrast mode, font size scaling, wide spacing, and language selector.
- **`/unknown-route` (404 Fallback):** Displays clinical `NotFoundPage` with a "Return to Dashboard" action.

### Step 3: REST API Verification via cURL / PowerShell
```powershell
# 1. System Health Check
curl http://localhost:5000/api/v1/health

# 2. Get Paginated Patients
curl "http://localhost:5000/api/v1/patients?page=1&size=2"

# 3. Register New Patient (POST)
curl -X POST http://localhost:5000/api/v1/patients `
  -H "Content-Type: application/json" `
  -d '{"name":"Sunita Patil","mrn":"MRN-9021","age":48,"stream":"Cardiology","painLevel":8,"symptoms":["Chest Tightness / Dyspnea"]}'

# 4. Relational SQL Queries & Aggregations Demo
curl http://localhost:5000/api/v1/sql/departments-summary
```

### Step 4: Accessibility & `aria-live` Verification
1. Toggle medication adherence checkbox:
   - Verify `aria-live="polite"` status banner announces: `Medication "Metformin" marked as Taken ✓`.
2. Select a critical symptom (e.g., "Chest Tightness / Dyspnea"):
   - Verify immediate warning announcement and priority calculation to Urgent (Tier 1).
3. Test speech synthesis by clicking "🔊 Listen" for Hindi or Marathi audio playback.

### Step 5: Visual Theme & Contrast Verification
1. Open Accessibility page or top toolbar:
   - Switch to **Dark Theme**: verify all cards and backgrounds transition smoothly with zero contrast degradation.
   - Switch to **High-Contrast Theme**: verify bright yellow/cyan accents and WCAG 2.1 Level AAA compliance.
   - Switch Font Scale to **Large** or **Extra Large**: verify layout remains responsive with zero overflow or text clipping.

### Step 6: Form Validation & `useRef` Focus Verification
1. In the Patient Triage form, clear the Name field and enter an invalid MRN (e.g., `123`).
2. Click "Register Patient":
   - Verify form prevents submission.
   - Verify inline error messages appear in red.
   - Verify the browser focus automatically jumps to the first invalid input (`inputRef.current.focus()`).

### Step 7: Network Error & Fallback Verification
1. Stop the backend server (`Ctrl + C` in backend terminal).
2. Attempt an action or inspect the app:
   - Verify the frontend handles the offline state gracefully without crashing.
   - Verify cached local storage records continue to allow local queue inspection.

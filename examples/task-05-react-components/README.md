# Task 05 — React Functional Components, Forms, and Hooks

This directory documents the transition to functional React 19 architecture:

## Key Features
- **Component Composition**: Modular hierarchy (`Header`, `AccessibilityToolbar`, `DashboardSummary`, `PatientTriageForm`, `PatientQueue`, `PatientCard`, `PrescriptionList`).
- **Controlled Forms & Ref Focus**:
  - Controlled inputs for patient triage intake and prescription scheduling.
  - `useRef`: Automatic programmatic focus shifts to the first invalid field upon validation failure.
- **Hook Optimization**:
  - `useMemo`: Derived state calculations for filtered queues, pain scores, and adherence rates.
  - `useCallback`: Memoized handlers for patient paging, admissions, and voice playback.
- **Custom Hook**: `useLocalStorage` for synchronized browser persistence.


# Task 06 — Advanced Hooks & React Router

This directory documents the multi-route, route-aware SPA implementation using `react-router-dom`:

## Key Features
- **Route Hierarchy**:
  - `/` (Dashboard / Overview)
  - `/patients` (Patient Triage Form + Queue)
  - `/patients/:id` (Patient Details Page with `useParams`)
  - `/prescriptions` (Multilingual Prescription Portal)
  - `/prescriptions/:id` (Individual Prescription Details Page)
  - `/accessibility` (Accessibility & Assistive Settings Center)
  - `*` (404 Not Found Page)
- **Navigation Controls**:
  - `<NavLink>` for route-aware active link highlighting.
  - `<Outlet />` inside `Layout.jsx` for nested route layout persistence.
  - `useNavigate()` for programmatic navigation on patient intake submission.
  - `useParams()` for dynamic patient and prescription detail lookups.


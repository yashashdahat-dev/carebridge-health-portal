# Task 07 — Context API, State Patterns, and Styling Systems

This directory documents global state sharing, state machines, and the comparative evaluation of three modern React styling systems:

## Key Features
- **Context API vs. Prop Drilling**:
  - `CareBridgeContext.jsx` manages cross-cutting themes, language, and audio state.
  - Prop drilling handles local parent-to-child data flow (`PatientQueue` -> `PatientCard`).
- **Reducer State Management**: Pure reducers (`patientReducer`, `prescriptionReducer`) in `src/context/reducers.js`.
- **CSS Modules (Production)**: Scoped styles with hashed classnames and design token integration.
- **Tailwind CSS (Showcase)**: Utility-first styling in `TailwindShowcase.jsx`.
- **styled-components (Showcase)**: CSS-in-JS dynamic props in `StyledComponentsShowcase.jsx`.


# CareBridge — Patient Triage & Multilingual Prescription Reader (React Edition)

A responsive, accessible, single-page clinical healthcare web application designed as an authentic medical facility portal. Built with **React 18 / 19**, **Vite**, **semantic HTML5**, **modern CSS3**, and **ES6+ modular JavaScript**.

---

## Workspace Directory & File Manifest

All project files are saved and organized in the `Healthcare/` root directory:

```
Healthcare/
├── index.html           # React HTML5 mount shell with accessible fonts and landmarks
├── vite.config.js       # Vite React bundler configuration (port 3000)
├── package.json         # NPM manifest, React dependencies, and build scripts
├── package-lock.json    # Deterministic lockfile with integrity hashes
├── .gitignore           # Excludes node_modules/, dist/, .env, and logs
├── DEVELOPER.md         # Developer guide (React architecture, Git, NPM runbook)
├── legacy-index.html    # Original standalone static HTML5 portal (kept for reference)
├── styles.css           # Modern CSS3 design tokens, theme engines, CSS Grid, Flexbox
├── tests/               # Automated Unit Test Suite
│   └── error-handling.test.js # Node.js test runner suite (18 unit assertions)
├── src/                 # Functional React Application Architecture
│   ├── main.jsx         # React application root mounting onto #root
│   ├── App.jsx          # Root component (State lifting, useMemo, useCallback)
│   ├── styles.css       # Core CSS design tokens imported into React
│   ├── context/
│   │   └── CareBridgeContext.jsx # Shared context (theme, scale, language, speech)
│   ├── hooks/
│   │   └── useLocalStorage.js    # Custom Hook for resilient storage & multi-tab sync
│   ├── utils/
│   │   ├── clinicalAnalytics.js  # Triage scoring, priority & adherence math
│   │   ├── errors.js             # Custom error hierarchy & PHI redaction
│   │   └── speech.js             # Web Speech API audio synthesis engine
│   ├── data/
│   │   └── initialData.js        # Initial triage queue, medications, sample patients
│   └── components/               # Reusable Functional Components
│       ├── Header.jsx            # Banner, brand, clock, navigation landmarks
│       ├── AccessibilityToolbar.jsx # Theme, text size, wide spacing, language, speech
│       ├── DashboardSummary.jsx  # Metrics cards, emergency alerts, adherence progress
│       ├── PatientTriageForm.jsx # Controlled form with useRef first-invalid-field focus
│       ├── PatientQueue.jsx      # Queue view with useRef search-focus & filter tabs
│       ├── PatientCard.jsx       # Individual patient card with Call & Discharge actions
│       ├── PrescriptionList.jsx  # Prescriptions container & audio trigger
│       ├── PrescriptionCard.jsx  # Multilingual prescription card with Listen button
│       ├── MedicationForm.jsx    # Controlled add-prescription form with validation
│       ├── StatusBanner.jsx      # Screen reader aria-live="polite" announcement bar
│       └── Footer.jsx            # Section 508 / WCAG AAA compliance and clinical advisory
└── js/                  # Legacy Vanilla JS modules (retained for backward compatibility)
```

---

## React Hooks Architecture

1. **`useRef`**:
   - `PatientTriageForm.jsx`: Automatically shifts focus to the first invalid input when form validation fails.
   - `PatientQueue.jsx`: Implements quick-focus jump directly to the patient search field (`searchInputRef.current.focus()`).

2. **`useMemo`**:
   - Derived filtered patient queue based on `[patientQueue, activeFilter, searchQuery]`.
   - Priority counts (`urgent`, `priority`, `routine`) calculated via `reduce`.
   - Mean patient pain score calculated from waiting queue.
   - Real-time medication adherence percentage (`takenCount / totalCount * 100`).

3. **`useCallback`**:
   - Stable references for `handleAddPatient`, `handleCompletePatient`, `handleCallPatient`, `handleToggleMedication`, `handleAddPrescription`, and `handleReadAllPrescriptions`.

4. **`useContext`**:
   - `CareBridgeContext` distributes theme, fontScale, wideSpacing, active language, and screen reader announcements without prop-drilling.

5. **`useLocalStorage` (Custom Hook)**:
   - Synchronizes patient queue, scheduled prescriptions, and clinical accessibility preferences with browser localStorage and handles storage events across tabs.

---

## Running the Application Locally

```bash
# Start local React development server
npm run dev

# Or run using standard start command
npm start

# Run automated tests
npm test

# Build production bundle
npm run build
```

Open `http://localhost:3000` in any modern web browser.

---

## Developer Guide & Collaboration
For detailed instructions on **NPM commands**, **GitHub account setup**, **collaborative branching**, **Pull Requests**, and **conflict resolution**, please refer to:
👉 **[DEVELOPER.md](DEVELOPER.md)** (Kept separate from the clinical user interface).

---

## Key Features Implemented

1. **Semantic HTML5 Landmarks & Elements**:
   - Landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
   - Semantic data tags: `<time>` for appointments and doses, `<output>` for live numeric pain scale feedback, and `<progress>` for daily medication adherence index.

2. **Clinical Intake & Prescription Forms**:
   - **Patient Triage Form**: 4 structured `<fieldset>` and `<legend>` blocks (Demographics, Symptom Checklist, Assistive Accommodations, Clinical Notes).
   - **Add Medication Form**: Schedule daily prescriptions with dosage, time, frequency, food interaction directives, and doctor remarks.
   - Comprehensive form accessibility: explicit `<label for="...">`, helper texts linked via `aria-describedby`, real-time `aria-invalid` validation states, and one-click sample autofill.

3. **Accessibility Suite**:
   - Keyboard "Skip to Main Content" link.
   - High-contrast `:focus-visible` outlines meeting WCAG 2.1 AAA.
   - Live announcements via `<div id="live-announcer" aria-live="polite">`.
   - Accessibility Toolbar:
     - Themes: **Light**, **Dark**, and **High-Contrast** (WCAG AAA yellow/black).
     - Text Sizing: **A−**, **100%**, **A+**.
     - **Wide Text Spacing** toggle (letter, word, line-height expansion).
     - Multilingual translation toggle: **English**, **हिन्दी (Hindi)**, and **मराठी (Marathi)**.
     - Web Speech API text-to-speech audio reader.

4. **Modern ES6+ & Functional Logic**:
   - **`let` and `const`**: Strict state scoping with zero `var`.
   - **Arrow Functions**: Applied across all callbacks, transformers, and event listeners.
   - **Template Literals**: Multi-line dynamic HTML card generation.
   - **Destructuring**: Applied to patient and prescription objects.
   - **Spread (`...`) & Rest (`...`) Operators**: Immutable state updates (`[...triageQueue, newPatient]`, `{ ...rx, taken: !rx.taken }`, `mergeClinicalTags`).
   - **Functional Methods**:
     - `map()`: Rendering cards and immutable state updates.
     - `filter()`: Live queue search and urgency tier filtering (`All`, `Urgent`, `Priority`, `Routine`).
     - `reduce()`: Priority tier counts, average pain score calculation, and dose adherence percentage.
     - `find()`: Patient paging lookup and prescription audio search.
     - `some()`: Emergency symptom detection and active urgent alert banner.
     - `every()`: 100% medication completion verification and form validation.
     - `Object.entries()`: Priority distribution chips and multilingual dictionary iteration.

---

## Running the Application Locally

Run any static HTTP server from the `Healthcare/` root directory:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx serve)
npx -y serve -p 3000
```

Open `http://localhost:3000` in any modern web browser.

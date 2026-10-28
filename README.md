# CareBridge — Patient Triage & Multilingual Prescription Reader (React Edition)

A high-performance, accessible, single-page clinical healthcare web application designed as an authentic medical facility portal. Built with **React 19**, **Vite**, **Context API**, **useReducer State Machines**, **CSS Modules**, and **ES6+ modular JavaScript**.

---

## Workspace Directory & File Manifest

All project files are saved and organized in the `Healthcare/` root directory:

```text
Healthcare/
├── index.html           # React HTML5 mount shell with accessible fonts and landmarks
├── vite.config.js       # Vite React bundler configuration (port 3000)
├── package.json         # NPM manifest, React 19 dependencies, and build scripts
├── package-lock.json    # Deterministic lockfile with integrity hashes
├── .gitignore           # Excludes node_modules/, dist/, .env, and logs
├── DEVELOPER.md         # Comprehensive Developer Guide (State, Styling, PRs, Runbook)
├── legacy-index.html    # Standalone static HTML5 portal (preserved for fallback reference)
├── styles.css           # Global design tokens, CSS variables, and typography scale
├── tests/               # Automated Unit Test Suite
│   └── error-handling.test.js # Node.js test runner suite (18 unit assertions)
├── src/                 # Functional React Application Architecture
│   ├── main.jsx         # React application root mounting onto #root
│   ├── App.jsx          # Root component (State lifting, useMemo, useCallback)
│   ├── App.module.css   # Scoped CSS Module for primary application grid layout
│   ├── styles.css       # Core design tokens and CSS custom properties
│   ├── context/
│   │   ├── CareBridgeContext.jsx # Global Context Provider (theme, language, audio, reducers)
│   │   └── reducers.js           # Pure Reducer functions for patients and prescriptions
│   ├── hooks/
│   │   └── useLocalStorage.js    # Resilient storage hook with multi-tab broadcast sync
│   ├── utils/
│   │   ├── clinicalAnalytics.js  # Triage scoring, priority & adherence math
│   │   ├── errors.js             # Custom error hierarchy & PHI redaction
│   │   └── speech.js             # Web Speech API audio synthesis engine
│   ├── data/
│   │   └── initialData.js        # Initial triage queue, medications, sample patients
│   ├── examples/                 # Isolated Styling Demonstrations (Zero UI Pollution)
│   │   ├── TailwindShowcase.jsx          # Isolated Tailwind CSS utility-class card
│   │   └── StyledComponentsShowcase.jsx  # Isolated styled-components CSS-in-JS card
│   └── components/               # Production Healthcare Components (CSS Modules)
│       ├── Header.jsx & Header.module.css
│       ├── AccessibilityToolbar.jsx & AccessibilityToolbar.module.css
│       ├── DashboardSummary.jsx & DashboardSummary.module.css
│       ├── PatientTriageForm.jsx & PatientTriageForm.module.css
│       ├── PatientQueue.jsx & PatientQueue.module.css
│       ├── PatientCard.jsx & PatientCard.module.css
│       ├── PrescriptionList.jsx & PrescriptionList.module.css
│       ├── PrescriptionCard.jsx & PrescriptionCard.module.css
│       ├── MedicationForm.jsx & MedicationForm.module.css
│       ├── StatusBanner.jsx & StatusBanner.module.css
│       └── Footer.jsx & Footer.module.css
└── js/                  # Legacy Vanilla JS modules (retained for backward compatibility)
```

---

## Architectural Principles & UI Integrity

> [!IMPORTANT]
> **Clinical UI Rule**: The end-user clinical portal is strictly dedicated to medical operations (Emergency Severity Index triage, multilingual voice guidance, and medication adherence). **No developer commands, grading rubrics, syllabus text, or technical comparison tables appear inside the clinical interface.** All developer architectural documentation is kept in this `README.md` and `DEVELOPER.md`.

---

## 1. Context API for State Sharing

The application leverages React Context (`CareBridgeContext.jsx`) to share application-wide state across distant components without intermediate prop tunneling:

- **Theme & Scale Tokens**: Persisted `theme` (`light`, `dark`, `high-contrast`), `fontScale` (`sm`, `md`, `lg`, `xl`), and `isWideSpacing` automatically synchronize with `document.documentElement` data-attributes.
- **Multilingual Prescription Voice**: `language` (`en`, `hi`, `mr`) coordinates speech synthesis and translation across the toolbar, prescription cards, and patient announcer.
- **Live Screen Reader Announcements**: `announce(message, type)` provides accessible `aria-live="polite"` feedback for screen reader users on all actions.
- **Reducer Dispatches**: Exposes `addPatient`, `completePatient`, `addPrescription`, and `toggleMedicationTaken` powered by pure reducer state machines.

```jsx
// Context Consumer Hook Pattern
import { useCareBridge } from './context/CareBridgeContext.jsx';

export function AccessibilityToolbar() {
  const { theme, setTheme, fontScale, setFontScale, language, setLanguage } = useCareBridge();
  // ...
}
```

---

## 2. Prop Drilling vs Context API

CareBridge intentionally balances **Prop Drilling** and **Context API** based on architectural boundary requirements:

| Dimension | Prop Drilling | Context API |
| :--- | :--- | :--- |
| **Primary Scope** | Local, direct parent-to-child component hierarchy | Cross-cutting, application-wide global state |
| **Typical Use in CareBridge** | `PatientQueue` passing `patient` record and `onCallPatient` callback to `PatientCard` | `Header`, `AccessibilityToolbar`, and `StatusBanner` consuming theme and language |
| **Coupling** | Loosely coupled; child components remain pure and easily testable | Components are coupled to the Provider context |
| **Performance Overhead** | Minimal; only components along the direct path re-render | Can cause broad re-renders if context values are not memoized or split |
| **Maintainability** | High clarity for shallow trees (1–2 levels); verbose if passing through 4+ intermediate components | Eliminates boilerplate for universal tokens; harder to trace data flow if overused |

### Recommended Decision Rule
- **Use Props** when: Passing data or event callbacks between direct parents and children (e.g., `PatientQueue` -> `PatientCard`, `PrescriptionList` -> `PrescriptionCard`), or when authoring reusable presentational UI elements.
- **Use Context** when: Values are required by multiple components at disparate hierarchy levels (e.g., UI Theme, Text Scale, Selected Language, Global Audio Speech status).

---

## 3. Basic State Management Patterns

CareBridge demonstrates five complementary state management patterns:

1. **Local State (`useState`)**:
   - Manages component-scoped UI behavior, such as search input values, active filter tabs (`all`, `urgent`, `priority`, `routine`), and form validation errors inside `PatientTriageForm.jsx`.
2. **Lifting State Up**:
   - The queue filter state is lifted to the closest common parent (`App.jsx`), allowing `DashboardSummary` to display patient counts while `PatientQueue` filters the list simultaneously.
3. **Context-Based State (`useContext`)**:
   - Global clinical preferences (theme, typography scaling, live aria announcements) reside in `CareBridgeContext`.
4. **Derived State (`useMemo`)**:
   - Filtered patient queues, priority counts (`urgent`, `priority`, `routine`), mean pain scores, and medication adherence percentages are calculated dynamically from source arrays via pure functions in `src/utils/clinicalAnalytics.js`. No duplicated state is stored in memory.
5. **Reducer-Based State (`useReducer`)**:
   - Complex domain transitions (adding a patient, discharging/completing a patient, logging a taken medication) are handled by pure reducer functions (`patientReducer`, `prescriptionReducer`) with explicit action types (`ADD_PATIENT`, `COMPLETE_PATIENT`, `ADD_PRESCRIPTION`, `TOGGLE_TAKEN`).

---

## 4. Styling Systems: CSS Modules, Tailwind CSS & Styled-components

### Primary Styling: CSS Modules
CareBridge uses **CSS Modules** (`*.module.css`) as its primary production styling approach:
- **Zero Class Collision**: Class names are uniquely hashed at build time by Vite (e.g., `_patientCard_abc123`).
- **Separation of Concerns**: Clinical markup remains semantic and clean without lengthy utility strings.
- **Global Token Integration**: Scoped modules consume global CSS custom properties defined in `src/styles.css` (`var(--card-bg)`, `var(--primary-500)`), preserving high-contrast mode and text scaling.

### Isolated Utility-Class Example: Tailwind CSS
Demonstrated in [`src/examples/TailwindShowcase.jsx`](src/examples/TailwindShowcase.jsx):
- Uses utility classes (`flex`, `grid-cols-3`, `bg-white`, `rounded-xl`, `shadow-sm`, `text-slate-900`) for rapid responsive styling.
- Demonstrates conditional utility strings for priority badges without separate CSS files.

### Isolated CSS-in-JS Example: Styled-components
Demonstrated in [`src/examples/StyledComponentsShowcase.jsx`](src/examples/StyledComponentsShowcase.jsx):
- Uses tagged template literals (`styled.button`, `styled.span`) to co-locate component logic and styles.
- Features dynamic props (`$priority`, `$variant`, `$size`) evaluated at runtime.

---

## 5. Styling Comparison Matrix

| Feature | CSS Modules (CareBridge Production) | Tailwind CSS (Isolated Showcase) | styled-components (Isolated Showcase) |
| :--- | :--- | :--- | :--- |
| **How Styles are Authored** | Separate scoped CSS files (`Component.module.css`) | Utility class strings directly in JSX `className` | Tagged template literals in JavaScript/JSX |
| **Scoping & Collision Prevention** | Build-time classname hashing (`_card_1a2b3`) | Predefined atomic class dictionary | Dynamically generated runtime class names |
| **Dynamic Props & Theming** | CSS Custom Properties & `[data-theme]` attributes | Class composition or arbitrary value syntax | Native JavaScript prop interpolation (`${props => ...}`) |
| **Responsive Design** | Standard `@media` queries within scoped CSS files | Responsive class prefixes (`sm:`, `md:`, `lg:`) | Nested `@media` rules within styled literals |
| **Performance & Bundle Size** | Zero runtime overhead; extracted to static `.css` | Extremely small after CSS purging; no JS runtime | Small runtime CSS-in-JS injection overhead |
| **Vite Configuration** | Supported out-of-the-box by Vite with 0 extra plugins | Requires Tailwind Vite plugin / PostCSS config | Requires `styled-components` npm package |
| **Best Used For** | Large, accessible enterprise portals with strict design systems | Rapid prototyping and utility-driven responsive design | Component libraries with heavy prop-driven dynamic variations |

---

## Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
# (or 'npm start') -> Runs at http://localhost:3000

# 3. Run automated clinical test suite (18 unit assertions)
npm test

# 4. Build optimized production bundle
npm run build

# 5. Preview production build
npm run preview
```

Open `http://localhost:3000` in your browser. All clinical features, high-contrast themes, font scaling, and Hindi/Marathi speech synthesis operate with zero errors.

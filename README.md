# CareBridge — Patient Triage & Multilingual Prescription Reader

A responsive, accessible, single-page clinical healthcare web application designed as an authentic medical facility portal. Built with **semantic HTML5**, **modern CSS3**, and **ES6+ modular JavaScript**.

---

## Workspace Directory & File Manifest

All project files are saved and organized in the `Healthcare/` root directory:

```
Healthcare/
├── index.html           # Core semantic HTML5 portal (landmarks, forms, output, progress, ARIA)
├── styles.css           # Modern CSS3 design tokens, theme engines, CSS Grid, Flexbox, media queries
├── README.md            # Project architecture and running instructions
├── DEVELOPER.md         # Comprehensive Git, GitHub workflow, NPM, and Testing runbook
├── package.json         # NPM manifest, scripts, metadata (ES Modules)
├── package-lock.json    # Exact dependency tree & cryptographic integrity hashes
├── .gitignore           # Protects credentials, node_modules, and logs
├── app.js               # Standalone legacy controller bundle (kept for reference)
├── tests/               # Automated Unit Test Suite
│   └── error-handling.test.js # Node.js test runner suite (18 unit assertions)
└── js/                  # ES6+ Modular Client-Side Architecture
    ├── errors.js        # Custom error classes (ValidationError, ApiError, StorageError, PHI redaction)
    ├── data.js          # Clinical data models, triage initial state, multilingual translations
    ├── clinical.js      # Analytics, triage assessment, validation, and safe storage operations
    ├── speech.js        # Web Speech API accessible voice reader (find, speech synthesis)
    ├── render.js        # Dynamic template-literal HTML generators (map, destructuring, Object.entries)
    └── main.js          # Application state controller, immutable spread operations, event listeners
```

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

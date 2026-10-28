# Task 03 — Asynchronous JavaScript and Browser APIs

This directory demonstrates client-side asynchronous programming and Web APIs:

## Key Features
- **Asynchronous Execution**: Promises and `async`/`await` for asynchronous clinical data retrieval.
- **Web Speech API (`speechSynthesis`)**:
  - Multilingual voice synthesis in English (`en-IN`/`en-US`), Hindi (`hi-IN`), and Marathi (`mr-IN`).
  - Voice cancellation, pause/resume, and voice boundary event listeners.
- **Persistent Storage API (`localStorage`)**:
  - Resilient storage abstraction with try/catch wrapping to prevent QuotaExceededError crashes.
  - Cross-tab synchronization via `window.addEventListener('storage', ...)`.
- **Files**:
  - `speech.js`: Browser Web Speech API audio controller.
  - `render.js`: Dynamic DOM rendering and aria-live announcements.


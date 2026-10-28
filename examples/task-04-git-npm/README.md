# Task 04 — Error Handling, Git, and NPM

This directory documents structured error handling, package management, and collaborative Git practices:

## Key Features
- **Custom Error Class Hierarchy**:
  - `CareBridgeError`: Base application error with timestamp and userMessage.
  - `ValidationError`: Form input validation with faulty field identification.
  - `ApiError`: Preserves HTTP status code, endpoint, and statusText.
  - `StorageError`: Captures quota failures and storage corruption.
- **NPM Package Management**:
  - Semantic versioning, `"type": "module"`, lockfile determinism.
- **Git Branching & PR Standard**:
  - Feature branches, pull requests, conventional commits, and merge conflict resolution.
- **Files**:
  - `errors.js`: Full custom error classes with PHI-safe diagnostic logger.


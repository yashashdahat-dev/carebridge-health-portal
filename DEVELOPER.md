# CareBridge — Developer Guide: GitHub Workflow, NPM, and Error Handling

This guide is intended for clinical portal developers and contributors. In adherence with medical UI design rules, **no developer commands, Git instructions, or NPM details are exposed on the end-user clinical webpage (`index.html`)**.

---

## Table of Contents
1. [NPM Fundamentals & CLI Reference](#1-npm-fundamentals--cli-reference)
2. [Project Configuration & Scripts](#2-project-configuration--scripts)
3. [Step-by-Step GitHub Setup Guide](#3-step-by-step-github-setup-guide)
4. [Branching and Merging Workflow](#4-branching-and-merging-workflow)
5. [Pull Request (PR) Standard & Review Checklist](#5-pull-request-pr-standard--review-checklist)
6. [Resolving Merge Conflicts](#6-resolving-merge-conflicts)
7. [JavaScript Error Handling Architecture](#7-javascript-error-handling-architecture)
8. [Comprehensive Verification & Testing Runbook](#8-comprehensive-verification--testing-runbook)

---

## 1. NPM Fundamentals & CLI Reference

NPM (Node Package Manager) coordinates libraries, build tools, and scripts for Node.js environments.

### Core CLI Commands Explained
| Command | Purpose | Explanation |
| :--- | :--- | :--- |
| `node --version` | Runtime Inspection | Prints the installed version of Node.js. |
| `npm --version` | Tooling Inspection | Prints the installed version of the NPM CLI. |
| `npm init -y` | Manifest Scaffolding | Creates a fresh `package.json` with sensible defaults. |
| `npm install` | Dependency Resolution | Reads `package.json` and installs all listed dependencies. |
| `npm install <pkg>` | Add Runtime Dependency | Downloads `<pkg>`, writes it to `node_modules/`, and adds it to `"dependencies"`. |
| `npm install -D <pkg>` | Add Dev Dependency | Downloads `<pkg>` and records it in `"devDependencies"`. |
| `npm uninstall <pkg>` | Remove Package | Removes `<pkg>` from `node_modules/` and updates manifest files. |
| `npm run <script>` | Script Execution | Executes arbitrary commands defined in `package.json` `"scripts"`. |
| `npm audit` | Security Vulnerability Scan | Scans installed dependencies against the npm security advisory database. |
| `npm ci` | Clean/Deterministic Install | Installs exact dependencies directly from `package-lock.json` (ideal for CI/CD pipelines). |

### `package.json` vs `package-lock.json`
- **`package.json`**: Human-readable configuration holding project metadata, script hooks, and semantic version ranges (e.g., `^14.2.4`).
- **`package-lock.json`**: Automatically generated snapshot containing exact dependency versions, sub-dependencies, and cryptographic sha512 integrity hashes. Ensures consistent builds across all developer machines.
- **Dependencies vs. DevDependencies**:
  - `dependencies`: Libraries required for application execution at runtime.
  - `devDependencies`: Tools only needed during local development, testing, or linting (e.g., `serve`).

---

## 2. Project Configuration & Scripts

CareBridge uses native ES Modules (`"type": "module"` in `package.json`), allowing standard `<script type="module" src="js/main.js"></script>` execution in browsers without bundlers like Webpack or Vite.

### Available Scripts in `package.json`
```bash
# Start local static development server at http://localhost:3000
npm run dev

# Alternative command to start the server
npm start

# Run comprehensive JavaScript syntax verification & automated unit tests
npm test

# Run dependency security audit
npm run audit
```

---

## 3. Step-by-Step GitHub Setup Guide

### Distinguishing Local Code vs. GitHub Account Actions

| Action | Where Performed | Tool / Location |
| :--- | :--- | :--- |
| Writing error classes & unit tests | **Local Workspace** | VS Code / Editor |
| `git init`, `git add`, `git commit` | **Local Workspace** | Local Terminal / PowerShell |
| Creating GitHub account & 2FA | **Remote Platform** | Browser at [github.com/signup](https://github.com/signup) |
| Creating `carebridge-health-portal` repository | **Remote Platform** | Browser at [github.com/new](https://github.com/new) |
| `git remote add origin ...` & `git push` | **Local Workspace** | Local Terminal |
| Opening & Merging Pull Requests | **Remote Platform** | Browser on GitHub Repository UI |

### Step 3.1: Create GitHub Account with Secure Authentication
1. Navigate to [github.com/signup](https://github.com/signup) and register with a valid email.
2. Enable Two-Factor Authentication (2FA) under **Settings > Password and authentication > Two-factor authentication**.
3. Create a Personal Access Token (PAT) under **Settings > Developer settings > Personal access tokens (classic)** with `repo` permissions, or add your SSH Public Key (`ssh-keygen -t ed25519`).

### Step 3.2: Configure Local Git Identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3.3: Create GitHub Repository
1. On GitHub, click **New Repository**.
2. Name: `carebridge-health-portal`.
3. Description: `Accessible Patient Triage & Multilingual Prescription Portal with ES6+ modules and structured clinical error handling.`
4. Set to **Public** or **Private**.
5. Leave "Initialize with README", ".gitignore", and "License" **unchecked** (we already have them locally).
6. Click **Create repository**.

### Step 3.4: Link Local Repo and Push
```bash
# Verify active branch is main
git branch -M main

# Add remote origin (replace <your-username> with your actual GitHub username)
git remote add origin https://github.com/<your-username>/carebridge-health-portal.git

# Push initial code to GitHub
git push -u origin main
```

---

## 4. Branching and Merging Workflow

Never commit experimental features directly to `main`. Use structured feature branches:

- **`main`**: Production-ready, verified clinical release branch.
- **`feature/project-setup`**: Project metadata, NPM configs, `.gitignore`, and documentation.
- **`feature/error-handling`**: Custom error hierarchy, storage limits, and API boundary resilience.

```
(main) ─────────●───────────────────────────────────────● (Release v1.0.0)
                 \                                     /
(feature/...)     ●───────●───────● (Pull Request) ───/
```

### Git Command Sequence for Feature Branches:
```bash
# 1. Switch to main and pull latest changes
git checkout main
git pull origin main

# 2. Create and switch to feature branch
git checkout -b feature/error-handling

# 3. Check modified files
git status

# 4. Stage and commit changes with descriptive message
git add js/errors.js js/clinical.js tests/error-handling.test.js
git commit -m "feat(errors): implement custom error hierarchy and unit assertions"

# 5. Push feature branch to GitHub
git push -u origin feature/error-handling
```

---

## 5. Pull Request (PR) Standard & Review Checklist

When work on a feature branch is ready:

1. Open your repository on GitHub.
2. Click **Compare & pull request** next to `feature/error-handling`.
3. Fill out the PR template:

```markdown
### PR Title: feat(errors): implement domain error classes & async try/catch/finally

#### Summary:
- Adds custom `CareBridgeError`, `ValidationError`, `ApiError`, and `StorageError` classes.
- Hardens `localStorage` operations with quota handling and corrupt JSON fallback.
- Adds clinical input validation (MRN, age 0-125, pain scale 1-10).
- Guarantees button loading state resets using `finally` blocks.
- Adds 18 automated unit tests passing under `npm test`.

#### Clinical Safety & Verification Checklist:
- [x] Zero Patient Health Information (PHI) leaked to console logs.
- [x] Screen reader announcements updated via `aria-live="polite"`.
- [x] Loading spinners and disabled buttons cleanly reset on errors.
- [x] Automated tests verified via `npm test`.
```

4. Assign a reviewer.
5. Once approved, select **Squash and merge** or **Merge pull request**.
6. Delete the remote branch on GitHub, then switch to `main` locally:
```bash
git checkout main
git pull origin main
git branch -d feature/error-handling
```

---

## 6. Resolving Merge Conflicts

If another developer pushed changes to the same file:
```bash
git checkout main
git pull origin main
git checkout feature/error-handling
git merge main
```
If Git reports `CONFLICT (content): Merge conflict in js/main.js`:
1. Open the file in VS Code.
2. Locate the conflict markers:
   ```javascript
   <<<<<<< HEAD (Current Change)
   announce('Patient admitted', 'info');
   =======
   announceStatus('Patient registered', 'success');
   >>>>>>> main (Incoming Change)
   ```
3. Edit the code to the desired combined version, removing all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. Stage and commit the resolved files:
   ```bash
   git add js/main.js
   git commit -m "fix(merge): resolve conflict between feature/error-handling and main"
   git push origin feature/error-handling
   ```

---

## 7. JavaScript Error Handling Architecture

### Custom Error Class Hierarchy
```
Error (Native JavaScript)
 └── CareBridgeError (Base Clinical Error)
      ├── ValidationError (Form inputs, biological boundaries, MRN format)
      ├── ApiError (HTTP status codes, endpoint failures, network timeouts)
      └── StorageError (Quota exhaustion, corruption, disabled storage)
```

### Key Safety Rules
1. **Never Leak PHI**: `logDiagnostic()` redacts patient names, phone numbers, MRNs, notes, and raw symptoms before writing to console.
2. **Always Reset UI in `finally`**: Buttons, spinners, and progress indicators must reset in `finally` blocks so users are never permanently locked out of the form.
3. **Graceful Fallbacks**: If `fetchMedicationSafetyData` encounters a network outage, it safely returns an offline cache without freezing the application.

---

## 8. Comprehensive Verification & Testing Runbook

### Test 1: Run Automated Unit Tests
```bash
npm test
```
*Expected Result:* 18 tests across 4 suites pass with 0 failures.

### Test 2: Verify Form Validation (`ValidationError`)
1. Launch app with `npm run dev` and open `http://localhost:3000`.
2. In the Triage Form, enter single character name `A` or age `150`.
3. Submit the form.
4. *Expected Result:* The live announcer status banner displays a clear warning. The input field receives focus and retains red focus outline. Loading button is immediately re-enabled.

### Test 3: Verify Storage Recovery (`StorageError`)
1. Open browser DevTools Console.
2. Intentionally corrupt stored triage data:
   ```javascript
   localStorage.setItem('carebridge_triage_queue_v1', '{corrupt-json');
   location.reload();
   ```
3. *Expected Result:* The application does not crash. It catches `StorageError`, logs a redacted diagnostic, restores default clinical patients, and remains fully interactive.

### Test 4: Verify API Error & Offline Mode (`ApiError`)
1. Turn off device Wi-Fi or set Network to **Offline** in browser DevTools.
2. Search for a medication in the drug formulary lookup.
3. *Expected Result:* The application catches `ApiError` (Status 0 / Network Failure), presents a polite notification via the live announcer, and does not break other triage or voice features.


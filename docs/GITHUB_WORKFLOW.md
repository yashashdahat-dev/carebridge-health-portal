# CareBridge — GitHub Workflow & Collaboration Guide

This document establishes development workflows, branching conventions, pull request review standards, and conflict resolution protocols for CareBridge contributors.

---

## 1. Branching Strategy

CareBridge follows a structured feature branch workflow:

```text
main (Protected production branch)
 ├── feature/task-05-react-components
 ├── feature/task-06-react-router
 ├── feature/task-07-context-styling
 └── feature/task-08-09-node-express-db
```

### Branch Naming Conventions
- `feature/<task-name>`: New capabilities or functional enhancements.
- `fix/<bug-description>`: Bug repairs and validation corrections.
- `docs/<doc-name>`: Documentation, runbooks, and diagrams.
- `chore/<tooling>`: Build system or dependency updates.

---

## 2. Commit Message Standards

Follow Conventional Commits:
- `feat(...)`: New feature (e.g., `feat(router): implement multi-page React Router navigation`)
- `fix(...)`: Bug fix (e.g., `fix(triage): enforce 1-10 pain score boundary`)
- `docs(...)`: Documentation changes (e.g., `docs(api): document RFC 5988 Link headers`)
- `test(...)`: Adding or modifying automated unit/integration tests
- `refactor(...)`: Code refactoring without behavioral alterations

---

## 3. Pull Request (PR) Checklist

Before submitting a Pull Request, verify:
- [x] `npm test` passes all 36 automated test assertions.
- [x] `npm run build` generates `dist/` with 0 compile errors.
- [x] No PHI (Protected Health Information) is present in code or mock fixtures.
- [x] Clinical UI remains focused on patient care (zero syllabus jargon in `index.html`).
- [x] All relative imports and asset paths resolve cleanly.

---

## 4. Resolving Merge Conflicts

If git indicates conflict markers during a merge:
```bash
# 1. Fetch remote changes
git fetch origin main

# 2. Merge main into your feature branch
git merge origin/main

# 3. Open conflicting files and resolve markers:
# <<<<<<< HEAD (Your branch)
# =======
# >>>>>>> origin/main (Remote changes)

# 4. Stage and commit resolved files
git add <resolved-file>
git commit -m "fix(merge): resolve conflict with main"
git push origin <feature-branch>
```


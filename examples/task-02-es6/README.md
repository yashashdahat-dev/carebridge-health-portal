# Task 02 — ES6+ JavaScript Modularization

This directory demonstrates modern ES6+ features in clinical logic:

## Key Features
- **Modern Syntax**: `const` and `let`, arrow functions (`const assess = (patient) => ...`), and template literals.
- **Destructuring & Rest/Spread**: Deep property extraction from clinical objects (`const { name, painLevel, symptoms = [] } = patient`).
- **Array Transformations**:
  - `map()`: Transforming raw patient objects into formatted triage records.
  - `filter()`: Filtering active queue by urgency (`priority === 'urgent'`).
  - `reduce()`: Computing real-time mean pain score and medication adherence percentage.
  - `some()` & `every()`: Checking for urgent flags and complete medication adherence.
- **Files**:
  - `clinical.js`: Triage scoring engine and adherence analytics.
  - `data.js`: Clinical constants, critical symptoms list, priority tier configuration.


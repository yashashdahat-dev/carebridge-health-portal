# CareBridge — Database Architecture & Data Modeling

This document details the relational database schema, ORM layers, NoSQL document models, and indexing strategies implemented in CareBridge.

---

## 1. Relational Database Design (PostgreSQL / MySQL)

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    DEPARTMENTS ||--o{ PATIENTS : "admits"
    PATIENTS ||--o{ PATIENT_SYMPTOMS : "exhibits"
    SYMPTOMS ||--o{ PATIENT_SYMPTOMS : "classified_in"
    PATIENTS ||--o{ PRESCRIPTIONS : "prescribed"

    DEPARTMENTS {
        int id PK
        string code UK
        string name
        int floor
        boolean emergency_capable
    }

    PATIENTS {
        string id PK
        string mrn UK
        string full_name
        int age
        string phone
        int department_id FK
        int pain_level
        string priority
        time arrival_time
        boolean discharged
    }

    SYMPTOMS {
        int id PK
        string name UK
        boolean is_critical
    }

    PATIENT_SYMPTOMS {
        string patient_id PK, FK
        int symptom_id PK, FK
        string severity
    }

    PRESCRIPTIONS {
        string id PK
        string patient_id FK
        string drug_name
        string dosage
        string scheduled_time
        string meal_timing
        boolean taken
        timestamp last_taken_at
        text instructions_en
        text instructions_hi
        text instructions_mr
    }
```

### Performance Indexes
- `idx_patients_priority`: B-tree index to accelerate triage queue filtering (`WHERE priority = 'urgent'`).
- `idx_patients_mrn`: Unique B-tree index for rapid medical record number lookups.
- `idx_patients_created_at`: Descending index for real-time queue ordering.
- `idx_prescriptions_patient`: Foreign key index accelerating prescription retrieval by patient ID.

---

## 2. ORM Layer (Prisma & Sequelize)

- **Prisma ([`database/prisma/schema.prisma`](../database/prisma/schema.prisma))**:
  - Declarative data model mapping.
  - Relation attributes (`@relation`) maintaining referential integrity.
  - Auto-generated type-safe database client.
- **Sequelize ([`models/sequelizeModels.js`](../models/sequelizeModels.js))**:
  - Programmatic model declaration with `sequelize.define()`.
  - Built-in data type validations and relational associations (`hasMany`, `belongsTo`).

---

## 3. NoSQL Document Store (MongoDB & Mongoose)

- **Mongoose Models ([`database/mongodb/models/`](../database/mongodb/models/))**:
  - `Patient.js`: Document schema with regex MRN validation, age bounds, virtual property `isEmergency`, and pre-save normalization.
  - `Prescription.js`: Document schema supporting multilingual instruction subdocuments (`en`, `hi`, `mr`).


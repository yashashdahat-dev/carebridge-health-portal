# Task 09 — Databases, ORMs, and RESTful API Standards

This directory documents relational database design, ORMs, document stores, and REST best practices:

## Key Features
- **Relational SQL Database (`database/sql/schema.sql`)**: PostgreSQL/MySQL DDL with tables, foreign keys, and indexes.
- **ORM & ODM Models**:
  - Prisma Schema (`database/prisma/schema.prisma`).
  - Sequelize Models (`models/sequelizeModels.js`).
  - Mongoose Document Schemas (`database/mongodb/models/`).
- **RESTful API Standards**:
  - URI Versioning (`/api/v1/*`).
  - Server-side pagination with RFC 5988 `Link` headers and `X-Total-Count`.
  - Multi-field sorting (`?sort=-painLevel,name`) and filtering.
  - Multi-transport centralized logging (`utils/logger.js`).


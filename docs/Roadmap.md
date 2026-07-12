# Project Roadmap - FlowCRM 🗺

This document defines the development phases and milestones for building **FlowCRM**. Each phase delivers high-cohesion functionality ending with an active integration verification.

---

## Roadmap Overview

```
Phase 1: Setup & Boilerplate (Current)
        │
        ▼
Phase 2: Auth & Multi-Tenancy (Backend Guards + Frontend Logic)
        │
        ▼
Phase 3: Customer & Contact Management
        │
        ▼
Phase 4: Leads Engine & Deals Pipeline (Kanban stages, conversion)
        │
        ▼
Phase 5: Tasks, Activities & Calendar Scheduling
        │
        ▼
Phase 6: Analytics Dashboard & Reports (Chart.js integrations)
```

---

## Phased Schedule

### 🏁 Phase 1: Workspace & Boilerplate Setup
- **Objectives**: Set up repository files, create base specs, initialize backend (NestJS) and frontend (Angular) structures.
- **Tasks**:
  - [x] Establish documentation schemas in `docs/`.
  - [ ] Initialize NestJS boilerplate with standard structure.
  - [ ] Initialize Angular boilerplate with Material, CDK, routing, and SCSS.
- **Milestone**: The frontend and backend run independently and compile successfully.

### 🔐 Phase 2: Authentication & Access Control (RBAC)
- **Objectives**: Implement security bounds, login/register, multi-tenant checks, and route/API protection.
- **Tasks**:
  - Configure MongoDB connection with Mongoose in NestJS.
  - Build `AuthModule` containing register (Organization + Admin User), login, and token generation.
  - Build NestJS `JwtStrategy` and custom Roles Guard.
  - Build Angular Core module with Auth Service and Route Guards.
- **Milestone**: Users can register and log in; non-authenticated requests receive 401; roles determine routing access.

### 🏢 Phase 3: Organizations & User Management
- **Objectives**: Let organization admins invite team members and configure organizational boundary parameters.
- **Tasks**:
  - Add API endpoints to list, create, and disable organization users.
  - Build frontend User Management console.
- **Milestone**: Admin can create a new Sales Executive and verify they can log in.

### 💼 Phase 4: Leads Engine & Sales Pipeline
- **Objectives**: Track sales opportunities from potential leads to won/lost deals.
- **Tasks**:
  - Create Leads schemas, controllers, and services with pagination.
  - Create Deals schemas and Kanban stage controls.
  - Implement Lead-to-Customer conversion flow.
  - Build Angular Leads dashboard and Deals Kanban Board (using Angular CDK Drag & Drop).
- **Milestone**: Sales agent logs a lead, qualifies it, converts it to a customer/deal, and drags the deal to the "Closed Won" stage on the Kanban board.

### 📅 Phase 5: Tasks, Activities, & Calendaring
- **Objectives**: Allow team members to schedule tasks, log sales calls, write notes, and track agendas.
- **Tasks**:
  - Create Task and Activity models.
  - Implement activities logging automatic trigger (audit trails on Deal/Lead changes).
  - Build Tasks and Calendar list views on the frontend.
- **Milestone**: User completes a task, adding an automated entry to the customer's timeline.

### 📊 Phase 6: Analytics & Reports
- **Objectives**: Provide visual summaries of pipeline health and executive performance metrics.
- **Tasks**:
  - Create aggregation queries in NestJS for deals value, pipeline velocity, and lead conversion rates.
  - Integrate Chart.js in Angular to display analytics.
- **Milestone**: Dashboard displays deal value distribution by stage and lead source percentages.

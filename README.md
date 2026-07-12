# FlowCRM 🚀

FlowCRM is a modern, enterprise-inspired Customer Relationship Management (CRM) platform designed to understand how real-world business software is engineered, structured, and developed.

This application is inspired by industry-standard CRM platforms like Salesforce, HubSpot, and Zoho CRM, focusing on clean architecture, modularity, and enterprise development workflows.

---

## 🎯 Project Goals
- **Enterprise Software Development**: Learn how real-world business software is designed.
- **Scalable Architecture**: Build modules that can scale and remain maintainable.
- **Clean Code & Modularity**: Focus on DRY, KISS, and SOLID design principles.
- **RBAC**: Implement robust Role-Based Access Control on both frontend and backend.
- **Portfolio SaaS**: Build a production-ready application showcasing modern engineering practices.

---

## 💻 Tech Stack
- **Frontend**: Angular 18+, TypeScript, Angular Material, Angular Signals, Angular CDK, SCSS, Chart.js
- **Backend**: NestJS, TypeScript, MongoDB Atlas, Mongoose, Passport.js, JWT Authentication, Class Validator
- **Database**: MongoDB Atlas

*Note: No Tailwind CSS, NgRx, PostgreSQL, or external message queues are used in the initial architecture to keep learning focused on core structures.*

---

## 🏛 Software Architecture

### System Architecture
```
Client
  │
  ▼
Angular Frontend
  │
REST API
  │
  ▼
NestJS Backend
  │
Business Logic
  │
MongoDB Atlas
```

### Backend Layer Architecture
```
Request ──► Controller ──► Service ──► Repository / Model ──► MongoDB
```

---

## 📁 Repository Structure
```
CRM/
├── backend/            # NestJS Backend Application
├── frontend/           # Angular Frontend Application
├── docs/               # Technical Documentation
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Database.md
│   ├── API.md
│   ├── Roadmap.md
│   ├── Coding-Standards.md
│   └── Changelog.md
├── diagrams/           # Design Diagrams
└── README.md           # Project Readme
```

---

## 🔑 Role-Based Access Control (RBAC)
- **Super Admin**: Full platform configuration and tenant/org management.
- **Organization Admin**: Manage organization settings, users, and customer records.
- **Sales Manager**: Manage sales teams, assign leads, and view performance reports.
- **Sales Executive**: Manage assigned leads, deals, contacts, and daily tasks.
- **Support Executive**: Manage support tickets and review customer notes.
- **Marketing Executive**: Design marketing campaigns and capture incoming leads.

---

## 🛠 Getting Started

Detailed installation and setup instructions will be added in subsequent setup phases. See [Roadmap.md](file:///c:/Users/ahana/Desktop/CRM/CRM/docs/Roadmap.md) for future release steps.
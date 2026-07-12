# Product Requirement Document (PRD) - FlowCRM 🚀

## 1. Introduction & Overview
FlowCRM is an enterprise-inspired Customer Relationship Management (CRM) platform designed to streamline customer lifecycle management, sales pipelines, task tracking, organization management, and reporting.

### 1.1 Objective
To construct a modular, secure, and clean CRM application using NestJS and Angular, allowing businesses to manage their customers, leads, pipelines, contacts, tasks, calendars, activities, and notifications with robust Role-Based Access Control (RBAC).

---

## 2. Target Audience & Roles
FlowCRM handles organizations with multiple user roles, each possessing distinct access levels:
- **Super Admin**: Manages system configurations, organizations, billing, and system-wide audits.
- **Organization Admin**: Performs user provisioning, organization setups, and full data access/management within their organization.
- **Sales Manager**: Views team performance reports, assigns/reassigns leads, reviews pipelines, and monitors activities.
- **Sales Executive**: Manages owned/assigned leads, deals, contacts, activities, tasks, and schedules.
- **Support Executive**: Views client portfolios, logs interaction notes, and manages support tickets.
- **Marketing Executive**: Generates leads via campaigns and handles lead ingestion.

---

## 3. Scope & Core Modules

### 3.1 Authentication & Authorization
- **Register & Login**: JWT-based secure session tokens.
- **Forgot/Reset Password**: Email-based verification workflow.
- **Role-Based Access Control (RBAC)**: Fine-grained backend guards (`NestJS Guards`) and frontend routing filters (`Angular CanActivate` guards) using JWT claims.

### 3.2 Organization & User Management
- **Organization Setup**: Companies register an organization account. All data belongs strictly to that organization (multi-tenant boundary).
- **User Provisioning**: Admins invite or create users and assign specific roles.

### 3.3 Leads, Contacts, & Customer Management
- **Lead Intake**: Capture potential prospects, assign status (New, Contacted, Qualified, Lost), source, and owner.
- **Convert Leads**: Convert qualified leads into Contacts and associated Customers/Deals.
- **Customer Directory**: View companies and their related contacts, deals, activities, and communication logs.
- **Contact Management**: Store phone, email, LinkedIn, and communication details.

### 3.4 Deals & Sales Pipeline
- **Visual Pipeline**: Manage deals categorized by stage (e.g., Prospecting, Qualification, Proposal, Negotiation, Won, Lost).
- **Deals Dashboard**: View estimated close date, monetary value, win probability, and assign owner.

### 3.5 Activities & Tasks
- **Activity Feed**: System records user actions (e.g., created deal, modified lead, logged call).
- **Task Management**: Create tasks, set priority, assign to team members, set due dates, and mark status (Todo, In-Progress, Completed).

### 3.6 Calendar & Scheduling
- **Event Scheduling**: Book meetings, set reminders, link to contacts/deals.
- **Agenda View**: Visual view of scheduled events.

### 3.7 Notifications & Emails
- **System Notifications**: Receive in-app updates for task due dates, deal stage changes, and assigned leads.
- **Email History**: Log communications sent to prospects.

### 3.8 Analytics & Reporting
- **Sales Pipeline Health**: Total deals, conversion rates, and sales velocity charts.
- **Lead Metrics**: Lead sources, response times, and quality charts.
- **Team Activity**: Count of tasks completed, calls logged, and meetings held.

---

## 4. Non-Functional Requirements

### 4.1 Security
- Password hashing using `bcrypt`.
- JWT tokens with short expiry (e.g., 1 hour) and refresh tokens.
- Database authorization scoping (prevent cross-tenant data leakage).
- API request payload validation using `class-validator`.

### 4.2 Performance
- API response times under 200ms for standard read/write operations.
- Page load times under 2.5s for frontend views.
- Proper pagination for listings (leads, customers, deals).

### 4.3 Scalability & Code Quality
- Standardized RESTful routing.
- Code separation (Controller handles requests; Service handles business logic; Mongoose models handle DB).
- Responsive UI using Angular Material.

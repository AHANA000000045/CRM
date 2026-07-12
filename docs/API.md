# REST API Specification - FlowCRM 🔌

This document defines the REST API routes, HTTP methods, headers, payload objects, and expected response models for **FlowCRM**. All API routes are prefixed with `/api/v1`.

---

## 1. Global Standards & Headers

### 1.1 Content Negotiation
- **Request Content-Type**: `application/json`
- **Response Content-Type**: `application/json`

### 1.2 Headers
- **Authorization**: `Bearer <JWT_TOKEN>` (Required for all routes except Authentication guest routes)

### 1.3 Standard Error Response (RFC 7807 inspired)
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"],
  "error": "Bad Request",
  "timestamp": "2026-07-12T12:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

---

## 2. Route Manifest

### 2.1 Authentication (`/api/v1/auth`)

#### `POST /auth/register`
Creates a new tenant `Organization` and provisions its first `Organization Admin` user account.
- **Request Payload**:
```json
{
  "organizationName": "Acme Corp",
  "domain": "acme.com",
  "email": "admin@acme.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Registration successful",
  "userId": "60d0fe4f5311236168a109a1",
  "organizationId": "60d0fe4f5311236168a109a0"
}
```

#### `POST /auth/login`
Authenticates a user and issues a JWT bearer token.
- **Request Payload**:
```json
{
  "email": "admin@acme.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "60d0fe4f5311236168a109a1",
    "email": "admin@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Organization Admin"
  }
}
```

#### `GET /auth/profile`
Retrieves details of the currently authenticated user session.
- **Headers**: `Authorization: Bearer <JWT>`
- **Response (200 OK)**:
```json
{
  "id": "60d0fe4f5311236168a109a1",
  "email": "admin@acme.com",
  "role": "Organization Admin",
  "organization": {
    "id": "60d0fe4f5311236168a109a0",
    "name": "Acme Corp",
    "billingPlan": "Free"
  }
}
```

---

### 2.2 User Management (`/api/v1/users`)

#### `GET /users`
List users belonging to the authenticated user's organization.
- **Response (200 OK)**:
```json
[
  {
    "id": "60d0fe4f5311236168a109a1",
    "email": "admin@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Organization Admin",
    "isActive": true
  }
]
```

#### `POST /users`
Invite/create a user inside the organization. (Authorized Roles: `Super Admin`, `Organization Admin`).
- **Request Payload**:
```json
{
  "email": "sales.exec@acme.com",
  "password": "TemporaryPassword1!",
  "firstName": "Sarah",
  "lastName": "Connor",
  "role": "Sales Executive"
}
```
- **Response (201 Created)**:
```json
{
  "id": "60d0fe4f5311236168a109b5",
  "email": "sales.exec@acme.com",
  "role": "Sales Executive",
  "isActive": true
}
```

---

### 2.3 Leads (`/api/v1/leads`)

#### `GET /leads`
Lists leads with query-based pagination, sorting, search, and filtering.
- **Parameters**: `page=1`, `limit=10`, `status=New`, `search=Acme`
- **Response (200 OK)**:
```json
{
  "docs": [
    {
      "id": "60d0fe4f5311236168a109c1",
      "firstName": "Bruce",
      "lastName": "Wayne",
      "company": "Wayne Enterprises",
      "email": "bruce@wayne.com",
      "status": "New",
      "estimatedValue": 50000,
      "owner": {
        "id": "60d0fe4f5311236168a109b5",
        "firstName": "Sarah",
        "lastName": "Connor"
      }
    }
  ],
  "totalDocs": 1,
  "totalPages": 1,
  "page": 1
}
```

#### `POST /leads`
Creates a new lead.
- **Request Payload**:
```json
{
  "firstName": "Bruce",
  "lastName": "Wayne",
  "company": "Wayne Enterprises",
  "email": "bruce@wayne.com",
  "phone": "+15550199",
  "status": "New",
  "source": "Website",
  "estimatedValue": 50000,
  "notes": "Interested in premium subscription."
}
```
- **Response (201 Created)**: Returns the newly created lead object.

#### `POST /leads/:id/convert`
Converts a `Qualified` lead to a `Customer`, creating an associated `Contact` and an optional `Deal`.
- **Response (200 OK)**:
```json
{
  "message": "Lead converted successfully",
  "customerId": "60d0fe4f5311236168a109d1",
  "contactId": "60d0fe4f5311236168a109d2",
  "dealId": "60d0fe4f5311236168a109d3"
}
```

---

### 2.4 Deals (`/api/v1/deals`)

#### `GET /deals`
Lists deals inside the organization, grouped or filtered by stages.
- **Response (200 OK)**: List of deal objects including stage and estimated value.

#### `PATCH /deals/:id`
Updates fields, including stages (facilitating drag-and-drop Kanban updates).
- **Request Payload**:
```json
{
  "stage": "Proposal",
  "probability": 50
}
```
- **Response (200 OK)**: Updated deal object.

---

### 2.5 Tasks (`/api/v1/tasks`)

#### `GET /tasks`
List active tasks assigned to the user or organization.
- **Response (200 OK)**: List of tasks with status, priority, and link metadata.

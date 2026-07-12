# Database Design & Schemas - FlowCRM 🗄

This document details the MongoDB collections and Mongoose schemas used in **FlowCRM**. All schemas implement audit timestamps (`createdAt`, `updatedAt`) and multi-tenant scoping (`organizationId`).

---

## 1. Entity Relationship Overview
MongoDB models use referenced document linking rather than heavy embedding. This aligns with standard enterprise structures where items (Contacts, Deals, Activities) refer back to a central Organization or Customer.

```
          ┌─────────────────┐
          │  Organization   │
          └────────┬────────┘
                   │ 1:N
     ┌─────────────┼─────────────┬─────────────┐
     ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  User   │   │  Lead   │   │Customer │   │  Task   │
└─────────┘   └─────────┘   └────┬────┘   └─────────┘
                                 │ 1:N
                            ┌────┴────┐
                            ▼         ▼
                       ┌─────────┐┌─────────┐
                       │ Contact ││  Deal   │
                       └─────────┘└─────────┘
```

---

## 2. Model Specifications

### 2.1 Organization Schema
Represents a customer company subscribing to the FlowCRM SaaS.
- **Collection**: `organizations`
- **Schema**:
```typescript
{
  name: { type: String, required: true },
  domain: { type: String, unique: true },
  billingPlan: { type: String, enum: ['Free', 'Growth', 'Enterprise'], default: 'Free' },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 User Schema
Represents a team member within an organization.
- **Collection**: `users`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Hashed
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Organization Admin', 'Sales Manager', 'Sales Executive', 'Support Executive', 'Marketing Executive'],
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```
- **Indexes**: Unique compound index `{ email: 1 }`, tenant compound index `{ organizationId: 1 }`.

### 2.3 Customer (Account) Schema
Represents a business entity/client who purchases from the organization.
- **Collection**: `customers`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Contact Schema
Represents a single human contact at a Customer company.
- **Collection**: `contacts`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  position: { type: String },
  isPrimary: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 Lead Schema
Represents a potential client opportunity prior to official conversion.
- **Collection**: `leads`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Lost'], 
    default: 'New' 
  },
  source: { 
    type: String, 
    enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Other'], 
    default: 'Other' 
  },
  estimatedValue: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.6 Deal Schema
Represents active sales opportunities linked to custom stages.
- **Collection**: `deals`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  stage: { 
    type: String, 
    enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting'
  },
  probability: { type: Number, default: 10 }, // Percentage
  expectedCloseDate: { type: Date },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.7 Task Schema
Represents action items assigned to users.
- **Collection**: `tasks`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'In-Progress', 'Completed'], default: 'Todo' },
  relatedTo: {
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String, enum: ['Lead', 'Customer', 'Deal'] }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.8 Activity (Audit/Log) Schema
Represents call logs, email drafts, meetings, and major system events.
- **Collection**: `activities`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, enum: ['Call', 'Email', 'Meeting', 'Note', 'System Log'], required: true },
  details: { type: String, required: true },
  relatedTo: {
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String, enum: ['Lead', 'Customer', 'Deal'] }
  },
  timestamp: { type: Date, default: Date.now }
}
```

### 2.9 Notification Schema
Represents real-time in-app alerts for users.
- **Collection**: `notifications`
- **Schema**:
```typescript
{
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

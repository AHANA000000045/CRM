# Coding Standards & Conventions - FlowCRM 📝

This document establishes the style guidelines, coding practices, naming conventions, and development procedures to maintain high quality and cohesion throughout the codebase.

---

## 1. General Principles
- **DRY (Don't Repeat Yourself)**: Abstract redundant code into utilities or shared services.
- **KISS (Keep It Simple, Stupid)**: Write clear, readable logic. Do not over-engineer solutions.
- **SOLID**: Follow single responsibility, open-closed, Liskov substitution, interface segregation, and dependency inversion principles.
- **Explicit Types**: Avoid `any` in TypeScript. All variables, function parameters, and return types must be explicitly typed.

---

## 2. Backend Standards (NestJS)

### 2.1 Directory Structure
Each feature module must resides in its own directory within `src/modules/` containing:
```
modules/leads/
├── dto/
│   ├── create-lead.dto.ts
│   └── update-lead.dto.ts
├── schemas/
│   └── lead.schema.ts
├── leads.controller.ts
├── leads.service.ts
└── leads.module.ts
```

### 2.2 Naming Conventions
- **Files**: kebab-case with descriptive extension (e.g. `auth.controller.ts`, `create-user.dto.ts`).
- **Classes**: PascalCase with type suffix (e.g. `UsersController`, `UsersService`, `UserSchema`).
- **Variables / Functions**: camelCase (e.g. `getUserById`, `isRead`).

### 2.3 Logic & Patterns
- **DTOs**: Mandate class-based inputs using validation decorators (`class-validator`).
- **Controllers**: Keep controllers slim. Only parse input, enforce routing/guards, and pass control to services.
- **Services**: Services must handle database queries, permissions checking, and business operations.
- **Errors**: Throw specific NestJS HTTP Exceptions (e.g. `NotFoundException`, `UnauthorizedException`).

---

## 3. Frontend Standards (Angular)

### 3.1 Naming Conventions
- **Files**: kebab-case with type suffix (e.g. `lead-list.component.ts`, `auth.guard.ts`).
- **Selectors**: prefix components with `app-` (e.g. `app-lead-list`).
- **Classes**: PascalCase with type suffix (e.g. `LeadListComponent`, `AuthInterceptor`).

### 3.2 State Management & Signals
- **Angular Signals**: Use Signals (`signal()`, `computed()`, `effect()`) for component-level reactive state management.
- Avoid raw subscription handlers in components; use Angular signals and the `async` pipe or signal-based bindings in templates.

### 3.3 Style & SCSS Layouts
- **SCSS**: Never write global styles in component style files.
- **Component Styling**: Set `encapsulation: ViewEncapsulation.Emulated` (default). Use BEM (Block-Element-Modifier) pattern.
- **Theming**: Configure custom styles and colors using Angular Material theming rules.

---

## 4. Git Conventions & Workflow

### 4.1 Commit Message Convention
We adhere to the Conventional Commits structure:
```
<type>: <description>
```

#### Allowed Types:
- `feat`: A new feature implementation.
- `fix`: A bug fix.
- `refactor`: Restructuring code without changing behavior.
- `style`: Changes that do not affect code logic (formatting, layout, SCSS).
- `docs`: Documentation updates.
- `test`: Adding or updating test suites.
- `chore`: Infrastructure updates, package installations, config changes.

#### Example Commits:
- `feat: implement login page using angular signals`
- `fix: correct mongodb connection timeout string`
- `docs: add API documentation for deal controller`
```

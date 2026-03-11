# ARCHITECTURE DOCUMENT
## Averett University Housing Management System (AUHMS)

**Version:** 0.2  
**Status:** Active — Stack Confirmed  
**Last updated:** 2026-03-01  
**Lead Developer:** Richard  

> **HOW TO USE THIS DOCUMENT**  
> Paste this document at the start of every Claude Code session before asking any project question. It gives Claude the context needed to give answers consistent with decisions already made. Items marked ⚠ are pending decisions; items marked ✓ are confirmed. Update this file in the repository after every session where architectural decisions are made.

---

## 1. Project Identity

| Field | Detail |
|---|---|
| System name | Averett University Housing Management System (AUHMS) |
| Institution | Averett University — small private university, ~1,200 students |
| Housing scope | ~400 students in university-managed housing |
| Incumbent system | The Housing Director by Adirondack Solutions (contract expiring) |
| Project purpose | Custom replacement for The Housing Director — full feature parity required |
| Project phase | ⚠ Update as project progresses |
| Target go-live | ⚠ TBD — confirm Adirondack contract expiration date urgently |
| Lead developer | Richard (Data Reporting Specialist, Institutional Research) |
| Dev team | Richard + 2 IT professionals + 1 Housing Dept. representative |

---

## 2. Confirmed Stack Decisions

> Do not suggest alternatives to these choices unless explicitly asked.

| Layer | Decision |
|---|---|
| Framework | **Next.js** (full-stack — frontend and backend in one codebase) |
| Hosting | **Vercel** (Next.js deployment) |
| Database | **Supabase** (managed PostgreSQL, SOC 2 Type 2 certified) |
| ORM | **Prisma** (schema management, migrations, type-safe queries) |
| Authentication | **NextAuth.js** with Azure Active Directory (Microsoft Entra ID) SSO |
| Email | **Microsoft Graph API** (university M365 infrastructure) |
| Teams alerts | **Microsoft Graph API / Power Automate** (staff notifications) |
| Document storage | **SharePoint via Microsoft Graph API** (leases, inspection forms) |
| UI components | ⚠ Not yet decided — candidates: shadcn/ui, Mantine, Radix |

### Why this stack
- Next.js server-side rendering keeps sensitive data logic off the client
- Supabase is SOC 2 Type 2 certified and supports row-level security (RLS) at the database layer — a critical FERPA control
- Vercel enforces HTTPS automatically with no configuration required
- Azure AD SSO means no standalone student accounts to manage or secure
- Prisma migration history provides an auditable record of schema changes

---

## 3. Confirmed Architectural Decisions

> These decisions have been made. Do not revisit unless explicitly asked.

### 3.1 Security & Compliance
- ✓ Student data is subject to **FERPA**. All access to student records must be logged. Never expose student PII without role-gating.
- ✓ **Row-level security (RLS)** must be enabled in Supabase at the database layer — do not rely solely on application-level access control
- ✓ **No secrets or API keys** in code or repository. All credentials via environment variables. Never suggest hardcoding credentials.
- ✓ **HTTPS everywhere** — enforced automatically by Vercel
- ✓ An **audit_log** table is required. Every read and write of student records must be logged with user ID, timestamp, and action.

### 3.2 Identity & Authentication
- ✓ Authentication via **Azure Active Directory (Microsoft Entra ID) SSO** using NextAuth.js
- ✓ Students and staff log in with existing university Microsoft credentials — no separate AUHMS accounts
- ✓ **Role-based access control (RBAC)** is required from day one. Roles include at minimum: Housing Admin, Housing Staff, Student, IT Admin, Read-Only Reporter

### 3.3 Microsoft 365 Integration
- ✓ Email notifications via **Microsoft Graph API** — not a third-party email service
- ✓ Teams notifications for internal staff alerts
- ✓ SharePoint for document storage (leases, inspection forms) via Graph API
- ✓ Existing Power Automate environment should be leveraged for notification triggers where appropriate

### 3.4 ERP Integration (Colleague)
- ✓ **Colleague (Ellucian)** is the ERP and system of record for student identity, enrollment, and billing
- ✓ **Billing charges** are written back to Colleague — AUHMS does not process payments
- ✓ **Nightly batch sync** is the assumed integration pattern — do not assume real-time Colleague API availability
- ✓ Colleague integration is the highest-complexity, highest-risk component of the project

### 3.5 Data Integrity
- ✓ **Soft deletes only** — deleted_at TIMESTAMPTZ NULL pattern. Never hard delete student or assignment records.
- ✓ **Staging environment** required throughout development. Production student data never used in development or testing.
- ✓ Prisma migration history maintained as auditable record of all schema changes

---

## 4. Pending Decisions

> Claude may offer recommendations when asked but should not assume a choice has been made.

| Decision | Candidates |
|---|---|
| UI component library | shadcn/ui, Mantine, Radix — not yet decided |
| Colleague sync mechanism | SFTP file drop, REST API, or database view — requires technical investigation |
| Colleague charge export format | Format Colleague expects — TBD, requires coordination with Finance/IT |
| Data migration scope | Which Adirondack data to migrate — Priority 1/2/3 not yet formally decided |

---

## 5. Database Conventions

> Claude must follow these standards in every schema, migration, and query generated for this project.

| Convention | Standard |
|---|---|
| Engine | PostgreSQL (via Supabase) |
| ORM | Prisma — all schema changes via Prisma migrations, never manual DDL in production |
| Naming | All tables and columns use **snake_case** |
| Primary keys | UUID, column named `id`, default `gen_random_uuid()` |
| Foreign keys | Pattern: `referenced_table_singular_id` (e.g., `student_id`, `room_id`) |
| Timestamps | All tables include `created_at` and `updated_at` (TIMESTAMPTZ, NOT NULL, default NOW()) |
| Soft deletes | `deleted_at TIMESTAMPTZ NULL` — NULL = active, non-NULL = deleted |
| Booleans | TRUE / FALSE — never 0/1 or Y/N strings |
| Enums | PostgreSQL native ENUM types for fixed-value fields |
| Row-level security | RLS policies required on all tables containing student data |

---

## 6. Core Data Model (Entity Map)

> High-level entity map only — not the full schema. Full schema maintained in Prisma schema file.

### 6.1 Key Entities

| Entity | Description |
|---|---|
| `buildings` | Physical buildings on campus. Parent of rooms. |
| `rooms` | Individual rooms within a building. Contains capacity, type, amenities, status. |
| `students` | Sourced from Colleague via nightly sync. Not created manually in AUHMS. UUID maps to Colleague student ID. |
| `housing_applications` | A student's application for housing for a given term. One per student per term. |
| `room_assignments` | Active link between a student and a specific room for a term. One student, one room, one term. |
| `roommate_preferences` | Student-expressed roommate preferences stored against an application. |
| `maintenance_requests` | Submitted by students or staff against a specific room. Has status lifecycle. |
| `leases` | Formal lease record tied to an assignment. Document stored in SharePoint — URL referenced here. |
| `billing_charges` | Charges generated by AUHMS, exported to Colleague. Never processed internally. |
| `audit_log` | Immutable log of all access to and changes of student records. Required for FERPA compliance. |

### 6.2 Key Relationships
- A building has many rooms
- A room belongs to one building
- A student can have one housing_application per term
- An application can result in one room_assignment
- A room_assignment links one student to one room for one term
- A room can have many room_assignments across terms, but only one active assignment at a time
- A maintenance_request belongs to a room (not a student — rooms persist between tenants)
- billing_charges are generated from room_assignments and exported to Colleague — never processed internally

---

## 7. Integration Notes

### 7.1 Colleague ERP
- Colleague is the system of record for student identity, enrollment status, and billing
- Nightly batch sync assumed — exact mechanism (SFTP, REST API, database view) not yet confirmed, requires investigation
- Do not design features that assume real-time Colleague data availability
- Billing charges: AUHMS produces an exportable charge file in the format Colleague expects (format TBD)
- Colleague integration is the highest-complexity, highest-risk project component — plan extra time

### 7.2 Microsoft 365 / Azure AD
- Authentication: Azure AD via NextAuth.js — users cannot create standalone AUHMS accounts
- Email: Microsoft Graph API for transactional emails (application confirmations, assignment notices, maintenance updates)
- Teams: Notifications to designated housing staff channels for new applications, maintenance requests, assignment changes
- SharePoint: Lease documents and inspection forms stored here, referenced by URL in the leases table
- Leverage existing Power Automate environment for notification triggers rather than building parallel systems

### 7.3 Incumbent System — Adirondack Solutions: The Housing Director
- AUHMS is a direct replacement — full feature parity required
- Conduct a structured walkthrough of every feature housing staff currently uses before finalizing requirements
- Request a full data export from Adirondack early — before contract winds down and while the vendor relationship is cooperative
- Use exported data to inform schema design and test migration scripts

### 7.4 Data Migration Strategy
- **Priority 1 (must migrate):** Current room and building inventory, active student assignments, current lease records
- **Priority 2 (should migrate):** Pending applications for upcoming terms, open maintenance request history
- **Priority 3 (evaluate):** Historical assignment records from prior years — weigh storage vs. value
- All migration scripts must be tested in staging against real exported Adirondack data before any production cutover
- Define a clear data freeze date — a point when The Housing Director stops being updated and AUHMS goes live
- Parallel running for at least one housing cycle before full cutover is strongly recommended

---

## 8. Explicit Out-of-Scope Items

> Claude should not suggest adding these features — they are explicitly excluded from AUHMS v1 scope.

- Payment processing — all financial transactions handled in Colleague
- Dining / meal plan management — separate system
- Student conduct or disciplinary records — separate system
- Physical access / key card management — separate system
- Standalone user account system — authentication is entirely Azure AD SSO
- Native mobile apps (iOS/Android) — responsive web only for v1

---

## 9. Team & Current Sprint Focus

### 9.1 Team

| Role | Owner | Responsibilities |
|---|---|---|
| Lead Developer | Richard | Architecture, database design, Colleague integration, application logic |
| IT Member 1 | ⚠ Assign name | Infrastructure, hosting, CI/CD, SSL, backups, monitoring |
| IT Member 2 | ⚠ Assign name | Security review, RBAC policy, M365 integration touchpoints |
| Housing Rep | ⚠ Assign name | User stories, acceptance testing, workflow validation, sign-off before production |

### 9.2 Current Sprint

> ⚠ UPDATE THIS SECTION AT THE START OF EVERY CLAUDE CODE SESSION

- **Sprint:** 1 — Complete
- **Dates:** 2026-03-02
- **Focus:** Project scaffolding, database setup, authentication
- **Completed this sprint:**
  - Next.js 14 project scaffolded with App Router and TypeScript
  - Prisma schema created for all 10 entities (buildings, rooms, students, housing_applications, roommate_preferences, room_assignments, maintenance_requests, leases, billing_charges, audit_log) plus app_users for RBAC
  - Supabase PostgreSQL database provisioned; initial migrations applied
  - Azure AD SSO working end-to-end via NextAuth.js (JWT strategy)
  - Route protection via middleware — all routes except /login require authentication
  - app_users table auto-provisions users on first sign-in with STUDENT role
  - Audit logging utility (lib/audit.ts) in place for FERPA compliance
  - All 9 module placeholder pages and API route stubs created
  - next.config.ts → next.config.mjs (Next.js 14 does not support .ts config)
  - dotenv-cli added so Prisma CLI picks up .env.local
  - @auth/prisma-adapter removed (incompatible with next-auth v4; JWT strategy does not need it)
- **Active files / modules:** All files are scaffold-level; no module has full CRUD yet
- **Next sprint focus:** Buildings and Rooms modules — list views, add/edit forms, API routes
- **Blockers / known issues:**
  - UI component library not yet selected (shadcn/ui, Mantine, or Radix) — decision needed before building real UI
  - Developer's app registration is in a personal Microsoft tenant; must be recreated in Averett tenant before production
  - RLS policies not yet written — required before any staging or production deployment
  - Developer's app_users role is STUDENT — change to HOUSING_ADMIN for development (use Prisma Studio: npm run db:studio)

---

## 10. Decision Changelog

| Date | Decision | Rationale | Made by |
|---|---|---|---|
| 2026-03-01 | Next.js as full-stack framework | Single codebase, server-side rendering protects sensitive data, well-suited for team size | Team |
| 2026-03-01 | Supabase for database hosting | SOC 2 Type 2 certified, row-level security at DB layer, strong FERPA posture | Team |
| 2026-03-01 | Vercel for hosting | Native Next.js support, automatic HTTPS, SOC 2 certified | Team |
| 2026-03-01 | Prisma as ORM | Best-in-class documentation, auditable migration history, type-safe queries | Team |
| 2026-03-01 | Azure AD SSO for authentication | University already on M365, avoids managing separate accounts, FERPA-appropriate | Team |
| 2026-03-01 | No internal payment processing | Billing stays in Colleague, reduces compliance scope, consistent with existing workflows | Team |
| 2026-03-01 | Soft deletes only | FERPA requires audit trail, hard deletion of student records is inappropriate | Richard |
| 2026-03-01 | Row-level security in Supabase | Defense-in-depth — database enforces access control independent of application code | Richard |
| 2026-03-01 | Pin Next.js at 14.2.35 for initial development; plan upgrade to 15/16 before go-live | Next.js 14.2.35 is the latest patched 14.x release. Two high-severity DoS CVEs (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf) have no fix in the 14.x line — only Next.js 16+ patches them. Risk is acceptable during development given the app is internal, fully authenticated via Azure AD, and hosted on Vercel. Upgrade must be completed before production go-live. | Richard |

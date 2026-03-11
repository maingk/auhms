# AUHMS Sprint Notes

---

## Sprint 1 — Complete
**Dates:** 2026-03-02
**Focus:** Project scaffolding, database setup, authentication

### What was built

**Project scaffold**
- Next.js 14.2.35 with App Router and TypeScript
- Folder structure following the architecture doc conventions — `app/`, `lib/`, `prisma/`, `types/`
- Security headers configured in `next.config.mjs`
- `.env.example` documenting every required environment variable

**Database**
- Full Prisma schema covering all 10 entities from the architecture doc: `buildings`, `rooms`, `students`, `housing_applications`, `roommate_preferences`, `room_assignments`, `maintenance_requests`, `leases`, `billing_charges`, `audit_log`
- Plus `app_users` for role-based access control
- All conventions from the architecture doc applied: UUID primary keys, snake_case, `created_at`/`updated_at`, `deleted_at` soft deletes, PostgreSQL native enums
- Supabase project provisioned and both migrations applied successfully
- `dotenv-cli` added so Prisma CLI picks up `.env.local`

**Authentication**
- NextAuth.js with Azure AD (Microsoft Entra ID) provider
- JWT session strategy — stateless, no session table needed
- Users auto-provisioned in `app_users` on first sign-in with `STUDENT` role
- Roles loaded from the database into the JWT at sign-in time
- Middleware protecting all routes except `/login`

**FERPA compliance foundation**
- `lib/audit.ts` with `writeAuditLog()` and convenience helpers (`auditRead`, `auditCreate`, `auditUpdate`, `auditDelete`)
- `audit_log` table is immutable — no `updated_at` or `deleted_at`
- Audit calls wired into the students and assignments API stubs

**Module placeholders**
- 9 dashboard pages (buildings, rooms, students, applications, assignments, maintenance, leases, billing, audit) — each with architecture notes and TODO markers
- 9 API route stubs with session guards and basic queries
- Dashboard layout with sidebar navigation

### Problems encountered and solved

| Problem | Fix |
|---|---|
| `next.config.ts` not supported in Next.js 14 | Renamed to `next.config.mjs` |
| Prisma CLI doesn't read `.env.local` | Added `dotenv-cli` to all `db:*` scripts |
| `@auth/prisma-adapter` incompatible with next-auth v4 | Removed it; implemented pure JWT + `app_users` table |
| `application_id` in `RoomAssignment` needed `@unique` for one-to-one relation | Added `@unique` to the field |
| Next.js 14.2.25 had known CVEs | Upgraded to patched 14.2.35; upgrade to 15/16 logged for pre-go-live |

### Carried into Sprint 2

- UI component library not yet selected (shadcn/ui, Mantine, or Radix) — decision needed before building real UI
- RLS policies not yet written in Supabase — required before staging or production
- Azure AD app registration is in a personal tenant — must move to Averett's tenant before production
- No feature modules implemented yet — everything is placeholder level

---

## Sprint 2 — Planned
**Focus:** Buildings and Rooms modules — first real CRUD

### Why Buildings and Rooms first
Every other module depends on them. Assignments, maintenance requests, and leases all require a room to exist. Students can't be assigned until rooms are defined. Getting Buildings and Rooms right first means every subsequent module has real data to work with.

### Decision needed before starting
**UI component library** must be chosen before building any real UI. The three candidates from the architecture doc are:

| Library | Strengths | Considerations |
|---|---|---|
| **shadcn/ui** | Copy-paste components, full control over code, Tailwind-based, very popular in Next.js ecosystem | Requires Tailwind CSS; components live in your codebase |
| **Mantine** | Full-featured, excellent data table and form components out of the box, good for data-heavy admin apps | Larger bundle; opinionated styling |
| **Radix** | Unstyled primitives, maximum flexibility | Requires more styling work; better as a foundation than a complete solution |

For a housing management system (data-heavy, table-driven, admin-focused), **Mantine** or **shadcn/ui** are the strongest fits. Radix alone is not recommended — it's better used under the hood of shadcn/ui.

### Sprint 2 priorities

#### P1 — Must complete
- [ ] Choose and install UI component library
- [ ] Buildings list page — table view of all active buildings, with building name, code, floor count, status
- [ ] Add building form — name, code, address, floors, status
- [ ] Edit building — same fields, pre-populated
- [ ] Soft-delete building (archive) — sets `deleted_at`, removes from active list
- [ ] Buildings API routes — complete GET (list), POST (create), PATCH (update), DELETE (soft-delete)
- [ ] Rooms list page — filterable by building, shows room number, type, capacity, status
- [ ] Add room form — building (dropdown), room number, floor, type, capacity, amenities
- [ ] Edit room — same fields, pre-populated
- [ ] Soft-delete room
- [ ] Rooms API routes — complete GET, POST, PATCH, DELETE

#### P2 — Complete if time allows
- [ ] Building detail page — building info + list of its rooms
- [ ] Room status management — toggle AVAILABLE / MAINTENANCE / OFFLINE (OCCUPIED is set by assignments, not manually)
- [ ] Basic input validation on all forms (required fields, sensible limits)
- [ ] Role enforcement on API routes — read: HOUSING_STAFF+; write: HOUSING_ADMIN only

#### P3 — Defer to later sprint
- [ ] Bulk room import (useful for initial data load from Adirondack)
- [ ] Building/room search and filtering beyond basic building filter
- [ ] Amenities UI — structured editing of the `amenities` JSON field
- [ ] Audit logging on buildings/rooms (lower priority than student-data tables, but required before go-live)

### Pre-production checklist (not Sprint 2, but track here)
- [ ] Write Supabase RLS policies for all student-data tables
- [ ] Move Azure AD app registration to Averett tenant
- [ ] Upgrade Next.js to 15/16 (CVE remediation)
- [ ] Set up staging environment
- [ ] CI/CD pipeline on Vercel

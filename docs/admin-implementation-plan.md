# Nobatifa Admin — Implementation Plan (Phase 1)

> Location: `Nobatifa-Admin/docs/admin-implementation-plan.md`.

## 1. Audit summary (verified 2026-10-12, read-only)

- **No conflicts**: local `Nobatifa-Admin/` absent; `github.com/faezerahmatidev/Nobatifa-Admin` returns 404.
- **Designs**: `Nobatifa-figma/dashborad-admin/` — 44 desktop screens (Auth/Dashboard/Appointments/Factors/Profile/Services/TimeManagment); tablet+mobile only for Auth. Distinct RTL sidebar shell (not the website layout).
- **Flows**: `Nobatifa-UserFlow/dashboard-admin/1..3.png` — branches for auth, dashboard, profile, time management, appointments, services, invoices; detail text partially legible, Figma screens govern.
- **Design tokens**: website `tokens.css` verified (`primary-base #4a62f6`, `accent-*` navy, Vazirmatn font) — reuse for the admin, not a new visual language.
- **Backend**: same Supabase project/DB as the website (8 tables, 5 migrations incl. RLS + `reserve_appointment` + dev seed). Website repo untouched.
- **Tooling**: Windows + PowerShell, Node 24, npm 11, Angular CLI 22.1.7, Supabase CLI 2.120.0, Git 2.55. Nothing installed in Phase 1.

## 2. Proposed independent structure (Phase 2)

```text
Nobatifa-Admin/                      # own git repo, own history
  src/app/
    core/        auth (session, guards), backend (supabase client)
    shared/ui/   button, input, modal, table, pagination, states, icon
    features/    auth/, dashboard/, appointments/, time-management/,
                 services/, factors/, profile/
    data-access/ models (reuse website domain types), supabase gateways
  supabase/      admin-only migrations (services catalog, schedules,
                 staff membership —exact set TBD in Phase 2)
  docs/          the four admin docs (moved from staging)
  .env.example   URL + publishable key only
```

New Angular 22 + Tailwind v4 scaffold (website stack), standalone components,
signals, lazy routes, Vitest, ESLint, CI (lint/test/build — no Pages demo deploy).

## 3. Backend reuse strategy

- Read shared tables; add admin-only tables via NEW migrations (never edit website migrations): service catalog, schedules/rules source, staff membership/roles (pending Q1/Q2 answers).
- Time-management output should GENERATE `booking_days`/`time_slots` (answers website Phase-2 open question on generation rules).
- Admin writes go through RLS (role-checked) or `SECURITY DEFINER` RPCs; `service_role` never in browser.
- No duplicate business entities; no changes to website behavior/data.

## 4. Phase 2..9 outline

2. Scaffold + git init (no remote until authorized) + tokens/fonts + docs move.
3. Supabase client + env templates (same project; verify read-only, no schema change).
4. Password auth + guards + RLS gap analysis (needs roles answers).
5. Sidebar shell + responsive UI + shared components per Figma.
6. Features behind typed gateways (needs flows answers).
7. Day-close/cancel/invoice actions with confirmations + RPCs.
8. Tests incl. RLS/permission tests (safe env only) + responsive/a11y.
9. Docs, secret scan, delivery review (remote creation/push/deploy each need explicit authorization).

## 5. Decisions needed from you (before Phase 4/6)

The six questions in `admin-requirements.md` §3 — especially roles (Q1) and account provisioning (Q2). Also confirm: ok to scaffold with Angular 22 + Tailwind v4 (website stack)?

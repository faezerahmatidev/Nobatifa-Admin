# Nobatifa Admin — Access Model Proposal (PRELIMINARY, awaiting approval)

> Location: `Nobatifa-Admin/docs/admin-access-model.md`.
> Status: DESIGN ONLY. No migration, code, policy, or production change
> has been applied. Nothing here takes effect until explicitly approved
> AND a specific execution step is authorized. Approval of this document
> does NOT authorize Phases 6/7 execution or any production DB change.

## 1. Recorded decisions (user-approved as preliminary, 2026-10-12)

- D1. Centers have multiple staff with different levels: **Owner, Manager,
  Receptionist, Staff**. Access is controlled **independently per center**;
  one user may belong to several centers with different roles.
- D2. Platform operator creates/confirms the center and invites the first
  Owner through a secure invite. The Owner invites own-center staff.
  **Nobody gains Owner/admin via signup or profile edits, ever.**
- D3. No open/public RLS policies as a shortcut. Dev/test only until
  production changes are separately authorized.
- D4. Sensitive transactions/RPCs authorize server-side (DB), not in UI.

## 2. Membership model (proposed, not created)

```text
center_memberships(
  id uuid PK,
  user_id uuid FK → profiles(id) ON DELETE CASCADE,
  center_id uuid FK → service_centers(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','manager','receptionist','staff')),
  created_at timestamptz,
  UNIQUE (user_id, center_id)          -- one role per user per center
)
```

- Writes: NO direct INSERT/UPDATE/DELETE grants to authenticated users.
  Membership changes happen ONLY through `SECURITY DEFINER` RPCs that verify
  the caller (e.g. only an `owner` of that center may grant/revoke roles;
  nobody may change their own row — enforced inside the RPC).
- Reads: each member may SELECT only their own membership rows
  (`user_id = auth.uid()`); role checks elsewhere use a helper, never
  client-supplied values.
- Helper (proposed): `public.center_role(p_center_id uuid) RETURNS text`
  (`SECURITY DEFINER`, locked `search_path`, `EXECUTE` revoked from
  anon/authenticated direct call? No — policies run as definer via the
  helper; direct `EXECUTE` grant to authenticated is required for policy
  evaluation and is safe because the function only reads the caller's row).

## 3. Permission matrix (preliminary — confirm before use)

Only capabilities evidenced in Figma/ports are listed. `R` = read/own-center,
`W` = mutate. `—` = denied.

| Capability (evidence) | Owner | Manager | Receptionist | Staff |
| --------------------- | ----- | ------- | ------------ | ----- |
| Dashboard today overview (Dashboard screens) | R | R | R | R |
| Appointments view + day/slot manage, walk-in register (Appointments screens) | W | W | W | R |
| Cancel / complete appointment + slot release (flow Q5, proposed) | W | W | W | — |
| Time schedules CRUD (TimeManagment screens) | W | W | — | — |
| Services toggles (Services screen) | W | W | — | — |
| Invoices list + issue for own-center done appointments (Factors screens) | W | W | W | R |
| Center profile + staff invite (Profile screens) | W | W (no roles) | — | — |
| Grant/revoke roles, Owner transfer (D1/D2) | W | — | — | — |
| Cross-center data | — | — | — | — |

Notes: Manager may invite staff but never grant roles (roles = Owner-only).
Receptionist cancellation allowed (front-desk reality) — flag if you want it
Owner/Manager-only. Staff is read-only. Customer `profiles` readable only
for customers holding appointments at the member's center (EXISTS-join policy).

## 4. Proposed RLS shape (not applied)

- Keep every existing owner-policy untouched; ADD member-policies alongside,
  e.g. `appointments_select_center_staff ... USING (center_role(center_id) IS NOT NULL)`,
  separate per-command policies so Staff stays read-only
  (SELECT: any member; INSERT/UPDATE/DELETE: owner/manager/receptionist as above).
- `vehicles`: staff read for vehicles tied to own-center appointments
  (join), no staff writes (cars belong to customers).
- Day-close / schedule / service-catalog / invoice-issue writes: privileged
  paths (member-write policies for owner/manager, or RPCs with internal
  checks) — exact objects defined at implementation time against this matrix.
- Cancel semantics (proposed): only `pending → cancelled` (+ slot back to
  `available`) and `pending → done`; `done`/`cancelled` terminal. Enforced in
  the RPC, not UI.

## 5. Provisioning sketch (manual runbook, not automated yet)

1. Platform operator (service_role / SQL, offline): creates center row.
2. Operator invites Owner (signed invite out-of-band; exact mechanism TBD —
   magic-link or dashboard-created user + password handoff in person).
3. Owner logs in → invites staff (RPC, Owner/Manager-checked).
4. No signup surface grants membership, ever (no INSERT policy exists).

## 6. What approval of this document unlocks (each still needs its own order)

a. Migration: membership table + helper + member RLS + cancel/complete RPCs (dev/test DB first).
b. Phase 6-remainder: role-gated admin features.
c. Phase 7: admin operations hardening.
d. Production application: separate explicit authorization with recovery plan.

**Awaiting your approval of §2–§5 before anything is built or applied.**

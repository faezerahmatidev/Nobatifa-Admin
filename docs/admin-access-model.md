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
- D5. Cancellation (approved 2026-10-12): Receptionist MAY cancel own-center
  appointments, but ONLY from cancellable states. Physical deletion of
  appointments is FORBIDDEN for all roles. `done` is FINAL and cannot be
  overwritten, except through an authorized, logged correction process
  (mechanism TBD at implementation — must itself be approved).
  Status change + slot release must be ATOMIC, authorized inside the
  secure backend/RPC path.
- D6. Staff and invites (approved 2026-10-12): Staff is read-only by default
  — schedule overview plus only their related appointments; customer data
  minimized to operational necessity. Manager may invite ONLY Staff and
  Receptionist roles; Manager can NEVER appoint Owner/another Manager,
  transfer ownership, or escalate own permissions. Sensitive roles and
  ownership stay Owner-only.

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
| Dashboard today overview (Dashboard screens) | R | R | R | R* |
| Appointments view + day/slot manage, walk-in register (Appointments screens) | W | W | W | R* |
| Cancel appointment, pending-only, atomic + slot release (D5) | W | W | W | — |
| Complete appointment `pending → done` (D5) | W | W | W | — |
| Physical appointment delete | — | — | — | — |
| Overwrite `done` (only via logged correction process, TBD) | (corr.) | — | — | — |
| Time schedules CRUD (TimeManagment screens) | W | W | — | R* |
| Services toggles (Services screen) | W | W | — | — |
| Invoices list + issue for own-center done appointments (Factors screens) | W | W | W | — |
| Center profile + staff invite (Profile screens) | W | W† | — | — |
| Grant/revoke roles, Owner transfer (D1/D2/D6) | W | — | — | — |
| Cross-center data | — | — | — | — |

R* = narrowed scope: schedule overview plus only staff-related appointments;
customer fields minimized to operational necessity (exact relation link and
field masking are OPEN implementation details — flagged, not invented).
W† = Manager invites Staff/Receptionist ONLY; never Owner/Manager,
never ownership transfer, never self-escalation (RPC-enforced, D6).
Notes: no physical delete exists for any role (D5). Customer `profiles`
readable only for customers holding appointments at the member's center
(EXISTS-join policy), further minimized for Staff (open detail).

## 4. Proposed RLS shape (not applied)

- Keep every existing owner-policy untouched; ADD member-policies alongside,
  e.g. `appointments_select_center_staff ... USING (center_role(center_id) IS NOT NULL)`,
  separate per-command policies so Staff stays read-only.
- Cancel/complete RPC (D5): accepts ONLY `pending` rows; performs status
  change + slot release in ONE transaction; verifies caller role
  ∈ {owner, manager, receptionist} of that appointment's center, inside the
  function. NO `DELETE` grant on appointments for any authenticated role —
  physical deletion is impossible by design.
- `done` immutability: no UPDATE path may write from/to `done` except the
  future logged correction process (mechanism TBD, separately approved).
- Invite RPC (D6): inviter must be owner, or manager inviting ONLY
  {staff, receptionist}; inviter can NEVER modify/demote Owner rows, modify
  their own row, appoint Owner/Manager, transfer ownership, or escalate self.
  All enforced with `auth.uid()` inside the function, never client input.
- Staff minimization: staff SELECT policies narrow to schedule + related
  appointments; customer-field masking mechanism TBD (view or column grants).
- `vehicles`: staff read for vehicles tied to own-center appointments
  (join), no staff writes (cars belong to customers).

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

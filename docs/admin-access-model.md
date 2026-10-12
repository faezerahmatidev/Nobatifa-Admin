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
  (mechanism TBD at implementation - must itself be approved).
  Status change + slot release must be ATOMIC, authorized inside the
  secure backend/RPC path.
- D6. Staff and invites (approved 2026-10-12): Staff is read-only by default
  - schedule overview plus only their related appointments; customer data
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
- Staff minimization: staff-specific appointment views stay DISABLED until
  the §8.2 relation is approved — no staff SELECT policies are created
  before then (resolves tension with §7.1). Customer-field masking
  mechanism TBD (view or column grants) at that time.
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

## 7. Requested clarifications (docs-only, 2026-10-12 — NOT implemented)

Verified read-only against `20261012000000_core_schema.sql`,
`20261012000001_rls_policies.sql`, `20261012000002_reserve_rpc.sql`.
No existing policy weakened; nothing applied.

### 7.1 Staff scope and the missing staff–appointment link (item 1)

FACT: no staff link exists — `appointments(user_id=customer, center_id,
vehicle_id, slot_id)` has no assignee column, and no shifts table exists.
Therefore "نوبت‌های مرتبط با خودش" is currently INEXPRESSIBLE.
- DEFERRED until §8.2 approval (review instruction 7) — design retained,
  not built: staff reads WOULD go through a `SECURITY DEFINER`
  read RPC, e.g. `staff_day_overview(p_center_id, p_date)`, returning ONLY
  operational columns: slot time/status, vehicle type + full plate,
  customer FIRST name only (no family name, no mobile). Enforced in DB
  output shape, not UI. Exact field set: PROPOSED, confirm.
- Later (needs migration approval): add nullable `assigned_staff_id →
  profiles(id)` on appointments once an assignment flow is evidenced;
  then staff sees rows assigned to them.
- Customer minimization applies to every staff path (policies + RPC outputs).

### 7.2 Member-directory reads (item 2)

- Everyone: SELECT own `center_memberships` row(s) (`user_id = auth.uid()`).
- Owner/Manager of a center: list that center's memberships + fellow members'
  profile rows (names/mobile) via EXISTS-join on shared center + caller
  privileged role — management necessity only.
- Receptionist/Staff: NO directory; own row only.

### 7.3 Cancel/complete RPC logic (item 3, proposed — not created)

`cancel_appointment(p_appointment_id)` / `complete_appointment(...)`:
1. Caller = `auth.uid()`, else 'ابتدا وارد شوید'.
2. `SELECT appointment … FOR UPDATE`; missing → 'نوبت یافت نشد'.
3. Role ∈ {owner, manager, receptionist} via ACTIVE membership
   (membership-row existence = active) in `appointment.center_id`,
   else 'دسترسی ندارید'. Staff denied.
4. Cancel requires `status = 'pending'` else 'این نوبت قابل لغو نیست';
   complete requires `pending` else 'این نوبت قابل ثبت نیست'.
5. Same transaction: cancel → `cancelled` + slot back to `available`;
   complete → `done`, slot stays `reserved`. Lock order convention
   everywhere: appointment row, then slot row (reserve RPC touches only
   slot + insert, so no opposite-order locker exists — no deadlock).
6. Concurrent second attempt sees non-pending status → clean error, never
   a double transition. `done`/`cancelled` terminal; no DELETE grant exists.
7. `reserve_appointment` is deliberately UNTOUCHED (customer path sets
   `user_id = auth.uid()`; staff walk-in needs a separate RPC — OPEN item).

### 7.4 Invites with expiry/status/single-use (item 4, proposed — not created)

```text
center_invites(
  id uuid PK,
  center_id uuid FK → service_centers ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','manager','receptionist','staff')),
  mobile TEXT NOT NULL,              -- invitee identity (no FK: may not exist yet)
  token_hash TEXT NOT NULL UNIQUE,   -- sha256 hex, never plaintext
  status TEXT CHECK (status IN ('pending','consumed','revoked')) DEFAULT 'pending',
  expires_at timestamptz NOT NULL,   -- CONFIRMED 72h (round 3 final)
  created_by uuid NOT NULL,          -- inviter auth.uid()
  created_at timestamptz DEFAULT now(),
  consumed_at timestamptz
)
```

- Create-invite RPC: inviter owner → any role; manager → ONLY
  {staff, receptionist}; others → deny. Never invite self; never touch
  Owner rows unless inviter is Owner; no self-escalation (target role
  checked against inviter role, all from `auth.uid()`, never client input).
- Accept RPC (server-side): hash(token) match + `pending` + not expired +
  caller profile mobile == invite mobile (binds invite, blocks sharing) +
  no existing membership → lock invite row `FOR UPDATE`, create membership,
  mark `consumed` (lock-first makes concurrent double-accept safe). Rows are
  never deleted (audit).
- No direct grants on `center_invites` to authenticated (RPC-only writes);
  pending-invite listing for owner/manager of that center only.

### 7.5 Compatibility review (item 5 — read-only, verified)

- All existing owner-policies stay byte-identical; member additions are
  separate policies/objects — nothing widened, anon grants unchanged.
- `handle_new_user` trigger untouched (invites key on mobile string;
  membership created at accept-time, no FK conflict pre-signup).
- `reserve_appointment` untouched (see §7.3.7 walk-in note).
- Dev seed unaffected (no new NOT NULL columns on existing tables).
- New objects only → migration order safe whenever authorized.

## 8. Final decisions round 3 (2026-10-12 — recorded, NOT implemented)

### 8.1 Finalized

- **Invite expiry = 72 hours** (was confirmable, now CONFIRMED). Token:
  secure, unguessable, stored hashed, single-use. Expiry + consumption
  validated server-side inside the accept RPC. No exceptions.
- **Staff customer data**: minimal, task-necessary only. Exact field sets per
  surface remain approval-gated at implementation time.
- **Staff–appointment relation: DETERMINED IMPOSSIBLE from current data.**
  `appointments` carries only customer/center/vehicle/slot — no staff
  attribution exists anywhere in the schema (verified read-only). Therefore
  NO relation is guessed, and staff-specific appointment views stay
  DISABLED until §8.2 is approved.
- **Walk-in is a SEPARATE path** (never `reserve_appointment`, see §8.3).
  Owner-is-caller is NOT assumed.
- **`done` correction: DISABLED in this stage.** Only the future requirement
  is recorded (§8.5). No RPC, migration, or status change exists for it.

### 8.2 Staff–appointment relation proposal (separate document, not built)

Recommended: nullable `appointments.assigned_staff_id → profiles(id)`,
set by walk-in/assignment flows (future), meaning "responsible staffer".
Staff appointment views = rows where `assigned_staff_id = auth.uid()`.
Alternative (only if multi-staff-per-appointment is ever required):
a junction table — NOT recommended now, no evidence supports it.
Needs explicit approval before any migration.

### 8.3 Walk-in design + compatibility with current `reserve_appointment`

Compatibility verdict (read-only review): REUSE IS IMPOSSIBLE. Current
`reserve_appointment` hardcodes `user_id = auth.uid()` AND requires the
vehicle to belong to `auth.uid()`. A staff walk-in books FOR a customer,
violating both assumptions — forcing it through would corrupt ownership.
Proposed separate `walkin_appointment(p_center_id, p_day_id, p_slot_id,
p_customer_id, p_vehicle_id)` RPC: verifies caller has an ACTIVE membership
with role ∈ {owner, manager, receptionist} in THAT center; verifies the
customer profile exists; verifies the vehicle belongs to THE CUSTOMER;
same slot-lock + atomic insert pattern; returns the appointment id.
Customer identification UX at the desk (e.g. mobile lookup) is an OPEN
detail for Phase 6, not decided here.

### 8.4 Exact proposed inventory (listed only — nothing created or run)

Migrations (each gated, dev/test first, in order):
- M1 `center_memberships` table + `center_role()` helper.
- M2 member RLS policies (appointments/vehicles/invoices/profiles/invites
  reads; staff-narrowed shapes).
- M3 `center_invites` table + create/accept invite RPCs (72h, hashed,
  single-use, mobile-bound).
- M4 `cancel_appointment` + `complete_appointment` RPCs (pending-only,
  atomic, role-checked).
- M5 (needs §8.2 approval first): `assigned_staff_id` + staff-scoped reads.
- Walk-in RPC rides with the M4 batch (depends on M1 only).
- Explicitly NOT listed: `done`-correction mechanism, seed changes,
  any production application.

RPCs proposed: `center_role` (helper), `invite_staff`, `accept_invite`,
`cancel_appointment`, `complete_appointment`, `walkin_appointment`,
`staff_day_overview` (minimized read shape — GATED on §8.2 approval, never built before it).

### 8.5 Remaining risks and dependencies

- R1. Assignment flow UX unevidenced → M5 and staff views wait on it.
- R2. Walk-in customer identification UX open (Phase 6 detail).
- R3. Correction-for-`done` has no design yet by explicit order — any
  future request restarts at documentation, never silent implementation.
- R4. Staff accounts need password provisioning (Q2 mechanism) before any
  live permission test; no test may use production data.
- R5. Production application of M1–M4 needs separate authorization +
  recovery plan; dev/test only until then.
- R6. Cross-center isolation rests entirely on per-center parameterization
  — every future query/RPC must carry center_id from membership, never input.

## 9. Execution readiness review (2026-10-12 — review only, nothing applied)

### 9.1 Final matrix: proposed migrations and RPCs

| Item | Status | Prerequisites | Dependencies | Risks | Required test |
| ---- | ------ | ------------- | ------------ | ----- | ------------- |
| M1 `center_memberships` + `center_role()` | Proposed | None (new objects) | — | Role-confusion if helper misused → keep single helper, definer-locked | Migration applies clean on disposable DB; helper returns caller role only |
| M2 member RLS (reads) | Proposed | M1 | §8 matrix | Staff over-read → staff policies deferred; owner policies byte-identical (diff `pg_policies`) | Owner/manager/receptionist/staff × own/other-center/anon matrix incl. negatives |
| M3 `center_invites` + invite/accept RPCs | Proposed | M1 | 72h expiry, token secrecy | Replay (mitigated: row lock + consumed), sharing (mitigated: mobile bind), escalation (matrix-checked) | Expired/consumed/replayed/wrong-mobile/role-escalation denials; no direct grants exist |
| M4 cancel/complete RPCs | Proposed | M1 | Pending-only, lock order | Double transition (mitigated: status recheck under lock); deadlock (mitigated: fixed lock order) | Concurrent double-cancel; slot release verified; done-terminal; no DELETE grant |
| M4b `walkin_appointment` RPC | Proposed | M1 | Customer + vehicle checks | Ownership corruption (mitigated: separate RPC, never reuse reserve) | Walk-in for existing/new customer; vehicle-ownership mismatch denied |
| M5 `assigned_staff_id` + staff reads | BLOCKED (§8.2) | Assignment flow evidence + approval | §8.2 | — | — |
| `staff_day_overview` | BLOCKED (§8.2) | M5 or explicit waiver | Minimized shape | PII leak if shape widens → shape reviewed per surface | — |
| `done`-correction | DISABLED (by order) | Future approved design | — | Silent overwrites → forbidden until then | — |

### 9.2 Unresolved decisions and approvers

- U1 staff field sets per surface → approver: you (product).
- U2 assignment flow + `assigned_staff_id` → approver: you (needs assignment UX evidence).
- U3 walk-in customer identification UX → approver: you (product).
- U4 `done`-correction mechanism → approver: you (future, explicit).
- U5 owner-transfer mechanism → approver: you.
- U6 invite delivery channel → approver: you (operational).
- U7 platform provisioning path → approver: you/operator.
- U8 production application + recovery plan → approver: you (separate order).

### 9.3 Proposed execution order (independent, reviewable steps)

- S1: M1 only → verify migration applies, website green, no behavior change.
- S2: M2 → verify full RLS matrix incl. negatives on disposable DB.
- S3: M3 → verify invite lifecycle incl. attack cases.
- S4: M4/M4b → verify transitions, atomicity, concurrency, slot release.
- S5: M5 (after U2) → verify staff scoping.
- S6: Admin UI phases 6–7 against dev DB.
- S7: Production (after U8) with backup + rollback rehearsed.

### 9.4 Security + website-compatibility test checklist

- RLS: owner policies byte-identical (`pg_policies` diff); anon reads unchanged (centers/days/slots 200; profiles/vehicles/appointments/invoices denied); cross-center denial for every role; staff update/delete denied; no `DELETE` on appointments for any role.
- Functions: all `SECURITY DEFINER` with locked `search_path`; direct `EXECUTE` revoked from anon everywhere and from authenticated except `center_role` (policy evaluation) + RPCs (authenticated only).
- Repo: secret scan clean (`service_role`/JWT/`sb_secret`/private keys); no secrets in new migration comments.
- Website: `reserve_appointment`, trigger, seed untouched (diff); public REST reads unchanged; full user regression after any shared-DB change (SMS-dependent E2E where applicable).
- Rollback per migration (new-objects-only → reverse DROP in dependency order), rehearsed on a disposable DB before any production step. Rollback of M1 requires M2–M4 first (dependency chain).

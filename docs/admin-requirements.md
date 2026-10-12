# Nobatifa Admin — Requirements (Phase 1, evidence-based)

> Location: `Nobatifa-Admin/docs/admin-requirements.md`.

## 1. Evidenced feature set (do not expand without approval)

| Area | Evidence | Confirmed scope |
| ---- | -------- | --------------- |
| Auth | `Auth-desktop1..4`, `Auth-Tablet&Mobile1..4` | Split-screen login: **mobile + password** (NOT OTP), forgot-password link (target unknown), responsive variants |
| Dashboard | `Dashboard-Desktop1..13` | Today overview: date header, slot grid by status, booked-customer cards, info banner, walk-in customer registration (`ثبت مشتری`), link to appointments management |
| Appointments | `Appointments-Desktop1..8` | Day strip, whole-day close (`تعطیل کردن روز`), per-slot actions menu, booked-customer cards |
| Time management | `TimeManagment-Desktop1..8` | Empty state, schedule builder (working days + time ranges), presumably generates bookable days/slots |
| Services | `Services-Desktop1` | Per-center sub-service toggles (oil change, filters, gearbox…​) with info banner |
| Invoices | `Factors-Desktop1..2` | Invoice table (name, date, amount, `نمایش فاکتور` action) + pagination |
| Profile | `Profile-Desktop1` | Center identity, personal names, mobile edit, password change, save |
| Shell | all screens | RTL right sidebar (logo, 5 nav items, staff card, red logout), breadcrumb `پنل / X`, date header, banners |

Desktop-first: only Auth has tablet/mobile designs. No destructive-action, audit-log, multi-branch, or notification screens evidenced.

## 2. Explicitly OUT until approved

Multi-role RBAC UI, audit logs, notifications, payments, customer database beyond walk-in registration, anything not visible in the 44 screens.

## 3. Questions requiring answers before Phase 4/6 (do not guess)

> UPDATE Phase 6: Q1+Q2 are now HARD BLOCKERS — role-gated features
> (appointments/services/invoices/time-writes) cannot be built without them.
> Only public reads (`CenterReadGateway`) were implemented.

1. **Roles**: single admin per center or multiple staff/roles? Evidence shows one staffer (`محمد پشتیبان`) and zero role UI/docs.
   → ANSWERED preliminary 2026-10-12: Owner/Manager/Receptionist/Staff, per-center independent, multi-center membership. See `admin-access-model.md` §1–§3 (awaiting approval).
2. **Account provisioning**: no signup screen exists — how is the first admin account (and password) created for a center?
   → ANSWERED preliminary 2026-10-12: platform operator creates/confirms center + secure Owner invite; Owner invites own staff; never via signup/profile. See `admin-access-model.md` §5 (awaiting approval).
3. **Invoice authorship**: which screen creates an invoice after service, and where do prices come from? (No price lists evidenced.)
4. **Walk-in registration** (`ثبت مشتری`): exact fields and relation to user accounts/appointments?
5. **Cancellation semantics**: admin cancels a booking → does the slot reopen? What do `done`/`cancelled` require?
6. Remaining screens (`Dashboard-Desktop2..13`, `Appointments-Desktop2..8`, etc.) must be inspected in Phase 2/5 before building those flows.

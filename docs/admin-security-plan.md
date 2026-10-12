# Nobatifa Admin — Security Plan (Phase 1)

> Location: `Nobatifa-Admin/docs/admin-security-plan.md`.

## 1. Facts (verified read-only)

- Shared backend: Supabase project `nobatifa-website` (`razqbetogfeyldkhmsvu`, eu-central-1). Tables: `profiles`, `service_centers`, `vehicles`, `booking_days`, `time_slots`, `appointments`, `invoices`, `invoice_items`.
- Current RLS is **owner-scoped for end users** (own rows only; centers/days/slots public read). It grants admins NOTHING — correct default, must be preserved.
- Admin login is password-based (Figma), unlike the user OTP flow.
- No roles, permissions, or admin-provisioning documented anywhere (verified by search).
- Website `service_role`/DB credentials were never inspected and must never enter the admin repo.

## 2. Threats to design against

- Cross-center data access (one center's staff reading another's customers/appointments).
- Privilege escalation (self-granting admin rights).
- Credential stuffing on password login (rate limiting, lockout policy TBD with Supabase Auth settings).
- Public demo exposure: unlike the website, the admin MUST NOT get a public demo deployment.

## 3. Proposed controls (to be implemented Phase 4+, not now)

1. **Role claim on profile** (e.g. `profiles.is_center_admin` + `center_id`, or a `staff_memberships` table — decide in Phase 2): admin RLS policies check `auth.uid()` → membership → same-center rows only.
2. **Supabase Auth phone+password** for admin sign-in (matches Figma); OTP stays user-side.
3. **No `service_role` in browser, ever.** If an operation cannot be expressed in RLS (e.g. cross-user writes), use a `SECURITY DEFINER` RPC with internal `auth.uid()` + membership checks — same pattern as the existing `reserve_appointment`.
4. Angular route guards as usability only; destructive actions (day-close, cancel, invoice issue) require confirmation + constraint/RPC enforcement.
5. Secrets: publishable key only in app config; DB password / `service_role` local-only; secret scan before every review.

## 4. Open security questions (need answers before Phase 4)

- Roles model (see `admin-requirements.md` Q1) — determines the entire policy design.
- Admin account provisioning path (Q2) — determines signup-attack surface.
- Whether RLS can see "same center" (needs the membership link above) or an Edge Function boundary is required.

## 5. RLS gap analysis (Phase 4, verified against website migration `20261012000001_rls_policies.sql`)

Current policies grant an admin NOTHING beyond a normal user:

- `vehicles_owner_all`, `appointments_select/insert_own`, `invoices_*_select_own`, `profiles_*_own` — all `auth.uid() = owner`, so a staff member cannot see or touch any center data.
- `appointments` has no UPDATE/DELETE for anyone — admin cancel/complete actions need new privileged policies or RPCs.
- `invoices`/`invoice_items` have no INSERT — invoice issuance needs a privileged path.
- `service_centers`/`booking_days`/`time_slots` are public-read but unwritable — the schedule builder (Phase 6/7) needs a privileged write path.
- No role/staff-membership column or table exists — cross-center isolation cannot be expressed yet.

Conclusion: admin data access (Phase 6) is BLOCKED on the roles-model answer. Phase 4 delivers only the login/session/guard usability layer; no website policy was weakened (website tree untouched and clean).

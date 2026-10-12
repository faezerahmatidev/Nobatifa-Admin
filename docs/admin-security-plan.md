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

# Nobatifa Admin — Management Dashboard

Independent admin application for the Nobatifa vehicle-service platform
(Persian RTL). Separate repository, codebase, and history from the
public website (`Nobatifa-Website`); shares only the Supabase backend.

## Stack

- Angular 22 (standalone, signals, strict TypeScript, lazy routes, CSR only)
- Tailwind CSS v4 (tokens in `src/styles/tokens.css`, shared values with website)
- Vitest (`npx ng test`), ESLint, Prettier

## Commands

```bash
npm start        # dev server
npx ng lint
npx ng test
npx ng build
```

## Structure

```text
src/app/
  core/         auth, backend client, guards, shell (Phase 4-5)
  shared/       reusable UI (Phase 5)
  features/     auth, dashboard, appointments, time-management,
                services, factors, profile (Phase 5-6)
  data-access/  models, supabase gateways (Phase 3/6)
src/environments/  dev/prod values (publishable key only, never secrets)
supabase/          admin-only migrations (Phase 3+, never edit website files)
docs/              admin-progress, implementation plan, requirements, security plan
```

## Environment

Copy `.env.example` guidance: `src/environments/` holds the Supabase URL +
publishable key only. `service_role` keys and DB passwords never enter this repo.

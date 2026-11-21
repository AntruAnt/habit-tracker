# Decisions

Architectural decisions and their status. Approved decisions are not reopened during implementation; changing one needs explicit approval after a concrete technical justification.

## Approved

### D-001 — Single repository, monorepo target layout
- **Status:** Approved. `apps/mobile` created in CP-02; `apps/api` follows in CP-03 and `packages/shared` in CP-07.
- **Decision:** Keep one Git repository. Target layout: `apps/mobile` (existing Expo app), `apps/api` (backend), `packages/shared` (contracts, created with the first real contract), `docs/`.
- **Why:** Frontend and backend stay independently runnable while sharing contracts and history. No requirement justifies separate repositories.

### D-002 — Backend: Express 5 + TypeScript
- **Status:** Approved by the project owner (2026-10-19).
- **Note:** The CP-00 audit recommended Fastify; the owner chose Express 5. Do not replace it without approved justification.
- **Consequences:** HTTP integration tests use Vitest with `supertest` (no built-in request injection). Validation is explicit middleware using Zod.

### D-003 — Database: PostgreSQL + Drizzle ORM, local via Docker
- **Status:** Approved.
- **Why:** Habit data is relational (users → habits → cycles → daily check-ins → course corrections) and needs uniqueness constraints, date-range queries and aggregates.
- **Blocker (verified 2026-10-19):** Docker Desktop is installed on Windows, but its WSL integration is off, so `docker` is unavailable in WSL. The owner must enable *Docker Desktop → Settings → Resources → WSL integration* before CP-05.

### D-004 — Validation and contracts: Zod, REST + JSON
- **Status:** Approved.
- **Decision:** Zod validates every request at the API boundary. A shared contracts package (`packages/shared`) is introduced when the first real API contract is implemented, not before.

### D-005 — Backend testing: Vitest
- **Status:** Approved; compatibility verified in CP-03 (Vitest 5.0.5 + supertest 7.3.1 + Express 5.3.0 on Node 24.15: 19 tests, including errors thrown in async handlers).
- **Scope:** Unit tests, API integration tests against a real test database, and concurrency tests for operations that must preserve data integrity (for example, simultaneous or retried check-ins).

### D-006 — Mobile testing: jest-expo + React Native Testing Library
- **Status:** Approved for CP-01; implemented.
- **Why:** Expo's supported unit-test setup; Vitest cannot easily run React Native code.
- **Versions (verified):** `jest-expo ~57.0.6` and `jest ~29.7.0` (chosen by `npx expo install` for SDK 57); `@jest/globals ~29.7.0` (must match Jest's major); `@testing-library/react-native ^14.1.0`.
- **`test-renderer` pinned to `~1.2.0`:** RNTL 14 accepts `test-renderer ^1.0.0`. Version 1.3.x depends on `react-reconciler 0.34`, which requires React 19.3; this app runs React 19.2.3 (fixed by SDK 57). Version 1.2.x uses `react-reconciler 0.33` (React ^19.2). Revisit when the SDK moves to React 19.3+.

### D-007 — Mobile API access: native `fetch` via one client
- **Status:** Approved.
- **Decision:** A single centralized API client built on `fetch` (no TanStack Query, no axios). The base URL comes from environment-specific configuration (`EXPO_PUBLIC_API_URL`); never a hard-coded `localhost` for physical devices.

### D-008 — Scalability and data-integrity principles
- **Status:** Approved.
- **Decision:** Stateless API instances that can scale horizontally; all persistent state in PostgreSQL (no process-local state); database constraints, indexes and transactions; a bounded connection pool per instance; check-ins designed so concurrent or retried requests cannot create duplicates (unique constraint plus idempotent upsert).
- **Not introduced without a demonstrated requirement:** microservices, Kubernetes, Redis, queues or other infrastructure.

### D-009 — Mobile runtime: Expo Go, SDK 57
- **Status:** Existing constraint.
- **Decision:** The owner runs the app in Expo Go (SDK 57) from the Play Store. Only libraries included in Expo Go may be added; no custom native code. `expo.install.exclude` keeps `npx expo install --fix` from changing the `expo` version.

### D-010 — Lint coverage includes `scripts/`
- **Status:** Implemented in CP-01.
- **Decision:** `npm run lint` runs `expo lint src scripts`. (`expo lint` alone only checks `src/`, `app/` and `components/`, which hid a real error in `scripts/`.)

### D-011 — npm workspaces monorepo
- **Status:** Approved by the owner (CP-02 plan, 2026-10-19); implemented in CP-02.
- **Decision:** npm workspaces with one root `package-lock.json` and dependencies hoisted to the root. The root `workspaces` list is `apps/*`; `packages/*` is added in CP-07 with the shared contracts package. Dependencies are installed from the root; app dependencies are added from `apps/mobile` with `npx expo install`. No Turborepo or Nx.
- **Why:** Keeps npm and the existing lockfile versions; Expo supports npm workspaces and configures Metro automatically (SDK 52+).

### D-012 — Package names
- **Status:** Approved by the owner (CP-02 plan); implemented in CP-02.
- **Decision:** Root package `habit-tracker`; workspaces `@habit-tracker/mobile` and, later, `@habit-tracker/api` and `@habit-tracker/shared`. Unchanged: the local folder and GitHub repository names, the Expo `slug` and the URL `scheme` (changing them would affect the Expo project identity and deep links).

### D-013 — API runs TypeScript natively on Node 24 (no build step)
- **Status:** Approved by the owner (CP-03 plan); implemented in CP-03.
- **Decision:** `apps/api` runs its `.ts` sources directly with Node 24's type stripping (`node src/server.ts`; `node --watch` in development). `tsc` only typechecks. No `tsx`, no compiled `dist/`.
- **Rules this imposes (enforced by `apps/api/tsconfig.json`):** relative imports use the `.ts` extension; no syntax that needs compiling (enums, namespaces, parameter properties: `erasableSyntaxOnly`); no tsconfig path aliases; type-only imports are marked `type` (`verbatimModuleSyntax`).
- **`.env` loading:** done in code with `process.loadEnvFile()` (a missing file is ignored; variables already set win). Not with `--env-file-if-exists`: in Node 24.15 it crashes `node --watch` when the file is missing (found in CP-03).

### D-014 — API conventions
- **Status:** Approved by the owner (CP-03 plan); documented in `docs/API.md`.
- **Decision:** Success responses return the resource as JSON. Every error is `{ "error": { "code", "message", "requestId", "details"? } }` with no internals in 5xx responses. Every response carries `X-Request-Id` (a well-formed client ID is reused). `/health` is unversioned; resource endpoints go under `/v1` because installed mobile apps can't be forced to update.

### D-015 — Logging: pino + pino-http
- **Status:** Approved (CP-03 plan); implemented.
- **Decision:** Structured JSON logs to stdout, one line per request with the request ID; `authorization`, `cookie` and `set-cookie` headers are redacted. Level from `LOG_LEVEL`.

### D-016 — Network defaults and security baseline
- **Status:** Approved (CP-03 plan); implemented.
- **Decision:** `HOST=127.0.0.1`, `PORT=3000` by default (local only; opening the API to devices is CP-04). `X-Powered-By` disabled; JSON bodies limited to 100 KB. CORS waits for CP-04, security headers for CP-09.

## Pending (owner decision needed)

| ID | Decision | Needed by |
|---|---|---|
| P-3 | Dev networking for a physical phone from WSL2 (mirrored networking, port proxy or tunnel) | CP-04 |
| P-4 | Habit scope for the data model (identities, habits, 21-day cycles, check-ins, course corrections; later features deferred) | CP-05 |
| P-5 | Authentication method (email + password with session tokens, or other) | CP-06 |
| P-6 | Remove template leftovers (Explore tab, `hint-row.tsx`, unused `@expo/ui`, `expo-device`, `expo-glass-effect`) | Any time |

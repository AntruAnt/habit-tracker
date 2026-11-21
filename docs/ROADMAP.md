# Roadmap

Each checkpoint is planned, approved, implemented, verified and recorded on its own. Never start a checkpoint without the owner's explicit approval. Status values: PLANNED, IN PROGRESS, BLOCKED, COMPLETE, NEEDS REVIEW.

Common verification for every mobile change: `npx tsc --noEmit`, `npx eslint .`, `npm run lint`, `npm test`, `npx expo-doctor`, `npx expo export --platform ios --platform android --platform web --output-dir <scratch dir outside the repo>`, plus a manual check in Expo Go by the owner when behavior on a device matters.

---

## CP-00 — Repository audit — **COMPLETE**
- **Objective:** Read-only inspection of the repository; architecture recommendation and roadmap.
- **Acceptance criteria:** Assessment delivered without modifying files; owner review. Met — see `checkpoints/CP-00-repository-audit.md`.

## CP-01 — Baseline and safety net — **COMPLETE**
- **Objective:** A rollback point, project documentation, complete lint coverage and mobile smoke tests, with no UI change.
- **Acceptance criteria:** Baseline commit exists; `tsc`, `eslint .`, `npm run lint`, `npm test` (≥ 3 tests) and `expo-doctor` pass; `expo export` succeeds for iOS, Android and web; Home screenshots unchanged. Met — see `checkpoints/CP-01-baseline-and-safety-net.md`.

## CP-02 — Monorepo foundation and frontend relocation — **COMPLETE**
- **Objective:** Turn the repository into an npm-workspaces monorepo and move the existing app to `apps/mobile` without changing its behavior.
- **Prerequisites:** CP-01 complete; decisions P-1 and P-2; clean working tree.
- **Planned changes:** Root `package.json` with `workspaces`; `git mv` of the app (source, assets, config, scripts, tests) into `apps/mobile`; update paths in `app.json`, `tsconfig.json`, ESLint, Jest, `.gitignore`, scripts and docs; verify Expo's monorepo Metro support against the SDK 57 docs before relying on it.
- **Out of scope:** Backend code, dependency upgrades, UI changes, template cleanup.
- **Acceptance criteria:** `git log --follow` shows history for moved files; all common verification passes from the workspace; Home screenshots identical to CP-01; the owner confirms the app loads in Expo Go from `apps/mobile`; exactly one copy of `react` and `react-native` installed.
- **Rollback:** `git revert` the CP-02 commit (pure moves and config edits), then `npm install`.
- **Result:** All acceptance criteria met, including the owner's Expo Go check. See `checkpoints/CP-02-monorepo-and-frontend-relocation.md`.

## CP-03 — Backend foundation (Express 5) — **COMPLETE**
- **Objective:** An independently runnable, testable API skeleton.
- **Prerequisites:** CP-02.
- **Planned changes:** `apps/api` with Express 5 + TypeScript; environment validation with Zod at startup; `GET /health`; consistent JSON error format and error-handling middleware; structured logging; graceful shutdown; Vitest + `supertest` tests; `docs/API.md` started.
- **Out of scope:** Database, authentication, habit endpoints, deployment.
- **Acceptance criteria:** `npm run dev:api` serves `/health`; tests, typecheck and lint pass; Vitest compatibility with Express 5 verified and recorded; the mobile app's verification still passes.
- **Verification:** `npm test -w @habit-tracker/api`, `npm run typecheck -w @habit-tracker/api`, `npm run lint -w @habit-tracker/api`, `curl http://127.0.0.1:3000/health`.
- **Result:** All acceptance criteria met. See `checkpoints/CP-03-backend-foundation.md`.
- **Dependencies:** Node 24 (installed). No external services.
- **Rollback:** Revert the CP-03 commit; the mobile app is unaffected.

## CP-04 — Development networking and mobile API client — PLANNED
- **Objective:** The app can reach the API from every development target.
- **Prerequisites:** CP-03; decision P-3.
- **Planned changes:** `EXPO_PUBLIC_API_URL` per environment (`.env.example` only; real `.env` files ignored); centralized `fetch` client with timeouts, cancellation and typed errors; CORS for the web dev origin; documentation for the Android emulator (`10.0.2.2`), iOS simulator (`localhost`), a physical phone (LAN or tunnel) and WSL2.
- **Out of scope:** Habit screens, authentication, visible UI changes.
- **Acceptance criteria:** The owner's phone in Expo Go and the web build both reach `/health`; the client is unit-tested; no hard-coded device URLs.
- **Verification:** Mobile and API common checks; manual check on the owner's phone.
- **Dependencies:** The owner's phone and network; possibly WSL networking settings or a tunnel tool (P-3).
- **Rollback:** Revert the CP-04 commit.

## CP-05 — Database and domain model — PLANNED
- **Objective:** PostgreSQL schema and data access for the approved habit scope.
- **Prerequisites:** CP-03; decision P-4; Docker usable from WSL (see D-003 blocker).
- **Planned changes:** `docker-compose.yml` for local Postgres; Drizzle schema and migrations; constraints and indexes (including one check-in per habit per day); bounded connection pool; repository-layer integration tests against a separate test database; transaction and concurrency tests.
- **Out of scope:** HTTP endpoints beyond what tests need; authentication; hosted databases.
- **Acceptance criteria:** Migrations apply cleanly to an empty database and are repeatable; integration and concurrency tests pass; no credentials committed.
- **Verification:** `docker compose up -d db`, migration commands, `npm test -w api`.
- **Dependencies:** Docker Desktop with WSL integration enabled.
- **Rollback:** Revert the commit; drop the local development database volume (local data only, with the owner's OK).

## CP-06 — Authentication and authorization — PLANNED
- **Objective:** User accounts protecting user-owned data.
- **Prerequisites:** CP-05; decision P-5.
- **Planned changes:** Registration, login, logout; password hashing; server-side session tokens stored hashed; auth middleware; rate limiting on auth endpoints; token storage in `expo-secure-store` on the device.
- **Out of scope:** Social login, password reset by email (unless approved), habit endpoints.
- **Acceptance criteria:** Tests cover success, invalid credentials, expired or revoked sessions and cross-user access attempts; no secrets or hashes exposed in responses or logs.
- **Verification:** API tests; manual login from the owner's phone.
- **Rollback:** Revert the commit and its migration (development data only).

## CP-07 — Habit API and shared contracts — PLANNED
- **Objective:** Endpoints for the approved habit scope, with `packages/shared` introduced for the first real contracts.
- **Prerequisites:** CP-06.
- **Planned changes:** Habit, cycle and check-in endpoints; Zod schemas shared with the app; idempotent check-ins; pagination where lists can grow; `docs/API.md` complete for these endpoints.
- **Out of scope:** Mobile screens.
- **Acceptance criteria:** Integration tests for success and error cases; concurrency tests prove no duplicate check-ins under parallel and retried requests.
- **Verification:** API tests including concurrency suites; typecheck of both apps against the shared package.
- **Rollback:** Revert the commit and its migration.

## CP-08 — Habit screens using the API — PLANNED
- **Objective:** The habit-tracking UI, designed with the owner, built on the API.
- **Prerequisites:** CP-07; owner-approved screen designs.
- **Out of scope:** Changes to the existing Home screen beyond agreed navigation.
- **Acceptance criteria:** Loading, error and empty states; existing Home behavior unchanged; component tests for new screens; the owner verifies on device.
- **Verification:** Mobile common checks; screenshot comparison of Home; manual device test.
- **Rollback:** Revert the commit.

## CP-09 — Testing and hardening — PLANNED
- **Objective:** Coverage of critical paths, security review (headers, input limits, CORS, rate limits), offline behavior decision.
- **Acceptance criteria:** Defined when planned, based on the state after CP-08.

## CP-10 — Release readiness — PLANNED
- **Objective:** EAS build profiles, environment separation, API hosting decision (needs the owner's authorization), production database plan, complete docs.
- **Acceptance criteria:** Defined when planned. Nothing is deployed or published without explicit authorization.

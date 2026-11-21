# CP-03 — Backend foundation (Express 5)

1. **Objective:** An independently runnable, testable API in `apps/api` (`@habit-tracker/api`): health endpoint, validated configuration, consistent JSON errors, structured logging, graceful shutdown. No database or authentication.
2. **Initial state:** Clean tree at `5bb8b94` (CP-02), in sync with `origin/main`. Only `apps/mobile` existed.
3. **Changes made:**
   - `apps/api` created: `package.json` (ESM, `engines.node >=24`, scripts `dev`, `start`, `typecheck`, `lint`, `test`), `tsconfig.json` (typecheck only, rules for Node type stripping, `"types": ["node"]`), `eslint.config.js` (type-aware `typescript-eslint`), `.env.example`.
   - Source: `src/server.ts`, `src/app.ts`, `src/config/env.ts`, `src/lib/{logger,http-error,request-id}.ts`, `src/middleware/{not-found,error-handler}.ts`, `src/routes/health.ts`.
   - Tests: `tests/{health,errors,config}.test.ts`, `tests/helpers.ts` (19 tests).
   - Root `package.json`: `dev:api` script. Root `package-lock.json`: API dependencies added.
   - Docs: new `docs/API.md`; `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `TESTING.md`, `DECISIONS.md` (D-005 verified; D-013 to D-016), `ROADMAP.md`, `DEVELOPMENT_STATE.md`, this record; correction added to the CP-02 record (53 renames, not 55).
4. **Files:** Created: 17 files under `apps/api/` (listed above), `docs/API.md` and this record. Modified: `package.json`, `package-lock.json`, `CLAUDE.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT_STATE.md`, `docs/checkpoints/CP-02-…`. Deleted or moved: none. `apps/mobile`: unchanged.
5. **Important implementation decisions:**
   - **Dependencies (versions checked against the registry before install):** runtime `express ^5.3.0`, `zod ^4.6.7`, `pino ^10.4.0`, `pino-http ^11.0.0`; dev `vitest ^5.0.5`, `supertest ^7.3.1`, `@types/supertest ^7.2.1`, `@types/express ^5.0.6`, `@types/node ~24.19.2`, `typescript ~6.0.3`, `eslint ^9.39.5`, `@eslint/js ~9.39.5` (matches ESLint 9; latest `@eslint/js` is 10), `typescript-eslint ^8.71.2` (supports TypeScript < 6.1).
   - **Isolation from the app:** npm placed the API's `zod` 4.6.7 and `@types/node` 24.19.2 under `apps/api/node_modules`, keeping the app's `zod` 3.25.76 and `@types/node` 26.6.5 at the root.
   - **API usage checked against installed type definitions,** not from memory: Express 5's `listen` error callback, `Router`/`express.json` exports, body-parser error types (`entity.parse.failed`, `entity.too.large`), pino's named `pino` export, pino-http's `pinoHttp` export and `genReqId`, Zod 4 issue paths (`PropertyKey[]`), supertest's CommonJS export.
   - **Bug found and fixed:** `node --watch --env-file-if-exists=.env` crashes in Node 24.15 when `.env` is missing (watch mode tries to watch the nonexistent file; `--watch-path=src` still logged the error). `.env` is now loaded in `src/server.ts` with `process.loadEnvFile()` (missing file ignored; existing variables win, verified), and the scripts are plain `node --watch src/server.ts` / `node src/server.ts`.
   - **Lint finding fixed:** tests read fields from supertest's `any` body; they now cast to a typed `ErrorBody` instead of disabling the rule.
   - No empty service, data-access or auth layers were created; they arrive with the code that needs them.
6. **Commands executed:** `npm view` (versions, engines, peers); `npm install … -w @habit-tracker/api` (runtime, then dev; the first runtime attempt was a no-op because npm hadn't registered the new workspace yet — nothing was written); lockfile comparison against `5bb8b94`; `npm run typecheck|lint|test` (API, then root); live server runs (`curl` probes, port conflict, `SIGTERM`, invalid config); `npm run dev:api` with and without a temporary `.env` (deleted afterwards), watch reload; mobile `npx eslint .`, `npx expo-doctor`, `npx expo export` (3 platforms); bundle content search.
7. **Results (observed 2026-10-19):**
   - API: `tsc` exit 0; ESLint 0 problems; Vitest 3 files, **19 tests passed**.
   - Live server: `GET /health` → `200 {"status":"ok"}` with `X-Request-Id`, no `X-Powered-By`; `GET /nope` → JSON 404; malformed JSON → JSON 400 `INVALID_JSON`; second server on a busy port → logs "Could not start the API", exit 1; `SIGTERM` → "Shutting down", "Server closed", exit 0; `PORT=abc` → "Invalid environment configuration: PORT: …", exit 1.
   - `npm run dev:api`: serves without `.env` (no crash); loads `PORT` from a temporary `.env`; restarts on a source change and keeps serving.
   - Root: `npm run typecheck`, `npm run lint` exit 0; `npm test` runs both workspaces (API 19 passed, mobile 3 passed).
   - Mobile unaffected: `npx eslint .` 0 problems; `expo-doctor` 21/21; `expo export` iOS, Android, web all bundled; one `react` 19.2.3, one `react-native` 0.86.3; root `@types/node` still 26.6.5.
   - Lockfile vs CP-02: all 1,148 existing install paths present with unchanged versions; 103 paths added (API dependencies only).
   - Bundles (searched with `grep -a`, with a control string present in each): Android, iOS and web contain no API code and no test code. This also confirms CP-01's "no test code in bundles" for the web bundle, which CP-01's search (native bundle folder only) had not actually covered.
8. **Acceptance criteria and evidence:**

   | Criterion | Evidence |
   |---|---|
   | `npm run dev:api` serves `/health` | Item 7 |
   | Unknown routes return the JSON error format | Item 7 (live) and tests |
   | `SIGTERM` shuts down cleanly (exit 0) | Item 7 |
   | API tests, typecheck and lint pass | 19 tests; `tsc` and ESLint clean |
   | Vitest + Express 5 compatibility verified and recorded | Item 7; `DECISIONS.md` D-005 |
   | Mobile app unaffected | Item 7 (versions, duplicates, checks, bundles) |
   | No `.env` committed; no secrets | Only `.env.example` added; secret scan clean |
9. **Known issues and deferred work:**
   - Scripted runs: killing only the `node --watch` parent can orphan its server child (seen during testing; all leftover processes were found by port and stopped). Interactive Ctrl+C is unaffected. Documented in `TESTING.md`.
   - Not yet: CORS and the app's API client (CP-04), database (CP-05; Docker WSL integration still off), authentication and rate limiting (CP-06), security headers (CP-09).
10. **Rollback:** `git revert <CP-03 commit>`, then `npm install` from the root. The mobile app does not depend on anything added here.
11. **Commit:** The CP-03 commit is the one containing this file (`git log --oneline -1 -- docs/checkpoints/CP-03-backend-foundation.md`). The owner authorized committing and pushing to `origin/main`.
12. **Final status:** COMPLETE.
13. **Recommended next checkpoint:** CP-04 — Development networking and mobile API client (needs decision P-3: how the phone reaches the API from WSL2).

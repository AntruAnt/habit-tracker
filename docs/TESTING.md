# Testing

## Commands

From the repository root (runs in every workspace: `apps/api` and `apps/mobile`):

| Command | What it checks |
|---|---|
| `npm run typecheck` | Types (strict, `tsc --noEmit`). Writes nothing. |
| `npm run lint` | Lint (app: `expo lint src scripts`, cached in `apps/mobile/.expo/`, gitignored) |
| `npm test` | All tests |
| `npm why react` / `npm why react-native` | Exactly one version of each (duplicates break the app) |

From `apps/mobile`:

| Command | What it checks |
|---|---|
| `npx eslint .` | Lint for every file in the app |
| `npx jest src/__tests__/home-screen.test.tsx` | A single test file |
| `npx jest -t "switches to light mode"` | Tests whose name matches |
| `npx expo-doctor` | Expo dependency and config health |
| `npx expo export --platform ios --platform android --platform web --output-dir <dir outside the repo>` | Production bundles build for all platforms |

Run lint and typecheck before declaring any task done.

## Mobile test setup

- **Stack:** `jest-expo` preset (Jest 29), React Native Testing Library 14, `test-renderer` 1.2 (pinned for React 19.2; see `DECISIONS.md` D-006).
- **Location (inside `apps/mobile`):** tests in `src/__tests__/*.test.tsx`. Shared helpers in `src/testing/` (any file inside `__tests__/` is treated as a test suite). Never put tests in `src/app/`: Expo Router would treat them as screens.
- **Imports:** `describe`, `it`, `expect` and `jest` come from `@jest/globals`, so `tsconfig.json` needs no Jest types.
- **RNTL 14 is async:** `await render(...)` and `await fireEvent.press(...)`.
- **Providers:** wrap screens with `AppProviders` from `src/testing/app-providers.tsx` (safe-area metrics + theme provider).
- **Config (`apps/mobile/package.json` → `jest`):** CSS imports map to `src/testing/style-stub.js`; `@/assets/*` and `@/*` aliases map to `assets/` and `src/` (listed before the preset's own alias mapping, which matches `@/` first and would send `@/assets/*` to `src/assets/`).
- **`jest.setup.js`:** mocks `react-native-worklets` with the mock it ships (the Worklets team's recommended approach) and calls Reanimated's `setUpTests()`.

### Current tests

| File | Covers |
|---|---|
| `home-screen.test.tsx` | Home renders the brand lockup, hero, 21-day cycle card and all four principles |
| `theme-toggle.test.tsx` | Toggle starts in dark mode and switches to light mode on press |
| `cycle-ring.test.tsx` | `CycleRing` draws 21 segments and colors the filled ones |

### Known, expected output

`home-screen.test.tsx` logs a Reanimated warning: `animatedRef is not initialized in useScrollOffset`. The test renderer has no native scroll view for the ref to attach to. In the app the ref is attached, and scrolling has been verified. The warning is left visible rather than filtered so real warnings are not hidden.

## Manual checks

- **Expo Go on the owner's phone** for anything device-specific (the owner runs it; results are recorded, never assumed).
- **Bundle contents check:** after `npx expo export`, search each bundle with `grep -a` (the iOS and Android bundles are Hermes bytecode, `.hbc`; the web bundle is under `client/_expo/…`). Always include a control string that must be present, so an empty result means "absent" rather than "searched the wrong place".
- **Screenshot comparison** of the Home screen in a phone-sized headless browser before and after a change. Used in CP-01 and CP-02 (hashes identical to the CP-01 baseline).

## API (`apps/api`)

| Command (from `apps/api`, or `-w @habit-tracker/api` from the root) | What it checks |
|---|---|
| `npm test` | Vitest, all API tests (`vitest run`) |
| `npx vitest run tests/health.test.ts` | A single test file |
| `npx vitest run -t "returns a JSON 404"` | Tests whose name matches |
| `npm run typecheck` | `tsc` (typecheck only; `noEmit`) |
| `npm run lint` | ESLint with type-aware `typescript-eslint` rules |

- **Stack:** Vitest 5 + supertest 7 against the real Express app from `createApp()`; no server or network needed. Verified with Express 5.3 on Node 24.15 (D-005).
- **Location:** `tests/*.test.ts`; shared helpers in `tests/helpers.ts` (`createTestApp()` with logging silenced, `UUID`, the typed `ErrorBody`). Import `describe`/`it`/`expect` from `vitest` (no globals).
- **Response bodies are `any` in supertest:** cast to a type (for example `response.body as ErrorBody`) instead of reading fields from `any`; the type-aware lint rules reject the latter.
- **What's covered (19 tests):** `/health` (status, JSON, request IDs reused or replaced, no `X-Powered-By`); 404, invalid JSON (400), oversized body (413); the error handler for sync and async throws (generic 500, no internals) and for `HttpError`; config defaults, parsing and rejection of invalid values.
- **Planned (CP-05 onward):** integration tests against a separate PostgreSQL test database, and concurrency tests for integrity-critical writes (D-005).

### Manual API checks

Run the server and probe it (used in CP-03):

```bash
npm run dev:api                         # from the root; watches src/ and restarts on change
curl -i http://127.0.0.1:3000/health    # 200 {"status":"ok"} with X-Request-Id
curl http://127.0.0.1:3000/nope         # 404 JSON error
```

Stop it with Ctrl+C. When scripting, signal the whole process group: killing only the `node --watch` parent can leave its server child running and holding the port (seen in CP-03).

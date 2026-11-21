# CP-01 — Baseline and safety net

1. **Objective:** Create a rollback point and a safety net (docs, complete lint coverage, mobile smoke tests) before any restructuring, with no UI or behavior change.
2. **Initial state:** `main` at `4d34761`, with the uncommitted UI work described in CP-00. No docs, no tests, one lint error hidden from `npm run lint`.
3. **Changes made:**
   - **Commit A (baseline), `99f4d50`:** the existing uncommitted UI work committed as-is, after a secret-pattern scan (no matches) and a size check (largest file: `package-lock.json`, 448 KB).
   - **Lint:** `scripts/render-brand-assets.mjs` imports `Buffer` from `node:buffer`; `npm run lint` is now `expo lint src scripts`.
   - **Mobile tests:** dev dependencies `jest-expo ~57.0.6`, `jest ~29.7.0`, `@jest/globals ~29.7.0`, `@testing-library/react-native ^14.1.0`, `test-renderer ~1.2.0`; Jest config in `package.json`; `jest.setup.js`; 3 tests; 2 test helpers.
   - **Docs:** `docs/` created; `CLAUDE.md` updated with mission, workflow rules and commands.
4. **Files:**
   - Modified: `package.json`, `package-lock.json`, `scripts/render-brand-assets.mjs`, `CLAUDE.md`
   - Created: `jest.setup.js`, `src/__tests__/home-screen.test.tsx`, `src/__tests__/theme-toggle.test.tsx`, `src/__tests__/cycle-ring.test.tsx`, `src/testing/app-providers.tsx`, `src/testing/style-stub.js`, `docs/DEVELOPMENT_STATE.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/checkpoints/CP-00-repository-audit.md`, this file
   - Moved or deleted: none
   - Unchanged: all app source in `src/` outside `__tests__/` and `testing/`, `app.json`, `tsconfig.json`, `eslint.config.js`, assets
5. **Important implementation decisions:**
   - `@jest/globals` was first installed at 30.5.2 (latest); pinned to ~29.7.0 to match Jest 29, which `npx expo install` selects for SDK 57.
   - `test-renderer` pinned to ~1.2.0: 1.3.x pulls `react-reconciler 0.34` (requires React 19.3), producing an npm peer conflict with React 19.2.3. 1.2.x uses `react-reconciler 0.33` (React ^19.2). After pinning: one React copy (19.2.3), no peer conflicts on a dry-run reinstall.
   - Reanimated 4.5.1 has no `jest/resolver` (mentioned in newer Reanimated docs); used the Worklets-recommended mock plus Reanimated's `setUpTests()`.
   - Test imports come from `@jest/globals`, so `tsconfig.json` is unchanged.
   - Test helpers live in `src/testing/` because Jest treats every file in `__tests__/` as a suite.
   - The CSS stub and alias mappings are listed explicitly (see `TESTING.md`).
   - Lockfile: compared against the baseline, no runtime package changed version or was removed and all direct dependencies are identical. The only new non-dev entry is `fsevents` (optional, macOS-only file watcher pulled in by Jest; not installed on Linux, never bundled).
6. **Commands executed:** `git add -A && git commit` (A); `npx expo install jest-expo jest @jest/globals @testing-library/react-native --dev`; `npm install --save-dev @jest/globals@~29.7.0`; `npm install --save-dev test-renderer@~1.2.0`; `npm install --dry-run` (peer check); verification commands below; headless-browser screenshots before and after.
7. **Results (observed 2026-10-19):**
   - `npx tsc --noEmit`: exit 0
   - `npx eslint .`: 0 problems
   - `npm run lint`: exit 0; ESLint args confirmed as `src scripts`
   - `npm test`: 3 suites, 3 tests passed (one expected Reanimated warning, documented in `TESTING.md`)
   - `npx expo-doctor`: 21/21 passed
   - `npx expo export` for iOS, Android and web: all bundled; test helpers absent from bundles
   - Screenshots (393×852, the same scrolled 1200px, 375×667): before and after hashes identical
8. **Acceptance criteria and evidence:**

   | Criterion | Evidence |
   |---|---|
   | Baseline commit exists; clean tree before CP-01 work | `99f4d50`; `git status` empty afterwards |
   | `tsc` and `eslint .` pass with 0 errors | Item 7 |
   | `npm run lint` covers `scripts/` | ESLint args `src scripts` |
   | `npm test` passes with ≥ 3 tests | 3 passed |
   | `expo-doctor` passes | 21/21 |
   | `expo export` succeeds for iOS, Android, web | Item 7 |
   | Home screenshots unchanged | Identical hashes |
   | Only planned files changed | Item 4; diff reviewed before commit |
9. **Known issues and deferred work:** Docker WSL integration off (blocks CP-05); expected test warning; template leftovers (P-6); no CI.
10. **Rollback:** `git revert <CP-01 commit>` restores the state at `99f4d50`. Reverting `99f4d50` as well returns to the last pushed commit `4d34761` (only with the owner's approval; it would undo all UI work).
11. **Commit:** Commit A `99f4d50`; CP-01 commit is the one containing this file (`git log --oneline -1 -- docs/checkpoints/CP-01-baseline-and-safety-net.md`). Not pushed.
12. **Final status:** COMPLETE.
13. **Recommended next checkpoint:** CP-02 — Monorepo foundation and frontend relocation (needs decisions P-1 and P-2).

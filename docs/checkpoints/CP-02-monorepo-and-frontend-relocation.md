# CP-02 — Monorepo foundation and frontend relocation

1. **Objective:** Turn the repository into an npm workspaces monorepo and move the existing Expo app to `apps/mobile` with no change in behavior.
2. **Initial state:** Clean tree at `ff3d21c` (CP-01). Single Expo app at the root.
3. **Changes made:**
   - `git mv` of the app into `apps/mobile`: `src/`, `assets/`, `scripts/`, `app.json`, `tsconfig.json`, `eslint.config.js`, `jest.setup.js`, `package.json`, `.gitignore`, `AGENTS.md`. All 55 tracked files were staged as pure renames (R100) before the new root files were added.
   - **Correction (recorded in CP-03):** in the final commit `5bb8b94`, git records 53 renames. `package.json` and `.gitignore` appear as "root file modified + new file in `apps/mobile`", because new root files now exist at those paths and git's rename detection pairs them. `git log --follow` therefore doesn't trace those two app files past the move; their earlier history remains under the root paths. All other moved files follow normally.
   - New root `package.json`: `habit-tracker`, private, `workspaces: ["apps/*"]`, scripts `start` (forwards flags after `--`), `typecheck`, `lint`, `test` (run in every workspace).
   - New root `.gitignore` (dependencies, env files except `.env.example`, coverage, build info, OS files). The Expo-specific `.gitignore` moved to `apps/mobile`, where its `/ios` and `/android` rules now apply to the app folder.
   - `apps/mobile/package.json`: renamed to `@habit-tracker/mobile`; added `typecheck` script. Dependencies, Jest and Expo config unchanged.
   - Root `package-lock.json` regenerated for the workspace by `npm install` at the root.
   - Untracked local files moved with the app (plain `mv`, not deleted): `.expo/` (keeps the dev settings that make the tunnel URL stable) and `expo-env.d.ts`.
   - Docs: `CLAUDE.md` (layout, commands, `@apps/mobile/AGENTS.md` import), `README.md`, `ARCHITECTURE.md`, `TESTING.md`, `DECISIONS.md` (D-011, D-012; P-1 and P-2 resolved), `ROADMAP.md`, `DEVELOPMENT_STATE.md`, this record.
4. **Files:** Moved (55, listed above with their contents). Created: `package.json`, `.gitignore`, this record. Modified: `apps/mobile/package.json`, `package-lock.json`, `CLAUDE.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT_STATE.md`. Deleted: none. No app source, asset, `app.json` or `tsconfig.json` content changed.
5. **Important implementation decisions:**
   - Followed Expo's monorepo guide: Metro is configured automatically for monorepos (SDK 52+), so no `metro.config.js` was added.
   - Root `workspaces` lists only `apps/*`; `packages/*` is added with the shared package (CP-07).
   - The root `start` script ends with `--` so `npm start -- --tunnel` reaches `expo start`.
   - Expo `slug`, `scheme`, folder and repository names unchanged (D-012).
6. **Commands executed:** `git mv …`; `mv .expo expo-env.d.ts apps/mobile/`; `npm install` (root); lockfile comparison script; `npm why react`, `npm why react-native`, `npm ls`; `npm run typecheck`, `npm run lint`, `npm test` (root); `npx eslint .`, `npx expo-doctor`, `npx expo export` (from `apps/mobile`); `npm start -- --help`; `npm start -- --web --port 8099 --clear` plus headless-browser screenshots; `git diff --cached -M --name-status`.
7. **Results (observed 2026-10-19):**
   - Lockfile: 588 runtime and 460 dev package versions, identical to CP-01 (none added, removed or changed); new entries are only the workspace (`apps/mobile`) and its link.
   - One `react` (19.2.3), one `react-native` (0.86.3).
   - `npm run typecheck`, `npm run lint`: pass. `npm test`: 3 suites, 3 tests passed.
   - `npx eslint .` (app): 0 problems. `npx expo-doctor`: 21/21.
   - `npx expo export` from `apps/mobile`: iOS, Android and web bundled; no build output in the repo.
   - `npm start -- --help` reached `expo start --help` (flag forwarding works).
   - Home screenshots (393×852, scrolled 1200px, 375×667) served through the root `npm start`: hashes identical to the CP-01 baseline.
   - No stray `.expo/` or `expo-env.d.ts` created at the root; typed-route types regenerated in `apps/mobile/.expo/types/`.
8. **Acceptance criteria and evidence:**

   | Criterion | Status |
   |---|---|
   | History follows moved files | 55 R100 renames; `git log --follow` checked after the commit (see the CP-02 report) |
   | Common verification passes from the workspace | Met (item 7) |
   | Home screenshots identical to CP-01 | Met |
   | One copy of `react` and `react-native` | Met |
   | Owner confirms the app loads in Expo Go from `apps/mobile` | Met: the owner ran `npm start` from the repository root and the app loaded in Expo Go without errors (2026-10-19) |
9. **Known issues and deferred work:** Docker WSL integration still off (blocks CP-05).
10. **Rollback:** After commit: `git revert <CP-02 commit>`, run `npm install`, and move `apps/mobile/.expo` and `apps/mobile/expo-env.d.ts` back to the root. Before commit: reverse the moves with `git mv` (non-destructive), remove the new root `package.json` and `.gitignore` only with the owner's OK, restore `package-lock.json` from `HEAD`, and run `npm install`.
11. **Commit:** The CP-02 commit is the one containing this file (`git log --oneline -1 -- docs/checkpoints/CP-02-monorepo-and-frontend-relocation.md`), authorized by the owner; the owner also authorized pushing `main` to `origin`.
12. **Final status:** COMPLETE.
13. **Recommended next checkpoint:** CP-03 — Backend foundation (Express 5).

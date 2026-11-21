# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@apps/mobile/AGENTS.md

## Project

A habit tracker based on Maxwell Maltz's *Psycho-Cybernetics*. Requirements arrive incrementally from the user — don't build features ahead of their instructions.

**Mission:** evolve the existing Expo app into a checkpoint-driven full-stack monorepo (`apps/mobile`, `apps/api` with Express 5 + TypeScript, PostgreSQL + Drizzle, Zod contracts in `packages/shared` once the first contract exists) without losing the working frontend. Approved decisions are in `docs/DECISIONS.md`; don't reopen them without approval.

## Workflow and safety rules

- **Before any work, read `docs/DEVELOPMENT_STATE.md`** (authoritative state, next allowed checkpoint), then the relevant `docs/ROADMAP.md` entry and checkpoint records in `docs/checkpoints/`.
- Every checkpoint: read → plan → **get explicit approval** → implement only the agreed scope → verify → review the diff → update `DEVELOPMENT_STATE.md`, `ROADMAP.md` and the checkpoint record → report and **stop**. Never start the next checkpoint automatically; approval for the overall project is not approval for every checkpoint.
- Never claim a check passed unless it ran and its output was read; mark anything not run as unverified. Docs must describe the actual code, not the intended code.
- Git: inspect state first; treat uncommitted changes as the user's. **No commits or pushes without explicit authorization.** No destructive commands (`reset --hard`, `clean -fd`, force push) without authorization.
- Never print, commit or copy secrets; commit only `.env.example` files; don't overwrite existing env files.
- Don't change the package manager (npm), lockfile strategy, TypeScript config or dependency versions without approval. Don't deploy, publish or provision paid services without authorization.
- Don't add infrastructure (microservices, Kubernetes, Redis, queues) or features (auth, analytics, push, payments) without an approved requirement.

## Repository layout

npm workspaces monorepo (root `package.json`, one root `package-lock.json`; dependencies are hoisted to the root `node_modules`):

- `apps/mobile` — the Expo app (`@habit-tracker/mobile`). **All app paths below (`src/…`, `assets/…`, `app.json`, `scripts/…`) are relative to `apps/mobile`.**
- `apps/api` — the Express 5 REST API (`@habit-tracker/api`). Paths in the API section below are relative to `apps/api`. Contract: `docs/API.md`.
- `docs/` — state, roadmap, decisions, architecture, testing, checkpoint records.

## Commands

From the repository root:

```bash
npm install                    # install all workspaces (always from the root)
npm start                      # Expo dev server for the app; pass flags after --, e.g. npm start -- --tunnel (WSL2 + Expo Go)
npm run dev:api                # API with watch mode on 127.0.0.1:3000 (config: apps/api/.env, see .env.example)
npm run typecheck              # tsc --noEmit in every workspace
npm run lint                   # lint every workspace (app: expo lint src scripts)
npm test                       # tests in every workspace
```

From `apps/mobile`:

```bash
npx expo install <package>     # add app dependencies (run here, not at the root; resolves SDK-compatible versions)
npx eslint .                   # lint everything in the app
npx jest <path>                # one test file;  npx jest -t "<name>" for one test
npx expo-doctor                # dependency/config health
npx expo export --platform ios --platform android --platform web --output-dir <dir outside repo>   # bundle check
```

From `apps/api`:

```bash
npm install <pkg> -w @habit-tracker/api   # (run from the root) add API dependencies
npx vitest run <path>          # one test file;  npx vitest run -t "<name>" for one test
npm run typecheck              # tsc (typecheck only)
```

Check for duplicate React/React Native after dependency changes: `npm why react`, `npm why react-native` (one version each; duplicates break the app). Expo configures Metro for the monorepo automatically (SDK 52+); don't add `watchFolders`/`nodeModulesPaths` overrides.

Testing conventions (async RNTL 14 API, `@jest/globals` imports, where tests and helpers live, known warnings) are in `docs/TESTING.md`.

## Stack

- Expo SDK 57 (`expo` `^57.0.30` in `apps/mobile/package.json`, React Native 0.86, React 19.2), TypeScript strict, npm (`package-lock.json`). The user runs the app in **Expo Go from the Play Store (SDK 57)**, so don't upgrade the SDK and only add libraries that Expo Go includes — no custom native code. `expo.install.exclude` in `package.json` stops `npx expo install --fix` from changing the `expo` version.
- SDK 57 API notes: native tabs import from `expo-router/unstable-native-tabs`; React Native 0.86 only has `experimental_backgroundImage` (no stable `backgroundImage`); `expo-symbols` on Android/web loads the Material Symbols font asynchronously, so icons appear a moment after first render.
- Expo Router with typed routes; React Compiler enabled (`app.json` → `experiments`). Don't add manual `useMemo`/`useCallback` for performance — the compiler handles memoization.
- Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- Motion: scroll-driven effects run on the UI thread with Reanimated (`Animated.ScrollView` + `useScrollOffset`, then `useAnimatedStyle`/`useAnimatedReaction`). Never drive scroll effects through React state. Read and write shared values with `.get()`/`.set()` (React Compiler compatible), and honor `useReducedMotion()` by showing content without animation. `ScrollReveal` (`src/components/scroll-reveal.tsx`, inside a `ScrollRevealProvider` given the scroll view ref, offset and covered top/bottom insets) animates content in whenever it enters view in either direction and resets once fully off screen (user's requirement). Anchors (user's spec): scrolling down, an element animates when its top reaches 75% of the visible height; scrolling up, when its bottom reaches 25% (75% up from the bottom). Near the ends of the content the anchors ease toward the screen edge by the remaining scroll distance, so nothing stays hidden at the very top or bottom. It measures only on layout changes; per-frame work is arithmetic on the UI thread.
- Typography: use the role-based `Typography` tokens in `src/constants/app-theme.ts` (`largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `subheadline`, `caption`). iOS and web get Apple's Dynamic Type sizes with no added letter spacing; Android gets the Material 3 scale. Don't hard-code font sizes. Phone headlines use `title1`; `largeTitle` is for screens 600pt+ wide.
- Small phones: `useCompactLayout()` (`src/hooks/use-compact-layout.ts`) is true below 390pt wide or 700pt tall (iPhone SE, mini). Use it to shrink display elements and tighten spacing; check layouts at 375×667.
- iOS polish conventions: `borderCurve: 'continuous'` on rounded surfaces, SF Symbols for tab icons (`sf` + `md` on `NativeTabs.Trigger.Icon`), the brand accent as the tab tint, light haptics (`expo-haptics`) on toggles, and `maxFontSizeMultiplier` on display-size text so very large Dynamic Type settings don't break layouts.
- Platform-specific files use the `.web.tsx` / `.web.ts` suffix alongside the native version (e.g. `src/components/app-tabs.tsx` and `app-tabs.web.tsx`).
- Theme tokens live in `src/constants/theme.ts`; `ThemedText`/`ThemedView` in `src/components/` consume them.
- Light/dark mode is app state, not the system setting: `ColorSchemeProvider` (`src/hooks/use-color-scheme.tsx`, mounted in `src/app/_layout.tsx`) defaults to dark, and `ThemeToggle` flips it. On native it also calls `Appearance.setColorScheme` so native UI follows. Always read the scheme via `useColorScheme` from `@/hooks/use-color-scheme`, never from `react-native`, or the toggle won't apply. The choice isn't persisted yet.

## API (`apps/api`)

- Node 24 runs the TypeScript sources directly (type stripping, no build step; D-013). Therefore: relative imports end in `.ts`; no enums, namespaces or constructor parameter properties (`erasableSyntaxOnly`); no path aliases; type-only imports use `import type`. `tsc` only typechecks.
- `.env` is loaded in `src/server.ts` with `process.loadEnvFile()`, not with `--env-file-if-exists`, which crashes `node --watch` in Node 24 when the file is missing.
- `createApp()` (`src/app.ts`) builds the app without listening; tests drive it with supertest. Keep the API stateless (no in-process state) so instances can scale horizontally (D-008).
- Errors: throw `HttpError(status, code, message, details?)` for client-facing failures; anything else becomes a generic 500. Response shapes and codes are in `docs/API.md` — update it with every endpoint change.
- Config: add new environment variables to the Zod schema in `src/config/env.ts` and to `.env.example` (never commit `.env`).
- Uses its own `@types/node` (Node 24) and `zod` 4 under `apps/api/node_modules`; the root keeps the app's `@types/node` 26 and `zod` 3. `tsconfig` sets `"types": ["node"]` so the root copy isn't picked up.

## Brand

- Logo: a turquoise feedback loop (the 21-day cycle) with a white check mark breaking out through its gap, on a Flat UI Midnight Blue `#2C3E50` tile. Source SVGs are in `assets/brand/`; the in-app version is `Logo` (`src/components/logo.tsx`, via `react-native-svg`). Keep the geometry in both places in sync.
- PNGs in `assets/images/` (app icon, Android adaptive layers, splash icon, favicon) are generated from the SVGs: `node scripts/render-brand-assets.mjs <path-to-chrome>`. Don't edit them by hand.
- Placement: on iOS/Android the home screen's fixed `AppHeader` shows `BrandLockup` (logo, name, tagline) top-left and `ThemeToggle` top-right. On web, the floating nav bar (`app-tabs.web.tsx`) carries the lockup and toggle, so the home screen hides `AppHeader` there.
- Launch: the native splash (`app.json` → `expo-splash-screen`, `#17202A` with a matching `dark` variant, image width 96) hands off to `SplashOverlay`, which shows the same logo on the current theme background and fades out. **Expo Go doesn't show the native splash**: its Android loading screen is hard-coded white (`Color.White` in Expo Go's `SplashScreenView.kt`) with the app icon in a rounded square, and no app setting changes it. Only development/release builds show the `#17202A` splash (verified via prebuild: `splashscreen_background` and `activityBackground` are `#17202A`). `ColorSchemeProvider` sets the root view color to the theme background via `expo-system-ui`, which does work in Expo Go.
- `CycleRing` (`src/components/cycle-ring.tsx`) draws the logo's loop as 21 segments, one per day of a cycle; use it for cycle progress.

## Current state

The home screen (`src/app/index.tsx`) is built. No glassmorphism or blur (user removed it). The design uses two matching solid tones from Flat UI Midnight Blue: dark mode background `#17202A` with `#273746` cards and white card text; light mode Clouds `#ECF0F1` background with white cards. All colors live in `src/constants/app-theme.ts` (`AppThemes`, read via `useAppTheme`); the template's `Colors` in `src/constants/theme.ts` is derived from it, so the tab bar and Explore screen match. Content cards use `Card` (`src/components/card.tsx`). Keep text contrast at WCAG AA or better and touch targets at 44pt or more.

The Explore tab (`src/app/explore.tsx`) is still create-expo-app starter content until its design is planned.

Project docs live in `docs/` at the repository root. The API (`apps/api`) has only `GET /health` so far; the app doesn't call it yet (CP-04).

`apps/mobile/expo-env.d.ts` and `apps/mobile/.expo/types/` are generated by `npx expo start` and gitignored; if `tsc` reports missing CSS module or route types, start the dev server once to regenerate them.

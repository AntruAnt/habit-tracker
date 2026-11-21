# Habit Tracker

A habit tracker built on the ideas in Dr. Maxwell Maltz's *Psycho-Cybernetics* (1960): change how you see yourself, practice daily, and give a new habit about 21 days to take hold.

The mobile app is built with [Expo](https://expo.dev) (React Native) for iOS, Android and the web. A REST API (Express 5 + PostgreSQL) is being added alongside it.

## Repository layout

An npm workspaces monorepo:

| Path | What it is |
| --- | --- |
| `apps/mobile` | The Expo app (`@habit-tracker/mobile`) |
| `apps/api` | The REST API (`@habit-tracker/api`), Express 5 + TypeScript on Node 24 |
| `docs/` | Development state, roadmap, decisions, architecture, testing, checkpoint records |

## Getting started

```bash
npm install     # always from the repository root
npm start       # Expo dev server for the app
npm run dev:api # REST API on http://127.0.0.1:3000 (optional: copy apps/api/.env.example to apps/api/.env)
```

Requires Node 24 or later (the API runs TypeScript directly with Node's type stripping).

From the dev server you can open the app in [Expo Go](https://expo.dev/go), a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an Android emulator, an iOS simulator, or the browser (press `w`). If your phone can't reach the dev server (common under WSL2), use a tunnel: `npm start -- --tunnel`.

## Scripts (repository root)

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server (pass flags after `--`) |
| `npm run dev:api` | Start the API in watch mode |
| `npm run typecheck` | Typecheck every workspace |
| `npm run lint` | Lint every workspace |
| `npm test` | Run every workspace's tests |

Add app dependencies from `apps/mobile` with `npx expo install <package>`, so versions match the Expo SDK.

The API's endpoints and response conventions are documented in [`docs/API.md`](docs/API.md).

## Mobile app layout (`apps/mobile`)

- `src/app/` — screens, using file-based routing ([Expo Router](https://docs.expo.dev/router/introduction))
- `src/components/` — shared UI
- `src/constants/app-theme.ts` — colors, type scale and shapes for light and dark mode
- `src/__tests__/` — tests (Jest + React Native Testing Library)
- `assets/brand/` — logo source SVGs

## Brand assets

The app icon, Android adaptive icon layers, splash image and favicon in `apps/mobile/assets/images/` are generated from the SVGs in `apps/mobile/assets/brand/`. After changing the logo, regenerate them from `apps/mobile`:

```bash
node scripts/render-brand-assets.mjs <path-to-chrome-or-chromium>
```

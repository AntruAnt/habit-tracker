# Architecture

## Current (as of CP-03)

An npm workspaces monorepo with two independently runnable workspaces. Dependencies are installed from the root and hoisted to the root `node_modules` where versions allow; Expo configures Metro for the monorepo automatically (SDK 52+), so there is no custom `metro.config.js`. The app and the API are not connected yet (CP-04), and there is no database, authentication or persistence.

### Mobile app — `apps/mobile` (`@habit-tracker/mobile`)

Paths in this table are relative to `apps/mobile`.

| Area | Implementation |
|---|---|
| Runtime | Expo SDK 57, React Native 0.86.3, React 19.2.3; runs in Expo Go (SDK 57) and on the web |
| Routing | Expo Router (`src/app/`): `_layout.tsx`, `index.tsx` (Home), `explore.tsx` (template) |
| Navigation | Native tabs on iOS/Android (`expo-router/unstable-native-tabs`); custom tab bar on web (`app-tabs.web.tsx`) |
| Styling | `StyleSheet` with tokens in `src/constants/app-theme.ts` (colors, type scale, shapes) |
| State | React context for the light/dark theme (in memory); Reanimated shared values for scroll effects |
| Content | Static, defined in `src/app/index.tsx` |

### API — `apps/api` (`@habit-tracker/api`)

Express 5 + TypeScript, run directly by Node 24 (type stripping; no build step, D-013). Paths are relative to `apps/api`.

| Layer | Implementation |
|---|---|
| Entry point | `src/server.ts`: loads `.env` if present, validates config, listens, shuts down gracefully on `SIGTERM`/`SIGINT` (10 s limit) |
| App | `src/app.ts`: `createApp({ logger })` builds the Express app without listening (used by tests) |
| Config | `src/config/env.ts`: Zod schema for `NODE_ENV`, `HOST`, `PORT`, `LOG_LEVEL`; fails fast without echoing values |
| Routes | `src/routes/health.ts`: `GET /health` |
| Middleware | Request IDs and request logs (`pino-http` + `src/lib/request-id.ts`), JSON body parser (100 KB), `src/middleware/not-found.ts`, `src/middleware/error-handler.ts` |
| Errors | `src/lib/http-error.ts` (`HttpError` with status, code, message, details); the error handler maps everything else to safe responses (`docs/API.md`) |
| Logging | `src/lib/logger.ts`: pino JSON logs, credential headers redacted |

Services, data access and authentication layers are added when there is something for them to hold (CP-05 onward), not as empty folders.

**Data flow today (mobile):** `ColorSchemeProvider` holds the theme; components read colors through `useAppTheme`; the provider also syncs the native appearance and root background. Scroll offset lives in a Reanimated shared value consumed by the app bar, hero parallax and `ScrollReveal`. Nothing is saved or fetched.

## Target

```
apps/mobile ──fetch (JSON over HTTPS)──▶ apps/api (Express 5) ──Drizzle──▶ PostgreSQL
      ▲                                       ▲
      └────────── packages/shared (Zod schemas + types) ──┘
```

- **Mobile:** keeps its screens and behavior. Screens never call `fetch` directly; a single API client module owns base URL, headers, timeouts, cancellation and error mapping. The base URL comes from `EXPO_PUBLIC_API_URL`, set per environment.
- **API:** entry point and server config; routes and handlers; services (business rules such as 21-day cycles and course correction); data access (Drizzle); Zod validation at the boundary; auth middleware (CP-06); error handling and logging; config validation at startup.
- **Shared contracts:** introduced with the first real endpoint contract (CP-07). Both sides import the same Zod schemas.

### Reaching the API during development

| Where the app runs | API address |
|---|---|
| Android emulator | `http://10.0.2.2:<port>` |
| iOS simulator | `http://localhost:<port>` |
| Web (same machine) | `http://localhost:<port>` (needs CORS for the dev origin) |
| Physical phone in Expo Go | The computer's LAN address or a tunnel URL; never `localhost`. From WSL2 this needs mirrored networking, a port proxy or a tunnel (decision P-3, CP-04). |

## Scaling and data integrity

The goal is a simple local setup today that can scale without redesign.

- **Stateless API instances.** No session data, caches or counters in process memory; all persistent state lives in PostgreSQL. Any instance can serve any request, so instances can be added behind a load balancer.
- **Bounded connection pools.** Each instance uses a fixed-size pool. Total connections = instances × pool size, which must stay below the database's limit; when instances multiply, add a connection pooler (for example PgBouncer) before raising per-instance pool sizes.
- **Integrity in the database, not the app.** Uniqueness and foreign keys are database constraints; multi-step writes run in transactions.
- **Idempotent check-ins.** A unique constraint on (habit, local date) plus an upsert means concurrent taps, retries after timeouts, or two instances handling the same request cannot create duplicates. Concurrency tests prove this (CP-05, CP-07).
- **Growth path, in order of need:** read indexes for hot queries → connection pooler → read replicas for heavy reads → caching only after measurement shows a need. Microservices, Kubernetes, Redis and queues are not introduced without a demonstrated requirement (D-008).

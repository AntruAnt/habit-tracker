# API

The REST API in `apps/api` (`@habit-tracker/api`): Express 5 + TypeScript on Node 24. This document is the contract between the API and its clients; keep it in sync with the code.

## Base URL

| Environment | Base URL |
|---|---|
| Local (same machine) | `http://127.0.0.1:3000` (default `HOST`/`PORT`; see `apps/api/.env.example`) |
| Phone, emulator, web dev server | Set up in CP-04 (see `ARCHITECTURE.md` → Reaching the API during development) |

## Conventions

- **Format:** JSON request and response bodies (`Content-Type: application/json`). Request bodies over **100 KB** are rejected with `413`.
- **Success responses** return the resource itself as JSON (no wrapper).
- **Error responses** always have this shape:

  ```json
  {
    "error": {
      "code": "NOT_FOUND",
      "message": "No route matches this request.",
      "requestId": "b73ebfb8-bc67-4c1d-b767-16ece1c81757",
      "details": {}
    }
  }
  ```

  `code` is stable and meant for programs; `message` is for people and may change; `details` is present only when there is structured information (for example, which fields failed validation). Internal errors never include stack traces, error messages from dependencies, or other internals.
- **Request IDs:** every response has an `X-Request-Id` header, also returned as `error.requestId`. A client may send its own `X-Request-Id` (1–64 characters from `A–Z a–z 0–9 . _ -`); anything else is replaced with a new UUID. Logs record the same ID, so a failing request can be traced.
- **Versioning:** `/health` is unversioned. Resource endpoints (habits and so on, from CP-07) live under `/v1`, because installed mobile apps can't be forced to update; a breaking change goes to `/v2` while `/v1` keeps working.
- **Headers:** `X-Powered-By` is not sent.
- **Not yet in place:** authentication (CP-06), CORS for the web app (CP-04), rate limiting (CP-06/CP-09).

### Error codes

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_JSON` | The body is not valid JSON |
| 400 | `BAD_REQUEST` | Other malformed requests (for example, an unsupported body encoding) |
| 404 | `NOT_FOUND` | No route matches the method and path |
| 413 | `PAYLOAD_TOO_LARGE` | The body is larger than 100 KB |
| 500 | `INTERNAL_ERROR` | Unexpected server error; details are only in the server logs |

Endpoint-specific codes (for example `CONFLICT`, `VALIDATION_FAILED`) are listed with each endpoint as they are added.

## Endpoints

### `GET /health`

Liveness check: the process is up and serving requests. It does not check the database yet (a readiness check is added with the database in CP-05).

**Response `200`:**

```json
{ "status": "ok" }
```

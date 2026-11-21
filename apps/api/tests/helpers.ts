import { createApp } from '../src/app.ts';
import { createLogger } from '../src/lib/logger.ts';

/** The real app with logging switched off, for driving through supertest. */
export function createTestApp() {
  return createApp({ logger: createLogger('silent') });
}

/** Shape of a UUID v4, as generated for requests without a usable X-Request-Id. */
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** The body of every JSON error response (see docs/API.md). */
export type ErrorBody = {
  error: { code: string; message: string; requestId: string; details?: unknown };
};

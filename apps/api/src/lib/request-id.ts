import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Incoming IDs are reused only if they look like IDs, so the header can't inject junk into logs. */
const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{1,64}$/;

/**
 * Picks the ID used to correlate a request's logs and error responses: the client's
 * `X-Request-Id` when well formed, otherwise a new UUID. Echoed back in the response header.
 */
export function requestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', id);
  return id;
}

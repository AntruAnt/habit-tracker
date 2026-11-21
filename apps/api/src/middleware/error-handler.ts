import type { ErrorRequestHandler } from 'express';

import { HttpError } from '../lib/http-error.ts';

/** Fields set on errors raised by Express's body parser. */
type ParserErrorFields = { type?: unknown; status?: unknown };

/** Turns anything thrown or passed to `next()` into an HttpError that is safe to return. */
function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;

  if (typeof error === 'object' && error !== null) {
    const { type, status } = error as ParserErrorFields;
    if (type === 'entity.parse.failed') {
      return new HttpError(400, 'INVALID_JSON', 'The request body is not valid JSON.');
    }
    if (type === 'entity.too.large') {
      return new HttpError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large.');
    }
    // Other client errors from Express or the body parser, such as an unsupported charset.
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return new HttpError(status, 'BAD_REQUEST', 'The request could not be processed.');
    }
  }

  // Anything else is a bug or an outage: log it in full, but never send internals to clients.
  return new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong on our side.');
}

/**
 * Last middleware in the chain. Every error response has the same shape:
 * `{ "error": { "code", "message", "requestId", "details"? } }`.
 */
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  const httpError = toHttpError(error);
  if (httpError.status >= 500) {
    req.log.error({ err: error }, 'Request failed');
  }

  // Too late to send a JSON error; Express's default handler closes the connection.
  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(httpError.status).json({
    error: {
      code: httpError.code,
      message: httpError.message,
      requestId: req.id,
      ...(httpError.details === undefined ? {} : { details: httpError.details }),
    },
  });
};

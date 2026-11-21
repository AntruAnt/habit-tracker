import express from 'express';
import { pinoHttp } from 'pino-http';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { HttpError } from '../src/lib/http-error.ts';
import { createLogger } from '../src/lib/logger.ts';
import { requestId } from '../src/lib/request-id.ts';
import { errorHandler } from '../src/middleware/error-handler.ts';

import { createTestApp, type ErrorBody } from './helpers.ts';

/** An internal detail that must never reach a client. */
const INTERNAL_DETAIL = 'connect ECONNREFUSED db-internal.local:5432';

describe('error responses from the app', () => {
  it('returns a JSON 404 for unknown routes', async () => {
    const response = await request(createTestApp()).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'No route matches this request.',
        requestId: response.headers['x-request-id'],
      },
    });
  });

  it('rejects malformed JSON with a 400', async () => {
    const response = await request(createTestApp())
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"habit": ');

    expect(response.status).toBe(400);
    expect((response.body as ErrorBody).error.code).toBe('INVALID_JSON');
  });

  it('rejects bodies over the size limit with a 413', async () => {
    const response = await request(createTestApp())
      .post('/health')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ note: 'x'.repeat(110 * 1024) }));

    expect(response.status).toBe(413);
    expect((response.body as ErrorBody).error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('errorHandler', () => {
  /** A minimal app whose routes fail, wired with the real request-ID, logging and error middleware. */
  function createFailingApp() {
    const app = express();
    app.use(pinoHttp({ logger: createLogger('silent'), genReqId: requestId }));
    app.get('/sync-throw', () => {
      throw new Error(INTERNAL_DETAIL);
    });
    // Express 5 forwards rejected promises from async handlers to the error handler.
    app.get('/async-throw', async () => {
      await Promise.resolve();
      throw new Error(INTERNAL_DETAIL);
    });
    app.get('/http-error', () => {
      throw new HttpError(409, 'CONFLICT', 'That habit already exists.', { field: 'name' });
    });
    app.use(errorHandler);
    return app;
  }

  it.each(['/sync-throw', '/async-throw'])(
    'returns a generic 500 without internal details (%s)',
    async (path) => {
      const response = await request(createFailingApp()).get(path);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong on our side.',
          requestId: response.headers['x-request-id'],
        },
      });
      expect(response.text).not.toContain('ECONNREFUSED');
      expect(response.text).not.toContain('.ts:');
    },
  );

  it('returns an HttpError with its own status, code, message and details', async () => {
    const response = await request(createFailingApp()).get('/http-error');

    expect(response.status).toBe(409);
    expect((response.body as ErrorBody).error).toEqual({
      code: 'CONFLICT',
      message: 'That habit already exists.',
      requestId: response.headers['x-request-id'],
      details: { field: 'name' },
    });
  });
});

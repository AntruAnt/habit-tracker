import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createTestApp, UUID } from './helpers.ts';

describe('GET /health', () => {
  it('reports that the service is up', async () => {
    const response = await request(createTestApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('assigns a request ID when the client sends none', async () => {
    const response = await request(createTestApp()).get('/health');

    expect(response.headers['x-request-id']).toMatch(UUID);
  });

  it('reuses a well-formed request ID from the client', async () => {
    const response = await request(createTestApp()).get('/health').set('X-Request-Id', 'app-42.retry_1');

    expect(response.headers['x-request-id']).toBe('app-42.retry_1');
  });

  it('replaces a malformed request ID instead of trusting it', async () => {
    const response = await request(createTestApp())
      .get('/health')
      .set('X-Request-Id', 'not a valid id; drop table');

    expect(response.headers['x-request-id']).toMatch(UUID);
  });

  it('does not advertise the server framework', async () => {
    const response = await request(createTestApp()).get('/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});

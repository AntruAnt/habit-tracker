import express, { type Express } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

import { requestId } from './lib/request-id.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { notFound } from './middleware/not-found.ts';
import { healthRouter } from './routes/health.ts';

/** Largest JSON body accepted; anything bigger gets a 413. */
const JSON_BODY_LIMIT = '100kb';

type AppDependencies = {
  logger: Logger;
};

/**
 * Builds the Express app without starting a server, so tests can drive it directly.
 * Holds no per-process state: any number of instances can run behind a load balancer.
 */
export function createApp({ logger }: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(pinoHttp({ logger, genReqId: requestId }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(healthRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

import { Router } from 'express';

export const healthRouter = Router();

/** Liveness: the process is up and serving requests. A database readiness check comes with CP-05. */
healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

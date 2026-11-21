import type { RequestHandler } from 'express';

import { HttpError } from '../lib/http-error.ts';

/** Runs after all routes: anything unmatched becomes a JSON 404. */
export const notFound: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'NOT_FOUND', 'No route matches this request.'));
};

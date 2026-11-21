import { pino, type Logger } from 'pino';

import type { Config } from '../config/env.ts';

/** JSON logs to stdout. Credentials are redacted from request and response logs. */
export function createLogger(level: Config['LOG_LEVEL']): Logger {
  return pino({
    level,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[redacted]',
    },
  });
}

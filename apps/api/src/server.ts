import type { AddressInfo } from 'node:net';

import { createApp } from './app.ts';
import { ConfigError, loadConfig, type Config } from './config/env.ts';
import { createLogger } from './lib/logger.ts';

/** How long in-flight requests get to finish after a shutdown signal before the process exits. */
const SHUTDOWN_TIMEOUT_MS = 10_000;

// Local development reads apps/api/.env when it exists; variables already set in the environment
// win. Loaded here rather than with `--env-file-if-exists`, which crashes `node --watch` in Node 24
// when the file is missing.
try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

let config: Config;
try {
  config = loadConfig();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}

const logger = createLogger(config.LOG_LEVEL);
const app = createApp({ logger });

const server = app.listen(config.PORT, config.HOST, (error) => {
  if (error) {
    logger.fatal({ err: error }, 'Could not start the API');
    process.exitCode = 1;
    return;
  }
  const { address, port } = server.address() as AddressInfo;
  logger.info({ address, port, env: config.NODE_ENV }, 'API listening');
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'Shutting down');
  // Stop accepting connections, let in-flight requests finish, and close idle keep-alive sockets.
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Error while closing the server');
      process.exitCode = 1;
      return;
    }
    logger.info('Server closed');
  });
  server.closeIdleConnections();
  setTimeout(() => {
    logger.error('Shutdown timed out; forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

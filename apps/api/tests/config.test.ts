import { describe, expect, it } from 'vitest';

import { ConfigError, loadConfig } from '../src/config/env.ts';

describe('loadConfig', () => {
  it('applies safe defaults', () => {
    expect(loadConfig({})).toEqual({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: 3000,
      LOG_LEVEL: 'info',
    });
  });

  it('parses provided values', () => {
    expect(
      loadConfig({ NODE_ENV: 'production', HOST: '0.0.0.0', PORT: '8080', LOG_LEVEL: 'warn' }),
    ).toEqual({ NODE_ENV: 'production', HOST: '0.0.0.0', PORT: 8080, LOG_LEVEL: 'warn' });
  });

  it.each(['abc', '-1', '70000', '3.5'])('rejects an invalid PORT (%s)', (port) => {
    expect(() => loadConfig({ PORT: port })).toThrow(ConfigError);
    expect(() => loadConfig({ PORT: port })).toThrow(/PORT/);
  });

  it('rejects an unknown LOG_LEVEL', () => {
    expect(() => loadConfig({ LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/);
  });

  it('does not copy unrelated environment variables into the config', () => {
    const config = loadConfig({ PATH: '/usr/bin', UNRELATED_TOKEN: 'abc123' });

    expect(config).not.toHaveProperty('PATH');
    expect(config).not.toHaveProperty('UNRELATED_TOKEN');
  });
});

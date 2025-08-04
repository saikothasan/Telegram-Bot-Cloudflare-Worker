// Core exports
export { TelegramClient, type TelegramClientConfig } from './TelegramClient';
export { UpdateHandler, type UpdateHandlerConfig, type UpdateContext, type MiddlewareFunction, type UpdateHandlerFunction, commandParser, logger } from './UpdateHandler';
export { CloudflareWorkersAdapter, type CloudflareWorkerEnv, type CloudflareWorkersAdapterConfig, BotStateKV, BotSessionDurableObject, UserSessionDurableObject, createWorkerHandler } from './CloudflareWorkersAdapter';

// Type exports
export * from './types';

// Error exports
export * from './errors';

// Utility exports
export * from './utils';

// Middleware exports
export * from './middleware';

/**
 * Create a new Telegram bot instance with Cloudflare Workers integration
 */
export function createBot(config: {
  token: string;
  apiUrl?: string;
  timeout?: number;
  enableRateLimit?: boolean;
  maxRetries?: number;
  updateHandlerConfig?: UpdateHandlerConfig;
}) {
  const client = new TelegramClient({
    token: config.token,
    apiUrl: config.apiUrl,
    timeout: config.timeout,
    enableRateLimit: config.enableRateLimit,
    maxRetries: config.maxRetries,
  });

  const updateHandler = new UpdateHandler(config.updateHandlerConfig);

  const adapter = new CloudflareWorkersAdapter({
    client,
    updateHandler,
  });

  return {
    client,
    updateHandler,
    adapter,
  };
}

/**
 * Version of the library
 */
export const VERSION = '1.0.0';


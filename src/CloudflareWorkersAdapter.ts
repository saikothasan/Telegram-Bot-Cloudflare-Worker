import type { Update } from './types';
import type { TelegramClient } from './TelegramClient';
import type { UpdateHandler } from './UpdateHandler';

/**
 * Environment interface for Cloudflare Workers
 */
export interface CloudflareWorkerEnv {
  /** Bot token from environment variables */
  TELEGRAM_BOT_TOKEN?: string;
  /** Webhook secret token for verification */
  TELEGRAM_WEBHOOK_SECRET?: string;
  /** Workers KV namespace for bot state */
  BOT_STATE?: KVNamespace;
  /** Durable Object namespace for sessions */
  BOT_SESSIONS?: DurableObjectNamespace;
  /** Any additional environment variables */
  [key: string]: any;
}

/**
 * Configuration for CloudflareWorkersAdapter
 */
export interface CloudflareWorkersAdapterConfig {
  /** Telegram client instance */
  client: TelegramClient;
  /** Update handler instance */
  updateHandler: UpdateHandler;
  /** Whether to verify webhook secret token (default: true) */
  verifyWebhookSecret?: boolean;
  /** Custom error handler for webhook processing */
  errorHandler?: (error: Error, request: Request) => Promise<Response>;
}

/**
 * Adapter for integrating Telegram bot with Cloudflare Workers
 */
export class CloudflareWorkersAdapter {
  private client: TelegramClient;
  private updateHandler: UpdateHandler;
  private verifyWebhookSecret: boolean;
  private errorHandler?: (error: Error, request: Request) => Promise<Response>;

  constructor(config: CloudflareWorkersAdapterConfig) {
    this.client = config.client;
    this.updateHandler = config.updateHandler;
    this.verifyWebhookSecret = config.verifyWebhookSecret !== false;
    this.errorHandler = config.errorHandler;
  }

  /**
   * Handle incoming webhook requests from Telegram
   */
  async handleWebhook(request: Request, env: CloudflareWorkerEnv): Promise<Response> {
    try {
      // Only accept POST requests
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      // Verify webhook secret if enabled
      if (this.verifyWebhookSecret && env.TELEGRAM_WEBHOOK_SECRET) {
        const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
        if (secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
          return new Response('Unauthorized', { status: 401 });
        }
      }

      // Parse the update
      const update: Update = await request.json();

      // Validate update structure
      if (!update || typeof update.update_id !== 'number') {
        return new Response('Bad Request: Invalid update format', { status: 400 });
      }

      // Process the update
      await this.updateHandler.processUpdate(update, this.client);

      // Return success response
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error handling webhook:', error);

      if (this.errorHandler) {
        return this.errorHandler(error as Error, request);
      }

      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Set up webhook for the bot
   */
  async setupWebhook(
    webhookUrl: string,
    env: CloudflareWorkerEnv,
    options: {
      maxConnections?: number;
      allowedUpdates?: string[];
      dropPendingUpdates?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const result = await this.client.setWebhook({
        url: webhookUrl,
        max_connections: options.maxConnections,
        allowed_updates: options.allowedUpdates,
        drop_pending_updates: options.dropPendingUpdates,
        secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      });

      return result;
    } catch (error) {
      console.error('Error setting up webhook:', error);
      throw error;
    }
  }

  /**
   * Remove webhook and switch to long polling
   */
  async removeWebhook(dropPendingUpdates = false): Promise<boolean> {
    try {
      return await this.client.deleteWebhook({ drop_pending_updates: dropPendingUpdates });
    } catch (error) {
      console.error('Error removing webhook:', error);
      throw error;
    }
  }

  /**
   * Get current webhook info
   */
  async getWebhookInfo() {
    try {
      return await this.client.getWebhookInfo();
    } catch (error) {
      console.error('Error getting webhook info:', error);
      throw error;
    }
  }
}

/**
 * Helper class for managing bot state with Workers KV
 */
export class BotStateKV {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Get user state
   */
  async getUserState<T = any>(userId: string | number): Promise<T | null> {
    try {
      const value = await this.kv.get(`user:${userId}`, { type: 'json' });
      return value as T | null;
    } catch (error) {
      console.error('Error getting user state:', error);
      return null;
    }
  }

  /**
   * Set user state
   */
  async setUserState<T = any>(
    userId: string | number,
    state: T,
    options: { expirationTtl?: number } = {}
  ): Promise<void> {
    try {
      await this.kv.put(`user:${userId}`, JSON.stringify(state), {
        expirationTtl: options.expirationTtl,
      });
    } catch (error) {
      console.error('Error setting user state:', error);
      throw error;
    }
  }

  /**
   * Delete user state
   */
  async deleteUserState(userId: string | number): Promise<void> {
    try {
      await this.kv.delete(`user:${userId}`);
    } catch (error) {
      console.error('Error deleting user state:', error);
      throw error;
    }
  }

  /**
   * Get chat state
   */
  async getChatState<T = any>(chatId: string | number): Promise<T | null> {
    try {
      const value = await this.kv.get(`chat:${chatId}`, { type: 'json' });
      return value as T | null;
    } catch (error) {
      console.error('Error getting chat state:', error);
      return null;
    }
  }

  /**
   * Set chat state
   */
  async setChatState<T = any>(
    chatId: string | number,
    state: T,
    options: { expirationTtl?: number } = {}
  ): Promise<void> {
    try {
      await this.kv.put(`chat:${chatId}`, JSON.stringify(state), {
        expirationTtl: options.expirationTtl,
      });
    } catch (error) {
      console.error('Error setting chat state:', error);
      throw error;
    }
  }

  /**
   * Delete chat state
   */
  async deleteChatState(chatId: string | number): Promise<void> {
    try {
      await this.kv.delete(`chat:${chatId}`);
    } catch (error) {
      console.error('Error deleting chat state:', error);
      throw error;
    }
  }

  /**
   * Get global bot state
   */
  async getBotState<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(`bot:${key}`, { type: 'json' });
      return value as T | null;
    } catch (error) {
      console.error('Error getting bot state:', error);
      return null;
    }
  }

  /**
   * Set global bot state
   */
  async setBotState<T = any>(
    key: string,
    state: T,
    options: { expirationTtl?: number } = {}
  ): Promise<void> {
    try {
      await this.kv.put(`bot:${key}`, JSON.stringify(state), {
        expirationTtl: options.expirationTtl,
      });
    } catch (error) {
      console.error('Error setting bot state:', error);
      throw error;
    }
  }

  /**
   * Delete global bot state
   */
  async deleteBotState(key: string): Promise<void> {
    try {
      await this.kv.delete(`bot:${key}`);
    } catch (error) {
      console.error('Error deleting bot state:', error);
      throw error;
    }
  }

  /**
   * List keys with a prefix
   */
  async listKeys(prefix: string, limit = 1000): Promise<string[]> {
    try {
      const result = await this.kv.list({ prefix, limit });
      return result.keys.map(key => key.name);
    } catch (error) {
      console.error('Error listing keys:', error);
      return [];
    }
  }
}

/**
 * Base class for Durable Objects that can be used for bot sessions
 */
export abstract class BotSessionDurableObject {
  protected state: DurableObjectState;
  protected env: CloudflareWorkerEnv;

  constructor(state: DurableObjectState, env: CloudflareWorkerEnv) {
    this.state = state;
    this.env = env;
  }

  /**
   * Handle requests to this Durable Object
   */
  abstract fetch(request: Request): Promise<Response>;

  /**
   * Get session data
   */
  protected async getSessionData<T = any>(key: string): Promise<T | undefined> {
    return await this.state.storage.get<T>(key);
  }

  /**
   * Set session data
   */
  protected async setSessionData<T = any>(key: string, value: T): Promise<void> {
    await this.state.storage.put(key, value);
  }

  /**
   * Delete session data
   */
  protected async deleteSessionData(key: string): Promise<void> {
    await this.state.storage.delete(key);
  }

  /**
   * List all session keys
   */
  protected async listSessionKeys(): Promise<string[]> {
    const keys = await this.state.storage.list();
    return Array.from(keys.keys()) as string[];
  }

  /**
   * Clear all session data
   */
  protected async clearSession(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}

/**
 * Example implementation of a user session Durable Object
 */
export class UserSessionDurableObject extends BotSessionDurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    try {
      if (method === 'GET' && url.pathname === '/session') {
        // Get session data
        const sessionData = await this.getSessionData('data') || {};
        return new Response(JSON.stringify(sessionData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'POST' && url.pathname === '/session') {
        // Update session data
        const newData = await request.json();
        await this.setSessionData('data', newData);
        return new Response('OK');
      }

      if (method === 'DELETE' && url.pathname === '/session') {
        // Clear session
        await this.clearSession();
        return new Response('OK');
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error in UserSessionDurableObject:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}

/**
 * Helper function to create a Cloudflare Worker fetch handler
 */
export function createWorkerHandler(
  adapter: CloudflareWorkersAdapter,
  options: {
    webhookPath?: string;
    healthCheckPath?: string;
  } = {}
): (request: Request, env: CloudflareWorkerEnv, ctx: ExecutionContext) => Promise<Response> {
  const { webhookPath = '/webhook', healthCheckPath = '/health' } = options;

  return async (request: Request, env: CloudflareWorkerEnv, ctx: ExecutionContext): Promise<Response> => {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === healthCheckPath) {
      return new Response('OK', { status: 200 });
    }

    // Webhook endpoint
    if (url.pathname === webhookPath) {
      return adapter.handleWebhook(request, env);
    }

    // Default response for other paths
    return new Response('Not Found', { status: 404 });
  };
}


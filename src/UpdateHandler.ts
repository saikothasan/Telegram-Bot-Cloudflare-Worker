import type { Update, Message, CallbackQuery, InlineQuery, ChosenInlineResult } from './types';
import type { TelegramClient } from './TelegramClient';

/**
 * Context object passed to middleware and handlers
 */
export interface UpdateContext {
  update: Update;
  client: TelegramClient;
  [key: string]: any;
}

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  ctx: UpdateContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Handler function type for specific update types
 */
export type UpdateHandlerFunction = (ctx: UpdateContext) => Promise<void>;

/**
 * Configuration for UpdateHandler
 */
export interface UpdateHandlerConfig {
  /** Whether to handle edited messages (default: true) */
  handleEditedMessages?: boolean;
  /** Whether to handle channel posts (default: true) */
  handleChannelPosts?: boolean;
  /** Whether to handle inline queries (default: true) */
  handleInlineQueries?: boolean;
  /** Whether to handle callback queries (default: true) */
  handleCallbackQueries?: boolean;
  /** Whether to handle shipping queries (default: true) */
  handleShippingQueries?: boolean;
  /** Whether to handle pre-checkout queries (default: true) */
  handlePreCheckoutQueries?: boolean;
  /** Whether to handle poll updates (default: true) */
  handlePolls?: boolean;
  /** Whether to handle poll answers (default: true) */
  handlePollAnswers?: boolean;
  /** Whether to handle chat member updates (default: true) */
  handleChatMemberUpdates?: boolean;
  /** Whether to handle chat join requests (default: true) */
  handleChatJoinRequests?: boolean;
  /** Whether to handle chat boost updates (default: true) */
  handleChatBoosts?: boolean;
  /** Whether to handle business connection updates (default: true) */
  handleBusinessConnections?: boolean;
  /** Whether to handle business messages (default: true) */
  handleBusinessMessages?: boolean;
  /** Whether to handle message reactions (default: true) */
  handleMessageReactions?: boolean;
}

/**
 * Handler for processing Telegram updates with middleware support
 */
export class UpdateHandler {
  private middleware: MiddlewareFunction[] = [];
  private messageHandlers: UpdateHandlerFunction[] = [];
  private editedMessageHandlers: UpdateHandlerFunction[] = [];
  private channelPostHandlers: UpdateHandlerFunction[] = [];
  private editedChannelPostHandlers: UpdateHandlerFunction[] = [];
  private businessConnectionHandlers: UpdateHandlerFunction[] = [];
  private businessMessageHandlers: UpdateHandlerFunction[] = [];
  private editedBusinessMessageHandlers: UpdateHandlerFunction[] = [];
  private businessMessagesDeletedHandlers: UpdateHandlerFunction[] = [];
  private messageReactionHandlers: UpdateHandlerFunction[] = [];
  private messageReactionCountHandlers: UpdateHandlerFunction[] = [];
  private inlineQueryHandlers: UpdateHandlerFunction[] = [];
  private chosenInlineResultHandlers: UpdateHandlerFunction[] = [];
  private callbackQueryHandlers: UpdateHandlerFunction[] = [];
  private shippingQueryHandlers: UpdateHandlerFunction[] = [];
  private preCheckoutQueryHandlers: UpdateHandlerFunction[] = [];
  private pollHandlers: UpdateHandlerFunction[] = [];
  private pollAnswerHandlers: UpdateHandlerFunction[] = [];
  private myChatMemberHandlers: UpdateHandlerFunction[] = [];
  private chatMemberHandlers: UpdateHandlerFunction[] = [];
  private chatJoinRequestHandlers: UpdateHandlerFunction[] = [];
  private chatBoostHandlers: UpdateHandlerFunction[] = [];
  private removedChatBoostHandlers: UpdateHandlerFunction[] = [];

  private config: Required<UpdateHandlerConfig>;

  constructor(config: UpdateHandlerConfig = {}) {
    this.config = {
      handleEditedMessages: true,
      handleChannelPosts: true,
      handleInlineQueries: true,
      handleCallbackQueries: true,
      handleShippingQueries: true,
      handlePreCheckoutQueries: true,
      handlePolls: true,
      handlePollAnswers: true,
      handleChatMemberUpdates: true,
      handleChatJoinRequests: true,
      handleChatBoosts: true,
      handleBusinessConnections: true,
      handleBusinessMessages: true,
      handleMessageReactions: true,
      ...config,
    };
  }

  /**
   * Add middleware to the processing chain
   */
  use(middleware: MiddlewareFunction): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Add handler for regular messages
   */
  onMessage(handler: UpdateHandlerFunction): this {
    this.messageHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for edited messages
   */
  onEditedMessage(handler: UpdateHandlerFunction): this {
    this.editedMessageHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for channel posts
   */
  onChannelPost(handler: UpdateHandlerFunction): this {
    this.channelPostHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for edited channel posts
   */
  onEditedChannelPost(handler: UpdateHandlerFunction): this {
    this.editedChannelPostHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for business connection updates
   */
  onBusinessConnection(handler: UpdateHandlerFunction): this {
    this.businessConnectionHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for business messages
   */
  onBusinessMessage(handler: UpdateHandlerFunction): this {
    this.businessMessageHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for edited business messages
   */
  onEditedBusinessMessage(handler: UpdateHandlerFunction): this {
    this.editedBusinessMessageHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for deleted business messages
   */
  onBusinessMessagesDeleted(handler: UpdateHandlerFunction): this {
    this.businessMessagesDeletedHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for message reactions
   */
  onMessageReaction(handler: UpdateHandlerFunction): this {
    this.messageReactionHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for message reaction count updates
   */
  onMessageReactionCount(handler: UpdateHandlerFunction): this {
    this.messageReactionCountHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for inline queries
   */
  onInlineQuery(handler: UpdateHandlerFunction): this {
    this.inlineQueryHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for chosen inline results
   */
  onChosenInlineResult(handler: UpdateHandlerFunction): this {
    this.chosenInlineResultHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for callback queries
   */
  onCallbackQuery(handler: UpdateHandlerFunction): this {
    this.callbackQueryHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for shipping queries
   */
  onShippingQuery(handler: UpdateHandlerFunction): this {
    this.shippingQueryHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for pre-checkout queries
   */
  onPreCheckoutQuery(handler: UpdateHandlerFunction): this {
    this.preCheckoutQueryHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for poll updates
   */
  onPoll(handler: UpdateHandlerFunction): this {
    this.pollHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for poll answers
   */
  onPollAnswer(handler: UpdateHandlerFunction): this {
    this.pollAnswerHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for bot's chat member status updates
   */
  onMyChatMember(handler: UpdateHandlerFunction): this {
    this.myChatMemberHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for chat member updates
   */
  onChatMember(handler: UpdateHandlerFunction): this {
    this.chatMemberHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for chat join requests
   */
  onChatJoinRequest(handler: UpdateHandlerFunction): this {
    this.chatJoinRequestHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for chat boost updates
   */
  onChatBoost(handler: UpdateHandlerFunction): this {
    this.chatBoostHandlers.push(handler);
    return this;
  }

  /**
   * Add handler for removed chat boost updates
   */
  onRemovedChatBoost(handler: UpdateHandlerFunction): this {
    this.removedChatBoostHandlers.push(handler);
    return this;
  }

  /**
   * Process an incoming update
   */
  async processUpdate(update: Update, client: TelegramClient): Promise<void> {
    const ctx: UpdateContext = { update, client };

    try {
      await this.runMiddleware(ctx, async () => {
        await this.routeUpdate(ctx);
      });
    } catch (error) {
      console.error('Error processing update:', error);
      throw error;
    }
  }

  /**
   * Run middleware chain
   */
  private async runMiddleware(
    ctx: UpdateContext,
    next: () => Promise<void>
  ): Promise<void> {
    let index = 0;

    const dispatch = async (): Promise<void> => {
      if (index >= this.middleware.length) {
        await next();
        return;
      }

      const middleware = this.middleware[index++];
      await middleware(ctx, dispatch);
    };

    await dispatch();
  }

  /**
   * Route update to appropriate handlers
   */
  private async routeUpdate(ctx: UpdateContext): Promise<void> {
    const { update } = ctx;

    // Handle different types of updates
    if (update.message) {
      await this.runHandlers(this.messageHandlers, ctx);
    }

    if (update.edited_message && this.config.handleEditedMessages) {
      await this.runHandlers(this.editedMessageHandlers, ctx);
    }

    if (update.channel_post && this.config.handleChannelPosts) {
      await this.runHandlers(this.channelPostHandlers, ctx);
    }

    if (update.edited_channel_post && this.config.handleChannelPosts) {
      await this.runHandlers(this.editedChannelPostHandlers, ctx);
    }

    if (update.business_connection && this.config.handleBusinessConnections) {
      await this.runHandlers(this.businessConnectionHandlers, ctx);
    }

    if (update.business_message && this.config.handleBusinessMessages) {
      await this.runHandlers(this.businessMessageHandlers, ctx);
    }

    if (update.edited_business_message && this.config.handleBusinessMessages) {
      await this.runHandlers(this.editedBusinessMessageHandlers, ctx);
    }

    if (update.business_messages_deleted && this.config.handleBusinessMessages) {
      await this.runHandlers(this.businessMessagesDeletedHandlers, ctx);
    }

    if (update.message_reaction && this.config.handleMessageReactions) {
      await this.runHandlers(this.messageReactionHandlers, ctx);
    }

    if (update.message_reaction_count && this.config.handleMessageReactions) {
      await this.runHandlers(this.messageReactionCountHandlers, ctx);
    }

    if (update.inline_query && this.config.handleInlineQueries) {
      await this.runHandlers(this.inlineQueryHandlers, ctx);
    }

    if (update.chosen_inline_result && this.config.handleInlineQueries) {
      await this.runHandlers(this.chosenInlineResultHandlers, ctx);
    }

    if (update.callback_query && this.config.handleCallbackQueries) {
      await this.runHandlers(this.callbackQueryHandlers, ctx);
    }

    if (update.shipping_query && this.config.handleShippingQueries) {
      await this.runHandlers(this.shippingQueryHandlers, ctx);
    }

    if (update.pre_checkout_query && this.config.handlePreCheckoutQueries) {
      await this.runHandlers(this.preCheckoutQueryHandlers, ctx);
    }

    if (update.poll && this.config.handlePolls) {
      await this.runHandlers(this.pollHandlers, ctx);
    }

    if (update.poll_answer && this.config.handlePollAnswers) {
      await this.runHandlers(this.pollAnswerHandlers, ctx);
    }

    if (update.my_chat_member && this.config.handleChatMemberUpdates) {
      await this.runHandlers(this.myChatMemberHandlers, ctx);
    }

    if (update.chat_member && this.config.handleChatMemberUpdates) {
      await this.runHandlers(this.chatMemberHandlers, ctx);
    }

    if (update.chat_join_request && this.config.handleChatJoinRequests) {
      await this.runHandlers(this.chatJoinRequestHandlers, ctx);
    }

    if (update.chat_boost && this.config.handleChatBoosts) {
      await this.runHandlers(this.chatBoostHandlers, ctx);
    }

    if (update.removed_chat_boost && this.config.handleChatBoosts) {
      await this.runHandlers(this.removedChatBoostHandlers, ctx);
    }
  }

  /**
   * Run a list of handlers
   */
  private async runHandlers(
    handlers: UpdateHandlerFunction[],
    ctx: UpdateContext
  ): Promise<void> {
    for (const handler of handlers) {
      try {
        await handler(ctx);
      } catch (error) {
        console.error('Error in handler:', error);
        // Continue with other handlers even if one fails
      }
    }
  }
}

/**
 * Command parser middleware
 */
export function commandParser(): MiddlewareFunction {
  return async (ctx, next) => {
    const message = ctx.update.message || ctx.update.business_message;
    
    if (message?.text?.startsWith('/')) {
      const parts = message.text.split(' ');
      const commandPart = parts[0].substring(1); // Remove '/'
      const [command, botUsername] = commandPart.split('@');
      
      ctx.command = command;
      ctx.args = parts.slice(1);
      ctx.botUsername = botUsername;
    }
    
    await next();
  };
}

/**
 * Logging middleware
 */
export function logger(options: { logLevel?: 'info' | 'debug' | 'error' } = {}): MiddlewareFunction {
  const { logLevel = 'info' } = options;
  
  return async (ctx, next) => {
    const start = Date.now();
    const updateType = getUpdateType(ctx.update);
    
    if (logLevel === 'debug' || logLevel === 'info') {
      console.log(`[${new Date().toISOString()}] Processing ${updateType} update ${ctx.update.update_id}`);
    }
    
    try {
      await next();
      
      if (logLevel === 'debug') {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Completed ${updateType} update ${ctx.update.update_id} in ${duration}ms`);
      }
    } catch (error) {
      if (logLevel === 'error' || logLevel === 'info' || logLevel === 'debug') {
        console.error(`[${new Date().toISOString()}] Error processing ${updateType} update ${ctx.update.update_id}:`, error);
      }
      throw error;
    }
  };
}

/**
 * Get the type of update for logging purposes
 */
function getUpdateType(update: Update): string {
  if (update.message) return 'message';
  if (update.edited_message) return 'edited_message';
  if (update.channel_post) return 'channel_post';
  if (update.edited_channel_post) return 'edited_channel_post';
  if (update.business_connection) return 'business_connection';
  if (update.business_message) return 'business_message';
  if (update.edited_business_message) return 'edited_business_message';
  if (update.business_messages_deleted) return 'business_messages_deleted';
  if (update.message_reaction) return 'message_reaction';
  if (update.message_reaction_count) return 'message_reaction_count';
  if (update.inline_query) return 'inline_query';
  if (update.chosen_inline_result) return 'chosen_inline_result';
  if (update.callback_query) return 'callback_query';
  if (update.shipping_query) return 'shipping_query';
  if (update.pre_checkout_query) return 'pre_checkout_query';
  if (update.poll) return 'poll';
  if (update.poll_answer) return 'poll_answer';
  if (update.my_chat_member) return 'my_chat_member';
  if (update.chat_member) return 'chat_member';
  if (update.chat_join_request) return 'chat_join_request';
  if (update.chat_boost) return 'chat_boost';
  if (update.removed_chat_boost) return 'removed_chat_boost';
  return 'unknown';
}


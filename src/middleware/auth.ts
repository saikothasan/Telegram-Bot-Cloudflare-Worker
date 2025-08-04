import type { MiddlewareFunction, UpdateContext } from '../UpdateHandler';

/**
 * Configuration for authentication middleware
 */
export interface AuthConfig {
  /** List of allowed user IDs */
  allowedUsers?: number[];
  /** List of allowed chat IDs */
  allowedChats?: number[];
  /** List of admin user IDs */
  adminUsers?: number[];
  /** Whether to allow private chats (default: true) */
  allowPrivateChats?: boolean;
  /** Whether to allow group chats (default: true) */
  allowGroupChats?: boolean;
  /** Whether to allow supergroup chats (default: true) */
  allowSupergroupChats?: boolean;
  /** Whether to allow channel chats (default: true) */
  allowChannelChats?: boolean;
  /** Custom authorization function */
  customAuth?: (ctx: UpdateContext) => Promise<boolean> | boolean;
  /** Message to send when access is denied */
  deniedMessage?: string;
  /** Whether to send denied message (default: false) */
  sendDeniedMessage?: boolean;
}

/**
 * Authentication middleware
 */
export function auth(config: AuthConfig = {}): MiddlewareFunction {
  const {
    allowedUsers,
    allowedChats,
    adminUsers,
    allowPrivateChats = true,
    allowGroupChats = true,
    allowSupergroupChats = true,
    allowChannelChats = true,
    customAuth,
    deniedMessage = 'Access denied.',
    sendDeniedMessage = false,
  } = config;

  return async (ctx, next) => {
    const message = ctx.update.message || ctx.update.business_message || ctx.update.callback_query?.message;
    const user = ctx.update.message?.from || 
                 ctx.update.business_message?.from || 
                 ctx.update.callback_query?.from ||
                 ctx.update.inline_query?.from;
    const chat = message?.chat;

    // Check custom authentication first
    if (customAuth) {
      const isAuthorized = await customAuth(ctx);
      if (!isAuthorized) {
        if (sendDeniedMessage && chat && user) {
          await ctx.client.sendMessage({
            chat_id: chat.id,
            text: deniedMessage,
          });
        }
        return; // Stop processing
      }
    }

    // Check user authorization
    if (user && allowedUsers && !allowedUsers.includes(user.id)) {
      if (sendDeniedMessage && chat) {
        await ctx.client.sendMessage({
          chat_id: chat.id,
          text: deniedMessage,
        });
      }
      return; // Stop processing
    }

    // Check chat authorization
    if (chat && allowedChats && !allowedChats.includes(chat.id)) {
      if (sendDeniedMessage) {
        await ctx.client.sendMessage({
          chat_id: chat.id,
          text: deniedMessage,
        });
      }
      return; // Stop processing
    }

    // Check chat type authorization
    if (chat) {
      const chatTypeAllowed = 
        (chat.type === 'private' && allowPrivateChats) ||
        (chat.type === 'group' && allowGroupChats) ||
        (chat.type === 'supergroup' && allowSupergroupChats) ||
        (chat.type === 'channel' && allowChannelChats);

      if (!chatTypeAllowed) {
        if (sendDeniedMessage) {
          await ctx.client.sendMessage({
            chat_id: chat.id,
            text: deniedMessage,
          });
        }
        return; // Stop processing
      }
    }

    // Add user info to context
    if (user) {
      ctx.user = user;
      ctx.isAdmin = adminUsers ? adminUsers.includes(user.id) : false;
    }

    if (chat) {
      ctx.chat = chat;
    }

    await next();
  };
}

/**
 * Admin-only middleware
 */
export function adminOnly(adminUsers: number[], deniedMessage = 'Admin access required.'): MiddlewareFunction {
  return auth({
    allowedUsers: adminUsers,
    adminUsers,
    deniedMessage,
    sendDeniedMessage: true,
  });
}

/**
 * Private chat only middleware
 */
export function privateOnly(deniedMessage = 'This command is only available in private chats.'): MiddlewareFunction {
  return auth({
    allowPrivateChats: true,
    allowGroupChats: false,
    allowSupergroupChats: false,
    allowChannelChats: false,
    deniedMessage,
    sendDeniedMessage: true,
  });
}

/**
 * Group chat only middleware
 */
export function groupOnly(deniedMessage = 'This command is only available in group chats.'): MiddlewareFunction {
  return auth({
    allowPrivateChats: false,
    allowGroupChats: true,
    allowSupergroupChats: true,
    allowChannelChats: false,
    deniedMessage,
    sendDeniedMessage: true,
  });
}

/**
 * Channel only middleware
 */
export function channelOnly(deniedMessage = 'This command is only available in channels.'): MiddlewareFunction {
  return auth({
    allowPrivateChats: false,
    allowGroupChats: false,
    allowSupergroupChats: false,
    allowChannelChats: true,
    deniedMessage,
    sendDeniedMessage: true,
  });
}

/**
 * Whitelist middleware for specific users
 */
export function whitelist(userIds: number[], deniedMessage = 'You are not authorized to use this bot.'): MiddlewareFunction {
  return auth({
    allowedUsers: userIds,
    deniedMessage,
    sendDeniedMessage: true,
  });
}

/**
 * Blacklist middleware to block specific users
 */
export function blacklist(userIds: number[]): MiddlewareFunction {
  return async (ctx, next) => {
    const user = ctx.update.message?.from || 
                 ctx.update.business_message?.from || 
                 ctx.update.callback_query?.from ||
                 ctx.update.inline_query?.from;

    if (user && userIds.includes(user.id)) {
      return; // Stop processing for blacklisted users
    }

    await next();
  };
}

/**
 * Check if user is a chat administrator
 */
export async function isUserAdmin(ctx: UpdateContext, userId: number, chatId: number): Promise<boolean> {
  try {
    const chatMember = await ctx.client.getChatMember({
      chat_id: chatId,
      user_id: userId,
    });

    return chatMember.status === 'administrator' || chatMember.status === 'creator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Chat admin only middleware
 */
export function chatAdminOnly(deniedMessage = 'Admin privileges required in this chat.'): MiddlewareFunction {
  return async (ctx, next) => {
    const message = ctx.update.message || ctx.update.business_message || ctx.update.callback_query?.message;
    const user = ctx.update.message?.from || 
                 ctx.update.business_message?.from || 
                 ctx.update.callback_query?.from;
    const chat = message?.chat;

    if (!user || !chat) {
      return; // No user or chat info available
    }

    // Skip check for private chats
    if (chat.type === 'private') {
      await next();
      return;
    }

    const isAdmin = await isUserAdmin(ctx, user.id, chat.id);
    
    if (!isAdmin) {
      await ctx.client.sendMessage({
        chat_id: chat.id,
        text: deniedMessage,
      });
      return; // Stop processing
    }

    await next();
  };
}

/**
 * Bot admin or chat admin middleware
 */
export function adminOrChatAdmin(
  botAdmins: number[], 
  deniedMessage = 'Admin privileges required.'
): MiddlewareFunction {
  return async (ctx, next) => {
    const message = ctx.update.message || ctx.update.business_message || ctx.update.callback_query?.message;
    const user = ctx.update.message?.from || 
                 ctx.update.business_message?.from || 
                 ctx.update.callback_query?.from;
    const chat = message?.chat;

    if (!user) {
      return; // No user info available
    }

    // Check if user is a bot admin
    if (botAdmins.includes(user.id)) {
      ctx.isAdmin = true;
      await next();
      return;
    }

    // Check if user is a chat admin (for group chats)
    if (chat && chat.type !== 'private') {
      const isAdmin = await isUserAdmin(ctx, user.id, chat.id);
      if (isAdmin) {
        ctx.isChatAdmin = true;
        await next();
        return;
      }
    }

    // Access denied
    if (chat) {
      await ctx.client.sendMessage({
        chat_id: chat.id,
        text: deniedMessage,
      });
    }
  };
}


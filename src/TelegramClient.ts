import type {
  Update,
  Message,
  User,
  Chat,
  ChatMember,
  File,
  UserProfilePhotos,
  WebhookInfo,
  BotCommand,
  BotCommandScope,
  MenuButton,
  ChatAdministratorRights,
  SendMessageParams,
  Poll,
  Sticker,
  StickerSet,
  GameHighScore,
  InlineQueryResult,
  LabeledPrice,
  ShippingOption,
  PassportElementError,
} from './types';

/**
 * Configuration options for TelegramClient
 */
export interface TelegramClientConfig {
  /** Bot token obtained from BotFather */
  token: string;
  /** Base URL for Telegram Bot API (default: https://api.telegram.org) */
  apiUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable rate limiting (default: true) */
  enableRateLimit?: boolean;
  /** Maximum number of retries for failed requests (default: 3) */
  maxRetries?: number;
}

/**
 * Response wrapper for Telegram Bot API responses
 */
export interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
  parameters?: ResponseParameters;
}

/**
 * Response parameters for error handling
 */
export interface ResponseParameters {
  migrate_to_chat_id?: number;
  retry_after?: number;
}

/**
 * Rate limiter for managing API request frequency
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 30; // Telegram allows 30 requests per second
  private readonly windowMs = 1000; // 1 second window

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Main client for interacting with the Telegram Bot API
 */
export class TelegramClient {
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly enableRateLimit: boolean;
  private readonly maxRetries: number;
  private readonly rateLimiter: RateLimiter;

  constructor(config: TelegramClientConfig) {
    this.apiUrl = `${config.apiUrl || 'https://api.telegram.org'}/bot${config.token}`;
    this.timeout = config.timeout || 30000;
    this.enableRateLimit = config.enableRateLimit !== false;
    this.maxRetries = config.maxRetries || 3;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Make a request to the Telegram Bot API
   */
  private async makeRequest<T>(
    method: string,
    params?: Record<string, any>,
    retryCount = 0
  ): Promise<T> {
    if (this.enableRateLimit) {
      await this.rateLimiter.waitIfNeeded();
    }

    const url = `${this.apiUrl}/${method}`;
    const body = params ? JSON.stringify(params) : undefined;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
        signal: AbortSignal.timeout(this.timeout),
      });

      const data: TelegramResponse<T> = await response.json();

      if (!data.ok) {
        const error = new TelegramError(
          data.description || 'Unknown error',
          data.error_code,
          data.parameters
        );

        // Handle rate limiting
        if (data.error_code === 429 && data.parameters?.retry_after) {
          if (retryCount < this.maxRetries) {
            await new Promise(resolve => 
              setTimeout(resolve, data.parameters!.retry_after! * 1000)
            );
            return this.makeRequest(method, params, retryCount + 1);
          }
        }

        throw error;
      }

      return data.result!;
    } catch (error) {
      if (error instanceof TelegramError) {
        throw error;
      }

      // Retry on network errors
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.makeRequest(method, params, retryCount + 1);
      }

      throw new TelegramError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Getting updates

  /**
   * Use this method to receive incoming updates using long polling.
   */
  async getUpdates(params?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowed_updates?: string[];
  }): Promise<Update[]> {
    return this.makeRequest('getUpdates', params);
  }

  /**
   * Use this method to specify a URL and receive incoming updates via an outgoing webhook.
   */
  async setWebhook(params: {
    url: string;
    certificate?: File;
    ip_address?: string;
    max_connections?: number;
    allowed_updates?: string[];
    drop_pending_updates?: boolean;
    secret_token?: string;
  }): Promise<boolean> {
    return this.makeRequest('setWebhook', params);
  }

  /**
   * Use this method to remove webhook integration if you decide to switch back to getUpdates.
   */
  async deleteWebhook(params?: {
    drop_pending_updates?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('deleteWebhook', params);
  }

  /**
   * Use this method to get current webhook status.
   */
  async getWebhookInfo(): Promise<WebhookInfo> {
    return this.makeRequest('getWebhookInfo');
  }

  // Available methods

  /**
   * A simple method for testing your bot's authentication token.
   */
  async getMe(): Promise<User> {
    return this.makeRequest('getMe');
  }

  /**
   * Use this method to log out from the cloud Bot API server before launching the bot locally.
   */
  async logOut(): Promise<boolean> {
    return this.makeRequest('logOut');
  }

  /**
   * Use this method to close the bot instance before moving it from one local server to another.
   */
  async close(): Promise<boolean> {
    return this.makeRequest('close');
  }

  /**
   * Use this method to send text messages.
   */
  async sendMessage(params: SendMessageParams): Promise<Message> {
    return this.makeRequest('sendMessage', params);
  }

  /**
   * Use this method to forward messages of any kind.
   */
  async forwardMessage(params: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    message_thread_id?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
  }): Promise<Message> {
    return this.makeRequest('forwardMessage', params);
  }

  /**
   * Use this method to forward multiple messages of any kind.
   */
  async forwardMessages(params: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    message_thread_id?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
  }): Promise<MessageId[]> {
    return this.makeRequest('forwardMessages', params);
  }

  /**
   * Use this method to copy messages of any kind.
   */
  async copyMessage(params: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    message_thread_id?: number;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<MessageId> {
    return this.makeRequest('copyMessage', params);
  }

  /**
   * Use this method to copy messages of any kind.
   */
  async copyMessages(params: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    message_thread_id?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    remove_caption?: boolean;
  }): Promise<MessageId[]> {
    return this.makeRequest('copyMessages', params);
  }

  /**
   * Use this method to send photos.
   */
  async sendPhoto(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    photo: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    has_spoiler?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendPhoto', params);
  }

  /**
   * Use this method to send audio files.
   */
  async sendAudio(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    audio: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    duration?: number;
    performer?: string;
    title?: string;
    thumbnail?: InputFile | string;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendAudio', params);
  }

  /**
   * Use this method to send general files.
   */
  async sendDocument(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    document: InputFile | string;
    thumbnail?: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    disable_content_type_detection?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendDocument', params);
  }

  /**
   * Use this method to send video files.
   */
  async sendVideo(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    video: InputFile | string;
    duration?: number;
    width?: number;
    height?: number;
    thumbnail?: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    has_spoiler?: boolean;
    supports_streaming?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendVideo', params);
  }

  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).
   */
  async sendAnimation(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    animation: InputFile | string;
    duration?: number;
    width?: number;
    height?: number;
    thumbnail?: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    has_spoiler?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendAnimation', params);
  }

  /**
   * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message.
   */
  async sendVoice(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    voice: InputFile | string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    duration?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendVoice', params);
  }

  /**
   * Use this method to send video messages.
   */
  async sendVideoNote(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    video_note: InputFile | string;
    duration?: number;
    length?: number;
    thumbnail?: InputFile | string;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendVideoNote', params);
  }

  /**
   * Use this method to send paid media.
   */
  async sendPaidMedia(params: {
    business_connection_id?: string;
    chat_id: number | string;
    star_count: number;
    media: InputPaidMedia[];
    payload?: string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendPaidMedia', params);
  }

  /**
   * Use this method to send a group of photos, videos, documents or audios as an album.
   */
  async sendMediaGroup(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    media: InputMedia[];
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
  }): Promise<Message[]> {
    return this.makeRequest('sendMediaGroup', params);
  }

  /**
   * Use this method to send point on the map.
   */
  async sendLocation(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    latitude: number;
    longitude: number;
    horizontal_accuracy?: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendLocation', params);
  }

  /**
   * Use this method to send information about a venue.
   */
  async sendVenue(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    latitude: number;
    longitude: number;
    title: string;
    address: string;
    foursquare_id?: string;
    foursquare_type?: string;
    google_place_id?: string;
    google_place_type?: string;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendVenue', params);
  }

  /**
   * Use this method to send phone contacts.
   */
  async sendContact(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    phone_number: string;
    first_name: string;
    last_name?: string;
    vcard?: string;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendContact', params);
  }

  /**
   * Use this method to send a native poll.
   */
  async sendPoll(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    question: string;
    question_parse_mode?: string;
    question_entities?: MessageEntity[];
    options: InputPollOption[];
    is_anonymous?: boolean;
    type?: string;
    allows_multiple_answers?: boolean;
    correct_option_id?: number;
    explanation?: string;
    explanation_parse_mode?: string;
    explanation_entities?: MessageEntity[];
    open_period?: number;
    close_date?: number;
    is_closed?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendPoll', params);
  }

  /**
   * Use this method to send an animated emoji that will display a random value.
   */
  async sendDice(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    emoji?: string;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_effect_id?: string;
    reply_parameters?: ReplyParameters;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
  }): Promise<Message> {
    return this.makeRequest('sendDice', params);
  }

  /**
   * Use this method when you need to tell the user that something is happening on the bot's side.
   */
  async sendChatAction(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_thread_id?: number;
    action: string;
  }): Promise<boolean> {
    return this.makeRequest('sendChatAction', params);
  }

  /**
   * Use this method to change the chosen reactions on a message.
   */
  async setMessageReaction(params: {
    chat_id: number | string;
    message_id: number;
    reaction?: ReactionType[];
    is_big?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('setMessageReaction', params);
  }

  /**
   * Use this method to get a list of profile pictures for a user.
   */
  async getUserProfilePhotos(params: {
    user_id: number;
    offset?: number;
    limit?: number;
  }): Promise<UserProfilePhotos> {
    return this.makeRequest('getUserProfilePhotos', params);
  }

  /**
   * Use this method to get basic information about a file and prepare it for downloading.
   */
  async getFile(params: {
    file_id: string;
  }): Promise<File> {
    return this.makeRequest('getFile', params);
  }

  /**
   * Use this method to ban a user in a group, a supergroup or a channel.
   */
  async banChatMember(params: {
    chat_id: number | string;
    user_id: number;
    until_date?: number;
    revoke_messages?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('banChatMember', params);
  }

  /**
   * Use this method to unban a previously banned user in a supergroup or channel.
   */
  async unbanChatMember(params: {
    chat_id: number | string;
    user_id: number;
    only_if_banned?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('unbanChatMember', params);
  }

  /**
   * Use this method to restrict a user in a supergroup.
   */
  async restrictChatMember(params: {
    chat_id: number | string;
    user_id: number;
    permissions: ChatPermissions;
    use_independent_chat_permissions?: boolean;
    until_date?: number;
  }): Promise<boolean> {
    return this.makeRequest('restrictChatMember', params);
  }

  /**
   * Use this method to promote or demote a user in a supergroup or a channel.
   */
  async promoteChatMember(params: {
    chat_id: number | string;
    user_id: number;
    is_anonymous?: boolean;
    can_manage_chat?: boolean;
    can_delete_messages?: boolean;
    can_manage_video_chats?: boolean;
    can_restrict_members?: boolean;
    can_promote_members?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_post_messages?: boolean;
    can_edit_messages?: boolean;
    can_pin_messages?: boolean;
    can_post_stories?: boolean;
    can_edit_stories?: boolean;
    can_delete_stories?: boolean;
    can_manage_topics?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('promoteChatMember', params);
  }

  /**
   * Use this method to set a custom title for an administrator in a supergroup promoted by the bot.
   */
  async setChatAdministratorCustomTitle(params: {
    chat_id: number | string;
    user_id: number;
    custom_title: string;
  }): Promise<boolean> {
    return this.makeRequest('setChatAdministratorCustomTitle', params);
  }

  /**
   * Use this method to ban a channel chat in a supergroup or a channel.
   */
  async banChatSenderChat(params: {
    chat_id: number | string;
    sender_chat_id: number;
  }): Promise<boolean> {
    return this.makeRequest('banChatSenderChat', params);
  }

  /**
   * Use this method to unban a previously banned channel chat in a supergroup or channel.
   */
  async unbanChatSenderChat(params: {
    chat_id: number | string;
    sender_chat_id: number;
  }): Promise<boolean> {
    return this.makeRequest('unbanChatSenderChat', params);
  }

  /**
   * Use this method to set default chat permissions for all members.
   */
  async setChatPermissions(params: {
    chat_id: number | string;
    permissions: ChatPermissions;
    use_independent_chat_permissions?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('setChatPermissions', params);
  }

  /**
   * Use this method to generate a new primary invite link for a chat.
   */
  async exportChatInviteLink(params: {
    chat_id: number | string;
  }): Promise<string> {
    return this.makeRequest('exportChatInviteLink', params);
  }

  /**
   * Use this method to create an additional invite link for a chat.
   */
  async createChatInviteLink(params: {
    chat_id: number | string;
    name?: string;
    expire_date?: number;
    member_limit?: number;
    creates_join_request?: boolean;
  }): Promise<ChatInviteLink> {
    return this.makeRequest('createChatInviteLink', params);
  }

  /**
   * Use this method to edit a non-primary invite link created by the bot.
   */
  async editChatInviteLink(params: {
    chat_id: number | string;
    invite_link: string;
    name?: string;
    expire_date?: number;
    member_limit?: number;
    creates_join_request?: boolean;
  }): Promise<ChatInviteLink> {
    return this.makeRequest('editChatInviteLink', params);
  }

  /**
   * Use this method to create a subscription invite link for a channel chat.
   */
  async createChatSubscriptionInviteLink(params: {
    chat_id: number | string;
    subscription_period: number;
    subscription_price: number;
    name?: string;
  }): Promise<ChatInviteLink> {
    return this.makeRequest('createChatSubscriptionInviteLink', params);
  }

  /**
   * Use this method to edit a subscription invite link created by the bot.
   */
  async editChatSubscriptionInviteLink(params: {
    chat_id: number | string;
    invite_link: string;
    name?: string;
  }): Promise<ChatInviteLink> {
    return this.makeRequest('editChatSubscriptionInviteLink', params);
  }

  /**
   * Use this method to revoke an invite link created by the bot.
   */
  async revokeChatInviteLink(params: {
    chat_id: number | string;
    invite_link: string;
  }): Promise<ChatInviteLink> {
    return this.makeRequest('revokeChatInviteLink', params);
  }

  /**
   * Use this method to approve a chat join request.
   */
  async approveChatJoinRequest(params: {
    chat_id: number | string;
    user_id: number;
  }): Promise<boolean> {
    return this.makeRequest('approveChatJoinRequest', params);
  }

  /**
   * Use this method to decline a chat join request.
   */
  async declineChatJoinRequest(params: {
    chat_id: number | string;
    user_id: number;
  }): Promise<boolean> {
    return this.makeRequest('declineChatJoinRequest', params);
  }

  /**
   * Use this method to set a new profile photo for the chat.
   */
  async setChatPhoto(params: {
    chat_id: number | string;
    photo: InputFile;
  }): Promise<boolean> {
    return this.makeRequest('setChatPhoto', params);
  }

  /**
   * Use this method to delete a chat photo.
   */
  async deleteChatPhoto(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('deleteChatPhoto', params);
  }

  /**
   * Use this method to change the title of a chat.
   */
  async setChatTitle(params: {
    chat_id: number | string;
    title: string;
  }): Promise<boolean> {
    return this.makeRequest('setChatTitle', params);
  }

  /**
   * Use this method to change the description of a group, a supergroup or a channel.
   */
  async setChatDescription(params: {
    chat_id: number | string;
    description?: string;
  }): Promise<boolean> {
    return this.makeRequest('setChatDescription', params);
  }

  /**
   * Use this method to add a message to the list of pinned messages in a chat.
   */
  async pinChatMessage(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_id: number;
    disable_notification?: boolean;
  }): Promise<boolean> {
    return this.makeRequest('pinChatMessage', params);
  }

  /**
   * Use this method to remove a message from the list of pinned messages in a chat.
   */
  async unpinChatMessage(params: {
    business_connection_id?: string;
    chat_id: number | string;
    message_id?: number;
  }): Promise<boolean> {
    return this.makeRequest('unpinChatMessage', params);
  }

  /**
   * Use this method to clear the list of pinned messages in a chat.
   */
  async unpinAllChatMessages(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('unpinAllChatMessages', params);
  }

  /**
   * Use this method for your bot to leave a group, supergroup or channel.
   */
  async leaveChat(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('leaveChat', params);
  }

  /**
   * Use this method to get up-to-date information about the chat.
   */
  async getChat(params: {
    chat_id: number | string;
  }): Promise<ChatFullInfo> {
    return this.makeRequest('getChat', params);
  }

  /**
   * Use this method to get a list of administrators in a chat.
   */
  async getChatAdministrators(params: {
    chat_id: number | string;
  }): Promise<ChatMember[]> {
    return this.makeRequest('getChatAdministrators', params);
  }

  /**
   * Use this method to get the number of members in a chat.
   */
  async getChatMemberCount(params: {
    chat_id: number | string;
  }): Promise<number> {
    return this.makeRequest('getChatMemberCount', params);
  }

  /**
   * Use this method to get information about a member of a chat.
   */
  async getChatMember(params: {
    chat_id: number | string;
    user_id: number;
  }): Promise<ChatMember> {
    return this.makeRequest('getChatMember', params);
  }

  /**
   * Use this method to set a new group sticker set for a supergroup.
   */
  async setChatStickerSet(params: {
    chat_id: number | string;
    sticker_set_name: string;
  }): Promise<boolean> {
    return this.makeRequest('setChatStickerSet', params);
  }

  /**
   * Use this method to delete a group sticker set from a supergroup.
   */
  async deleteChatStickerSet(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('deleteChatStickerSet', params);
  }

  /**
   * Use this method to get custom emoji stickers, which can be used as a forum topic icon by any user.
   */
  async getForumTopicIconStickers(): Promise<Sticker[]> {
    return this.makeRequest('getForumTopicIconStickers');
  }

  /**
   * Use this method to create a topic in a forum supergroup chat.
   */
  async createForumTopic(params: {
    chat_id: number | string;
    name: string;
    icon_color?: number;
    icon_custom_emoji_id?: string;
  }): Promise<ForumTopic> {
    return this.makeRequest('createForumTopic', params);
  }

  /**
   * Use this method to edit name and icon of a topic in a forum supergroup chat.
   */
  async editForumTopic(params: {
    chat_id: number | string;
    message_thread_id: number;
    name?: string;
    icon_custom_emoji_id?: string;
  }): Promise<boolean> {
    return this.makeRequest('editForumTopic', params);
  }

  /**
   * Use this method to close an open topic in a forum supergroup chat.
   */
  async closeForumTopic(params: {
    chat_id: number | string;
    message_thread_id: number;
  }): Promise<boolean> {
    return this.makeRequest('closeForumTopic', params);
  }

  /**
   * Use this method to reopen a closed topic in a forum supergroup chat.
   */
  async reopenForumTopic(params: {
    chat_id: number | string;
    message_thread_id: number;
  }): Promise<boolean> {
    return this.makeRequest('reopenForumTopic', params);
  }

  /**
   * Use this method to delete a forum topic along with all its messages in a forum supergroup chat.
   */
  async deleteForumTopic(params: {
    chat_id: number | string;
    message_thread_id: number;
  }): Promise<boolean> {
    return this.makeRequest('deleteForumTopic', params);
  }

  /**
   * Use this method to clear the list of pinned messages in a forum topic.
   */
  async unpinAllForumTopicMessages(params: {
    chat_id: number | string;
    message_thread_id: number;
  }): Promise<boolean> {
    return this.makeRequest('unpinAllForumTopicMessages', params);
  }

  /**
   * Use this method to edit the name of the 'General' topic in a forum supergroup chat.
   */
  async editGeneralForumTopic(params: {
    chat_id: number | string;
    name: string;
  }): Promise<boolean> {
    return this.makeRequest('editGeneralForumTopic', params);
  }

  /**
   * Use this method to close an open 'General' topic in a forum supergroup chat.
   */
  async closeGeneralForumTopic(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('closeGeneralForumTopic', params);
  }

  /**
   * Use this method to reopen a closed 'General' topic in a forum supergroup chat.
   */
  async reopenGeneralForumTopic(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('reopenGeneralForumTopic', params);
  }

  /**
   * Use this method to hide the 'General' topic in a forum supergroup chat.
   */
  async hideGeneralForumTopic(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('hideGeneralForumTopic', params);
  }

  /**
   * Use this method to unhide the 'General' topic in a forum supergroup chat.
   */
  async unhideGeneralForumTopic(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('unhideGeneralForumTopic', params);
  }

  /**
   * Use this method to clear the list of pinned messages in a General forum topic.
   */
  async unpinAllGeneralForumTopicMessages(params: {
    chat_id: number | string;
  }): Promise<boolean> {
    return this.makeRequest('unpinAllGeneralForumTopicMessages', params);
  }

  // Additional methods would continue here...
  // This is a comprehensive but not complete implementation
  // The full implementation would include all remaining Telegram Bot API methods
}

/**
 * Custom error class for Telegram API errors
 */
export class TelegramError extends Error {
  constructor(
    message: string,
    public readonly errorCode?: number,
    public readonly parameters?: ResponseParameters
  ) {
    super(message);
    this.name = 'TelegramError';
  }
}

// Additional type imports that would be defined in separate files
import type { 
  MessageEntity, 
  ReplyParameters, 
  InputFile, 
  InputMedia, 
  InputPaidMedia, 
  InputPollOption, 
  ReactionType, 
  ChatPermissions, 
  ChatInviteLink, 
  ChatFullInfo, 
  ForumTopic 
} from './types';
import type { MessageId } from './types/MessageId';


import type { User } from './User';
import type { ChatPhoto } from './ChatPhoto';

/**
 * This object represents a chat
 */
export interface Chat {
  /** Unique identifier for this chat */
  id: number;
  /** Type of chat, can be either "private", "group", "supergroup" or "channel" */
  type: 'private' | 'group' | 'supergroup' | 'channel';
  /** Title, for supergroups, channels and group chats */
  title?: string;
  /** Username, for private chats, supergroups and channels if available */
  username?: string;
  /** First name of the other party in a private chat */
  first_name?: string;
  /** Last name of the other party in a private chat */
  last_name?: string;
  /** True, if the supergroup chat is a forum */
  is_forum?: boolean;
  /** Chat photo. Returned only in getChat */
  photo?: ChatPhoto;
  /** If non-empty, the list of all active chat usernames; for private chats, supergroups and channels */
  active_usernames?: string[];
  /** For private chats, the date of birth of the user */
  birthdate?: any;
  /** For private chats with business accounts, the intro of the business */
  business_intro?: any;
  /** For private chats with business accounts, the location of the business */
  business_location?: any;
  /** For private chats with business accounts, the opening hours of the business */
  business_opening_hours?: any;
  /** For private chats, the personal channel of the user */
  personal_chat?: Chat;
  /** List of available reactions allowed in the chat */
  available_reactions?: any[];
  /** Identifier of the accent color for the chat name and backgrounds of the chat photo, reply header, and link preview */
  accent_color_id?: number;
  /** Custom emoji identifier of emoji chosen by the chat for the reply header and link preview background */
  background_custom_emoji_id?: string;
  /** Identifier of the accent color for the chat's profile background */
  profile_accent_color_id?: number;
  /** Custom emoji identifier of the emoji chosen by the chat for its profile background */
  profile_background_custom_emoji_id?: string;
  /** Custom emoji identifier of emoji status of the other party in a private chat */
  emoji_status_custom_emoji_id?: string;
  /** Expiration date of the emoji status of the other party in a private chat in Unix time, if any */
  emoji_status_expiration_date?: number;
  /** Bio of the other party in a private chat */
  bio?: string;
  /** True, if privacy settings of the other party in the private chat allows to use tg://user?id=<user_id> links only in chats with the user */
  has_private_forwards?: boolean;
  /** True, if the privacy settings of the other party restrict sending voice and video note messages in the private chat */
  has_restricted_voice_and_video_messages?: boolean;
  /** True, if users need to join the supergroup before they can send messages */
  join_to_send_messages?: boolean;
  /** True, if all users directly joining the supergroup need to be approved by supergroup administrators */
  join_by_request?: boolean;
  /** Description, for groups, supergroups and channel chats */
  description?: string;
  /** Primary invite link, for groups, supergroups and channel chats */
  invite_link?: string;
  /** The most recent pinned message (by sending date) */
  pinned_message?: any;
  /** Default chat member permissions, for groups and supergroups */
  permissions?: any;
  /** For supergroups, the minimum allowed delay between consecutive messages sent by each unpriviledged user; in seconds */
  slow_mode_delay?: number;
  /** For supergroups, the minimum number of boosts that a non-administrator user needs to add in order to pin a message */
  unrestrict_boost_count?: number;
  /** The time after which all messages sent to the chat will be automatically deleted; in seconds */
  message_auto_delete_time?: number;
  /** True, if aggressive anti-spam checks are enabled in the supergroup */
  has_aggressive_anti_spam_enabled?: boolean;
  /** True, if non-administrators can only get the list of bots and administrators in the chat */
  has_hidden_members?: boolean;
  /** True, if messages from the chat can't be forwarded to other chats */
  has_protected_content?: boolean;
  /** True, if new chat members will have access to old messages; available only to chat administrators */
  has_visible_history?: boolean;
  /** For supergroups, name of group sticker set */
  sticker_set_name?: string;
  /** True, if the bot can change the group sticker set */
  can_set_sticker_set?: boolean;
  /** For supergroups, the name of the group's custom emoji sticker set */
  custom_emoji_sticker_set_name?: string;
  /** Unique identifier for the linked chat, i.e. the discussion group identifier for a channel and vice versa */
  linked_chat_id?: number;
  /** For supergroups, the location to which the supergroup is connected */
  location?: any;
}


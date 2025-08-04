import type { ChatAdministratorRights } from './ChatAdministratorRights';

/**
 * This object defines the criteria used to request a suitable chat
 */
export interface KeyboardButtonRequestChat {
  /** Signed 32-bit identifier of the request */
  request_id: number;
  /** Pass True to request a channel chat, pass False to request a group or a supergroup chat */
  chat_is_channel: boolean;
  /** Pass True to request a forum supergroup, pass False to request a non-forum chat */
  chat_is_forum?: boolean;
  /** Pass True to request a supergroup or a channel with a username, pass False to request a chat without a username */
  chat_has_username?: boolean;
  /** Pass True to request a chat owned by the user. Otherwise, no additional restrictions are applied */
  chat_is_created?: boolean;
  /** A JSON-serialized object listing the required administrator rights of the user in the chat */
  user_administrator_rights?: ChatAdministratorRights;
  /** A JSON-serialized object listing the required administrator rights of the bot in the chat */
  bot_administrator_rights?: ChatAdministratorRights;
  /** Pass True to request a chat with the bot as a member. Otherwise, no additional restrictions are applied */
  bot_is_member?: boolean;
  /** Pass True to request the chat's title */
  request_title?: boolean;
  /** Pass True to request the chat's username */
  request_username?: boolean;
  /** Pass True to request the chat's photo */
  request_photo?: boolean;
}


import type { Message } from './Message';

/**
 * This object represents an incoming update
 */
export interface Update {
  /** The update's unique identifier */
  update_id: number;
  /** New incoming message of any kind - text, photo, sticker, etc. */
  message?: Message;
  /** New version of a message that is known to the bot and was edited */
  edited_message?: Message;
  /** New incoming channel post of any kind - text, photo, sticker, etc. */
  channel_post?: Message;
  /** New version of a channel post that is known to the bot and was edited */
  edited_channel_post?: Message;
  /** New incoming business message of any kind - text, photo, sticker, etc. */
  business_message?: Message;
  /** New version of a business message that is known to the bot and was edited */
  edited_business_message?: Message;
  /** Messages were deleted from a connected business account */
  business_messages_deleted?: any;
  /** A reaction to a message was changed by a user */
  message_reaction?: any;
  /** Reactions to a message with anonymous reactions were changed */
  message_reaction_count?: any;
  /** New incoming inline query */
  inline_query?: any;
  /** The result of an inline query that was chosen by a user and sent to their chat partner */
  chosen_inline_result?: any;
  /** New incoming callback query */
  callback_query?: any;
  /** New incoming shipping query. Only for invoices with flexible price */
  shipping_query?: any;
  /** New incoming pre-checkout query. Contains full information about checkout */
  pre_checkout_query?: any;
  /** New poll state. Bots receive only updates about stopped polls and polls, which are sent by the bot */
  poll?: any;
  /** A user changed their answer in a non-anonymous poll. Bots receive new votes only in polls that were sent by the bot itself */
  poll_answer?: any;
  /** The bot's chat member status was updated in a chat */
  my_chat_member?: any;
  /** A chat member's status was updated in a chat */
  chat_member?: any;
  /** A request to join the chat has been sent */
  chat_join_request?: any;
  /** A chat boost was added or changed */
  chat_boost?: any;
  /** A boost was removed from a chat */
  removed_chat_boost?: any;
  /** New incoming business connection */
  business_connection?: any;
}


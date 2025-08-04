import type { User } from './User';
import type { Chat } from './Chat';

/**
 * This object represents a message
 */
export interface Message {
  /** Unique message identifier inside this chat */
  message_id: number;
  /** Unique identifier of a message thread to which the message belongs; for supergroups only */
  message_thread_id?: number;
  /** Sender of the message; empty for messages sent to channels */
  from?: User;
  /** Sender of the message, sent on behalf of a chat */
  sender_chat?: Chat;
  /** If the sender of the message boosted the chat, the number of boosts added by the user */
  sender_boost_count?: number;
  /** The bot that actually sent the message on behalf of the business account */
  sender_business_bot?: User;
  /** Date the message was sent in Unix time */
  date: number;
  /** Unique identifier of the business connection from which the message was received */
  business_connection_id?: string;
  /** Conversation the message belongs to */
  chat: Chat;
  /** Information about the original message for forwarded messages */
  forward_origin?: any;
  /** True, if the message is sent to a forum topic */
  is_topic_message?: boolean;
  /** True, if the message is a channel post that was automatically forwarded to the connected discussion group */
  is_automatic_forward?: boolean;
  /** For replies in the same chat and message thread, the original message */
  reply_to_message?: Message;
  /** Information about the message that is being replied to */
  external_reply?: any;
  /** For replies that quote part of the original message, the quoted part of the message */
  quote?: any;
  /** For replies to a story, the original story */
  reply_to_story?: any;
  /** Bot through which the message was sent */
  via_bot?: User;
  /** Date the message was last edited in Unix time */
  edit_date?: number;
  /** True, if the message can't be forwarded */
  has_protected_content?: boolean;
  /** True, if the message was sent by an implicit action */
  is_from_offline?: boolean;
  /** The unique identifier of a media message group this message belongs to */
  media_group_id?: string;
  /** Signature of the post author for messages in channels, or the custom title of an anonymous group administrator */
  author_signature?: string;
  /** For text messages, the actual UTF-8 text of the message */
  text?: string;
  /** For text messages, special entities like usernames, URLs, bot commands, etc. that appear in the text */
  entities?: any[];
  /** Options used for link preview generation for the message, if it is a text message and link preview options were changed */
  link_preview_options?: any;
  /** Unique identifier of the message effect added to the message */
  effect_id?: string;
  /** Message is an animation, information about the animation */
  animation?: any;
  /** Message is an audio file, information about the file */
  audio?: any;
  /** Message is a general file, information about the file */
  document?: any;
  /** Message is a photo, available sizes of the photo */
  photo?: any[];
  /** Message is a sticker, information about the sticker */
  sticker?: any;
  /** Message is a forwarded story */
  story?: any;
  /** Message is a video, information about the video */
  video?: any;
  /** Message is a video note, information about the video message */
  video_note?: any;
  /** Message is a voice message, information about the file */
  voice?: any;
  /** Caption for the animation, audio, document, photo, video or voice */
  caption?: string;
  /** For messages with a caption, special entities like usernames, URLs, bot commands, etc. that appear in the caption */
  caption_entities?: any[];
  /** True, if the caption must be shown above the message media */
  show_caption_above_media?: boolean;
  /** True, if the message media is covered by a spoiler animation */
  has_media_spoiler?: boolean;
  /** Message is a shared contact, information about the contact */
  contact?: any;
  /** Message is a dice with random value */
  dice?: any;
  /** Message is a game, information about the game */
  game?: any;
  /** Message is a native poll, information about the poll */
  poll?: any;
  /** Message is a venue, information about the venue */
  venue?: any;
  /** Message is a shared location, information about the location */
  location?: any;
  /** New members that were added to the group or supergroup */
  new_chat_members?: User[];
  /** A member was removed from the group */
  left_chat_member?: User;
  /** A chat title was changed to this value */
  new_chat_title?: string;
  /** A chat photo was change to this value */
  new_chat_photo?: any[];
  /** Service message: the chat photo was deleted */
  delete_chat_photo?: boolean;
  /** Service message: the group has been created */
  group_chat_created?: boolean;
  /** Service message: the supergroup has been created */
  supergroup_chat_created?: boolean;
  /** Service message: the channel has been created */
  channel_chat_created?: boolean;
  /** Service message: auto-delete timer settings changed in the chat */
  message_auto_delete_timer_changed?: any;
  /** The group has been migrated to a supergroup with the specified identifier */
  migrate_to_chat_id?: number;
  /** The supergroup has been migrated from a group with the specified identifier */
  migrate_from_chat_id?: number;
  /** Specified message was pinned */
  pinned_message?: any;
  /** Message is an invoice for a payment */
  invoice?: any;
  /** Message is a service message about a successful payment */
  successful_payment?: any;
  /** Service message: users were shared with the bot */
  users_shared?: any;
  /** Service message: a chat was shared with the bot */
  chat_shared?: any;
  /** The domain name of the website on which the user has logged in */
  connected_website?: string;
  /** Service message: the user allowed the bot to write messages after adding it to the attachment or side menu */
  write_access_allowed?: any;
  /** Telegram Passport data */
  passport_data?: any;
  /** Service message. A user in the chat triggered another user's proximity alert while sharing Live Location */
  proximity_alert_triggered?: any;
  /** Service message: user boosted the chat */
  boost_added?: any;
  /** Service message: chat background set */
  chat_background_set?: any;
  /** Service message: forum topic created */
  forum_topic_created?: any;
  /** Service message: forum topic edited */
  forum_topic_edited?: any;
  /** Service message: forum topic closed */
  forum_topic_closed?: any;
  /** Service message: forum topic reopened */
  forum_topic_reopened?: any;
  /** Service message: the 'General' forum topic hidden */
  general_forum_topic_hidden?: any;
  /** Service message: the 'General' forum topic unhidden */
  general_forum_topic_unhidden?: any;
  /** Service message: a scheduled giveaway was created */
  giveaway_created?: any;
  /** The message is a scheduled giveaway message */
  giveaway?: any;
  /** A giveaway with public winners was completed */
  giveaway_winners?: any;
  /** Service message: a giveaway without public winners was completed */
  giveaway_completed?: any;
  /** Service message: video chat scheduled */
  video_chat_scheduled?: any;
  /** Service message: video chat started */
  video_chat_started?: any;
  /** Service message: video chat ended */
  video_chat_ended?: any;
  /** Service message: new participants invited to a video chat */
  video_chat_participants_invited?: any;
  /** Service message: data sent by a Web App */
  web_app_data?: any;
  /** Inline keyboard attached to the message */
  reply_markup?: any;
}


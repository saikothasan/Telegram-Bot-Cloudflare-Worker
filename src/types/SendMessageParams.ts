/**
 * Parameters for sendMessage method
 */
export interface SendMessageParams {
  /** Unique identifier for the target chat or username of the target channel */
  chat_id: number | string;
  /** Unique identifier for the target message thread (topic) of the forum */
  message_thread_id?: number;
  /** Text of the message to be sent, 1-4096 characters after entities parsing */
  text: string;
  /** Mode for parsing entities in the message text */
  parse_mode?: 'MarkdownV2' | 'HTML' | 'Markdown';
  /** A JSON-serialized list of special entities that appear in message text */
  entities?: any[];
  /** Link preview generation options for the message */
  link_preview_options?: any;
  /** Sends the message silently. Users will receive a notification with no sound */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message */
  message_effect_id?: string;
  /** Description of the message to reply to */
  reply_parameters?: any;
  /** Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user */
  reply_markup?: any;
}


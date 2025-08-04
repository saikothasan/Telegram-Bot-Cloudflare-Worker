/**
 * Upon receiving a message with this object, Telegram clients will display a reply interface to the user
 */
export interface ForceReply {
  /** Shows reply interface to the user, as if they manually selected the bot's message and tapped 'Reply' */
  force_reply: true;
  /** The placeholder to be shown in the input field when the reply is active */
  input_field_placeholder?: string;
  /** Use this parameter if you want to force reply from specific users only */
  selective?: boolean;
}


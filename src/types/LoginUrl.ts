/**
 * This object represents a parameter of the inline keyboard button used to automatically authorize a user
 */
export interface LoginUrl {
  /** An HTTPS URL to be opened with user authorization data added to the query string when the button is pressed */
  url: string;
  /** New text of the button in forwarded messages */
  forward_text?: string;
  /** Username of a bot, which will be used for user authorization */
  bot_username?: string;
  /** Pass True to request the permission for your bot to send messages to the user */
  request_write_access?: boolean;
}


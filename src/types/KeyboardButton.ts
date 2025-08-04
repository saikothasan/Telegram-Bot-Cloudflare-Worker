import type { WebApp } from './WebApp';
import type { KeyboardButtonRequestUsers } from './KeyboardButtonRequestUsers';
import type { KeyboardButtonRequestChat } from './KeyboardButtonRequestChat';
import type { KeyboardButtonPollType } from './KeyboardButtonPollType';

/**
 * This object represents one button of the reply keyboard
 */
export interface KeyboardButton {
  /** Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed */
  text: string;
  /** If specified, pressing the button will open a list of suitable users */
  request_users?: KeyboardButtonRequestUsers;
  /** If specified, pressing the button will open a list of suitable chats */
  request_chat?: KeyboardButtonRequestChat;
  /** If True, the user's phone number will be sent as a contact when the button is pressed */
  request_contact?: boolean;
  /** If True, the user's current location will be sent when the button is pressed */
  request_location?: boolean;
  /** If specified, the user will be asked to create a poll and send it to the bot when the button is pressed */
  request_poll?: KeyboardButtonPollType;
  /** If specified, the described Web App will be launched when the button is pressed */
  web_app?: WebApp;
}


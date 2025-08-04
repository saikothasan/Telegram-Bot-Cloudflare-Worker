import type { WebApp } from './WebApp';
import type { LoginUrl } from './LoginUrl';
import type { SwitchInlineQueryChosenChat } from './SwitchInlineQueryChosenChat';
import type { CallbackGame } from './CallbackGame';

/**
 * This object represents one button of an inline keyboard
 */
export interface InlineKeyboardButton {
  /** Label text on the button */
  text: string;
  /** HTTP or tg:// URL to be opened when the button is pressed */
  url?: string;
  /** Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes */
  callback_data?: string;
  /** Description of the Web App that will be launched when the user presses the button */
  web_app?: WebApp;
  /** An HTTPS URL used to automatically authorize the user */
  login_url?: LoginUrl;
  /** If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot's username and the specified inline query in the input field */
  switch_inline_query?: string;
  /** If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field */
  switch_inline_query_current_chat?: string;
  /** If set, pressing the button will prompt the user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field */
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  /** Description of the game that will be launched when the user presses the button */
  callback_game?: CallbackGame;
  /** Specify True, to send a Pay button */
  pay?: boolean;
}


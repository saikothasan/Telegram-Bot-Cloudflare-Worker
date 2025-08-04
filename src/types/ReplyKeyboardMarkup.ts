import type { KeyboardButton } from './KeyboardButton';

/**
 * This object represents a custom keyboard with reply options
 */
export interface ReplyKeyboardMarkup {
  /** Array of button rows, each represented by an Array of KeyboardButton objects */
  keyboard: KeyboardButton[][];
  /** Requests clients to always show the keyboard when the regular keyboard is hidden */
  is_persistent?: boolean;
  /** Requests clients to resize the keyboard vertically for optimal fit */
  resize_keyboard?: boolean;
  /** Requests clients to hide the keyboard as soon as it's been used */
  one_time_keyboard?: boolean;
  /** The placeholder to be shown in the input field when the keyboard is active */
  input_field_placeholder?: string;
  /** Use this parameter if you want to show the keyboard to specific users only */
  selective?: boolean;
}


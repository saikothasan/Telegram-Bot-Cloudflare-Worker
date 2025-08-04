/**
 * Upon receiving a message with this object, Telegram clients will remove the current custom keyboard and display the default letter-keyboard
 */
export interface ReplyKeyboardRemove {
  /** Requests clients to remove the custom keyboard */
  remove_keyboard: true;
  /** Use this parameter if you want to remove the keyboard for specific users only */
  selective?: boolean;
}


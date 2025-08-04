import type {
  InlineKeyboardMarkup,
  InlineKeyboardButton,
  ReplyKeyboardMarkup,
  KeyboardButton,
  ReplyKeyboardRemove,
  ForceReply,
} from '../types';

/**
 * Builder for creating inline keyboards
 */
export class InlineKeyboardBuilder {
  private buttons: InlineKeyboardButton[][] = [];

  /**
   * Add a new row of buttons
   */
  row(...buttons: InlineKeyboardButton[]): this {
    this.buttons.push(buttons);
    return this;
  }

  /**
   * Add a URL button
   */
  url(text: string, url: string): this {
    return this.row({ text, url });
  }

  /**
   * Add a callback data button
   */
  callback(text: string, callback_data: string): this {
    return this.row({ text, callback_data });
  }

  /**
   * Add a web app button
   */
  webApp(text: string, web_app: { url: string }): this {
    return this.row({ text, web_app });
  }

  /**
   * Add a login URL button
   */
  loginUrl(text: string, login_url: {
    url: string;
    forward_text?: string;
    bot_username?: string;
    request_write_access?: boolean;
  }): this {
    return this.row({ text, login_url });
  }

  /**
   * Add a switch inline query button
   */
  switchInlineQuery(text: string, switch_inline_query?: string): this {
    return this.row({ text, switch_inline_query });
  }

  /**
   * Add a switch inline query current chat button
   */
  switchInlineQueryCurrentChat(text: string, switch_inline_query_current_chat?: string): this {
    return this.row({ text, switch_inline_query_current_chat });
  }

  /**
   * Add a switch inline query chosen chat button
   */
  switchInlineQueryChosenChat(text: string, switch_inline_query_chosen_chat?: {
    query?: string;
    allow_user_chats?: boolean;
    allow_bot_chats?: boolean;
    allow_group_chats?: boolean;
    allow_channel_chats?: boolean;
  }): this {
    return this.row({ text, switch_inline_query_chosen_chat });
  }

  /**
   * Add a callback game button
   */
  callbackGame(text: string): this {
    return this.row({ text, callback_game: {} });
  }

  /**
   * Add a pay button
   */
  pay(text: string): this {
    return this.row({ text, pay: true });
  }

  /**
   * Build the inline keyboard markup
   */
  build(): InlineKeyboardMarkup {
    return {
      inline_keyboard: this.buttons,
    };
  }

  /**
   * Clear all buttons
   */
  clear(): this {
    this.buttons = [];
    return this;
  }

  /**
   * Get the current number of rows
   */
  get rowCount(): number {
    return this.buttons.length;
  }

  /**
   * Get the current number of buttons in the last row
   */
  get lastRowButtonCount(): number {
    return this.buttons[this.buttons.length - 1]?.length || 0;
  }
}

/**
 * Builder for creating reply keyboards
 */
export class ReplyKeyboardBuilder {
  private buttons: KeyboardButton[][] = [];
  private options: {
    is_persistent?: boolean;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    input_field_placeholder?: string;
    selective?: boolean;
  } = {};

  /**
   * Add a new row of buttons
   */
  row(...buttons: KeyboardButton[]): this {
    this.buttons.push(buttons);
    return this;
  }

  /**
   * Add a text button
   */
  text(text: string): this {
    return this.row({ text });
  }

  /**
   * Add a contact request button
   */
  requestContact(text: string): this {
    return this.row({ text, request_contact: true });
  }

  /**
   * Add a location request button
   */
  requestLocation(text: string): this {
    return this.row({ text, request_location: true });
  }

  /**
   * Add a poll request button
   */
  requestPoll(text: string, type?: 'quiz' | 'regular'): this {
    return this.row({ text, request_poll: { type } });
  }

  /**
   * Add a web app button
   */
  webApp(text: string, web_app: { url: string }): this {
    return this.row({ text, web_app });
  }

  /**
   * Add a user request button
   */
  requestUsers(text: string, request_users: {
    request_id: number;
    user_is_bot?: boolean;
    user_is_premium?: boolean;
    max_quantity?: number;
    request_name?: boolean;
    request_username?: boolean;
    request_photo?: boolean;
  }): this {
    return this.row({ text, request_users });
  }

  /**
   * Add a chat request button
   */
  requestChat(text: string, request_chat: {
    request_id: number;
    chat_is_channel: boolean;
    chat_is_forum?: boolean;
    chat_has_username?: boolean;
    chat_is_created?: boolean;
    user_administrator_rights?: any;
    bot_administrator_rights?: any;
    bot_is_member?: boolean;
    request_title?: boolean;
    request_username?: boolean;
    request_photo?: boolean;
  }): this {
    return this.row({ text, request_chat });
  }

  /**
   * Set keyboard to be persistent
   */
  persistent(is_persistent = true): this {
    this.options.is_persistent = is_persistent;
    return this;
  }

  /**
   * Set keyboard to resize
   */
  resize(resize_keyboard = true): this {
    this.options.resize_keyboard = resize_keyboard;
    return this;
  }

  /**
   * Set keyboard to be one-time
   */
  oneTime(one_time_keyboard = true): this {
    this.options.one_time_keyboard = one_time_keyboard;
    return this;
  }

  /**
   * Set input field placeholder
   */
  placeholder(input_field_placeholder: string): this {
    this.options.input_field_placeholder = input_field_placeholder;
    return this;
  }

  /**
   * Set keyboard to be selective
   */
  selective(selective = true): this {
    this.options.selective = selective;
    return this;
  }

  /**
   * Build the reply keyboard markup
   */
  build(): ReplyKeyboardMarkup {
    return {
      keyboard: this.buttons,
      ...this.options,
    };
  }

  /**
   * Clear all buttons and options
   */
  clear(): this {
    this.buttons = [];
    this.options = {};
    return this;
  }

  /**
   * Get the current number of rows
   */
  get rowCount(): number {
    return this.buttons.length;
  }

  /**
   * Get the current number of buttons in the last row
   */
  get lastRowButtonCount(): number {
    return this.buttons[this.buttons.length - 1]?.length || 0;
  }
}

/**
 * Create a reply keyboard remove markup
 */
export function removeKeyboard(selective = false): ReplyKeyboardRemove {
  return {
    remove_keyboard: true,
    selective,
  };
}

/**
 * Create a force reply markup
 */
export function forceReply(
  input_field_placeholder?: string,
  selective = false
): ForceReply {
  return {
    force_reply: true,
    input_field_placeholder,
    selective,
  };
}

/**
 * Helper function to create a simple inline keyboard with URL buttons
 */
export function createUrlKeyboard(buttons: Array<{ text: string; url: string }>): InlineKeyboardMarkup {
  const builder = new InlineKeyboardBuilder();
  
  for (const button of buttons) {
    builder.url(button.text, button.url);
  }
  
  return builder.build();
}

/**
 * Helper function to create a simple inline keyboard with callback buttons
 */
export function createCallbackKeyboard(buttons: Array<{ text: string; callback_data: string }>): InlineKeyboardMarkup {
  const builder = new InlineKeyboardBuilder();
  
  for (const button of buttons) {
    builder.callback(button.text, button.callback_data);
  }
  
  return builder.build();
}

/**
 * Helper function to create a simple reply keyboard with text buttons
 */
export function createTextKeyboard(
  buttons: string[],
  options: {
    columns?: number;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    input_field_placeholder?: string;
    selective?: boolean;
  } = {}
): ReplyKeyboardMarkup {
  const { columns = 2, ...keyboardOptions } = options;
  const builder = new ReplyKeyboardBuilder();
  
  // Apply options
  if (keyboardOptions.resize_keyboard !== undefined) {
    builder.resize(keyboardOptions.resize_keyboard);
  }
  if (keyboardOptions.one_time_keyboard !== undefined) {
    builder.oneTime(keyboardOptions.one_time_keyboard);
  }
  if (keyboardOptions.input_field_placeholder) {
    builder.placeholder(keyboardOptions.input_field_placeholder);
  }
  if (keyboardOptions.selective !== undefined) {
    builder.selective(keyboardOptions.selective);
  }
  
  // Add buttons in rows
  for (let i = 0; i < buttons.length; i += columns) {
    const rowButtons = buttons.slice(i, i + columns).map(text => ({ text }));
    builder.row(...rowButtons);
  }
  
  return builder.build();
}

/**
 * Helper function to create a pagination keyboard
 */
export function createPaginationKeyboard(
  currentPage: number,
  totalPages: number,
  dataPrefix = 'page',
  options: {
    showFirstLast?: boolean;
    showNumbers?: boolean;
    maxButtons?: number;
  } = {}
): InlineKeyboardMarkup {
  const { showFirstLast = true, showNumbers = true, maxButtons = 5 } = options;
  const builder = new InlineKeyboardBuilder();
  
  const buttons: InlineKeyboardButton[] = [];
  
  // First page button
  if (showFirstLast && currentPage > 1) {
    buttons.push({ text: '⏮️', callback_data: `${dataPrefix}:1` });
  }
  
  // Previous page button
  if (currentPage > 1) {
    buttons.push({ text: '◀️', callback_data: `${dataPrefix}:${currentPage - 1}` });
  }
  
  // Page number buttons
  if (showNumbers && totalPages > 1) {
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    for (let page = startPage; page <= endPage; page++) {
      const text = page === currentPage ? `[${page}]` : `${page}`;
      buttons.push({ text, callback_data: `${dataPrefix}:${page}` });
    }
  }
  
  // Next page button
  if (currentPage < totalPages) {
    buttons.push({ text: '▶️', callback_data: `${dataPrefix}:${currentPage + 1}` });
  }
  
  // Last page button
  if (showFirstLast && currentPage < totalPages) {
    buttons.push({ text: '⏭️', callback_data: `${dataPrefix}:${totalPages}` });
  }
  
  if (buttons.length > 0) {
    builder.row(...buttons);
  }
  
  return builder.build();
}

/**
 * Helper function to create a confirmation keyboard
 */
export function createConfirmationKeyboard(
  confirmText = '✅ Yes',
  cancelText = '❌ No',
  confirmData = 'confirm',
  cancelData = 'cancel'
): InlineKeyboardMarkup {
  return new InlineKeyboardBuilder()
    .row(
      { text: confirmText, callback_data: confirmData },
      { text: cancelText, callback_data: cancelData }
    )
    .build();
}


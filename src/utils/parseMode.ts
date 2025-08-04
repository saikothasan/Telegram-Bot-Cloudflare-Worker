/**
 * Parse mode utilities for Telegram messages
 */

/**
 * Valid parse modes for Telegram messages
 */
export type ParseMode = 'MarkdownV2' | 'HTML' | 'Markdown';

/**
 * Check if a parse mode is valid
 */
export function isValidParseMode(mode: string): mode is ParseMode {
  return ['MarkdownV2', 'HTML', 'Markdown'].includes(mode);
}

/**
 * Get default parse mode
 */
export function getDefaultParseMode(): ParseMode {
  return 'MarkdownV2';
}

/**
 * Validate parse mode and return default if invalid
 */
export function validateParseMode(mode?: string): ParseMode | undefined {
  if (!mode) return undefined;
  return isValidParseMode(mode) ? mode : getDefaultParseMode();
}


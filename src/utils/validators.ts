/**
 * Validation utilities for Telegram bot data
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Create a successful validation result
 */
export function validationSuccess(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * Create a failed validation result
 */
export function validationError(errors: string | string[]): ValidationResult {
  return {
    isValid: false,
    errors: Array.isArray(errors) ? errors : [errors],
  };
}

/**
 * Validate Telegram user ID
 */
export function validateUserId(userId: any): ValidationResult {
  if (typeof userId !== 'number') {
    return validationError('User ID must be a number');
  }

  if (userId <= 0) {
    return validationError('User ID must be positive');
  }

  if (!Number.isInteger(userId)) {
    return validationError('User ID must be an integer');
  }

  // Telegram user IDs are typically less than 2^53
  if (userId > Number.MAX_SAFE_INTEGER) {
    return validationError('User ID is too large');
  }

  return validationSuccess();
}

/**
 * Validate Telegram chat ID
 */
export function validateChatId(chatId: any): ValidationResult {
  if (typeof chatId === 'string') {
    // Channel username format
    if (chatId.startsWith('@')) {
      return validateUsername(chatId.substring(1));
    }
    return validationError('Chat ID string must start with @');
  }

  if (typeof chatId !== 'number') {
    return validationError('Chat ID must be a number or string');
  }

  if (!Number.isInteger(chatId)) {
    return validationError('Chat ID must be an integer');
  }

  // Telegram chat IDs can be negative for groups/supergroups
  if (chatId > Number.MAX_SAFE_INTEGER || chatId < Number.MIN_SAFE_INTEGER) {
    return validationError('Chat ID is out of valid range');
  }

  return validationSuccess();
}

/**
 * Validate Telegram username
 */
export function validateUsername(username: any): ValidationResult {
  if (typeof username !== 'string') {
    return validationError('Username must be a string');
  }

  if (username.length < 5) {
    return validationError('Username must be at least 5 characters long');
  }

  if (username.length > 32) {
    return validationError('Username must be at most 32 characters long');
  }

  // Username can only contain letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return validationError('Username can only contain letters, numbers, and underscores');
  }

  // Username must start with a letter
  if (!/^[a-zA-Z]/.test(username)) {
    return validationError('Username must start with a letter');
  }

  // Username cannot end with an underscore
  if (username.endsWith('_')) {
    return validationError('Username cannot end with an underscore');
  }

  // Username cannot have consecutive underscores
  if (username.includes('__')) {
    return validationError('Username cannot have consecutive underscores');
  }

  return validationSuccess();
}

/**
 * Validate message text
 */
export function validateMessageText(text: any, maxLength = 4096): ValidationResult {
  if (typeof text !== 'string') {
    return validationError('Message text must be a string');
  }

  if (text.length === 0) {
    return validationError('Message text cannot be empty');
  }

  if (text.length > maxLength) {
    return validationError(`Message text cannot exceed ${maxLength} characters`);
  }

  return validationSuccess();
}

/**
 * Validate caption text
 */
export function validateCaption(caption: any, maxLength = 1024): ValidationResult {
  if (caption === undefined || caption === null) {
    return validationSuccess();
  }

  if (typeof caption !== 'string') {
    return validationError('Caption must be a string');
  }

  if (caption.length > maxLength) {
    return validationError(`Caption cannot exceed ${maxLength} characters`);
  }

  return validationSuccess();
}

/**
 * Validate parse mode
 */
export function validateParseMode(parseMode: any): ValidationResult {
  if (parseMode === undefined || parseMode === null) {
    return validationSuccess();
  }

  if (typeof parseMode !== 'string') {
    return validationError('Parse mode must be a string');
  }

  const validParseModes = ['MarkdownV2', 'HTML', 'Markdown'];
  if (!validParseModes.includes(parseMode)) {
    return validationError(`Parse mode must be one of: ${validParseModes.join(', ')}`);
  }

  return validationSuccess();
}

/**
 * Validate URL
 */
export function validateUrl(url: any): ValidationResult {
  if (typeof url !== 'string') {
    return validationError('URL must be a string');
  }

  try {
    new URL(url);
    return validationSuccess();
  } catch {
    return validationError('Invalid URL format');
  }
}

/**
 * Validate file ID
 */
export function validateFileId(fileId: any): ValidationResult {
  if (typeof fileId !== 'string') {
    return validationError('File ID must be a string');
  }

  if (fileId.length === 0) {
    return validationError('File ID cannot be empty');
  }

  // Telegram file IDs are typically alphanumeric with some special characters
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return validationError('File ID contains invalid characters');
  }

  return validationSuccess();
}

/**
 * Validate callback data
 */
export function validateCallbackData(data: any): ValidationResult {
  if (typeof data !== 'string') {
    return validationError('Callback data must be a string');
  }

  if (data.length === 0) {
    return validationError('Callback data cannot be empty');
  }

  if (data.length > 64) {
    return validationError('Callback data cannot exceed 64 bytes');
  }

  return validationSuccess();
}

/**
 * Validate inline query
 */
export function validateInlineQuery(query: any): ValidationResult {
  if (typeof query !== 'string') {
    return validationError('Inline query must be a string');
  }

  if (query.length > 256) {
    return validationError('Inline query cannot exceed 256 characters');
  }

  return validationSuccess();
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phoneNumber: any): ValidationResult {
  if (typeof phoneNumber !== 'string') {
    return validationError('Phone number must be a string');
  }

  if (phoneNumber.length === 0) {
    return validationError('Phone number cannot be empty');
  }

  // Basic phone number validation (international format)
  if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
    return validationError('Invalid phone number format');
  }

  return validationSuccess();
}

/**
 * Validate email address
 */
export function validateEmail(email: any): ValidationResult {
  if (typeof email !== 'string') {
    return validationError('Email must be a string');
  }

  if (email.length === 0) {
    return validationError('Email cannot be empty');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return validationError('Invalid email format');
  }

  return validationSuccess();
}

/**
 * Validate coordinates (latitude/longitude)
 */
export function validateCoordinates(lat: any, lon: any): ValidationResult {
  const errors: string[] = [];

  if (typeof lat !== 'number') {
    errors.push('Latitude must be a number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (typeof lon !== 'number') {
    errors.push('Longitude must be a number');
  } else if (lon < -180 || lon > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return errors.length > 0 ? validationError(errors) : validationSuccess();
}

/**
 * Validate duration (in seconds)
 */
export function validateDuration(duration: any): ValidationResult {
  if (typeof duration !== 'number') {
    return validationError('Duration must be a number');
  }

  if (!Number.isInteger(duration)) {
    return validationError('Duration must be an integer');
  }

  if (duration < 0) {
    return validationError('Duration cannot be negative');
  }

  if (duration > 86400) { // 24 hours
    return validationError('Duration cannot exceed 24 hours');
  }

  return validationSuccess();
}

/**
 * Validate file size
 */
export function validateFileSize(size: any, maxSize: number): ValidationResult {
  if (typeof size !== 'number') {
    return validationError('File size must be a number');
  }

  if (!Number.isInteger(size)) {
    return validationError('File size must be an integer');
  }

  if (size < 0) {
    return validationError('File size cannot be negative');
  }

  if (size > maxSize) {
    return validationError(`File size cannot exceed ${maxSize} bytes`);
  }

  return validationSuccess();
}

/**
 * Validate array length
 */
export function validateArrayLength(
  array: any, 
  minLength = 0, 
  maxLength = Number.MAX_SAFE_INTEGER
): ValidationResult {
  if (!Array.isArray(array)) {
    return validationError('Value must be an array');
  }

  if (array.length < minLength) {
    return validationError(`Array must have at least ${minLength} items`);
  }

  if (array.length > maxLength) {
    return validationError(`Array cannot have more than ${maxLength} items`);
  }

  return validationSuccess();
}

/**
 * Validate object properties
 */
export function validateObject(
  obj: any, 
  requiredProperties: string[] = [], 
  allowedProperties?: string[]
): ValidationResult {
  if (typeof obj !== 'object' || obj === null) {
    return validationError('Value must be an object');
  }

  const errors: string[] = [];

  // Check required properties
  for (const prop of requiredProperties) {
    if (!(prop in obj)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Check allowed properties
  if (allowedProperties) {
    for (const prop of Object.keys(obj)) {
      if (!allowedProperties.includes(prop)) {
        errors.push(`Unknown property: ${prop}`);
      }
    }
  }

  return errors.length > 0 ? validationError(errors) : validationSuccess();
}

/**
 * Validate enum value
 */
export function validateEnum(value: any, allowedValues: any[]): ValidationResult {
  if (!allowedValues.includes(value)) {
    return validationError(`Value must be one of: ${allowedValues.join(', ')}`);
  }

  return validationSuccess();
}

/**
 * Validate range
 */
export function validateRange(
  value: any, 
  min: number, 
  max: number, 
  inclusive = true
): ValidationResult {
  if (typeof value !== 'number') {
    return validationError('Value must be a number');
  }

  if (inclusive) {
    if (value < min || value > max) {
      return validationError(`Value must be between ${min} and ${max} (inclusive)`);
    }
  } else {
    if (value <= min || value >= max) {
      return validationError(`Value must be between ${min} and ${max} (exclusive)`);
    }
  }

  return validationSuccess();
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: string[] = [];
  let isValid = true;

  for (const result of results) {
    if (!result.isValid) {
      isValid = false;
      allErrors.push(...result.errors);
    }
  }

  return {
    isValid,
    errors: allErrors,
  };
}

/**
 * Validator function type
 */
export type ValidatorFunction<T> = (value: T) => ValidationResult;

/**
 * Create a custom validator
 */
export function createValidator<T>(
  validationFn: (value: T) => boolean,
  errorMessage: string
): ValidatorFunction<T> {
  return (value: T) => {
    return validationFn(value) ? validationSuccess() : validationError(errorMessage);
  };
}

/**
 * Chain multiple validators
 */
export function chainValidators<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T> {
  return (value: T) => {
    const results = validators.map(validator => validator(value));
    return combineValidationResults(...results);
  };
}


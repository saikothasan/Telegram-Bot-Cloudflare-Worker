/**
 * Base error class for all Telegram bot related errors
 */
export abstract class TelegramBotError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when Telegram API returns an error response
 */
export class TelegramAPIError extends TelegramBotError {
  readonly code = 'TELEGRAM_API_ERROR';

  constructor(
    message: string,
    public readonly errorCode?: number,
    public readonly parameters?: {
      migrate_to_chat_id?: number;
      retry_after?: number;
    }
  ) {
    super(message);
  }

  /**
   * Check if this is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.errorCode === 429;
  }

  /**
   * Check if this is a chat migration error
   */
  isChatMigrationError(): boolean {
    return this.errorCode === 400 && !!this.parameters?.migrate_to_chat_id;
  }

  /**
   * Get retry delay in seconds for rate limit errors
   */
  getRetryDelay(): number | undefined {
    return this.parameters?.retry_after;
  }

  /**
   * Get new chat ID for migration errors
   */
  getNewChatId(): number | undefined {
    return this.parameters?.migrate_to_chat_id;
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends TelegramBotError {
  readonly code = 'NETWORK_ERROR';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends TelegramBotError {
  readonly code = 'TIMEOUT_ERROR';

  constructor(message: string = 'Request timed out') {
    super(message);
  }
}

/**
 * Error thrown when webhook verification fails
 */
export class WebhookVerificationError extends TelegramBotError {
  readonly code = 'WEBHOOK_VERIFICATION_ERROR';

  constructor(message: string = 'Webhook verification failed') {
    super(message);
  }
}

/**
 * Error thrown when update parsing fails
 */
export class UpdateParsingError extends TelegramBotError {
  readonly code = 'UPDATE_PARSING_ERROR';

  constructor(message: string, public readonly rawUpdate?: any) {
    super(message);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends TelegramBotError {
  readonly code = 'CONFIGURATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when middleware execution fails
 */
export class MiddlewareError extends TelegramBotError {
  readonly code = 'MIDDLEWARE_ERROR';

  constructor(message: string, public readonly middlewareName?: string, public readonly originalError?: Error) {
    super(message);
  }
}

/**
 * Error thrown when handler execution fails
 */
export class HandlerError extends TelegramBotError {
  readonly code = 'HANDLER_ERROR';

  constructor(message: string, public readonly handlerName?: string, public readonly originalError?: Error) {
    super(message);
  }
}

/**
 * Error thrown when state management operations fail
 */
export class StateError extends TelegramBotError {
  readonly code = 'STATE_ERROR';

  constructor(message: string, public readonly operation?: string, public readonly originalError?: Error) {
    super(message);
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileError extends TelegramBotError {
  readonly code = 'FILE_ERROR';

  constructor(message: string, public readonly fileId?: string, public readonly originalError?: Error) {
    super(message);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends TelegramBotError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, public readonly field?: string, public readonly value?: any) {
    super(message);
  }
}

/**
 * Type guard to check if an error is a TelegramBotError
 */
export function isTelegramBotError(error: any): error is TelegramBotError {
  return error instanceof TelegramBotError;
}

/**
 * Type guard to check if an error is a TelegramAPIError
 */
export function isTelegramAPIError(error: any): error is TelegramAPIError {
  return error instanceof TelegramAPIError;
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if an error is a TimeoutError
 */
export function isTimeoutError(error: any): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Type guard to check if an error is a WebhookVerificationError
 */
export function isWebhookVerificationError(error: any): error is WebhookVerificationError {
  return error instanceof WebhookVerificationError;
}

/**
 * Type guard to check if an error is an UpdateParsingError
 */
export function isUpdateParsingError(error: any): error is UpdateParsingError {
  return error instanceof UpdateParsingError;
}

/**
 * Type guard to check if an error is a ConfigurationError
 */
export function isConfigurationError(error: any): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

/**
 * Type guard to check if an error is a MiddlewareError
 */
export function isMiddlewareError(error: any): error is MiddlewareError {
  return error instanceof MiddlewareError;
}

/**
 * Type guard to check if an error is a HandlerError
 */
export function isHandlerError(error: any): error is HandlerError {
  return error instanceof HandlerError;
}

/**
 * Type guard to check if an error is a StateError
 */
export function isStateError(error: any): error is StateError {
  return error instanceof StateError;
}

/**
 * Type guard to check if an error is a FileError
 */
export function isFileError(error: any): error is FileError {
  return error instanceof FileError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Utility function to create a standardized error response
 */
export function createErrorResponse(error: Error, includeStack = false): {
  error: {
    code: string;
    message: string;
    stack?: string;
    details?: any;
  };
} {
  const response: any = {
    error: {
      code: isTelegramBotError(error) ? error.code : 'UNKNOWN_ERROR',
      message: error.message,
    },
  };

  if (includeStack) {
    response.error.stack = error.stack;
  }

  // Add specific error details
  if (isTelegramAPIError(error)) {
    response.error.details = {
      errorCode: error.errorCode,
      parameters: error.parameters,
    };
  } else if (isNetworkError(error)) {
    response.error.details = {
      originalError: error.originalError?.message,
    };
  } else if (isUpdateParsingError(error)) {
    response.error.details = {
      rawUpdate: error.rawUpdate,
    };
  } else if (isMiddlewareError(error)) {
    response.error.details = {
      middlewareName: error.middlewareName,
      originalError: error.originalError?.message,
    };
  } else if (isHandlerError(error)) {
    response.error.details = {
      handlerName: error.handlerName,
      originalError: error.originalError?.message,
    };
  } else if (isStateError(error)) {
    response.error.details = {
      operation: error.operation,
      originalError: error.originalError?.message,
    };
  } else if (isFileError(error)) {
    response.error.details = {
      fileId: error.fileId,
      originalError: error.originalError?.message,
    };
  } else if (isValidationError(error)) {
    response.error.details = {
      field: error.field,
      value: error.value,
    };
  }

  return response;
}


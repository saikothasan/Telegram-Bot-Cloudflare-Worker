/**
 * Telegram File object
 */
export interface File {
  /** Identifier for this file, which can be used to download or reuse the file */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots */
  file_unique_id: string;
  /** File size in bytes */
  file_size?: number;
  /** File path. Use https://api.telegram.org/file/bot<token>/<file_path> to get the file */
  file_path?: string;
}


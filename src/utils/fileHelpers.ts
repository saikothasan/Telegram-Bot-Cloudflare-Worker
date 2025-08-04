import type { TelegramClient } from '../TelegramClient';
import type { File as TelegramFile } from '../types';

/**
 * File information interface
 */
export interface FileInfo {
  /** File ID from Telegram */
  file_id: string;
  /** Unique file identifier */
  file_unique_id: string;
  /** File size in bytes */
  file_size?: number;
  /** File path for downloading */
  file_path?: string;
  /** MIME type */
  mime_type?: string;
  /** Original filename */
  file_name?: string;
}

/**
 * Download options
 */
export interface DownloadOptions {
  /** Custom API URL for file downloads */
  apiUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum file size to download in bytes */
  maxSize?: number;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Filename for the uploaded file */
  filename?: string;
  /** MIME type of the file */
  mimeType?: string;
  /** Whether to send as document (default: auto-detect) */
  asDocument?: boolean;
}

/**
 * File helper class for handling Telegram file operations
 */
export class FileHelper {
  private client: TelegramClient;
  private botToken: string;

  constructor(client: TelegramClient, botToken: string) {
    this.client = client;
    this.botToken = botToken;
  }

  /**
   * Get file information from Telegram
   */
  async getFileInfo(fileId: string): Promise<TelegramFile> {
    return await this.client.getFile({ file_id: fileId });
  }

  /**
   * Get download URL for a file
   */
  getDownloadUrl(filePath: string, apiUrl = 'https://api.telegram.org'): string {
    return `${apiUrl}/file/bot${this.botToken}/${filePath}`;
  }

  /**
   * Download file from Telegram
   */
  async downloadFile(
    fileId: string, 
    options: DownloadOptions = {}
  ): Promise<ArrayBuffer> {
    const { apiUrl = 'https://api.telegram.org', timeout = 30000, maxSize } = options;

    // Get file info
    const fileInfo = await this.getFileInfo(fileId);
    
    if (!fileInfo.file_path) {
      throw new Error('File path not available');
    }

    // Check file size
    if (maxSize && fileInfo.file_size && fileInfo.file_size > maxSize) {
      throw new Error(`File size (${fileInfo.file_size}) exceeds maximum allowed size (${maxSize})`);
    }

    // Download file
    const downloadUrl = this.getDownloadUrl(fileInfo.file_path, apiUrl);
    
    const response = await fetch(downloadUrl, {
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Download file as Uint8Array
   */
  async downloadFileAsBytes(
    fileId: string, 
    options: DownloadOptions = {}
  ): Promise<Uint8Array> {
    const buffer = await this.downloadFile(fileId, options);
    return new Uint8Array(buffer);
  }

  /**
   * Download file as text
   */
  async downloadFileAsText(
    fileId: string, 
    encoding: string = 'utf-8',
    options: DownloadOptions = {}
  ): Promise<string> {
    const buffer = await this.downloadFile(fileId, options);
    const decoder = new TextDecoder(encoding);
    return decoder.decode(buffer);
  }

  /**
   * Download file as JSON
   */
  async downloadFileAsJson<T = any>(
    fileId: string, 
    options: DownloadOptions = {}
  ): Promise<T> {
    const text = await this.downloadFileAsText(fileId, 'utf-8', options);
    return JSON.parse(text);
  }

  /**
   * Create InputFile from ArrayBuffer
   */
  createInputFile(
    data: ArrayBuffer | Uint8Array, 
    filename: string, 
    mimeType?: string
  ): File {
    const uint8Array = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const options: FilePropertyBag = {};
    if (mimeType) {
      options.type = mimeType;
    }
    return new File([uint8Array], filename, options);
  }

  /**
   * Create InputFile from text
   */
  createInputFileFromText(
    text: string, 
    filename: string, 
    mimeType = 'text/plain'
  ): File {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return this.createInputFile(data, filename, mimeType);
  }

  /**
   * Create InputFile from JSON
   */
  createInputFileFromJson(
    data: any, 
    filename: string, 
    mimeType = 'application/json'
  ): File {
    const text = JSON.stringify(data, null, 2);
    return this.createInputFileFromText(text, filename, mimeType);
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot + 1).toLowerCase();
  }

  /**
   * Get MIME type from file extension
   */
  getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      flac: 'audio/flac',
      
      // Video
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
      
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Text
      txt: 'text/plain',
      html: 'text/html',
      css: 'text/css',
      js: 'text/javascript',
      json: 'application/json',
      xml: 'application/xml',
      csv: 'text/csv',
      
      // Archives
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',
      
      // Other
      exe: 'application/octet-stream',
      dmg: 'application/x-apple-diskimage',
      iso: 'application/x-iso9660-image',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Determine if file should be sent as document based on size and type
   */
  shouldSendAsDocument(
    fileSize: number, 
    mimeType: string
  ): boolean {
    // Large files should be sent as documents
    if (fileSize > 50 * 1024 * 1024) { // 50MB
      return true;
    }

    // Check if it's a media type that Telegram supports natively
    const mediaTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
    ];

    if (mediaTypes.includes(mimeType)) {
      return false;
    }

    // Everything else should be sent as document
    return true;
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Get human-readable file size
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Extract file info from message
   */
  extractFileInfo(message: any): FileInfo | null {
    // Check for different file types
    const fileTypes = [
      'photo',
      'audio',
      'document',
      'video',
      'video_note',
      'voice',
      'sticker',
      'animation',
    ];

    for (const type of fileTypes) {
      if (message[type]) {
        const file = message[type];
        
        // Handle photo array (get largest size)
        if (type === 'photo' && Array.isArray(file)) {
          const largestPhoto = file.reduce((prev, current) => 
            (current.file_size || 0) > (prev.file_size || 0) ? current : prev
          );
          return {
            file_id: largestPhoto.file_id,
            file_unique_id: largestPhoto.file_unique_id,
            file_size: largestPhoto.file_size,
            mime_type: 'image/jpeg',
          };
        }

        return {
          file_id: file.file_id,
          file_unique_id: file.file_unique_id,
          file_size: file.file_size,
          mime_type: file.mime_type,
          file_name: file.file_name,
        };
      }
    }

    return null;
  }
}

/**
 * Create a file helper instance
 */
export function createFileHelper(client: TelegramClient, botToken: string): FileHelper {
  return new FileHelper(client, botToken);
}

/**
 * Utility function to check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Utility function to check if a file is audio
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/**
 * Utility function to check if a file is video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Utility function to check if a file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/html',
    'application/json',
    'application/xml',
    'text/csv',
  ];

  return documentTypes.includes(mimeType);
}

/**
 * Utility function to check if a file is an archive
 */
export function isArchiveFile(mimeType: string): boolean {
  const archiveTypes = [
    'application/zip',
    'application/vnd.rar',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ];

  return archiveTypes.includes(mimeType);
}


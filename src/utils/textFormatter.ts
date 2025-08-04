/**
 * Text formatting utilities for Telegram messages
 */

/**
 * Escape special characters for MarkdownV2
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Escape special characters for HTML
 */
export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Escape special characters for legacy Markdown
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[_*`[]/g, '\\$&');
}

/**
 * Format text as bold in MarkdownV2
 */
export function boldMarkdownV2(text: string): string {
  return `*${escapeMarkdownV2(text)}*`;
}

/**
 * Format text as italic in MarkdownV2
 */
export function italicMarkdownV2(text: string): string {
  return `_${escapeMarkdownV2(text)}_`;
}

/**
 * Format text as underline in MarkdownV2
 */
export function underlineMarkdownV2(text: string): string {
  return `__${escapeMarkdownV2(text)}__`;
}

/**
 * Format text as strikethrough in MarkdownV2
 */
export function strikethroughMarkdownV2(text: string): string {
  return `~${escapeMarkdownV2(text)}~`;
}

/**
 * Format text as spoiler in MarkdownV2
 */
export function spoilerMarkdownV2(text: string): string {
  return `||${escapeMarkdownV2(text)}||`;
}

/**
 * Format text as code in MarkdownV2
 */
export function codeMarkdownV2(text: string): string {
  return `\`${escapeMarkdownV2(text)}\``;
}

/**
 * Format text as code block in MarkdownV2
 */
export function codeBlockMarkdownV2(text: string, language?: string): string {
  const lang = language ? escapeMarkdownV2(language) : '';
  return `\`\`\`${lang}\n${escapeMarkdownV2(text)}\n\`\`\``;
}

/**
 * Format text as link in MarkdownV2
 */
export function linkMarkdownV2(text: string, url: string): string {
  return `[${escapeMarkdownV2(text)}](${escapeMarkdownV2(url)})`;
}

/**
 * Format user mention in MarkdownV2
 */
export function mentionMarkdownV2(text: string, userId: number): string {
  return `[${escapeMarkdownV2(text)}](tg://user?id=${userId})`;
}

/**
 * Format text as bold in HTML
 */
export function boldHTML(text: string): string {
  return `<b>${escapeHTML(text)}</b>`;
}

/**
 * Format text as italic in HTML
 */
export function italicHTML(text: string): string {
  return `<i>${escapeHTML(text)}</i>`;
}

/**
 * Format text as underline in HTML
 */
export function underlineHTML(text: string): string {
  return `<u>${escapeHTML(text)}</u>`;
}

/**
 * Format text as strikethrough in HTML
 */
export function strikethroughHTML(text: string): string {
  return `<s>${escapeHTML(text)}</s>`;
}

/**
 * Format text as spoiler in HTML
 */
export function spoilerHTML(text: string): string {
  return `<span class="tg-spoiler">${escapeHTML(text)}</span>`;
}

/**
 * Format text as code in HTML
 */
export function codeHTML(text: string): string {
  return `<code>${escapeHTML(text)}</code>`;
}

/**
 * Format text as code block in HTML
 */
export function codeBlockHTML(text: string, language?: string): string {
  const lang = language ? ` class="language-${escapeHTML(language)}"` : '';
  return `<pre${lang}><code>${escapeHTML(text)}</code></pre>`;
}

/**
 * Format text as link in HTML
 */
export function linkHTML(text: string, url: string): string {
  return `<a href="${escapeHTML(url)}">${escapeHTML(text)}</a>`;
}

/**
 * Format user mention in HTML
 */
export function mentionHTML(text: string, userId: number): string {
  return `<a href="tg://user?id=${userId}">${escapeHTML(text)}</a>`;
}

/**
 * Format text as bold in legacy Markdown
 */
export function boldMarkdown(text: string): string {
  return `*${escapeMarkdown(text)}*`;
}

/**
 * Format text as italic in legacy Markdown
 */
export function italicMarkdown(text: string): string {
  return `_${escapeMarkdown(text)}_`;
}

/**
 * Format text as code in legacy Markdown
 */
export function codeMarkdown(text: string): string {
  return `\`${escapeMarkdown(text)}\``;
}

/**
 * Format text as code block in legacy Markdown
 */
export function codeBlockMarkdown(text: string): string {
  return `\`\`\`\n${escapeMarkdown(text)}\n\`\`\``;
}

/**
 * Format text as link in legacy Markdown
 */
export function linkMarkdown(text: string, url: string): string {
  return `[${escapeMarkdown(text)}](${url})`;
}

/**
 * Text formatter class for fluent API
 */
export class TextFormatter {
  private text: string;
  private parseMode: 'MarkdownV2' | 'HTML' | 'Markdown';

  constructor(text: string, parseMode: 'MarkdownV2' | 'HTML' | 'Markdown' = 'MarkdownV2') {
    this.text = text;
    this.parseMode = parseMode;
  }

  /**
   * Make text bold
   */
  bold(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = boldMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = boldHTML(this.text);
        break;
      case 'Markdown':
        this.text = boldMarkdown(this.text);
        break;
    }
    return this;
  }

  /**
   * Make text italic
   */
  italic(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = italicMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = italicHTML(this.text);
        break;
      case 'Markdown':
        this.text = italicMarkdown(this.text);
        break;
    }
    return this;
  }

  /**
   * Make text underlined (MarkdownV2 and HTML only)
   */
  underline(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = underlineMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = underlineHTML(this.text);
        break;
      case 'Markdown':
        // Underline not supported in legacy Markdown
        break;
    }
    return this;
  }

  /**
   * Make text strikethrough (MarkdownV2 and HTML only)
   */
  strikethrough(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = strikethroughMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = strikethroughHTML(this.text);
        break;
      case 'Markdown':
        // Strikethrough not supported in legacy Markdown
        break;
    }
    return this;
  }

  /**
   * Make text spoiler (MarkdownV2 and HTML only)
   */
  spoiler(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = spoilerMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = spoilerHTML(this.text);
        break;
      case 'Markdown':
        // Spoiler not supported in legacy Markdown
        break;
    }
    return this;
  }

  /**
   * Make text code
   */
  code(): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = codeMarkdownV2(this.text);
        break;
      case 'HTML':
        this.text = codeHTML(this.text);
        break;
      case 'Markdown':
        this.text = codeMarkdown(this.text);
        break;
    }
    return this;
  }

  /**
   * Make text a code block
   */
  codeBlock(language?: string): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = codeBlockMarkdownV2(this.text, language);
        break;
      case 'HTML':
        this.text = codeBlockHTML(this.text, language);
        break;
      case 'Markdown':
        this.text = codeBlockMarkdown(this.text);
        break;
    }
    return this;
  }

  /**
   * Make text a link
   */
  link(url: string): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = linkMarkdownV2(this.text, url);
        break;
      case 'HTML':
        this.text = linkHTML(this.text, url);
        break;
      case 'Markdown':
        this.text = linkMarkdown(this.text, url);
        break;
    }
    return this;
  }

  /**
   * Make text a user mention
   */
  mention(userId: number): this {
    switch (this.parseMode) {
      case 'MarkdownV2':
        this.text = mentionMarkdownV2(this.text, userId);
        break;
      case 'HTML':
        this.text = mentionHTML(this.text, userId);
        break;
      case 'Markdown':
        // User mentions not supported in legacy Markdown
        break;
    }
    return this;
  }

  /**
   * Get the formatted text
   */
  toString(): string {
    return this.text;
  }

  /**
   * Get the parse mode
   */
  getParseMode(): 'MarkdownV2' | 'HTML' | 'Markdown' {
    return this.parseMode;
  }
}

/**
 * Create a text formatter instance
 */
export function format(text: string, parseMode: 'MarkdownV2' | 'HTML' | 'Markdown' = 'MarkdownV2'): TextFormatter {
  return new TextFormatter(text, parseMode);
}

/**
 * Join multiple formatted text parts
 */
export function join(separator: string, ...parts: (string | TextFormatter)[]): string {
  return parts.map(part => part.toString()).join(separator);
}

/**
 * Create a list with bullet points
 */
export function bulletList(items: string[], parseMode: 'MarkdownV2' | 'HTML' | 'Markdown' = 'MarkdownV2'): string {
  const bullet = parseMode === 'MarkdownV2' ? '\\•' : '•';
  return items.map(item => `${bullet} ${item}`).join('\n');
}

/**
 * Create a numbered list
 */
export function numberedList(items: string[], parseMode: 'MarkdownV2' | 'HTML' | 'Markdown' = 'MarkdownV2'): string {
  return items.map((item, index) => {
    const number = parseMode === 'MarkdownV2' ? `${index + 1}\\.` : `${index + 1}.`;
    return `${number} ${item}`;
  }).join('\n');
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Split text into chunks of maximum length
 */
export function splitText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  const words = text.split(' ');
  
  for (const word of words) {
    if ((currentChunk + ' ' + word).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        // Word is longer than maxLength, split it
        chunks.push(word.substring(0, maxLength));
        currentChunk = word.substring(maxLength);
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Remove all formatting from text
 */
export function stripFormatting(text: string): string {
  return text
    // Remove MarkdownV2 formatting
    .replace(/\\([_*[\]()~`>#+=|{}.!-])/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~([^~]+)~/g, '$1')
    .replace(/\|\|([^|]+)\|\|/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[^`]*\n([^`]+)\n```/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML formatting
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}


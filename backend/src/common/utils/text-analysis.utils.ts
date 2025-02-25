import { createHash } from 'crypto';

export class TextUtils {
  static normalizeContent(content: string): string {
    if (!content) return '';

    // 1. Normalize line endings
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Normalize paragraph breaks (multiple newlines to double newlines)
    content = content.replace(/\n{3,}/g, '\n\n');

    // 3. Normalize spaces within each line (line-specific processing)
    const lines = content.split('\n'); // Split into lines
    const normalizedLines = lines.map((line) => {
      return line.replace(/\s{2,}/g, ' ').trim(); // Normalize spaces in each line and trim line whitespace
    });
    content = normalizedLines.join('\n'); // Join lines back with newlines

    // 4. Trim leading/trailing whitespace of the whole document
    content = content.trim();

    return content;
  }
  static generateHash(content: string): string {
    if (!content) return '';
    return createHash('md5').update(content).digest('hex');
  }

  static generateCacheKey(userId: string, content: string): string {
    if (!userId || !content) return '';
    const contentHash = this.generateHash(content);
    return `text-analysis:${userId}:${contentHash}`;
  }
}

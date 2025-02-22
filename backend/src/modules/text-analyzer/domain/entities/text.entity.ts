import { Logger } from '@nestjs/common';
import { TextStats } from '../../application/dto/text-stats.dto';
import { TextUtils } from '@utils/text-analysis.utils';

export class TextAnalyzerEntity {
  private _content: string;
  private _contentHash: string;
  private _stats: TextStats | null; // This is our "in-memory cache"
  private readonly logger = new Logger(TextAnalyzerEntity.name);

  constructor(
    content: string,
    public readonly userId: string,
  ) {
    const normalizeContent = TextUtils.normalizeContent(content);
    this._content = normalizeContent;
    this._contentHash = TextUtils.generateHash(normalizeContent);
    this._stats = null;
  }

  // When content changes, invalidate the in-memory cache
  updateContent(newContent: string): boolean {
    const normalizedContent = TextUtils.normalizeContent(newContent);
    const newHash = TextUtils.generateHash(normalizedContent);

    if (newHash !== this._contentHash) {
      this._content = normalizedContent;
      this._contentHash = newHash;
      this._stats = null; // Invalidate in-memory cache
      return true;
    }
    return false;
  }

  // Add method to check if content has changed without setting it
  public hasContentChanged(newContent: string): boolean {
    const normalizedContent = TextUtils.normalizeContent(newContent);
    const newHash = TextUtils.generateHash(normalizedContent);
    return this._contentHash !== newHash;
  }

  get content(): string {
    return this._content;
  }
  get contentHash(): string {
    return this._contentHash;
  }

  async getAnalyzeText(): Promise<TextStats> {
    // If no stats in memory, compute them
    this._stats = await this.computeStats();
    this.logger.log('Computed new stats');
    return this._stats;
  }

  // Initialize stats Asynchronously
  async initializeStats(): Promise<TextStats> {
    if (!this._stats) {
      this._stats = await this.analyzeText(this.content);
    }
    this.logger.log(this._stats, 'stats in entity');
    return this._stats;
  }

  // Public methods to access specific stats
  public async getWordCount(): Promise<number> {
    const stats = await this.computeStats();
    return stats.wordCount;
  }

  public async getCharacterCount(): Promise<number> {
    const stats = await this.computeStats();
    return stats.characterCount;
  }

  public async getSentenceCount(): Promise<number> {
    const stats = await this.computeStats();
    return stats.sentenceCount;
  }

  public async getParagraphCount(): Promise<number> {
    const stats = await this.computeStats();
    return stats.paragraphCount;
  }

  public async getLongestWords(): Promise<string[]> {
    const stats = await this.computeStats();
    return [...(stats.longestWords ?? [])]; // Return copy to prevent mutation
  }

  private countWords(text: string) {
    const words = text.trim().split(/\s+/);
    return words.filter((word) => word.length > 0).length;
  }

  private countCharacters(text: string) {
    return text.replace(/\s+/g, '').length;
  }

  private countSentences(text: string) {
    const sentenceEndRegex = /[.?!](?=[ \r\n]|$)/g;

    const matches = text.match(sentenceEndRegex);
    if (matches) {
      return matches.length;
    }
    return 0;
  }

  private countParagraphs(text: string) {
    if (!text.trim()) return 0;

    // 1. Normalize newlines and trim the text
    const normalizedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    // 2. Split by double newlines (including those with spaces between)
    const paragraphs = normalizedText.split(/\n\s*\n+/); // Added '+' quantifier
    // 3. Filter out empty paragraphs and return the count'
    console.log(normalizedText, 'normalizedText', paragraphs);

    console.log(paragraphs, 'paragraphs');
    return paragraphs.filter((p) => p.trim().length > 0).length;
  }

  private findLongestWords(text: string): string[] {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const maxLength = Math.max(...words.map((word) => word.length));
    return words.filter((word) => word.length === maxLength);
  }

  private async analyzeText(text: string): Promise<TextStats> {
    return new Promise((resolve, reject) => {
      try {
        setImmediate(() => {
          const normalizedText = text.toLowerCase();
          const stats: TextStats = {
            wordCount: this.countWords(normalizedText),
            characterCount: this.countCharacters(normalizedText),
            sentenceCount: this.countSentences(normalizedText),
            paragraphCount: this.countParagraphs(normalizedText),
            longestWords: this.findLongestWords(normalizedText),
          };
          this.logger.debug(stats, 'stats in entity');
          resolve(stats);
        });
      } catch (error) {
        this.logger.error(error, 'error in analyzeText');
        reject(new Error('Failed to analyze text'));
      }
    });
  }

  private async computeStats(): Promise<TextStats> {
    return new Promise((resolve, reject) => {
      try {
        const stats: TextStats = {
          wordCount: this.countWords(this._content),
          characterCount: this.countCharacters(this._content),
          sentenceCount: this.countSentences(this._content),
          paragraphCount: this.countParagraphs(this._content),
          longestWords: this.findLongestWords(this._content),
        };
        resolve(stats);
      } catch (error) {
        this.logger.error(error, 'error in computeStats');
        reject(new Error('Failed to compute stats'));
      }
    });
  }
}

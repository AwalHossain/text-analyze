import { TextUtils } from '@common/utils/text-analysis.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TextAnalyzerEntity } from '../../domain/entities/text.entity';
import { TextRepository } from '../../infrastructure/repositories/text.repository';
import { TextDocument } from '../../infrastructure/schemas/text.schema';
import { TextStats } from '../dto/text-stats.dto';

@Injectable()
export class TextAnalyzerService {
  private readonly logger = new Logger(TextAnalyzerService.name);
  constructor(
    private readonly textRepository: TextRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async analyzeText(
    content: string,
    userId: string,
  ): Promise<TextStats | undefined> {
    const normalizedContent = TextUtils.normalizeContent(content);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedContent);
    try {
      this.logger.log(`Text analysis saved to database for user ${userId}`);
      const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);
      if (cachedStats) {
        await this.textRepository.analyzeText(userId, content, cachedStats); // Use repository to save
        this.logger.log(`Cache hit for user ${userId}`);

        return cachedStats;
      }

      this.logger.log(`Analyzing text for user ${userId}`);
      const textAnalyzer = new TextAnalyzerEntity(content, userId); // Create entity just for analysis
      const stats = await textAnalyzer.getAnalyzeText(); // Compute stats (no entity-level cache anymore)
      await this.textRepository.analyzeText(userId, content, stats); // Use repository to save
      // Save the analyzed text and stats to the database

      await this.cacheManager.set(cacheKey, stats); // Cache at service level
      this.logger.log(`Text analyzed and cached for user ${userId}`);
      return stats;
    } catch (dbError) {
      this.logger.error(
        `Error saving text analysis to database for user ${userId}`,
        dbError,
      );
      // Consider how you want to handle database errors.
      // For now, we'll log the error but still proceed to cache and return the stats.
      // You might want to re-throw the error or handle it differently based on your requirements.
    }
  }

  async getWordCount(text: string, userId: string): Promise<number> {
    const normalizedText = TextUtils.normalizeContent(text);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats && cachedStats.wordCount !== undefined) {
      // Check if wordCount is in cached stats
      this.logger.log(`Cache hit for word count user ${userId}`);
      return cachedStats.wordCount;
    }

    this.logger.log(`Cache miss for word count user ${userId}`);
    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId); // Create entity for computation
    const wordCount = await textAnalyzer.getWordCount(); // Compute word count
    const statsToCache: TextStats = await textAnalyzer.getAnalyzeText();
    await this.cacheManager.set(cacheKey, statsToCache); // Cache at service level
    return wordCount;
  }

  async getCharacterCount(text: string, userId: string): Promise<number> {
    const normalizedText = TextUtils.normalizeContent(text);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats && cachedStats.characterCount !== undefined) {
      this.logger.log(`Cache hit for character count user ${userId}`);
      return cachedStats.characterCount;
    }

    this.logger.log(`Cache miss for character count user ${userId}`);
    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId); // Create entity for computation
    const characterCount = await textAnalyzer.getCharacterCount();
    const statsToCache: TextStats = await textAnalyzer.getAnalyzeText();
    await this.cacheManager.set(cacheKey, statsToCache); // Cache at service level
    return characterCount;
  }

  async getSentenceCount(text: string, userId: string): Promise<number> {
    const normalizedText = TextUtils.normalizeContent(text);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats && cachedStats.sentenceCount !== undefined) {
      this.logger.log(`Cache hit for sentence count user ${userId}`);
      return cachedStats.sentenceCount;
    }

    this.logger.log(`Cache miss for sentence count user ${userId}`);
    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId); // Create entity for computation
    const sentenceCount = await textAnalyzer.getSentenceCount();
    const statsToCache: TextStats = await textAnalyzer.getAnalyzeText();
    await this.cacheManager.set(cacheKey, statsToCache); // Cache at service level
    return sentenceCount;
  }

  async getParagraphCount(text: string, userId: string): Promise<number> {
    // Add debug logging
    console.log('Original text:', text);

    const normalizedText = TextUtils.normalizeContent(text);
    console.log('Normalized text:', normalizedText);

    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats && cachedStats.paragraphCount !== undefined) {
      this.logger.log(`Cache hit for paragraph count user ${userId}`);
      return cachedStats.paragraphCount;
    }

    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId);
    this.logger.log(
      `Cache miss for paragraph count user ${userId}`,
      textAnalyzer,
      await textAnalyzer.getParagraphCount(),
    );

    const statsToCache: TextStats = await textAnalyzer.getAnalyzeText();

    await this.cacheManager.set(cacheKey, statsToCache);
    console.log('Stats computed after cache:', statsToCache.paragraphCount);
    return statsToCache.paragraphCount;
  }

  async getLongestWords(text: string, userId: string): Promise<string[]> {
    const normalizedText = TextUtils.normalizeContent(text);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats && cachedStats.longestWords !== undefined) {
      this.logger.log(`Cache hit for longest words user ${userId}`);
      return cachedStats.longestWords;
    }

    this.logger.log(`Cache miss for longest words user ${userId}`);
    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId); // Create entity for computation
    const longestWords = await textAnalyzer.getLongestWords();
    const statsToCache: TextStats = await textAnalyzer.getAnalyzeText();
    await this.cacheManager.set(cacheKey, statsToCache); // Cache at service level
    return longestWords;
  }

  async getAnalyzeText(text: string, userId: string): Promise<TextStats> {
    const normalizedText = TextUtils.normalizeContent(text);
    const cacheKey = TextUtils.generateCacheKey(userId, normalizedText);
    const cachedStats = await this.cacheManager.get<TextStats>(cacheKey);

    if (cachedStats) {
      this.logger.log(`Cache hit for analyze text user ${userId}`);
      return cachedStats;
    }

    this.logger.log(`Cache miss for analyze text user ${userId}`);
    const textAnalyzer = new TextAnalyzerEntity(normalizedText, userId); // Create entity for computation
    const analyzeText = await textAnalyzer.getAnalyzeText();

    await this.cacheManager.set(cacheKey, analyzeText); // Cache at service level
    return analyzeText;
  }

  async getAllAnalyzeByUserId(userId: string): Promise<Array<TextDocument>> {
    const allAnalyze = await this.textRepository.findAllByUserId(userId);
    console.log(allAnalyze, 'allAnalyze for user `{userId}`', userId);
    this.logger.log(`All analyze for user ${userId}:`, allAnalyze);
    return allAnalyze;
  }
}

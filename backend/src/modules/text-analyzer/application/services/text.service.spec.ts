import { Test, TestingModule } from '@nestjs/testing';
import { TextRepository } from '../../infrastructure/repositories/text.repository';
import { TextAnalyzerService } from './text-analyer.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TextStats } from '../dto/text-stats.dto';

describe('TextAnalyzerService', () => {
  let service: TextAnalyzerService;

  const mockTextRepository = {
    analyzeText: jest.fn(),
    findAllByUserId: jest.fn(),
  };
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextAnalyzerService,
        {
          provide: TextRepository,
          useValue: mockTextRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TextAnalyzerService>(TextAnalyzerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeText', () => {
    const sampleText = 'The quick brown fox jumps over the lazy dog';
    const userId = 'test-user-id';

    const expectedStats: TextStats = {
      wordCount: 9,
      characterCount: 35,
      sentenceCount: 1,
      paragraphCount: 1,
      longestWords: ['quick', 'brown', 'jumps'],
    };

    it('should return cached stats if available', async () => {
      mockCacheManager.get.mockResolvedValue(expectedStats);

      const result = await service.analyzeText(sampleText, userId);

      expect(result).toEqual(expectedStats);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).not.toHaveBeenCalled();
      expect(mockTextRepository.analyzeText).toHaveBeenCalledWith(
        userId,
        sampleText,
        expectedStats,
      );
    });

    it('should analyze text and cache results if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockCacheManager.set.mockResolvedValue(undefined);
      mockTextRepository.analyzeText.mockResolvedValue({
        ...expectedStats,
        _id: 'some-id',
      });

      const result = await service.analyzeText(sampleText, userId);

      expect(result).toBeDefined();
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(mockTextRepository.analyzeText).toHaveBeenCalled();
    });

    describe('getWordCount', () => {
      const sampleText = 'The quick brown fox';
      const userId = 'test-user-id';

      it('should return cached word count if available', async () => {
        const cachedStats: TextStats = {
          wordCount: 4,
          characterCount: 16,
          sentenceCount: 1,
          paragraphCount: 1,
          longestWords: ['quick', 'brown'],
        };

        mockCacheManager.get.mockResolvedValue(cachedStats);

        const result = await service.getWordCount(sampleText, userId);

        expect(result).toBe(4);
        expect(mockCacheManager.get).toHaveBeenCalled();
        expect(mockCacheManager.set).not.toHaveBeenCalled();
      });

      it('should compute and cache word count if not cached', async () => {
        mockCacheManager.get.mockResolvedValue(null);

        const result = await service.getWordCount(sampleText, userId);

        expect(result).toBe(4);
        expect(mockCacheManager.get).toHaveBeenCalled();
        expect(mockCacheManager.set).toHaveBeenCalled();
      });
    });

    describe('getCharacterCount', () => {
      const sampleText = 'Hello World';
      const userId = 'test-user-id';

      it('should return cached character count if available', async () => {
        const cachedStats: TextStats = {
          wordCount: 2,
          characterCount: 10,
          sentenceCount: 1,
          paragraphCount: 1,
          longestWords: ['Hello', 'World'],
        };

        mockCacheManager.get.mockResolvedValue(cachedStats);

        const result = await service.getCharacterCount(sampleText, userId);

        expect(result).toBe(10);
        expect(mockCacheManager.get).toHaveBeenCalled();
        expect(mockCacheManager.set).not.toHaveBeenCalled();
      });

      it('should compute and cache character count if not cached', async () => {
        mockCacheManager.get.mockResolvedValue(null);

        const result = await service.getCharacterCount(sampleText, userId);

        expect(result).toBe(10);
        expect(mockCacheManager.get).toHaveBeenCalled();
        expect(mockCacheManager.set).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle repository errors gracefully', async () => {
        mockCacheManager.get.mockResolvedValue(null);

        mockCacheManager.get.mockResolvedValue(null);
        mockTextRepository.analyzeText.mockRejectedValue(new Error('DB Error'));

        const result = await service.analyzeText(sampleText, userId);

        expect(result).toBeUndefined();
      });
    });

    describe('getAllAnalyzeByUserId', () => {
      it('should return all analyze by user id', async () => {
        const mockAnalyzes = [
          {
            content: 'first text',
            userId: 'temp-user-id',
            stats: {
              wordCount: 2,
              characterCount: 10,
              sentenceCount: 1,
              paragraphCount: 1,
              longestWords: ['first', 'text'],
            },
          },
          {
            content: 'second text',
            userId: 'temp-user-id',
            stats: {
              wordCount: 2,
              characterCount: 11,
              sentenceCount: 1,
              paragraphCount: 1,
              longestWords: ['second', 'text'],
            },
          },
        ];
        mockTextRepository.findAllByUserId.mockResolvedValue(mockAnalyzes);
        const result = await service.getAllAnalyzeByUserId('temp-user-id');
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result[0]).toHaveProperty('content');
        expect(result[0]).toHaveProperty('userId');
        expect(result[0]).toHaveProperty('stats');
        expect(mockTextRepository.findAllByUserId).toHaveBeenCalledWith(
          'temp-user-id',
        );
      });

      it('should return empty array if no analyze found', async () => {
        mockTextRepository.findAllByUserId.mockResolvedValue([]);

        const result = await service.getAllAnalyzeByUserId('no-user-id');

        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(0);
      });
    });
  });
});

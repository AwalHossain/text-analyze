import { Test, TestingModule } from '@nestjs/testing';
import { TextAnalyzerService } from '../../application/services/text-analyer.service';
import { TextAnalyzerController } from './text-analyzer.controller';
import { HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
describe('TextAnalyzerController', () => {
  let controller: TextAnalyzerController;

  const mockTextAnalyzerService = {
    analyzeText: jest.fn(),
    getWordCount: jest.fn(),
    getCharacterCount: jest.fn(),
    getSentenceCount: jest.fn(),
    getParagraphCount: jest.fn(),
    getLongestWords: jest.fn(),
    getAllAnalyzeByUserId: jest.fn(),
  };
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mdoules: TestingModule = await Test.createTestingModule({
      controllers: [TextAnalyzerController],
      providers: [
        {
          provide: TextAnalyzerService,
          useValue: mockTextAnalyzerService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
      ],
    }).compile();

    controller = mdoules.get<TextAnalyzerController>(TextAnalyzerController);
  });

  describe('analyzeText', () => {
    const userId = 'user123';
    it('should return the correct text analysis and return success status ', async () => {
      const sampleText = 'This is a test text';

      const mockAnalyses = {
        wordCount: 4,
        characterCount: 10,
        sentenceCount: 2,
        paragraphCount: 1,
        longestWords: ['test', 'text'],
      };

      mockTextAnalyzerService.analyzeText.mockResolvedValue(mockAnalyses);

      const result = await controller.analyzeText(sampleText, userId);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'The text has been successfully created and analyzed.',
        data: mockAnalyses,
      });
      expect(mockTextAnalyzerService.analyzeText).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getWordCount', () => {
    it('should return the correct word count', async () => {
      const sampleText = 'This is a test text';
      const userId = 'user123';
      const mockWordCount = 4;
      mockTextAnalyzerService.getWordCount.mockResolvedValue(mockWordCount);

      const result = await controller.getWordCount(sampleText, userId);
      console.log(result, 'result from controller');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The words in the text have been successfully analyzed.',
        data: {
          type: 'words',
          count: mockWordCount,
        },
      });
      expect(mockTextAnalyzerService.getWordCount).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getCharacterCount', () => {
    it('should return the correct character count', async () => {
      const sampleText = 'This is a test text';
      const userId = 'user123';
      const mockCharacterCount = 10;
      mockTextAnalyzerService.getCharacterCount.mockResolvedValue(
        mockCharacterCount,
      );

      const result = await controller.getCharacterCount(sampleText, userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The characters in the text have been successfully analyzed.',
        data: {
          type: 'characters',
          count: mockCharacterCount,
        },
      });
      expect(mockTextAnalyzerService.getCharacterCount).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getSentenceCount', () => {
    it('should return the correct sentence count', async () => {
      const sampleText = 'This is a test text. It is a test.';
      const userId = 'user123';
      const mockSentenceCount = 2;
      mockTextAnalyzerService.getSentenceCount.mockResolvedValue(
        mockSentenceCount,
      );

      const result = await controller.getSentenceCount(sampleText, userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The sentences in the text have been successfully analyzed.',
        data: {
          type: 'sentences',
          count: mockSentenceCount,
        },
      });
      expect(mockTextAnalyzerService.getSentenceCount).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getParagraphCount', () => {
    it('should return the correct paragraph count', async () => {
      const sampleText = 'This is a test text.\nIt is a test.';
      const userId = 'user123';
      const mockParagraphCount = 2;
      mockTextAnalyzerService.getParagraphCount.mockResolvedValue(
        mockParagraphCount,
      );

      const result = await controller.getParagraphCount(sampleText, userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The paragraphs in the text have been successfully analyzed.',
        data: {
          type: 'paragraphs',
          count: mockParagraphCount,
        },
      });
      expect(mockTextAnalyzerService.getParagraphCount).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getLongestWords', () => {
    it('should return the correct longest words', async () => {
      const sampleText = 'This is a test text. It is a test.';
      const userId = 'user123';
      const mockLongestWords = ['test', 'text'];
      mockTextAnalyzerService.getLongestWords.mockResolvedValue(
        mockLongestWords,
      );

      const result = await controller.getLongestWords(sampleText, userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message:
          'The longest words in the text have been successfully analyzed.',
        data: {
          type: 'longestWord',
          count: mockLongestWords,
        },
      });
      expect(mockTextAnalyzerService.getLongestWords).toHaveBeenCalledWith(
        sampleText,
        userId,
      );
    });
  });

  describe('getAllAnalyzeByUserId', () => {
    it('should return all analyze texts for a user', async () => {
      const userId = 'user123';
      const mockAnalyzeTexts = [
        {
          wordCount: 4,
          characterCount: 10,
          sentenceCount: 2,
          paragraphCount: 1,
          longestWords: ['test', 'text'],
        },
      ];
      mockTextAnalyzerService.getAllAnalyzeByUserId.mockResolvedValue(
        mockAnalyzeTexts,
      );

      const result = await controller.getAllAnalyzeByUserId(userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The analyze has been successfully retrieved.',
        data: mockAnalyzeTexts,
      });
      expect(
        mockTextAnalyzerService.getAllAnalyzeByUserId,
      ).toHaveBeenCalledWith(userId);
    });
  });
});

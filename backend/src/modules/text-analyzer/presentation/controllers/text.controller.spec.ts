import { Test, TestingModule } from '@nestjs/testing';
import { TextAnalyzerService } from '../../application/services/text-analyer.service';
import { TextAnalyzerController } from './text-analyzer.controller';
import { CreateTextDto } from '../../application/dto/create-text.dto';
import { HttpStatus } from '@nestjs/common';

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

  beforeEach(async () => {
    const mdoules: TestingModule = await Test.createTestingModule({
      controllers: [TextAnalyzerController],
      providers: [
        {
          provide: TextAnalyzerService,
          useValue: mockTextAnalyzerService,
        },
      ],
    }).compile();

    controller = mdoules.get<TextAnalyzerController>(TextAnalyzerController);
  });

  describe('analyzeText', () => {
    it('should return the correct text analysis and return success status ', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text',
        userId: 'user123',
      };

      const mockAnalyses = {
        wordCount: 4,
        characterCount: 10,
        sentenceCount: 2,
        paragraphCount: 1,
        longestWords: ['test', 'text'],
      };

      mockTextAnalyzerService.analyzeText.mockResolvedValue(mockAnalyses);

      const result = await controller.analyzeText(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'The text has been successfully created and analyzed.',
        data: mockAnalyses,
      });
      expect(mockTextAnalyzerService.analyzeText).toHaveBeenCalledWith(
        createTextDto,
      );
    });
  });

  describe('getWordCount', () => {
    it('should return the correct word count', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text',
        userId: 'user123',
      };
      const mockWordCount = 4;
      mockTextAnalyzerService.getWordCount.mockResolvedValue(mockWordCount);

      const result = await controller.getWordCount(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The words in the text have been successfully analyzed.',
        data: mockWordCount,
      });
      expect(mockTextAnalyzerService.getWordCount).toHaveBeenCalledWith(
        createTextDto.content,
        createTextDto.userId || 'temp-user-id',
      );
    });
  });

  describe('getCharacterCount', () => {
    it('should return the correct character count', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text',
        userId: 'user123',
      };
      const mockCharacterCount = 10;
      mockTextAnalyzerService.getCharacterCount.mockResolvedValue(
        mockCharacterCount,
      );

      const result = await controller.getCharacterCount(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The characters in the text have been successfully analyzed.',
        data: mockCharacterCount,
      });
      expect(mockTextAnalyzerService.getCharacterCount).toHaveBeenCalledWith(
        createTextDto.content,
        createTextDto.userId || 'temp-user-id',
      );
    });
  });

  describe('getSentenceCount', () => {
    it('should return the correct sentence count', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text. It is a test.',
        userId: 'user123',
      };
      const mockSentenceCount = 2;
      mockTextAnalyzerService.getSentenceCount.mockResolvedValue(
        mockSentenceCount,
      );

      const result = await controller.getSentenceCount(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The sentences in the text have been successfully analyzed.',
        data: mockSentenceCount,
      });
      expect(mockTextAnalyzerService.getSentenceCount).toHaveBeenCalledWith(
        createTextDto.content,
        createTextDto.userId || 'temp-user-id',
      );
    });
  });

  describe('getParagraphCount', () => {
    it('should return the correct paragraph count', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text.\nIt is a test.',
        userId: 'user123',
      };
      const mockParagraphCount = 2;
      mockTextAnalyzerService.getParagraphCount.mockResolvedValue(
        mockParagraphCount,
      );

      const result = await controller.getParagraphCount(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The paragraphs in the text have been successfully analyzed.',
        data: mockParagraphCount,
      });
      expect(mockTextAnalyzerService.getParagraphCount).toHaveBeenCalledWith(
        createTextDto.content,
        createTextDto.userId || 'temp-user-id',
      );
    });
  });

  describe('getLongestWords', () => {
    it('should return the correct longest words', async () => {
      const createTextDto: CreateTextDto = {
        content: 'This is a test text. It is a test.',
        userId: 'user123',
      };
      const mockLongestWords = ['test', 'text'];
      mockTextAnalyzerService.getLongestWords.mockResolvedValue(
        mockLongestWords,
      );

      const result = await controller.getLongestWords(createTextDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message:
          'The longest words in the text have been successfully analyzed.',
        data: mockLongestWords,
      });
      expect(mockTextAnalyzerService.getLongestWords).toHaveBeenCalledWith(
        createTextDto.content,
        createTextDto.userId || 'temp-user-id',
      );
    });
  });

  describe('getAllAnalyzeByUserId', () => {
    it('should return all analyze texts for a user', async () => {
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

      const result = await controller.getAllAnalyzeByUserId();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'The analyze has been successfully retrieved.',
        data: mockAnalyzeTexts,
      });
      expect(
        mockTextAnalyzerService.getAllAnalyzeByUserId,
      ).toHaveBeenCalledWith('temp-user-id');
    });
  });
});

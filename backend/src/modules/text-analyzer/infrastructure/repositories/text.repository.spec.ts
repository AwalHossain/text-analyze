import { Model } from 'mongoose';
import { TextRepository } from './text.repository';
import { TextDocument } from '../schemas/text.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

describe('TextRepository', () => {
  let repository: TextRepository;
  let model: Model<TextDocument>;

  const mockTextModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextRepository,
        {
          provide: getModelToken(TextDocument.name),
          useValue: mockTextModel,
        },
      ],
    }).compile();

    repository = module.get<TextRepository>(TextRepository);
    model = module.get<Model<TextDocument>>(getModelToken(TextDocument.name));
  });

  describe('analyzeText', () => {
    it('should create and save a new text analysis', async () => {
      const mockStats = {
        wordCount: 5,
        characterCount: 20,
        sentenceCount: 1,
        paragraphCount: 1,
        longestWords: ['hello', 'world'],
      };

      const mockCreatedText = {
        _id: 'text123',
        content: 'Hello world 123',
        userId: 'user123',
        stats: mockStats,
      };

      mockTextModel.create.mockResolvedValue(mockCreatedText);

      const result = await repository.analyzeText(
        'user123',
        'Hello world',
        mockStats,
      );
      // Different ways to inspect the result:
      console.log('Result:', result); // Basic logging
      console.dir(result, { depth: null }); // Detailed object inspection
      console.log('Result structure:', JSON.stringify(result, null, 2)); // Pretty printed JSON

      expect(result).toEqual(mockCreatedText);
      expect(mockTextModel.create).toHaveBeenCalledWith({
        content: 'Hello world',
        userId: 'user123',
        stats: mockStats,
      });
    });
  });

  describe('findbyId', () => {
    it('should find a text by id', async () => {
      const mockText = {
        _id: 'text123',
      };

      mockTextModel.findById.mockResolvedValue(mockText);

      const result = await repository.findById('text123');
      expect(result).toEqual(mockText);
      expect(mockTextModel.findById).toHaveBeenCalledWith('text123');
    });
  });

  describe('findAllByUserId', () => {
    it('should find all texts by user id', async () => {
      const mockText = [
        {
          _id: 'text123',
        },
        {
          _id: 'text456',
        },
      ];

      mockTextModel.find.mockResolvedValue(mockText);

      const result = await repository.findAllByUserId('user123');
      console.log(result, 'check');

      expect(result).toEqual(mockText);
      expect(mockTextModel.find).toHaveBeenCalledWith({ userId: 'user123' });
    });
  });

  describe('deleteById', () => {
    it('should delete a text by id', async () => {
      mockTextModel.findByIdAndDelete.mockResolvedValue({
        _id: 'text123',
      });
      const result = await repository.deleteById('text123');
      expect(result).toEqual(true);
      expect(mockTextModel.findByIdAndDelete).toHaveBeenCalledWith('text123');
    });
  });
});

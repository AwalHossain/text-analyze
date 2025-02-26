/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TextAnalyzerEntity } from './text.entity';

describe('TextAnalyzerEntity', () => {
  let entity: TextAnalyzerEntity;
  const sampleText =
    'The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.';
  const userId = 'test-user-id';

  beforeEach(() => {
    entity = new TextAnalyzerEntity(sampleText, userId);
  });

  describe('Constructor and Basic Properties', () => {
    it('should create an instance with normalized content', () => {
      const textWithExtraSpaces = '  The   quick  brown   fox  ';
      const analyzer = new TextAnalyzerEntity(textWithExtraSpaces, userId);
      expect(analyzer.content).toBe('The quick brown fox');
    });

    it('should store userId correctly', () => {
      expect(entity.userId).toBe(userId);
    });

    it('should generate consistent content hash', () => {
      const analyzer1 = new TextAnalyzerEntity(sampleText, userId);
      const analyzer2 = new TextAnalyzerEntity(sampleText, userId);
      expect(analyzer1.contentHash).toBe(analyzer2.contentHash);
    });
  });

  describe('Content Management', () => {
    it('should detect content changes', () => {
      const newContent = 'Different text';
      expect(entity.hasContentChanged(newContent)).toBe(true);
    });

    it('should not detect changes for same content with different spacing', () => {
      const sameContentDifferentSpacing =
        '  The quick   brown fox jumps over the lazy dog.    The lazy dog slept in the sun.  ';
      expect(entity.hasContentChanged(sameContentDifferentSpacing)).toBe(false);
    });

    it('should update content when different', () => {
      const newContent = 'Different text';
      const wasUpdated = entity.updateContent(newContent);
      expect(wasUpdated).toBe(true);
      expect(entity.content).toBe('Different text');
    });

    it('should not update content when same', () => {
      const wasUpdated = entity.updateContent(sampleText);
      expect(wasUpdated).toBe(false);
    });
  });

  describe('Text Analysis', () => {
    describe('getWordCount', () => {
      it('should count words correctly', async () => {
        const count = await entity.getWordCount();
        expect(count).toBe(16); // The sample text has 16 words
      });

      it('should handle empty text', async () => {
        const emptyAnalyzer = new TextAnalyzerEntity('', userId);
        const count = await emptyAnalyzer.getWordCount();
        expect(count).toBe(0);
      });
    });

    describe('getCharacterCount', () => {
      it('should count characters correctly (excluding spaces)', async () => {
        const count = await entity.getCharacterCount();
        expect(count).toBe(60); // Count of characters excluding spaces
      });

      it('should handle empty text', async () => {
        const emptyAnalyzer = new TextAnalyzerEntity('', userId);
        const count = await emptyAnalyzer.getCharacterCount();
        expect(count).toBe(0);
      });
    });

    describe('getSentenceCount', () => {
      it('should count sentences correctly', async () => {
        const count = await entity.getSentenceCount();
        expect(count).toBe(2); // The sample text has 2 sentences
      });

      it('should handle multiple sentence endings', async () => {
        const multiSentence = new TextAnalyzerEntity(
          'Hello! How are you? I am fine.',
          userId,
        );
        const count = await multiSentence.getSentenceCount();
        expect(count).toBe(3);
      });
    });

    describe('getParagraphCount', () => {
      it('should count single paragraph correctly', async () => {
        const count = await entity.getParagraphCount();
        expect(count).toBe(1);
      });

      it('should count multiple paragraphs correctly', async () => {
        const multiParagraph = new TextAnalyzerEntity(
          'First paragraph.\n\n\nSecond paragraph.\n\n\nThird paragraph.',
          userId,
        );
        const count = await multiParagraph.getParagraphCount();
        expect(count).toBe(3);
      });
    });

    describe('getLongestWords', () => {
      it('should find longest words correctly', async () => {
        const words = await entity.getLongestWords();
        expect(words).toEqual(['quick', 'brown', 'jumps', 'slept']);
      });

      it('should return multiple words of same length', async () => {
        const textWithEqualLengths = new TextAnalyzerEntity(
          'hello world words',
          userId,
        );
        const words = await textWithEqualLengths.getLongestWords();
        expect(words).toEqual(['hello', 'world', 'words']);
      });
    });

    describe('getAnalyzeText', () => {
      it('should return complete text analysis', async () => {
        const stats = await entity.getAnalyzeText();
        expect(stats).toEqual({
          wordCount: 16,
          characterCount: 60,
          sentenceCount: 2,
          paragraphCount: 1,
          longestWords: expect.any(Array),
        });
      });

      it('should cache results', async () => {
        const firstAnalysis = await entity.getAnalyzeText();
        const secondAnalysis = await entity.getAnalyzeText();
        expect(secondAnalysis).toEqual(firstAnalysis); // Should be the same object reference
      });

      it('should invalidate cache on content update', async () => {
        const firstAnalysis = await entity.getAnalyzeText();
        entity.updateContent('New content');
        const secondAnalysis = await entity.getAnalyzeText();
        expect(secondAnalysis).not.toBe(firstAnalysis);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle null content gracefully', () => {
      expect(() => new TextAnalyzerEntity(null as any, userId)).not.toThrow();
    });

    it('should handle undefined content gracefully', () => {
      expect(
        () => new TextAnalyzerEntity(undefined as any, userId),
      ).not.toThrow();
    });
  });
});

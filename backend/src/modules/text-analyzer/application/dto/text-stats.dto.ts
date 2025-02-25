import { ApiProperty } from '@nestjs/swagger';

export interface TextStats {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  longestWords: string[];
  //   shortestWords: string[];
  //   averageWordLength: number;
  //   mostFrequentWords: string[];
  //   leastFrequentWords: string[];
  //   wordFrequency: Record<string, number>;
  //   wordLengthFrequency: Record<number, number>;
}

export class TextStatsDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  stats: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    longestWords: string[];
  };
}

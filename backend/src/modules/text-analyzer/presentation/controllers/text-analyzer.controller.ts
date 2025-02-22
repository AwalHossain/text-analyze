import { CreateTextDto } from '../../application/dto/create-text.dto';
import { TextAnalyzerService } from '../../application/services/text-analyer.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TextStatsDto } from '../../application/dto/text-stats.dto';

@ApiTags('Text Analyzer')
@Controller()
export class TextAnalyzerController {
  private readonly logger = new Logger(TextAnalyzerController.name);
  constructor(private readonly textAnalerService: TextAnalyzerService) {}

  @Post()
  @ApiOperation({ summary: 'Create and analyze a new text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The text has been successfully created and analyzed.',
    type: TextStatsDto,
  })
  async analyzeText(@Body() createTextDto: CreateTextDto) {
    const savedText = await this.textAnalerService.analyzeText(createTextDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'The text has been successfully created and analyzed.',
      data: savedText,
    };
  }

  @Post('analyze/words')
  @ApiOperation({ summary: 'Analyze words in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The words in the text have been successfully analyzed.',
  })
  async getWordCount(@Body() createTextDto: CreateTextDto) {
    const wordCount = await this.textAnalerService.getWordCount(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The words in the text have been successfully analyzed.',
      data: wordCount,
    };
  }

  @Post('analyze/characters')
  @ApiOperation({ summary: 'Analyze characters in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The characters in the text have been successfully analyzed.',
  })
  async getCharacterCount(@Body() createTextDto: CreateTextDto) {
    const characterCount = await this.textAnalerService.getCharacterCount(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The characters in the text have been successfully analyzed.',
      data: characterCount,
    };
  }

  @Post('analyze/sentences')
  @ApiOperation({ summary: 'Analyze sentences in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The sentences in the text have been successfully analyzed.',
  })
  async getSentenceCount(@Body() createTextDto: CreateTextDto) {
    const sentenceCount = await this.textAnalerService.getSentenceCount(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The sentences in the text have been successfully analyzed.',
      data: sentenceCount,
    };
  }

  @Post('analyze/paragraphs')
  @ApiOperation({ summary: 'Analyze paragraphs in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The paragraphs in the text have been successfully analyzed.',
  })
  async getParagraphCount(@Body() createTextDto: CreateTextDto) {
    const paragraphCount = await this.textAnalerService.getParagraphCount(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    console.log('paragraphCount', paragraphCount);
    this.logger.log('paragraphCount', paragraphCount);
    return {
      statusCode: HttpStatus.OK,
      message: 'The paragraphs in the text have been successfully analyzed.',
      data: paragraphCount,
    };
  }

  @Post('analyze/longest-words')
  @ApiOperation({ summary: 'Analyze the longest words in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The longest words in the text have been successfully analyzed.',
  })
  async getLongestWords(@Body() createTextDto: CreateTextDto) {
    const longestWords = await this.textAnalerService.getLongestWords(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The longest words in the text have been successfully analyzed.',
      data: longestWords,
    };
  }

  @Post('analyze/analyze-text')
  @ApiOperation({ summary: 'Analyze the text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The text has been successfully analyzed.',
  })
  async getAnalyzeText(@Body() createTextDto: CreateTextDto) {
    const analyzeText = await this.textAnalerService.getAnalyzeText(
      createTextDto.content,
      createTextDto.userId || 'temp-user-id',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The text has been successfully analyzed.',
      data: analyzeText,
    };
  }

  // get all analyze by user id
  @Get('analyze/all')
  @ApiOperation({ summary: 'Get all analyze by user id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The analyze has been successfully retrieved.',
  })
  async getAllAnalyzeByUserId() {
    const userId = 'temp-user-id';
    const allAnalyze =
      await this.textAnalerService.getAllAnalyzeByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'The analyze has been successfully retrieved.',
      data: allAnalyze,
    };
  }
}

import { CreateTextDto } from '../../application/dto/create-text.dto';
import { TextAnalyzerService } from '../../application/services/text-analyer.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TextStatsDto } from '../../application/dto/text-stats.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('Text Analyzer')
@Controller()
@UseGuards(JwtAuthGuard)
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
  async analyzeText(@Body() content: string, @User('userId') userId: string) {
    const savedText = await this.textAnalerService.analyzeText(content, userId);
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
  async getWordCount(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const wordCount = await this.textAnalerService.getWordCount(
      content,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The words in the text have been successfully analyzed.',
      data: {
        type: 'words',
        count: wordCount,
      },
    };
  }

  @Post('analyze/characters')
  @ApiOperation({ summary: 'Analyze characters in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The characters in the text have been successfully analyzed.',
  })
  async getCharacterCount(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const characterCount = await this.textAnalerService.getCharacterCount(
      content,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The characters in the text have been successfully analyzed.',
      data: {
        type: 'characters',
        count: characterCount,
      },
    };
  }

  @Post('analyze/sentences')
  @ApiOperation({ summary: 'Analyze sentences in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The sentences in the text have been successfully analyzed.',
  })
  async getSentenceCount(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const sentenceCount = await this.textAnalerService.getSentenceCount(
      content,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The sentences in the text have been successfully analyzed.',
      data: {
        type: 'sentences',
        count: sentenceCount,
      },
    };
  }

  @Post('analyze/paragraphs')
  @ApiOperation({ summary: 'Analyze paragraphs in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The paragraphs in the text have been successfully analyzed.',
  })
  async getParagraphCount(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const paragraphCount = await this.textAnalerService.getParagraphCount(
      content,
      userId,
    );
    console.log('paragraphCount', paragraphCount);
    this.logger.log('paragraphCount', paragraphCount);
    return {
      statusCode: HttpStatus.OK,
      message: 'The paragraphs in the text have been successfully analyzed.',
      data: {
        type: 'paragraphs',
        count: paragraphCount,
      },
    };
  }

  @Post('analyze/longestWord')
  @ApiOperation({ summary: 'Analyze the longest words in a text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'The longest words in the text have been successfully analyzed.',
  })
  async getLongestWords(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const longestWords = await this.textAnalerService.getLongestWords(
      content,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'The longest words in the text have been successfully analyzed.',
      data: {
        type: 'longestWord',
        count: longestWords,
      },
    };
  }

  @Post('analyze/text')
  @ApiOperation({ summary: 'Analyze the text' })
  @ApiBody({ type: CreateTextDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The text has been successfully analyzed.',
  })
  async getAnalyzeText(
    @Body('content') content: string,
    @User('userId') userId: string,
  ) {
    const analyzeText = await this.textAnalerService.analyzeText(
      content,
      userId,
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
  async getAllAnalyzeByUserId(@User('userId') userId: string) {
    const allAnalyze =
      await this.textAnalerService.getAllAnalyzeByUserId(userId);
    console.log('allAnalyze', allAnalyze);
    return {
      statusCode: HttpStatus.OK,
      message: 'The analyze has been successfully retrieved.',
      data: allAnalyze,
    };
  }
}

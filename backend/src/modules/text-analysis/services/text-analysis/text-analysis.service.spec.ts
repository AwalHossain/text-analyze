import { Test, TestingModule } from '@nestjs/testing';
import { TextAnalysisService } from './text-analysis.service';

describe('TextAnalysisService', () => {
  let service: TextAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextAnalysisService],
    }).compile();

    service = module.get<TextAnalysisService>(TextAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

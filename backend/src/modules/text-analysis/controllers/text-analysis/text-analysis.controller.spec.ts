import { Test, TestingModule } from '@nestjs/testing';
import { TextAnalysisController } from './text-analysis.controller';

describe('TextAnalysisController', () => {
  let controller: TextAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextAnalysisController],
    }).compile();

    controller = module.get<TextAnalysisController>(TextAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

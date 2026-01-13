import { Test, TestingModule } from '@nestjs/testing';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankController', () => {
  let controller: QuestionBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionBankController],
      providers: [QuestionBankService],
    }).compile();

    controller = module.get<QuestionBankController>(QuestionBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

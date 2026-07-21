import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentSessionController } from './assessment-session.controller';
import { AssessmentSessionService } from './assessment-session.service';

describe('AssessmentSessionController', () => {
  let controller: AssessmentSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentSessionController],
      providers: [AssessmentSessionService],
    }).compile();

    controller = module.get<AssessmentSessionController>(AssessmentSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

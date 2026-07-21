import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentSessionService } from './assessment-session.service';

describe('AssessmentSessionService', () => {
  let service: AssessmentSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentSessionService],
    }).compile();

    service = module.get<AssessmentSessionService>(AssessmentSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

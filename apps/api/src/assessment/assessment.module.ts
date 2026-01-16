import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { QuestionBankModule } from 'src/question-bank/question-bank.module';
import { ExamController } from './exam.controller';
import { AssessmentRepository } from './repository/assessment.repository';

@Module({
  imports: [QuestionBankModule],
  controllers: [AssessmentController, ExamController],
  providers: [AssessmentService, AssessmentRepository],
  exports: [AssessmentRepository]
})
export class AssessmentModule {}

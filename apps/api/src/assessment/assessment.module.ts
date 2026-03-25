import { Module, forwardRef } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { QuestionBankModule } from 'src/question-bank/question-bank.module';
import { ExamController } from './exam.controller';
import { AssessmentRepository } from './repository/assessment.repository';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { AssessmentExportService } from './assessment.export.service';

@Module({
  imports: [
    QuestionBankModule,
    forwardRef(() => SubmissionsModule)
  ],
  controllers: [AssessmentController, ExamController],
  providers: [AssessmentService, AssessmentRepository, AssessmentExportService],
  exports: [AssessmentRepository]
})
export class AssessmentModule {}

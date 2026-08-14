import { Module, forwardRef } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { QuestionBankModule } from 'src/question-bank/question-bank.module';
import { ExamController } from './exam.controller';
import { AssessmentRepository } from './repository/assessment.repository';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { AssessmentExportService } from './assessment.export.service';
import { I_ASSESSMENT_REPOSITORY } from './port/assessment.repository.interface';
import { I_SESSION_GATEWAY } from './port/session.gateway.port';
import { SessionServiceAdapter } from './adapter/session.gateway.adapter';
import { I_QUESTION_BANK_GATEWAY } from './port/question-bank.gateway.port';
import { QuestionBankGatewayAdapter } from './adapter/question-bank.gateway.adapter';
import { AssessmentSessionModule } from 'src/assessment-session/assessment-session.module';
import { I_SUBMISSION_GATEWAY } from './port/submission.gateway.port';
import { SubmissionGatewayAdapter } from './adapter/submission.gateway.adapter';

@Module({
  imports: [
    QuestionBankModule,
    SubmissionsModule,
    AssessmentSessionModule,
  ],
  controllers: [AssessmentController, ExamController],
  providers: [
    AssessmentService, 
    AssessmentRepository, 
    AssessmentExportService,
    {
      provide: I_ASSESSMENT_REPOSITORY,
      useClass: AssessmentRepository
    },
    {
      provide: I_SESSION_GATEWAY,
      useClass: SessionServiceAdapter
    },
    {
      provide: I_QUESTION_BANK_GATEWAY,
      useClass: QuestionBankGatewayAdapter
    },
    {
      provide: I_SUBMISSION_GATEWAY,
      useClass: SubmissionGatewayAdapter,
    },
  ],
  exports: [AssessmentRepository]
})
export class AssessmentModule {}

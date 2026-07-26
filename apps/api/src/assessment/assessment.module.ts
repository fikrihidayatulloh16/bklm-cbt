import { Module, forwardRef } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { QuestionBankModule } from 'src/question-bank/question-bank.module';
import { ExamController } from './exam.controller';
import { AssessmentRepository } from './repository/assessment.repository';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { AssessmentExportService } from './assessment.export.service';
import { AssessmentSessionModule } from 'src/assessment-session/assessment-session.module';
import { I_SESSION_GATEWAY } from './port/session.gateway.port';
import { SessionServiceAdapter } from './adapter/session.gateway.adapter';

@Module({
  imports: [
    QuestionBankModule,
    forwardRef(() => SubmissionsModule),
    AssessmentSessionModule
  ],
  controllers: [AssessmentController, ExamController],
  providers: [
    AssessmentService, 
    AssessmentRepository, 
    AssessmentExportService,
    {
      provide: I_SESSION_GATEWAY,
      useClass: SessionServiceAdapter,      // 👈 NestJS, tolong gunakan Adapter ini untuk Gateway
    }
  ],
  exports: [AssessmentRepository]
})
export class AssessmentModule {}

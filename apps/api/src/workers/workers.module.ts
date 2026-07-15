import { Module } from '@nestjs/common';
import { AssessmentSyncWorker } from './assessment-sync.worker';
import { SubmissionsModule } from 'src/submissions/submissions.module';

@Module({
  // PrismaModule wajib di-import jika PrismaService Anda tidak Global
  // imports: [PrismaModule], 
  imports: [SubmissionsModule],
  providers: [AssessmentSyncWorker],
})
export class WorkersModule {}
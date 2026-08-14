// apps/api/src/assessment/adapters/submission-gateway.adapter.ts
import { Injectable } from '@nestjs/common';
import { ISubmissionGateway } from '../port/submission.gateway.port';
import { SubmissionsService } from '../../submissions/submissions.service';

@Injectable()
export class SubmissionGatewayAdapter implements ISubmissionGateway {
  constructor(private readonly submissionService: SubmissionsService) {}

  async forceCloseSubmissions(assessmentId: string): Promise<{ closed_count: number }> {
    // Memanggil fungsi asli yang ada di SubmissionService
    return await this.submissionService.forceCloseTimeouts(assessmentId);
  }
}
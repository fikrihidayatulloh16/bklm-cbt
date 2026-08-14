// apps/api/src/assessment/ports/submission.gateway.port.ts
export const I_SUBMISSION_GATEWAY = Symbol('I_SUBMISSION_GATEWAY');

export interface ISubmissionGateway {
  forceCloseSubmissions(assessmentId: string): Promise<{ closed_count: number }>;
}
// apps/api/src/assessment/port/session.gateway.port.ts
export const I_SESSION_GATEWAY = Symbol('I_SESSION_GATEWAY');

// Submission hanya peduli pada dua hal ini untuk memvalidasi ujian
export interface CreataeSessionPayload {
  assessmentId: string;
  sessionName: string;
  durationMs: number;
  endTime: Date;
  classIds: string[];
}

export interface SessionValidationInfo {
  endTime: Date;
  classIds: string[];
}

export interface ISessionGateway {
  getSession(assessmentId: string): Promise<SessionValidationInfo | null>;
  // createSession(payload: CreataeSessionPayload): Promise<void>;
  createSessionForPublish(
    assessmentId: string,
    sessionName: string,
    durationMs: number,
    classIds: string[]
  ): Promise<void>;
}
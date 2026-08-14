// apps/api/src/submissions/ports/session.gateway.port.ts
export const I_SESSION_GATEWAY = Symbol('I_SESSION_GATEWAY');

// Submission hanya peduli pada dua hal ini untuk memvalidasi ujian
export interface SessionValidationInfo {
  endTime: Date;
  classIds: string[];
}

export interface ISessionGateway {
  getSession(sessionId: string): Promise<SessionValidationInfo | null>;
}
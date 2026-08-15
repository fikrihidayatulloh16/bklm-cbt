// apps/api/src/common/event/volatile.event.ts

export class DataUpdatedEvent {
  constructor(
    public readonly entity: string,    // Contoh: 'assessments', 'question_banks', 'dashboard'
    public readonly entityId: string,  // Contoh: ID User (karena dashboard per-user)
  ) {}
}
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('GET /submissions/:assessment_id/timeleft (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-timer-1';
  const userId = 'user-timer-1';
  let sessionActiveId = `session-active-${Date.now()}`;
  let sessionTimeoutId = `session-timeout-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    seeder = new E2eSeeder(prisma);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await seeder.cleanDatabase();
    
    // --- Pastikan classId dinamis dideklarasikan di sini ---
    const classId = `class-${Date.now()}`;
    
    await seeder.seedMasterData(schoolId, userId);
    await seeder.seedClass(classId, 'A', 'VII', schoolId);

    // 1. Siapkan Assessment
    await seeder.seedAssessment('assess-timer-active', userId, schoolId, 10, 'PUBLISHED');
    await seeder.seedAssessment('assess-timer-timeout', userId, schoolId, 10 ,'CLOSED');
    await seeder.seedAssessment('assess-timer-draft', userId, schoolId, 10, 'DRAFT');

    // 🔥 2. SIAPKAN SESI UJIAN AGAR GET_TIMER BISA JALAN!
    const now = new Date();
    // const classId = `class-${Date.now()}`; // Pastikan ada classId dinamis

    // Buat Sesi Aktif (Untuk TC01)
    await seeder.seedCreateAssessmentSession(
      sessionActiveId,
      new Date(now.getTime() - 10000), 
      new Date(now.getTime() + 3600000), // 1 jam ke depan
      'assess-timer-active', 
      classId
    );

    // Buat Sesi Timeout (Untuk TC02)
    await seeder.seedCreateAssessmentSession(
      sessionTimeoutId,
      new Date(now.getTime() - 100000), 
      new Date(now.getTime() - 50000), // Sudah lewat
      'assess-timer-timeout', 
      classId
    );
  });

  it('TC01 SUBS TIMER ✅ [SUCCESS] GIVEN assessment aktif, WHEN hit timer, THEN return 200 & sisa waktu valid', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-active/session/${sessionActiveId}/timeleft`);

    const responseData = response.body.data || response.body; // Adaptif: pakai .data kalau ada, kalau tidak pakai body langsung

    if (response.status !== 200) {
      console.log('TC01 SUBS TIMER ERROR DARI SERVICE:', response.body);
    }

    expect(response.status).toBe(200);
    expect(responseData.deadline_date).toBeDefined();
    expect(responseData.remaining_ms).toBeGreaterThan(0);
  });

  it('TC02 SUBS TIMER ✅ [SUCCESS] GIVEN assessment sudah timeout, WHEN hit timer, THEN return 200 & sisa waktu = 0', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-timeout/session/${sessionTimeoutId}/timeleft`)

    const responseData = response.body.data || response.body;

    if (response.status !== 200) {
      console.log('C02 SUBS TIMER ERROR DARI SERVICE:', response.body);
    }

    expect(response.status).toBe(200);
    expect(responseData.deadline_date).toBeDefined();
    // Karena waktu minus di-set jadi 0 di Service, nilainya harus tepat 0
    expect(responseData.remaining_ms).toBe(0);
  });

  it('TC03 SUBS TIMER ❌ [FAIL] GIVEN assessment masih berbentuk draft (tanpa expired_at), WHEN hit timer, THEN return 403', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-draft/session/${sessionActiveId}/timeleft`)
      .expect(403);

    expect(response.body.message).toBe('Assessment belum dibuka (DRAFT)');
  });

  it('TC04 SUBS TIMER ❌ [FAIL] GIVEN assessment tidak ditemukan, WHEN hit timer, THEN return 404', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assessment-gaib-123/session/${sessionActiveId}/timeleft`)
      .expect(404);

    expect(response.body.message).toBe('Assessment tidak ditemukan');
  });
});
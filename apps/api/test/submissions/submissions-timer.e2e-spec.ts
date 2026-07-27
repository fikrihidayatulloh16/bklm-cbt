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
    await seeder.seedMasterData(schoolId, userId);

    // Siapkan 3 jenis Assessment untuk diuji
    await seeder.seedAssessment('assess-timer-active', userId, schoolId, 10, 'PUBLISHED');
    await seeder.seedAssessment('assess-timer-timeout', userId, schoolId, 10 ,'CLOSED');
    await seeder.seedAssessment('assess-timer-draft', userId, schoolId, 10, 'DRAFT');
  });

  it('✅ [SUCCESS] GIVEN assessment aktif, WHEN hit timer, THEN return 200 & sisa waktu valid', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-active/timeleft`)
      .expect(200);

    const responseData = response.body.data || response.body; // Adaptif: pakai .data kalau ada, kalau tidak pakai body langsung

    expect(responseData.deadline_date).toBeDefined();
    expect(responseData.remaining_ms).toBeGreaterThan(0);
  });

  it('✅ [SUCCESS] GIVEN assessment sudah timeout, WHEN hit timer, THEN return 200 & sisa waktu = 0', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-timeout/timeleft`)
      .expect(200);

    const responseData = response.body.data || response.body;

    expect(responseData.deadline_date).toBeDefined();
    // Karena waktu minus di-set jadi 0 di Service, nilainya harus tepat 0
    expect(responseData.remaining_ms).toBe(0);
  });

  it('❌ [FAIL] GIVEN assessment masih berbentuk draft (tanpa expired_at), WHEN hit timer, THEN return 403', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assess-timer-draft/timeleft`)
      .expect(403);

    expect(response.body.message).toBe('Assessment belum dibuka (DRAFT)');
  });

  it('❌ [FAIL] GIVEN assessment tidak ditemukan, WHEN hit timer, THEN return 404', async () => {
    const response = await request(app.getHttpServer())
      .get(`/submissions/assessment-gaib-123/timeleft`)
      .expect(404);

    expect(response.body.message).toBe('Assessment tidak ditemukan');
  });
});
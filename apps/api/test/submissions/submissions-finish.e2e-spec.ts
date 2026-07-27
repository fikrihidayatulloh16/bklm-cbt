// test/submissions-finish.e2e-spec.ts
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('PUT /submissions/:id/finish (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-finish-1';
  const userId = 'user-finish-1';

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

    // 1. Data untuk Skenario Aktif & Incomplete
    await seeder.seedAssessment('assess-active', userId, schoolId, 10,'PUBLISHED');
    await seeder.seedQuestion('q-finish-1', 'assess-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestion('q-finish-2', 'assess-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-1', 'q-finish-1', 'Ya', 10);
    await seeder.seedQuestionOption('opt-2', 'q-finish-2', 'Ya', 10);
    
    await seeder.seedSubmission('sub-incomplete', 'assess-active', 'IN_PROGRESS');
    await seeder.seedSubmission('sub-complete', 'assess-active', 'IN_PROGRESS');
    await seeder.seedSubmission('sub-already-finished', 'assess-active', 'FINISHED');

    // 2. Data untuk Skenario Timeout
    await seeder.seedAssessment('assess-timeout', userId, schoolId, 10, 'CLOSED');
    await seeder.seedSubmission('sub-timeout', 'assess-timeout', 'IN_PROGRESS');
  });

  it('❌ [FAIL] GIVEN waktu masih ada & jawaban belum lengkap, WHEN finish, THEN return 400', async () => {
    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-incomplete/finish`)
      .expect(400);

    expect(response.body.message).toContain('Waktu masih tersedia! Silakan lengkapi');
  });

  it('✅ [SUCCESS] GIVEN jawaban lengkap & waktu masih ada, WHEN finish, THEN return 200 & skor dihitung', async () => {
    await request(app.getHttpServer()).put(`/submissions/sub-complete/answer`)
      .send({ question_id: 'q-finish-1', option_id: 'opt-1', status_answer: true }).expect(201);
      
    await request(app.getHttpServer()).put(`/submissions/sub-complete/answer`)
      .send({ question_id: 'q-finish-2', option_id: 'opt-2', status_answer: true }).expect(201);

    await request(app.getHttpServer())
      .put(`/submissions/sub-complete/finish`)
      .expect(200);
  });

  it('✅ [SUCCESS] GIVEN waktu sudah habis tapi belum dijawab, WHEN finish, THEN return 200 (Selesai Paksa)', async () => {
    await request(app.getHttpServer())
      .put(`/submissions/sub-timeout/finish`)
      .expect(200);
  });

  it('❌ [FAIL] GIVEN status ujian sudah FINISHED, WHEN finish, THEN return 400', async () => {
    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-already-finished/finish`)
      .expect(400);

    expect(response.body.message).toBe('Submission sudah selesai.');
  });
});
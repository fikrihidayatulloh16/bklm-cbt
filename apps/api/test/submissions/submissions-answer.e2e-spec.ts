// apps/api/test/submissions/submissions-answer.e2e-spec.ts
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('PUT /submissions/:id/answer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-ans-1';
  const userId = 'user-ans-1';

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

    // 1. Data Ujian Aktif (Normal)
    await seeder.seedAssessment('assess-ans-active', userId, schoolId, 'ACTIVE');
    await seeder.seedQuestion('q-valid', 'assess-ans-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-valid', 'q-valid', 'Ya', 10);
    
    await seeder.seedSubmission('sub-ans-active', 'assess-ans-active', 'IN_PROGRESS');
    await seeder.seedSubmission('sub-ans-finished', 'assess-ans-active', 'FINISHED');

    // 2. Data Ujian Expired / Timeout
    await seeder.seedAssessment('assess-ans-timeout', userId, schoolId, 'TIMEOUT');
    await seeder.seedQuestion('q-nyasar', 'assess-ans-timeout', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-nyasar', 'q-nyasar', 'Ya', 10);
    
    await seeder.seedSubmission('sub-ans-timeout', 'assess-ans-timeout', 'IN_PROGRESS');
  });

  it('✅ [SUCCESS] GIVEN submission aktif & soal valid, WHEN simpan jawaban, THEN return 201 (Created)', async () => {
    const payload = {
      question_id: 'q-valid',
      option_id: 'opt-valid',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-active/answer`)
      .send(payload)
      .expect(201);

    expect(response.body.statuscode).toBe(201);
    expect(response.body.message).toBe('Answer updated Successfully');
    expect(response.body.data.question_id).toBe('q-valid');
  });

  it('❌ [FAIL] GIVEN submission berstatus FINISHED, WHEN simpan jawaban, THEN return 403 (Forbidden)', async () => {
    const payload = {
      question_id: 'q-valid',
      option_id: 'opt-valid',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-finished/answer`)
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Ujian sudah ditutup.');
  });

  it('❌ [FAIL] GIVEN soal bukan milik ujian tersebut, WHEN simpan jawaban, THEN return 400 (Bad Request)', async () => {
    const payload = {
      question_id: 'q-nyasar', // Soal ini milik assess-ans-timeout
      option_id: 'opt-nyasar',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-active/answer`) // Tapi dijawab oleh siswa di assess-ans-active
      .send(payload)
      .expect(400);

    expect(response.body.message).toBe('Pertanyaan ini bukan bagian dari ujian ini!');
  });

  it('❌ [FAIL] GIVEN waktu ujian > 2 menit dari expired_at, WHEN simpan jawaban, THEN return 403 (Waktu Habis)', async () => {
    const payload = {
      question_id: 'q-nyasar',
      option_id: 'opt-nyasar',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-timeout/answer`) // Waktu ujian ini sudah diatur mundur 3 menit di Seeder
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Waktu ujian telah habis! Jawaban tidak tersimpan.');
  });
});
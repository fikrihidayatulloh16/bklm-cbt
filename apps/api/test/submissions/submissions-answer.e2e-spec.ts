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
  const classId = 'class-start-1';
  const sessionId = 'session-start-2'
  let sessionExpiredId = `session-start-expired-${Date.now()}`;

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

    await seeder.seedClass(classId, 'A', 'VII', schoolId)

    // 1. Data Ujian Aktif (Normal)
    await seeder.seedAssessment('assess-ans-active', userId, schoolId, 10, 'PUBLISHED');

    const now = new Date();
    const pastStartTime = new Date(now.getTime() - 10000); // 10 detik yang lalu
    
    // 🔥 UBAH INI: Agar Sesi masih berlaku, jadikan 1 jam ke depan
    const futureEndTime = new Date(now.getTime() + 3600000000); 

    const pastEndTime = new Date(now.getTime() - (5 * 60 * 1000));

    await seeder.seedCreateAssessmentSession(
      sessionId,
      pastStartTime, // ✅ START TIME (Masa lalu)
      futureEndTime, // ✅ END TIME (Masa depan)
      'assess-ans-active',
      classId
    );

    await seeder.seedCreateAssessmentSession(
      sessionExpiredId,
      pastStartTime, // ✅ START TIME (Masa lalu)
      pastEndTime, // ✅ END TIME (Masa depan)
      'assess-ans-active',
      classId
    );

    await seeder.seedQuestion('q-valid', 'assess-ans-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-valid', 'q-valid', 'Ya', 10);
    
    await seeder.seedSubmission('sub-ans-active', 'assess-ans-active', 'IN_PROGRESS', 'Fikri', classId, 'VII A', sessionId);
    await seeder.seedSubmission('sub-ans-finished', 'assess-ans-active', 'FINISHED', 'Fikri', classId, 'VII A', sessionId);

    

    // 2. Data Ujian Expired / Timeout
    await seeder.seedAssessment('assess-ans-timeout', userId, schoolId, 10,'CLOSED');
    await seeder.seedQuestion('q-nyasar', 'assess-ans-timeout', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-nyasar', 'q-nyasar', 'Ya', 10);
    
    await seeder.seedSubmission(
      'sub-ans-timeout',
      'assess-ans-timeout',
      'IN_PROGRESS',
      'Fikri',
      classId,
      'VII A',
      sessionExpiredId // 🔥 WAJIB GUNAKAN ID SESI YANG WAKTUNYA SUDAH LEWAT/BASI!
    );
    
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

      if (response.status !== 201) {
        console.log('SUBS-answer-TC01 ERROR DARI SERVICE:', response.body);
      }

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

      if (response.status !== 400) {
        console.log('SUBS-answer-TC02 ERROR DARI SERVICE:', response.body);
      }
    
    expect(response.status).toBe(400);

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
      .expect(400);

    expect(response.body.message).toBe('Waktu ujian telah habis secara absolut! Jawaban tidak tersimpan.');
  });
});
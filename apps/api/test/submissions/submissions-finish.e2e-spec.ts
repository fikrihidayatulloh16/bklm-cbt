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
  let classId: string;
  let sessionActiveId: string;
  let sessionTimeoutId: string;

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
    
    // Siapkan ID dinamis
    classId = `class-${Date.now()}`;
    sessionActiveId = `session-active-${Date.now()}`;
    sessionTimeoutId = `session-timeout-${Date.now()}`;

    await seeder.seedMasterData(schoolId, userId);
    await seeder.seedClass(classId, 'A', 'VII', schoolId); // 🔥 WAJIB: Buat Kelas

    // 1. Data untuk Skenario Aktif & Incomplete
    await seeder.seedAssessment('assess-active', userId, schoolId, 10, 'PUBLISHED');
    
    // 🔥 SIAPKAN SESI AKTIF (1 Jam Ke Depan)
    const now = new Date();
    await seeder.seedCreateAssessmentSession(
      sessionActiveId,
      new Date(now.getTime() - 10000), 
      new Date(now.getTime() + 3600000), 
      'assess-active', 
      classId
    );

    await seeder.seedQuestion('q-finish-1', 'assess-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestion('q-finish-2', 'assess-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('opt-1', 'q-finish-1', 'Ya', 10);
    await seeder.seedQuestionOption('opt-2', 'q-finish-2', 'Ya', 10);
    
    // 🔥 PERBAIKI 7 ARGUMEN SEEDER SUBMISSION! (Sesuai e2e-seeder.ts)
    await seeder.seedSubmission('sub-incomplete', 'assess-active', 'IN_PROGRESS', 'Fikri 1', classId, 'VII A', sessionActiveId);
    await seeder.seedSubmission('sub-complete', 'assess-active', 'IN_PROGRESS', 'Fikri 2', classId, 'VII A', sessionActiveId);
    await seeder.seedSubmission('sub-already-finished', 'assess-active', 'FINISHED', 'Fikri 3', classId, 'VII A', sessionActiveId);

    // 2. Data untuk Skenario Timeout
    await seeder.seedAssessment('assess-timeout', userId, schoolId, 10, 'CLOSED');
    
    // 🔥 SIAPKAN SESI TIMEOUT (Sudah Lewat)
    await seeder.seedCreateAssessmentSession(
      sessionTimeoutId,
      new Date(now.getTime() - 100000), 
      new Date(now.getTime() - 50000), 
      'assess-timeout', 
      classId
    );

    // 🔥 PERBAIKI 7 ARGUMEN SEEDER SUBMISSION TIMEOUT!
    await seeder.seedSubmission('sub-timeout', 'assess-timeout', 'IN_PROGRESS', 'Fikri Timeout', classId, 'VII A', sessionTimeoutId);
  });

  it('❌ [FAIL] GIVEN waktu masih ada & jawaban belum lengkap, WHEN finish, THEN return 400', async () => {
    const response = await request(app.getHttpServer())
      // 🔥 TAMBAHKAN /session/:session_id
      .put(`/submissions/sub-incomplete/session/${sessionActiveId}/finish`)
      .expect(400);

    expect(response.body.message).toContain('Waktu masih tersedia! Silakan lengkapi');
  });

  it('✅ [SUCCESS] GIVEN jawaban lengkap & waktu masih ada, WHEN finish, THEN return 200 & skor dihitung', async () => {
    // Ingat: Jika endpoint 'answer' Anda juga butuh session_id, tambahkan.
    // Jika tidak butuh session_id, biarkan saja. Saya asumsikan ini endpoint bawaan:
    await request(app.getHttpServer()).put(`/submissions/sub-complete/answer`)
      .send({ question_id: 'q-finish-1', option_id: 'opt-1', status_answer: true }).expect(201);
      
    await request(app.getHttpServer()).put(`/submissions/sub-complete/answer`)
      .send({ question_id: 'q-finish-2', option_id: 'opt-2', status_answer: true }).expect(201);

    await request(app.getHttpServer())
      // 🔥 TAMBAHKAN /session/:session_id
      .put(`/submissions/sub-complete/session/${sessionActiveId}/finish`)
      .expect(200);
  });

  it('✅ [SUCCESS] GIVEN waktu sudah habis tapi belum dijawab, WHEN finish, THEN return 200 (Selesai Paksa)', async () => {
    await request(app.getHttpServer())
      // 🔥 GUNAKAN sessionTimeoutId UNTUK SKENARIO INI
      .put(`/submissions/sub-timeout/session/${sessionTimeoutId}/finish`)
      .expect(200);
  });

  it('❌ [FAIL] GIVEN status ujian sudah FINISHED, WHEN finish, THEN return 400', async () => {
    const response = await request(app.getHttpServer())
      // 🔥 TAMBAHKAN /session/:session_id
      .put(`/submissions/sub-already-finished/session/${sessionActiveId}/finish`)
      .expect(400);

    // Pastikan string ini sama persis dengan yang dilempar oleh Domain validateCanFinish Anda
    expect(response.body.message).toBe('Submission sudah selesai.'); 
  });
});
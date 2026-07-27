const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('POST /submissions/:assessment_id/start (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-start-1';
  const userId = 'user-start-1';
  
  // Variabel ID Assessment
  const assessActiveId = 'assess-start-active';
  const assessExpiredId = 'assess-start-expired';

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

    // 1. Assessment Aktif (Waktu ujian masih berlaku)
    await seeder.seedAssessment(assessActiveId, userId, schoolId, 10,'PUBLISHED');
    
    // 2. Assessment Basi (Waktu ujian sudah lewat)
    await seeder.seedAssessment(assessExpiredId, userId, schoolId, 10,'CLOSED');

    // 3. Siswa yang sudah menyelesaikan ujian di assessment aktif
    await seeder.seedSubmission('sub-start-finished', assessActiveId, 'FINISHED', 'Fikri Selesai');
  });

  it('✅ [SUCCESS] GIVEN siswa baru & ujian aktif, WHEN hit endpoint start, THEN return 201 (Created) & cetak submission_id', async () => {
    const payload = {
      student_name: 'Fikri Hidayatulloh',
      class_name: 'XII TKJ',
      gender: 'MALE', 
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessActiveId}/start`)
      .send(payload)
      .expect(201); 

    expect(response.body.statuscode).toBe(201);
    expect(response.body.message).toBe('Submission successfully initiated');
    expect(response.body.data.student_name).toBe('Fikri Hidayatulloh');
    expect(response.body.data.submission_id).toBeDefined();
  });

  it('❌ [FAIL] GIVEN siswa sudah berstatus FINISHED, WHEN mencoba mulai lagi, THEN return 403 (Forbidden)', async () => {
    const payload = {
      student_name: 'Fikri Selesai', // Sesuai dengan yang ada di Seeder
      class_name: 'XII RPL',
      gender: 'MALE',
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessActiveId}/start`)
      .send(payload)
      .expect(403); 

    expect(response.body.message).toBe('Anda sudah menyelesaikan ujian ini.');
  });

  it('❌ [FAIL] GIVEN waktu assessment (expired_at) sudah lewat, WHEN siswa memaksa mulai, THEN return 403 (Forbidden)', async () => {
    const payload = {
      student_name: 'Siswa Telat',
      class_name: 'XII RPL',
      gender: 'MALE',
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessExpiredId}/start`) // Menggunakan assessment timeout
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Waktu ujian sudah habis! Anda terlambat.');
  });
});
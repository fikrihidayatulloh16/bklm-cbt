const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('POST /submissions/:assessment_id/session/session_id/start (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-start-1';
  const userId = 'user-start-1';
  const classId = 'class-start-1';
  const sessionId = 'session-start-2'
  const assessActiveId = 'assess-start-active';
  const assessExpiredId = 'assess-start-expired';
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

    // const now = new Date();
    // const pastStartTime = new Date(now.getTime() - 100000); // Mulai di masa lalu
    // const pastEndTime = new Date(now.getTime() - 50000);    // Selesai juga di masa lalu

    // // Selesaikan pemanggilan seeder Session
    // await seeder.seedCreateAssessmentSession(
    //   sessionId,
    //   pastStartTime,
    //   pastEndTime,
    //   assessActiveId,
    //   classId
    // );

    // 1. Assessment Aktif (Waktu ujian masih berlaku)
    await seeder.seedAssessment(assessActiveId, userId, schoolId, 10,'PUBLISHED');
    
    // 2. Assessment Basi (Waktu ujian sudah lewat)
    await seeder.seedAssessment(assessExpiredId, userId, schoolId, 10,'CLOSED');

    const now = new Date();
    const pastStartTime = new Date(now.getTime() - 10000); // 10 detik yang lalu
    
    // 🔥 UBAH INI: Agar Sesi masih berlaku, jadikan 1 jam ke depan
    const futureEndTime = new Date(now.getTime() + 3600000000); 

    await seeder.seedCreateAssessmentSession(
      sessionId,
      pastStartTime, // ✅ START TIME (Masa lalu)
      futureEndTime, // ✅ END TIME (Masa depan)
      assessActiveId,
      classId
    );

    // (Opsional) Buat Sesi Basi untuk assessExpiredId jika Anda membutuhkannya untuk TC03
    await seeder.seedCreateAssessmentSession(
      sessionExpiredId,
      new Date(now.getTime() - 100000),
      new Date(now.getTime() - 50000), // Sudah lewat
      assessExpiredId,
      classId
    );

    // 3. Siswa yang sudah menyelesaikan ujian di assessment aktif
    await seeder.seedSubmission(
      'sub-start-finished', 
      assessActiveId, 
      'FINISHED', 
      'Fikri Selesai',
      classId,       // 🔥 Tambahkan Parameter classId
      'VII A',       // 🔥 Tambahkan Parameter className
      sessionId      // 🔥 Tambahkan Parameter sessionId
    );
  });

  it('TC01 ✅ [SUCCESS] GIVEN siswa baru & ujian aktif, WHEN hit endpoint start, THEN return 201 (Created) & cetak submission_id', async () => {
    const payload = {
      student_name: 'Fikri Hidayatulloh',
      class_id: classId,
      class_name: 'VII A', // 🔥 Ubah menjadi VII A (Sesuai Seeder)
      gender: 'MALE', 
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessActiveId}/session/${sessionId}/start`)
      .send(payload); // 🔴 Hapus dulu .expect(201)-nya untuk investigasi

    // 🔥 Trik Rahasia Debugging E2E:
    // Cetak body-nya JIKA statusnya bukan 201 agar kita tahu EXACTLY pesan error-nya
    if (response.status !== 201) {
      console.log('SUBS-START-TC01 ERROR DARI SERVICE:', response.body);
    }
    
    expect(response.status).toBe(201);
  });

  it('SUBS-START TC02 ❌ [FAIL] GIVEN siswa sudah berstatus FINISHED, WHEN mencoba mulai lagi, THEN return 403 (Forbidden)', async () => {
    const payload = {
      student_name: 'Fikri Selesai',
      class_id: classId,
      class_name: 'VII A',
      gender: 'MALE',
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessActiveId}/session/${sessionId}/start`)
      .send(payload); 
    console.log('SUBS START TC02 RESPONSE: ', response.body);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Anda sudah menyelesaikan ujian ini.');
  });

  it('SUBS START TC03 ❌ [FAIL] GIVEN waktu assessment (expired_at) sudah lewat, WHEN siswa memaksa mulai, THEN return 403 (Forbidden)', async () => {
    const payload = {
      student_name: 'Siswa Telat',
      class_id: classId,
      class_name: 'XII RPL',
      gender: 'MALE',
    };

    const response = await request(app.getHttpServer())
      .post(`/submissions/${assessExpiredId}/session/${sessionExpiredId}/start`) // Menggunakan assessment timeout
      .send(payload);
    console.log('SUBS START TC03 RESPONSE: ', response.body);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Waktu sesi ujian sudah habis! Anda terlambat.');
  });
});
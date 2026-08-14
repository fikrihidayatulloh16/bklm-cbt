const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('POST /assessments/:id/sync-status (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = 'school-fc-1';
  const TEACHER_ID = 'teacher-fc-1';
  const STUDENT_ID = 'student-fc-1';
  const SESSION_ID = 'session-fc-1';
  const CLASS_ID = 'class-fc-1';
  
  const ASSESS_PUBLISHED_ID = 'assess-published';
  const ASSESS_TIMEOUT_ID = 'assess-timeout';
  const SUBMISSION_ID = 'sub-stuck-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: TEACHER_ID, school_id: SCHOOL_ID, role: 'TEACHER' }; 
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    seeder = new E2eSeeder(prisma);
  });

  afterAll(async () => {
    await seeder.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await seeder.cleanDatabase();
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);

    await prisma.class.create({
      data: {
        id: CLASS_ID,
        name: 'VII A',
        level: 'VII',
        school_id: SCHOOL_ID
      }
    });

    // Bikin User Siswa manual agar tidak bentrok
    // await prisma.user.upsert({
    //   where: { email: 'siswa.stuck@test.com' },
    //   update: {},
    //   create: { id: STUDENT_ID, email: 'siswa.stuck@test.com', name: 'Siswa Stuck', role: 'STUDENT', school_id: SCHOOL_ID }
    // });

    // 1. Ujian PUBLISHED (Yang dilarang untuk ditutup paksa)
    await seeder.seedAssessment(ASSESS_PUBLISHED_ID, TEACHER_ID, SCHOOL_ID, 10, 'PUBLISHED');

    // 2. Ujian TIMEOUT (Yang valid untuk ditutup paksa)
    await seeder.seedAssessment(ASSESS_TIMEOUT_ID, TEACHER_ID, SCHOOL_ID, 10, 'CLOSED');

    

    // 🔥 PERBAIKAN 1: Atur Waktu Sesi ke Masa Lalu (Simulasi Sesi Sudah Habis)
    const now = new Date();
    const pastStartTime = new Date(now.getTime() - 100000); // Mulai di masa lalu
    const pastEndTime = new Date(now.getTime() - 50000);    // Selesai juga di masa lalu

    // Selesaikan pemanggilan seeder Session
    await seeder.seedCreateAssessmentSession(
      SESSION_ID,
      pastStartTime,
      pastEndTime,
      ASSESS_TIMEOUT_ID,
      CLASS_ID
    );

    // 3. Buat satu siswa nyangkut (IN_PROGRESS) di Ujian TIMEOUT
    await prisma.submission.create({
      data: {
        id: SUBMISSION_ID,
        assessment_id: ASSESS_TIMEOUT_ID,
        session_id: SESSION_ID, // 🔥 PERBAIKAN 2: Ikat Submission ini ke Sesi yang kedaluwarsa tadi
        student_name: 'Agus',
        class_name: 'VII A',
        gender: 'MALE',
        status: 'IN_PROGRESS',
        started_at: pastStartTime // Siswa mulai ujian saat sesi dimulai
      }
    });
  });

  // --- UJI SKENARIO ---

  it('force-close TC01. ❌ HARUS 403 JIKA UJIAN DALAM STATUS PUBLISHED', async () => {
    // Sesuaikan endpoint sesuai dengan route Controller Anda (apakah POST atau PATCH?)
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${ASSESS_PUBLISHED_ID}/sync-status`);

    // 🔥 CCTV
    if (response.status !== 403) {
      console.log('🚨 force-close TC01 GAGAL. RESPONS:', response.body);
    }

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Assessment harus ada dan dilarang sinkron saat PUBLISHED");
  });

  it('force-close TC02. ❌ HARUS 403 JIKA UJIAN TIDAK DITEMUKAN', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/ujian-ngasal-123/sync-status`);

    if (response.status !== 403) {
      console.log('force-close TC02 GAGAL. RESPONS:', response.body);
    }

    expect(response.status).toBe(403);
  });

  it('force-close TC03. ✅ HARUS SUKSES MENUTUP PAKSA SISWA YANG NYANGKUT DI UJIAN TIMEOUT', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${ASSESS_TIMEOUT_ID}/sync-status`);

    // 🔥 CCTV
    if (response.status !== 200 && response.status !== 201) {
      console.log('force-close TC03 GAGAL. RESPONS:', response.body);
    }

    expect([200, 201]).toContain(response.status); 
    
    // 🔥 PERBAIKAN 3: Ubah 'processed' menjadi 'closed_count' sesuai dengan balikan Service Anda
    expect(response.body.closed_count).toBe(1);

    // 🕵️ Validasi Database: Apakah submission benar-benar berubah jadi FINISHED?
    const checkSub = await prisma.submission.findUnique({ where: { id: SUBMISSION_ID } });
    expect(checkSub?.status).toBe('FINISHED');
    expect(checkSub?.finish_method).toBe('FORCED');
    
    // Pastikan submitted_at juga terisi (tidak null)
    expect(checkSub?.submitted_at).not.toBeNull();
  });

});
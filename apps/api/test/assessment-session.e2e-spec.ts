// apps/api/test/assessment-session.e2e-spec.ts
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { ICacheRepository, I_CACHE_REPOSITORY } from 'src/common/cache/cache.repository.port';

describe('AssessmentSessionModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheRepository: ICacheRepository;

  // Konstanta ID untuk Master Data
  const schoolId = 'school-session-test';
  const userId = 'user-guru-test';
  const classRPL1 = 'class-rpl-1';
  const classRPL2 = 'class-rpl-2';
  const assessmentId = 'assessment-uts-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Wajib: Aktifkan validasi DTO agar BadRequestException berfungsi di test
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    cacheRepository = app.get(I_CACHE_REPOSITORY);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 1. TEARDOWN: Hapus dari tabel paling "anak" ke tabel "induk"
    await prisma.assessmentSession.deleteMany();
    await cacheRepository.invalidateByPattern('sessions:active:*');
    await prisma.assessment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();

    // 2. SEED: Buat dari tabel paling "induk" ke tabel "anak"
    // Buat Sekolah
    await prisma.school.create({ 
      data: { id: schoolId, name: 'SMK BKLM Testing' } 
    });
    
    // Buat Guru (Author Ujian) - Asumsi schema User butuh email unik & google_id
    await prisma.user.create({
      data: { 
        id: userId, 
        email: 'guru.session@test.com', 
        name: 'Guru Testing', 
        role: 'TEACHER',
        google_id: 'google-session-123',
        school_id: schoolId 
      },
    });

    // Buat 2 Kelas
    await prisma.class.createMany({
      data: [
        { id: classRPL1, level: 'X', name: 'RPL 1', school_id: schoolId },
        { id: classRPL2, level: 'X', name: 'RPL 2', school_id: schoolId },
      ],
    });

    // Buat Master Soal (Assessment)
    await prisma.assessment.create({
      data: { 
        id: assessmentId, 
        title: 'UTS Pemrograman Dasar', 
        user_id: userId, 
        school_id: schoolId 
      },
    });
  });

  describe('POST /assessment-sessions', () => {
    it('TC01 Harus berhasil (201) membuat sesi ujian dan mengikatnya ke kelas', async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const payload = {
        name: 'Sesi Pagi X RPL',
        start_time: now.toISOString(),
        end_time: tomorrow.toISOString(),
        assessment_id: assessmentId,
        class_ids: [classRPL1, classRPL2], // Ikat ke 2 kelas sekaligus
      };

      console.log('TC01 PAYLOAD: ', payload);
      

      const response = await request(app.getHttpServer())
        .post('/assessment-sessions')
        .send(payload)
        .expect(201);

      if (response != 201) {
        console.log('TC01 PAYLOAD: ', payload);
        console.log('TC01 response: ', response.body);
      }

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Sesi Pagi X RPL');
      // Verifikasi Domain Mapper mengembalikan ID kelas dengan benar
      expect(response.body.data.classIds).toContain(classRPL1);
      expect(response.body.data.classIds).toContain(classRPL2);
    });

    it('TC02 Harus menolak (400) jika start_time lebih besar dari end_time', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const invalidPayload = {
        name: 'Sesi Mundur',
        start_time: now.toISOString(),
        end_time: yesterday.toISOString(), // Error: Waktu selesai lebih dulu dari mulai
        assessment_id: assessmentId,
        class_ids: [classRPL1],
      };

      console.log('TC02 PAYLOAD: ', invalidPayload);

      const response = await request(app.getHttpServer())
        .post('/assessment-sessions')
        .send(invalidPayload)
        .expect(400);

      if (response != 400) {
        console.log('TC02 GAGAL, CAUSE: ', response.body);
      }
      
      

      expect(response.body.message).toContain('Waktu mulai harus lebih awal dari waktu selesai');
    });
  });

  describe('GET /assessment-sessions/class/:classId/active', () => {
    it('TC 03 Harus mengembalikan sesi (200) yang sedang aktif untuk kelas tertentu', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 10000); // 10 detik lalu
      const future = new Date(now.getTime() + 10000); // 10 detik ke depan

      console.log('01 - membuat session');

      // Suntik data sesi aktif secara manual ke database
      await prisma.assessmentSession.create({
        data: {
          name: 'Sesi Sedang Berlangsung',
          start_time: past,
          end_time: future,
          assessment_id: assessmentId,
          classes: { connect: [{ id: classRPL1 }] }, // Hanya diikat ke RPL 1
        },
      });

      // Tes akses dari RPL 1 (Harus ada hasilnya)
      const resRPL1 = await request(app.getHttpServer())
        .get(`/assessment-sessions/class/${classRPL1}/active`)
        .expect(200);

      if (resRPL1) {
        console.log('TC03 GAGAL, STATUS: ', resRPL1.status);
        console.log('TC03 GAGAL, CAUSE: ', resRPL1.body);
      }

      expect(resRPL1.body.data.length).toBe(1);
      expect(resRPL1.body.data[0].name).toBe('Sesi Sedang Berlangsung');

      console.log('tc03 length: ', resRPL1.body.data.length);
      

      // Tes akses dari RPL 2 (Harus kosong karena tidak diikat ke kelas ini)
      const resRPL2 = await request(app.getHttpServer())
        .get(`/assessment-sessions/class/${classRPL2}/active`)
        .expect(200);

      expect(resRPL2.body.data.length).toBe(0);
    });

    it('TC04Harus mengembalikan sesi dari Cache (200) pada pemanggilan kedua', async () => {
      // 1. Panggilan Pertama (Cache Miss -> Ambil dari DB -> Simpan ke Redis)
      const responseSatu = await request(app.getHttpServer())
        .get(`/assessment-sessions/class/${classRPL1}/active`)
        .expect(200);

      // 2. Panggilan Kedua (Seharusnya Cache Hit -> Ambil dari Redis)
      const responseDua = await request(app.getHttpServer())
        .get(`/assessment-sessions/class/${classRPL1}/active`)
        .expect(200);

      // 3. Verifikasi: Data dari cache harus 100% sama persis dengan data dari DB
      expect(responseDua.body.data).toEqual(responseSatu.body.data);
      expect(responseDua.body.status).toBe('success');
      
      // Catatan: Jika Anda melihat terminal saat tes ini berjalan, 
      // Anda harus melihat log "🐢 Cache miss" diikuti oleh "⚡ Cache hit".
    });
  });
});
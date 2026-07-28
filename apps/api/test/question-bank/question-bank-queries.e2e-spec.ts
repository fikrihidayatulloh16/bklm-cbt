const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('Question Bank Operations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = 'school-qb-op-1';
  const TEACHER_ID = 'teacher-qb-op-1';
  
  const VALID_BANK_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0854';
  const DELETED_BANK_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0852';
  const RANDOM_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        // Asumsi author_id diambil dari token user ini
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

    // 1. Buat Bank Soal Sehat (Menggunakan seeder yang pernah Anda buat sebelumnya)
    await seeder.seedQuestionBank(VALID_BANK_ID, TEACHER_ID);

    // 2. Buat Bank Soal yang sudah kena Soft Delete
    await seeder.seedQuestionBank(DELETED_BANK_ID, TEACHER_ID);
    await prisma.questionBank.update({
      where: { id: DELETED_BANK_ID },
      data: { deleted_at: new Date() } // Set agar terbaca "sudah dihapus"
    });
  });

  // =========================================================
  // BLOK READ (GET)
  // =========================================================
  describe('GET Operations', () => {
    it('TC01✅ HARUS 200: Mengambil semua bank soal milik author', async () => {
      const response = await request(app.getHttpServer())
        .get('/question-bank'); // Sesuaikan rute (findAllByAuthor)
      
      expect(response.status).toBe(200);
      // Validasi struktur jika Anda membungkus dengan { data: ... }
      // expect(Array.isArray(response.body.data)).toBeTruthy(); 
    });

    it('tc02 ✅ HARUS 200: Mengambil detail satu bank soal', async () => {
      const response = await request(app.getHttpServer())
        .get(`/question-bank/${VALID_BANK_ID}`); // Sesuaikan rute (findOne)

    if (response.status !== 200) {
      console.log('🚨 TC02 GAGAL RESPONS ASLI:');
      console.log(response.body);
    }
      
      expect(response.status).toBe(200);
    });
  });

  // =========================================================
  // BLOK UPDATE (PATCH/PUT)
  // =========================================================
  describe('UPDATE Operations', () => {
    it('tc03 ❌ HARUS 404 JIKA BANK SOAL TIDAK DITEMUKAN', async () => {
      const payload = { title: 'Judul Baru' }; // Sesuaikan DTO

      const response = await request(app.getHttpServer())
        .patch(`/question-bank/${RANDOM_ID}`) // Gunakan .put jika controller pakai @Put
        .send(payload);

    if (response) {
      console.log('TC03 🚨 Hasil ASLI:');
      console.log(response.body);
    }

      if (response.status !== 404) console.log('🚨 UPDATE 404 GAGAL:', response.body);
      expect(response.status).toBe(404);
    });

    it('tc04 ✅ HARUS SUKSES MEMPERBARUI BANK SOAL', async () => {
      const payload = { title: 'Judul Terupdate' };

      const response = await request(app.getHttpServer())
        .patch(`/question-bank/${VALID_BANK_ID}`)
        .send(payload);

    if (response) {
      console.log('TC04🚨 Hasil ASLI:');
      console.log(response.body);
    }

      expect([200, 201]).toContain(response.status);

      // Pastikan di database benar-benar berubah
      const dbCheck = await prisma.questionBank.findUnique({
        where: { id: VALID_BANK_ID }
      });
      expect(dbCheck?.title).toBe('Judul Terupdate');
    });
  });

  // =========================================================
  // BLOK DELETE (SOFT REMOVE)
  // =========================================================
  describe('DELETE Operations', () => {
    it('tc05 ❌ HARUS 404 JIKA BANK SOAL TIDAK DITEMUKAN', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/question-bank/${RANDOM_ID}`);

    if (response) {
      console.log('TC05 🚨 Hasil ASLI:');
      console.log(response.body);
    }
      expect(response.status).toBe(404);
    });

    it('tc06 ❌ HARUS 400 JIKA BANK SOAL SUDAH DIHAPUS SEBELUMNYA', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/question-bank/${DELETED_BANK_ID}`);

      if (response.status !== 400) console.log('🚨 DELETE 400 GAGAL:', response.body);

    if (response) {
      console.log('TC06 🚨 Hasil ASLI:');
      console.log(response.body);
    }
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('sudah dihapus sebelumnya');
    });

    it('tc07 ✅ HARUS SUKSES MENGHAPUS (SOFT DELETE) BANK SOAL', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/question-bank/${VALID_BANK_ID}`);

    if (response) {
      console.log('TC07 🚨 Hasil ASLI:');
      console.log(response.body);
    }

      expect(response.status).toBe(200);

      // Verifikasi di DB bahwa field deleted_at sudah terisi (tidak null)
      const dbCheck = await prisma.questionBank.findUnique({
        where: { id: VALID_BANK_ID }
      });
      expect(dbCheck?.deleted_at).not.toBeNull();
    });
  });

});
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

const request = require('supertest');

describe('ClassModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Aktifkan validasi DTO global untuk tes ini
    app.useGlobalPipes(new ValidationPipe()); 
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  // Bersihkan tabel Kelas sebelum SETIAP blok 'it' berjalan (SRE mindset: lingkungan tes harus steril)
  beforeEach(async () => {
    // 1. Hapus data Anak dulu, baru Induk (agar tidak melanggar relasi saat menghapus)
    await prisma.class.deleteMany();
    await prisma.school.deleteMany();

    // 2. Suntik data Induk (Sekolah) agar Foreign Key (school_id) pada Kelas valid
    await prisma.school.createMany({
      data: [
        { id: 'sekolah-01', name: 'Sekolah Testing 01' }, 
        { id: 'sekolah-LAIN', name: 'Sekolah Testing Lain' }
      ],
      skipDuplicates: true,
    });
    // NOTE: Jika tabel School Anda wajib memiliki field lain selain 'id' dan 'name', 
    // silakan tambahkan di dalam objek data di atas.
  });

  afterAll(async () => {
    // Matikan koneksi dengan anggun agar tidak muncul warning "Open Handles"
    await prisma.$disconnect();
    await app.close();
  });

  // ---------------------------------------------------------
  // 1. UJI SKENARIO POST (MEMBUAT KELAS)
  // ---------------------------------------------------------
  describe('POST /classes', () => {
    it('Harus berhasil membuat kelas baru (201)', async () => {
      const validPayload = {
        level: 'X',
        name: 'RPL 1',
        school_id: 'sekolah-01',
      };

      const response = await request(app.getHttpServer())
        .post('/classes')
        .send(validPayload)
        .expect(201); // 201 Created

      expect(response.body.status).toBe('success');
      expect(response.body.data.level).toBe('X');
      expect(response.body.data.name).toBe('RPL 1');
      expect(response.body.data.id).toBeDefined();
    });

    it('Harus gagal (400) jika nama kelas kosong', async () => {
      const invalidPayload = {
        level: 'X',
        name: '', // Dikosongkan untuk memicu error DTO
        school_id: 'sekolah-01',
      };

      const response = await request(app.getHttpServer())
        .post('/classes')
        .send(invalidPayload)
        .expect(400); // 400 Bad Request

      expect(response.body.message).toContain('Nama kelas wajib diisi (misal: "RPL 1")');
    });

    it('Harus menolak (409) jika kelas dengan level, nama, dan sekolah yang sama sudah ada', async () => {
      // 1. Persiapkan data yang sama persis
      const duplicatePayload = {
        level: 'XII',
        name: 'Multimedia 1',
        school_id: 'sekolah-01',
      };

      // 2. Suntikkan data pertama kali (berpura-pura bahwa kelas ini sudah ada di database)
      await prisma.class.create({
        data: duplicatePayload,
      });

      // 3. Tembakkan HTTP Request untuk mencoba membuat kelas yang persis sama
      const response = await request(app.getHttpServer())
        .post('/classes')
        .send(duplicatePayload)
        .expect(409); // Harapan: Konflik (ConflictException)

      // 4. Verifikasi bahwa pesan error yang dilempar dari Repository benar-benar keluar
      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toContain('Kelas tingkat XII dengan nama Multimedia 1 sudah ada');
    });
  });

  // ---------------------------------------------------------
  // 2. UJI SKENARIO GET (MENGAMBIL KELAS)
  // ---------------------------------------------------------
  describe('GET /classes/school/:schoolId', () => {
    it('Harus mengembalikan daftar kelas berdasarkan ID Sekolah (200)', async () => {
      const targetSchoolId = 'sekolah-01';

      // Seed (Suntik) data tiruan langsung ke database sebelum melakukan GET
      await prisma.class.createMany({
        data: [
          { level: 'X', name: 'RPL 1', school_id: targetSchoolId },
          { level: 'XI', name: 'TKJ 2', school_id: targetSchoolId },
          { level: 'X', name: 'AKL 1', school_id: 'sekolah-LAIN' }, // Sengaja beda sekolah untuk uji filter
        ],
      });

      // Lakukan HTTP GET Request ke endpoint
      const response = await request(app.getHttpServer())
        .get(`/classes/school/${targetSchoolId}`)
        .expect(200);

      // Verifikasi struktur dan filter respons
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Harus mengembalikan 2 kelas (karena yang 1 milik sekolah-LAIN)
      expect(response.body.data.length).toBe(2);
      
      // Pastikan data yang kembali sesuai
      expect(response.body.data[0].schoolId).toBe(targetSchoolId);
    });

    it('Harus mengembalikan array kosong jika sekolah tidak punya kelas (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/classes/school/sekolah-hantu')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(0);
    });
  });

});
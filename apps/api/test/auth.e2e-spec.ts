const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { E2eSeeder } from './utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  // Profil palsu yang seolah-olah dikirim oleh Google setelah login sukses
  const mockGoogleProfile = {
    email: 'guru.baru@gmail.com',
    firstName: 'Guru',
    lastName: 'Baru',
    picture: 'https://lh3.googleusercontent.com/a/palsu123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // 🔥 KUNCI E2E OAUTH: Kita menipu AuthGuard('google')
    .overrideGuard(AuthGuard('google'))
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        // Kita sisipkan profil palsu ke dalam req.user
        req.user = mockGoogleProfile; 
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
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
  });

  // =========================================================
  // BLOK PENGUJIAN CALLBACK GOOGLE (Logika Utama)
  // =========================================================
  describe('GET /auth/google/callback', () => {

    it('1. ✅ HARUS BISA MENDAFTARKAN USER BARU & REDIRECT DENGAN TOKEN', async () => {
      // Pastikan database masih kosong (User belum ada)
      const userBefore = await prisma.user.findUnique({
        where: { email: mockGoogleProfile.email }
      });
      expect(userBefore).toBeNull();

      // Tembak endpoint callback (seolah-olah Google meredirect kembali ke backend)
      const response = await request(app.getHttpServer())
        .get('/auth/google/callback');

      // 1. Backend harus merespons dengan 302 (Redirect)
      expect(response.status).toBe(302);

      // 2. Redirect harus mengarah ke Frontend membawa JWT Token
      // Format yang Anda tulis di controller: http://localhost:3001/auth/success?token=...
      expect(response.header.location).toContain('http://localhost:3001/auth/success?token=');
      
      // Token JWT adalah 3 string panjang yang dipisah titik (header.payload.signature)
      // Kita pastikan token tersebut ada di akhir URL
      const tokenInUrl = response.header.location.split('token=')[1];
      expect(tokenInUrl).toBeDefined();
      expect(tokenInUrl.split('.').length).toBe(3);

      // 3. Pastikan user BENAR-BENAR TERDAFTAR di Database
      const userAfter = await prisma.user.findUnique({
        where: { email: mockGoogleProfile.email }
      });
      expect(userAfter).not.toBeNull();
      expect(userAfter?.name).toBe('Guru Baru');
      expect(userAfter?.role).toBe('TEACHER');
    });

    it('2. ✅ HARUS LANGSUNG LOGIN JIKA USER SUDAH PERNAH MENDAFTAR SEBELUMNYA', async () => {
      // Kita tanam dulu (seed) user dengan email yang sama di database
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          name: 'Guru Lama (Sudah Ganti Nama)',
          role: 'TEACHER', // Bukti bahwa data tidak ditimpa
        }
      });

      // Hit endpoint callback lagi
      const response = await request(app.getHttpServer())
        .get('/auth/google/callback');

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('token=');

      // Pastikan di database TETAP 1 USER (tidak double / terduplikasi)
      const usersInDb = await prisma.user.findMany({
        where: { email: mockGoogleProfile.email }
      });
      
      expect(usersInDb.length).toBe(1); // User tidak boleh digandakan
      
      // Pastikan data lama tidak tertimpa oleh profil google
      expect(usersInDb[0].name).toBe('Guru Lama (Sudah Ganti Nama)');
      expect(usersInDb[0].role).toBe('TEACHER');
    });

  });
});
# Implementation Plan & Dev Log

## 🚧 [Current State] 

## 🚨 [URGENT/INTERRUPT] 
*(Tempat untuk tugas darurat yang tiba-tiba muncul dan menahan tugas utama)*



---

## 🚧 [IN PROGRESS] 

### ADR 001: Frontend Query Key Factory & Global Real-Time WebSocket Invalidation

Fase 1: Membangun Fondasi (Query Key Factory)
Langkah 1.1: Buat file pusat konstanta untuk Query Keys.

File: src/common/constants/query-keys.constant.ts

Detail: Gunakan objek bertingkat dengan akhiran as const agar dikenali secara presisi oleh TanStack Query.

Langkah 1.2: Migrasikan hooks yang sudah ada (seperti useDashboardLogic.ts) agar menggunakan Query Key Factory yang baru alih-alih string mentah.

Fase 2: Membangun Infrastruktur Real-Time Global
Langkah 2.1: Buat file kamus Mapper yang menghubungkan event entity dari Backend dengan Query Keys Frontend.

File: src/common/config/realtime-mapper.config.ts

Detail: Petakan entitas (contoh: 'assessments') ke dalam daftar Query Keys yang harus di-invalidate.

Langkah 2.2: Buat Global WebSocket Listener Hook atau komponen pembungkus.

File: src/components/providers/RealtimeSyncProvider.tsx (atau sejenisnya)

Detail: Inisialisasi socket.on('data_updated', ...) satu kali saja di level Root Layout. Tangkap payload, baca kamus Mapper, lalu jalankan queryClient.invalidateQueries().

Fase 3: Integrasi & Verifikasi
Langkah 3.1: Bungkus aplikasi utama dengan RealtimeSyncProvider (pastikan ia memiliki akses ke userId pengguna yang sedang aktif agar bisa bergabung ke room yang tepat).

Langkah 3.2: Lakukan Manual Testing. Buat perubahan data dari perangkat/tab lain (atau via Backend), dan pastikan UI di Dashboard Anda langsung ter-refresh secara otomatis tanpa perlu refresh browser (F5).

### Implementation Plan: Automated Test & gRPC Pagination (Assessment Service)

#### 1. Objektif
Melakukan refaktor pada `AssessmentService` untuk mendukung Paginasi pada endpoint `GET /api/assessments` (mengatasi masalah *loading* lambat akibat 1000 data dari *load-test*). 
Pengembangan wajib menggunakan pendekatan **Test-Driven Development (TDD)** dan isolasi *database* sebelum ekspansi ke protokol gRPC.

#### 2. Fase 1: Isolasi Infrastruktur Tes (Selesai)
- Menambahkan `postgres_test_db` di `docker-compose.local`.
- Menggunakan port `5433` (menghindari bentrok dengan DB utama).
- Membuat *volume* mandiri `db_data/postgres_test` agar data produksi/development aman.
- Menyiapkan file `.env.test` khusus untuk Prisma (menunjuk ke port 5433).

#### 3. Fase 2: Definisi Kontrak TDD (Red Phase)
- **Aksi:** Menulis tes E2E di `test/assessment.e2e-spec.ts`.
- **Target:** Endpoint harus merespons dengan format standar industri, bukan sekadar *Array*.
  ```json
  {
    "data": [ { "id": "...", "title": "..." } ],
    "meta": { "total": 1000, "page": 1, "limit": 10, "lastPage": 100 }
  }

Status Harapan: Eksekusi npm run test:e2e wajib gagal (merah) pada tahap ini karena kode asli belum diubah.

4. Fase 3: Implementasi Paginasi (Green Phase)
Aksi: Modifikasi AssessmentService menggunakan skip dan take pada Prisma.

Validasi: Jalankan ulang E2E test hingga hijau (sukses).

Catatan: Perubahan ini adalah Breaking Change. Frontend (Next.js/NextUI) harus disesuaikan agar mengekstrak data dari response.data.data.

5. Fase 4: Integrasi gRPC
Membuat AssessmentGrpcController.

Menggunakan AssessmentService yang sama (karena sudah tervalidasi oleh tes E2E menghasilkan output data & meta yang solid).

Tes komunikasi gRPC dari client (Postman/gRPCui) ke server.
---

## 🚧 [UPCOMING] 

### Mengatasi Masalah ketika dua user yang sama sedang progress
**Konsep/Problem:** - Ketika saya coba mengerjakan dengan nama budi setiawan di browser A tapi belum di submit lalu pindah ke browser lain dengan assessment belum selesai dan nama yang sama loading terus, harusnya muncul error atau gagal login. namun ketika sudah selesai atau di submit baru muncul error.

LOG
## Error Type
Console Error

## Error Message
GAWAT! Submission ID tidak ditemukan di response!


    at handleStartExam (features/exam/hooks/useExamLogic.ts:281:21)

## Code Frame
  279 |  
  280 |         if (!subId) {
> 281 |             console.error("GAWAT! Submission ID tidak ditemukan di response!");
      |                     ^
  282 |             return; 
  283 |         }
  284 |

Next.js version: 16.1.1 (Turbopack)


**Langkah-langkah:**
- [ ] Buat fungsi ...


---

## 🧊 [BACKLOG / PAUSED]
*(Tugas yang belum mendesak atau sedang ditunda)*
- [ ] Optimasi pengambilan soal.
- [ ] Optimasi Finish dengan Task Queue

====================================================================
## 📚 ARCHIVE & HISTORY (Jangan Dihapus!)
*(Pindahkan tugas yang sudah 100% selesai ke bawah garis ini)*

### ✅ 001 - Redis Buffer & Bulk Insert

### Tahap 1: Persiapan Persistensi Infrastruktur (Proxmox/Docker)
- [x] Buka file `redis.conf` yang dipetakan (*mapped*) pada container Docker Redis.
- [x] Pastikan konfigurasi persisten menyala:
    1.  appendonly yes
    2. appendfsync everysec
- [x] Restart container Redis untuk memvalidasi pembuatan file .aof di direktori data lokal.
- [x] Impor ScheduleModule.forRoot() di dalam AppModule.

### Tahap 2: Pemasangan Dependensi di Aplikasi NestJS

- [] Pasang modul penjadwalan bawaan NestJS.
[x] Impor ScheduleModule.forRoot() di dalam AppModule.

### Tahap 3: Modifikasi Layer Redis (Repository)
[x] Buat metode baru di Service/Repository yang menangani Redis (RedisService).

[x] Buat struktur Hash/Set di Redis. Format Key disarankan: cbt:answers:{assessment_id}:{student_id}.

[x] Buat metode setAnswer (Untuk menyimpan jawaban satuan secara real-time ke Redis).

[x] Buat metode harvestAnswers (Untuk menarik seluruh data jawaban dan langsung menghapusnya dari Redis, gunakan perintah HGETALL dipadukan dengan penghapusan kunci atau pipeline agar atomik).

### Tahap 4: Pembuatan Pekerja Batch (Cron Job Worker)
[x] Buat service baru bernama AnswerSyncWorkerService.

[x] Tambahkan dekorator penjadwal:
TypeScript
@Cron(CronExpression.EVERY_MINUTE)
async handleAnswerSync() { ... }

[x] Di dalam metode penjadwal, injeksikan metode penarikan dari Tahap 3.
### Tahap 5: Eksekusi Bulk Insert / Upsert (Prisma/PostgreSQL)
[x] Pada metode handleAnswerSync, siapkan payload mapping dari data Redis mentah menuju DTO Prisma.

[x] Gunakan fitur prisma createMany (Jika murni data baru) atau upsert dalam Transaction (Jika siswa mengganti jawaban sebelumnya).
Catatan Khusus Prisma: Jika menggunakan pembaruan (update) masif, Prisma mungkin membutuhkan raw query untuk ON CONFLICT DO UPDATE agar operasi tetap menjadi satu query SQL tunggal (Bulk Upsert).

### Tahap 6: Pemotongan Alur Pengontrol Utama (Controller) 
[x] Modifikasi endpoint POST /questions/answer di Controller utama.

[x] Ubah pemanggilan dari PostgresRepository.save menjadi RedisService.setAnswer.

[x] Pengontrol harus merespons 200 OK (atau 201 Created) segera setelah data berhasil ditulis di Redis.

# Implementation Plan & Dev Log

## 🚧 [Current State] 

## 🚨 [URGENT/INTERRUPT] 
*(Tempat untuk tugas darurat yang tiba-tiba muncul dan menahan tugas utama)*
- [ ] 



---

## 🚧 [IN PROGRESS] 


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
- [ ] Membuat automated testing untuk setiap fitur hingga edge case.

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

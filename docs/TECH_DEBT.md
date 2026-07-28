# Technical Debt

## konfirmasi fungsi create sesi PRIORITY CRITICAL
pastikan saat fungsi Create Sesi dipanggil, Anda sudah memberikan validasi agar tidak ada orang (Admin/Guru) yang tidak sengaja membuat Sesi ke-2 saat Sesi 1 belum selesai.
(Tapi ini urusan nanti, tidak perlu dipikirkan sekarang agar fokus tidak pecah).

## perbaiki di fitur force submit PRIORITY CRITICAL
Observasi Kritis (Sparring Session) untuk forceCloseTimeouts
Sebelum kita buat pengujiannya, mata sparring saya menangkap satu potensi bom waktu di kode Anda:

TypeScript
    const updatePromises = stuckSubmissions.map(async (sub) => {
      const deadline = sub.assessment.expired_at;

      // 🚨 BOM WAKTU DI SINI:
      if (!deadline) {
        throw new BadRequestException(`expired_at yang dimasukkan:${deadline}`)       
      }
      // ...
**Kenapa ini bahaya?**
Anda menggunakan Promise.all(updatePromises). Jika ada 100 siswa yang sedang ujian, dan entah bagaimana ada 1 siswa yang data expired_at-nya null, maka throw new BadRequestException ini akan meledakkan seluruh proses. Ke-99 siswa lainnya akan gagal ditutup paksa!

Saran Perbaikan (Jangan diubah sekarang, tapi pikirkan nanti):
Daripada throw exception, lebih baik kembalikan undefined atau catat log saja, agar siswa lain tetap bisa diproses:

TypeScript
if (!deadline) {
  // Lewati siswa ini, biarkan siswa lain tetap diproses
  return undefined; 
}

## refactor agar clean
## Buat automated testing untuk menjaga aplikasi
## ubah saat registrasi tombol mulai ujian di nonaktifkan jikaa belum dibuka, kalau bisa tambahkaan menunggu atau antrean, jadi langsung masuk ketika dibukaa 

## Logs bklm_api di server masih berantakan,
Karena NestJS secara default menyembunyikan status respons seperti 429 (Too Many Requests) atau 400 (Bad Request) dari terminal, kita harus memaksa NestJS untuk jujur mencetak setiap kode HTTP yang ia kirimkan ke HP siswa.

Cara 1: Memasang "Penyadap" di main.ts (Sangat Disarankan)
Ini adalah cara paling absolut. Kita akan menyisipkan 5 baris kode middleware murni Express.js ke dalam main.ts Anda. Kode ini akan mencegat setiap respons yang keluar dari server dan mencetak kode angkanya.

Buka file src/main.ts Anda.

Tambahkan 5 baris ini tepat di bawah const app = await NestFactory.create(AppModule);:

TypeScript
  // --- TAMBAHKAN 5 BARIS INI UNTUK DEBUGGING HARI-H ---
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`[BUKTI HTTP] ${req.method} ${req.url} - STATUS: ${res.statusCode}`);
    });
    next();
  });
  // ---------------------------------------------------
Commit dan Push kode tersebut agar GitHub Action melakukan build.

Setelah live, perhatikan perintah docker logs -f bklm_api Anda.

Sekarang, terminal Anda tidak hanya akan mencetak "Incoming Request", tetapi akan mencetak hasil akhirnya. Anda akan melihat bukti tak terbantahkan seperti ini:

[BUKTI HTTP] PUT /api/submissions/8ba6.../answer - STATUS: 201 (Sukses)
[BUKTI HTTP] PUT /api/submissions/8ba6.../answer - STATUS: 429 (Terbukti Limit Throttler!)
[BUKTI HTTP] PUT /api/submissions/8ba6.../answer - STATUS: 400 (Data soal salah/tidak cocok)
[BUKTI HTTP] PUT /api/submissions/8ba6.../answer - STATUS: 403 (Waktu habis/Dilarang)
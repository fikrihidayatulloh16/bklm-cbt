# Technical Debt

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
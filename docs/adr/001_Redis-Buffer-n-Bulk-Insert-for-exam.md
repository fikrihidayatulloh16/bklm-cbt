# ADR-001: Implementasi Redis Buffer & Bulk Insert untuk Sistem Penyimpanan Jawaban CBT

## 1. Status
**Accepted** (Juli 2026)

## 2. Context (Konteks Masalah)
Sistem BKLM CBT dirancang menggunakan mekanisme *Save-on-Next* untuk menjamin jawaban siswa tidak hilang jika terjadi gangguan di sisi klien. Namun, pendekatan *direct-insert* (menyimpan langsung ke PostgreSQL setiap klik) menimbulkan risiko arsitektural saat terjadi lonjakan trafik serentak dalam satu sekolah:
1. **Keterbatasan Infrastruktur Fisik:** Server Proxmox saat ini berjalan di atas penyimpanan berbasis HDD mekanik dengan kecepatan rotasi lambat (5400 RPM). Beban *write* konkuren (I/O disk) yang masif akan langsung memicu efek leher botol (*bottleneck*).
2. **Kelelahan Database (Pool Exhaustion):** Terlepas dari jenis media penyimpanan (HDD maupun SSD), membuka dan menutup koneksi database secara simultan untuk ratusan *query* tunggal adalah pemborosan *resource* komputasi (CPU).

## 3. Decision (Keputusan Arsitektur)
Kita akan beralih dari arsitektur *Direct-Insert* ke arsitektur **Asynchronous Batch Processing** dengan Redis sebagai benteng *buffer*, melalui langkah-langkah berikut:
1. **Penyimpanan Primer (In-Memory):** Permintaan *submit* jawaban dari frontend akan disalurkan ke Redis. Redis merespons secara atomik dengan kompleksitas waktu O(1), membebaskan jalur komunikasi HTTP klien tanpa antrean disk.
2. **Persistensi Jangka Pendek:** Redis akan dikonfigurasi dengan mode **AOF (Append Only File)** dengan sinkronisasi I/O setiap detik (`appendfsync everysec`) untuk menjamin tidak ada data menguap jika VM mengalami *kernel panic* atau pemadaman listrik.
3. **Pekerja Latar Belakang (Cron Worker):** Modul `@nestjs/schedule` akan mengeksekusi operasi pemanenan (*harvesting*) data dari Redis secara periodik (misal: setiap 1-2 menit).
4. **Optimasi Write (Bulk Insert):** Pekerja latar belakang akan menggunakan mekanisme `Bulk Insert` (menyuntikkan kumpulan data massal dalam satu *query* SQL tunggal) ke PostgreSQL.

## 4. Consequences (Konsekuensi)
### Positif
* **Tahan Gempuran:** Server mampu melayani lonjakan trafik (ribuan hitungan per detik) tanpa membebani disk IOPS (Input/Output Operations Per Second).
* **Efisiensi PostgreSQL:** Penggunaan *Connection Pool* dan CPU database turun drastis (dari misal 500 *query* menjadi 1 *query* massal).
* **Agnostik Hardware:** Optimasi tingkat aplikasi ini memastikan perangkat lunak tetap berkinerja tinggi, baik saat menggunakan HDD 5400 RPM maupun SSD NVMe kelas enterprise di masa depan.

### Negatif / Perlu Diperhatikan
* **Overhead Kompleksitas:** Perlu menulis penanganan logika duplikasi atau pembaruan (*Upsert*) saat menyatukan data di tingkat Redis.
* **Risiko Sinkronisasi Konkuren:** Pekerja latar belakang harus memiliki mekanisme pengunci sementara (*locking* / penghapusan memori sementara) agar *Cron Job* menit pertama tidak bertabrakan dengan *Cron Job* menit kedua jika eksekusi database melambat.

---
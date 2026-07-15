// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// 1. Muat Amunisi (Daftar ID Siswa Valid)
const submissions = new SharedArray('submissions', function () {
  return JSON.parse(open('./submissions.json'));
});

// 2. Siapkan Soal Valid (Data dari Database Anda)
const questions = [
  { q_id: '620fc852-3198-4ba1-9ca6-6ee53a1fffe1', opt_id: 'd7deb0f2-a809-4244-aabd-aebf147f233e' },
  { q_id: '7979d765-0b00-4abc-8835-db1d0b039269', opt_id: '904d79f7-0414-4662-9af5-cf23b9517ef5' },
  { q_id: 'aa6f0244-425a-4599-bc59-5e94237ef61f', opt_id: '46a854bd-6dec-45e2-8b78-5b6e27c2bcd9' }
];

export const options = {
  // Gelombang Serangan: Mencapai 1000 siswa aktif bersamaan
  stages: [
    { duration: '15s', target: 50 }, 
    { duration: '15s', target: 500 }, 
    { duration: '30s', target: 1000 },
    { duration: '15s', target: 0 },   
  ],
};

export default function () {
  // Ambil ID siswa secara bergiliran menggunakan nomor Virtual User K6
  // (Pastikan jumlah maksimum target di options tidak melebihi panjang array JSON)
  const siswa = submissions[__VU % submissions.length];
  
  if (!siswa) return;

  const baseUrl = `http://localhost:3000/api/submissions/${siswa.submission_id}/answer`;
  const params = { headers: { 'Content-Type': 'application/json' } };

  // 3. Sang Siswa Menjawab 3 Soal Secara Berurutan (Simulasi Mengerjakan Ujian Penuh)
  for (let i = 0; i < questions.length; i++) {
    const payload = JSON.stringify({
      question_id: questions[i].q_id,
      option_id: questions[i].opt_id,
      status_answer: true,
    });

    // Menembak endpoint (NestJS akan melempar ini ke Redis)
    const res = http.put(baseUrl, payload, params);

    // --- TAMBAHKAN LOGIKA INI SEMENTARA UNTUK DEBUGGING ---
    if (res.status !== 201) {
      console.log(`❌ Ditolak! Status: ${res.status}. Alasan: ${res.body}`);
    }
    // --------------------------------------------------------

    // Validasi
    check(res, {
      'status is 201': (r) => r.status === 201,
    });

    // Siswa berpikir selama 0.5 hingga 1.5 detik sebelum pindah soal
    sleep(Math.random() + 0.5); 
  }

  // Setelah selesai menjawab semua soal, SI SISWA MENEKAN TOMBOL FINISH
  const finishUrl = `http://localhost:3000/api/submissions/${siswa.submission_id}/finish`;
  
  // Endpoint finish Anda menggunakan PUT tanpa body
  const finishRes = http.put(finishUrl, null, params);

  if (finishRes.status !== 200) {
      console.log(`❌ Finish Ditolak! Status: ${finishRes.status}. Alasan: ${finishRes.body}`);
  }

  check(finishRes, {
    'finish is 200': (r) => r.status === 200, // Anda menset HTTP 200 untuk finish di controller
  });
}
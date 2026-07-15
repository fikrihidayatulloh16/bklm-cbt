// seed-loadtest.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Konfigurasi Target
const ASSESSMENT_ID = '6f8dd782-e09b-4481-b579-eaf392599f6d';
const TOTAL_STUDENTS = 1000;

async function main() {
  console.log(`🚀 Memulai Injeksi ${TOTAL_STUDENTS} Siswa Simulasi...`);
  
  const simulatedSubmissions = [];

  // Kita rakit 1000 payload sekaligus
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    simulatedSubmissions.push({
      assessment_id: ASSESSMENT_ID,
      status: 'IN_PROGRESS', // Status wajib agar lolos validasi 'FINISHED'
      score: 0,
      student_name: `Robot K6 - ${i}`,
      class_name: i % 2 === 0 ? 'X IPA 1' : 'X IPS 2',
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE', 
      // id akan otomatis ter-generate (uuid) oleh Prisma karena ada default(uuid()) di skema
    });
  }

  // 1. Eksekusi Tembakan ke PostgreSQL (Bulk Create)
  try {
     // Pastikan skema Anda menggunakan 'submission', bukan 'submissions' (cek huruf s)
     await prisma.submission.createMany({
       data: simulatedSubmissions,
       skipDuplicates: true, 
     });
     console.log('✅ Berhasil menyuntikkan 1000 baris ke tabel Submission.');
  } catch (err) {
     console.error('❌ Gagal menyuntikkan data:', err);
     return;
  }

  // 2. Tarik Kembali Data (Untuk mendapatkan UUID asli yang digenerate PostgreSQL)
  const insertedData = await prisma.submission.findMany({
    where: {
      assessment_id: ASSESSMENT_ID,
      student_name: {
        startsWith: 'Robot K6', // Kita pastikan hanya mengambil data simulasi
      }
    },
    select: {
      id: true, // Kita HANYA butuh ID-nya untuk diberikan ke K6
    }
  });

  // 3. Buat File submissions.json untuk pakan robot K6
  const jsonPayload = insertedData.map(item => ({ submission_id: item.id }));
  
  fs.writeFileSync('submissions.json', JSON.stringify(jsonPayload, null, 2));
  console.log(`✅ Berhasil membuat file submissions.json dengan ${insertedData.length} ID.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';

// ==========================================
  // 0. jalankan perintah dibawah dan terminal harus di ./prisma
  // ==========================================
//npx prisma db seed-school

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding...');

  // ==========================================
  // 1. BUAT SEKOLAH DEFAULT
  // ==========================================
  // Gunakan ID statis agar seeder ini idempotent (bisa dijalankan berkali-kali tanpa duplikat)
  const schoolId = 'school-bklm-default-001'; 
  
  const school = await prisma.school.upsert({
    where: { id: schoolId },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      id: schoolId,
      name: 'SMP Negeri 2 Subang',
      subscription: 'FREE', // Hapus baris ini jika di schema belum Anda tambahkan
    },
  });
  
  console.log(`🏫 Sekolah siap: ${school.name}`);

  // ==========================================
  // 2. TAUTKAN GURU YANG SUDAH ADA
  // ==========================================
  // Ganti string ini dengan EMAIL GURU yang sudah Anda buat sebelumnya
  const targetTeacherEmail = 'aeloscovenant@gmail.com'; 

  // Cek dulu apakah gurunya benar-benar ada di database
  const existingTeacher = await prisma.user.findUnique({
    where: { email: targetTeacherEmail },
  });

  if (existingTeacher) {
    // Jika gurunya ada, update schoolId-nya
    await prisma.user.update({
      where: { email: targetTeacherEmail },
      data: { 
        school_id:  school.id 
      },
    });
    console.log(`🔗 Berhasil menautkan guru (${targetTeacherEmail}) ke sekolah ${school.name}`);
  } else {
    console.warn(`⚠️ Peringatan: Guru dengan email ${targetTeacherEmail} tidak ditemukan di database!`);
  }

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
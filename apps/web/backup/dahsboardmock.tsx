"use client";

import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  User,
  Divider, 
  CardFooter
} from "@nextui-org/react";
import { 
  BookOpen, 
  Users, 
  FileEdit, 
  Clock, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  PlayCircle,
  MoreVertical,
  ChevronRight,
  Calendar,
  FileText
} from "lucide-react";

export default function DashboardGuru() {
  return (
    <div className="space-y-8 pb-8">
      
      {/* 1. HEADER SECTION 
          UX: Sapaan personal membuat dashboard terasa "hidup".
          Di HP: Stack ke bawah. Di Laptop: Kiri Kanan.
      */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Halo, Pak Guru! 👋</h1>
          <p className="text-default-500 text-sm">Berikut ringkasan aktivitas kelas Anda hari ini.</p>
        </div>
        <div className="flex gap-3">
          {/* Action Button Utama ditaruh disini agar mudah diakses */}
          <Button variant="flat" color="primary" startContent={<Plus size={18}/>}>
            Bank Soal Baru
          </Button>
          <Button color="primary" startContent={<PlayCircle size={18}/>}>
            Jadwalkan Ujian
          </Button>
        </div>
      </div>

      {/* 2. STATS GRID (BENTO GRID STYLE) 
          UX: Angka penting di atas. Warna semantik (Kuning=Warning, Hijau=Aktif).
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card: Perlu Dinilai (Priority: High) */}
        <Card className="border-l-4 border-warning shadow-sm">
          <CardBody className="gap-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <AlertCircle size={20} />
              </div>
              <Chip size="sm" variant="flat" color="warning">Urgent</Chip>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">12</p>
              <p className="text-xs text-default-500">Tugas perlu dinilai</p>
            </div>
          </CardBody>
        </Card>

        {/* Card: Ujian Aktif (Priority: High) */}
        <Card className="border-l-4 border-success shadow-sm">
          <CardBody className="gap-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-success/10 rounded-lg text-success">
                <Clock size={20} />
              </div>
              <div className="flex gap-1 items-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs font-semibold text-success">Live</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">1</p>
              <p className="text-xs text-default-500">Ujian sedang berlangsung</p>
            </div>
          </CardBody>
        </Card>

        {/* Card: Total Bank Soal */}
        <Card className="border-l-4 shadow-sm border-primary">
          <CardBody className="gap-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BookOpen size={20} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">24</p>
              <p className="text-xs text-default-500">Total Bank Soal</p>
            </div>
          </CardBody>
        </Card>

        {/* Card: Total Siswa */}
        <Card className="border-l-4 shadow-sm border-default">
          <CardBody className="gap-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-default-100 rounded-lg text-default-600">
                <Users size={20} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">118</p>
              <p className="text-xs text-default-500">Siswa Terdaftar</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* =========================================================
          SECTION 2: ASSESSMENTS (UJIAN TERAKHIR) - Horizontal Scroll
         ========================================================= */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PlayCircle size={22} className="text-primary"/> Assessment Terbaru
            </h2>
            <p className="text-xs text-default-400">Ujian yang dijadwalkan atau sedang berjalan</p>
          </div>
          <Button 
            size="sm" 
            variant="light" 
            color="primary" 
            endContent={<ChevronRight size={16}/>}
          >
            Lihat Semua
          </Button>
        </div>

        {/* Scrollable Container */}
        {/* pb-4 added agar shadow card tidak terpotong */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          
          {/* Card Assessment 1 (Live) */}
          <Card isPressable className="min-w-[280px] max-w-[280px] snap-center border border-success-200 bg-success-50/50">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <Chip size="sm" color="success" variant="solid">Sedang Berlangsung</Chip>
                <Clock size={16} className="text-success-600"/>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">UH 1: Termodinamika</h3>
                <p className="text-sm text-default-500 mt-1">Kelas 12 IPA 1</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-default-500 mt-2">
                <Users size={14}/> 32/35 Siswa Hadir
              </div>
            </CardBody>
            <CardFooter className="pt-0">
               <Button size="sm" fullWidth color="success" variant="flat">Pantau Live</Button>
            </CardFooter>
          </Card>

          {/* Card Assessment 2 (Scheduled) */}
          <Card isPressable className="min-w-[280px] max-w-[280px] snap-center border border-default-200">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <Chip size="sm" color="primary" variant="flat">Besok, 08:00</Chip>
                <Calendar size={16} className="text-primary"/>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">UTS Bahasa Inggris</h3>
                <p className="text-sm text-default-500 mt-1">Gabungan Kelas 10</p>
              </div>
               <div className="flex items-center gap-2 text-xs text-default-500 mt-2">
                <FileText size={14}/> 50 Soal Pilihan Ganda
              </div>
            </CardBody>
             <CardFooter className="pt-0">
               <Button size="sm" fullWidth variant="bordered">Edit Jadwal</Button>
            </CardFooter>
          </Card>

          {/* Card Assessment 3 (Finished) */}
          <Card isPressable className="min-w-[280px] max-w-[280px] snap-center border border-default-200">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <Chip size="sm" color="default" variant="flat">Selesai</Chip>
                <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-gray-500">Kuis Matematika</h3>
                <p className="text-sm text-default-400 mt-1">Kelas 11 IPS 2</p>
              </div>
               <div className="flex items-center gap-2 text-xs text-default-400 mt-2">
                <AlertCircle size={14}/> 5 Siswa Remedial
              </div>
            </CardBody>
             <CardFooter className="pt-0">
               <Button size="sm" fullWidth variant="light">Lihat Hasil</Button>
            </CardFooter>
          </Card>

          {/* Spacer Card agar scroll bisa mentok kanan enak dilihat */}
          <div className="min-w-[20px]"></div> 
        </div>
      </div>

      {/* =========================================================
          SECTION 3: RECENT BANK SOAL (DRAFT) - Horizontal Scroll
         ========================================================= */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={22} className="text-warning-600"/> Bank Soal Terbaru
            </h2>
             <p className="text-xs text-default-400">Draft soal yang terakhir Anda edit</p>
          </div>
          <Button 
            size="sm" 
            variant="light" 
            color="primary" 
            endContent={<ChevronRight size={16}/>}
          >
            Lihat Semua
          </Button>
        </div>

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          
          {/* Card Bank Soal 1 */}
          <Card isPressable className="min-w-[240px] max-w-[240px] snap-center border border-default-200 hover:border-warning-300 transition-all">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="h-12 w-12 min-w-[3rem] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                BIO
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">Biologi: Sel Hewan</h4>
                <p className="text-xs text-default-400 mt-1">Update 10m lalu</p>
              </div>
            </CardBody>
            <CardFooter className="border-t border-default-100 py-2 justify-between">
               <span className="text-xs font-semibold text-default-500">20 Soal</span>
               <Chip size="sm" variant="dot" color="warning" className="border-none text-xs">Draft</Chip>
            </CardFooter>
          </Card>

          {/* Card Bank Soal 2 */}
          <Card isPressable className="min-w-[240px] max-w-[240px] snap-center border border-default-200 hover:border-warning-300 transition-all">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="h-12 w-12 min-w-[3rem] rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
                MTK
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">Aljabar Linear</h4>
                <p className="text-xs text-default-400 mt-1">Update 2j lalu</p>
              </div>
            </CardBody>
             <CardFooter className="border-t border-default-100 py-2 justify-between">
               <span className="text-xs font-semibold text-default-500">45 Soal</span>
               <Chip size="sm" variant="dot" color="success" className="border-none text-xs">Ready</Chip>
            </CardFooter>
          </Card>

          {/* Card Bank Soal 3 */}
          <Card isPressable className="min-w-[240px] max-w-[240px] snap-center border border-default-200 hover:border-warning-300 transition-all">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="h-12 w-12 min-w-[3rem] rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                SEJ
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">Perang Dunia II</h4>
                <p className="text-xs text-default-400 mt-1">Update Kemarin</p>
              </div>
            </CardBody>
             <CardFooter className="border-t border-default-100 py-2 justify-between">
               <span className="text-xs font-semibold text-default-500">15 Soal</span>
               <Chip size="sm" variant="dot" color="warning" className="border-none text-xs">Draft</Chip>
            </CardFooter>
          </Card>
           
           {/* Add New Quick Card */}
           <Card isPressable className="min-w-[100px] max-w-[100px] snap-center border border-dashed border-default-300 bg-default-50 flex items-center justify-center">
             <div className="flex flex-col items-center gap-2 text-default-400">
               <Plus />
               <span className="text-xs font-semibold">Buat</span>
             </div>
           </Card>

           <div className="min-w-[20px]"></div> 
        </div>
      </div>
    </div>
  );
}
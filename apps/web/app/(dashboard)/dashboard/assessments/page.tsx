'use client';

import React from "react";
import {
  Card, CardHeader, CardBody, CardFooter, 
  Chip, Button, Input, Divider
} from "@nextui-org/react";

// 1. DATA DUMMY (Sama seperti sebelumnya)
const assessments = [
  {
    id: 1,
    title: "Ujian Tengah Semester Ganjil",
    subject: "Matematika",
    status: "active",
    questions: 50,
    duration: "90 Menit",
    created_at: "10 Jan 2024",
  },
  {
    id: 2,
    title: "Kuis Logika Dasar",
    subject: "Informatika",
    status: "draft",
    questions: 10,
    duration: "15 Menit",
    created_at: "12 Jan 2024",
  },
  {
    id: 3,
    title: "Ujian Harian Fisika: Hukum Newton",
    subject: "Fisika",
    status: "finished",
    questions: 25,
    duration: "60 Menit",
    created_at: "20 Des 2023",
  },
  {
    id: 4,
    title: "Latihan Soal Bahasa Inggris",
    subject: "Bahasa Inggris",
    status: "draft",
    questions: 15,
    duration: "30 Menit",
    created_at: "14 Jan 2024",
  },
];

// Mapping warna status
const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  draft: "warning",
  finished: "default",
};

const statusLabelMap: Record<string, string> = {
  active: "Sedang Aktif",
  draft: "Draft",
  finished: "Selesai",
};

export default function AssessmentPage() {
  const [searchValue, setSearchValue] = React.useState("");

  // Filter data berdasarkan pencarian
  const filteredAssessments = assessments.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Bank Soal & Ujian</h2>
           <p className="text-gray-500 text-sm">Kelola daftar ujian siswa di sini</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <Input
                isClearable
                className="w-full md:w-[300px]"
                placeholder="Cari ujian..."
                startContent={
                    <span className="text-gray-400">🔍</span>
                }
                value={searchValue}
                onValueChange={setSearchValue}
            />
            <Button color="primary" className="font-semibold">
                + Buat Baru
            </Button>
        </div>
      </div>

      {/* --- GRID KARTU (PENGGANTI TABEL) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssessments.map((item) => (
            <Card key={item.id} className="border-none hover:scale-[1.02] transition-transform duration-200" shadow="sm">
                
                {/* Header: Status & Subject */}
                <CardHeader className="flex justify-between items-start px-5 pt-5 pb-0">
                    <div className="flex flex-col">
                        <p className="text-tiny uppercase font-bold text-gray-400">{item.subject}</p>
                        <h4 className="font-bold text-large text-gray-800 leading-tight mt-1">{item.title}</h4>
                    </div>
                    <Chip 
                        className="capitalize border-none" 
                        color={statusColorMap[item.status]} 
                        size="sm" 
                        variant="flat"
                    >
                        {statusLabelMap[item.status]}
                    </Chip>
                </CardHeader>

                {/* Body: Statistik Singkat */}
                <CardBody className="px-5 py-4">
                    <div className="flex gap-4 text-small text-gray-500 bg-gray-50 p-3 rounded-lg mt-2">
                        <div className="flex items-center gap-1">
                            <span>📝</span>
                            <span className="font-semibold text-gray-700">{item.questions}</span> Soal
                        </div>
                        <div className="h-full w-[1px] bg-gray-200"></div>
                        <div className="flex items-center gap-1">
                            <span>⏱️</span>
                            <span className="font-semibold text-gray-700">{item.duration}</span>
                        </div>
                    </div>
                </CardBody>

                <Divider className="bg-gray-100" />

                {/* Footer: Tombol Aksi */}
                <CardFooter className="flex justify-between px-5 py-4 gap-2">
                    <div className="text-tiny text-gray-400">
                        {item.created_at}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="light" color="default" isIconOnly>
                           ✏️
                        </Button>
                        <Button size="sm" variant="solid" color="primary" className="font-medium">
                           Detail
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        ))}
      </div>

      {/* Pesan jika tidak ada hasil pencarian */}
      {filteredAssessments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
              <p>Tidak ada ujian yang ditemukan dengan kata kunci "{searchValue}"</p>
          </div>
      )}
    </div>
  );
}
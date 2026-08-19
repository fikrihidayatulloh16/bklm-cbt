// apps/web/features/question-bank/components/QuestionBankClient.tsx
'use client'; // 🚨 WAJIB ADA!

import React from "react";
import NextLink from "next/link";
import { Button, Input, Spinner, useDisclosure } from "@nextui-org/react";
import { Plus, Search } from "lucide-react";
import AssessmentCard from "@/features/assessments/components/AssessmentCard"; 
import { useQBListLogic } from "../hooks/useQBListLogic";

interface Props {
  userId: string; // 👈 Terima string murni dari Server
}

export default function QuestionBankClient({ userId }: Props) {
  // 1. Hook sekarang aman dipanggil di sini karena ini adalah Client Component
  const { 
    isLoading, 
    searchValue, 
    setSearchValue, 
    filteredQuestionBank 
  } = useQBListLogic(userId);

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Soal</h1>
          <p className="text-sm text-gray-500">Kelola kumpulan soal untuk ujian dan tugas.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <Input
            isClearable
            placeholder="Cari bank soal..."
            startContent={<Search size={18} className="text-gray-400" />}
            value={searchValue}
            onValueChange={setSearchValue}
            className="w-full md:w-64"
          />
          <Button 
              as={NextLink} // Trik NextUI: Rendernya Button, tapi fungsinya Link
              href="/question-bank/create" // Arahkan ke rute baru
              color="primary" 
              className="font-semibold shadow-md"
              startContent={<Plus size={20} />}
            >
              Buat Baru
            </Button>
        </div>
      </div>

      {/* CONTENT LIST */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner label="Memuat bank soal..." color="primary" />
        </div>
      ) : filteredQuestionBank.length === 0 ? (
        <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-500">Tidak ada bank soal yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestionBank.map((qb) => (
            <AssessmentCard 
              id={qb.id} 
              // Oper props sesuai kebutuhan AssessmentCard Anda
              title={qb.title}
              createdAt={qb.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
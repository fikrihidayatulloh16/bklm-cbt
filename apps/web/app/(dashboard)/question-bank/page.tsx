'use client';

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Button, Input, Spinner, useDisclosure 
} from "@nextui-org/react";
import { Plus, Search } from "lucide-react"; // Gunakan icon agar lebih modern
import api from "@/lib/api"; 
import AssessmentCard from "@/features/assessments/components/AssessmentCard"; // Import Card yang baru dibuat
import { QuestionBankListType } from "@/features/question-bank/types/question-bank.types";
import { useQBListLogic } from "@/features/question-bank/hooks/useQBListLogic";
//import CreateAssessmentModal from "@/components/fragments/CreateAssessmentModal"; // Import Modal yang tadi

// Definisikan Tipe Data
interface Props {
  data: QuestionBankListType[]
}

export default function AssessmentPage() {
  //Mengambil dataa yang dibutuhkan dari hooks
  const {isLoading, searchValue, setSearchValue, filteredQuestionBank} = useQBListLogic()

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-default-900">Bank Soal & Ujian</h2>
           <p className="text-default-500 text-sm">Kelola daftar ujian yang tersedia.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
                isClearable
                startContent={<Search size={18} className="text-default-400" />}
                className="w-full md:w-[300px]"
                placeholder="Cari ujian..."
                value={searchValue}
                onValueChange={setSearchValue}
            />
            {/* BUTTON TRIGGERS MODAL */}
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

      {/* CONTENT SECTION */}
      {isLoading ? (
        <div className="flex justify-center py-20">
            <Spinner label="Memuat data..." color="primary" size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuestionBank.length > 0 ? (
                filteredQuestionBank.map((item) => (
                    // Menggunakan Komponen Terpisah agar Rapi
                    <AssessmentCard 
                      key={item.id} 
                      id={item.id} 
                      title={item.title} 
                      createdAt={item.created_at.toString()} 
                    />
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-default-400 border-2 border-dashed border-default-200 rounded-xl">
                    <p>Belum ada data ujian yang cocok.</p>
                    <Button as={NextLink} href="/question-bank/create" variant="light" color="primary" className="mt-2">
                      Buat assessment sekarang
                    </Button>
                </div>
            )}
        </div>
      )}

      {/* MODAL COMPONENT "<CreateAssessmentModal isOpen={isOpen} onOpenChange={onOpenChange}" /> (Ditaruh di paling bawah) */}
      
    </div>
  );
}
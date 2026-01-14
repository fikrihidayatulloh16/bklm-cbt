'use client';

import React, { useEffect, useState } from "react";
import {
  Button, Input, Spinner, useDisclosure 
} from "@nextui-org/react";
import { Plus, Search } from "lucide-react"; // Gunakan icon agar lebih modern
import api from "@/lib/api"; 
import AssessmentCard from "@/components/ui/AssessmentCard"; // Import Card yang baru dibuat
//import CreateAssessmentModal from "@/components/fragments/CreateAssessmentModal"; // Import Modal yang tadi

// Definisikan Tipe Data
interface Assessment {
  id: string;
  title: string;
  description?: string;
  createdAt: string; 
}

export default function AssessmentPage() {
  // 1. Setup Modal Hook (NextUI)
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // 2. State Data
  const [searchValue, setSearchValue] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch Data Logic
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/assessments'); 
      setAssessments(response.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil saat pertama kali load
  useEffect(() => {
    fetchData();
  }, []);

  // Panggil ulang saat Modal ditutup (agar data baru muncul)
  // Kita passing function ini ke onOpenChange nanti atau handle di dalam modal via router.refresh()
  // Tapi karena ini SPA, lebih aman trigger fetch ulang manual jika perlu.
  // Note: Di code Modal sebelumnya kita pakai router.refresh(), itu valid untuk Server Component, 
  // tapi untuk Client Fetching seperti ini, router.refresh() kadang tidak men-trigger useEffect.
  // Solusi: Kita akan biarkan router.refresh() bekerja, atau passing fetch callback.
  // Untuk kesederhanaan, kita andalkan router.refresh() dulu.

  // 4. Filter Logic
  const filteredAssessments = assessments.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

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
              onPress={onOpen} 
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
            {filteredAssessments.length > 0 ? (
                filteredAssessments.map((item) => (
                    // Menggunakan Komponen Terpisah agar Rapi
                    <AssessmentCard 
                      key={item.id} 
                      id={item.id} 
                      title={item.title} 
                      createdAt={item.createdAt} 
                    />
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-default-400 border-2 border-dashed border-default-200 rounded-xl">
                    <p>Belum ada data ujian yang cocok.</p>
                    <Button variant="light" color="primary" onPress={onOpen} className="mt-2">
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
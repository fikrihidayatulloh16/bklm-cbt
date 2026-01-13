'use client';

import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, CardFooter, 
  Chip, Button, Input, Divider, Spinner
} from "@nextui-org/react";
import api from "@/lib/api"; // Import api yang kita buat tadi

// Definisikan Tipe Data (Biar TypeScript tidak marah)
interface Assessment {
  id: string;
  title: string;
  // Sesuaikan field ini dengan apa yang dikembalikan Backend Anda (Prisma)
  // Kalau backend belum kirim subject/duration, nanti akan undefined (kita handle)
  createdAt: string; 
}

export default function AssessmentPage() {
  const [searchValue, setSearchValue] = useState("");
  
  // State untuk Data Asli
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil Endpoint Backend
        const response = await api.get('/assessments'); 
        setAssessments(response.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data client-side (untuk sementara)
  const filteredAssessments = assessments.filter((item) =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* HEADER & SEARCH (Sama seperti sebelumnya) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Bank Soal & Ujian</h2>
           <p className="text-gray-500 text-sm">Data diambil dari Database</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Input
                isClearable
                className="w-full md:w-[300px]"
                placeholder="Cari ujian..."
                value={searchValue}
                onValueChange={setSearchValue}
            />
            <Button color="primary" className="font-semibold">+ Buat Baru</Button>
        </div>
      </div>

      {/* TAMPILAN LOADING */}
      {isLoading ? (
        <div className="flex justify-center py-20">
            <Spinner label="Mengambil data dari server..." color="primary" />
        </div>
      ) : (
        /* GRID KARTU */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssessments.length > 0 ? (
                filteredAssessments.map((item) => (
                    <Card key={item.id} className="border-none hover:scale-[1.02] transition-transform duration-200" shadow="sm">
                        <CardHeader className="flex justify-between items-start px-5 pt-5 pb-0">
                            <div className="flex flex-col">
                                <p className="text-tiny uppercase font-bold text-gray-400">UMUM</p>
                                <h4 className="font-bold text-large text-gray-800 leading-tight mt-1">
                                    {item.title}
                                </h4>
                            </div>
                            <Chip size="sm" variant="flat" color="success">Active</Chip>
                        </CardHeader>
                        <CardBody className="px-5 py-4">
                            <div className="text-small text-gray-500 bg-gray-50 p-3 rounded-lg">
                                ID: {item.id}
                            </div>
                        </CardBody>
                        <Divider className="bg-gray-100" />
                        <CardFooter className="px-5 py-4 text-tiny text-gray-400">
                            Dibuat: {new Date(item.createdAt).toLocaleDateString()}
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center py-10 text-gray-400">
                    Belum ada data ujian. Silakan buat baru.
                </div>
            )}
        </div>
      )}
    </div>
  );
}
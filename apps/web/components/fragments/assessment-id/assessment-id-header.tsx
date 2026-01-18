'use client';

import { Button, Chip, Snippet } from "@nextui-org/react";
import { ArrowLeft, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface AssessmentHeaderProps {
  title: string;
  description: string;
  status: string;
  id: string;
  onPublishClick: () => void; // Fungsi yang dipanggil saat tombol diklik
}

export default function AssessmentHeader({ 
  title, description, status, id, onPublishClick 
}: AssessmentHeaderProps) {
  const router = useRouter();
  
  // Link untuk siswa (bisa disesuaikan port/domainnya nanti)
  const examLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/exam/${id}` 
    : '';

  return (
    <div className="flex flex-col gap-4 border-b pb-6 border-gray-200">
      {/* Tombol Back */}
      <Button 
        variant="light" 
        className="w-fit px-0 text-gray-500" 
        startContent={<ArrowLeft size={18} />}
        onPress={() => router.back()}
      >
        Kembali ke Daftar
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Bagian Kiri: Judul & Status */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            {title}
            <Chip 
              color={status === 'PUBLISHED' ? "success" : "warning"} 
              variant="flat" 
              size="sm"
            >
              {status || "DRAFT"}
            </Chip>
          </h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>

        {/* Bagian Kanan: Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Link Ujian (Selalu Muncul) */}
          <Snippet 
            symbol="#" 
            color="primary" 
            variant="flat" 
            codeString={examLink}
            className="w-full md:w-auto"
          >
            Link Ujian
          </Snippet>

          {/* Tombol Publish (Hanya muncul jika masih DRAFT) */}
          {status !== 'PUBLISHED' && (
            <Button 
              onPress={onPublishClick}
              color="primary" 
              className="font-semibold shadow-md w-full md:w-auto"
              startContent={<Play size={18} />}
            >
              Publish Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardBody, Chip, Divider, Spinner, useDisclosure } from "@nextui-org/react";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import api from "@/lib/api";
import { showToast } from '@/components/ui/toast/toast-trigger';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal.';

// Tipe Data untuk Tampilan Detail
interface QuestionDetail {
  id: string;
  text: string;
  type: string;
  category: string;
  options: { label: string; score: number }[];
}

interface BankDetail {
  id: string;
  title: string;
  description?: string;
  questions: QuestionDetail[];
}

export default function QuestionBankDetailPage() {
  const params = useParams(); // Ambil ID dari URL
  const router = useRouter();
  
  const [data, setData] = useState<BankDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // State untuk menyimpan ID mana yang mau dihapus
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/question-bank/${params.id}`);
        console.log(res.data);
        
        setData(res.data);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
        showToast({
            type: "danger",
            message: "Gagal",
            description: "Data tidak ditemukan!",
        });
        router.push('/dashboard/assessments');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchDetail();
  }, [params.id, router]);

  // Aksi
  // 3. Trigger saat tombol sampah diklik
  const handleDeleteClick = (id: string) => {
    setSelectedIdToDelete(id); // Simpan ID-nya
    onOpen(); // Buka Modal
  };

  // 4. Eksekusi ke API
  const confirmDelete = async () => {
    if (!selectedIdToDelete) return;

    setIsDeleting(true); // Nyalakan loading di tombol modal
    try {
      // Panggil API Delete Backend
      const res = await api.delete(`question-bank/${selectedIdToDelete}`);

      router.push('/question-bank');

      showToast({ type: "success", message: "Berhasil", description: 'Data berhasil dihapus' });
      
      // ... Lakukan refresh data / refresh router di sini ...
      
      onClose(); // Tutup modal otomatis
    } catch (error) {
      showToast({ type: "danger", message: "Gagal menghapus data" });
    } finally {
      setIsDeleting(false); // Matikan loading
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER: Judul & Tombol Back */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <Button isIconOnly variant="light" onPress={() => router.back()}>
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{data.title}</h1>
                <p className="text-default-500 text-sm">{data.description || "Tidak ada deskripsi"}</p>
            </div>
        </div>

        <div>
            {/* Tombol Hapus */}
            <Button onPress={() => handleDeleteClick(data.id)}
            className='mx-1' color="danger" variant="flat" startContent={<Trash size={18} />}>
                Hapus Soal
            </Button>
            <DeleteConfirmModal 
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Hapus Soal?"
                description="Soal yang dihapus tidak bisa dikembalikan lagi."
            />
            
            {/* Tombol Edit (Nanti difungsikan) */}
            <Button color="primary" variant="flat" startContent={<Edit size={18} />}>
                Edit Soal
            </Button>
        </div>
      </div>

      <Divider />

      {/* LIST SOAL (READ ONLY MODE) */}
      <div className="space-y-4">
        {data.questions.map((q, index) => (
            <Card key={q.id} className="border border-default-200" shadow="sm">
                <CardBody className="gap-3">
                    {/* Header Soal: Nomor & Kategori */}
                    <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                            <Chip size="sm" color="primary" variant="flat">No. {index + 1}</Chip>
                            <Chip size="sm" variant="bordered">{q.type}</Chip>
                            <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                                {q.category}
                            </span>
                        </div>
                    </div>

                    {/* Teks Soal */}
                    <div className="text-lg font-medium text-default-800 pl-1">
                        {q.text}
                    </div>

                    {/* Opsi Jawaban */}
                    {q.options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt, i) => (
                                <div 
                                    key={i} 
                                    className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                                        opt.score > 0 
                                        ? "bg-success-50 border-success-200 text-success-800 font-medium" 
                                        : "bg-default-50 border-default-100 text-default-600"
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.score > 0 && <span className="text-xs bg-white px-2 py-1 rounded border border-success-200">Poin: {opt.score}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-default-50 text-default-400 text-sm italic rounded-lg">
                            Soal Esai (Tidak ada opsi jawaban)
                        </div>
                    )}
                </CardBody>
            </Card>
        ))}

        {data.questions.length === 0 && (
            <div className="text-center py-10 text-default-400">
                Belum ada butir soal di bank ini.
            </div>
        )}
      </div>
    </div>
  );
}
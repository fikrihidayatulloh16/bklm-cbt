"use client";

import { useQBDetailLogic } from '@/features/question-bank/hooks/useQBDetailLogic';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal.'; 
import { QuestionCard } from '@/features/question-bank/components/QuestionCard'; 
import { Spinner, Button, Divider } from '@nextui-org/react';
import { ArrowLeft, Trash, Edit } from 'lucide-react';
import NextLink from "next/link";

export default function QuestionBankDetailPage() {
  
  const { 
    isLoading, 
    qbDetail, 
    handleDeleteClick, 
    isOpen, 
    onOpenChange, 
    onConfirmDelete, 
    isDeleting 
  } = useQBDetailLogic();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!qbDetail) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <Button as={NextLink} isIconOnly variant="light" href='/question-bank'>
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{qbDetail.title}</h1>
                <p className="text-default-500 text-sm">{qbDetail.description || "Tidak ada deskripsi"}</p>
            </div>
        </div>

        <div>
            <Button 
              onPress={() => handleDeleteClick(qbDetail.id)}
              className='mx-1' 
              color="danger" 
              variant="flat" 
              startContent={<Trash size={18} />}
            >
                Hapus Soal
            </Button>
            
            {/* Tombol Edit */}
            <Button color="primary" variant="flat" startContent={<Edit size={18} />}>
                Edit Soal
            </Button>
        </div>
      </div>

      <Divider />

      {/* LIST SOAL - Jauh lebih rapi */}
      <div className="space-y-4">
        {qbDetail.questions && qbDetail.questions.length > 0 ? (
            qbDetail.questions.map((q, index) => (
                <QuestionCard key={q.id} question={q} index={index} />
            ))
        ) : (
            <div className="text-center py-10 text-default-400">
                Belum ada butir soal di bank ini.
            </div>
        )}
      </div>

      {/* MODAL DI BAWAH SENDIRI */}
      <DeleteConfirmModal 
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={onConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Bank Soal?"
        description="Data yang dihapus tidak bisa dikembalikan lagi."
      />

    </div>
  );
}
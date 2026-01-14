'use client';

import React, { useEffect, useState } from "react";
import { 
  Button, Spinner, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Select, SelectItem,
  Card, CardBody, Chip, Input 
} from "@nextui-org/react";
import { Plus, Calendar, Clock, FileText, CheckCircle2 } from "lucide-react"; 
import api from "@/lib/api"; 
import { useRouter } from "next/navigation";

// Tipe Data
interface Assessment {
  id: string;
  title: string;
  duration: number;
  status: string;
  description?: string;
  _count?: { questions: number };
}

interface QuestionBankOption {
  id: string;
  title: string;
  _count?: { questions: number };
}

export default function AssessmentPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // State
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [bankOptions, setBankOptions] = useState<QuestionBankOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "60", // Default string untuk Input
    bankId: ""
  });

  // Fetch List Assessment
  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/assessments');
      // Defensive check: pastikan array
      const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setAssessments(dataArray);
    } catch (error) {
      console.error("Gagal load assessment", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Bank Options
  const fetchBankOptions = async () => {
    try {
      const res = await api.get('/question-banks');
      // Defensive check
      const bankArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBankOptions(bankArray);
    } catch (error) {
      setBankOptions([]);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleOpenModal = () => {
    fetchBankOptions();
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.bankId || !formData.title) {
        alert("Mohon pilih Bank Soal dan isi Judul");
        return;
    }

    setIsSubmitting(true);
    try {
      // Logika Expired/Duration (Sesuai diskusi sebelumnya)
      const expiredDate = new Date(Date.now() + parseInt(formData.duration) * 60000);

      await api.post('/assessments/from-bank', {
        title: formData.title,
        description: formData.description,
        expired_at: expiredDate,
        question_bank_id: formData.bankId 
      });

      // Reset Form sederhana
      setFormData({ title: "", description: "", duration: "60", bankId: "" });
      
      onOpenChange(); // Tutup modal
      fetchAssessments(); // Refresh data
      alert("Jadwal Ujian berhasil dibuat!");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Gagal membuat assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // PERBAIKAN LAYOUT DISINI (WRAPPER UTAMA)
  // ----------------------------------------------------------------------
  return (
    // Tambahkan 'w-full', 'h-full', 'p-6' agar punya jarak napas dan tidak menabrak
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      
      {/* HEADER PAGE - Menggunakan justify-between agar Judul di Kiri, Tombol di Kanan */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
           <h2 className="text-2xl font-bold text-default-900">Jadwal Ujian</h2>
           <p className="text-default-500 text-sm">Kelola sesi ujian aktif untuk siswa.</p>
        </div>
        
        <Button 
          onPress={handleOpenModal}
          color="primary" 
          className="font-semibold shadow-md"
          startContent={<Plus size={20} />}
        >
          Buat Jadwal Baru
        </Button>
      </div>

      {/* LIST CONTENT */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner label="Memuat jadwal..." color="primary" /></div>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-default-200 rounded-xl bg-default-50 text-center">
            <div className="bg-default-100 p-4 rounded-full mb-3">
                <Calendar size={32} className="text-default-400" />
            </div>
            <p className="text-default-600 font-medium">Belum ada jadwal ujian.</p>
            <p className="text-default-400 text-sm mb-4 max-w-xs mx-auto">
                Silakan buat assessment baru dengan mengambil data dari Bank Soal.
            </p>
            <Button size="sm" color="primary" variant="flat" onPress={handleOpenModal}>
                Buat Sekarang
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {assessments.map((item) => (
                 <Card 
                    key={item.id} 
                    className="border border-default-200 hover:border-primary-300 transition-colors" 
                    shadow="sm"
                    isPressable // Jadikan tombol
                    onPress={() => router.push(`/assessments/${item.id}`)} // Navigasi Programatik
                >
                    <CardBody className="gap-3 p-5">
                        <div className="flex justify-between items-start">
                            {/* Status Chip */}
                            <Chip 
                                size="sm" 
                                color={!item.status || item.status === 'DRAFT' ? "warning" : "success"} 
                                variant="flat"
                                startContent={<CheckCircle2 size={12} />}
                            >
                                {item.status || "ACTIVE"}
                            </Chip>
                            
                            {/* Duration Badge */}
                            <div className="flex items-center text-xs font-medium text-default-500 bg-default-100 px-2 py-1 rounded-full">
                                <Clock size={12} className="mr-1" />
                                <span>{item.duration || 60} Menit</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-lg leading-tight text-default-800">{item.title}</h3>
                            <p className="text-small text-default-500 mt-1 line-clamp-2">
                                {item.description || "Tidak ada deskripsi ujian."}
                            </p>
                        </div>
                        
                        {/* Footer Info (Optional) */}
                        <div className="pt-2 border-t border-default-100 flex justify-between items-center text-xs text-default-400 mt-2">
                            <span className="flex items-center gap-1">
                                <FileText size={14} />
                                {item._count?.questions || 0} Soal
                            </span>
                            <span className="text-primary cursor-pointer hover:underline font-medium">Detail &rarr;</span>
                        </div>
                    </CardBody>
                 </Card>
             ))}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" size="lg" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Buat Assessment Baru</ModalHeader>
              <ModalBody className="gap-5">
                
                {/* 1. PILIH BANK SOAL (Defensive Code Applied) */}
                <Select
                    label="Pilih Bank Soal"
                    placeholder="Pilih sumber soal..."
                    variant="bordered"
                    isLoading={!bankOptions}
                    selectedKeys={formData.bankId ? [formData.bankId] : []}
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedBank = bankOptions?.find(b => b.id === selectedId);
                        
                        setFormData(prev => ({
                            ...prev, 
                            bankId: selectedId,
                            title: prev.title || (selectedBank ? `Ujian: ${selectedBank.title}` : "")
                        }));
                    }}
                >
                    {(Array.isArray(bankOptions) ? bankOptions : []).map((bank) => (
                        <SelectItem key={bank.id} textValue={bank.title}>
                            {bank.title} ({bank._count?.questions || 0} Soal)
                        </SelectItem>
                    ))}
                </Select>

                {/* 2. JUDUL */}
                <Input
                  label="Judul Ujian"
                  placeholder="Contoh: UTS Fisika Kelas 10"
                  variant="bordered"
                  value={formData.title}
                  onValueChange={(val) => setFormData({...formData, title: val})}
                />

                {/* 3. DESKRIPSI */}
                <Input
                  label="Deskripsi (Opsional)"
                  placeholder="Keterangan singkat..."
                  variant="bordered"
                  value={formData.description}
                  onValueChange={(val) => setFormData({...formData, description: val})}
                />

                {/* 4. DURASI */}
                <Input
                  label="Durasi (Menit)"
                  type="number"
                  variant="bordered"
                  value={formData.duration}
                  onValueChange={(val) => setFormData({...formData, duration: val})}
                  endContent={<span className="text-default-400 text-small">Menit</span>}
                  startContent={<Clock size={16} className="text-default-400" />}
                />

              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button 
                    color="primary" 
                    onPress={handleSubmit} 
                    isLoading={isSubmitting}
                >
                  Simpan & Generate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
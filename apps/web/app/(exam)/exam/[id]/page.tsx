'use client';

import React from "react";
// 1. Import Logic Hook
import { useExamLogic, CLASS_OPTIONS } from "@/hooks/exam/useExamLogic"; 

import { 
  Button, Card, CardBody, Progress, RadioGroup, Radio, 
  Spinner, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem
} from "@nextui-org/react";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, School } from "lucide-react";
import Countdown from 'react-countdown';
import { countdownRenderer } from '@/components/helper/countDownRenderer'; 

// --- PAGE COMPONENT ---
export default function ExamPage() {
  
  // 2. PANGGIL LOGIC (Destructuring)
  const { 
    // State
    step, 
    exam, 
    studentIdentity, 
    answers, 
    currentStep, 
    activeQuestion,
    deadLine, // Pastikan ini direturn di useExamLogic
    
    // Actions
    setStudentIdentity,
    setCurrentStep,
    handleStartExam,
    handleAnswer,
    handleSubmitExam,
    
    // Modal
    isConfirmOpen,
    openConfirmModal,
    closeConfirmModal,
  } = useExamLogic();


  // --- 3. JEMBATAN VARIABLE (ADAPTER) ---
  // Kita buat variable/fungsi "Palsu" agar cocok dengan UI lama Anda
  // Tanpa perlu ubah kodingan JSX di bawah.

  const loading = step === 'LOADING';
  const isStarting = step === 'LOADING'; // Reuse loading state
  
  // Mapping State Identitas (Object -> Single Variable)
  const studentName = studentIdentity.name;
  const className = studentIdentity.className;
  const gender = studentIdentity.gender;

  // Mapping Fungsi Setter (Single Variable -> Object Update)
  const setStudentName = (val: string) => setStudentIdentity(prev => ({ ...prev, name: val }));
  const setclassName = (val: string) => setStudentIdentity(prev => ({ ...prev, className: val }));
  const setGender = (val: string) => setStudentIdentity(prev => ({ ...prev, gender: val }));

  // Mapping Modal
  const isOpen = isConfirmOpen;
  const onOpen = openConfirmModal;
  const onOpenChange = closeConfirmModal;


  // --- RENDERERS (UI ASLI ANDA) ---
  // Tidak ada perubahan struktur di bawah ini, hanya paste kode Anda

  if (loading || !exam) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Memuat..." /></div>;

  // LAYAR 1: FORM IDENTITAS
  if (step === 'IDENTITY') {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md p-4">
                <CardBody className="gap-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">{exam.title}</h1>
                        <p className="text-default-500">Durasi: {exam.duration} Menit</p>
                    </div>
                    
                    <div className="space-y-4">
                        <Input 
                            label="Nama Lengkap" 
                            placeholder="Masukkan Nama Anda"
                            value={studentName} // Sudah dimapping
                            onValueChange={setStudentName} // Sudah dimapping
                        />
                        
                        {/* UPDATE SELECT KELAS */}
                        <Select 
                            label="Kelas" 
                            placeholder="Pilih Kelas" 
                            variant="bordered"
                            startContent={<School size={18} className="text-default-400" />}
                            selectedKeys={className ? [className] : []}
                            onChange={(e) => setclassName(e.target.value)}
                        >
                            {/* Menggunakan CLASS_OPTIONS dari Hook atau konstanta file ini */}
                            {CLASS_OPTIONS.map((name) => (
                                <SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>
                            ))}
                        </Select>

                        <RadioGroup 
                            label="Jenis Kelamin" 
                            orientation="horizontal"
                            value={gender}
                            onValueChange={setGender}
                        >
                            <Radio value="L">Laki-laki</Radio>
                            <Radio value="P">Perempuan</Radio>
                        </RadioGroup>
                    </div>

                    <Button 
                        color="primary" 
                        size="lg" 
                        className="font-bold w-full" 
                        onPress={handleStartExam}
                        isLoading={isStarting}
                    >
                        Mulai Mengerjakan
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
  }

  // LAYAR 3: SELESAI
  if (step === 'FINISHED') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center gap-4">
            <CheckCircle2 size={64} className="text-success" />
            <h1 className="text-3xl font-bold text-gray-800">Ujian Selesai!</h1>
            <p className="text-gray-500 max-w-md">
                Terima kasih, <b>{studentName}</b>. Jawaban Anda telah berhasil disimpan ke sistem. Silakan lapor ke pengawas.
            </p>
            <Button color="primary" variant="ghost" onPress={() => window.close()}>
                Tutup Halaman
            </Button>
        </div>
      );
  }

  // LAYAR 2: UJIAN 
  const questions = exam.questions;
  // Gunakan activeQuestion dari hook atau fallback ke manual
  
  const currentQuestion = activeQuestion || questions[currentStep]; 
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 flex flex-col h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-default-200">
        <div>
            <h1 className="font-bold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">{exam.title}</h1>
            <div className="flex items-center gap-2 text-sm text-default-500 mt-1">
                <span className="hidden md:inline">Soal {currentStep + 1} / {questions.length}</span>
                <Progress size="sm" value={progress} color="success" className="w-24 md:w-32" aria-label="Exam Progress" />
            </div>
            <br />
            <h2 className="font-semibold  md:text-xl truncate max-w-[200px] md:max-w-md">Nama Peserta: {studentIdentity.name}</h2>
            <h2 className=" md:text-xl truncate max-w-[200px] md:max-w-md">Kelas: {studentIdentity.className}</h2>
        </div>

        <div className="ml-auto"> 
        {/* Menggunakan deadLine dari Hook */}
        {deadLine ? (
        <Countdown 
            date={deadLine} 
            renderer={countdownRenderer} 
            onComplete={() => {
                alert("Waktu Habis! Mengirim jawaban...");
                handleSubmitExam(); 
            }} 
        />
        ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-400 font-mono font-bold text-lg md:text-xl animate-pulse">
            <Clock size={20} />
            --:--:--
        </div>
        )}
    </div>
      </div>

      {/* SOAL CARD */}
      <Card className="flex-1 mb-6 border-none shadow-md overflow-y-auto">
        <CardBody className="p-6 md:p-10">
            <div className="mb-8">
                <Chip className="mb-4" variant="flat" color="primary">Nomor {currentStep + 1}</Chip>
                <h2 className="text-xl md:text-2xl font-medium leading-relaxed text-default-900">
                    {currentQuestion?.text}
                </h2>
            </div>

            <RadioGroup 
                // Pastikan ini mengambil dari object answers menggunakan ID soal aktif
                value={answers[currentQuestion?.id] || ""} 

                onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
            >
                {currentQuestion?.options.map((opt) => (
                    <Radio 
                        key={opt.id} 
                        value={opt.id} // Pastikan value ini adalah ID opsi (UUID)
                    >
                        {opt.label}
                    </Radio>
                ))}
            </RadioGroup>
        </CardBody>
      </Card>

      {/* FOOTER NAVIGASI */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-default-200">
         <Button 
            variant="flat" 
            startContent={<ChevronLeft />}
            isDisabled={currentStep === 0}
            onPress={() => setCurrentStep(curr => curr - 1)}
         >
            Sebelumnya
         </Button>

         {isLastQuestion ? (
             <Button 
                color="success" 
                className="font-bold text-white"
                endContent={<CheckCircle2 />}
                onPress={onOpen} 
             >
                Selesai
             </Button>
         ) : (
             <Button 
                color="primary" 
                endContent={<ChevronRight />}
                onPress={() => setCurrentStep(curr => curr + 1)}
             >
                Selanjutnya
             </Button>
         )}
      </div>

      {/* MODAL KONFIRMASI */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Kumpulkan Ujian?</ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center text-center gap-3">
                    <AlertTriangle size={48} className="text-warning" />
                    <p>Anda yakin ingin mengakhiri ujian? Jawaban tidak dapat diubah setelah dikumpulkan.</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button color="success" onPress={handleSubmitExam} className="text-white">
                    Ya, Kumpulkan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
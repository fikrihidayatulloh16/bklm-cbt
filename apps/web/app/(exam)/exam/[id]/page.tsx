'use client';

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Button, Card, CardBody, Progress, RadioGroup, Radio, 
  Spinner, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input, Select, SelectItem
} from "@nextui-org/react";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, User, School } from "lucide-react";
import api from "@/lib/api";
import Countdown from 'react-countdown';
import { countdownRenderer } from '@/components/helper/countDownRenderer'; // Sesuaikan path import

// --- TIPE DATA ---
interface Option {
  id: string;
  label: string;
  score?: number;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
}

interface ExamData {
  id: string;
  title: string;
  duration: number; 
questions: Question[];
}

// Data Dummy Kelas (Nanti bisa fetch dari API /classes jika ada)
// OPSI KELAS (Value-nya sekarang Nama Kelas langsung, bukan ID aneh)
const CLASS_OPTIONS = [
    "X - IPA 1",
    "X - IPA 2",
    "X - IPS 1",
    "X - IPS 2",
    "XI - IPA 1",
];

type ExamStep = 'IDENTITY' | 'EXAM' | 'FINISHED';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // STATE UTAMA
  const [step, setStep] = useState<ExamStep>('IDENTITY');
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // STATE FORM IDENTITAS
  const [studentName, setStudentName] = useState("");
  const [gender, setGender] = useState("L");
  const [className, setclassName] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // STATE INTERAKSI UJIAN
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // local state untuk UI
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [deadLine, setDeadLine] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async (savedId: string) => {
    try {
        // Panggil API untuk ambil detail submission
        // Pastikan Anda punya endpoint GET /submissions/:id di backend
        console.log('session', savedId);
        
        const res = await api.get(`/exam/${savedId}`);
        const data = res.data; // Sesuaikan struktur response backend Anda

        // Cek Status
        if (data.status === 'FINISHED') {
            // Kalau sudah selesai, hapus dari storage biar tidak nyangkut
            localStorage.removeItem('active_submission_id');
            alert("Ujian ini sudah diselesaikan.");
            return;
        }

        // Kalau masih IN_PROGRESS, Restore State!
        setSubmissionId(savedId);
        
        // Restore Identitas (jika perlu)
        setStudentName(data.student_name);
        setclassName(data.class_name);

        // Restore Timer (PENTING)
        // Ambil deadline dari assessment terkait
        if (data.assessment && data.assessment.expired_at) {
             setDeadLine(new Date(data.assessment.expired_at));
        }

        // Langsung lompat ke halaman soal
        setStep('EXAM'); 
        
    } catch (error) {
        console.error("Gagal restore sesi:", error);
        // Jika error (misal 404), hapus storage agar user bisa login ulang
        localStorage.removeItem('active_submission_id');
    }
};

  // Saat Halaman di-Refresh (useEffect)
    useEffect(() => {
    // Cek apakah ada ujian nyangkut?
    const savedId = localStorage.getItem('active_submission_id');
    if (savedId) {
        // Panggil API untuk cek status, kalau masih IN_PROGRESS, langsung masuk mode ujian
        checkStatus(savedId);
    }
    }, [])

  // 1. FETCH DATA UJIAN (Load di awal)
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exam/${params.id}`);
        const data = res.data;
        setExam(data);
        setTimeLeft(data.duration * 60);
      } catch (error) {
        console.error(error);
        alert("Gagal memuat ujian. Pastikan Link benar.");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchExam();
  }, [params.id]);

  // 2. LOGIKA TIMER (Hanya jalan saat step == 'EXAM')
  useEffect(() => {
    if (step !== 'EXAM') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [step]); // Dependency ganti ke 'step'

  // --- ACTIONS ---

  // A. MULAI UJIAN (POST /start)
  const handleStartExam = async () => {
    // Validasi pakai className
    if (!studentName || !className) {
        alert("Mohon lengkapi Nama dan Kelas!");
        return;
    }

    

    setIsStarting(true);
    try {
        const res = await api.post(`/submissions/${params.id}/start`, {
            assessment_id: params.id,
            student_name: studentName,
            gender: gender,
            
            // PERUBAHAN: Kirim string class_name
            class_name: className 
        });

        const subId = res.data.submission_id;
        localStorage.setItem('active_submission_id', subId);
        setSubmissionId(subId);

        const resultData = res.data.data;

        const deadlineDate = new Date(resultData.deadline);

        console.log('deadline= ', deadlineDate);
        


        setSubmissionId(res.data.data.submission_id);
        setDeadLine(deadlineDate)
        setStep('EXAM');
    } catch (error) {
        // ... error handling
    } finally {
        setIsStarting(false);
    }
  };

  // B. SIMPAN JAWABAN (PUT /answer)
  const handleAnswer = async (questionId: string, optionId: string) => {
    // 1. Update UI dulu biar cepat (Optimistic UI)
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

    // 2. Kirim ke Backend (Silent Request)
    if (submissionId) {
        try {
            await api.put(`/submissions/${submissionId}/answer`, {
                question_id: questionId,
                option_id: optionId,
                text_value: "" // Kosongkan jika multiple choice
            });
        } catch (error) {
            console.error("Gagal menyimpan jawaban ke server", error);
            // Opsional: Kasih indikator error kecil
        }
    }
  };

  // C. SELESAI UJIAN (PUT /finish)
  const handleSubmitExam = async () => {
    if (!submissionId) return;

    try {
        setLoading(true);
        // Panggil Endpoint Finish
        await api.put(`/submissions/${submissionId}/finish`);
        
        setStep('FINISHED');
        onOpenChange(); // Tutup modal jika terbuka
    } catch (error: any) {
        alert(error.response?.data?.message || "Gagal mengumpulkan ujian.");
    } finally {
        setLoading(false);
    }
  };

  // FORMAT TIME
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDERERS ---

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
                            // ...
                            onValueChange={setStudentName}
                        />
                        
                        {/* UPDATE SELECT KELAS */}
                        <Select 
                            label="Kelas" 
                            placeholder="Pilih Kelas" 
                            variant="bordered"
                            startContent={<School size={18} className="text-default-400" />}
                            
                            // Bind ke state className
                            selectedKeys={className ? [className] : []}
                            onChange={(e) => setclassName(e.target.value)}
                        >
                            {/* Map String Array Sederhana */}
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

  // LAYAR 2: UJIAN (Logic Lama Anda, sudah diintegrasikan)
  const questions = exam.questions;
  const currentQuestion = questions[currentStep];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLastQuestion = currentStep === questions.length - 1;
  console.log("RENDER ULANG - Nilai State deadLine saat ini:", deadLine);

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
        </div>

        <div className="ml-auto"> 
            
        {deadLine ? (
        <Countdown 
            date={deadLine} 
            renderer={countdownRenderer} // Panggil helper yang sudah kita buat
            onComplete={() => {
                // Logic ketika waktu habis
                alert("Waktu Habis! Mengirim jawaban...");
                handleSubmitExam(); 
            }} 
        />
        ) : (
        // Tampilan Loading (Skeleton) saat menunggu API response
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
                value={answers[currentQuestion.id] || ""} 
                onValueChange={(val) => handleAnswer(currentQuestion.id, val)} // Panggil Handle Answer Baru
                className="gap-3"
            >
                {currentQuestion.options.map((opt) => (
                    <Radio 
                        key={opt.id} 
                        value={opt.id}
                        classNames={{
                            base: "max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-primary bg-default-50 m-0",
                            label: "text-default-700 font-medium"
                        }}
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
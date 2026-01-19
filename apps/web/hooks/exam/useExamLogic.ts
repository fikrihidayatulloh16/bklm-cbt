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

 interface UseExamLogicReturn {
    // Data State
    step: 'IDENTITY' | 'EXAM';
    deadline: Date | null;
    submissionId: string;
    answers: Record<string, string>;
    isLoading: boolean;
    isStarting: boolean;
    
    // Fungsi / Action
    handleStartExam: (studentName: string, className: string, gender: string) => Promise<void>;
    handleAnswer: (questionId: string, optionId: string | null, text: string) => void;
    handleSubmitExam: () => void;
    // params,
    // router: any, 
    // isOpen: boolean, 
    // step: string, 
    // exam, 
    // loading,
    // submissionId: string, 
    // studentName: string, 
    // gender: string, 
    // className: string, 
    // isStarting: boolean, 
    // currentStep,
    // answers, 
    // timeLeft, 
    // deadLine: Date, 
    // timerRef,
    // checkStatus, 
    // handleStartExam: (student_name: string, class_name: string), 
    // handleAnswer: (questionId: string, optionId: string), 
    // handleSubmitExam: any, 
    // formatTime: Date,
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

export function useExamLogic(examId: string): UseExamLogicReturn {
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

        // Restore Data
            setSubmissionId(data.id);
            if (data.assessment?.expired_at) {
                setDeadLine(new Date(data.assessment.expired_at));
            }

        // Restore Jawaban (Mapping array ke object)
        const restoredAnswers: Record<string, string> = {};
        if (data.answers) {
            data.answers.forEach((ans: any) => {
                restoredAnswers[ans.question_id] = ans.option_id || ans.text_value;
            });
        }
        setAnswers(restoredAnswers);
        
        setStep('EXAM');
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
    } finally {
        setLoading(false);
    };
}

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

//   if (loading || !exam) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" label="Memuat..." /></div>;

  // LAYAR 1: FORM IDENTITAS
  if (step === 'IDENTITY') {
    return (
        {params,
            router, isOpen, step, exam, loading,
            submissionId, studentName, gender, className, isStarting, currentStep,
            answers, timeLeft, deadLine, timerRef,
            checkStatus, handleStartExam, handleAnswer, handleSubmitExam, formatTime,
        }
    )
}

}
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDisclosure } from "@nextui-org/react"; // Hanya hook ini yang butuh diimport dari UI lib
import api from "@/lib/api";

// --- 1. DEFINISI TIPE DATA (Export agar bisa dipakai di Page) ---

export interface Option {
  id: string;
  label: string;
  numeric_value: number;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
}

export interface ExamData {
  id: string;
  title: string;
  description?: string; // Opsional: Tambahan deskripsi
  duration: number;
  questions: Question[];
  // Tambahan field server (opsional)
  expired_at?: string; 
}

// Interface yang TADI HILANG (Penyebab Error Utama)
export interface StudentIdentity {
  name: string;
  className: string;
  gender: string;
}

// Opsi Kelas (Export agar bisa dipakai di Dropdown UI)
export const CLASS_OPTIONS = [
    "X - IPA 1",
    "X - IPA 2",
    "X - IPS 1",
    "X - IPS 2",
    "XI - IPA 1",
];

export type ExamStep = 'LOADING' | 'IDENTITY' | 'EXAM' | 'FINISHED' | 'ERROR';

// --- 2. LOGIC HOOK ---

export const useExamLogic = () => {
  // --- A. HOOKS UTAMA ---
  const params = useParams(); 
  const router = useRouter(); 
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); 

  // --- B. STATE MANAGEMENT ---
  const [step, setStep] = useState<ExamStep>('LOADING');
  
  // Perbaikan: Gunakan ExamData | null, bukan any
  const [exam, setExam] = useState<ExamData | null>(null); 
  
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  const [studentIdentity, setStudentIdentity] = useState<StudentIdentity>({
    name: "",
    className: "",
    gender: "L",
  });

  const [currentStep, setCurrentStep] = useState(0); 
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  
  const [timeLeft, setTimeLeft] = useState<number>(0); 
  const [deadLine, setDeadLine] = useState<Date | null>(null); 
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- C. INITIALIZATION ---
  useEffect(() => {
    // Safety check: Pastikan params.id ada dan berbentuk string
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!examId) return;

    const initExamSession = async () => {
      setStep('LOADING');
      const savedSubmissionId = localStorage.getItem('active_submission_id');
      
      

      try {
        if (savedSubmissionId) {
            // --- SKENARIO RESTORE ---
            const res = await api.get(`/submissions/${savedSubmissionId}`); 
            const data = res.data.data || res.data; 

            // --- 🛡️ VALIDASI TAMBAHAN (GUARD CLAUSE) ---
            // Cek apakah submission ini milik ujian yang ada di URL (params.id)?
            // Asumsi: Backend mengembalikan assessment_id di dalam data submission
            const currentExamId = Array.isArray(params.id) ? params.id[0] : params.id;

            if (data.assessment_id !== currentExamId) {
            console.warn("Submission ID di storage milik ujian lain. Resetting...");
            localStorage.removeItem('active_submission_id');
            // Lempar ke skenario B (Fresh Start)
            throw new Error("Submission ID mismatch"); 
        }

          if (data.status === 'FINISHED') {
             localStorage.removeItem('active_submission_id');
             setStep('FINISHED');
             return;
          }

          setSubmissionId(savedSubmissionId);
          // Pastikan backend mengirim struktur yang sesuai ExamData
          setExam(data.assessment); 
          
          setStudentIdentity({
             name: data.student_name,
             className: data.class_name,
             gender: data.gender || "L"
          });
          
        if (data.answers) {
            // Cek apakah data dari server berbentuk Array?
            if (Array.isArray(data.answers)) {
                // Konversi Array -> Object
                const mappedAnswers: Record<string, string> = {};
                data.answers.forEach((ans: any) => {
                    // Pastikan field-nya sesuai dengan response JSON backend Anda
                    mappedAnswers[ans.question_id] = ans.option_id; 
                });
                setAnswers(mappedAnswers);
            } else {
                // Kalau sudah Object, pakai langsung
                setAnswers(data.answers);
            }
        }

          // Logika Deadline
          if (data.assessment.expired_at || data.deadline) {
             const deadLine = data.deadline ? new Date(data.deadline) : new Date(data.assessment.expired_at);
             setDeadLine(deadLine);
             
             const now = new Date();
             const secondsRemaining = Math.floor((deadLine.getTime() - now.getTime()) / 1000);
             setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 0);
          } else {
             setTimeLeft(data.assessment.duration * 60);
          }

          setStep('EXAM'); 

        } else {
          // --- SKENARIO BARU ---
          const res = await api.get(`/exam/${examId}`);
          const data = res.data.data || res.data;

          console.log(`get exam/${examId},; data= ${data.data}`);
          
          
          setExam(data);
          setTimeLeft(data.duration * 60); 
          setStep('IDENTITY'); 
        }

      } catch (error) {
        console.error("Gagal init ujian:", error);
        localStorage.removeItem('active_submission_id');
        setStep('ERROR');
      }
    };

    initExamSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);


  // --- D. TIMER LOGIC ---
  useEffect(() => {
    if (step !== 'EXAM' || !deadLine) return;

    const tick = () => {
      const now = new Date();
      const diff = Math.floor((deadLine.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeft(diff);
      }
    };

    tick(); 
    timerRef.current = setInterval(tick, 1000); 

    return () => {
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [step, deadLine]);


  // --- E. ACTIONS ---

  const handleStartExam = async () => {
    if (!studentIdentity.name || !studentIdentity.className) {
        alert("Nama dan Kelas wajib diisi!");
        return;
    }

    // Safety check exam ID
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;

    try {
        setStep('LOADING'); 
        
        const res = await api.post(`/submissions/${examId}/start`, {
            assessment_id: examId,
            student_name: studentIdentity.name,
            gender: studentIdentity.gender,
            class_name: studentIdentity.className 
        });

        // 🔍 DEBUGGING DI SINI
        console.log("Response Full:", res.data); // Cek struktur utuh
        console.log("Coba ambil ID (cara 1):", res.data.submission_id);
        console.log("Coba ambil ID (cara 2):", res.data.data?.submission_id); // NestJS biasanya membungkus di 'data'

        const data = res.data.data;
        // Pastikan path-nya benar sesuai log di atas
        const subId = res.data.data?.submission_id || res.data.submission_id;
 
        if (!subId) {
            console.error("GAWAT! Submission ID tidak ditemukan di response!");
            return; 
        }

        // SIMPAN
        localStorage.setItem('active_submission_id', subId);
        console.log("Berhasil simpan ke LocalStorage:", subId); // Pastikan ini muncul

        const session = localStorage.setItem('active_submission_id', subId);
        setSubmissionId(subId);

       

        if (data.deadline) {
            setDeadLine(new Date(data.deadline));
        } else {
            const d = new Date();
            // Pake optional chaining (?) karena exam mungkin null
            d.setMinutes(d.getMinutes() + (exam?.duration || 60));
            setDeadLine(d);
        }

        setStep('EXAM'); 

    } catch (error: any) {
        console.error("Start Error:", error);
        alert(error.response?.data?.message || "Gagal memulai ujian.");
        setStep('IDENTITY'); 
    }
  };

  const handleAnswer = async (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

    if (submissionId) {
        try {
            await api.put(`/submissions/${submissionId}/answer`, {
                question_id: questionId,
                option_id: optionId,
            });
        } catch (error) {
            console.error("Gagal simpan jawaban (silent fail)", error);
        }
    }
  };

  const handleSubmitExam = async () => {
    if (!submissionId) return;
    try {
        setStep('LOADING');
        await api.put(`/submissions/${submissionId}/finish`);
        
        localStorage.removeItem('active_submission_id');
        
        setStep('FINISHED');
        onOpenChange(); 
    } catch (error: any) {
        alert("Gagal submit: " + (error.response?.data?.message || error.message));
        setStep('EXAM'); 
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeQuestion = exam?.questions ? exam.questions[currentStep] : null;

  console.log('test logic');
  

  // --- F. RETURN ---
  return {
    step,
    exam,
    studentIdentity,
    answers,
    currentStep,
    totalQuestions: exam?.questions?.length || 0,
    activeQuestion,
    deadLine,
    
    // Constant Data untuk UI
    classOptions: CLASS_OPTIONS, // Kembalikan ini agar UI bisa render dropdown

    timeLeftString: formatTime(timeLeft), 
    isCriticalTime: timeLeft < 60, 
    
    isConfirmOpen: isOpen,
    
    setStudentIdentity,
    setCurrentStep,
    
    handleStartExam,
    handleAnswer,
    handleSubmitExam,
    
    openConfirmModal: onOpen,
    closeConfirmModal: onOpenChange, 
  };
};
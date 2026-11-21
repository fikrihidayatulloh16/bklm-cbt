// apps/web/features/assessments/hooks/useAssessmentDetailLogic.ts
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@nextui-org/react";
import { showToast } from "@/components/ui/toast/toast-trigger";
import { SubmissionType } from "../schemas/assessment.schemas";
import { PublishPayload } from "../components/publishModal";
import { QUERY_KEYS } from "@/lib/constants/query-keys.constant";

// API Imports
import { 
  getAssessmentDetail, 
  getDistinctClasses, 
  getAssessmentSubmissions, 
  getAssessmentAnalytics, 
  publishAssessment 
} from "../api/assessment.api";
import { getSocket } from "@/lib/socket";

export const useAssessmentDetailLogic = () => {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  
  // Modal Logic
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Filter State
  // Gunakan Set seperti kode lama, tapi kita handle konversinya di sini
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["all"]));

  // Computed Value untuk Class Name (String | Undefined)
  const selectedClassName = useMemo(() => {
    const selected = Array.from(selectedKeys)[0];
    return selected === "all" ? undefined : selected;
  }, [selectedKeys]);

  // --- QUERIES ---

  // 1. Main Detail (Hanya jalan sekali / staleTime lama)
  const detailQuery = useQuery({
    queryKey: ["assessment-detail", id],
    queryFn: () => getAssessmentDetail(id),
    staleTime: 5 * 60 * 1000, // 5 Menit
  });

  // 2. Distinct Classes
  const classesQuery = useQuery({
    queryKey: ["assessment-classes", id],
    queryFn: () => getDistinctClasses(id),
    staleTime: 10 * 60 * 1000, // 10 Menit (Kelas jarang berubah)
  });

  // 3. Submissions (Depend on Filter)
  const submissionsQuery = useQuery({
    queryKey: ["assessment-submissions", id, selectedClassName], // Key berubah = Refetch
    queryFn: () => getAssessmentSubmissions(id, selectedClassName),
    staleTime: 1 * 60 * 1000,
    // PlaceholderData menjaga data lama tetap tampil saat loading data baru (Anti-Flicker)
    placeholderData: (previousData) => previousData, 
  });

  // 4. Analytics (Depend on Filter)
  const analyticsQuery = useQuery({
    queryKey: ["assessment-analytics", id, selectedClassName],
    queryFn: () => getAssessmentAnalytics(id, selectedClassName),
    staleTime: 1 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  if (analyticsQuery.isError) {
      console.error("🔥 Zod Error Analytics:", analyticsQuery.error);
  }

  const handleComplete = () => {
    console.log("⏳ Waktu habis (Logic Triggered)");
    
    // Contoh logic: Refresh data agar status di header jadi 'CLOSED'
    queryClient.invalidateQueries({ queryKey: ["assessment-detail", id] });
  };

  // --- MUTATIONS ---

  const publishMutation = useMutation({
  // 🚨 1. Terima payload dan lempar ke fungsi API
  mutationFn: (payload: PublishPayload) => publishAssessment(id, payload),
  onSuccess: () => {
    showToast({ type: "success", message: "Berhasil", description: "Ujian berhasil dipublish!" });
    
    // 🚨 2. (Opsional tapi disarankan) Gunakan konstanta Query Keys agar selaras dengan arsitektur Real-Time kita
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS.DETAIL(id) });
    
    onClose(); // Tutup modal
  },
  onError: (error) => {
    console.error("Gagal Publish:", error);
    showToast({ type: "danger", message: "Gagal", description: "Gagal mempublish ujian. Silakan coba lagi." });
  }
});

const handlePublish = (payload: PublishPayload) => {
  publishMutation.mutate(payload);
};

  // 👇 LOGIC WEBSOCKET LIVE UPDATE
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    // 1. Dengarkan Event dari Backend
    socket.on("submission:initiated", (newSubmission: SubmissionType) => {

      // 2. Update Cache TanStack Query (Key harus persis sama dengan useQuery submissions)
      // Key: ["assessment-submissions", id, selectedClassName]
      queryClient.setQueryData(
        ["assessment-submissions", id, selectedClassName], 
        (oldData: SubmissionType[] | undefined) => {
            // Jika cache kosong, buat array baru isi 1
            if (!oldData) return [newSubmission];

            // Cek duplikat (biar aman)
            const exists = oldData.find(s => s.id === newSubmission.id);
            if (exists) return oldData;

            // Masukkan data baru ke ATAS (index 0), sisanya di bawah
            return [newSubmission, ...oldData];
        }
      );
    });

    // Listener 2: FINISH (BARU) 🟢
    socket.on("submission:finished", (payload: any) => {

        // Mapping payload jika perlu (misal submission_id -> id)
        const updatedInfo = {
            id: payload.id,
            status: payload.status,
            score: payload.score,
            submitted_at: payload.submitted_at
        };

        const queryKey = ["assessment-submissions", id, selectedClassName];

        queryClient.setQueryData(queryKey, (oldData: SubmissionType[] | undefined) => {
            if (!oldData) return [];

            // TEKNIK IMMUTABLE UPDATE:
            // Loop semua data, cari yang ID-nya sama, ganti isinya.
            // Yang ID-nya beda, biarkan tetap.
            return oldData.map((item) => {
                if (item.id === updatedInfo.id) {
                    // Gabungkan data lama dengan data baru (merge)
                    return { ...item, ...updatedInfo };
                }
                return item;
            });
        });
    });

    // Cleanup
    return () => {
      socket.off("submission:initiated"); // Matikan pendengar saja
      socket.off("submission:finished"); // Matikan pendengar saja
      socket.disconnect();
    };
  }, [id, selectedClassName, queryClient]); // Dependencies

  return {
    // Data
    assessment: detailQuery.data,
    distinctClasses: classesQuery.data || [],
    submissions: submissionsQuery.data || [],
    questionAnalytics: analyticsQuery.data || [],
    
    // Loading States (Cek salah satu loading)
    isLoading: detailQuery.isLoading || classesQuery.isLoading,
    isDataLoading: submissionsQuery.isFetching || analyticsQuery.isFetching, // Untuk indikator loading tabel
    isPublishing: publishMutation.isPending,

    // Filter Logic
    selectedKeys,
    setSelectedKeys, // Pass fungsi ini ke UI
    selectedClassName, // String hasil convert

    isError: detailQuery.isError, 
    error: detailQuery.error,

    // Modal & Actions
    modalProps: { isOpen, onOpen, onOpenChange },
    handlePublish: publishMutation.mutate,
    handleComplete
  };
};
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@nextui-org/react";
import { showToast } from "@/components/ui/toast/toast-trigger";

// API Imports
import { 
  getAssessmentDetail, 
  getDistinctClasses, 
  getAssessmentSubmissions, 
  getAssessmentAnalytics, 
  publishAssessment 
} from "../api/assessment.api";

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

  // --- MUTATIONS ---

  const publishMutation = useMutation({
    mutationFn: () => publishAssessment(id),
    onSuccess: () => {
      showToast({ type: "success", message: "Berhasil", description: "Ujian berhasil dipublish!" });
      // Invalidate detail agar status berubah jadi 'PUBLISHED' tanpa reload window
      queryClient.invalidateQueries({ queryKey: ["assessment-detail", id] });
      onClose();
    },
    onError: () => {
      showToast({ type: "danger", message: "Gagal", description: "Gagal mempublish ujian." });
    }
  });

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
  };
};
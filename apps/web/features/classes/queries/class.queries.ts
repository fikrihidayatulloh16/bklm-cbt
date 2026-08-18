// apps/web/features/classes/queries/class.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClasses, createClass } from "../api/class.api";
import { ClassFormValues } from "../schemas/class.schemas";
import { QUERY_KEYS, QUERY_TTL } from "@/lib/constants/query-keys.constant";

export const useClassesQuery = (schoolId: string) => {
  return useQuery({
    // 🔥 Menggunakan Constant Query Key yang Anda buat!
    queryKey: QUERY_KEYS.CLASSES.LIST(schoolId),
    
    // Cukup panggil fungsi tukang pos (API)
    queryFn: () => fetchClasses(schoolId),
    
    staleTime:QUERY_TTL.LONG_LIVED, 
    enabled: !!schoolId, // Proteksi: Jangan hit API kalau schoolId belum ada
  });
};

export const useCreateClassMutation = (schoolId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClassFormValues) => createClass(payload),
    // onSuccess: () => {
    //   // Refresh tabel otomatis setelah berhasil tambah kelas!
    //   queryClient.invalidateQueries({ 
    //     queryKey: QUERY_KEYS.CLASSES.LIST(schoolId) 
    //   });
    // },
  });
};
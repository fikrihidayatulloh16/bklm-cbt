// apps/web/features/assessments/hooks/usePublishLogic.ts
import { useState, useMemo } from "react";
import { useClassesQuery } from "@/features/classes/queries/class.queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ClassItem {
  id: string;
  level: string; 
  name: string;  
}

// 1. Definisikan Zod Schema untuk DTO
const publishSchema = z.object({
  session_name: z.string().min(3, "Judul sesi minimal 3 karakter"),
});

export type PublishFormValues = z.infer<typeof publishSchema>;

export const usePublishLogic = (schoolId: string) => {
  const { data: rawClasses, isLoading: isLoadingClasses } = useClassesQuery(schoolId);
  
  // 2. Inisialisasi React Hook Form
  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      session_name: "",
    },
  });
  
  // Transformasi Data Kelas
  const classes: ClassItem[] = useMemo(() => {
    if (!Array.isArray(rawClasses)) return [];
    return rawClasses.map((c) => ({
      id: c.id ?? '',         
      level: c.level ?? '',   
      name: c.name ?? ''      
    })).filter(c => c.id !== '');
  }, [rawClasses]);

  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);

  const levelOptions = useMemo(() => {
    if (classes.length === 0) return [{ id: 'all', name: 'Semua Level' }];
    const levels = Array.from(new Set(classes.map(c => c.level))).sort();
    return [
      { id: 'all', name: 'Semua Level' },
      ...levels.map(l => ({ id: l, name: `Tingkat ${l}` }))
    ];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (classes.length === 0) return [];
    if (selectedLevel === "all") return classes;
    return classes.filter(c => c.level === selectedLevel);
  }, [classes, selectedLevel]);

  const handleAddClass = (classId: string) => {
    if (!classId) return;
    const classObj = classes.find(c => c.id === classId);
    if (classObj && !selectedClasses.some(c => c.id === classObj.id)) {
      setSelectedClasses([...selectedClasses, classObj]);
    }
  };

  const handleRemoveClass = (classIdToRemove: string) => {
    setSelectedClasses(selectedClasses.filter(c => c.id !== classIdToRemove));
  };

  const resetState = () => {
    setSelectedClasses([]);
    setSelectedLevel("all");
    form.reset(); // 👈 Pastikan form input juga di-reset saat modal ditutup
  };

  return {
    form, // 👈 Ekspor form agar bisa dipakai di UI
    isLoadingClasses,
    selectedLevel,
    setSelectedLevel,
    selectedClasses,
    levelOptions,
    filteredClasses,
    handleAddClass,
    handleRemoveClass,
    resetState
  };
};
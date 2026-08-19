// apps/web/features/assessments/hooks/usePublishLogic.ts
import { useState, useMemo } from "react";
import { useClassesQuery } from "@/features/classes/queries/class.queries";

interface ClassItem {
  id: string;
  level: string; 
  name: string;  
}

export const usePublishLogic = (schoolId: string) => {
  // 1. Ambil data Kelas (Raw Data / Data Kasar)
  const { data: rawClasses, isLoading: isLoadingClasses } = useClassesQuery(schoolId);

  console.log('rawClasses: ', rawClasses);
  
  
  // 🔥 2. TRANSFORMASI DATA (Anti-Corruption Layer)
  // Kita pastikan id, level, dan name SELALU berupa string (menghapus undefined)
  const classes: ClassItem[] = useMemo(() => {
    // Safety check: pastikan rawClasses adalah array
    if (!Array.isArray(rawClasses)) return [];

    return rawClasses.map((c) => ({
      id: c.id ?? '',         // Jika id undefined, jadikan string kosong
      level: c.level ?? '',   // ⚠️ Sesuaikan: Jika di backend namanya 'grade', ganti jadi c.grade
      name: c.name ?? ''      // Jika name undefined, jadikan string kosong
    })).filter(c => c.id !== ''); // Buang data cacat yang tidak punya ID
  }, [rawClasses]);

  // 3. State
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);

  // 4. Opsi Level untuk Dropdown 1
  const levelOptions = useMemo(() => {
    // Sekarang kita pakai 'classes' yang sudah bersih
    if (classes.length === 0) return [{ id: 'all', name: 'Semua Level' }];
    
    const levels = Array.from(new Set(classes.map(c => c.level))).sort();
    
    return [
      { id: 'all', name: 'Semua Level' },
      ...levels.map(l => ({ id: l, name: `Tingkat ${l}` }))
    ];
  }, [classes]);

  // 5. Kelas yang sudah difilter untuk Dropdown 2
  const filteredClasses = useMemo(() => {
    if (classes.length === 0) return [];
    if (selectedLevel === "all") return classes;
    return classes.filter(c => c.level === selectedLevel);
  }, [classes, selectedLevel]);

  // 6. Handlers
  const handleAddClass = (classId: string) => {
    if (!classId) return;
    const classObj = classes.find(c => c.id === classId);
    
    // Karena classes sudah bertipe ClassItem[], tidak akan ada error di sini
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
  };

  return {
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
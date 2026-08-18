// apps/web/features/classes/api/class.api.ts
import api  from "@/lib/api";
import { ClassResponse, ClassFormValues } from "../schemas/class.schemas";

export const fetchClasses = async (schoolId: string): Promise<ClassResponse[]> => {
  const { data } = await api.get(`/classes/school/${schoolId}`);
  
  // 1. Cek apakah 'data' itu sendiri sudah berupa array?
  if (Array.isArray(data)) {
    return data;
  }
  
  // 2. Jika NestJS membungkusnya dalam properti 'data' (contoh: { statusCode: 200, data: [...] })
  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  // 3. Jaring pengaman terakhir, jika struktur tidak dikenali, kembalikan array kosong
  console.warn("⚠️ Format response class API tidak dikenali:", data);
  return []; 
};

export const createClass = async (payload: ClassFormValues): Promise<ClassResponse> => {
  const { data } = await api.post("/classes", payload);
  return data;
};
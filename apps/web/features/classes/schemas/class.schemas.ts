// apps/web/features/classes/schemas/class.schemas.ts
import { z } from "zod";

// 1. Skema Validasi
export const classSchema = z.object({
  id: z.string().optional(), // Opsional karena saat 'Create', ID belum ada
  level: z.string().min(1, "Level wajib diisi (misal: X, XI, XII)"),
  name: z.string().min(1, "Nama wajib diisi (misal: RPL 1)"),
  schoolId: z.string(), // Nanti didapat dari session/token Admin
});

// 2. Otomatis jadi TypeScript Type (Tidak perlu folder types/ lagi untuk ini!)
export type ClassFormValues = z.infer<typeof classSchema>;

// (Opsional) Jika response dari API balikkannya sedikit berbeda, bisa buat tipe terpisah
export interface ClassResponse extends ClassFormValues {
  createdAt: string;
}
// apps/web/lib/config/realtime-mapper.config.ts
import { QUERY_KEYS } from "../constants/query-keys.constant";

/**
 * Menerima nama entity dari Backend, dan mengembalikan array Query Keys 
 * yang harus dihancurkan/invalidate.
 */
export const getKeysToInvalidate = (
  entity: string, 
  userId: string, 
  schoolId?: string // 👈 1. Tambahkan parameter opsional ini
) => {
  const map: Record<string, readonly any[]> = {
    'assessments': [
      QUERY_KEYS.DASHBOARD.STATS(userId),
      QUERY_KEYS.DASHBOARD.SUMMARY(userId),
      QUERY_KEYS.ASSESSMENTS.LIST(userId),
    ],
    'question_banks': [
      QUERY_KEYS.DASHBOARD.STATS(userId),
      ['question_banks'],
      QUERY_KEYS.QUESTION_BANKS.LIST(userId),
    ],
    // 👈 2. Cek apakah schoolId ada, jika ada jalankan, jika tidak kembalikan array kosong
    'classes': schoolId ? [
      QUERY_KEYS.CLASSES.LIST(schoolId) 
    ] : []
  };

  return map[entity] || [];
};
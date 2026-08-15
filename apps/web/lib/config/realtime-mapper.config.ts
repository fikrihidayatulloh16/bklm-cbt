// apps/web/lib/config/realtime-mapper.config.ts
import { QUERY_KEYS } from "../constants/query-keys.constant";

/**
 * Menerima nama entity dari Backend, dan mengembalikan array Query Keys 
 * yang harus dihancurkan/invalidate.
 */
export const getKeysToInvalidate = (entity: string, userId: string) => {
  const map: Record<string, readonly any[]> = {
    'assessments': [
      QUERY_KEYS.DASHBOARD.STATS(userId),
      QUERY_KEYS.DASHBOARD.SUMMARY(userId),
      QUERY_KEYS.ASSESSMENTS.LIST(userId),
    ],
    'question_banks': [
      QUERY_KEYS.DASHBOARD.STATS(userId),
      QUERY_KEYS.QUESTION_BANKS.LIST(userId),
    ]
    // Tambahkan entitas lain di sini masa depan (misal: 'classes', 'students')
  };

  return map[entity] || [];
};
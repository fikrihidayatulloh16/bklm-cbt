// apps/web/lib/constants/query-keys.constant.ts

export const QUERY_KEYS = {
  DASHBOARD: {
    SUMMARY: (userId: string) => ['dashboard', 'summary', userId] as const,
    STATS: (userId: string) => ['dashboard', 'stats', userId] as const,
  },
  ASSESSMENTS: {
    LIST: (userId: string) => ['assessments', 'list', userId] as const,
    DETAIL: (assessmentId: string) => ['assessments', 'detail', assessmentId] as const,
  },
  QUESTION_BANKS: {
    LIST: (userId: string) => ['question_banks', 'list', userId] as const,
    DETAIL: (questionBankId: string) => ['question_banks', 'detail', questionBankId] as const,
  },
  CLASSES: {
    LIST: (schoolId: string) => ['classes', 'list', 'school', schoolId] as const,
  }
};

// 🔥 STANDARISASI TTL (staleTime di TanStack Query)
export const QUERY_TTL = {
  // CRITICAL: Data yang harus sangat akurat, basi dalam 10 detik.
  CRITICAL: 10 * 1000, 
  
  // DEFAULT: Standar umum aplikasi (misal: 5 menit). Cocok untuk Dashboard List.
  DEFAULT: 5 * 60 * 1000, 
  
  // LONG_LIVED: Data statis/jarang berubah (misal: 1 jam). Cocok untuk Info Sesi/Profil.
  LONG_LIVED: 60 * 60 * 1000, 
};
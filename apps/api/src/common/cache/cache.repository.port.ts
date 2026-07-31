// apps/api/src/common/cache/cache.repository.port.ts
export const I_CACHE_REPOSITORY = Symbol('I_CACHE_REPOSITORY');

export enum CacheTTL {
  CRITICAL = 30,       // 30 detik (Untuk data real-time / skor)
  DEFAULT = 3600,      // 1 jam (Untuk data statis ujian/sesi)
  LONG_LIVED = 86400,  // 24 jam (Untuk konfigurasi sistem/sekolah)
}

export interface ICacheRepository {
  /** Mengambil data dari cache dan melakukan deserialisasi ke T */
  getObj<T>(key: string): Promise<T | null>;
  
  /** Melakukan serialisasi T dan menyimpannya dengan TTL */
  setObj<T>(key: string, value: T, ttlSeconds: CacheTTL): Promise<void>;
  
  /** Menghapus kunci yang cocok dengan pola secara aman menggunakan SCAN */
  invalidateByPattern(pattern: string): Promise<void>;

  //Fungsi pamungkas untuk Read-Through Cache
  getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: CacheTTL): Promise<T>;
}
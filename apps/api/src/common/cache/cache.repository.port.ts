export const I_CACHE_REPOSITORY = Symbol('I_CACHE_REPOSITORY');

export interface ICacheRepository {
  /** Mengambil data dari cache dan melakukan deserialisasi ke T */
  getObj<T>(key: string): Promise<T | null>;
  
  /** Melakukan serialisasi T dan menyimpannya dengan TTL */
  setObj<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  
  /** Menghapus kunci yang cocok dengan pola secara aman menggunakan SCAN */
  invalidateByPattern(pattern: string): Promise<void>;
}
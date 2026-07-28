import { Logger } from '@nestjs/common';
import { RedisBufferService } from 'src/shared/redis/redis.buffer.service'; // Sesuaikan path

export abstract class BaseRedisSyncWorker<T> {
  protected isProcessing = false;
  
  // Memaksa kelas turunan untuk mendefinisikan logger-nya sendiri
  protected abstract readonly logger: Logger;

  constructor(protected readonly redisBuffer: RedisBufferService) {}

  /**
   * Fungsi inti (Jantung) dari proses sinkronisasi
   * @param pattern Pola key Redis (contoh: 'cbt:answers:*')
   * @param mapFn Fungsi untuk mengubah data mentah Redis menjadi Array DTO
   * @param saveFn Fungsi repositori untuk melakukan Bulk Insert/Upsert
   * @param entityName Nama entitas untuk keperluan logging
   */
  protected async processSync(
    pattern: string,
    mapFn: (rawData: any[]) => T[],
    saveFn: (data: T[]) => Promise<void>,
    entityName: string = 'Data'
  ) {
    if (this.isProcessing) {
      this.logger.warn(`Sinkronisasi ${entityName} tertunda (Masih berjalan).`);
      return;
    }

    this.isProcessing = true;

    try {
      // 1. Panen data (Harvest)
      const rawData = await this.redisBuffer.harvestPattern(pattern);
      if (rawData.length === 0) {
        return; // Tidak ada data, keluar diam-diam
      }

      // 2. Mapping Data
      const dataToSync: T[] = mapFn(rawData);

      if (dataToSync.length > 0) {
        // 3. Simpan ke Database
        await saveFn(dataToSync);
        this.logger.log(`✅ Tersinkronisasi: ${dataToSync.length} ${entityName} dari Redis ke Database Utama.`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Gagal sinkronisasi ${entityName}`);
      
      if (error.code) {
        this.logger.error(`Kode Error Prisma: ${error.code} - ${error.meta?.cause || error.message}`);
      } else {
        console.error(error);
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
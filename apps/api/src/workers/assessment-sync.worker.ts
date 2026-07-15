// apps/api/src/workers/assessment-sync.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisBufferService } from '../shared/redis/redis.buffer.service';
import { AnswerRepository } from 'src/submissions/repository/answer.repository';
import { SyncAnswerDto } from 'src/submissions/dto/save-answers,dto';

@Injectable()
export class AssessmentSyncWorker {
  private readonly logger = new Logger(AssessmentSyncWorker.name);
  private isProcessing = false;

  constructor(
    private readonly redisBuffer: RedisBufferService,
    // Kita panggil antarmuka Repositori, bukan Prisma langsung
    private readonly answerRepo: AnswerRepository, 
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAnswerSync() {
    if (this.isProcessing) {
      this.logger.warn('Sinkronisasi sebelumnya tertunda. Melewati siklus ini.');
      return;
    }

    this.isProcessing = true;

    try {
      // 1. Panen data (Format Key Redis sekarang: cbt:answers:submission_id)
      const rawData = await this.redisBuffer.harvestPattern('cbt:answers:*');

      if (rawData.length === 0) {
        this.isProcessing = false;
        return; 
      }

      const answersToSync: SyncAnswerDto[] = [];

      // 2. Mapping Data dari Hash Redis menuju format DTO Repositori
      for (const item of rawData) {
        // Ekstrak identifier: "cbt:answers:9f8a...-uuid"
        const parts = item.key.split(':');
        const submissionId = parts[2];

        // Object.entries membedah dompet Redis (Field = question_id, Value = string JSON)
        for (const [questionId, rawJsonStr] of Object.entries(item.data)) {
          const answerObj = JSON.parse(rawJsonStr);

          answersToSync.push({
            submission_id: submissionId,
            question_id: questionId,
            text_value: answerObj.text_value,     
            numeric_value: answerObj.numeric_value,
            option_id: answerObj.option_id,       
          });
        }
      }

      // 3. Serahkan sepenuhnya ke Repositori
      await this.answerRepo.bulkUpsertAnswers(answersToSync);
      
      this.logger.log(`✅ Tersinkronisasi: ${answersToSync.length} jawaban dari Redis ke Database Utama.`);

    } catch (error: any) { // Tambahkan tipe 'any' sementara untuk membongkar isi error
      this.logger.error('❌ Gagal sinkronisasi dari Redis ke Database');
      
      // Bedah error dari Prisma
      if (error.code) {
        this.logger.error(`Kode Error Prisma: ${error.code} - ${error.meta?.cause || error.message}`);
      } else {
        console.error(error); // Paksa console.error untuk mencetak isi lengkap objek error
      }
    } finally {
      this.isProcessing = false; 
    }
  }
}
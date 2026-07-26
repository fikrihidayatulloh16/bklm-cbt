// apps/api/src/assessment-session/dto/create-assessment-session.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateAssessmentSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama sesi tidak boleh kosong (misal: Sesi Pagi X RPL)' })
  name!: string;

  @IsDateString({}, { message: 'Format waktu mulai tidak valid (gunakan ISO-8601)' })
  start_time!: string; 

  @IsDateString({}, { message: 'Format waktu selesai tidak valid' })
  end_time!: string;

  @IsString()
  @IsNotEmpty()
  assessment_id!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Minimal harus memilih satu kelas' })
  @IsString({ each: true })
  class_ids!: string[]; // Frontend akan mengirim array ID Kelas
}
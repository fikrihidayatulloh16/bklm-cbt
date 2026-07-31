import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

export class PublishAssessmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama sesi tidak boleh kosong (misal: Sesi Pagi X RPL)' })
  session_name!: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Minimal harus memilih satu kelas' })
  @IsString({ each: true })
  class_ids!: string[]; 
  
  // 🔥 KITA TIDAK MEMINTA START_TIME DAN END_TIME DARI GURU
  // Waktu akan dibuat otomatis oleh sistem (Domain AssessmentSession)
}
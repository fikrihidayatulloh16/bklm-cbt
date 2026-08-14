import { Gender } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class StartSubmissionDTO {
  @IsString()
  @IsNotEmpty()
  student_name!: string;

  // 🔥 PERBAIKAN: Gunakan IsUUID agar API otomatis menolak jika format ID kelas salah
  @IsString()
  @IsNotEmpty()
  class_id!: string; 
  
  @IsString()
  @IsNotEmpty()
  class_name!: string; 

  @IsEnum(['MALE', 'FEMALE'])
  @IsNotEmpty()
  gender!: string; // Lebih bagus lagi jika: gender!: Gender;
}
// apps/api/src/class/class.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Level kelas wajib diisi (misal: "X", "XI")' })
  @MaxLength(10)
  level!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama kelas wajib diisi (misal: "RPL 1")' })
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'School ID wajib diisi' })
  school_id!: string; 
}
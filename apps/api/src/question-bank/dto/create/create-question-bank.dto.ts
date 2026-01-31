import { IsArray, IsBoolean, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBankQuestionDto } from './create-bankquestion.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @ApiProperty({ 
    example: 'Matematika Dasar - Aljabar', 
    description: 'Judul Paket Soal' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: 'Soal untuk kelas 10 semester 10', 
    description: 'Judul Paket Soal' 
  })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ 
    example: 'True', 
    description: 'Apakah soal ini dizinkan untuk dibagikan atau tidak' 
  })
  @IsBoolean()
  @IsNotEmpty()
  shared: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankQuestionDto)
  questions: CreateBankQuestionDto[];
}

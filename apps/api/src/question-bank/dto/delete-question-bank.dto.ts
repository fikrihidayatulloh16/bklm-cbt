import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeleteQuestionBankDTO {
    @ApiProperty({ 
        example: 'questionbank123', 
        description: 'ID bank soal yang ingin dihapus' 
      })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    id: string;
}
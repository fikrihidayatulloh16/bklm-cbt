import { QuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsEnum, IsArray, ValidateNested, IsUUID, IsOptional } from "class-validator";
import { UpdateBankQuestionOptionDTO } from "./update-bank-question-option.dto"; 
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBankQuestionDto {
    @ApiProperty({ 
        example: 'question-uuid-123', 
        description: 'Kirim ID jika update soal lama. Kosongkan jika soal baru.' 
    })
    @IsOptional()
    @IsUUID()
    id?: string;
    
    @ApiProperty({ example: 'Siapa nama presiden?' })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ example: 'MULTIPLE_CHOICE' })
    @IsEnum(QuestionType) // Pastikan Enum diimport
    type: QuestionType;

    // Category DIHAPUS karena Anda bilang 'patent' (tidak boleh diubah).
    // Backend akan mengabaikan update category demi keamanan.

    @ApiProperty({ type: [UpdateBankQuestionOptionDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateBankQuestionOptionDTO)
    options: UpdateBankQuestionOptionDTO[];
}
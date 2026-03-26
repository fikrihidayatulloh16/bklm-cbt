import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUUID, IsInt, IsOptional } from "class-validator";


export class UpdateBankQuestionOptionDTO {
    @ApiProperty({ 
        example: 'option-uuid-123', 
        description: 'Kirim ID jika update opsi lama. Kosongkan jika opsi baru.' 
    })
    @IsOptional()
    @IsUUID()
    id?: string;

    @ApiProperty({ example: 'Jawaban A' })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    score: number;

    // @ApiProperty({ example: 1 })
    // @IsInt()
    // @IsNotEmpty()
    // order: number;
}
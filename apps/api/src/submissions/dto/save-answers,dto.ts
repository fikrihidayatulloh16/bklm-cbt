import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SaveAnswerDTO {
    @IsNotEmpty()
    @IsString()
    question_id: string;

    @IsOptional()
    @IsString()
    option_id?: string;

    @IsOptional()
    @IsNumber()
    numeric_value?: number;

    @IsOptional()
    @IsString()
    text_value?: string;

    @IsNotEmpty()
    @IsBoolean()
    status_answer: boolean;
}
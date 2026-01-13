import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SaveAnswerDTO {
    @IsNotEmpty()
    @IsString()
    question_id: string;

    @IsOptional()
    @IsString()
    option_id?: string;

    @IsOptional()
    @IsString()
    text_value?: string;

    @IsNotEmpty()
    @IsBoolean()
    status_answer: boolean;
}
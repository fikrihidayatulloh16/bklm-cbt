import { Gender } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class StartSubmissionDTO {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    assessment_id: string;

    @IsString()
    @IsUUID()
    class_id: string;

    @IsNotEmpty()
    @IsString()
    student_name: string;

    @IsNotEmpty()
    @IsString()
    class_name: String;

    @IsEnum(Gender)
    gender: Gender;
}
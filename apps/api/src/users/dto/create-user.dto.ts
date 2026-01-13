//import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsEmail, IsUUID } from 'class-validator';

export enum UserRole {
  TEACHER = 'TEACHER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  school_id: string;
}

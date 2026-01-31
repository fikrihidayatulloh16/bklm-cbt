import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import

export class LoginDto {
  @ApiProperty({ 
    example: 'guru@sekolah.id', 
    description: 'Email pengguna yang terdaftar' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'password_rahasia', 
    description: 'Password pengguna',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express'; // Pastikan install @types/express

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. ENDPOINT LOGIN (Tombol Frontend mengarah kesini)
  // URL: http://localhost:3000/auth/google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Fungsi ini otomatis melempar user ke halaman Login Google
    // Tidak perlu isi kode apa-apa
  }

  // 2. ENDPOINT CALLBACK (Google mengembalikan user kesini)
  // URL: http://localhost:3000/auth/google/callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const jwtData = await this.authService.validateOAuthLogin(req.user);

    // DULU: return res.json(...) -> Cuma tampil teks di layar hitam
    
    // SEKARANG: Redirect ke Frontend membawa Token
    // Kita arahkan ke halaman khusus di frontend untuk menangkap token
    // Frontend URL = http://localhost:3001
    return res.redirect(
      `http://localhost:3001/auth/success?token=${jwtData.access_token}`
    );
  }
}
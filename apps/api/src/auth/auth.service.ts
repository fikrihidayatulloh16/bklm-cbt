import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService // Service buat bikin token
  ) {}

  async validateOAuthLogin(profile: any) {
    try {
        let user = await this.prisma.user.findUnique({
            where: { email: profile.email },
        });

        if (!user) {
            user = await this.prisma.user.create({
            data: {
                email: profile.email,
                name: `${profile.firstName} ${profile.lastName}`,
                role: 'TEACHER', // Asumsi yang login lewat Google adalah Guru
                // Field password tidak perlu ditulis karena optional
            },
            });
        }

      // 3. Generate JWT Token (Tiket Masuk)
      return this.generateJwt(user);

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Gagal memproses login Google');
    }
  }

  // Fungsi helper membuat Token
  private generateJwt(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload), // Token ini yang nanti dipakai Frontend
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture // (Opsional jika ada di DB)
      }
    };
  }
}
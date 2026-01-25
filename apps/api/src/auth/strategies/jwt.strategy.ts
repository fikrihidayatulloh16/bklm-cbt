import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // 🗑️ HAPUS console.log DEBUGGING DISINI
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ✅ LOGIKA FINAL: Env atau Fallback 'rahasia'
      // Ini aman karena di server .env terbaca, di local 'rahasia' jalan.
      secretOrKey: configService.get<string>('JWT_SECRET') || 'rahasia', 
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
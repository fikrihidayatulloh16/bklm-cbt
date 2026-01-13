import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Ambil token dari Header (Authorization: Bearer xyz...)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 2. Jangan biarkan token kadaluarsa lewat
      ignoreExpiration: false,
      
      // 3. Kunci Rahasia (Harus sama dengan .env)
      // Pakai tanda seru (!) untuk meyakinkan TypeScript
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Jika token valid, data user akan dikembalikan ke Request
  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
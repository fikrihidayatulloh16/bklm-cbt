// apps/api/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Baca metadata @Roles dari Controller/Route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Jika route tersebut tidak dipasang @Roles, berarti bebas diakses (atau di-handle AuthGuard saja)
    if (!requiredRoles) {
      return true;
    }

    // 3. Ambil data user dari Request (Ini hasil ekstraksi dari JwtAuthGuard!)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
       throw new ForbiddenException('Akses ditolak: User tidak memiliki hak akses (Role tidak ditemukan)');
    }

    // 4. Cek apakah role user ada di dalam daftar role yang diizinkan
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
        throw new ForbiddenException(`Akses ditolak: Hanya ${requiredRoles.join(', ')} yang diizinkan.`);
    }

    return true;
  }
}
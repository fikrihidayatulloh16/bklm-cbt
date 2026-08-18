// apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Ini adalah kunci (key) untuk menyimpan metadata roles
export const ROLES_KEY = 'roles';

// Ini adalah dekorator buatan kita sendiri: @Roles('SUPERADMIN', 'ADMIN')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
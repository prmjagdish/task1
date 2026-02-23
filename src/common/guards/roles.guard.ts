import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private roleHierarchy = {
    SUPERADMIN: 5,
    ADMIN: 4,
      BRAND: 3,
    AUTHOR: 2,
    USER: 1,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) return false;

    const userLevel = this.roleHierarchy[user.role];

    return requiredRoles.some((role) => userLevel >= this.roleHierarchy[role]);
  }
}

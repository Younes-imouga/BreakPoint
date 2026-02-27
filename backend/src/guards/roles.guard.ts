import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';

export function RoleGuard(allowedRoles: string[]) {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || !user.role) {
        console.log('RoleGuard - No user or no role found');
        throw new UnauthorizedException('Role not found');
      }

      if (!allowedRoles.includes(user.role)) {
        console.log(`RoleGuard - User role ${user.role} not in allowed roles`);
        throw new UnauthorizedException('Insufficient permissions');
      }

      console.log('RoleGuard - Access granted');
      return true;
    }
  }

  return mixin(RoleGuardMixin);
}

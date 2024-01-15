// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No roles specified, access granted
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('JWT token not provided');
    }

    const decodedToken = this.verifyToken(token);

    if (!decodedToken || !decodedToken.role) {
      return false; // No role information in the JWT, access denied
    }

    return roles.includes(decodedToken.role); // Check if user's role is included in the allowed roles
  }

  private extractToken(authorizationHeader: string): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return null;
    }

    return authorizationHeader.split(' ')[1];
  }

  private verifyToken(token: string): { role: string } | null {
    try {
      return jwt.verify(token, 'your-secret-key') as { role: string };
    } catch (error) {
      return null;
    }
  }
}

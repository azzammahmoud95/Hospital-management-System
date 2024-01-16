// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly configservice: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!expectedRoles || !Array.isArray(expectedRoles) || expectedRoles.length === 0) {
      // No roles specified, access granted
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('JWT token not provided');
    }

    const decodedToken = this.verifyToken(token);

    if (!expectedRoles.includes(decodedToken.user.role)) {
      throw new UnauthorizedException('You do not have permission to access this resource');
    }

    return true; // Access granted only if the user has one of the expected roles
  }

  private extractToken(authorizationHeader: string): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return null;
    }

    return authorizationHeader.split(' ')[1];
  }

  private verifyToken(token: string): { user: { role: string } } | null | any {
    try {
      return jwt.verify(token, this.configservice.get<string>('SECRETKEY')) as { user: { role: string } };
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }
}

// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly configservice: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No roles specified, access granted
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization);
// console.log("firsttoken",token)
    if (!token) {
      console.log("hi1")
      throw new UnauthorizedException('JWT token not provided');
    }

    const decodedToken = this.verifyToken(token);
    // console.log('decoded-token',decodedToken)
    if (decodedToken.user.role !== 'ADMIN') {
      console.log('hi2')
      throw new UnauthorizedException('You do not have permission to access this resource');
    }
console.log('hisssssssssss');

    return true; // Access granted only if the user has the "ADMIN" role
  }

  private extractToken(authorizationHeader: string): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return null;
    }

    return authorizationHeader.split(' ')[1];
  }

  private verifyToken(token: string): { role: string } | null | any {
    try {
      console.log("token", token);
      const thereturn = jwt.verify(token, this.configservice.get<string>('SECRETKEY'));
      console.log("thereturn", thereturn);

      return thereturn;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  }
  
    
}

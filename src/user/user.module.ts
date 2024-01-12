import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService,ConfigService],
})
export class UserModule {}

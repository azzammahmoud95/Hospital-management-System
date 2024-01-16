import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}

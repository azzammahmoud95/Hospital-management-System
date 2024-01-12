// src/user/user.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User as PrismaUser } from '@prisma/client';
import { Role } from '@prisma/client';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<PrismaUser[] | any> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<PrismaUser | any> {
    return this.userService.getUserById(Number(id));
  }

  @Post()
  async createUser(@Body() user: { name: string; email: string; password: string; role: Role }): Promise<PrismaUser> {
    return this.userService.createUser(user);
  }
  @Post('login')
  async loginUser(@Body() credentials: { email: string; password: string }): Promise<any> {
    const {email ,password} = credentials;

    return this.userService.loginUser(email,password);

      
  }
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updatedUser: { name?: string; email?: string; password?: string; role?: Role }): Promise<Omit<PrismaUser,'password'>> {
    return this.userService.updateUser(Number(id), updatedUser);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<PrismaUser> {
    return this.userService.deleteUser(Number(id));
  }
}

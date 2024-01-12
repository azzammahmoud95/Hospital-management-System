import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, User as PrismaUser, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient();
@Injectable()
export class UserService {
  async getAllUsers(): Promise<Omit<PrismaUser, 'password'>[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Omit password from the selection
      },
    });
  }
  
  async getUserById(id: number): Promise<Omit<PrismaUser, 'password'>> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Omit password from the selection
      },
    });
  }
  

  async createUser(user: { name: string; email: string; password: string; role: Role }): Promise<PrismaUser | any> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
  
    // Omit the password from the data passed to prisma.user.create
    const userDataWithoutPassword = { ...user, password: hashedPassword };
  
    // Create the user without returning the password
    const createdUser = await prisma.user.create({ data: userDataWithoutPassword });
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };
  }
  async updateUser(id: number, updatedUser: { name?: string; email?: string; password?: string; role?: Role }): Promise<Omit<PrismaUser, 'password'>> {
    await prisma.user.update({ where: { id }, data: updatedUser });
  
    const updatedUserData = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Omit password from the selection
      },
    });
  
    return updatedUserData;
  }
  async deleteUser(id: number): Promise<PrismaUser | any> {
    await prisma.user.delete({ where: { id } });
    return  { message: `User with ID ${id} has been deleted.` };
  }
}

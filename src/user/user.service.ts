  import { Injectable } from '@nestjs/common';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { PrismaClient, User as PrismaUser, Role } from '@prisma/client';
  import * as jwt from 'jsonwebtoken'
  import * as bcrypt from 'bcrypt'
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  const prisma = new PrismaClient();
  @Injectable()
  export class UserService {
    constructor(private readonly jwtService: JwtService, private readonly configservice: ConfigService) {}

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
      const existingUser = await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      });
      if (existingUser) {
        // If the email is already registered, return a message
        return { message: 'Email already registered' };
      }
      const salt = await bcrypt.genSalt(10); // You can adjust the number of rounds

      // Combine the salt and password
      const hashedPassword = await bcrypt.hash(user.password, salt);

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
    async loginUser(email: string, password: string) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
    
      if (!existingUser) {
        return { message: "User Not Found" };
      }
    
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
      if (isPasswordValid) {
        // Generate and return JWT token here
        const secretKey = this.configservice.get<string>('SECRETKEY')
        const token = await this.jwtService.signAsync({ sub: existingUser.id, name: existingUser.name }, {secret:secretKey});
        return { message: 'Login successful', token };
      } else {
        return { message: 'Invalid Email or Password' };
      }
      
    }
    // private async generateJwtToken(userId: number, name: string) {
    //   try {
    //     const token = jwt.sign({ sub: userId, name: name }, 'your-secret-key');
    //     return token;
    //   } catch (error) {
    //     console.error('Error generating JWT token:', error);
    //     throw new Error('Unable to generate JWT token');
    //   }
    // }


  async deleteUser(id: number): Promise<PrismaUser | any> {
    await prisma.user.delete({ where: { id } });
    return  { message: `User with ID ${id} has been deleted.` };
  }
  }

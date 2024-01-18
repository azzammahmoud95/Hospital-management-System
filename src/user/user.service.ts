import { Injectable ,NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Appointment, PatientDoctor, PrismaClient, User as PrismaUser, Role } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundError } from 'rxjs';
const prisma = new PrismaClient();
@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configservice: ConfigService,
  ) {}

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

  async createUser(
    user: CreateUserDto
  //   {
  //   name: string;
  //   email: string;
  //   password: string;
  //   role: Role;
  // }
  ): Promise<PrismaUser | any> {
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
    user.password = hashedPassword
    // Create the user without returning the password
    const createdUser = await prisma.user.create({data: user});
    if (createdUser.role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: createdUser.id,
          // Other Doctor model fields
        },
      });
    }else if(createdUser.role === "DOCTOR"){
      await prisma.doctor.create({
        data:{
          userId:createdUser.id
        }
      })
    }
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };
  }
  async updateUser(
    id: number,
    updatedUser: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
    },
  ): Promise<Omit<PrismaUser, 'password'>> {
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
      return { message: 'User Not Found' };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (isPasswordValid) {
      // Generate and return JWT token here
      const secretKey = this.configservice.get<string>('SECRETKEY');
      // Omit the password from the user object
      const userWithoutPassword = { ...existingUser, password: undefined };

// Define the payload with the user object
const payload: any = { user: userWithoutPassword };

if (existingUser.role === 'PATIENT') {
  const patient = await prisma.patient.findUnique({ where: { userId: existingUser.id } });
  if (patient) {
    payload.patientId = patient.id;
  }
} else if (existingUser.role === 'DOCTOR') {
  const doctor = await prisma.doctor.findUnique({ where: { userId: existingUser.id } });
  if (doctor) {
    payload.doctorId = doctor.id;
  }
}

      // Sign the JWT token with the entire user object in the payload
      const token = await this.jwtService.signAsync(
        payload,
        { secret: secretKey },
      );

      // Return the user object without the password in the response
      return { message: 'Login successful', user: userWithoutPassword, token };
    } else {
      return { message: 'Invalid Email or Password' };
    }
  }

  async assignPatientDoctor(data: { patientId: number; doctorId: number }): Promise<PatientDoctor> {
    const { patientId, doctorId } = data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

    if (!patient) {
        throw new NotFoundException('Patient not found');
    }

    if (!doctor) {
        throw new NotFoundException('Doctor not found');
    }

    return prisma.patientDoctor.create({
        data: {
            patient: { connect: { id: patient.id } },
            doctor: { connect: { id: doctor.id } },
        },
    });
}



  async deleteUser(id: number): Promise<PrismaUser | any> {
    await prisma.user.delete({ where: { id } });
    return { message: `User with ID ${id} has been deleted.` };
  }


  




}







import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, PatientDoctor, Status } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
const prisma = new PrismaClient();

@Injectable()
export class AppointmentService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}
  async makeAppointment(data: { patientId: number; doctorId: number; dateTime: Date }): Promise<PatientDoctor | any> {
    const { patientId, doctorId, dateTime } = data;

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

    if (!patient) {
        throw new NotFoundException('Patient not found');
    }

    if (!doctor) {
        throw new NotFoundException('Doctor not found');
    }

    const relationship = await prisma.patientDoctor.findFirst({
        where: {
            patientId,
            doctorId,
        },
    });

    if (!relationship) {
        throw new UnauthorizedException('No relationship between patient and doctor');
    }

    return prisma.appointment.create({
      data: {
        dateTime:dateTime,
          patient: { connect: { id: patient.id } },
          doctor: { connect: { id: doctor.id } },
      },
  });
}

async getAllAppointments(page: number, limit: number): Promise<Appointment[]> {
  const skip = (page - 1) * limit;

  return prisma.appointment.findMany({
    skip,
    take: limit,
  });

}
  async approveReject( id: number,
    updatedStatus: { status: Status }
    ,) {
await prisma.appointment.update({ where: { id }, data:updatedStatus })


    const updatedUserData = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        doctor:true,
        patient:true,
        dateTime:true,
        status:true,
        createdAt: true,
        updatedAt: true,
        // Omit password from the selection
      },
    });

    return updatedUserData;
  }
    
  async finishAppointment( id: number,
    updatedStatus: { status: Status }
    ,) {
await prisma.appointment.update({ where: { id }, data:updatedStatus })


    const updatedUserData = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        doctor:true,
        patient:true,
        dateTime:true,
        status:true,
        createdAt: true,
        updatedAt: true,
        // Omit password from the selection
      },
    });

    return updatedUserData;
  }
    
  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
  async getDoctorAppointments(token: string): Promise<Appointment[]> {
    // const secretKey = this.configservice.get<string>('SECRETKEY');

    const decodedToken = this.jwtService.decode(token,);
    // console.log(decodedToken)
    if (!decodedToken || !decodedToken.doctorId) {
      throw new UnauthorizedException('Invalid or missing doctor information in the token.');
    }

    const doctorId = decodedToken.doctorId;

    return prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
      },
      include: {
        doctor: {
          // include: {
          //   user: true, // Include all fields from the user
          // },
        },
        patient: {
          // include: {
          //   user: true, // Include all fields from the user
          // },
        },
      },
    });
  }
}


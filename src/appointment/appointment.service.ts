import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, PatientDoctor, Status } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { FinishDto } from './dto/finish-appointment.dto';
const prisma = new PrismaClient();

@Injectable()
export class AppointmentService {
  constructor(private readonly jwtService: JwtService) {}
  async makeAppointment(data: {
    patientId: number;
    doctorId: number;
    dateTime: Date;
  }): Promise<PatientDoctor | any> {
    const { patientId, doctorId, dateTime } = data;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
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
      throw new UnauthorizedException(
        'No relationship between patient and doctor',
      );
    }

    return prisma.appointment.create({
      data: {
        dateTime: dateTime,
        patient: { connect: { id: patient.id } },
        doctor: { connect: { id: doctor.id } },
      },
    });
  }

  async getAllAppointments(
    page: number,
    limit: number,
  ): Promise<Appointment[]> {
    const skip = (page - 1) * limit;

    return prisma.appointment.findMany({
      skip,
      take: limit,
    });
  }
  async approveReject(
    id: number,
    updatedStatus: ApproveRejectDto,
    token: string,
  ) {
    // DECODING TOKEN
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.doctorId) {
      throw new UnauthorizedException(
        'Invalid or missing doctor information in the token.',
      );
    }

    const doctorIdFromToken = decodedToken.doctorId;

    // CHECK IF THE APPOINTMENT EXISTS AND GET THE DOCTORID FROM DB
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { doctorId: true, status: true },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    const doctorIdFromTable = appointment.doctorId;
    
    // CHECK IF THE LOGGED DOCTOR IS THE SAME AS THE DCOTORID IN DB
    if (doctorIdFromToken !== doctorIdFromTable) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action.',
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updatedStatus,
      select: {
        id: true,
        doctor: true,
        patient: true,
        dateTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedAppointment;
  }

  async finishAppointment(id: number, updatedStatus: FinishDto,token: string) {
    const decodedToken = this.jwtService.decode(token);

  
    if (!decodedToken.patientId) {
      throw new UnauthorizedException(
        'Invalid or missing patient information in the token.',
      );
    }
    const appointment = await prisma.appointment.findUnique({where:{id},select:{patientId:true}});
    if(!appointment){
      throw new NotFoundException('Appointment not found')
    }
    const patientIdFromToken = decodedToken.patientId;
    const patientIdFromTable = appointment.patientId
    if(patientIdFromToken !== patientIdFromTable){
      throw new UnauthorizedException('You are not authorized to perform this action!')
    }

    const updatedUserData = await prisma.appointment.update({
      where: { id },
      data: updatedStatus,
      select: {
        id: true,
        doctor: true,
        patient: true,
        dateTime: true,
        status: true,
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

 
  async getDoctorAppointments(token: string): Promise<Appointment[]> {
    // const secretKey = this.configservice.get<string>('SECRETKEY');

    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken || !decodedToken.doctorId) {
      throw new UnauthorizedException(
        'Invalid or missing doctor information in the token.',
      );
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

  async cancelAppointment(id: number,token:string) {
    const decodedToken = this.jwtService.decode(token);

  
    if (!decodedToken.patientId) {
      throw new UnauthorizedException(
        'Invalid or missing patient information in the token.',
      );
    }
    const appointment = await prisma.appointment.findUnique({where:{id},select:{patientId:true}});
    if(!appointment){
      throw new NotFoundException('Appointment not found')
    }
    const patientIdFromToken = decodedToken.patientId;
    const patientIdFromTable = appointment.patientId
    if(patientIdFromToken !== patientIdFromTable){
      throw new UnauthorizedException('You are not authorized to perform this action!')
    }
    const deletedAppointment = await prisma.appointment.delete({where:{id}});
    return {message:"Appointment Deleted Successfully",deletedAppointment}
  }
}

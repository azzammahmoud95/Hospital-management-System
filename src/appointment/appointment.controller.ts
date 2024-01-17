import { Controller, Get, Post, Body, Patch, Param, Delete, Put, SetMetadata, UseGuards, Header, Headers, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, Status } from '@prisma/client';
import { RolesGuard } from 'src/guards/roles.guard';
import { PaginationDto } from './dto/pagination.dto';
// import { JwtService } from '@nestjs/jwt';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService,) {}

  @Post('make-appointment')
  // @UseGuards(RolesGuard)
  async makeAppointment(@Body() data: { patientId: number; doctorId: number,dateTime: Date }): Promise<any> {
    const result = await this.appointmentService.makeAppointment(data);
    return { message: 'Appintment Made Successfully', result };
  }

@Get('')
  async getAllAppointments(@Query() paginationDto: PaginationDto): Promise<Appointment[] | any> {
    const { page, limit } = paginationDto;

    const data = await this.appointmentService.getAllAppointments(page, limit);

    return {
      data,
      page,
      limit,
    };
  }


  @Get('doctor-appointment')
  async getAppointmentsForLoggedInDoctor(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '');
   const appointments = await this.appointmentService.getDoctorAppointments(token);
    return { appointments }
  }

@SetMetadata('roles', ['DOCTOR'])
@Patch('/approve-reject/:id')
@UseGuards(RolesGuard)
async approveReject(
  @Param('id') id: string,
  @Body() approveReject: { status: Status } // Make 'status' required
): Promise<Appointment | any> {
  // const decode  = this.jwtUtilService()
  return this.appointmentService.approveReject(Number(id), approveReject);
}
@SetMetadata('roles', ['DOCTOR'])
@Patch('/done/:id')
@UseGuards(RolesGuard)
async finishAppointment(
  @Param('id') id: string,
  @Body() approveReject: { status: Status } // Make 'status' required
): Promise<Appointment | any> {
  return this.appointmentService.finishAppointment(Number(id), approveReject);
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}

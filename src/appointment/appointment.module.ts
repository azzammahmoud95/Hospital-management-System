import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports:[ConfigModule,],
  controllers: [AppointmentController],
  providers: [AppointmentService,RolesGuard,ConfigService,JwtService],

})
export class AppointmentModule {}

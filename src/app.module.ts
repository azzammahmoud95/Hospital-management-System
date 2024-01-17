import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
@Module({
  imports: [UserModule, AppointmentModule, DoctorModule, PatientModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

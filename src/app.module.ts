import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentModule } from './appointment/appointment.module';
@Module({
  imports: [UserModule, AppointmentModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

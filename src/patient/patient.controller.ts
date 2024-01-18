import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Patient } from '@prisma/client';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  async getAllDoctors(@Query() paginationDto: PaginationDto): Promise<Patient[] | any> {
    const { page, limit } = paginationDto;

    const patients = await this.patientService.getAllDoctors(page, limit);

    return {
      patients,
      page,
      limit,
    };
  }
// @SetMetadata('roles', ['PATIENT'])
  // @UseGuards(RolesGuard)
  @Get('patient-doctors')
  async getDoctorsForPatient(@Headers('authorization') authorization: string): Promise<any> {
    const token = authorization?.replace('Bearer ', '');

    const doctors = await this.patientService.getDoctorsOfPatient(token);
    return { doctors };
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.patientService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(+id, updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(+id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
@Injectable()
export class PatientService {
  // private  constructor(private readonly prismaClient: PrismaClient){}
  create(createPatientDto: CreatePatientDto) {
    return 'This action adds a new patient';
  }

  async getAllDoctors(page: number, limit: number): Promise<Patient[] | any> {
    const skip = (page - 1) * limit;
  
    return prisma.patient.findMany({
      skip,
      take: limit,
      select:{
        user: {
          select:{
            name:true,
            email:true,
            role:true,
          }
        } ,
        
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} patient`;
  }

  update(id: number, updatePatientDto: UpdatePatientDto) {
    return `This action updates a #${id} patient`;
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}

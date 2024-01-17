import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
@Injectable()
export class DoctorService {
  create(createDoctorDto: CreateDoctorDto) {
    return 'This action adds a new doctor';
  }

  async getAllDoctors(page: number, limit: number): Promise<Doctor[] | any> {
    const skip = (page - 1) * limit;
  
    return prisma.doctor.findMany({
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
    return `This action returns a #${id} doctor`;
  }

  update(id: number, updateDoctorDto: UpdateDoctorDto) {
    return `This action updates a #${id} doctor`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctor`;
  }
}

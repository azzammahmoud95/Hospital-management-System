import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient, PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
const prisma = new PrismaClient()
@Injectable()
export class PatientService {
  // private  constructor(private readonly prismaClient: PrismaClient){}
  constructor(
    private readonly jwtService: JwtService,
    private readonly configservice: ConfigService,
  ) {}
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

  async getDoctorsOfPatient(token: string){
    const decodedToken = this.jwtService.decode(token);

  
    if (!decodedToken.patientId) {
      throw new UnauthorizedException(
        'Invalid or missing patient information in the token.',
      );
    }
    
    // Use Prisma's relation navigation to get doctors for the patient
    const doctors = await prisma.patient.findUnique({where:{id:decodedToken.patientId}}).doctors({
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
               
              },
            },
          },
        },
      },
    });
// Assuming you named the relation "doctors"
    return doctors
  }

  update(id: number, updatePatientDto: UpdatePatientDto) {
    return `This action updates a #${id} patient`;
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}

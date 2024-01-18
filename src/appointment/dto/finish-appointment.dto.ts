// src/dto/approve-reject.dto.ts

import { IsIn } from 'class-validator';
// import { Status } from '../your-status-enumeration-file'; // Import your Status enumeration
import { Status } from '@prisma/client';
export class FinishDto {
  @IsIn(['DONE'], { message: 'Invalid status. Must be only DONE' })
  status: Status;
}

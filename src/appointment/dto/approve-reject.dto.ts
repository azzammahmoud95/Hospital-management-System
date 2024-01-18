// src/dto/approve-reject.dto.ts

import { IsIn } from 'class-validator';
// import { Status } from '../your-status-enumeration-file'; // Import your Status enumeration
import { Status } from '@prisma/client';
export class ApproveRejectDto {
  @IsIn(['APPROVE', 'REJECT'], { message: 'Invalid status. Must be either APPROVE or REJECT.' })
  status: Status;
}

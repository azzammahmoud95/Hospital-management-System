// src/services/prisma.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  get client() {
    return this.prisma;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}

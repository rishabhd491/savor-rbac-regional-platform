import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: string) {
    if (!id) return null;
    return this.prisma.user.findUnique({ where: { id } });
  }
}

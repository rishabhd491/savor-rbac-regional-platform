import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User) {
    // Users can see their own payment methods
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });
  }

  async create(user: User, type: string, details: string) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins can add/modify payment methods',
      );
    }

    return this.prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        details,
      },
    });
  }

  async update(user: User, id: string, type: string, details: string) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins can add/modify payment methods',
      );
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { type, details },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(country?: Country) {
    return this.prisma.restaurant.findMany({
      where: country ? { country } : {},
      include: { menuItems: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });
  }
}

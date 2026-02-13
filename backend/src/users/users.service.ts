import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Country } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    name: string;
    role: Role;
    country: Country;
  }) {
    return this.prisma.user.create({ data });
  }

  async findOrCreate(name: string, role: Role, country: Country) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${role.toLowerCase()}@slooze.com`;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role,
          country,
        },
      });
    } else {
      // Update role/country if they changed for this specific "demo" user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role, country },
      });
    }

    return user;
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: User) {
    const where = user ? { user: { country: user.country } } : {};
    return this.prisma.cartItem.findMany({
      where,
      include: {
        menuItem: true,
        restaurant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToCart(
    user: User,
    menuItemId: string,
    restaurantId: string,
    quantity: number,
  ) {
    // Shared cart logic: items are shared within the same restaurant/country
    const existing = await this.prisma.cartItem.findFirst({
      where: { menuItemId, restaurantId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          userId: user.id, // Track who last modified it
        },
        include: { menuItem: true, restaurant: true, user: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId: user.id,
        menuItemId,
        restaurantId,
        quantity,
      },
      include: { menuItem: true, restaurant: true, user: true },
    });
  }

  async removeFromCart(id: string, user: User) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!item) throw new Error('Cart item not found');

    // RBAC: Managers and Admins can remove anything. Members can only remove if they are in the same country.
    if (user.role === 'MEMBER' && item.restaurant.country !== user.country) {
      throw new ForbiddenException('Cannot modify cart from another country');
    }

    return this.prisma.cartItem.delete({
      where: { id },
      include: { menuItem: true, restaurant: true, user: true },
    });
  }

  async clearCart(user: User, restaurantId?: string) {
    const where: any = {
      restaurant: { country: user.country },
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    await this.prisma.cartItem.deleteMany({ where });
    return true;
  }
}

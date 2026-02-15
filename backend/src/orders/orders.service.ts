import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role, User } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User) {
    return this.prisma.order.findMany({
      where: {
        restaurant: { country: user.country },
      },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    user: User,
    restaurantId: string,
    itemIds: string[],
    paymentType?: string,
    paymentDetails?: string,
  ) {
    // Members are now allowed to place orders
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (
      !restaurant ||
      (user.role !== Role.ADMIN && restaurant.country !== user.country)
    ) {
      throw new ForbiddenException(
        'Cannot order from a restaurant in a different country',
      );
    }

    // Restriction: Only MEMBERS in the INDIA region are blocked from checkout
    // ADMIN and MANAGER can checkout regardless of country
    if (user.role === Role.MEMBER && user.country === 'INDIA') {
      throw new ForbiddenException(
        'Checkout is disabled for Members in the India region',
      );
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds }, restaurantId },
    });

    const totalAmount = menuItems.reduce((sum, item) => sum + item.price, 0);

    return (this.prisma.order.create as any)({
      data: {
        userId: user.id,
        restaurantId,
        totalAmount,
        status: paymentType ? OrderStatus.PAID : OrderStatus.PENDING,
        paymentType,
        paymentDetails,
        items: {
          create: itemIds.map((id) => ({
            menuItemId: id,
            quantity: 1,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        user: true,
      },
    });
  }

  async updatePayment(
    user: User,
    orderId: string,
    paymentType: string,
    paymentDetails?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new Error('Order not found');

    // Check access
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot modify payments');
    }
    // Strict requirement: "Manager (all except modify payment)"
    if (user.role === Role.MANAGER) {
      throw new ForbiddenException(
        'Managers are not allowed to modify payment methods',
      );
    }

    return (this.prisma.order.update as any)({
      where: { id: orderId },
      data: {
        paymentType,
        paymentDetails,
        status: OrderStatus.PAID,
      },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        user: true,
      },
    });
  }

  async updateStatus(user: User, orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new Error('Order not found');
    if (user.role !== Role.ADMIN && order.restaurant.country !== user.country) {
      throw new ForbiddenException(
        'Cannot manage orders from a different country',
      );
    }

    // Role checks
    if (status === OrderStatus.PAID || status === OrderStatus.CANCELLED) {
      if (user.role === Role.MEMBER) {
        throw new ForbiddenException('Members cannot pay or cancel orders');
      }
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: { include: { menuItem: true } } },
    });
  }
}

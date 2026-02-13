import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './order.model';
import { AuthService } from '../auth/auth.service';
import { OrderStatus } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
  ) {}

  @Query(() => [Order], { name: 'orders' })
  async getOrders(@Context() context: any) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.ordersService.findAll(user);
  }

  @Mutation(() => Order)
  async createOrder(
    @Context() context: any,
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @Args('itemIds', { type: () => [ID] }) itemIds: string[],
    @Args('paymentType', { nullable: true }) paymentType?: string,
    @Args('paymentDetails', { nullable: true }) paymentDetails?: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.ordersService.create(
      user,
      restaurantId,
      itemIds,
      paymentType,
      paymentDetails,
    );
  }

  @Mutation(() => Order)
  async updateOrderPayment(
    @Context() context: any,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('paymentType') paymentType: string,
    @Args('paymentDetails', { nullable: true }) paymentDetails?: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.ordersService.updatePayment(
      user,
      orderId,
      paymentType,
      paymentDetails,
    );
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Context() context: any,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.ordersService.updateStatus(user, orderId, status);
  }
}

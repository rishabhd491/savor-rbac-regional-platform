import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from './payment-method.model';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => PaymentMethod)
export class PaymentMethodsResolver {
  constructor(
    private paymentMethodsService: PaymentMethodsService,
    private authService: AuthService,
  ) {}

  @Query(() => [PaymentMethod], { name: 'paymentMethods' })
  async getPaymentMethods(@Context() context: any) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.paymentMethodsService.findAll(user);
  }

  @Mutation(() => PaymentMethod)
  async createPaymentMethod(
    @Context() context: any,
    @Args('type') type: string,
    @Args('details') details: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.paymentMethodsService.create(user, type, details);
  }

  @Mutation(() => PaymentMethod)
  async updatePaymentMethod(
    @Context() context: any,
    @Args('id', { type: () => ID }) id: string,
    @Args('type') type: string,
    @Args('details') details: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.paymentMethodsService.update(user, id, type, details);
  }
}

import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Int,
} from '@nestjs/graphql';
import { CartService } from './cart.service';
import { CartItem } from './cart.model';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => CartItem)
export class CartResolver {
  constructor(
    private cartService: CartService,
    private authService: AuthService,
  ) {}

  @Query(() => [CartItem], { name: 'cartItems' })
  async getCartItems(@Context() context: any) {
    const user = await this.authService.getUser(context.userId);
    return this.cartService.findAll(user || undefined);
  }

  @Mutation(() => CartItem)
  async addToCart(
    @Context() context: any,
    @Args('menuItemId', { type: () => ID }) menuItemId: string,
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @Args('quantity', { type: () => Int, defaultValue: 1 }) quantity: number,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.cartService.addToCart(user, menuItemId, restaurantId, quantity);
  }

  @Mutation(() => CartItem)
  async removeFromCart(
    @Context() context: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.cartService.removeFromCart(id, user);
  }

  @Mutation(() => Boolean)
  async clearCart(
    @Context() context: any,
    @Args('restaurantId', { type: () => ID, nullable: true })
    restaurantId?: string,
  ) {
    const user = await this.authService.getUser(context.userId);
    if (!user) throw new UnauthorizedException();
    return this.cartService.clearCart(user, restaurantId);
  }
}

import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@prisma/client';
import { MenuItem } from '../restaurants/restaurant.model';
import { User } from '../users/user.model';
import { Restaurant } from '../restaurants/restaurant.model';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  menuItemId: string;

  @Field(() => MenuItem)
  menuItem: MenuItem;

  @Field()
  quantity: number;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  restaurantId: string;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field()
  totalAmount: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field({ nullable: true })
  paymentType?: string;

  @Field({ nullable: true })
  paymentDetails?: string;

  @Field()
  createdAt: Date;
}

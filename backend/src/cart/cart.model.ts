import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { MenuItem } from '../restaurants/restaurant.model';
import { User } from '../users/user.model';
import { Restaurant } from '../restaurants/restaurant.model';

@ObjectType()
export class CartItem {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  menuItemId: string;

  @Field(() => MenuItem)
  menuItem: MenuItem;

  @Field()
  restaurantId: string;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => Int)
  quantity: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

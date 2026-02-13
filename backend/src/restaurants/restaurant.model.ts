import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Country } from '@prisma/client';

registerEnumType(Country, {
  name: 'Country',
});

@ObjectType()
export class MenuItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field()
  restaurantId: string;
}

@ObjectType()
export class Restaurant {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Country)
  country: Country;

  @Field(() => [MenuItem], { nullable: 'items' })
  menuItems?: MenuItem[];
}

import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role, Country } from '@prisma/client';

registerEnumType(Role, {
  name: 'Role',
});

registerEnumType(Country, {
  name: 'Country',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Country)
  country: Country;

  @Field()
  createdAt: Date;
}

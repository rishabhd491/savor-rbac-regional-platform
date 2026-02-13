import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethod {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  type: string;

  @Field()
  details: string;

  @Field()
  createdAt: Date;
}

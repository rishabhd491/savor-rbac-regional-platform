import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.model';
import { Role, Country } from '@prisma/client';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'me', nullable: true })
  async me(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async login(
    @Args('name') name: string,
    @Args('role', { type: () => Role }) role: Role,
    @Args('country', { type: () => Country }) country: Country,
  ) {
    return this.usersService.findOrCreate(name, role, country);
  }
}

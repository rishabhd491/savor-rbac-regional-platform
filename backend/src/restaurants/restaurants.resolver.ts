import { Resolver, Query, Args, ID, Context } from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './restaurant.model';
import { AuthService } from '../auth/auth.service';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(
    private restaurantsService: RestaurantsService,
    private authService: AuthService,
  ) {}

  @Query(() => [Restaurant], { name: 'restaurants' })
  async getRestaurants(@Context() context: any) {
    const user = await this.authService.getUser(context.userId);
    // Admins see all restaurants, others see restaurants in their country
    const countryFilter = user?.role === 'ADMIN' ? undefined : user?.country;
    return this.restaurantsService.findAll(countryFilter);
  }

  @Query(() => Restaurant, { name: 'restaurant', nullable: true })
  async getRestaurant(@Args('id', { type: () => ID }) id: string) {
    return this.restaurantsService.findOne(id);
  }
}

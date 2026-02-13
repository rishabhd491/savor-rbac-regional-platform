import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CountryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().user;

    if (!user) return false;

    // The user's country is used to filter results in services/resolvers
    // This guard ensures a user exists and has a country
    return !!user.country;
  }
}

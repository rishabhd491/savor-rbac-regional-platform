import { SetMetadata } from '@nestjs/common';
import { Role, Country } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const COUNTRIES_KEY = 'countries';
export const Countries = (...countries: Country[]) =>
  SetMetadata(COUNTRIES_KEY, countries);

export const CURRENT_USER_KEY = 'currentUser';

import {
  Controller,
  Delete,
  Headers,
  HttpCode,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';

import { AuthService } from './auth.service';

@Controller('users')
export class CurrentUserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Delete('me')
  @HttpCode(204)
  async deleteMe(@Headers('authorization') authorizationHeader?: string) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    await this.usersService.softDeleteById(user.id);
  }
}
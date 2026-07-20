import { Controller, Get, Headers } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Headers('authorization') authorizationHeader?: string) {
    return this.authService.getMeFromAuthorizationHeader(authorizationHeader);
  }
}
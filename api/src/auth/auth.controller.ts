import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@Headers('authorization') authorizationHeader?: string) {
    return this.authService.getMeFromAuthorizationHeader(authorizationHeader);
  }
}
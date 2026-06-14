import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  getMe(@Headers('authorization') authorizationHeader?: string) {
    return this.authService.getMeFromAuthorizationHeader(authorizationHeader);
  }
}
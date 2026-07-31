import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { EmailAuthService } from './email-auth.service';

@ApiTags('Auth / Email')
@Controller('auth/email')
export class EmailAuthController {
  constructor(private readonly emailAuthService: EmailAuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterEmailDto) {
    return this.emailAuthService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginEmailDto) {
    return this.emailAuthService.login(dto);
  }

  @Post('verification/request')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.emailAuthService.requestEmailVerification(dto);
  }

  @Post('verification/confirm')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
    return this.emailAuthService.confirmEmailVerification(dto);
  }

  @Post('password-reset/request')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.emailAuthService.requestPasswordReset(dto);
  }

  @Post('password-reset/confirm')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  confirmPasswordReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.emailAuthService.confirmPasswordReset(dto);
  }
}

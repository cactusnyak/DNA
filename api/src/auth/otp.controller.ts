import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpService } from './otp.service';

@ApiTags('Auth / OTP')
@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  send(@Body() sendOtpDto: SendOtpDto) {
    return this.otpService.sendOtp(sendOtpDto);
  }

  @Post('verify')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
}

import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { isIP } from 'node:net';
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
  send(@Body() sendOtpDto: SendOtpDto, @Req() request: Request) {
    const clientIp = request.ip && isIP(request.ip) ? request.ip : undefined;
    return this.otpService.sendOtp(sendOtpDto, clientIp);
  }

  @Post('verify')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
}

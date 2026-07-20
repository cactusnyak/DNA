import { Body, Controller, Post } from '@nestjs/common';

import { OtpService } from './otp.service';

import type { SendOtpDto } from './dto/send-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  send(@Body() sendOtpDto: SendOtpDto) {
    return this.otpService.sendOtp(sendOtpDto);
  }

  @Post('verify')
  verify(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
}

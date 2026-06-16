import { Controller, Get, Headers } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';

import { ReferralsService } from './referrals.service';

@Controller('referrals')
export class ReferralsController {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly authService: AuthService,
  ) {}

  @Get('tree')
  async getReferralTree(
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.referralsService.getReferralTree(user.id);
  }
}
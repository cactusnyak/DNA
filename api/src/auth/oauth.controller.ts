import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { OAuthService } from './oauth.service';

@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('providers')
  getProviders() {
    return this.oauthService.getAvailableProviders();
  }

  @Get(':provider')
  authorize(
    @Param('provider') provider: string,
    @Res() res: Response,
    @Query('mode') mode?: string,
    @Query('inviterReferralCode') inviterReferralCode?: string,
  ) {
    const url = this.oauthService.getAuthorizationUrl(
      provider,
      mode,
      inviterReferralCode,
    );

    res.redirect(url);
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') providerError: string | undefined,
    @Res() res: Response,
  ) {
    if (providerError) {
      throw new BadRequestException(
        `OAuth provider error: ${providerError}`,
      );
    }

    const { accessToken } = await this.oauthService.handleCallback(
      provider,
      code,
      state,
    );

    const webAppUrl = process.env.WEB_APP_URL ?? 'http://localhost:5173';

    res.redirect(
      `${webAppUrl}/authorization?oauth_access_token=${accessToken}`,
    );
  }
}

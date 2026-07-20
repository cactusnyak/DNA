import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { OAuthService } from './oauth.service';

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {}

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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') providerError: string | undefined,
    @Res() res: Response,
  ) {
    const webAppUrl = this.configService.getOrThrow<string>('WEB_APP_URL');

    try {
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

      res.redirect(
        `${webAppUrl}/authorization?oauth_access_token=${accessToken}`,
      );
    } catch (error) {
      const message =
        error instanceof HttpException ? error.message : 'OAuth failed';

      res.redirect(
        `${webAppUrl}/authorization?oauth_error=${encodeURIComponent(message)}`,
      );
    }
  }
}

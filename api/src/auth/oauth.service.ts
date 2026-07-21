import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';

import { TokenService } from './token.service';

type OAuthProvider = 'yandex';

type OAuthState = {
  provider: OAuthProvider;
  mode: 'login' | 'register';
  inviterReferralCode?: string;
};

type YandexUserInfo = {
  id: string;
  default_email?: string;
  emails?: string[];
  first_name?: string;
  last_name?: string;
  display_name?: string;
  default_avatar_id?: string;
};

type OAuthProfile = {
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
};

type OAuthTokens = {
  access_token: string;
  expires_in?: number;
};

@Injectable()
export class OAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  getAuthorizationUrl(
    provider: string,
    mode?: string,
    inviterReferralCode?: string,
  ) {
    const normalizedProvider = this.validateProvider(provider);
    const state = this.encodeState({
      provider: normalizedProvider,
      mode: mode === 'register' ? 'register' : 'login',
      inviterReferralCode,
    });

    const config = this.getProviderConfig(normalizedProvider);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      state,
      scope: config.scope,
    });

    return `${config.authorizationEndpoint}?${params.toString()}`;
  }

  getAvailableProviders(): OAuthProvider[] {
    const isConfigured =
      this.configService.get<string>('YANDEX_CLIENT_ID') &&
      this.configService.get<string>('YANDEX_CLIENT_SECRET') &&
      this.configService.get<string>('YANDEX_REDIRECT_URI');

    return isConfigured ? ['yandex'] : [];
  }

  async handleCallback(provider: string, code: string, state?: string) {
    if (!state) {
      throw new BadRequestException('OAuth state is missing');
    }

    const normalizedProvider = this.validateProvider(provider);
    const parsedState = this.decodeState(state);

    if (parsedState.provider !== normalizedProvider) {
      throw new BadRequestException('OAuth state provider mismatch');
    }

    if (!code) {
      throw new BadRequestException('OAuth code is missing');
    }

    const tokens = await this.exchangeCodeForTokens(
      normalizedProvider,
      code,
    );
    const profile = await this.fetchUserInfo(
      normalizedProvider,
      tokens.access_token,
    );
    const user = await this.findOrCreateUser(
      normalizedProvider,
      profile,
      parsedState,
    );

    return {
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }

  private validateProvider(value: string): OAuthProvider {
    if (value === 'yandex') {
      return value;
    }

    throw new BadRequestException('Unsupported OAuth provider');
  }

  private encodeState(state: OAuthState) {
    return Buffer.from(JSON.stringify(state)).toString('base64url');
  }

  private decodeState(value: string): OAuthState {
    try {
      const parsed = JSON.parse(
        Buffer.from(value, 'base64url').toString('utf-8'),
      );

      if (!parsed || typeof parsed !== 'object') {
        throw new Error();
      }

      return parsed as OAuthState;
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }
  }

  private getConfigValue(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new InternalServerErrorException(`Missing OAuth config: ${key}`);
    }

    return value;
  }

  private getProviderConfig(provider: OAuthProvider) {
    return {
      clientId: this.getConfigValue('YANDEX_CLIENT_ID'),
      clientSecret: this.getConfigValue('YANDEX_CLIENT_SECRET'),
      redirectUri: this.getConfigValue('YANDEX_REDIRECT_URI'),
      authorizationEndpoint: 'https://oauth.yandex.com/authorize',
      tokenEndpoint: 'https://oauth.yandex.com/token',
      userInfoEndpoint: 'https://login.yandex.ru/info?format=json',
      scope: 'login:email login:info',
    };
  }

  private async exchangeCodeForTokens(
    provider: OAuthProvider,
    code: string,
  ): Promise<OAuthTokens> {
    const config = this.getProviderConfig(provider);
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    });

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`,
        ).toString('base64')}`,
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new UnauthorizedException(
        `OAuth token exchange failed: ${errorText}`,
      );
    }

    return response.json() as Promise<OAuthTokens>;
  }

  private async fetchUserInfo(
    provider: OAuthProvider,
    accessToken: string,
  ): Promise<OAuthProfile> {
    const config = this.getProviderConfig(provider);
    const response = await fetch(config.userInfoEndpoint, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new UnauthorizedException(
        `Failed to fetch ${provider} user info: ${errorText}`,
      );
    }

    const data = (await response.json()) as YandexUserInfo;
    const email = data.default_email ?? data.emails?.[0];

    if (!email) {
      throw new BadRequestException(
        'Yandex account did not provide an email',
      );
    }

    return {
      providerId: data.id,
      email: email.toLowerCase(),
      firstName: data.first_name,
      lastName: data.last_name,
      nickname: data.display_name ?? data.first_name,
    };
  }

  private async findOrCreateUser(
    provider: OAuthProvider,
    profile: OAuthProfile,
    state: OAuthState,
  ) {
    const existing = await this.usersService.findByOAuthProviderId(
      provider,
      profile.providerId,
    );

    if (existing) {
      return existing;
    }

    if (state.mode === 'login') {
      throw new UnauthorizedException(
        'No account found for this OAuth provider',
      );
    }

    return this.usersService.createOAuthUser({
      email: profile.email,
      nickname:
        profile.nickname || profile.email.split('@')[0] || 'user',
      firstName: profile.firstName,
      lastName: profile.lastName,
      oauthProvider: provider,
      oauthProviderId: profile.providerId,
      inviterReferralCode: state.inviterReferralCode,
    });
  }
}

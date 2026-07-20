import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async getMeFromAuthorizationHeader(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    const payload = this.tokenService.verifyAccessToken(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getOptionalMeFromAuthorizationHeader(authorizationHeader?: string) {
    if (!authorizationHeader) {
      return undefined;
    }

    return this.getMeFromAuthorizationHeader(authorizationHeader);
  }

  private createAuthResponse(user: any) {
    return {
      user,
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email ?? '',
        role: user.role,
      }),
    };
  }

  private extractBearerToken(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    return token;
  }

}
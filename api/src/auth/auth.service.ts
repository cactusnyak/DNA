import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';

import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { value: login, type } = this.parseLogin(
      this.getRequiredString(registerDto.login, 'login'),
    );
    const password = this.getPassword(registerDto.password);
    const nickname = this.getRequiredString(registerDto.nickname, 'nickname');
    const inviterReferralCode = this.getOptionalString(
      registerDto.inviterReferralCode,
    );

    const passwordHash = this.passwordService.hashPassword(password);

    const user = await this.usersService.createRegisteredUser({
      email: type === 'email' ? login : undefined,
      phone: type === 'phone' ? login : undefined,
      passwordHash,
      nickname,
      inviterReferralCode,
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const { value: login } = this.parseLogin(
      this.getRequiredString(loginDto.login, 'login'),
    );
    const password = this.getPassword(loginDto.password);

    const user = await this.usersService.findByLogin(login);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const isPasswordValid = this.passwordService.verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login or password');
    }

    return this.createAuthResponse(this.usersService.mapPublicUser(user));
  }

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

  private parseLogin(value: string) {
    const trimmedValue = value.trim().toLowerCase();

    if (trimmedValue.includes('@')) {
      if (!trimmedValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new BadRequestException('login is invalid email');
      }

      return { type: 'email' as const, value: trimmedValue };
    }

    const normalizedPhone = trimmedValue.replace(/[\s\-()]/g, '');

    if (!normalizedPhone.match(/^\+?[0-9]{10,15}$/)) {
      throw new BadRequestException('login is invalid phone number');
    }

    return { type: 'phone' as const, value: normalizedPhone };
  }

  private getPassword(value: unknown) {
    if (typeof value !== 'string' || value.length < 6) {
      throw new BadRequestException('password must be at least 6 characters');
    }

    return value;
  }

  private getRequiredString(value: unknown, fieldName: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return value.trim();
  }

  private getOptionalString(value: unknown) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue || undefined;
  }
}
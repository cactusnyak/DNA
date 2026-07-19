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
    const email = this.getEmail(registerDto.email);
    const password = this.getPassword(registerDto.password);
    const nickname = this.getRequiredString(registerDto.nickname, 'nickname');
    const firstName = this.getRequiredString(
      registerDto.firstName,
      'firstName',
    );
    const lastName = this.getRequiredString(registerDto.lastName, 'lastName');

    const phone = this.getOptionalString(registerDto.phone);
    const patronymic = this.getOptionalString(registerDto.patronymic);
    const inviterReferralCode = this.getOptionalString(
      registerDto.inviterReferralCode,
    );

    const passwordHash = this.passwordService.hashPassword(password);

    const user = await this.usersService.createRegisteredUser({
      email,
      passwordHash,
      nickname,
      firstName,
      lastName,
      patronymic,
      phone,
      inviterReferralCode,
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const email = this.getEmail(loginDto.email);
    const password = this.getPassword(loginDto.password);

    const user = await this.usersService.findByEmail(email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = this.passwordService.verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
        email: user.email,
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

  private getEmail(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('email is required');
    }

    const email = value.trim().toLowerCase();

    if (!email.includes('@')) {
      throw new BadRequestException('email is invalid');
    }

    return email;
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
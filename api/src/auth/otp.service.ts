import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import type { SendOtpDto } from './dto/send-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import { TokenService } from './token.service';

const OTP_CODE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OtpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const { value: login, type } = this.parseLogin(
      this.getRequiredString(dto.login, 'login'),
    );
    const mode = this.getRequiredString(dto.mode, 'mode');

    if (mode !== 'login' && mode !== 'register') {
      throw new BadRequestException('Invalid OTP mode');
    }

    const existingUser = await this.usersService.findByLogin(login);

    if (mode === 'register' && existingUser) {
      throw new ConflictException(
        'User with this login already exists',
      );
    }

    if (mode === 'login' && !existingUser) {
      throw new NotFoundException('User not found');
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_CODE_TTL_MS);

    await this.prismaService.otpCode.deleteMany({
      where: { login },
    });

    await this.prismaService.otpCode.create({
      data: {
        login,
        type,
        code,
        expiresAt,
      },
    });

    await this.notificationService.sendOtpCode(type, login, code);

    return { expiresInSeconds: OTP_CODE_TTL_MS / 1000 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { value: login, type } = this.parseLogin(
      this.getRequiredString(dto.login, 'login'),
    );
    const mode = this.getRequiredString(dto.mode, 'mode');
    const code = this.getRequiredString(dto.code, 'code');

    if (mode !== 'login' && mode !== 'register') {
      throw new BadRequestException('Invalid OTP mode');
    }

    const otpRecord = await this.prismaService.otpCode.findFirst({
      where: {
        login,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    await this.prismaService.otpCode.delete({
      where: { id: otpRecord.id },
    });

    if (mode === 'register') {
      const nickname = this.getRequiredString(dto.nickname, 'nickname');
      const inviterReferralCode = this.getOptionalString(
        dto.inviterReferralCode,
      );

      const user = await this.usersService.createRegisteredUser({
        email: type === 'email' ? login : undefined,
        phone: type === 'phone' ? login : undefined,
        nickname,
        inviterReferralCode,
      });

      return this.createAuthResponse(user);
    }

    const user = await this.usersService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.createAuthResponse(user);
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

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

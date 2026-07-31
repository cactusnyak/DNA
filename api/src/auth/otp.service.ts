import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import type { UserRole } from '@prisma/client';

import { SmsRuError } from '../integrations/sms-ru/sms-ru.errors';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { AuthCapabilitiesService } from './capabilities/auth-capabilities.service';
import { AuthMethod, AuthOperation } from './capabilities/auth-method.enum';
import type { SendOtpDto } from './dto/send-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  OTP_DELIVERY_PROVIDER,
  type OtpDeliveryProvider,
} from './otp-delivery.provider';
import { TokenService } from './token.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    private readonly authCapabilities: AuthCapabilitiesService,
    @Inject(OTP_DELIVERY_PROVIDER)
    private readonly deliveryProvider: OtpDeliveryProvider,
  ) {}

  async sendOtp(dto: SendOtpDto, clientIp?: string) {
    const purpose = this.parseMode(dto.mode);
    this.authCapabilities.assertEnabled(
      AuthMethod.OTP,
      purpose === 'register'
        ? AuthOperation.REGISTRATION
        : AuthOperation.LOGIN,
    );
    const { value: login, type } = this.parseLogin(
      this.required(dto.login, 'login'),
    );
    const now = new Date();
    const ttlSeconds = this.config.getOrThrow<number>('OTP_CODE_TTL_SECONDS');
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const id = randomUUID();
    const codeHash = this.hash(`${id}:${login}:${purpose}:${code}`);
    const ipHash = clientIp ? this.hash(`ip:${clientIp}`) : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`otp:${login}`}))`;
      if (ipHash) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`otp:${ipHash}`}))`;
      }

      const cooldown = this.config.getOrThrow<number>(
        'OTP_RESEND_COOLDOWN_SECONDS',
      );
      const last = await tx.otpCode.findFirst({
        where: { login, sentAt: { not: null } },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      });
      if (
        last?.sentAt &&
        last.sentAt.getTime() > now.getTime() - cooldown * 1000
      ) {
        throw this.tooManyRequests(
          'Please wait before requesting another code',
        );
      }

      const since = new Date(now.getTime() - 60 * 60 * 1000);
      const [phoneCount, ipCount] = await Promise.all([
        tx.otpCode.count({ where: { login, sentAt: { gte: since } } }),
        ipHash
          ? tx.otpCode.count({
              where: { clientIpHash: ipHash, sentAt: { gte: since } },
            })
          : Promise.resolve(0),
      ]);
      if (
        phoneCount >=
          this.config.getOrThrow<number>('OTP_MAX_SENDS_PER_PHONE_PER_HOUR') ||
        (ipHash &&
          ipCount >=
            this.config.getOrThrow<number>('OTP_MAX_SENDS_PER_IP_PER_HOUR'))
      ) {
        throw this.tooManyRequests('OTP request limit exceeded');
      }

      let delivery: {
        provider: string;
        externalMessageId?: string;
        providerStatusCode?: number;
      };
      try {
        if (type === 'phone') {
          delivery = await this.deliveryProvider.sendOtp({
            phone: login,
            code,
            clientIp,
            expiresInSeconds: ttlSeconds,
          });
        } else {
          await this.notificationService.sendOtpCode('email', login, code);
          delivery = { provider: 'email' };
        }
      } catch (error) {
        this.mapDeliveryError(error, type === 'phone' ? login : undefined);
      }

      if (type === 'phone') {
        this.logger.log(
          JSON.stringify({
            event: 'otp.sms.accepted',
            provider: delivery!.provider,
            phoneMasked: this.maskPhone(login),
            providerMessageId: delivery!.externalMessageId,
            providerStatusCode: delivery!.providerStatusCode,
          }),
        );
      }

      await tx.otpCode.create({
        data: {
          id,
          login,
          type,
          purpose,
          codeHash,
          expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
          provider: delivery!.provider,
          providerMessageId: delivery!.externalMessageId,
          providerStatusCode: delivery!.providerStatusCode,
          deliveryStatus: 'ACCEPTED',
          sentAt: now,
          clientIpHash: ipHash,
        },
      });

      const active = await tx.otpCode.findMany({
        where: { login, consumedAt: null, expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' },
        skip: 3,
        select: { id: true },
      });
      if (active.length) {
        await tx.otpCode.updateMany({
          where: { id: { in: active.map((item) => item.id) } },
          data: { consumedAt: now },
        });
      }
    });

    return {
      expiresInSeconds: ttlSeconds,
      resendAfterSeconds: this.config.getOrThrow<number>(
        'OTP_RESEND_COOLDOWN_SECONDS',
      ),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const purpose = this.parseMode(dto.mode);
    this.authCapabilities.assertEnabled(
      AuthMethod.OTP,
      purpose === 'register'
        ? AuthOperation.REGISTRATION
        : AuthOperation.LOGIN,
    );
    const { value: login } = this.parseLogin(this.required(dto.login, 'login'));
    const code = this.required(dto.code, 'code');
    const now = new Date();
    const maxAttempts = this.config.getOrThrow<number>(
      'OTP_MAX_VERIFY_ATTEMPTS',
    );

    const record = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`otp:${login}`}))`;
      const candidates = await tx.otpCode.findMany({
        where: {
          login,
          purpose,
          consumedAt: null,
          expiresAt: { gt: now },
          verifyAttempts: { lt: maxAttempts },
          codeHash: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });
      const matched = candidates.find((candidate) =>
        this.safeEqual(
          candidate.codeHash!,
          this.hash(`${candidate.id}:${login}:${purpose}:${code}`),
        ),
      );
      if (!matched) {
        const latest = candidates[0];
        if (latest) {
          await tx.otpCode.update({
            where: { id: latest.id },
            data: { verifyAttempts: { increment: 1 } },
          });
        }
        throw new UnauthorizedException('Invalid or expired OTP code');
      }
      const consumed = await tx.otpCode.updateMany({
        where: {
          id: matched.id,
          consumedAt: null,
          verifyAttempts: { lt: maxAttempts },
        },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1)
        throw new UnauthorizedException('Invalid or expired OTP code');
      return matched;
    });

    const existingUser = await this.usersService.findByLogin(login);
    if (purpose === 'register') {
      if (existingUser)
        throw new UnauthorizedException('Unable to complete authentication');
      const nickname = this.required(dto.nickname, 'nickname');
      const user = await this.usersService.createRegisteredUser({
        email: record.type === 'email' ? login : undefined,
        phone: record.type === 'phone' ? login : undefined,
        nickname,
        inviterReferralCode: this.optional(dto.inviterReferralCode),
      });
      return this.authResponse(user);
    }
    if (!existingUser)
      throw new UnauthorizedException('Unable to complete authentication');
    return this.authResponse(existingUser);
  }

  private parseLogin(value: string) {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
        throw new BadRequestException('login is invalid');
      return { type: 'email' as const, value: normalized };
    }
    const digits = normalized.replace(/\D/g, '');
    const phone =
      digits.length === 11 && digits.startsWith('8')
        ? `7${digits.slice(1)}`
        : digits.length === 10
          ? `7${digits}`
          : digits;
    if (!/^7\d{10}$/.test(phone))
      throw new BadRequestException('login is invalid');
    return { type: 'phone' as const, value: phone };
  }

  private parseMode(mode: unknown): 'login' | 'register' {
    if (mode !== 'login' && mode !== 'register')
      throw new BadRequestException('Invalid OTP mode');
    return mode;
  }

  private mapDeliveryError(error: unknown, phone?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof SmsRuError) {
      this.logger.error(
        JSON.stringify({
          event: 'otp.sms.failed',
          provider: 'sms_ru',
          phoneMasked: phone ? this.maskPhone(phone) : undefined,
          category: error.category,
          providerStatusCode: error.providerStatusCode,
        }),
      );
      if (error.category === 'RATE_LIMITED')
        throw this.tooManyRequests('SMS sending limit reached');
      if (
        error.category === 'INVALID_RECIPIENT' ||
        error.category === 'MESSAGE_REJECTED'
      ) {
        throw new BadRequestException('Unable to send code to this phone');
      }
    }
    throw new ServiceUnavailableException(
      'Code delivery is temporarily unavailable',
    );
  }

  private hash(value: string) {
    return createHmac(
      'sha256',
      this.config.getOrThrow<string>('OTP_HASH_SECRET'),
    )
      .update(value)
      .digest('hex');
  }

  private safeEqual(left: string, right: string) {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private tooManyRequests(message: string) {
    return new HttpException(message, 429);
  }

  private maskPhone(phone: string) {
    return `+${phone.slice(0, 1)}******${phone.slice(-4)}`;
  }

  private authResponse(user: {
    id: string;
    email: string | null;
    role: UserRole;
  }) {
    return {
      user,
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        email: user.email ?? '',
        role: user.role,
      }),
    };
  }

  private required(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(`${field} is required`);
    return value.trim();
  }

  private optional(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }
}

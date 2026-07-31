import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType, type UserRole } from '@prisma/client';

import { AuthEmailSenderService } from '../../email/auth-email-sender.service';
import { UsersService } from '../../users/users.service';
import { AuthCapabilitiesService } from '../capabilities/auth-capabilities.service';
import { AuthMethod, AuthOperation } from '../capabilities/auth-method.enum';
import { PasswordHasherService } from '../password/password-hasher.service';
import { assertPasswordPolicy } from '../password/password-policy';
import { TokenService } from '../token.service';
import { AuthTokenService } from '../tokens/auth-token.service';

import type { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';
import type { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import type { LoginEmailDto } from './dto/login-email.dto';
import type { RegisterEmailDto } from './dto/register-email.dto';
import type { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import type { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { normalizeEmail } from './normalize-email';

const GENERIC_RESET_MESSAGE = {
  message: 'If an account with this email exists, a reset link has been sent',
};

const GENERIC_VERIFICATION_MESSAGE = {
  message: 'If an account with this email exists, a verification link has been sent',
};

@Injectable()
export class EmailAuthService {
  private readonly logger = new Logger(EmailAuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly authTokenService: AuthTokenService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly authEmailSender: AuthEmailSenderService,
    private readonly authCapabilities: AuthCapabilitiesService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterEmailDto) {
    this.authCapabilities.assertEnabled(
      AuthMethod.EMAIL,
      AuthOperation.REGISTRATION,
    );

    const email = normalizeEmail(dto.email);
    assertPasswordPolicy(dto.password);

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = await this.usersService.createRegisteredUser({
      email,
      passwordHash,
      nickname: dto.nickname,
      inviterReferralCode: dto.inviterReferralCode,
    });

    await this.sendVerificationEmail(user.id, email);

    return this.authResponse(user);
  }

  async login(dto: LoginEmailDto) {
    this.authCapabilities.assertEnabled(AuthMethod.EMAIL, AuthOperation.LOGIN);

    const email = normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (!user?.passwordHash) {
      // Run a hash comparison against a dummy value to reduce timing signal
      // between "user not found" and "wrong password".
      await this.passwordHasher.verify(
        '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        dto.password,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await this.passwordHasher.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.authResponse(this.usersService.mapPublicUser(user));
  }

  async requestEmailVerification(dto: RequestEmailVerificationDto) {
    const email = normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (user && !user.emailVerifiedAt) {
      await this.sendVerificationEmail(user.id, email);
    }

    return GENERIC_VERIFICATION_MESSAGE;
  }

  async confirmEmailVerification(dto: ConfirmEmailVerificationDto) {
    const consumed = await this.authTokenService.consumeToken(
      dto.token,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    if (!consumed) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersService.markEmailVerified(consumed.userId);

    return { message: 'Email verified' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = normalizeEmail(dto.email);
    const user = await this.usersService.findByEmail(email);

    if (user) {
      try {
        const rawToken = await this.authTokenService.issueToken({
          userId: user.id,
          type: AuthTokenType.PASSWORD_RESET,
          ttlSeconds: this.config.getOrThrow<number>(
            'PASSWORD_RESET_TOKEN_TTL_SECONDS',
          ),
          cooldownSeconds: this.config.getOrThrow<number>(
            'PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS',
          ),
          maxPerHour: this.config.getOrThrow<number>(
            'PASSWORD_RESET_MAX_REQUESTS_PER_EMAIL_PER_HOUR',
          ),
        });

        const resetUrl = this.buildFrontendUrl('/reset-password', rawToken);
        await this.authEmailSender.sendPasswordReset(email, resetUrl);
      } catch (error) {
        // Swallow rate-limit/delivery errors to avoid leaking account existence
        // or exhausting the outbound email quota via error probing.
        this.logger.warn(
          `Password reset request suppressed for ${email}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }

    return GENERIC_RESET_MESSAGE;
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    assertPasswordPolicy(dto.newPassword);

    const consumed = await this.authTokenService.consumeToken(
      dto.token,
      AuthTokenType.PASSWORD_RESET,
    );

    if (!consumed) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    await this.usersService.updatePasswordHash(consumed.userId, passwordHash);
    await this.authTokenService.invalidateAllForUser(
      consumed.userId,
      AuthTokenType.PASSWORD_RESET,
    );

    const user = await this.usersService.findById(consumed.userId);
    if (user?.email) {
      await this.authEmailSender.sendPasswordChanged(user.email);
    }

    return { message: 'Password updated' };
  }

  private async sendVerificationEmail(userId: string, email: string) {
    try {
      const rawToken = await this.authTokenService.issueToken({
        userId,
        type: AuthTokenType.EMAIL_VERIFICATION,
        ttlSeconds: this.config.getOrThrow<number>(
          'EMAIL_VERIFICATION_TOKEN_TTL_SECONDS',
        ),
        cooldownSeconds: this.config.getOrThrow<number>(
          'EMAIL_VERIFICATION_REQUEST_COOLDOWN_SECONDS',
        ),
        maxPerHour: this.config.getOrThrow<number>(
          'EMAIL_VERIFICATION_MAX_REQUESTS_PER_EMAIL_PER_HOUR',
        ),
      });

      const verificationUrl = this.buildFrontendUrl(
        '/verify-email',
        rawToken,
      );
      await this.authEmailSender.sendEmailVerification(email, verificationUrl);
    } catch (error) {
      this.logger.warn(
        `Verification email suppressed for ${email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private buildFrontendUrl(path: string, token: string) {
    const webAppUrl = this.config.getOrThrow<string>('WEB_APP_URL');
    const url = new URL(path, webAppUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }

  private authResponse(user: {
    id: string;
    email?: string;
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
}

import { AuthTokenType } from '@prisma/client';
import type { ConfigService } from '@nestjs/config';

import type { AuthEmailSenderService } from '../../email/auth-email-sender.service';
import type { UsersService } from '../../users/users.service';
import type { AuthCapabilitiesService } from '../capabilities/auth-capabilities.service';
import { AuthMethod, AuthOperation } from '../capabilities/auth-method.enum';
import type { PasswordHasherService } from '../password/password-hasher.service';
import type { TokenService } from '../token.service';
import type { AuthTokenService } from '../tokens/auth-token.service';

import { EmailAuthService } from './email-auth.service';

function buildConfig() {
  const values: Record<string, unknown> = {
    WEB_APP_URL: 'https://dna.example.com',
    EMAIL_VERIFICATION_TOKEN_TTL_SECONDS: 86400,
    EMAIL_VERIFICATION_REQUEST_COOLDOWN_SECONDS: 60,
    EMAIL_VERIFICATION_MAX_REQUESTS_PER_EMAIL_PER_HOUR: 5,
    PASSWORD_RESET_TOKEN_TTL_SECONDS: 1800,
    PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS: 60,
    PASSWORD_RESET_MAX_REQUESTS_PER_EMAIL_PER_HOUR: 5,
  };

  return {
    getOrThrow: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe('EmailAuthService', () => {
  const findByEmail = jest.fn();
  const findById = jest.fn();
  const createRegisteredUser = jest.fn();
  const markEmailVerified = jest.fn();
  const updatePasswordHash = jest.fn();
  const mapPublicUser = jest.fn((user) => user);

  const usersService = {
    findByEmail,
    findById,
    createRegisteredUser,
    markEmailVerified,
    updatePasswordHash,
    mapPublicUser,
  } as unknown as UsersService;

  const signAccessToken = jest.fn(() => 'signed-token');
  const tokenService = { signAccessToken } as unknown as TokenService;

  const issueToken = jest.fn();
  const consumeToken = jest.fn();
  const invalidateAllForUser = jest.fn();
  const authTokenService = {
    issueToken,
    consumeToken,
    invalidateAllForUser,
  } as unknown as AuthTokenService;

  const hash = jest.fn((value: string) => Promise.resolve(`hashed:${value}`));
  const verify = jest.fn();
  const passwordHasher = { hash, verify } as unknown as PasswordHasherService;

  const sendEmailVerification = jest.fn();
  const sendPasswordReset = jest.fn();
  const sendPasswordChanged = jest.fn();
  const authEmailSender = {
    sendEmailVerification,
    sendPasswordReset,
    sendPasswordChanged,
  } as unknown as AuthEmailSenderService;

  const assertEnabled = jest.fn();
  const authCapabilities = {
    assertEnabled,
  } as unknown as AuthCapabilitiesService;

  const service = new EmailAuthService(
    usersService,
    tokenService,
    authTokenService,
    passwordHasher,
    authEmailSender,
    authCapabilities,
    buildConfig(),
  );

  beforeEach(() => {
    jest.resetAllMocks();
    hash.mockImplementation((value: string) =>
      Promise.resolve(`hashed:${value}`),
    );
    mapPublicUser.mockImplementation((user) => user);
    issueToken.mockResolvedValue('raw-token');
    signAccessToken.mockReturnValue('signed-token');
  });

  describe('register', () => {
    it('rejects when email registration is disabled', async () => {
      assertEnabled.mockImplementation(() => {
        throw new Error('disabled');
      });

      await expect(
        service.register({
          email: 'a@example.com',
          password: 'password123',
          nickname: 'A',
        }),
      ).rejects.toThrow('disabled');
    });

    it('rejects duplicate emails', async () => {
      findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'A@Example.com',
          password: 'password123',
          nickname: 'A',
        }),
      ).rejects.toThrow('already exists');

      expect(findByEmail).toHaveBeenCalledWith('a@example.com');
    });

    it('creates the user, hashes the password, and sends a verification email', async () => {
      findByEmail.mockResolvedValue(null);
      createRegisteredUser.mockResolvedValue({
        id: 'user-1',
        email: 'a@example.com',
        role: 'DEFAULT',
      });

      const result = await service.register({
        email: 'A@Example.com',
        password: 'password123',
        nickname: 'A',
      });

      expect(assertEnabled).toHaveBeenCalledWith(
        AuthMethod.EMAIL_PASSWORD,
        AuthOperation.REGISTRATION,
      );
      expect(createRegisteredUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@example.com',
          passwordHash: 'hashed:password123',
        }),
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(
        'a@example.com',
        expect.stringContaining('/verify-email?token=raw-token'),
      );
      expect(result.accessToken).toBe('signed-token');
    });

    it('rejects passwords that violate the password policy', async () => {
      findByEmail.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'a@example.com',
          password: 'short',
          nickname: 'A',
        }),
      ).rejects.toThrow(/at least/);
    });
  });

  describe('login', () => {
    it('rejects unknown emails without revealing existence', async () => {
      findByEmail.mockResolvedValue(null);
      verify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'missing@example.com', password: 'whatever' }),
      ).rejects.toThrow('Invalid email or password');
      expect(verify).toHaveBeenCalled();
    });

    it('rejects users without a password hash (OTP/OAuth-only accounts)', async () => {
      findByEmail.mockResolvedValue({ id: 'user-1', passwordHash: null });

      await expect(
        service.login({ email: 'a@example.com', password: 'whatever' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('rejects an incorrect password', async () => {
      findByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        email: 'a@example.com',
        role: 'DEFAULT',
      });
      verify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('logs in with a correct password', async () => {
      findByEmail.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hash',
        email: 'a@example.com',
        role: 'DEFAULT',
      });
      verify.mockResolvedValue(true);

      const result = await service.login({
        email: 'a@example.com',
        password: 'correct',
      });

      expect(result.accessToken).toBe('signed-token');
    });
  });

  describe('requestPasswordReset', () => {
    it('always returns a generic message, even for unknown emails', async () => {
      findByEmail.mockResolvedValue(null);

      const result = await service.requestPasswordReset({
        email: 'missing@example.com',
      });

      expect(result.message).toMatch(/if an account/i);
      expect(sendPasswordReset).not.toHaveBeenCalled();
    });

    it('issues a token and sends a reset email for known users', async () => {
      findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@example.com' });

      await service.requestPasswordReset({ email: 'a@example.com' });

      expect(issueToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: AuthTokenType.PASSWORD_RESET,
        }),
      );
      expect(sendPasswordReset).toHaveBeenCalledWith(
        'a@example.com',
        expect.stringContaining('/reset-password?token=raw-token'),
      );
    });

    it('suppresses rate-limit errors instead of leaking them to the caller', async () => {
      findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@example.com' });
      issueToken.mockRejectedValue(new Error('rate limited'));

      const result = await service.requestPasswordReset({
        email: 'a@example.com',
      });

      expect(result.message).toMatch(/if an account/i);
    });
  });

  describe('confirmPasswordReset', () => {
    it('rejects an invalid or expired token', async () => {
      consumeToken.mockResolvedValue(undefined);

      await expect(
        service.confirmPasswordReset({
          token: 'bad-token',
          newPassword: 'newpassword1',
        }),
      ).rejects.toThrow(/invalid or expired/i);
    });

    it('updates the password and invalidates other reset tokens', async () => {
      consumeToken.mockResolvedValue({ userId: 'user-1' });
      findById.mockResolvedValue({ id: 'user-1', email: 'a@example.com' });

      await service.confirmPasswordReset({
        token: 'good-token',
        newPassword: 'newpassword1',
      });

      expect(updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'hashed:newpassword1',
      );
      expect(invalidateAllForUser).toHaveBeenCalledWith(
        'user-1',
        AuthTokenType.PASSWORD_RESET,
      );
      expect(sendPasswordChanged).toHaveBeenCalledWith('a@example.com');
    });
  });

  describe('confirmEmailVerification', () => {
    it('rejects an invalid or expired token', async () => {
      consumeToken.mockResolvedValue(undefined);

      await expect(
        service.confirmEmailVerification({ token: 'bad-token' }),
      ).rejects.toThrow(/invalid or expired/i);
    });

    it('marks the email verified for a valid token', async () => {
      consumeToken.mockResolvedValue({ userId: 'user-1' });

      await service.confirmEmailVerification({ token: 'good-token' });

      expect(markEmailVerified).toHaveBeenCalledWith('user-1');
    });
  });
});

import { AuthTokenType } from '@prisma/client';
import type { ConfigService } from '@nestjs/config';

import type { PrismaService } from '../../prisma/prisma.service';

import { AuthTokenService } from './auth-token.service';

function buildConfig() {
  return {
    getOrThrow: (key: string) =>
      key === 'JWT_SECRET' ? 'test-secret' : undefined,
  } as unknown as ConfigService;
}

describe('AuthTokenService', () => {
  const findFirst = jest.fn();
  const count = jest.fn();
  const updateMany = jest.fn();
  const create = jest.fn();
  const findUnique = jest.fn();

  const tx = {
    authToken: { findFirst, count, updateMany, create, findUnique },
    $executeRaw: jest.fn(),
  };

  const prismaService = {
    $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
      callback(tx),
    ),
  } as unknown as PrismaService;

  const service = new AuthTokenService(prismaService, buildConfig());

  beforeEach(() => {
    jest.clearAllMocks();
    findFirst.mockResolvedValue(null);
    count.mockResolvedValue(0);
    updateMany.mockResolvedValue({ count: 1 });
    create.mockResolvedValue({});
  });

  describe('issueToken', () => {
    const params = {
      userId: 'user-1',
      type: AuthTokenType.EMAIL_VERIFICATION,
      ttlSeconds: 3600,
      cooldownSeconds: 60,
      maxPerHour: 5,
    };

    it('issues a token and invalidates previous unconsumed tokens', async () => {
      const token = await service.issueToken(params);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
      expect(updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: params.type, consumedAt: null },
        data: { consumedAt: expect.any(Date) },
      });
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: params.type,
          }),
        }),
      );
    });

    it('rejects when within the cooldown window', async () => {
      findFirst.mockResolvedValue({ createdAt: new Date() });

      await expect(service.issueToken(params)).rejects.toMatchObject({
        status: 429,
      });
    });

    it('rejects when hourly limit reached', async () => {
      count.mockResolvedValue(5);

      await expect(service.issueToken(params)).rejects.toMatchObject({
        status: 429,
      });
    });
  });

  describe('consumeToken', () => {
    it('returns undefined for an empty token', async () => {
      await expect(
        service.consumeToken('', AuthTokenType.PASSWORD_RESET),
      ).resolves.toBeUndefined();
    });

    it('returns undefined when the token does not exist', async () => {
      findUnique.mockResolvedValue(null);

      await expect(
        service.consumeToken('raw-token', AuthTokenType.PASSWORD_RESET),
      ).resolves.toBeUndefined();
    });

    it('returns undefined for a wrong-type, consumed, or expired token', async () => {
      findUnique.mockResolvedValue({
        id: 'token-1',
        type: AuthTokenType.EMAIL_VERIFICATION,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        userId: 'user-1',
      });

      await expect(
        service.consumeToken('raw-token', AuthTokenType.PASSWORD_RESET),
      ).resolves.toBeUndefined();
    });

    it('consumes a valid single-use token exactly once', async () => {
      findUnique.mockResolvedValue({
        id: 'token-1',
        type: AuthTokenType.PASSWORD_RESET,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        userId: 'user-1',
      });
      updateMany.mockResolvedValue({ count: 1 });

      const result = await service.consumeToken(
        'raw-token',
        AuthTokenType.PASSWORD_RESET,
      );

      expect(result).toEqual({ userId: 'user-1' });
      expect(updateMany).toHaveBeenCalledWith({
        where: { id: 'token-1', consumedAt: null },
        data: { consumedAt: expect.any(Date) },
      });
    });

    it('returns undefined if the token was already consumed concurrently', async () => {
      findUnique.mockResolvedValue({
        id: 'token-1',
        type: AuthTokenType.PASSWORD_RESET,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        userId: 'user-1',
      });
      updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.consumeToken('raw-token', AuthTokenType.PASSWORD_RESET),
      ).resolves.toBeUndefined();
    });
  });
});

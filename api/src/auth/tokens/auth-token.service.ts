import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType } from '@prisma/client';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service';

type IssueTokenParams = {
  userId: string;
  type: AuthTokenType;
  ttlSeconds: number;
  cooldownSeconds: number;
  maxPerHour: number;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async issueToken(params: IssueTokenParams): Promise<string> {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`auth-token:${params.type}:${params.userId}`}))`;

      const last = await tx.authToken.findFirst({
        where: { userId: params.userId, type: params.type },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (
        last &&
        last.createdAt.getTime() >
          now.getTime() - params.cooldownSeconds * 1000
      ) {
        throw new HttpException(
          'Please wait before requesting another email',
          429,
        );
      }

      const since = new Date(now.getTime() - 60 * 60 * 1000);
      const countLastHour = await tx.authToken.count({
        where: {
          userId: params.userId,
          type: params.type,
          createdAt: { gte: since },
        },
      });

      if (countLastHour >= params.maxPerHour) {
        throw new HttpException('Request limit exceeded', 429);
      }

      await tx.authToken.updateMany({
        where: {
          userId: params.userId,
          type: params.type,
          consumedAt: null,
        },
        data: { consumedAt: now },
      });

      const rawToken = randomBytes(32).toString('base64url');

      await tx.authToken.create({
        data: {
          userId: params.userId,
          type: params.type,
          tokenHash: this.hash(rawToken),
          expiresAt: new Date(now.getTime() + params.ttlSeconds * 1000),
        },
      });

      return rawToken;
    });
  }

  async consumeToken(
    rawToken: string,
    type: AuthTokenType,
  ): Promise<{ userId: string } | undefined> {
    if (!rawToken) {
      return undefined;
    }

    const tokenHash = this.hash(rawToken);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.authToken.findUnique({
        where: { tokenHash },
      });

      if (
        !record ||
        record.type !== type ||
        record.consumedAt ||
        record.expiresAt.getTime() <= now.getTime()
      ) {
        return undefined;
      }

      const consumed = await tx.authToken.updateMany({
        where: { id: record.id, consumedAt: null },
        data: { consumedAt: now },
      });

      if (consumed.count !== 1) {
        return undefined;
      }

      return { userId: record.userId };
    });
  }

  async invalidateAllForUser(userId: string, type: AuthTokenType) {
    await this.prisma.authToken.updateMany({
      where: { userId, type, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  private hash(value: string): string {
    return createHmac(
      'sha256',
      this.config.getOrThrow<string>('JWT_SECRET'),
    )
      .update(value)
      .digest('hex');
  }

  safeEqual(left: string, right: string): boolean {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type DependencyStatus = {
  status: 'up' | 'down';
  error?: string;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prismaService: PrismaService) {}

  live() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    const database = await this.checkDatabase();
    const isReady = database.status === 'up';

    return {
      status: isReady ? 'ok' : 'error',
      checks: {
        database,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return { status: 'up' };
    } catch (error) {
      this.logger.error('Database readiness check failed', error as Error);
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'unknown error',
      };
    }
  }
}

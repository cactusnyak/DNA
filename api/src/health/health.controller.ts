import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Overall liveness probe' })
  health() {
    return this.healthService.live();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (process is running)' })
  live() {
    return this.healthService.live();
  }

  @Get('ready')
  @ApiOperation({
    summary:
      'Readiness probe (checks critical dependencies such as PostgreSQL)',
  })
  @ApiServiceUnavailableResponse({
    description: 'A critical dependency is unavailable.',
  })
  async ready() {
    const result = await this.healthService.ready();

    if (result.status !== 'ok') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}

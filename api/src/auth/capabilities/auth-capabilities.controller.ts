import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthCapabilitiesService } from './auth-capabilities.service';

@ApiTags('Auth / Config')
@Controller('auth')
export class AuthCapabilitiesController {
  constructor(private readonly capabilities: AuthCapabilitiesService) {}

  @Get('config')
  getConfig() {
    return this.capabilities.getPublicConfig();
  }
}

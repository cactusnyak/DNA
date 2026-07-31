import { Module } from '@nestjs/common';

import { AuthCapabilitiesController } from './auth-capabilities.controller';
import { AuthCapabilitiesService } from './auth-capabilities.service';

@Module({
  controllers: [AuthCapabilitiesController],
  providers: [AuthCapabilitiesService],
  exports: [AuthCapabilitiesService],
})
export class AuthCapabilitiesModule {}

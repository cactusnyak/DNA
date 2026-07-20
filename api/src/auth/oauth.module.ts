import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { TokenModule } from './token.module';

@Module({
  imports: [UsersModule, TokenModule],
  controllers: [OAuthController],
  providers: [OAuthService],
})
export class OAuthModule {}

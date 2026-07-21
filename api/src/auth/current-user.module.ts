import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CurrentUserController } from './current-user.controller';
import { TokenModule } from './token.module';

@Module({
  imports: [UsersModule, TokenModule],
  controllers: [AuthController, CurrentUserController],
  providers: [AuthService],
  exports: [AuthService],
})
export class CurrentUserModule {}

import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
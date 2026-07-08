import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}

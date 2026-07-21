import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';

import type { AddFavouriteDto, RemoveFavouriteDto } from './dto/favourite.dto';
import { FavouritesService } from './favourites.service';

@ApiTags('Favourites')
@Controller('favourites')
export class FavouritesController {
  constructor(
    private readonly favouritesService: FavouritesService,
    private readonly authService: AuthService,
  ) {}

  private async requireUser(authorizationHeader?: string) {
    const user = await this.authService.getOptionalMeFromAuthorizationHeader(
      authorizationHeader,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @Get()
  async getFavourites(
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.requireUser(authorizationHeader);
    return this.favouritesService.getFavourites(user.id);
  }

  @Post()
  async addFavourite(
    @Body() body: AddFavouriteDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.requireUser(authorizationHeader);
    return this.favouritesService.addFavourite({
      userId: user.id,
      productId: body.productId,
      adId: body.adId,
    });
  }

  @Post('sync')
  async syncFavourites(
    @Body() body: { items: AddFavouriteDto[] },
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.requireUser(authorizationHeader);
    const results = await Promise.allSettled(
      body.items.map((item) =>
        this.favouritesService.addFavourite({
          userId: user.id,
          productId: item.productId,
          adId: item.adId,
        }),
      ),
    );

    const synced = results.filter((r) => r.status === 'fulfilled').length;
    return { synced };
  }

  @Delete()
  async removeFavourite(
    @Body() body: RemoveFavouriteDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.requireUser(authorizationHeader);
    await this.favouritesService.removeFavourite({
      userId: user.id,
      productId: body.productId,
      adId: body.adId,
    });

    return { success: true };
  }
}

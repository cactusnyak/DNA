import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OversizedDeliveryQuoteStatus, UserRole } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DeliveryQuotesService } from './delivery-quotes.service';

@Controller('delivery-quotes')
export class DeliveryQuotesController {
  constructor(
    private readonly service: DeliveryQuotesService,
    private readonly auth: AuthService,
  ) {}
  private async owner(authorization?: string, guestSessionId?: string) {
    const user: unknown =
      await this.auth.getOptionalMeFromAuthorizationHeader(authorization);
    const userId =
      user &&
      typeof user === 'object' &&
      'id' in user &&
      typeof user.id === 'string'
        ? user.id
        : undefined;
    return { userId, guestSessionId };
  }
  @Post() create(
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.owner(
      authorization,
      typeof body.guestSessionId === 'string' ? body.guestSessionId : undefined,
    ).then((owner) => this.service.create(body, owner));
  }
  @Get(':id') find(
    @Param('id') id: string,
    @Query('guestSessionId') guestSessionId?: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.owner(authorization, guestSessionId).then((owner) =>
      this.service.findOwned(id, owner),
    );
  }
  @Post(':id/accept') accept(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.owner(
      authorization,
      typeof body.guestSessionId === 'string' ? body.guestSessionId : undefined,
    ).then((owner) => this.service.accept(id, owner));
  }
  @Post(':id/cancel') cancel(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.owner(
      authorization,
      typeof body.guestSessionId === 'string' ? body.guestSessionId : undefined,
    ).then((owner) => this.service.cancel(id, owner));
  }
}

@Controller('admin/delivery-quotes')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDeliveryQuotesController {
  constructor(private readonly service: DeliveryQuotesService) {}
  @Get() list(@Query('status') status?: OversizedDeliveryQuoteStatus) {
    return this.service.listAdmin(status);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.updateAdmin(id, body);
  }
}

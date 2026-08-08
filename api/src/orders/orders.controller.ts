import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../auth/auth.service';

import type { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user =
      await this.authService.getOptionalMeFromAuthorizationHeader(
        authorizationHeader,
      );

    return this.ordersService.create(createOrderDto, user?.id);
  }

  @Get('my')
  async findMyOrders(@Headers('authorization') authorizationHeader?: string) {
    const user =
      await this.authService.getMeFromAuthorizationHeader(authorizationHeader);

    return this.ordersService.findMyOrders(user.id);
  }

  @Get(':orderId')
  async findById(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorizationHeader?: string,
    @Headers('x-guest-session-id') guestSessionId?: string,
  ) {
    const user =
      await this.authService.getOptionalMeFromAuthorizationHeader(
        authorizationHeader,
      );
    const order = await this.ordersService.findById(orderId);
    const ownsUserOrder = Boolean(user && order.userId === user.id);
    const ownsGuestOrder = Boolean(
      !order.userId &&
      order.guestSessionId &&
      guestSessionId &&
      order.guestSessionId === guestSessionId,
    );
    if (!ownsUserOrder && !ownsGuestOrder) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }
}

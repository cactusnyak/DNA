import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import type { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':orderId')
  findById(@Param('orderId') orderId: string) {
    return this.ordersService.findById(orderId);
  }
}
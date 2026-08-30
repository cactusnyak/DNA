import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminLogisticsService } from './admin-logistics.service';

@ApiTags('Admin / Logistics')
@ApiBearerAuth()
@Controller('admin/logistics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLogisticsController {
  constructor(private readonly service: AdminLogisticsService) {}

  @Get('configuration')
  configuration() {
    return this.service.getConfiguration();
  }

  @Get('warehouses')
  warehouses() {
    return this.service.listWarehouses();
  }

  @Post('warehouses')
  createWarehouse(@Body() body: unknown) {
    return this.service.createWarehouse(body);
  }

  @Patch('warehouses/:id')
  updateWarehouse(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updateWarehouse(id, body);
  }

  @Delete('warehouses/:id')
  deleteWarehouse(@Param('id') id: string) {
    return this.service.deleteWarehouse(id);
  }

  @Get('providers')
  providers() {
    return this.service.listProviders();
  }

  @Patch('providers/:id')
  updateProvider(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updateProvider(id, body);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() body: unknown) {
    return this.service.updateService(id, body);
  }

  @Get('quotes')
  quotes(@Query() query: Record<string, string | undefined>) {
    return this.service.listQuotes(query);
  }

  @Get('quotes/:id')
  quote(@Param('id') id: string) {
    return this.service.getQuote(id);
  }

  @Get('shipments')
  shipments(@Query() query: Record<string, string | undefined>) {
    return this.service.listShipments(query);
  }

  @Get('shipments/:id')
  shipment(@Param('id') id: string) {
    return this.service.getShipment(id);
  }

  @Patch('shipments/:id/status')
  updateShipmentStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() request: Request & { user?: { id: string } },
  ) {
    return this.service.updateShipmentStatus(id, body, request.user?.id);
  }
}

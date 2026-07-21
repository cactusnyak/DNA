import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminOrdersService } from './admin-orders.service';
import { HardDeleteOrderDto } from './dto/hard-delete-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';

type RequestWithUser = Request & {
  user?: { id: string; role: UserRole };
};

@ApiTags('Admin / Orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'List orders with pagination and archived filter',
  })
  listOrders(@Query() query: ListOrdersQueryDto) {
    return this.adminOrdersService.listOrders(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(@Param('id') id: string, @Body() body: unknown) {
    return this.adminOrdersService.updateOrderStatus(id, body);
  }

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archive an order (primary way to remove from active lists)',
  })
  archiveOrder(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.adminOrdersService.archiveOrder(id, request.user?.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore an archived order' })
  restoreOrder(@Param('id') id: string) {
    return this.adminOrdersService.restoreOrder(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deprecated: archives the order instead of hard deleting it',
    deprecated: true,
  })
  deprecatedDeleteOrder(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.adminOrdersService.archiveOrder(id, request.user?.id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.OWNER, UserRole.ULTRA_ADMIN)
  @ApiOperation({
    summary:
      'Exceptional owner-only permanent hard delete of an order. Requires OWNER/ULTRA_ADMIN, confirmation phrase and (in production) HARD_DELETE_ORDERS_ENABLED.',
  })
  @ApiForbiddenResponse({
    description: 'Caller is not OWNER/ULTRA_ADMIN or the feature is disabled.',
  })
  @ApiConflictResponse({
    description: 'Order has dependencies that block a safe cascade delete.',
  })
  hardDeleteOrder(
    @Param('id') id: string,
    @Body() body: HardDeleteOrderDto,
    @Req() request: RequestWithUser,
  ) {
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? undefined;

    return this.adminOrdersService.hardDeleteOrder(id, {
      actorUserId: request.user?.id,
      actorRole: request.user?.role,
      reason: body.reason,
      confirmation: body.confirmation,
      requestId,
    });
  }
}

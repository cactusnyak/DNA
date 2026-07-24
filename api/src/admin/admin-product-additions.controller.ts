import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PRODUCT_ADDITION_TYPES } from '../products/product-additions';

@ApiTags('Admin / Market / Product additions')
@ApiBearerAuth()
@Controller('admin/market/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductAdditionsController {
  @Get('addition-types')
  @ApiOperation({ summary: 'List supported product addition types' })
  getAdditionTypes() {
    return PRODUCT_ADDITION_TYPES;
  }
}

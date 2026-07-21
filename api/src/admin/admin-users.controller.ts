import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminUsersService } from './admin-users.service';

@ApiTags('Admin / Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk soft-delete users' })
  bulkDeleteUsers(@Body() body: unknown) {
    return this.adminUsersService.bulkDeleteUsers(body);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk hard-delete users' })
  bulkHardDeleteUsers(@Body() body: unknown) {
    return this.adminUsersService.bulkHardDeleteUsers(body);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update a user role' })
  updateUserRole(@Param('id') id: string, @Body() body: unknown) {
    return this.adminUsersService.updateUserRole(id, body);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard-delete a user' })
  hardDeleteUser(@Param('id') id: string) {
    return this.adminUsersService.hardDeleteUser(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a user' })
  deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }
}

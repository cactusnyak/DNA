import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import {
  AdminUploadsService,
  type AdminUploadedImageFile,
} from './admin-uploads.service';

@ApiTags('Admin / Uploads')
@ApiBearerAuth()
@Controller('admin/uploads')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUploadsController {
  constructor(private readonly adminUploadsService: AdminUploadsService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload an image for admin resources' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadImage(@UploadedFile() file?: AdminUploadedImageFile) {
    return this.adminUploadsService.uploadImage(file);
  }
}

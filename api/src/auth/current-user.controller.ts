import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Headers,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from '../users/users.service';
import type { UpdateProfileDto } from '../users/dto/update-profile.dto';

import { AuthService } from './auth.service';

@ApiTags('Current User')
@Controller('users')
export class CurrentUserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Patch('me')
  async updateMe(
    @Body() updateProfileDto: UpdateProfileDto,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    return this.usersService.updateCurrentUser(user.id, updateProfileDto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /image\/(jpeg|jpg|png|webp|gif|avif|heic|heif|bmp)/,
          }),
        ],
      }),
    )
    file: { originalname: string; mimetype: string; size: number; buffer?: Buffer },
    @Headers('authorization') authorizationHeader?: string,
  ) {
    await this.authService.getMeFromAuthorizationHeader(authorizationHeader);

    return this.usersService.uploadAvatar(file);
  }

  @Delete('me')
  @HttpCode(204)
  async deleteMe(@Headers('authorization') authorizationHeader?: string) {
    const user = await this.authService.getMeFromAuthorizationHeader(
      authorizationHeader,
    );

    await this.usersService.softDeleteById(user.id);
  }
}
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { FILE_STORAGE, type FileStorage } from '../storage/file-storage';

export type AdminUploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024;

const IMAGE_MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

@Injectable()
export class AdminUploadsService {
  constructor(@Inject(FILE_STORAGE) private readonly fileStorage: FileStorage) {}

  async uploadImage(file?: AdminUploadedImageFile) {
    if (!file?.buffer) {
      throw new BadRequestException('Image file is required');
    }

    const extension = IMAGE_MIME_EXTENSION[file.mimetype];

    if (!extension) {
      throw new BadRequestException('Unsupported image file type');
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      throw new BadRequestException('Image file is too large');
    }

    const fileName = `${randomUUID()}${extension}`;
    const storedFile = await this.fileStorage.upload({
      key: `images/${fileName}`,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return {
      url: storedFile.url,
      fileName,
    };
  }
}

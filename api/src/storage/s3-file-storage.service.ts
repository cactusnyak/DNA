import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { FileStorage, FileUploadInput, StoredFile } from './file-storage';

@Injectable()
export class S3FileStorageService implements FileStorage {
  constructor(private readonly configService: ConfigService) {}

  async upload({ key, body, contentType }: FileUploadInput): Promise<StoredFile> {
    const normalizedKey = key.replace(/^\/+/, '');
    const bucket = this.configService.getOrThrow<string>('S3_BUCKET');
    const publicUrl = this.configService
      .getOrThrow<string>('S3_PUBLIC_URL')
      .replace(/\/$/, '');
    const client = new S3Client({
      region: this.configService.getOrThrow<string>('S3_REGION'),
      endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
      forcePathStyle: this.configService.get<boolean>('S3_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: normalizedKey,
        Body: body,
        ContentType: contentType,
      }),
    );

    return {
      key: normalizedKey,
      url: `${publicUrl}/${normalizedKey}`,
    };
  }
}

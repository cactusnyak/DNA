import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FILE_STORAGE } from './file-storage';
import { LocalFileStorageService } from './local-file-storage.service';
import { S3FileStorageService } from './s3-file-storage.service';

@Module({
  providers: [
    LocalFileStorageService,
    S3FileStorageService,
    {
      provide: FILE_STORAGE,
      inject: [ConfigService, LocalFileStorageService, S3FileStorageService],
      useFactory: (
        configService: ConfigService,
        localFileStorage: LocalFileStorageService,
        s3FileStorage: S3FileStorageService,
      ) =>
        configService.getOrThrow<string>('STORAGE_DRIVER') === 's3'
          ? s3FileStorage
          : localFileStorage,
    },
  ],
  exports: [FILE_STORAGE],
})
export class StorageModule {}

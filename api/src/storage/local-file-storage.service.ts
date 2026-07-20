import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { FileStorage, FileUploadInput, StoredFile } from './file-storage';

@Injectable()
export class LocalFileStorageService implements FileStorage {
  async upload({ key, body }: FileUploadInput): Promise<StoredFile> {
    const normalizedKey = key.replace(/^\/+/, '');
    const filePath = join(process.cwd(), 'uploads', normalizedKey);

    await mkdir(join(filePath, '..'), { recursive: true });
    await writeFile(filePath, body);

    return {
      key: normalizedKey,
      url: `/uploads/${normalizedKey}`,
    };
  }
}

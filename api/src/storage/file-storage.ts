export type FileUploadInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type StoredFile = {
  key: string;
  url: string;
};

export interface FileStorage {
  upload(input: FileUploadInput): Promise<StoredFile>;
}

export const FILE_STORAGE = Symbol('FILE_STORAGE');

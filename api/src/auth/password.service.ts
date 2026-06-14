import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');

    return `${HASH_ALGORITHM}:${salt}:${hash}`;
  }

  verifyPassword(password: string, passwordHash: string) {
    const [algorithm, salt, storedHash] = passwordHash.split(':');

    if (algorithm !== HASH_ALGORITHM || !salt || !storedHash) {
      return false;
    }

    const hash = scryptSync(password, salt, KEY_LENGTH);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    if (hash.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(hash, storedHashBuffer);
  }
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHasherService {
  constructor(private readonly config: ConfigService) {}

  async hash(plainPassword: string): Promise<string> {
    return argon2.hash(this.withPepper(plainPassword), {
      type: argon2.argon2id,
    });
  }

  async verify(hash: string, plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, this.withPepper(plainPassword));
    } catch {
      return false;
    }
  }

  private withPepper(plainPassword: string): string {
    const pepper = this.config.get<string>('PASSWORD_HASH_SECRET_PEPPER');
    return pepper ? `${plainPassword}:${pepper}` : plainPassword;
  }
}

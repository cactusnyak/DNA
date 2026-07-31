import { BadRequestException } from '@nestjs/common';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(rawEmail: string): string {
  const normalized = rawEmail.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    throw new BadRequestException('email is invalid');
  }

  return normalized;
}

import { BadRequestException } from '@nestjs/common';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function assertPasswordPolicy(password: string): void {
  if (typeof password !== 'string') {
    throw new BadRequestException('Password is required');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new BadRequestException(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new BadRequestException(
      `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`,
    );
  }
}

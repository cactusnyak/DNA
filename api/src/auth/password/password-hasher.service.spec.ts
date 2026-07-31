import type { ConfigService } from '@nestjs/config';

import { PasswordHasherService } from './password-hasher.service';

function buildConfig(pepper?: string) {
  return {
    get: () => pepper,
  } as unknown as ConfigService;
}

describe('PasswordHasherService', () => {
  it('hashes and verifies a matching password', async () => {
    const service = new PasswordHasherService(buildConfig());
    const hash = await service.hash('correct horse battery staple');

    await expect(
      service.verify(hash, 'correct horse battery staple'),
    ).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const service = new PasswordHasherService(buildConfig());
    const hash = await service.hash('correct horse battery staple');

    await expect(service.verify(hash, 'wrong password')).resolves.toBe(false);
  });

  it('returns false instead of throwing for a malformed hash', async () => {
    const service = new PasswordHasherService(buildConfig());

    await expect(service.verify('not-a-hash', 'anything')).resolves.toBe(
      false,
    );
  });

  it('produces different verification results when a pepper is configured', async () => {
    const withPepper = new PasswordHasherService(buildConfig('pepper-value'));
    const withoutPepper = new PasswordHasherService(buildConfig());

    const hash = await withPepper.hash('correct horse battery staple');

    await expect(
      withoutPepper.verify(hash, 'correct horse battery staple'),
    ).resolves.toBe(false);
  });
});

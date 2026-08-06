import {
  closeSeedDatabase,
  runCatalogSeed,
  type SeedProfile,
} from './catalog-seed.js';

export async function runSeedCli(profile: SeedProfile): Promise<void> {
  try {
    await runCatalogSeed({
      profile,
      imagesOnly: process.argv.includes('--images-only'),
      validateOnly: process.argv.includes('--validate-only'),
    });
  } catch (error) {
    console.error(`Ошибка seed-профиля ${profile}:`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await closeSeedDatabase();
  }
}

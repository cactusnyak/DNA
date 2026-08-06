# Database seeds

The catalog seed is one versioned source of truth shared by all environments.
Running a seed is an explicit maintenance operation; deploys do not run it.

```text
seeds/
├── shared/
│   ├── catalog-seed.ts       # catalog data, validation and safe synchronization
│   ├── run.ts                # common CLI wrapper
│   └── assets/products/      # canonical, Git-tracked source images
├── dev/seed.ts
├── staging/seed.ts
├── production/
│   ├── seed.ts
│   └── backups/              # historical material; never read at runtime
└── README.md
```

The three entry points deliberately use the same catalog. Environment differences
belong in their small entry-point configuration, not copied data. Runtime images
live in `<api>/uploads/images` and are served as `/uploads/images/<file>`. In
staging and production `/app/uploads` is a persistent Docker volume, so running
the seed inside the API container writes to the mounted volume rather than only
to the image layer. Paths are derived from the seed module, not the shell's cwd.

## Commands

From `api/`:

```bash
npm run seed:dev
npm run seed:staging
npm run seed:production
npm run seed:staging:images
npm run seed:validate
```

The `*:images` variants validate every referenced asset and synchronize only
physical files. They skip files with matching SHA-256 content, copy missing
files, and atomically replace differing files. `seed:validate` does not connect
to the database. `npx prisma db seed` intentionally selects the dev profile.

## Editing the catalog

Add or edit a typed product in `shared/catalog-seed.ts`. Keep `seedKey` stable:
it is part of the stable product slug and generated runtime image name. Put each
original image once in `shared/assets/products`, use a UUID filename, and list
images with contiguous, unique `sortOrder` values starting at `0`; order zero is
the stable main image. Supported extensions are `.jpg`, `.jpeg`, `.png`, and
`.webp`. To replace an image without changing its URL, replace the canonical
file while keeping its filename and product `seedKey`.

For bulk imports, generate product entries and copy assets into those same two
canonical locations, then run `npm run seed:validate` before review. Validation
rejects missing files, unsafe paths, unsupported extensions, duplicate source
ownership, duplicate/non-contiguous image order, and invalid product fields.

## Idempotency and ownership

Categories are matched by stable slug and products by their seed-key-derived
slug. Existing image rows and `ProductImage` relations are retained when their
URLs still belong to the product; metadata is updated in place and missing links
are upserted. Relations removed from a seeded product are deleted, and their
orphaned `Image` row is removed only if nothing else references it. No runtime
file is deleted. Re-running a seed therefore creates no duplicate seeded
categories, products, images, or relations and preserves stable IDs.

The seed may update only its catalog categories, products, additions, locations,
image metadata, product-image links, and canonical runtime image files. It must
never clear or update users, balances, referrals, carts, favourites, ads, orders,
or other user-owned records. It contains no truncate, reset, or global cleanup.

## Staging application and backup

On the VDS, from `/opt/dna-staging`, first inspect counts and create a database
backup outside the repository/runtime volume:

```bash
cd /opt/dna-staging
docker compose --project-name dna-staging --env-file .env.staging -f docker-compose.staging.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > /opt/dna-staging-backup-$(date +%Y%m%d-%H%M%S).dump
docker compose --project-name dna-staging --env-file .env.staging -f docker-compose.staging.yml exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\''SELECT (SELECT count(*) FROM "Product") products, (SELECT count(*) FROM "Category") categories, (SELECT count(*) FROM "Image") images, (SELECT count(*) FROM "ProductImage") product_images;'\'''
docker compose --project-name dna-staging --env-file .env.staging -f docker-compose.staging.yml exec -T api npm run seed:staging
```

Afterward repeat the count query, verify files and sample URLs, then run the seed
a second time and confirm counts remain unchanged:

```bash
docker compose --project-name dna-staging --env-file .env.staging -f docker-compose.staging.yml exec -T api sh -c 'find /app/uploads/images -type f | wc -l'
curl -I https://STAGING_HOST/uploads/images/IMAGE_NAME.jpg
docker compose --project-name dna-staging --env-file .env.staging -f docker-compose.staging.yml exec -T api npm run seed:staging
```

Use `npm run seed:staging:images` in the API container when only the volume is
missing files. Never use `prisma migrate reset`, truncate tables, or apply a
production profile/database without a fresh backup and explicit approval.

Database dumps, real `.env` files, runtime uploads, generated intermediates and
local volumes stay outside Git. Canonical seed code and `shared/assets` are
included in the Docker build and tracked normally; do not use `git add -f`.

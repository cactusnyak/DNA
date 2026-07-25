import "dotenv/config";

import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  unlink,
} from "node:fs/promises";
import { extname, join, resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";

type DraftImage = {
  localPath: string;
  sortOrder: number;
};

type DraftProduct = {
  externalId: string;
  sourceMessageIds?: string[];
  title: string | null;
  rawText: string;
  images: DraftImage[];
  warnings?: string[];
};

type DraftFile = {
  version: number;
  source: string;
  htmlFile: string;
  productsCount: number;
  products: DraftProduct[];
};

type PreparedImage = {
  sourcePath: string;
  fileName: string;
  destinationPath: string;
  publicUrl: string;
  sortOrder: number;
};

type ProductKind =
  | "chicken-coop"
  | "rabbit-hutch"
  | "universal-cage";

type ImportResult = {
  externalId: string;
  title: string;
  slug: string;
  price: number;
  categoryName: string;
  imagesCount: number;
  action: "created" | "updated";
};

type CategoryDefinition = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

const SOURCE_JSON =
  process.env.PRODUCTION_PRODUCTS_JSON ??
  "/Users/fedorshevchenko/Downloads/Telegram Lite/ChatExport_2026-07-25/products.draft.json";

const ROOT_CATEGORY: CategoryDefinition = {
  name: "Постройки и клетки для животных",
  slug: "postroyki-i-kletki-dlya-zhivotnyh",
  description:
    "Курятники, крольчатники и универсальные хозяйственные клетки.",
  sortOrder: 1,
};

const CATEGORY_DEFINITIONS: Record<ProductKind, CategoryDefinition> = {
  "chicken-coop": {
    name: "Курятники",
    slug: "kuryatniki",
    description:
      "Курятники различных размеров, конструкций и комплектаций.",
    sortOrder: 1,
  },
  "rabbit-hutch": {
    name: "Крольчатники",
    slug: "krolchatniki",
    description:
      "Крольчатники и деревянные клетки для содержания кроликов.",
    sortOrder: 2,
  },
  "universal-cage": {
    name: "Универсальные клетки",
    slug: "universalnye-kletki",
    description:
      "Универсальные клетки и комплексы для птиц и кроликов.",
    sortOrder: 3,
  },
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

const API_ROOT = process.cwd();
const UPLOADS_DIR = join(API_ROOT, "uploads", "images");

const CHICKEN_COOP_ADDITIONS: Prisma.InputJsonValue = [
  {
    id: "coop-sawdust-bag-10kg",
    type: "boolean",
    title: "Мешок опилок 10 кг",
    price: 1600,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-electricity",
    type: "boolean",
    title: "Электрика: патрон, лампа и выключатель",
    price: 3000,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-drinker-feeder",
    type: "boolean",
    title: "Поилка / кормушка",
    price: 2500,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-cleaning-tray-wood",
    type: "boolean",
    title: "Поддон для чистки, дерево",
    price: 2000,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-cleaning-tray-metal",
    type: "boolean",
    title: "Поддон для чистки, металл",
    price: 3500,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-length-plus-05m",
    type: "boolean",
    title: "Увеличить длину на 0,5 метра",
    price: 8000,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-paint-two-layers",
    type: "boolean",
    title: "Покраска в два слоя, любой цвет на выбор",
    price: 20000,
    required: false,
    defaultValue: false,
  },
  {
    id: "coop-installation-plates",
    type: "quantity",
    title: "Установочные плиты",
    price: 470,
    required: false,
    defaultValue: 0,
    min: 0,
    max: null,
    unitLabel: "шт.",
  },
];

const EMPTY_ADDITIONS: Prisma.InputJsonValue = [];

const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .split("")
      .map((character) => CYRILLIC_MAP[character] ?? character)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "product"
  );
}

function normalizeText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classifyProduct(product: DraftProduct): ProductKind {
  const value = `${product.title ?? ""}\n${product.rawText}`.toLowerCase();

  /*
   * Смешанный вариант проверяем первым.
   * Иначе слово "крольчатник" отправит его в обычные крольчатники.
   */
  if (
    /крольчатник\s*\/\s*клетка\s+для\s+кур/iu.test(value) ||
    (/крольчатник/iu.test(value) && /клетка\s+для\s+кур/iu.test(value))
  ) {
    return "universal-cage";
  }

  if (
    /крольчатник/iu.test(value) ||
    /клетк[аи]\s+для\s+кролик/iu.test(value) ||
    /кроликов/iu.test(value)
  ) {
    return "rabbit-hutch";
  }

  return "chicken-coop";
}

function getProductAdditions(kind: ProductKind): Prisma.InputJsonValue {
  return kind === "chicken-coop"
    ? CHICKEN_COOP_ADDITIONS
    : EMPTY_ADDITIONS;
}

function parseMoneyValue(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return null;
  }

  const amount = Number(digits);

  if (!Number.isSafeInteger(amount) || amount < 1000) {
    return null;
  }

  return amount;
}

function extractBasePrice(rawText: string): number {
  const text = normalizeText(rawText);

  const summerPatterns = [
    /(?:цена\s*:?\s*)?([\d][\d\s.]*)\s*(?:₽|руб(?:лей)?)?\s*(?:летний|летнего\s+варианта)/giu,
    /(?:летний|летнего\s+варианта)\s*(?:вариант)?\s*:?\s*([\d][\d\s.]*)/giu,
  ];

  for (const pattern of summerPatterns) {
    const match = pattern.exec(text);

    if (match?.[1]) {
      const amount = parseMoneyValue(match[1]);

      if (amount !== null) {
        return amount;
      }
    }
  }

  const explicitPrices: number[] = [];

  for (const match of text.matchAll(
    /(?:цена|стоимость(?:\s+данного\s+комплекса)?)\s*:?\s*([\d][\d\s.]*)/giu,
  )) {
    const amount = parseMoneyValue(match[1]);

    if (amount !== null) {
      explicitPrices.push(amount);
    }
  }

  if (explicitPrices.length > 0) {
    return Math.min(...explicitPrices);
  }

  const fallbackPrices: number[] = [];

  for (const line of text.split("\n")) {
    const normalizedLine = line.trim();

    if (
      !normalizedLine ||
      /размер|высот|ширин|длин|мм|mm|ячейк|утеплитель|осп|брус|профнастил/iu.test(
        normalizedLine,
      )
    ) {
      continue;
    }

    for (const match of normalizedLine.matchAll(
      /(?<!\d)(\d{1,3}(?:[.\s]\d{3})+|\d{4,7})(?!\d)/g,
    )) {
      const amount = parseMoneyValue(match[1]);

      if (amount !== null) {
        fallbackPrices.push(amount);
      }
    }
  }

  if (fallbackPrices.length > 0) {
    return Math.min(...fallbackPrices);
  }

  throw new Error("Не удалось определить базовую цену");
}

function getStableImageFileName(params: {
  externalId: string;
  localPath: string;
}): string {
  const extension = extname(params.localPath).toLowerCase() || ".jpg";

  const hash = createHash("sha256")
    .update(`${params.externalId}:${params.localPath}`)
    .digest("hex");

  const uuidLikeName = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `a${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");

  return `${uuidLikeName}${extension}`;
}

function getProductSlug(product: DraftProduct): string {
  const suffix = product.externalId.replace(
    /^telegram-product-/,
    "",
  );

  return `${slugify(product.title ?? "product")}-${suffix}`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function prepareImages(params: {
  product: DraftProduct;
  exportDirectory: string;
}): Promise<PreparedImage[]> {
  const preparedImages: PreparedImage[] = [];

  for (const image of [...params.product.images].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  )) {
    if (image.localPath.includes("_thumb")) {
      throw new Error(
        `${params.product.externalId}: thumbnail запрещён: ${image.localPath}`,
      );
    }

    const sourcePath = resolve(
      params.exportDirectory,
      image.localPath,
    );

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `${params.product.externalId}: изображение не найдено: ${sourcePath}`,
      );
    }

    const fileName = getStableImageFileName({
      externalId: params.product.externalId,
      localPath: image.localPath,
    });

    preparedImages.push({
      sourcePath,
      fileName,
      destinationPath: join(UPLOADS_DIR, fileName),
      publicUrl: `/uploads/images/${fileName}`,
      sortOrder: image.sortOrder,
    });
  }

  if (preparedImages.length === 0) {
    throw new Error(
      `${params.product.externalId}: у товара нет изображений`,
    );
  }

  return preparedImages;
}

async function upsertCategory(params: {
  definition: CategoryDefinition;
  parentId: string | null;
}) {
  const existingCategory =
    await prisma.marketCategory.findFirst({
      where: {
        slug: params.definition.slug,
      },
    });

  if (existingCategory) {
    return prisma.marketCategory.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        name: params.definition.name,
        slug: params.definition.slug,
        description: params.definition.description,
        sortOrder: params.definition.sortOrder,
        parentId: params.parentId,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  return prisma.marketCategory.create({
    data: {
      name: params.definition.name,
      slug: params.definition.slug,
      description: params.definition.description,
      sortOrder: params.definition.sortOrder,
      parentId: params.parentId,
      isActive: true,
    },
  });
}

async function ensureCategories() {
  const rootCategory = await upsertCategory({
    definition: ROOT_CATEGORY,
    parentId: null,
  });

  const chickenCoops = await upsertCategory({
    definition: CATEGORY_DEFINITIONS["chicken-coop"],
    parentId: rootCategory.id,
  });

  const rabbitHutches = await upsertCategory({
    definition: CATEGORY_DEFINITIONS["rabbit-hutch"],
    parentId: rootCategory.id,
  });

  const universalCages = await upsertCategory({
    definition: CATEGORY_DEFINITIONS["universal-cage"],
    parentId: rootCategory.id,
  });

  return {
    rootCategory,
    categoryByKind: {
      "chicken-coop": chickenCoops,
      "rabbit-hutch": rabbitHutches,
      "universal-cage": universalCages,
    },
  };
}

async function replaceProductImages(params: {
  productId: string;
  title: string;
  images: PreparedImage[];
}) {
  const currentLinks =
    await prisma.productImage.findMany({
      where: {
        productId: params.productId,
      },
      select: {
        imageId: true,
        image: {
          select: {
            url: true,
          },
        },
      },
    });

  const oldLocalFiles = currentLinks
    .map((link) => link.image.url)
    .filter((url) =>
      url.startsWith("/uploads/images/"),
    )
    .map((url) =>
      join(API_ROOT, url.replace(/^\//, "")),
    );

  const oldImageIds = currentLinks.map(
    (link) => link.imageId,
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.productImage.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    if (oldImageIds.length > 0) {
      await transaction.image.deleteMany({
        where: {
          id: {
            in: oldImageIds,
          },
          userAvatars: {
            none: {},
          },
          categories: {
            none: {},
          },
          adCategories: {
            none: {},
          },
          ads: {
            none: {},
          },
          products: {
            none: {},
          },
        },
      });
    }

    for (const image of params.images) {
      const imageRecord =
        await transaction.image.create({
          data: {
            url: image.publicUrl,
            sortOrder: image.sortOrder,
            alt: params.title,
          },
        });

      await transaction.productImage.create({
        data: {
          productId: params.productId,
          imageId: imageRecord.id,
        },
      });
    }
  });

  const newPaths = new Set(
    params.images.map(
      (image) => image.destinationPath,
    ),
  );

  for (const oldFilePath of oldLocalFiles) {
    if (newPaths.has(oldFilePath)) {
      continue;
    }

    try {
      await unlink(oldFilePath);
    } catch {
      // Файл мог уже отсутствовать.
    }
  }
}

async function importProduct(params: {
  source: DraftProduct;
  categoryId: string;
  categoryName: string;
  kind: ProductKind;
  exportDirectory: string;
}): Promise<ImportResult> {
  const title = params.source.title?.trim();

  if (!title) {
    throw new Error(
      `${params.source.externalId}: отсутствует title`,
    );
  }

  const description = normalizeText(
    params.source.rawText,
  );

  if (!description) {
    throw new Error(
      `${params.source.externalId}: отсутствует rawText`,
    );
  }

  const price = extractBasePrice(description);
  const slug = getProductSlug(params.source);

  const preparedImages = await prepareImages({
    product: params.source,
    exportDirectory: params.exportDirectory,
  });

  await mkdir(UPLOADS_DIR, {
    recursive: true,
  });

  for (const image of preparedImages) {
    await copyFile(
      image.sourcePath,
      image.destinationPath,
    );
  }

  const existingProduct =
    await prisma.product.findFirst({
      where: {
        slug,
      },
    });

  const product = existingProduct
    ? await prisma.product.update({
        where: {
          id: existingProduct.id,
        },
        data: {
          categoryId: params.categoryId,
          title,
          slug,
          description,
          price,
          additions: getProductAdditions(params.kind),
          isActive: true,
          deletedAt: null,
        },
      })
    : await prisma.product.create({
        data: {
          categoryId: params.categoryId,
          title,
          slug,
          description,
          price,
          additions: getProductAdditions(params.kind),
          isActive: true,
        },
      });

  await replaceProductImages({
    productId: product.id,
    title,
    images: preparedImages,
  });

  return {
    externalId: params.source.externalId,
    title,
    slug,
    price,
    categoryName: params.categoryName,
    imagesCount: preparedImages.length,
    action: existingProduct
      ? "updated"
      : "created",
  };
}

async function main() {
  const resolvedSourceJson = resolve(SOURCE_JSON);

  if (!(await fileExists(resolvedSourceJson))) {
    throw new Error(
      `Не найден JSON: ${resolvedSourceJson}`,
    );
  }

  const sourceContents = await readFile(
    resolvedSourceJson,
    "utf8",
  );

  const draft = JSON.parse(
    sourceContents,
  ) as DraftFile;

  if (
    !Array.isArray(draft.products) ||
    draft.products.length === 0
  ) {
    throw new Error(
      "В products.draft.json отсутствуют товары",
    );
  }

  if (
    typeof draft.productsCount === "number" &&
    draft.productsCount !== draft.products.length
  ) {
    throw new Error(
      `productsCount=${draft.productsCount}, фактически=${draft.products.length}`,
    );
  }

  const exportDirectory = resolve(
    resolvedSourceJson,
    "..",
  );

  const classifiedProducts = draft.products.map(
    (product) => ({
      product,
      kind: classifyProduct(product),
    }),
  );

  const countsByKind: Record<ProductKind, number> = {
    "chicken-coop": 0,
    "rabbit-hutch": 0,
    "universal-cage": 0,
  };

  classifiedProducts.forEach(({ kind }) => {
    countsByKind[kind] += 1;
  });

  console.log("");
  console.log("Источник:", resolvedSourceJson);
  console.log("Всего товаров:", draft.products.length);
  console.log(
    `Курятники: ${countsByKind["chicken-coop"]}`,
  );
  console.log(
    `Крольчатники: ${countsByKind["rabbit-hutch"]}`,
  );
  console.log(
    `Универсальные клетки: ${countsByKind["universal-cage"]}`,
  );
  console.log("Изображения:", UPLOADS_DIR);
  console.log("");

  /*
   * Полная проверка выполняется до изменения базы.
   */
  const validationErrors: string[] = [];

  for (const { product } of classifiedProducts) {
    try {
      if (!product.title?.trim()) {
        throw new Error("отсутствует title");
      }

      if (!product.rawText?.trim()) {
        throw new Error("отсутствует rawText");
      }

      extractBasePrice(product.rawText);

      await prepareImages({
        product,
        exportDirectory,
      });
    } catch (error) {
      validationErrors.push(
        `${product.externalId}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }
  }

  if (validationErrors.length > 0) {
    console.error(
      "Импорт отменён. Ошибки проверки:",
    );

    validationErrors.forEach((error) =>
      console.error(`  - ${error}`),
    );

    process.exitCode = 1;
    return;
  }

  console.log(
    "Предварительная проверка пройдена.",
  );
  console.log("");

  const {
    rootCategory,
    categoryByKind,
  } = await ensureCategories();

  const results: ImportResult[] = [];

  for (
    const [index, classified]
    of classifiedProducts.entries()
  ) {
    const category =
      categoryByKind[classified.kind];

    const result = await importProduct({
      source: classified.product,
      kind: classified.kind,
      categoryId: category.id,
      categoryName: category.name,
      exportDirectory,
    });

    results.push(result);

    console.log(
      `[${String(index + 1).padStart(2, "0")}/${classifiedProducts.length}] ` +
        `${result.action === "created" ? "создан" : "обновлён"}: ` +
        `${result.title} | ` +
        `${result.price.toLocaleString("ru-RU")} ₽ | ` +
        `${result.categoryName} | ` +
        `фото: ${result.imagesCount}`,
    );
  }

  const createdCount = results.filter(
    (result) => result.action === "created",
  ).length;

  const updatedCount = results.filter(
    (result) => result.action === "updated",
  ).length;

  const imagesCount = results.reduce(
    (total, result) =>
      total + result.imagesCount,
    0,
  );

  console.log("");
  console.log("Импорт завершён.");
  console.log(`Создано товаров: ${createdCount}`);
  console.log(`Обновлено товаров: ${updatedCount}`);
  console.log(
    `Обработано изображений: ${imagesCount}`,
  );
  console.log(
    `Корневая категория: ${rootCategory.name}`,
  );

  console.log("");
  console.log("Распределение:");

  for (const kind of [
    "chicken-coop",
    "rabbit-hutch",
    "universal-cage",
  ] as ProductKind[]) {
    const category = categoryByKind[kind];

    console.log(
      `  ${category.name}: ${countsByKind[kind]}`,
    );
  }
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "Ошибка production-импорта:",
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

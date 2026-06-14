"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const node_crypto_1 = require("node:crypto");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
});
function createPasswordHash(password) {
    const salt = 'dna-admin-dev-salt';
    const hash = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
}
async function createImage(alt, url = 'https://placehold.co/600x600/png') {
    return prisma.image.create({
        data: {
            url,
            sortOrder: 1,
            alt,
        },
    });
}
async function main() {
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.image.deleteMany({
        where: {
            alt: {
                in: [
                    'Электроника',
                    'Смартфоны',
                    'Ноутбуки',
                    'Аксессуары',
                    'Зарядные устройства',
                    'Спорт',
                    'Тренажёры',
                    'Бег',
                    'Йога',
                    'Дом',
                    'Кухня',
                    'Беспроводные наушники',
                    'Фитнес-браслет',
                    'Смартфон DNA Phone X',
                    'Ноутбук DNA Book Pro',
                    'USB-C кабель DNA',
                    'Быстрая зарядка DNA 65W',
                    'Беговые кроссовки DNA Run',
                    'Коврик для йоги DNA',
                    'Гантели DNA Set',
                    'Кофемолка DNA Kitchen',
                ],
            },
        },
    });
    await prisma.referralLevel.upsert({
        where: {
            grade: 1,
        },
        update: {},
        create: {
            grade: 1,
            name: 'Партнёр',
        },
    });
    const electronicsImage = await createImage('Электроника', 'https://api.iconify.design/lucide/headphones.svg?strokeWidth=1');
    const smartphonesImage = await createImage('Смартфоны', 'https://api.iconify.design/lucide/smartphone.svg?strokeWidth=1');
    const laptopsImage = await createImage('Ноутбуки', 'https://api.iconify.design/lucide/laptop.svg?strokeWidth=1');
    const accessoriesImage = await createImage('Аксессуары', 'https://api.iconify.design/lucide/cable.svg?strokeWidth=1');
    const chargersImage = await createImage('Зарядные устройства', 'https://api.iconify.design/lucide/battery-charging.svg?strokeWidth=1');
    const sportImage = await createImage('Спорт', 'https://api.iconify.design/lucide/dumbbell.svg?strokeWidth=1');
    const gymImage = await createImage('Тренажёры', 'https://api.iconify.design/lucide/activity.svg?strokeWidth=1');
    const runningImage = await createImage('Бег', 'https://api.iconify.design/lucide/footprints.svg?strokeWidth=1');
    const yogaImage = await createImage('Йога', 'https://api.iconify.design/lucide/flower.svg?strokeWidth=1');
    const homeImage = await createImage('Дом', 'https://api.iconify.design/lucide/house.svg?strokeWidth=1');
    const kitchenImage = await createImage('Кухня', 'https://api.iconify.design/lucide/cooking-pot.svg?strokeWidth=1');
    const electronicsCategory = await prisma.category.create({
        data: {
            name: 'Электроника',
            slug: 'electronics',
            sortOrder: 1,
            description: 'Электроника и гаджеты',
            imageId: electronicsImage.id,
        },
    });
    const smartphonesCategory = await prisma.category.create({
        data: {
            name: 'Смартфоны',
            slug: 'smartphones',
            sortOrder: 1,
            description: 'Смартфоны и мобильные устройства',
            parentId: electronicsCategory.id,
            imageId: smartphonesImage.id,
        },
    });
    const laptopsCategory = await prisma.category.create({
        data: {
            name: 'Ноутбуки',
            slug: 'laptops',
            sortOrder: 2,
            description: 'Ноутбуки для работы и учёбы',
            parentId: electronicsCategory.id,
            imageId: laptopsImage.id,
        },
    });
    const accessoriesCategory = await prisma.category.create({
        data: {
            name: 'Аксессуары',
            slug: 'accessories',
            sortOrder: 3,
            description: 'Аксессуары для техники',
            parentId: electronicsCategory.id,
            imageId: accessoriesImage.id,
        },
    });
    const chargersCategory = await prisma.category.create({
        data: {
            name: 'Зарядные устройства',
            slug: 'chargers',
            sortOrder: 1,
            description: 'Зарядки, адаптеры и блоки питания',
            parentId: accessoriesCategory.id,
            imageId: chargersImage.id,
        },
    });
    const sportCategory = await prisma.category.create({
        data: {
            name: 'Спорт',
            slug: 'sport',
            sortOrder: 2,
            description: 'Спортивные товары',
            imageId: sportImage.id,
        },
    });
    const gymCategory = await prisma.category.create({
        data: {
            name: 'Тренажёры',
            slug: 'gym',
            sortOrder: 1,
            description: 'Инвентарь для домашних тренировок',
            parentId: sportCategory.id,
            imageId: gymImage.id,
        },
    });
    const runningCategory = await prisma.category.create({
        data: {
            name: 'Бег',
            slug: 'running',
            sortOrder: 2,
            description: 'Товары для бега',
            parentId: sportCategory.id,
            imageId: runningImage.id,
        },
    });
    const yogaCategory = await prisma.category.create({
        data: {
            name: 'Йога',
            slug: 'yoga',
            sortOrder: 3,
            description: 'Коврики и аксессуары для йоги',
            parentId: sportCategory.id,
            imageId: yogaImage.id,
        },
    });
    const homeCategory = await prisma.category.create({
        data: {
            name: 'Дом',
            slug: 'home',
            sortOrder: 3,
            description: 'Товары для дома',
            imageId: homeImage.id,
        },
    });
    const kitchenCategory = await prisma.category.create({
        data: {
            name: 'Кухня',
            slug: 'kitchen',
            sortOrder: 1,
            description: 'Техника и аксессуары для кухни',
            parentId: homeCategory.id,
            imageId: kitchenImage.id,
        },
    });
    const products = [
        {
            title: 'Беспроводные наушники DNA',
            slug: 'dna-wireless-headphones',
            description: 'Товар лежит прямо в категории Электроника',
            price: 4990,
            categoryId: electronicsCategory.id,
            imageAlt: 'Беспроводные наушники',
        },
        {
            title: 'Смартфон DNA Phone X',
            slug: 'dna-phone-x',
            description: 'Товар лежит в подкатегории Смартфоны',
            price: 39990,
            categoryId: smartphonesCategory.id,
            imageAlt: 'Смартфон DNA Phone X',
        },
        {
            title: 'Ноутбук DNA Book Pro',
            slug: 'dna-book-pro',
            description: 'Товар лежит в подкатегории Ноутбуки',
            price: 89990,
            categoryId: laptopsCategory.id,
            imageAlt: 'Ноутбук DNA Book Pro',
        },
        {
            title: 'USB-C кабель DNA',
            slug: 'dna-usb-c-cable',
            description: 'Товар лежит в подкатегории Аксессуары',
            price: 790,
            categoryId: accessoriesCategory.id,
            imageAlt: 'USB-C кабель DNA',
        },
        {
            title: 'Быстрая зарядка DNA 65W',
            slug: 'dna-fast-charger-65w',
            description: 'Товар лежит во вложенной категории второго уровня',
            price: 2490,
            categoryId: chargersCategory.id,
            imageAlt: 'Быстрая зарядка DNA 65W',
        },
        {
            title: 'Фитнес-браслет DNA',
            slug: 'dna-fitness-band',
            description: 'Товар лежит прямо в категории Спорт',
            price: 2990,
            categoryId: sportCategory.id,
            imageAlt: 'Фитнес-браслет',
        },
        {
            title: 'Гантели DNA Set',
            slug: 'dna-dumbbells-set',
            description: 'Товар лежит в подкатегории Тренажёры',
            price: 5990,
            categoryId: gymCategory.id,
            imageAlt: 'Гантели DNA Set',
        },
        {
            title: 'Беговые кроссовки DNA Run',
            slug: 'dna-running-shoes',
            description: 'Товар лежит в подкатегории Бег',
            price: 6990,
            categoryId: runningCategory.id,
            imageAlt: 'Беговые кроссовки DNA Run',
        },
        {
            title: 'Коврик для йоги DNA',
            slug: 'dna-yoga-mat',
            description: 'Товар лежит в подкатегории Йога',
            price: 1990,
            categoryId: yogaCategory.id,
            imageAlt: 'Коврик для йоги DNA',
        },
        {
            title: 'Кофемолка DNA Kitchen',
            slug: 'dna-coffee-grinder',
            description: 'Товар лежит в подкатегории Кухня',
            price: 3490,
            categoryId: kitchenCategory.id,
            imageAlt: 'Кофемолка DNA Kitchen',
        },
    ];
    for (const productData of products) {
        const image = await createImage(productData.imageAlt);
        const product = await prisma.product.create({
            data: {
                title: productData.title,
                slug: productData.slug,
                description: productData.description,
                price: productData.price,
                categoryId: productData.categoryId,
            },
        });
        await prisma.productImage.create({
            data: {
                productId: product.id,
                imageId: image.id,
            },
        });
    }
    await prisma.user.upsert({
        where: {
            email: 'admin@dna.local',
        },
        update: {
            passwordHash: createPasswordHash('admin12345'),
        },
        create: {
            email: 'admin@dna.local',
            firstName: 'Admin',
            lastName: 'DNA',
            role: client_1.UserRole.ADMIN,
            referralCode: 'DNAADMIN',
            passwordHash: createPasswordHash('admin12345'),
            balance: {
                create: {
                    value: 0,
                },
            },
        },
    });
    console.log('Seed completed');
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map
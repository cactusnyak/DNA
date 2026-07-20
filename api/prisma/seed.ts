import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, OrderStatus, AdStatus, CatalogCollectionType } from '@prisma/client';
import * as crypto from 'crypto';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not defined');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function slugify(text: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean up ────────────────────────────────────────────────────────────────
  await prisma.referralReward.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.referralLevel.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.catalogCollectionProduct.deleteMany();
  await prisma.catalogCollectionCategory.deleteMany();
  await prisma.catalogCollection.deleteMany();
  await prisma.adImage.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.adCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketCategory.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.image.deleteMany();
  console.log('✅ Cleaned existing data');

  // ─── Referral Levels ─────────────────────────────────────────────────────────
  const levelGold = await prisma.referralLevel.create({
    data: { grade: 1, name: 'Золото' },
  });
  const levelSilver = await prisma.referralLevel.create({
    data: { grade: 2, name: 'Серебро' },
  });
  const levelBronze = await prisma.referralLevel.create({
    data: { grade: 3, name: 'Бронза' },
  });
  console.log('✅ Referral levels created');

  // ─── Users ───────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dna.ru',
      nickname: 'admin',
      firstName: 'Александр',
      lastName: 'Петров',
      patronymic: 'Иванович',
      phone: '+79001110001',
      role: UserRole.ADMIN,
      passwordHash: hashPassword('admin123'),
      referralCode: 'ADMIN001',
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller@dna.ru',
      nickname: 'misha_seller',
      firstName: 'Михаил',
      lastName: 'Соколов',
      patronymic: 'Андреевич',
      phone: '+79002220002',
      role: UserRole.SELLER,
      passwordHash: hashPassword('seller123'),
      referralCode: 'SELL001',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@dna.ru',
      nickname: 'natasha_shop',
      firstName: 'Наталья',
      lastName: 'Козлова',
      patronymic: 'Сергеевна',
      phone: '+79003330003',
      role: UserRole.SELLER,
      passwordHash: hashPassword('seller123'),
      referralCode: 'SELL002',
    },
  });

  const referralPartner = await prisma.user.create({
    data: {
      email: 'partner@dna.ru',
      nickname: 'dima_partner',
      firstName: 'Дмитрий',
      lastName: 'Волков',
      patronymic: 'Олегович',
      phone: '+79004440004',
      role: UserRole.REFERRAL_PARTNER,
      passwordHash: hashPassword('partner123'),
      referralCode: 'PART001',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'ivan@mail.ru',
      nickname: 'ivan_ivanov',
      firstName: 'Иван',
      lastName: 'Иванов',
      patronymic: 'Петрович',
      phone: '+79005550005',
      role: UserRole.DEFAULT,
      passwordHash: hashPassword('user123'),
      referralCode: 'USER001',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'maria@mail.ru',
      nickname: 'maria_sid',
      firstName: 'Мария',
      lastName: 'Сидорова',
      patronymic: 'Александровна',
      phone: '+79006660006',
      role: UserRole.DEFAULT,
      passwordHash: hashPassword('user123'),
      referralCode: 'USER002',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'sergey@gmail.com',
      nickname: 'sergey_nov',
      firstName: 'Сергей',
      lastName: 'Новиков',
      phone: '+79007770007',
      role: UserRole.DEFAULT,
      passwordHash: hashPassword('user123'),
      referralCode: 'USER003',
    },
  });

  // Balances
  await prisma.balance.createMany({
    data: [
      { userId: admin.id, value: 50000, currency: 'RUB' },
      { userId: seller1.id, value: 128500, currency: 'RUB' },
      { userId: seller2.id, value: 43200, currency: 'RUB' },
      { userId: referralPartner.id, value: 17800, currency: 'RUB' },
      { userId: user1.id, value: 3200, currency: 'RUB' },
      { userId: user2.id, value: 800, currency: 'RUB' },
      { userId: user3.id, value: 0, currency: 'RUB' },
    ],
  });
  console.log('✅ Users & balances created');

  // ─── Referrals ───────────────────────────────────────────────────────────────
  const referral1 = await prisma.referral.create({
    data: {
      inviterUserId: referralPartner.id,
      invitedUserId: user1.id,
      levelId: levelGold.id,
    },
  });
  const referral2 = await prisma.referral.create({
    data: {
      inviterUserId: referralPartner.id,
      invitedUserId: user2.id,
      levelId: levelSilver.id,
    },
  });
  console.log('✅ Referrals created');

  // ─── Market Categories ────────────────────────────────────────────────────────
  const catElectronics = await prisma.marketCategory.create({
    data: { name: 'Электроника', slug: 'elektronika', sortOrder: 1, description: 'Смартфоны, ноутбуки, техника и аксессуары' },
  });
  const catClothing = await prisma.marketCategory.create({
    data: { name: 'Одежда и обувь', slug: 'odezhda-i-obuv', sortOrder: 2, description: 'Мода для всей семьи' },
  });
  const catHome = await prisma.marketCategory.create({
    data: { name: 'Дом и сад', slug: 'dom-i-sad', sortOrder: 3, description: 'Всё для дома, дачи и сада' },
  });
  const catSports = await prisma.marketCategory.create({
    data: { name: 'Спорт и отдых', slug: 'sport-i-otdykh', sortOrder: 4, description: 'Спортивный инвентарь и товары для активного отдыха' },
  });
  const catBeauty = await prisma.marketCategory.create({
    data: { name: 'Красота и здоровье', slug: 'krasota-i-zdorove', sortOrder: 5, description: 'Косметика, парфюмерия, уход за собой' },
  });
  const catKids = await prisma.marketCategory.create({
    data: { name: 'Детские товары', slug: 'detskie-tovary', sortOrder: 6, description: 'Игрушки, одежда и всё для детей' },
  });

  // Sub-categories: Electronics
  const catSmartphones = await prisma.marketCategory.create({
    data: { name: 'Смартфоны', slug: 'smartfony', sortOrder: 1, parentId: catElectronics.id, description: 'Мобильные телефоны и смартфоны' },
  });
  const catLaptops = await prisma.marketCategory.create({
    data: { name: 'Ноутбуки', slug: 'noutbuki', sortOrder: 2, parentId: catElectronics.id, description: 'Ноутбуки и ультрабуки' },
  });
  const catAudio = await prisma.marketCategory.create({
    data: { name: 'Аудиотехника', slug: 'audiotehnika', sortOrder: 3, parentId: catElectronics.id, description: 'Наушники, колонки и аудиооборудование' },
  });
  const catTablets = await prisma.marketCategory.create({
    data: { name: 'Планшеты', slug: 'planshety', sortOrder: 4, parentId: catElectronics.id, description: 'Планшетные компьютеры' },
  });

  // Sub-categories: Clothing
  const catMen = await prisma.marketCategory.create({
    data: { name: 'Мужская одежда', slug: 'muzhskaya-odezhda', sortOrder: 1, parentId: catClothing.id },
  });
  const catWomen = await prisma.marketCategory.create({
    data: { name: 'Женская одежда', slug: 'zhenskaya-odezhda', sortOrder: 2, parentId: catClothing.id },
  });
  const catShoes = await prisma.marketCategory.create({
    data: { name: 'Обувь', slug: 'obuv', sortOrder: 3, parentId: catClothing.id },
  });

  // Sub-categories: Home
  const catFurniture = await prisma.marketCategory.create({
    data: { name: 'Мебель', slug: 'mebel', sortOrder: 1, parentId: catHome.id },
  });
  const catKitchen = await prisma.marketCategory.create({
    data: { name: 'Кухня', slug: 'kukhnya', sortOrder: 2, parentId: catHome.id },
  });
  const catGarden = await prisma.marketCategory.create({
    data: { name: 'Сад и огород', slug: 'sad-i-ogorod', sortOrder: 3, parentId: catHome.id },
  });

  // Sub-categories: Sports
  const catFitness = await prisma.marketCategory.create({
    data: { name: 'Фитнес', slug: 'fitnes', sortOrder: 1, parentId: catSports.id },
  });
  const catOutdoor = await prisma.marketCategory.create({
    data: { name: 'Туризм и кемпинг', slug: 'turizm-i-kemping', sortOrder: 2, parentId: catSports.id },
  });

  console.log('✅ Market categories created');

  // ─── Products ─────────────────────────────────────────────────────────────────
  const products = await Promise.all([
    // Smartphones
    prisma.product.create({ data: { categoryId: catSmartphones.id, title: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Флагманский смартфон Samsung с мощным процессором Snapdragon 8 Gen 3, камерой 200 МП и S Pen. Экран 6.8" Dynamic AMOLED 2X, 120 Гц. Батарея 5000 мАч.', price: 109990 } }),
    prisma.product.create({ data: { categoryId: catSmartphones.id, title: 'Apple iPhone 16 Pro Max', slug: 'apple-iphone-16-pro-max', description: 'Лучший смартфон Apple с чипом A18 Pro, новой системой камер и улучшенным дисплеем ProMotion 120 Гц. 6.9 дюйма, 256 ГБ базовая версия.', price: 139990 } }),
    prisma.product.create({ data: { categoryId: catSmartphones.id, title: 'Xiaomi 14 Pro', slug: 'xiaomi-14-pro', description: 'Мощный флагман Xiaomi с камерой Leica, Snapdragon 8 Gen 3 и зарядкой 120 Вт. Ceramic Shield стекло, IP68.', price: 79990 } }),
    prisma.product.create({ data: { categoryId: catSmartphones.id, title: 'POCO X6 Pro', slug: 'poco-x6-pro', description: 'Игровой смартфон среднего класса с Dimensity 8300-Ultra, AMOLED 120 Гц и батареей 5100 мАч. Отличный выбор за разумные деньги.', price: 32990 } }),

    // Laptops
    prisma.product.create({ data: { categoryId: catLaptops.id, title: 'Apple MacBook Pro 14" M4 Pro', slug: 'apple-macbook-pro-14-m4-pro', description: 'Профессиональный ноутбук на чипе M4 Pro с 24 ГБ RAM, SSD 512 ГБ. Дисплей Liquid Retina XDR, до 22 часов работы от батареи.', price: 219990 } }),
    prisma.product.create({ data: { categoryId: catLaptops.id, title: 'ASUS ROG Strix G16 2024', slug: 'asus-rog-strix-g16-2024', description: 'Игровой ноутбук с RTX 4070, Intel Core i9-14900HX, 16 ГБ RAM, 1 ТБ SSD. 16" QHD+ 240 Гц. Мощь для максимальных настроек.', price: 159990 } }),
    prisma.product.create({ data: { categoryId: catLaptops.id, title: 'Lenovo ThinkPad X1 Carbon Gen 12', slug: 'lenovo-thinkpad-x1-carbon-gen-12', description: 'Бизнес-ноутбук весом 1.12 кг. Intel Core Ultra 7, 32 ГБ LPDDR5, 1 ТБ SSD. MIL-SPEC прочность, 14" IPS 2.8K.', price: 189990 } }),
    prisma.product.create({ data: { categoryId: catLaptops.id, title: 'Acer Aspire 5 (2024)', slug: 'acer-aspire-5-2024', description: 'Бюджетный ноутбук для работы и учёбы. AMD Ryzen 5 7530U, 16 ГБ RAM, 512 ГБ SSD. 15.6" FHD IPS.', price: 54990 } }),

    // Audio
    prisma.product.create({ data: { categoryId: catAudio.id, title: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Лучшие наушники с активным шумоподавлением. 30 часов работы, мультиподключение, Hi-Res Audio. Складная конструкция.', price: 29990 } }),
    prisma.product.create({ data: { categoryId: catAudio.id, title: 'Apple AirPods Pro 2', slug: 'apple-airpods-pro-2', description: 'Беспроводные наушники с адаптивным шумоподавлением, Transparency Mode и Personalized Spatial Audio. H2 чип.', price: 24990 } }),
    prisma.product.create({ data: { categoryId: catAudio.id, title: 'JBL Charge 5', slug: 'jbl-charge-5', description: 'Портативная Bluetooth-колонка с 20 часами работы, мощным басом, IPX7 водонепроницаемостью и функцией зарядки устройств.', price: 13990 } }),

    // Tablets
    prisma.product.create({ data: { categoryId: catTablets.id, title: 'Apple iPad Pro 13" M4', slug: 'apple-ipad-pro-13-m4', description: 'Мощнейший планшет с OLED-дисплеем Ultra Retina XDR, чипом M4 и поддержкой Apple Pencil Pro. 256 ГБ Wi-Fi.', price: 149990 } }),
    prisma.product.create({ data: { categoryId: catTablets.id, title: 'Samsung Galaxy Tab S9 FE', slug: 'samsung-galaxy-tab-s9-fe', description: 'Планшет с 10.9" TFT экраном, Exynos 1380, 6 ГБ RAM, 128 ГБ. IP68, S Pen в комплекте.', price: 39990 } }),

    // Men Clothing
    prisma.product.create({ data: { categoryId: catMen.id, title: 'Пуховик мужской зимний Tommy Hilfiger', slug: 'pukhovik-muzhskoy-tommy-hilfiger', description: 'Тёплый мужской пуховик из переработанного материала. Капюшон с мехом, водоотталкивающее покрытие. Размеры M–3XL.', price: 24990 } }),
    prisma.product.create({ data: { categoryId: catMen.id, title: 'Джинсы Levi\'s 511 Slim', slug: 'dzhinsy-levis-511-slim', description: 'Классические зауженные джинсы Levi\'s из эластичного денима. Комфортная посадка, 5 карманов. Размеры 28–38.', price: 7990 } }),
    prisma.product.create({ data: { categoryId: catMen.id, title: 'Худи Stone Island', slug: 'khudi-stone-island', description: 'Премиальная мужская толстовка из хлопкового флиса. Нашивка с компасом, карман кенгуру, капюшон на молнии.', price: 18990 } }),

    // Women Clothing
    prisma.product.create({ data: { categoryId: catWomen.id, title: 'Пальто женское шерстяное Zara', slug: 'palto-zhenskoe-sherstyanoe-zara', description: 'Элегантное двубортное пальто из шерстяной смеси. Приталенный силуэт, пуговицы-роговицы. Размеры XS–XL.', price: 12990 } }),
    prisma.product.create({ data: { categoryId: catWomen.id, title: 'Платье-миди Pull&Bear', slug: 'plate-midi-pull-and-bear', description: 'Лёгкое летнее платье-миди с цветочным принтом. V-образный вырез, эластичный пояс. 100% вискоза.', price: 3990 } }),

    // Shoes
    prisma.product.create({ data: { categoryId: catShoes.id, title: 'Nike Air Max 270', slug: 'nike-air-max-270', description: 'Культовые кроссовки с крупнейшей воздушной подушкой Air. Верх из сетки и синтетических материалов. Размеры 36–47.', price: 11990 } }),
    prisma.product.create({ data: { categoryId: catShoes.id, title: 'Adidas Ultraboost 22', slug: 'adidas-ultraboost-22', description: 'Беговые кроссовки с технологией Boost и верхом из Primeknit+. Отлично подходят и для повседневной носки. Унисекс.', price: 13990 } }),
    prisma.product.create({ data: { categoryId: catShoes.id, title: 'UGG Classic Short Boot', slug: 'ugg-classic-short-boot', description: 'Классические угги из натуральной овчины с подошвой Treadlite by UGG. Высота голенища 19 см. Размеры 35–43.', price: 16990 } }),

    // Furniture
    prisma.product.create({ data: { categoryId: catFurniture.id, title: 'Диван угловой «Мадрид»', slug: 'divan-uglovoy-madrid', description: 'Просторный угловой диван-кровать с ящиком для хранения. Обивка из рогожки, механизм дельфин. Размер: 270×160 см.', price: 67990 } }),
    prisma.product.create({ data: { categoryId: catFurniture.id, title: 'Стул офисный IKEA Markus', slug: 'stul-ofisnyy-ikea-markus', description: 'Эргономичный офисный стул с поясничной поддержкой, регулируемыми подлокотниками и высотой сиденья. Чёрный, ткань.', price: 24990 } }),
    prisma.product.create({ data: { categoryId: catFurniture.id, title: 'Стеллаж IKEA Billy 80×202', slug: 'stellazh-ikea-billy', description: 'Классический книжный стеллаж IKEA. Регулируемые полки, берёзовый шпон. Размер: 80×28×202 см.', price: 5990 } }),

    // Kitchen
    prisma.product.create({ data: { categoryId: catKitchen.id, title: 'Кофемашина DeLonghi Magnifica Start', slug: 'kofemashina-delonghi-magnifica-start', description: 'Автоматическая кофемашина с встроенной кофемолкой, капучинатором и 9 уровнями помола. Давление 15 бар.', price: 44990 } }),
    prisma.product.create({ data: { categoryId: catKitchen.id, title: 'Набор ножей Victorinox Swiss Classic 6 пр.', slug: 'nabor-nozhey-victorinox-swiss-classic', description: 'Профессиональный набор из 6 кухонных ножей с рукоятками Fibrox. Нержавеющая сталь, эргономичный дизайн.', price: 8990 } }),

    // Fitness
    prisma.product.create({ data: { categoryId: catFitness.id, title: 'Гантели наборные 2×20 кг Kettler', slug: 'ganteli-nabornye-2x20kg-kettler', description: 'Набор разборных гантелей с замком-зажимом. Стальной гриф с хромированием, резиновые блины. Вес каждой: до 20 кг.', price: 12990 } }),
    prisma.product.create({ data: { categoryId: catFitness.id, title: 'Коврик для йоги Manduka PRO', slug: 'kovrik-dlya-yogi-manduka-pro', description: 'Профессиональный коврик для йоги 6 мм толщиной. Нескользящее покрытие, размер 180×61 см. Пожизненная гарантия.', price: 9990 } }),

    // Outdoor
    prisma.product.create({ data: { categoryId: catOutdoor.id, title: 'Палатка трёхместная Naturehike Cloud-Up 3', slug: 'palatka-trekhmestnaya-naturehike-cloud-up-3', description: 'Лёгкая туристическая палатка весом 2.1 кг. Двуслойная конструкция, водостойкость HH 3000 мм, вестибюль.', price: 18990 } }),
    prisma.product.create({ data: { categoryId: catOutdoor.id, title: 'Рюкзак туристический Osprey Atmos AG 65', slug: 'ryukzak-turisticheskiy-osprey-atmos-ag-65', description: 'Рюкзак с системой Anti-Gravity, 65 л объём, дождевик в комплекте. Система регулировки спины, поясничный пояс.', price: 27990 } }),

    // Kids
    prisma.product.create({ data: { categoryId: catKids.id, title: 'Конструктор LEGO Technic Bugatti Chiron', slug: 'konstruktor-lego-technic-bugatti-chiron', description: 'Детальная модель Bugatti Chiron из 3599 деталей. Функционирующая коробка передач, подвеска, поршни. 14+.', price: 24990 } }),
    prisma.product.create({ data: { categoryId: catKids.id, title: 'Велосипед детский Strider 14x Sport', slug: 'velosiped-detskiy-strider-14x-sport', description: 'Беговел-трансформер 2 в 1: сначала беговел без педалей, потом педальный велосипед. Для детей 3–7 лет.', price: 15990 } }),

    // Beauty
    prisma.product.create({ data: { categoryId: catBeauty.id, title: 'Набор ухода за кожей Clinique Dramatically Different', slug: 'nabor-ukhoda-klinik-dramatically-different', description: 'Базовый набор для ежедневного ухода: очищающее средство, тоник, увлажняющий гель. Подходит для всех типов кожи.', price: 6990 } }),
    prisma.product.create({ data: { categoryId: catBeauty.id, title: 'Парфюм Chanel Coco Mademoiselle 100 мл', slug: 'parfyum-chanel-coco-mademoiselle-100ml', description: 'Культовый женский парфюм с нотами бергамота, пачули и розы. Eau de Parfum, флакон 100 мл.', price: 18990 } }),
  ]);
  console.log('✅ Products created');

  // ─── Ad Categories ────────────────────────────────────────────────────────────
  const adCatEstate = await prisma.adCategory.create({
    data: { name: 'Недвижимость', slug: 'nedvizhimost', sortOrder: 1, description: 'Продажа, аренда квартир, домов, коммерческой недвижимости' },
  });
  const adCatTransport = await prisma.adCategory.create({
    data: { name: 'Транспорт', slug: 'transport', sortOrder: 2, description: 'Автомобили, мотоциклы, спецтехника' },
  });
  const adCatElectronics = await prisma.adCategory.create({
    data: { name: 'Электроника', slug: 'elektronika-ads', sortOrder: 3, description: 'Б/у техника и электроника' },
  });
  const adCatWork = await prisma.adCategory.create({
    data: { name: 'Работа', slug: 'rabota', sortOrder: 4, description: 'Вакансии и резюме' },
  });
  const adCatServices = await prisma.adCategory.create({
    data: { name: 'Услуги', slug: 'uslugi', sortOrder: 5, description: 'Частные услуги и сервисы' },
  });
  const adCatHobby = await prisma.adCategory.create({
    data: { name: 'Хобби и отдых', slug: 'khobbi-i-otdykh', sortOrder: 6, description: 'Спорт, коллекции, музыкальные инструменты' },
  });

  // Sub-categories: Estate
  const adCatApartments = await prisma.adCategory.create({
    data: { name: 'Квартиры продажа', slug: 'kvartiry-prodazha', sortOrder: 1, parentId: adCatEstate.id },
  });
  const adCatRent = await prisma.adCategory.create({
    data: { name: 'Квартиры аренда', slug: 'kvartiry-arenda', sortOrder: 2, parentId: adCatEstate.id },
  });
  const adCatHouses = await prisma.adCategory.create({
    data: { name: 'Дома и дачи', slug: 'doma-i-dachi', sortOrder: 3, parentId: adCatEstate.id },
  });

  // Sub-categories: Transport
  const adCatCars = await prisma.adCategory.create({
    data: { name: 'Легковые автомобили', slug: 'legkovye-avtomobili', sortOrder: 1, parentId: adCatTransport.id },
  });
  const adCatMoto = await prisma.adCategory.create({
    data: { name: 'Мотоциклы и мопеды', slug: 'mototsikly-i-mopedy', sortOrder: 2, parentId: adCatTransport.id },
  });

  // Sub-categories: Electronics (ads)
  const adCatPhones = await prisma.adCategory.create({
    data: { name: 'Телефоны', slug: 'telefony-ads', sortOrder: 1, parentId: adCatElectronics.id },
  });
  const adCatComputers = await prisma.adCategory.create({
    data: { name: 'Компьютеры и ноутбуки', slug: 'kompyutery-i-noutbuki-ads', sortOrder: 2, parentId: adCatElectronics.id },
  });

  // Sub-categories: Work
  const adCatIT = await prisma.adCategory.create({
    data: { name: 'IT, интернет, телеком', slug: 'it-internet-telekom', sortOrder: 1, parentId: adCatWork.id },
  });
  const adCatDesign = await prisma.adCategory.create({
    data: { name: 'Дизайн, творчество', slug: 'dizayn-tvorchestvo', sortOrder: 2, parentId: adCatWork.id },
  });

  // Sub-categories: Services
  const adCatRepair = await prisma.adCategory.create({
    data: { name: 'Ремонт и строительство', slug: 'remont-i-stroitelstvo', sortOrder: 1, parentId: adCatServices.id },
  });
  const adCatBeautyService = await prisma.adCategory.create({
    data: { name: 'Красота и здоровье', slug: 'krasota-i-zdorove-uslugi', sortOrder: 2, parentId: adCatServices.id },
  });

  console.log('✅ Ad categories created');

  // ─── Ads ──────────────────────────────────────────────────────────────────────
  const ads = await Promise.all([
    // Estate
    prisma.ad.create({ data: { categoryId: adCatApartments.id, sellerId: seller1.id, title: '3-комнатная квартира у метро Проспект Мира', slug: '3-komnatnaya-kvartira-u-metro-prospekt-mira', description: 'Продаётся просторная 3-комнатная квартира 87 кв. м на 7 этаже 14-этажного дома. Свежий евроремонт, встроенная кухня, два санузла. Развитая инфраструктура района, 5 минут до метро.', price: 14500000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatRent.id, sellerId: seller2.id, title: 'Уютная студия в центре, посуточно', slug: 'uiutnaya-studiya-v-tsentre-posutochno', description: 'Современная квартира-студия 32 кв. м с дизайнерским ремонтом. Wi-Fi, Smart TV, полностью оснащённая кухня. В 10 минутах от Красной площади. Цена от 3500 руб/сутки.', price: 3500, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatHouses.id, sellerId: seller1.id, title: 'Дача 6 соток в Подмосковье, 60 км от МКАД', slug: 'dacha-6-sotok-podmoskovye-60km', description: 'Небольшой жилой дом 48 кв. м с баней, гаражом, плодовым садом. Газ и свет подключены. Асфальтовая дорога до участка. Хорошая экология, рядом озеро.', price: 3200000, status: AdStatus.PUBLISHED } }),

    // Cars
    prisma.ad.create({ data: { categoryId: adCatCars.id, sellerId: seller1.id, title: 'Toyota Camry 2021, 2.5 AT, белый', slug: 'toyota-camry-2021-2-5-at-bely', description: 'Toyota Camry 2021 г.в., 2.5 литра, автомат, белый. Пробег 54 000 км. Один владелец, обслуживалась у официального дилера. ПТС оригинал, не бита, не крашена. Комплектация Premium.', price: 2850000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatCars.id, sellerId: seller2.id, title: 'Kia Rio 2020, 1.6 AT, серебро', slug: 'kia-rio-2020-1-6-at-serebro', description: 'Kia Rio 2020 г.в., 1.6 л 123 л.с., автомат. Пробег 78 000 км. Продаю в связи с покупкой нового автомобиля. ТО пройдено, зимняя резина в подарок.', price: 1190000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatMoto.id, sellerId: user1.id, title: 'Yamaha MT-07 2022, 689 куб. см', slug: 'yamaha-mt-07-2022-689-kub', description: 'Мотоцикл Yamaha MT-07 2022 г.в. Пробег 12 500 км. Состояние отличное, небольшие царапины на крышке цилиндров. Мотозащита в комплекте. Зимнее хранение в отапливаемом гараже.', price: 620000, status: AdStatus.PUBLISHED } }),

    // Electronics ads
    prisma.ad.create({ data: { categoryId: adCatPhones.id, sellerId: user1.id, title: 'iPhone 14 Pro, 256 ГБ, Deep Purple, б/у', slug: 'iphone-14-pro-256gb-deep-purple-bu', description: 'Продаю iPhone 14 Pro 256 ГБ в отличном состоянии. Использовался 11 месяцев, всегда в чехле и под стеклом. АКБ 94%. Полный комплект: коробка, кабель, документы.', price: 69990, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatComputers.id, sellerId: seller1.id, title: 'MacBook Air M2 2022, 8/256 ГБ, Midnight', slug: 'macbook-air-m2-2022-8-256-midnight', description: 'MacBook Air M2 2022, 8 ГБ RAM, 256 ГБ SSD, цвет Midnight. Использовался год, всегда был в чехле. Апскейлинг не делался. Батарея: 120 циклов. Коробка и документы в наличии.', price: 89990, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatComputers.id, sellerId: user2.id, title: 'Игровой ПК RTX 4070 + Ryzen 7 7700X', slug: 'igrovoy-pk-rtx-4070-ryzen-7-7700x', description: 'Сборка 2023 г. RTX 4070 12 ГБ, Ryzen 7 7700X, 32 ГБ DDR5, SSD 1 ТБ NVMe, корпус Fractal Design, блок питания 750 Вт. Все на гарантии.', price: 145000, status: AdStatus.PUBLISHED } }),

    // Work
    prisma.ad.create({ data: { categoryId: adCatIT.id, sellerId: seller2.id, title: 'Frontend-разработчик React, удалённо', slug: 'frontend-razrabotchik-react-udalenno', description: 'Опыт 4 года. Стек: React, TypeScript, Next.js, GraphQL, TailwindCSS. Портфолио на GitHub. Готов к проектной работе или долгосрочному сотрудничеству. Ставка от 4000 руб/час.', price: 4000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatDesign.id, sellerId: user2.id, title: 'Графический дизайнер, логотипы и брендинг', slug: 'graficheskiy-dizayner-logotipy-i-brending', description: 'Создам логотип, фирменный стиль, упаковку. Опыт 6 лет. Работала с брендами в сфере HoReCa, fashion, beauty. Срок выполнения от 3 дней. Примеры работ в портфолио.', price: 15000, status: AdStatus.PUBLISHED } }),

    // Services
    prisma.ad.create({ data: { categoryId: adCatRepair.id, sellerId: seller1.id, title: 'Ремонт квартир под ключ в Москве', slug: 'remont-kvartir-pod-kliuch-moskva', description: 'Комплексный ремонт квартир: демонтаж, отделка, сантехника, электрика. Гарантия 2 года. Работаем с 2012 года, более 200 объектов. Бесплатный замер и смета.', price: 6000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatBeautyService.id, sellerId: user1.id, title: 'Массаж релаксирующий, выезд на дом', slug: 'massazh-relaksiruyushchiy-vyezd-na-dom', description: 'Профессиональный массаж у вас дома. Сертифицированный мастер, 7 лет практики. Виды: классический, спортивный, антицеллюлитный. Продолжительность 60–90 мин. Москва и ближайшее Подмосковье.', price: 3500, status: AdStatus.PUBLISHED } }),

    // Hobby
    prisma.ad.create({ data: { categoryId: adCatHobby.id, sellerId: user2.id, title: 'Гитара электрическая Gibson Les Paul Standard', slug: 'gitara-elektrycheskaya-gibson-les-paul', description: 'Gibson Les Paul Standard 2019 г., цвет Heritage Cherry Sunburst. Состояние 9/10, небольшие потёртости от игры. Хардкейс в комплекте. Возможна проверка у мастера.', price: 180000, status: AdStatus.PUBLISHED } }),
    prisma.ad.create({ data: { categoryId: adCatHobby.id, sellerId: seller2.id, title: 'Велосипед горный Trek Marlin 5 2023', slug: 'velosiped-gorny-trek-marlin-5-2023', description: 'Trek Marlin 5 2023. Размер рамы L (19"). Пробег около 800 км. Амортизационная вилка SR Suntour, 21 скорость Shimano. В отличном состоянии, продаю после переезда.', price: 35000, status: AdStatus.PUBLISHED } }),

    // Moderation pending
    prisma.ad.create({ data: { categoryId: adCatPhones.id, sellerId: user3.id, title: 'Samsung Galaxy A54, 128 ГБ, лаванда', slug: 'samsung-galaxy-a54-128gb-lavanda', description: 'Смартфон Samsung Galaxy A54 2023 г.в., 128 ГБ памяти, 6 ГБ RAM. Чехол и защитное стекло в комплекте. Отличное состояние, практически новый.', price: 22000, status: AdStatus.PENDING_MODERATION } }),
    prisma.ad.create({ data: { categoryId: adCatApartments.id, sellerId: user3.id, title: '1-комнатная квартира, Новосибирск', slug: '1-komnatnaya-novosibirsk', description: 'Продаётся 1-к квартира 38 кв. м на 4 этаже. Косметический ремонт, пластиковые окна, новые трубы. Рядом школа, детский сад, магазины. Ипотека возможна.', price: 3500000, status: AdStatus.DRAFT } }),
  ]);
  console.log('✅ Ads created');

  // ─── Catalog Collections ──────────────────────────────────────────────────────
  const collHits = await prisma.catalogCollection.create({
    data: {
      slug: 'hity-prodazh',
      type: CatalogCollectionType.PRODUCT,
      title: 'Хиты продаж',
      description: 'Самые популярные товары среди наших покупателей',
      isActive: true,
    },
  });

  const collNew = await prisma.catalogCollection.create({
    data: {
      slug: 'novinki',
      type: CatalogCollectionType.PRODUCT,
      title: 'Новинки',
      description: 'Последние поступления в наш каталог',
      isActive: true,
    },
  });

  const collTech = await prisma.catalogCollection.create({
    data: {
      slug: 'mir-tekhnologiy',
      type: CatalogCollectionType.CATEGORY,
      title: 'Мир технологий',
      description: 'Всё для работы, игр и развлечений',
      isActive: true,
    },
  });

  const collStyle = await prisma.catalogCollection.create({
    data: {
      slug: 'stil-i-moda',
      type: CatalogCollectionType.CATEGORY,
      title: 'Стиль и мода',
      description: 'Трендовые категории этого сезона',
      isActive: true,
    },
  });

  const collSale = await prisma.catalogCollection.create({
    data: {
      slug: 'luchshaya-tsena',
      type: CatalogCollectionType.PRODUCT,
      title: 'Лучшая цена',
      description: 'Выгодные предложения и товары по минимальной цене',
      isActive: true,
    },
  });

  // Products for hits collection (flagship + popular items)
  const hitProducts = [
    products[0], // Samsung S24 Ultra
    products[1], // iPhone 16 Pro Max
    products[8], // Sony WH-1000XM5
    products[9], // AirPods Pro 2
    products[18], // Nike Air Max 270
    products[23], // DeLonghi coffee
  ];
  await prisma.catalogCollectionProduct.createMany({
    data: hitProducts.map((p, i) => ({ collectionId: collHits.id, productId: p.id, sortOrder: i })),
  });

  // Products for new collection
  const newProducts = [
    products[4], // MacBook Pro M4
    products[11], // iPad Pro M4
    products[16], // Zara coat
    products[28], // Naturehike tent
    products[30], // LEGO Bugatti
    products[33], // Chanel perfume
  ];
  await prisma.catalogCollectionProduct.createMany({
    data: newProducts.map((p, i) => ({ collectionId: collNew.id, productId: p.id, sortOrder: i })),
  });

  // Products for best price
  const saleProducts = [
    products[3], // POCO X6 Pro
    products[7], // Acer Aspire 5
    products[14], // Levi's jeans
    products[17], // Pull&Bear dress
    products[24], // IKEA Billy
    products[27], // Manduka yoga mat
  ];
  await prisma.catalogCollectionProduct.createMany({
    data: saleProducts.map((p, i) => ({ collectionId: collSale.id, productId: p.id, sortOrder: i })),
  });

  // Categories for tech collection
  await prisma.catalogCollectionCategory.createMany({
    data: [
      { collectionId: collTech.id, categoryId: catElectronics.id, sortOrder: 0 },
      { collectionId: collTech.id, categoryId: catSmartphones.id, sortOrder: 1 },
      { collectionId: collTech.id, categoryId: catLaptops.id, sortOrder: 2 },
      { collectionId: collTech.id, categoryId: catAudio.id, sortOrder: 3 },
    ],
  });

  // Categories for style collection
  await prisma.catalogCollectionCategory.createMany({
    data: [
      { collectionId: collStyle.id, categoryId: catClothing.id, sortOrder: 0 },
      { collectionId: collStyle.id, categoryId: catWomen.id, sortOrder: 1 },
      { collectionId: collStyle.id, categoryId: catShoes.id, sortOrder: 2 },
      { collectionId: collStyle.id, categoryId: catBeauty.id, sortOrder: 3 },
    ],
  });
  console.log('✅ Catalog collections created');

  // ─── Cart Items ────────────────────────────────────────────────────────────────
  await prisma.cartItem.createMany({
    data: [
      { userId: user1.id, productId: products[0].id, quantity: 1, unitPrice: products[0].price },
      { userId: user1.id, productId: products[8].id, quantity: 2, unitPrice: products[8].price },
      { userId: user2.id, productId: products[18].id, quantity: 1, unitPrice: products[18].price },
      { userId: user2.id, adId: ads[6].id, quantity: 1, unitPrice: ads[6].price },
    ],
  });
  console.log('✅ Cart items created');

  // ─── Orders ───────────────────────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      customerName: 'Иван Иванов',
      customerPhone: '+79005550005',
      customerEmail: 'ivan@mail.ru',
      deliveryAddress: 'г. Москва, ул. Тверская, д. 1, кв. 10',
      comment: 'Позвонить за час до доставки',
      status: OrderStatus.DELIVERED,
      totalAmount: products[1].price + products[9].price,
      items: {
        create: [
          { productId: products[1].id, quantity: 1, unitPrice: products[1].price },
          { productId: products[9].id, quantity: 1, unitPrice: products[9].price },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      customerName: 'Мария Сидорова',
      customerPhone: '+79006660006',
      customerEmail: 'maria@mail.ru',
      deliveryAddress: 'г. Санкт-Петербург, Невский пр., д. 50, кв. 7',
      status: OrderStatus.PAID,
      totalAmount: products[4].price,
      items: {
        create: [
          { productId: products[4].id, quantity: 1, unitPrice: products[4].price },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: user1.id,
      customerName: 'Иван Иванов',
      customerPhone: '+79005550005',
      customerEmail: 'ivan@mail.ru',
      deliveryAddress: 'г. Москва, ул. Тверская, д. 1, кв. 10',
      status: OrderStatus.SHIPPED,
      totalAmount: products[18].price + products[19].price,
      items: {
        create: [
          { productId: products[18].id, quantity: 1, unitPrice: products[18].price },
          { productId: products[19].id, quantity: 1, unitPrice: products[19].price },
        ],
      },
    },
  });

  const orderGuest = await prisma.order.create({
    data: {
      guestSessionId: 'guest-session-abc123',
      customerName: 'Гость Покупатель',
      customerPhone: '+79009990099',
      customerEmail: 'guest@example.com',
      deliveryAddress: 'г. Казань, ул. Баумана, д. 15',
      status: OrderStatus.AWAITING_PAYMENT,
      totalAmount: products[10].price,
      items: {
        create: [
          { productId: products[10].id, quantity: 1, unitPrice: products[10].price },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      userId: user3.id,
      customerName: 'Сергей Новиков',
      customerPhone: '+79007770007',
      deliveryAddress: 'г. Екатеринбург, ул. Ленина, д. 22, кв. 55',
      status: OrderStatus.CASHBACK_ACCRUED,
      totalAmount: products[23].price + products[24].price,
      items: {
        create: [
          { productId: products[23].id, quantity: 1, unitPrice: products[23].price },
          { productId: products[24].id, quantity: 2, unitPrice: products[24].price },
        ],
      },
    },
  });

  const order5 = await prisma.order.create({
    data: {
      userId: user2.id,
      customerName: 'Мария Сидорова',
      customerPhone: '+79006660006',
      deliveryAddress: 'г. Санкт-Петербург, Невский пр., д. 50, кв. 7',
      status: OrderStatus.CANCELLED,
      totalAmount: products[33].price,
      items: {
        create: [
          { productId: products[33].id, quantity: 1, unitPrice: products[33].price },
        ],
      },
    },
  });
  console.log('✅ Orders created');

  // ─── Referral Rewards ─────────────────────────────────────────────────────────
  await prisma.referralReward.createMany({
    data: [
      { referralId: referral1.id, orderId: order1.id, amount: 2800 },
      { referralId: referral1.id, orderId: order3.id, amount: 520 },
      { referralId: referral2.id, orderId: order2.id, amount: 4400 },
    ],
  });
  console.log('✅ Referral rewards created');

  // ─── Favourites ───────────────────────────────────────────────────────────────
  await prisma.favourite.createMany({
    data: [
      { userId: user1.id, productId: products[1].id },
      { userId: user1.id, productId: products[4].id },
      { userId: user1.id, adId: ads[3].id },
      { userId: user2.id, productId: products[0].id },
      { userId: user2.id, productId: products[16].id },
      { userId: user2.id, adId: ads[6].id },
      { userId: user3.id, productId: products[8].id },
      { userId: user3.id, adId: ads[12].id },
    ],
  });
  console.log('✅ Favourites created');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Test accounts:');
  console.log('   admin@dna.ru        / admin123   (ADMIN)');
  console.log('   seller@dna.ru       / seller123  (SELLER)');
  console.log('   seller2@dna.ru      / seller123  (SELLER)');
  console.log('   partner@dna.ru      / partner123 (REFERRAL_PARTNER)');
  console.log('   ivan@mail.ru        / user123    (DEFAULT)');
  console.log('   maria@mail.ru       / user123    (DEFAULT)');
  console.log('   sergey@gmail.com    / user123    (DEFAULT)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

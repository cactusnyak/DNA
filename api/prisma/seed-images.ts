import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not defined');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'images');

// ─── Hardcoded direct image URLs (images.unsplash.com, no API key needed) ────

const MARKET_CATEGORY_IMAGES: Record<string, string> = {
  'Электроника':            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80',
  'Смартфоны':              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  'Ноутбуки и компьютеры': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'Аудио и наушники':      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'Планшеты':              'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
  'Одежда мужская':        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80',
  'Одежда женская':        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80',
  'Верхняя одежда':        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
  'Обувь':                 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'Кроссовки':             'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'Ботинки и сапоги':      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
  'Дом и интерьер':        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'Мебель':                'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
  'Кухня и быт':           'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'Спорт и туризм':        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'Туризм и кемпинг':      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'Тренажёры и инвентарь': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'Детские товары':        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
  'Игрушки':               'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Велосипеды детские':    'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=800&q=80',
  'Красота и уход':        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  'Парфюмерия':            'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
  'Уход за кожей':         'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  'Офис и работа':         'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
};

const AD_CATEGORY_IMAGES: Record<string, string> = {
  'Недвижимость':           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  'Квартиры продажа':       'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'Квартиры аренда':        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'Дома и дачи':            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  'Авто':                   'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  'Легковые автомобили':    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  'Мотоциклы и мопеды':    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80',
  'Электроника':            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Телефоны':               'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80',
  'Компьютеры и ноутбуки': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  'Работа':                 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80',
  'IT, интернет, телеком':  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'Дизайн, творчество':     'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  'Услуги':                 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
  'Ремонт и строительство': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'Красота и здоровье':     'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  'Хобби и отдых':          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
};

const PRODUCT_IMAGES: Record<string, string[]> = {
  'Samsung Galaxy S24 Ultra': [
    'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  ],
  'JBL Charge 5': [
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
  ],
  'Apple iPad Pro 13\" M4': [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=800&q=80',
  ],
  'Samsung Galaxy Tab S9 FE': [
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&q=80',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
  ],
  'Пуховик мужской зимний Tommy Hilfiger': [
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80',
  ],
  "Джинсы Levi's 511 Slim": [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80',
  ],
  'Худи Stone Island': [
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  ],
  'Apple MacBook Pro 14\" M4 Pro': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'https://images.unsplash.com/photo-1611186871525-b3f96d1a37a5?w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  ],
  'Пальто женское шерстяное Zara': [
    'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
  ],
  'ASUS ROG Strix G16 2024': [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  ],
  'Apple AirPods Pro 2': [
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
  ],
  'POCO X6 Pro': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  ],
  'Xiaomi 14 Pro': [
    'https://images.unsplash.com/photo-1574755393849-623942496936?w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  ],
  'Lenovo ThinkPad X1 Carbon Gen 12': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
  ],
  'Apple iPhone 16 Pro Max': [
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  ],
  'Платье-миди Pull&Bear': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  ],
  'Acer Aspire 5 (2024)': [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  ],
  'Sony WH-1000XM5': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80',
  ],
  'Adidas Ultraboost 22': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
  ],
  'Nike Air Max 270': [
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80',
  ],
  'UGG Classic Short Boot': [
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
    'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&q=80',
  ],
  'Стеллаж IKEA Billy 80×202': [
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  ],
  'Кофемашина DeLonghi Magnifica Start': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  ],
  'Палатка трёхместная Naturehike Cloud-Up 3': [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    'https://images.unsplash.com/photo-1478827387698-1527781a4887?w=800&q=80',
    'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80',
  ],
  'Конструктор LEGO Technic Bugatti Chiron': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80',
  ],
  'Велосипед детский Strider 14x Sport': [
    'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=800&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
  ],
  'Диван угловой «Мадрид»': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
  ],
  'Парфюм Chanel Coco Mademoiselle 100 мл': [
    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
    'https://images.unsplash.com/photo-1590156206657-aec4e359f480?w=800&q=80',
  ],
  'Гантели наборные 2×20 кг Kettler': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  ],
  'Коврик для йоги Manduka PRO': [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80',
  ],
  'Стул офисный IKEA Markus': [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  ],
  'Набор ножей Victorinox Swiss Classic 6 пр.': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1584990347449-39178f7b0a78?w=800&q=80',
  ],
  'Рюкзак туристический Osprey Atmos AG 65': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
  ],
  'Набор ухода за кожей Clinique Dramatically Different': [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  ],
};

const AD_IMAGES: Record<string, string[]> = {
  'Уютная студия в центре, посуточно': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ],
  'Toyota Camry 2021, 2.5 AT, белый': [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
  ],
  'Yamaha MT-07 2022, 689 куб. см': [
    'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&q=80',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80',
  ],
  'Kia Rio 2020, 1.6 AT, серебро': [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
  ],
  'Дача 6 соток в Подмосковье, 60 км от МКАД': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80',
  ],
  '3-комнатная квартира у метро Проспект Мира': [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  ],
  'Frontend-разработчик React, удалённо': [
    'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  ],
  'iPhone 14 Pro, 256 ГБ, Deep Purple, б/у': [
    'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80',
  ],
  'Игровой ПК RTX 4070 + Ryzen 7 7700X': [
    'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c228ab0c5b?w=800&q=80',
  ],
  'MacBook Air M2 2022, 8/256 ГБ, Midnight': [
    'https://images.unsplash.com/photo-1611186871525-b3f96d1a37a5?w=800&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  ],
  'Графический дизайнер, логотипы и брендинг': [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
  ],
  'Массаж релаксирующий, выезд на дом': [
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  ],
  'Ремонт квартир под ключ в Москве': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  ],
  'Гитара электрическая Gibson Les Paul Standard': [
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80',
  ],
  'Велосипед горный Trek Marlin 5 2023': [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  '1-комнатная квартира, Новосибирск': [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ],
  'Samsung Galaxy A54, 128 ГБ, лаванда': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  ],
};

// ─── Download & save (same flow as form upload) ───────────────────────────────

async function downloadAndSave(url: string, label: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const fileName = `${randomUUID()}.jpg`;
    const filePath = join(UPLOADS_DIR, fileName);
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(filePath, buffer);
    console.log(`  ✓ ${label}`);
    return `/uploads/images/${fileName}`;
  } catch (err) {
    console.warn(`  ✗ ${label}: ${err}`);
    return null;
  }
}

async function createImageRecord(url: string, alt: string, sortOrder = 0) {
  const img = await prisma.image.create({ data: { url, alt, sortOrder } });
  return img.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding images...\n');

  console.log('Market categories...');
  const marketCategories = await prisma.marketCategory.findMany({ select: { id: true, name: true } });
  for (const cat of marketCategories) {
    const imgUrl = MARKET_CATEGORY_IMAGES[cat.name];
    if (!imgUrl) { console.log(`  - skip: ${cat.name}`); continue; }
    const saved = await downloadAndSave(imgUrl, cat.name);
    if (saved) {
      const imageId = await createImageRecord(saved, cat.name);
      await prisma.marketCategory.update({ where: { id: cat.id }, data: { imageId } });
    }
  }

  console.log('\nAd categories...');
  const adCategories = await prisma.adCategory.findMany({ select: { id: true, name: true } });
  for (const cat of adCategories) {
    const imgUrl = AD_CATEGORY_IMAGES[cat.name];
    if (!imgUrl) { console.log(`  - skip: ${cat.name}`); continue; }
    const saved = await downloadAndSave(imgUrl, cat.name);
    if (saved) {
      const imageId = await createImageRecord(saved, cat.name);
      await prisma.adCategory.update({ where: { id: cat.id }, data: { imageId } });
    }
  }

  console.log('\nProducts...');
  const products = await prisma.product.findMany({ select: { id: true, title: true } });
  for (const product of products) {
    const urls = PRODUCT_IMAGES[product.title];
    if (!urls?.length) { console.log(`  - skip: ${product.title}`); continue; }
    const imageIds: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const saved = await downloadAndSave(urls[i], `${product.title} [${i + 1}/${urls.length}]`);
      if (saved) imageIds.push(await createImageRecord(saved, product.title, i));
    }
    if (imageIds.length) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      for (const imageId of imageIds) {
        await prisma.productImage.create({ data: { productId: product.id, imageId } });
      }
    }
  }

  console.log('\nAds...');
  const ads = await prisma.ad.findMany({ select: { id: true, title: true } });
  for (const ad of ads) {
    const urls = AD_IMAGES[ad.title];
    if (!urls?.length) { console.log(`  - skip: ${ad.title}`); continue; }
    const imageIds: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const saved = await downloadAndSave(urls[i], `${ad.title} [${i + 1}/${urls.length}]`);
      if (saved) imageIds.push(await createImageRecord(saved, ad.title, i));
    }
    if (imageIds.length) {
      await prisma.adImage.deleteMany({ where: { adId: ad.id } });
      for (const imageId of imageIds) {
        await prisma.adImage.create({ data: { adId: ad.id, imageId } });
      }
    }
  }

  console.log('\nDone!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });

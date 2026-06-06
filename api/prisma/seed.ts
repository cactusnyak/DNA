import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
	adapter,
});

async function main() {
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

	const electronicsCategoryImage = await prisma.image.create({
		data: {
			url: 'https://api.iconify.design/lucide/headphones.svg?strokeWidth=1',
			sortOrder: 1,
			alt: 'Электроника',
		},
	});

	const sportCategoryImage = await prisma.image.create({
		data: {
			url: 'https://api.iconify.design/lucide/dumbbell.svg?strokeWidth=1',
			sortOrder: 1,
			alt: 'Спорт',
		},
	});

	const electronicsCategory = await prisma.category.upsert({
		where: {
			slug: 'electronics',
		},
		update: {
			imageId: electronicsCategoryImage.id,
		},
		create: {
			name: 'Электроника',
			slug: 'electronics',
			sortOrder: 1,
			description: 'Электроника и гаджеты',
			imageId: electronicsCategoryImage.id,
		},
	});

	const sportCategory = await prisma.category.upsert({
		where: {
			slug: 'sport',
		},
		update: {
			imageId: sportCategoryImage.id,
		},
		create: {
			name: 'Спорт',
			slug: 'sport',
			sortOrder: 2,
			description: 'Спортивные товары',
			imageId: sportCategoryImage.id,
		},
	});

	const headphonesImage = await prisma.image.create({
		data: {
			url: 'https://placehold.co/600x600/png',
			sortOrder: 1,
			alt: 'Беспроводные наушники',
		},
	});

	const fitnessBandImage = await prisma.image.create({
		data: {
			url: 'https://placehold.co/600x600/png',
			sortOrder: 1,
			alt: 'Фитнес-браслет',
		},
	});

	const headphones = await prisma.product.upsert({
		where: {
			slug: 'dna-wireless-headphones',
		},
		update: {
			title: 'Беспроводные наушники DNA',
			description: 'Тестовый товар для разработки',
			price: 4990,
			categoryId: electronicsCategory.id,
		},
		create: {
			title: 'Беспроводные наушники DNA',
			slug: 'dna-wireless-headphones',
			description: 'Тестовый товар для разработки',
			price: 4990,
			categoryId: electronicsCategory.id,
		},
	});

	const fitnessBand = await prisma.product.upsert({
		where: {
			slug: 'dna-fitness-band',
		},
		update: {
			title: 'Фитнес-браслет DNA',
			description: 'Ещё один тестовый товар',
			price: 2990,
			categoryId: sportCategory.id,
		},
		create: {
			title: 'Фитнес-браслет DNA',
			slug: 'dna-fitness-band',
			description: 'Ещё один тестовый товар',
			price: 2990,
			categoryId: sportCategory.id,
		},
	});

	await prisma.productImage.upsert({
		where: {
			productId_imageId: {
				productId: headphones.id,
				imageId: headphonesImage.id,
			},
		},
		update: {},
		create: {
			productId: headphones.id,
			imageId: headphonesImage.id,
		},
	});

	await prisma.productImage.upsert({
		where: {
			productId_imageId: {
				productId: fitnessBand.id,
				imageId: fitnessBandImage.id,
			},
		},
		update: {},
		create: {
			productId: fitnessBand.id,
			imageId: fitnessBandImage.id,
		},
	});

	await prisma.user.upsert({
		where: {
			email: 'admin@dna.local',
		},
		update: {},
		create: {
			email: 'admin@dna.local',
			firstName: 'Admin',
			lastName: 'DNA',
			role: UserRole.ADMIN,
			referralCode: 'DNAADMIN',
		},
	});

	console.log('Seed completed');
}

main()
	.catch(console.error)
	.finally(async () => {
		await prisma.$disconnect();
	});
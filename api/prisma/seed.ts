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
	const referralLevel = await prisma.referralLevel.upsert({
		where: {
			grade: 1,
		},
		update: {},
		create: {
			grade: 1,
			name: 'Партнёр',
		},
	});

	const electronicsCategory = await prisma.category.upsert({
		where: {
			slug: 'electronics',
		},
		update: {},
		create: {
			name: 'Электроника',
			slug: 'electronics',
			sortOrder: 1,
			description: 'Электроника и гаджеты',
		},
	});

	const sportCategory = await prisma.category.upsert({
		where: {
			slug: 'sport',
		},
		update: {},
		create: {
			name: 'Спорт',
			slug: 'sport',
			sortOrder: 2,
			description: 'Спортивные товары',
		},
	});

	const image1 = await prisma.image.create({
		data: {
			url: 'https://placehold.co/600x600/png',
			sortOrder: 1,
			alt: 'Беспроводные наушники',
		},
	});

	const image2 = await prisma.image.create({
		data: {
			url: 'https://placehold.co/600x600/png',
			sortOrder: 1,
			alt: 'Фитнес-браслет',
		},
	});

	const headphones = await prisma.product.create({
		data: {
			title: 'Беспроводные наушники DNA',
			slug: 'dna-wireless-headphones',
			description: 'Тестовый товар для разработки',
			price: 4990,
			categoryId: electronicsCategory.id,
		},
	});

	const fitnessBand = await prisma.product.create({
		data: {
			title: 'Фитнес-браслет DNA',
			slug: 'dna-fitness-band',
			description: 'Ещё один тестовый товар',
			price: 2990,
			categoryId: sportCategory.id,
		},
	});

	await prisma.productImage.createMany({
		data: [
			{
				productId: headphones.id,
				imageId: image1.id,
			},
			{
				productId: fitnessBand.id,
				imageId: image2.id,
			},
		],
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
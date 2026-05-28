import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    '한식',
    '양식',
    '일식',
    '중식',
    '베이킹 & 디저트',
    '간편식',
  ];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded');

  const adminPassword = await bcrypt.hash('Admin1234!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@cokok.com' },
    update: {},
    create: {
      email: 'admin@cokok.com',
      password: adminPassword,
      nickname: '관리자',
      role: 'ADMIN',
    },
  });
  console.log('Admin user seeded: admin@cokok.com / Admin1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import  prisma  from './prisma';

beforeAll(async () => {
  // Ensure we're using the test database
  if (!process.env.TEST_DATABASE_URL?.includes('test')) {
    throw new Error('Tests must use test database');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

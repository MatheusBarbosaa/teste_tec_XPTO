const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.client.findFirst();

  if (existing) {
    console.log('Seed skipped: data already exists.');
    return;
  }

  await prisma.client.create({
    data: {
      name: 'XPTO Cliente Exemplo',
      document: '12345678000199',
      type: 'PJ',
      active: true,
    },
  });

  console.log('Seed executed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

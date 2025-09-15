import { PrismaClient, BaseCurrency } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Assets
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
    { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
  ];

  for (const a of assets) {
    await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: { name: a.name, coingeckoId: a.coingeckoId },
      create: a,
    });
  }

  // Seed User + Portfolio
  const email = 'test@example.com';
  const passwordHash = 'changeme-hash';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      portfolios: {
        create: { baseCurrency: BaseCurrency.EUR },
      },
    },
    include: { portfolios: true },
  });

  let portfolio = user.portfolios[0] ?? null;
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: { userId: user.id, baseCurrency: BaseCurrency.EUR },
    });
  }

  // Seed example transactions for the created portfolio
  const btc = await prisma.asset.findUnique({ where: { symbol: 'BTC' } });
  const eth = await prisma.asset.findUnique({ where: { symbol: 'ETH' } });
  if (!btc || !eth) throw new Error('Expected BTC and ETH assets to exist');

  const txs = [
    // 2024-01-02 BUY BTC 0.5 35000 fee 5 EUR
    {
      portfolioId: portfolio.id,
      assetId: btc.id,
      type: 'BUY' as const,
      quantity: 0.5,
      price: 35000,
      fee: 5,
      currency: 'EUR',
      tradedAt: new Date('2024-01-02T00:00:00.000Z'),
      note: 'Seed BUY BTC',
    },
    // 2024-06-10 BUY BTC 0.2 60000 fee 8 EUR
    {
      portfolioId: portfolio.id,
      assetId: btc.id,
      type: 'BUY' as const,
      quantity: 0.2,
      price: 60000,
      fee: 8,
      currency: 'EUR',
      tradedAt: new Date('2024-06-10T00:00:00.000Z'),
      note: 'Seed BUY BTC',
    },
    // 2024-08-01 SELL BTC 0.1 62000 fee 5 EUR
    {
      portfolioId: portfolio.id,
      assetId: btc.id,
      type: 'SELL' as const,
      quantity: 0.1,
      price: 62000,
      fee: 5,
      currency: 'EUR',
      tradedAt: new Date('2024-08-01T00:00:00.000Z'),
      note: 'Seed SELL BTC',
    },
    // 2024-03-15 BUY ETH 2 2000 fee 3 EUR
    {
      portfolioId: portfolio.id,
      assetId: eth.id,
      type: 'BUY' as const,
      quantity: 2,
      price: 2000,
      fee: 3,
      currency: 'EUR',
      tradedAt: new Date('2024-03-15T00:00:00.000Z'),
      note: 'Seed BUY ETH',
    },
  ];

  // Create sequentially to preserve time ordering if needed
  for (const t of txs) {
    await prisma.transaction.create({ data: t });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

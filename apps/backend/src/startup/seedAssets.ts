import prisma from '../db/client';

const ASSETS: { symbol: string; name: string; coingeckoId: string }[] = [
  { symbol: 'ATOM', name: 'Cosmos', coingeckoId: 'cosmos' },
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
  { symbol: 'CKB', name: 'Nervos CKB', coingeckoId: 'nervos-network' },
  { symbol: 'CLORE', name: 'Clore', coingeckoId: 'clore-ai' },
  { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
  { symbol: 'KAS', name: 'Kaspa', coingeckoId: 'kaspa' },
  { symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink' },
  { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
  { symbol: 'TAO', name: 'Bittensor', coingeckoId: 'bittensor' },
  { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple' },
];

export async function seedAssets() {
  for (const a of ASSETS) {
    await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: { name: a.name, coingeckoId: a.coingeckoId },
      create: a,
    });
  }
}

// Allow running as a script
if (require.main === module) {
  seedAssets()
    .then(async () => {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log('[seedAssets] Done');
    })
    .catch(async (e) => {
      // eslint-disable-next-line no-console
      console.error('[seedAssets] Error', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}


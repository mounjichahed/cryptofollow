import prisma from '../../db/client';

export async function listAssets() {
  const assets = await prisma.asset.findMany({
    select: { id: true, symbol: true, name: true },
    orderBy: { symbol: 'asc' },
  });
  return assets;
}


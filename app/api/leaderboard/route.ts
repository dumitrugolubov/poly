import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const REDIS_KEY = 'whale_trades';

interface StoredTrade {
  proxyWallet: string;
  name?: string;
  pseudonym?: string;
  profileImage?: string;
  profileImageOptimized?: string;
  size: number;
  usdcSize?: number;
  price: number;
}

export async function GET() {
  try {
    // Get stored whale trades from Redis
    const url = process.env.REDIS_URL;
    if (!url) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const redis = createClient({ url });
    await redis.connect();

    const data = await redis.get(REDIS_KEY);
    await redis.disconnect();

    if (!data) {
      return NextResponse.json([]);
    }

    const trades: StoredTrade[] = JSON.parse(data);

    // Aggregate by trader
    const traderMap = new Map<string, {
      address: string;
      name?: string;
      profileImage?: string;
      totalVolume: number;
      tradesCount: number;
    }>();

    for (const trade of trades) {
      const existing = traderMap.get(trade.proxyWallet) || {
        address: trade.proxyWallet,
        name: trade.name || trade.pseudonym,
        profileImage: trade.profileImageOptimized || trade.profileImage,
        totalVolume: 0,
        tradesCount: 0,
      };

      const amount = trade.usdcSize || (trade.size * trade.price);
      existing.totalVolume += amount;
      existing.tradesCount += 1;

      // Update name/image if we have better data
      if (!existing.name && (trade.name || trade.pseudonym)) {
        existing.name = trade.name || trade.pseudonym;
      }
      if (!existing.profileImage && (trade.profileImageOptimized || trade.profileImage)) {
        existing.profileImage = trade.profileImageOptimized || trade.profileImage;
      }

      traderMap.set(trade.proxyWallet, existing);
    }

    // Convert to array and sort by volume
    const leaderboard = Array.from(traderMap.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 50)
      .map((trader, index) => ({
        rank: index + 1,
        address: trader.address,
        name: trader.name,
        profileImage: trader.profileImage,
        totalVolume: Math.round(trader.totalVolume),
        tradesCount: trader.tradesCount,
        totalPnl: 0, // Would need more data
        winRate: 0, // Would need resolved trades
      }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

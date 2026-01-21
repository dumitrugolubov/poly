import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const DATA_API_BASE = 'https://data-api.polymarket.com';
const MIN_AMOUNT = 2500;
const MAX_STORED_TRADES = 100;
const REDIS_KEY = 'whale_trades';

interface StoredTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  size: number;
  usdcSize?: number;
  price: number;
  timestamp: number;
  transactionHash: string;
  [key: string]: unknown;
}

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Fetch trades from Polymarket
    const response = await fetch(`${DATA_API_BASE}/trades?limit=500`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polywave/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: 'API error' }, { status: 500 });
    }

    const trades = await response.json();

    // 2. Filter whale trades
    const newWhaleTrades = trades.filter((trade: StoredTrade) => {
      if (trade.side !== 'BUY') return false;
      const usdcAmount = trade.usdcSize || (trade.size * trade.price);
      return usdcAmount >= MIN_AMOUNT;
    });

    // 3. Connect to Redis
    const url = process.env.REDIS_URL;
    if (!url) {
      return NextResponse.json({ ok: false, error: 'No Redis' }, { status: 500 });
    }

    const redis = createClient({ url });
    await redis.connect();

    // 4. Get stored trades
    const data = await redis.get(REDIS_KEY);
    let storedTrades: StoredTrade[] = data ? JSON.parse(data) : [];

    // 5. Filter stored by threshold
    storedTrades = storedTrades.filter((trade) => {
      const usdcAmount = trade.usdcSize || (trade.size * trade.price);
      return usdcAmount >= MIN_AMOUNT;
    });

    // 6. Merge and dedupe
    const tradeMap = new Map<string, StoredTrade>();
    for (const trade of storedTrades) {
      const key = trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`;
      tradeMap.set(key, trade);
    }
    for (const trade of newWhaleTrades) {
      const key = trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`;
      tradeMap.set(key, trade);
    }

    // 7. Sort and limit
    const allTrades = Array.from(tradeMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_STORED_TRADES);

    // 8. Save to Redis
    if (newWhaleTrades.length > 0 || allTrades.length !== storedTrades.length) {
      await redis.set(REDIS_KEY, JSON.stringify(allTrades));
    }

    await redis.disconnect();

    return NextResponse.json({
      ok: true,
      new: newWhaleTrades.length,
      total: allTrades.length,
      ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
